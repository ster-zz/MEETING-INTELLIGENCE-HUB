# Meeting Intelligence Hub

A fast, beautifully designed AI-powered web application that perfectly extracts **decisions and action items** from raw meeting transcripts. 

It handles routing entirely in Python, using local JSON storage for a zero-config database and the lightning-fast Groq API for AI extraction.

## Prerequisites

- **Python 3.10+**
- A **Groq API Key** (Free tier is generous and lightning-fast. Get one at [console.groq.com](https://console.groq.com))

## Setup & Installation

1. **Clone the project & open terminal in the project root**
2. **Install dependencies:**
   ```bash
   pip install -r backend/requirements.txt
   ```
3. **Configure Environment Variables:**
   - Create a file named `.env` inside the `backend/` directory.
   - Add your Groq API key:
     ```env
     GROQ_API_KEY="your_api_key_here"
     ```

## Running the Application

This app hosts both the backend API and the static frontend UI on a single unified port to eliminate CORS issues.

From the **project root directory**, run:
```bash
uvicorn backend.main:app --reload --host 127.0.0.1 --port 8000
```

Once running, open your browser and navigate to:
**[http://127.0.0.1:8000/ui/index.html](http://127.0.0.1:8000/ui/index.html)**

## How to Test
1. Go to the URL above.
2. Click "Upload" or navigate to `/ui/upload.html`.
3. Drag and drop any `.txt` meeting transcript.
4. Watch the AI instantaneously parse out all action items and link them to their assigned users!
