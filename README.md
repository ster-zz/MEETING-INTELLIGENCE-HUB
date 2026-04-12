# 🚀 DECISIO

Transform messy meeting transcripts into **structured business intelligence** in seconds. Built for speed, clarity, and "visual excellence."

![Dashboard Screenshot](https://raw.githubusercontent.com/ster-zz/MEETING-INTELLIGENCE-HUB/main/preview.png)

## ✨ Highlight Features
- **Instant Intelligence**: Extracts granular decisions, action items, and rationale from text/VTT files.
- **Sentiment Dashboard (Feature 4)**: A visual analytics suite including a chronological "vibe" timeline and per-speaker mood breakdown.
- **Hybrid RAG Chatbot**: Chat with your meeting context. If the meeting doesn't have the answer, the AI automatically searches the web to provide real-time supplemental info.
- **Zero-Latency Inference**: Powered by LLaMA 3.3 via the Groq LPU engine.
- **Context Handling**: Robust processing of transcripts up to 50,000 characters.

## 🛠️ Tech Stack
- **Backend**: FastAPI (Python)
- **AI Engine**: Groq (LLaMA 3.3 70B Versatile)
- **Frontend**: Glassmorphism UI (Vanilla CSS/JS)
- **Search Logic**: Dependency-free Lexical RAG + Google/Web augmentation.

## ⚙️ Quick Setup

1. **Clone the Repo**:
   ```bash
   git clone https://github.com/ster-zz/MEETING-INTELLIGENCE-HUB.git
   cd MEETING-INTELLIGENCE-HUB
   ```

2. **Install Dependencies**:
   ```bash
   pip install -r backend/requirements.txt
   ```

3. **Configure API Key**:
   Create `backend/.env` and add:
   ```env
   GROQ_API_KEY="your_groq_api_key"
   ```

4. **Run the Engine**:
   ```bash
   uvicorn backend.main:app --host 127.0.0.1 --port 8000
   ```

5. **Open the Dashboard**:
   Navigate to [http://127.0.0.1:8000/ui/index.html](http://127.0.0.1:8000/ui/index.html)

## 📖 Evaluation Checklist (Core Features)
- [x] Correct extraction of Decisions & Action Items.
- [x] Automatic Owner Assignment & Priority tagging.
- [x] Robust VTT/Transcript parsing.
- [x] Analytical Sentiment & Tone Timeline.
- [x] Real-time Web-Augmented RAG Chatbot.

---
*Created for the AI Sprint Final Submission.*
