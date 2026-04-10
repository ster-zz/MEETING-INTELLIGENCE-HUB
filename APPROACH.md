# Approach Document: Meeting Intelligence Hub

## 0. Problem Overview
Modern teams generate large volumes of meeting transcripts, but extracting actionable insights from them is inefficient and time-consuming. This results in what we define as the **“Double Work Problem”**, where team members repeatedly revisit discussions instead of executing decisions.

Key outcomes such as decisions, action items, and reasoning are often buried within long transcripts and become effectively inaccessible. The goal of this system is to convert **unstructured meeting conversations into structured intelligence** and enable **instant querying of past discussions**.

---

## 1. System Workflow
The system follows a clear end-to-end pipeline:
1. **Upload**: User uploads a meeting transcript (.txt or .vtt).
2. **Parsing**: Custom engine cleans raw dialogue and optimizes context.
3. **Extraction**: AI identifies decisions, action items, and emotional "vibes."
4. **Storage**: Data is persisted in a zero-config local JSON store.
5. **Retrieval**: Transcript is indexed for Lexical RAG.
6. **Interaction**: User queries the meeting via a hybrid chatbot interface.
7. **Synthesis**: System fetches relevant internal context + live web data for a grounded answer.

---

## 2. Solution Design & Architecture
The Meeting Intelligence Hub is a modular, lightweight AI system with a clear separation of concerns:
- **Frontend**: A high-impact "Glassmorphism" UI built with Vanilla JS/CSS for speed and visual excellence.
- **Backend (FastAPI)**: A high-performance Python server chosen for its async capabilities and native FastAPI/Pydantic validation.
- **Intelligence Layer**: Powered by Groq (LLaMA 3.3 70B), providing principal-level reasoning with industry-leading inference speeds.
- **Persistence**: A local JSON store (`meetings.json`) for low-latency retrieval.

---

## 3. Tech Stack Choices & Rationale

| Technology | Rationale |
| :--- | :--- |
| **Groq (LLaMA 3.3 70B)** | Chosen for sub-second inference and a massive 128k context window to handle long transcripts. |
| **FastAPI** | Provides superior performance and automatic documentation compared to Flask/Django. |
| **Hybrid Lexical RAG** | A custom, dependency-free implementation that ensures portability while being fast on standard hardware. |
| **Vanilla JS + CSS** | Eliminates build complexity, ensuring a smooth demo execution and "instant-on" feel. |
| **DuckDuckGo Search API** | Augments the chatbot with real-time internet context for queries outside the meeting scope. |

---

## 4. Core AI Capabilities
- **Advanced Sentiment Dashboard**: Fully supports "Feature 4" specs with a chronological sentiment timeline bar and per-speaker mood mapping.
- **Granular Extraction**: Identifies not just what was said, but the *rationale* behind decisions and the specific *priorities* of action items.
- **Massive Context Support**: Handled up to **50,000 characters** in a single pass, solving the truncation issues common in standard LLM apps.
- **Intelligent RAG**: Grounded answers that cite meeting segments, falling back to web-augmentation when necessary.

---

## 5. Trade-offs & Design Decisions
- **Lexical RAG over Vector Search**: Prioritized reliability and fast implementation for the sprint, avoiding the overhead of external vector databases while maintaining high precision.
- **Local Storage**: Optimization for zero-setup deployment; designed to be easily swappable for PostgreSQL in production.
- **Direct Groq Integration**: Chose Raw API access over heavy frameworks (LangChain) to minimize latency and maintain absolute control over the prompt logic.

---

## 6. Design Evolution
Initially, the system utilized the Gemini API. However, due to rate limits and context constraints, we migrated to **Groq (LLaMA 3.3 70B)**. This change significantly improved response speed, reliability, and our ability to process deep, exhaustive analytics on long workshop transcripts without loss of detail.

---

## 7. Future Improvements
1. **Semantic Search**: Upgrade to embedding-based retrieval for better synonym mapping.
2. **Scalable Storage**: Replace JSON with a production-grade database (PostgreSQL/Vector store).
3. **Live Transcription**: Integrate Whisper for real-time speech-to-intent capabilities.
4. **Action Item Sync**: Export directly to Slack, Jira, or Trello.

---
**Prepared for**: AI Sprint Final Submission
**Repository**: [https://github.com/ster-zz/MEETING-INTELLIGENCE-HUB](https://github.com/ster-zz/MEETING-INTELLIGENCE-HUB)
