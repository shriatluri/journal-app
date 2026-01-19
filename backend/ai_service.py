import os
import json
import re
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

# Configure Gemini
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)


def analyze_entry(text: str, growth_areas: list[dict] = None, past_entries: list[dict] = None) -> dict:
    """
    Analyze journal entry using Google Gemini and return growth note.
    Falls back to mock response if API key not configured.

    Args:
        text: The journal entry text
        growth_areas: User's defined growth areas [{"name": "...", "description": "..."}]
        past_entries: Recent entries for context [{"date": "...", "areas": [...], "sentiment": "..."}]
    """
    if not GEMINI_API_KEY:
        print("Warning: GEMINI_API_KEY not set, using mock response")
        return _mock_response(text, growth_areas)

    try:
        model = genai.GenerativeModel("gemini-2.0-flash")

        # Build context about user's growth areas
        areas_context = ""
        if growth_areas:
            areas_list = "\n".join([f"- {a['name']}: {a.get('description', 'No description')}" for a in growth_areas])
            areas_context = f"""
The user is specifically tracking these growth areas:
{areas_list}

Prioritize detecting these areas when relevant, but also identify other growth themes if present.
"""
        else:
            areas_context = "The user hasn't defined specific growth areas yet. Identify general growth themes."

        # Build context about past entries
        history_context = ""
        if past_entries and len(past_entries) > 0:
            history_lines = []
            for entry in past_entries[-5:]:  # Last 5 entries
                areas = ", ".join(entry.get("areas", [])) or "None"
                history_lines.append(f"- {entry.get('date', 'Unknown')}: {areas} ({entry.get('sentiment', 'neutral')})")
            history_context = f"""
Recent journal history:
{chr(10).join(history_lines)}

Use this context to assess progress (improving vs steady vs struggling).
"""

        prompt = f"""You are a personal growth analyst. Analyze this journal entry.
{areas_context}
{history_context}
Journal Entry:
{text}

Return ONLY valid JSON (no markdown, no code blocks) in this exact format:
{{
  "detectedAreas": [
    {{
      "areaName": "Area name",
      "evidenceSnippet": "Direct quote or paraphrase from the entry",
      "progressIndicator": "improving|steady|struggling|first_mention"
    }}
  ],
  "keyMoments": ["Key moment 1", "Key moment 2"],
  "actionableInsight": "One specific, actionable suggestion",
  "overallSentiment": "positive|neutral|challenging"
}}

Rules:
- Detect 1-3 growth areas that appear in the entry
- Use direct evidence from the text
- progressIndicator: "improving" if positive progress, "struggling" if challenges, "steady" if maintaining, "first_mention" if new
- Be encouraging but honest
- Return ONLY the JSON, nothing else"""

        response = model.generate_content(prompt)
        return _parse_response(response.text)

    except Exception as e:
        print(f"Gemini API error: {e}")
        return _mock_response(text, growth_areas)


def _parse_response(response_text: str) -> dict:
    """Parse AI response, handling markdown code blocks if present."""
    # Remove markdown code blocks if present
    cleaned = re.sub(r"```json\n?|\n?```", "", response_text)
    cleaned = cleaned.strip()

    try:
        return json.loads(cleaned)
    except json.JSONDecodeError as e:
        print(f"JSON parse error: {e}")
        print(f"Response was: {response_text}")
        return {
            "detectedAreas": [
                {
                    "areaName": "Self-reflection",
                    "evidenceSnippet": "Entry recorded",
                    "progressIndicator": "first_mention",
                }
            ],
            "keyMoments": ["Took time to journal"],
            "actionableInsight": "Continue reflecting on your experiences daily.",
            "overallSentiment": "neutral",
        }


def _mock_response(text: str) -> dict:
    """Fallback mock response when API is not available."""
    # Simple keyword detection for mock
    text_lower = text.lower()

    areas = []
    if any(w in text_lower for w in ["talk", "conversation", "meeting", "discussed"]):
        areas.append(
            {
                "areaName": "Communication",
                "evidenceSnippet": text[:80] + "..." if len(text) > 80 else text,
                "progressIndicator": "improving",
            }
        )
    if any(w in text_lower for w in ["work", "productive", "task", "project"]):
        areas.append(
            {
                "areaName": "Productivity",
                "evidenceSnippet": text[:80] + "..." if len(text) > 80 else text,
                "progressIndicator": "steady",
            }
        )
    if any(w in text_lower for w in ["gym", "exercise", "health", "sleep"]):
        areas.append(
            {
                "areaName": "Health",
                "evidenceSnippet": text[:80] + "..." if len(text) > 80 else text,
                "progressIndicator": "improving",
            }
        )

    if not areas:
        areas.append(
            {
                "areaName": "Self-reflection",
                "evidenceSnippet": text[:80] + "..." if len(text) > 80 else text,
                "progressIndicator": "first_mention",
            }
        )

    sentiment = "positive" if any(w in text_lower for w in ["great", "good", "happy"]) else "neutral"

    return {
        "detectedAreas": areas,
        "keyMoments": ["Took time to reflect on the day"],
        "actionableInsight": "Keep journaling daily to track your growth patterns.",
        "overallSentiment": sentiment,
    }
