import os
import json
import re
from typing import Dict, List, Optional
import google.generativeai as genai
from config import Config

genai.configure(api_key=Config.GEMINI_API_KEY)


class AIAnalyzer:
    def __init__(self):
        self.model = genai.GenerativeModel('gemini-1.5-flash')

    def analyze_entry(
        self,
        entry_text: str,
        growth_areas: List[Dict],
        memory_context: Optional[Dict] = None
    ) -> Dict:
        """Analyze journal entry and return growth note"""
        system_prompt = self._build_system_prompt(growth_areas, memory_context)

        prompt = f"""{system_prompt}

Analyze this journal entry and create a growth note:

{entry_text}

Return ONLY valid JSON in this exact format:
{{
  "detectedAreas": [
    {{
      "areaId": "growth_area_id_here",
      "areaName": "Area Name",
      "evidenceSnippet": "Quote from entry showing this",
      "progressIndicator": "improving"
    }}
  ],
  "keyMoments": ["moment 1", "moment 2"],
  "actionableInsight": "One specific suggestion",
  "overallSentiment": "positive"
}}

progressIndicator must be one of: improving, steady, struggling, first_mention
overallSentiment must be one of: positive, neutral, challenging
"""

        response = self.model.generate_content(prompt)
        return self._parse_response(response.text)

    def extract_text_from_image(self, image_bytes: bytes) -> str:
        """Extract text from journal image using Gemini Vision"""
        image_part = {
            "mime_type": "image/jpeg",
            "data": image_bytes
        }

        prompt = "Extract all text from this handwritten journal entry. Return only the text, no commentary."

        response = self.model.generate_content([prompt, image_part])
        return response.text

    def _build_system_prompt(
        self,
        growth_areas: List[Dict],
        memory_context: Optional[Dict]
    ) -> str:
        if growth_areas:
            areas_text = "\n".join([
                f"- {area['name']} (id: {area['id']}): {area.get('description', 'No description')}"
                for area in growth_areas
            ])
        else:
            areas_text = "No specific growth areas defined yet. Identify general themes of personal growth."

        memory_text = "This is their first entry."
        if memory_context and memory_context.get('recentEntries'):
            memory_text = self._format_memory_context(memory_context)

        return f"""You are a personal growth analyst helping users track progress in specific areas of their life.

The user is tracking these growth areas:
{areas_text}

{memory_text}

Your task:
1. Identify which growth areas appear in today's entry
2. Extract specific evidence (quotes) for each area
3. Determine progress: improving, steady, struggling, or first_mention
4. Suggest ONE actionable insight based on patterns you notice
5. Assess overall sentiment of the entry

Be encouraging but honest. Focus on concrete evidence from the entry.
If no growth areas are defined, analyze general themes of personal development."""

    def _format_memory_context(self, memory: Dict) -> str:
        """Convert memory summary to readable context for AI"""
        context_parts = [f"Historical context ({memory.get('totalEntries', 0)} total entries):"]

        for entry in memory.get('recentEntries', []):
            areas = ', '.join(entry.get('detectedAreas', [])) or 'None detected'
            context_parts.append(
                f"  - {entry['date']}: Areas: {areas}, Sentiment: {entry.get('sentiment', 'unknown')}"
            )

        return "\n".join(context_parts)

    def _parse_response(self, response_text: str) -> Dict:
        """Parse AI response, handling markdown code blocks"""
        cleaned = re.sub(r'```json\n?|\n?```', '', response_text)
        cleaned = cleaned.strip()

        try:
            return json.loads(cleaned)
        except json.JSONDecodeError as e:
            print(f"JSON parse error: {e}")
            print(f"Response text: {response_text}")
            return {
                "detectedAreas": [],
                "keyMoments": ["Unable to parse AI response"],
                "actionableInsight": "Please try again",
                "overallSentiment": "neutral",
                "parseError": True
            }
