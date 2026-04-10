import re
import json
import os

STOP_WORDS = {
    "the", "and", "is", "we", "did", "to", "a", "of", "in", "it", "that", 
    "for", "on", "with", "as", "at", "by", "this", "but", "not", "or",
    "what", "why", "how", "when", "where", "who", "are", "be"
}

class RAGService:
    def __init__(self):
        self.documents = {}
        self.load_historical_meetings()

    def load_historical_meetings(self):
        """Loads historical structured text into the in-memory RAG array on startup."""
        if not os.path.exists("meetings.json"):
            return
        try:
            with open("meetings.json", "r", encoding="utf-8") as f:
                data = json.load(f)
                for meeting in data.get("meetings", []):
                    if "id" in meeting and "text" in meeting:
                        self.add_document(meeting["id"], meeting["text"])
            print(f"RAG Loaded {len(self.documents)} historical meetings.")
        except Exception as e:
            print(f"Failed to load historical meetings into RAG: {e}")

    def add_document(self, meeting_id, text):
        """Chunks the transcript sequentially by paragraph ensuring no sentences are cut midway."""
        paragraphs = [p.strip() for p in text.split('\n\n') if p.strip()]
        chunks = []
        current_chunk = []
        current_len = 0
        
        # cluster into ~400 character chunks roughly
        for p in paragraphs:
            if current_len + len(p) > 400 and current_chunk:
                chunks.append(" ".join(current_chunk))
                current_chunk = [p]
                current_len = len(p)
            else:
                current_chunk.append(p)
                current_len += len(p)
                
        if current_chunk:
            chunks.append(" ".join(current_chunk))
            
        self.documents[meeting_id] = chunks

    def simple_similarity(self, query, chunk):
        """Raw lexical overlap counter bypassing strict Stop Words."""
        clean_query = re.sub(r'[^a-z0-9\s]', '', query.lower())
        clean_chunk = re.sub(r'[^a-z0-9\s]', '', chunk.lower())
        
        # Split into words and exclude stop words
        query_words = set(w for w in clean_query.split() if w not in STOP_WORDS)
        chunk_words = set(w for w in clean_chunk.split() if w not in STOP_WORDS)
        
        # Return exact hit overlap
        return len(query_words.intersection(chunk_words))

    def query(self, meeting_id, question):
        """Ranks all chunks by token overlap and aggregates Top K context."""
        chunks = self.documents.get(meeting_id, [])
        if not chunks:
            return "No transcript loaded."
            
        # Score each chunk
        scored_chunks = [(chunk, self.simple_similarity(question, chunk)) for chunk in chunks]
        
        # Sort chunks by highest score descending
        scored_chunks.sort(key=lambda x: x[1], reverse=True)
        
        # Get top 3 chunks (Top K = 3)
        top_chunks = [c[0] for c in scored_chunks[:3]]
        merged_context = "\n...\n".join(top_chunks)
        
        return merged_context
