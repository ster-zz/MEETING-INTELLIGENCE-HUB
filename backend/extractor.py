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

    # Increase limit to 50,000 chars (~12k tokens) which is very safe for LLaMA 3.3 128k context
    safe_text = transcript_text[:50000]

    prompt = f"""You are a principal-level AI meeting analyst. Your goal is to deeply analyze the provided transcript and extract EVERY meaningful insight, including emotional dynamics and chronological mood shifts.

CRITICAL INSTRUCTIONS:
- Be extremely granular and comprehensive. 
- Do not summarize multiple points into one; extract each distinct decision and action item separately.
- Scan the entire transcript for hidden tasks or agreements.

Extract the following data into a strict JSON structure:
1. "summary": A deep, comprehensive analysis of 400-800 characters, capturing nuances, subtexts, and all major discussion points.
2. "overall_sentiment": Exactly one of "Positive", "Neutral", "Negative".
3. "sentiment_timeline": An array of 5 indices representing chronological segments of the meeting. Each object must have:
   - "segment": A label (e.g., "0-20%", "20-40%", etc.).
   - "sentiment": "Positive", "Neutral", or "Negative".
4. "speaker_sentiment": An array of objects for each unique participant:
   - "name": Speaker's name.
   - "sentiment": "Positive", "Neutral", or "Negative".
   - "note": 1-sentence explanation of their general stance/tone.
5. "key_moments": Array of 2-4 objects highlighting emotional inflection points:
   - "type": "Conflict", "Agreement", or "Concern".
   - "text": A relevant dialogue snippet (e.g., "Speaker: Phrase").
6. "decisions": Array of objects containing:
   - "decision": The specific conclusion or agreement reached.
   - "rationale": The reason or context for this choice.
7. "action_items": Array of objects containing:
   - "owner": The person responsible (use "Unassigned" if ambiguous).
   - "task": The specific, exhaustive action required.
   - "deadline": The deadline, or "Not specified".
   - "priority": "High", "Medium", or "Low" based on the urgency/tone.

Return ONLY valid JSON in this exact format with no markdown, no explanation, no extra text:
{{
  "summary": "...",
  "overall_sentiment": "...",
  "sentiment_timeline": [
    {{"segment": "...", "sentiment": "..."}}
  ],
  "speaker_sentiment": [
    {{"name": "...", "sentiment": "...", "note": "..."}}
  ],
  "key_moments": [
    {{"type": "...", "text": "..."}}
  ],
  "decisions": [
    {{"decision": "...", "rationale": "..."}}
  ],
  "action_items": [
    {{"owner": "...", "task": "...", "deadline": "...", "priority": "..."}}
  ]
}}

Meeting Transcript:
{safe_text}
"""

    fallback = {"summary": "Extraction failed", "decisions": [], "action_items": []}

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
