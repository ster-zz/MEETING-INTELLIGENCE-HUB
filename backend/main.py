from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel
from datetime import datetime
import json
import uuid
import os
from pathlib import Path
from dotenv import load_dotenv

# Explicitly load .env from the backend directory regardless of where uvicorn is launched from
load_dotenv(dotenv_path=Path(__file__).parent / ".env")

from backend.extractor import extract_insights
from backend.parser import parse_transcript
from backend.rag import RAGService
from groq import Groq

app = FastAPI(title="DECISIO API")

# Initialize in-memory Lexical RAG
rag_service = RAGService()

# Serve frontend static files
import pathlib
FRONTEND_DIR = pathlib.Path(__file__).parent.parent / "frontend"
if FRONTEND_DIR.exists():
    app.mount("/ui", StaticFiles(directory=str(FRONTEND_DIR), html=True), name="frontend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    meeting_id: str
    message: str

# Vercel-compatible In-Memory Fallback
MEETINGS_CACHE = []

def load_meetings():
    global MEETINGS_CACHE
    disk_data = {"meetings": []}
    if os.path.exists("meetings.json") and os.path.getsize("meetings.json") > 0:
        with open("meetings.json", "r", encoding="utf-8") as f:
            try:
                disk_data = json.load(f)
            except:
                pass
    
    # Merge disk and memory (avoid duplicates by ID)
    merged = disk_data["meetings"] + [m for m in MEETINGS_CACHE if m["id"] not in [dm["id"] for dm in disk_data["meetings"]]]
    return {"meetings": merged}

def save_meetings(data):
    global MEETINGS_CACHE
    # Always update memory first (works on Vercel)
    MEETINGS_CACHE = data["meetings"]
    
    # Try to update disk (works locally, fails gracefully on Vercel)
    try:
        with open("meetings.json", "w", encoding="utf-8") as f:
            json.dump(data, f, indent=4)
    except Exception as e:
        print(f"[Vercel] Disk write skipped: {e}")

@app.post("/api/upload")
async def upload_meeting(file: UploadFile = File(...)):
    content = await file.read()
    text = parse_transcript(content, file.filename)
    
    if not text:
        raise HTTPException(status_code=400, detail="Failed to parse file or file is empty")
    
    try:
        insights = extract_insights(text)
    except ValueError as e:
        # Pass up API key missing error clearly
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to run extraction")
        
    meeting_id = str(uuid.uuid4())
    
    meeting_data = {
        "id": meeting_id,
        "title": file.filename,
        "date": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "text": text,
        "summary": insights.get("summary", "No summary available"),
        "overall_sentiment": insights.get("overall_sentiment", "Neutral"),
        "sentiment_timeline": insights.get("sentiment_timeline", []),
        "speaker_sentiment": insights.get("speaker_sentiment", []),
        "key_moments": insights.get("key_moments", []),
        "decisions": insights.get("decisions", []),
        "action_items": insights.get("action_items", [])
    }
    
    data = load_meetings()
    data["meetings"].append(meeting_data)
    save_meetings(data)
    
    # Send dynamically to RAG
    rag_service.add_document(meeting_id, text)
    
    return {"status": "success", "message": "File processed", "meeting_id": meeting_id}

@app.get("/api/meetings")
async def list_meetings():
    data = load_meetings()
    return [{"id": m["id"], "title": m["title"], "date": m["date"]} for m in data.get("meetings", [])]

@app.post("/api/chat")
async def chat_with_meeting(request: ChatRequest):
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="GROQ_API_KEY not set.")

    client = Groq(api_key=api_key)

    # Step 1 — Keyword Expansion
    try:
        kw_response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{
                "role": "user",
                "content": (
                    f"Extract 5-8 concise search keywords and synonyms from the following question. "
                    f"Output ONLY a single line of space-separated lowercase keywords. No explanation.\n"
                    f"Question: {request.message}"
                )
            }],
            temperature=0.1,
        )
        expanded_query = kw_response.choices[0].message.content.strip()
        print(f"[RAG] Expanded query: '{expanded_query}'")
    except Exception:
        expanded_query = request.message

    # Step 2 — Smart Meeting Context: full text for short transcripts, RAG for long ones
    meeting_context = ""
    try:
        data = load_meetings()
        meeting = next((m for m in data.get("meetings", []) if m["id"] == request.meeting_id), None)
        if meeting:
            full_text = meeting.get("text", "")
            if len(full_text) < 6000:
                # Short transcript — send the whole thing, no retrieval needed
                meeting_context = full_text
                print(f"[RAG] Using FULL transcript ({len(full_text)} chars)")
            else:
                # Long transcript — use keyword-expanded lexical search
                meeting_context = rag_service.query(request.meeting_id, expanded_query)
                if meeting_context == "No transcript loaded.":
                    meeting_context = ""
                print(f"[RAG] Using lexical chunks for long transcript")
    except Exception as e:
        print(f"[RAG] Context retrieval failed: {e}")

    # Step 3 — DuckDuckGo Web Search
    web_context = ""
    try:
        from duckduckgo_search import DDGS
        with DDGS() as ddgs:
            results = list(ddgs.text(request.message, max_results=3))
        if results:
            snippets = [f"- {r['title']}: {r['body']}" for r in results]
            web_context = "\n".join(snippets)
            print(f"[Web] Got {len(results)} web results")
    except Exception as e:
        print(f"[Web] Search failed: {e}")

    # Step 4 — Hybrid Groq generation
    prompt = f"""You are a smart AI assistant embedded in a meeting intelligence app. You have access to THREE potential sources of knowledge. Use them in priority order:

1. MEETING TRANSCRIPT (highest priority — always prefer this if relevant):
{meeting_context if meeting_context else "No meeting transcript context found for this query."}

2. WEB SEARCH RESULTS (use to supplement or answer general questions):
{web_context if web_context else "No web results available."}

3. YOUR OWN GENERAL KNOWLEDGE (use as last resort if neither above has the answer).

Rules:
- Always clearly answer the question directly.
- If answering from meeting context, mention it briefly (e.g. "Based on the meeting...").
- If answering from the web, say "Based on current information..." or similar.
- Never say you cannot answer — always try to help using the available sources.

Question: {request.message}"""

    try:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.4,
        )
        answer = response.choices[0].message.content.strip()
        return {"answer": answer}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/meetings/{meeting_id}")
async def get_meeting_detail(meeting_id: str):
    data = load_meetings()
    for m in data.get("meetings", []):
        if m["id"] == meeting_id:
            return m
    raise HTTPException(status_code=404, detail="Meeting not found")

class RenameRequest(BaseModel):
    title: str

@app.patch("/api/meetings/{meeting_id}")
async def rename_meeting(meeting_id: str, request: RenameRequest):
    data = load_meetings()
    for m in data.get("meetings", []):
        if m["id"] == meeting_id:
            m["title"] = request.title
            m["date_updated"] = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            save_meetings(data)
            return {"status": "success", "message": "Meeting renamed", "new_title": m["title"]}
    raise HTTPException(status_code=404, detail="Meeting not found")

@app.get("/api/meetings/{meeting_id}/export")
async def export_csv(meeting_id: str):
    return {"status": "success", "message": f"CSV export placeholder for meeting {meeting_id} action items."}
