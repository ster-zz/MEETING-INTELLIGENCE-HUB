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

app = FastAPI(title="Meeting Intelligence Hub API")

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

def load_meetings():
    if not os.path.exists("meetings.json") or os.path.getsize("meetings.json") == 0:
        return {"meetings": []}
    with open("meetings.json", "r", encoding="utf-8") as f:
        try:
            return json.load(f)
        except:
            return {"meetings": []}

def save_meetings(data):
    with open("meetings.json", "w", encoding="utf-8") as f:
        json.dump(data, f, indent=4)

@app.post("/api/upload")
async def upload_meeting(file: UploadFile = File(...)):
    content = await file.read()
    text = content.decode("utf-8", errors="ignore")
    
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
        "decisions": insights.get("decisions", []),
        "action_items": insights.get("action_items", [])
    }
    
    data = load_meetings()
    data["meetings"].append(meeting_data)
    save_meetings(data)
    
    return {"status": "success", "message": "File processed", "meeting_id": meeting_id}

@app.get("/api/meetings")
async def list_meetings():
    data = load_meetings()
    return [{"id": m["id"], "title": m["title"], "date": m["date"]} for m in data.get("meetings", [])]

@app.get("/api/meetings/{meeting_id}")
async def get_meeting_detail(meeting_id: str):
    data = load_meetings()
    for m in data.get("meetings", []):
        if m["id"] == meeting_id:
            return m
    raise HTTPException(status_code=404, detail="Meeting not found")

@app.post("/api/chat")
async def chat(request: ChatRequest):
    return {"reply": f"This is a placeholder reply for meeting {request.meeting_id} regarding '{request.message}'"}

@app.get("/api/meetings/{meeting_id}/export")
async def export_csv(meeting_id: str):
    return {"status": "success", "message": f"CSV export placeholder for meeting {meeting_id} action items."}
