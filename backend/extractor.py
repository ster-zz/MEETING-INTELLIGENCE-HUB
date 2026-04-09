import os
import json
from groq import Groq

def extract_insights(transcript_text: str) -> dict:
    """
    Uses Groq API to extract decisions and action items from the transcript.
    """
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        raise ValueError("GROQ_API_KEY not set. Please configure environment variable.")

    client = Groq(api_key=api_key)

    safe_text = transcript_text[:4000]

    prompt = f"""You are an expert AI system extracting structured information from meeting transcripts.

Definitions:
* A "Decision" is a clear agreement, resolution, or final conclusion reached during the meeting.
* An "Action Item" is a task assigned to a specific person.

Extract:
1. Decisions (list of strings)
2. Action Items:
   * owner (person responsible)
   * task (what needs to be done)
   * deadline (if not mentioned, return "Not specified")

Return ONLY valid JSON in this exact format with no markdown, no explanation, no extra text:
{{
"decisions": ["..."],
"action_items": [
{{
"owner": "...",
"task": "...",
"deadline": "..."
}}
]
}}

Meeting Transcript:
{safe_text}
"""

    fallback = {"decisions": [], "action_items": []}

    def _call_and_parse():
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.2,
        )
        response_text = response.choices[0].message.content.strip()
        print("Extraction response:", response_text)

        # Clean response - strip markdown code fences if present
        if response_text.startswith("```json"):
            response_text = response_text[7:]
        if response_text.startswith("```"):
            response_text = response_text[3:]
        if response_text.endswith("```"):
            response_text = response_text[:-3]
        response_text = response_text.strip()

        return json.loads(response_text)

    try:
        return _call_and_parse()
    except json.JSONDecodeError:
        print("First JSON parse failed, retrying once...")
        try:
            return _call_and_parse()
        except Exception as e:
            print("Retry failed:", e)
            return fallback
    except Exception as e:
        print("Extraction failed:", e)
        return fallback
