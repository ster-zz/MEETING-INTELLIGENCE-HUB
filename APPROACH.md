# Approach Document: Meeting Intelligence Hub

## 1. Solution Design & Architecture
The Meeting Intelligence Hub is a cloud-ready AI application designed to transform raw, messy meeting transcripts into structured, actionable business intelligence. 

The architecture follows a modular, decoupled approach:
- **Frontend**: A high-performance, glassmorphism UI built with Vanilla JavaScript and CSS. It prioritizes "visual excellence" and "at-a-glance" comprehension.
- **Backend (FastAPI)**: A high-performance Python ASGI server chosen for its speed and native support for asynchronous tasks.
- **Intelligence Layer**: Powered by Groq LLaMA 3.3 (70B), bypasses traditional quota bottlenecks while providing principal-level analytical reasoning.
- **Persistence**: A local JSON-based document store for low-latency retrieval, designed to be easily swappable for PostgreSQL in high-concurrency environments.

## 2. Tech Stack Choices & Rationale

| Technology | Rationale |
| :--- | :--- |
| **Groq (LLaMA 3.3 70B)** | Chosen for its industry-leading inference speed and massive 128k context window, allowing processing of long transcripts in seconds. |
| **FastAPI** | Provides automatic OpenAPI documentation and superior performance compared to Flask/Django for AI-driven backends. |
| **Pure-Python Lexical RAG** | Instead of heavy dependencies like FAISS or Pinecone, we built a dependency-free lexical search engine to keep the application lightweight, portable, and fast on standard hardware. |
| **DuckDuckGo Search integration** | Enhances the chatbot's utility by providing real-time internet context when the meeting transcript doesn't contain the answer. |

## 3. Core AI Capabilities
- **Robust VTT Parsing**: Intelligent cleaning of WebVTT exports (Zoom/Teams) that strips technical metadata and timestamps to optimize the LLM's context window.
- **Dynamic Context-Aware RAG**: A smart retrieval system that automatically switches between full-text ingestion for short meetings and lexical chunking for massive transcripts.
- **Sentiment Analytics Dashboard**: A visual mood analytics suite including a chronological sentiment timeline and per-speaker mood mapping.

## 4. Future Improvements (Given more time)
1. **Asynchronous Background Workers**: Implementing Celery/Redis for multi-modal processing (Audio/Video parsing via Whisper).
2. **User Authentication & Multi-Tenancy**: Adding JWT-based security to support multiple organizations on a single instance.
3. **Vector Embeddings (Semantic Search)**: Swapping the lexical engine for `sentence-transformers` for better synonym matching.
4. **Action Item Sync**: Integrating with Jira, Slack, or Trello for direct task pushing.

---
**Prepared for**: AI Sprint Final Submission
**Repository**: [https://github.com/ster-zz/MEETING-INTELLIGENCE-HUB](https://github.com/ster-zz/MEETING-INTELLIGENCE-HUB)
