from typing import Dict, Optional
from bson import ObjectId


class MemoryService:
    @staticmethod
    def get_or_create_memory(user_id: str) -> Optional[Dict]:
        """Get memory summary for user, create if doesn't exist"""
        from models.memory_summary import MemorySummary

        memory = MemorySummary.objects(userId=ObjectId(user_id)).first()
        if not memory:
            return None

        return memory.to_dict()

    @staticmethod
    def build_context_for_ai(user_id: str, limit: int = 5) -> Dict:
        """
        Build compressed context from last N entries for AI
        For MVP: Just send last 5 entries
        """
        from models.journal_entry import JournalEntry

        entries = JournalEntry.objects(
            userId=ObjectId(user_id)
        ).order_by('-createdAt').limit(limit)

        context = {
            'totalEntries': JournalEntry.objects(userId=ObjectId(user_id)).count(),
            'recentEntries': []
        }

        for entry in entries:
            growth_note = entry.growthNote or {}
            context['recentEntries'].append({
                'date': entry.createdAt.strftime('%Y-%m-%d'),
                'detectedAreas': [
                    area.get('areaName', '')
                    for area in growth_note.get('detectedAreas', [])
                ],
                'sentiment': growth_note.get('overallSentiment'),
                'progress': [
                    {
                        'area': area.get('areaName', ''),
                        'indicator': area.get('progressIndicator', '')
                    }
                    for area in growth_note.get('detectedAreas', [])
                ]
            })

        return context

    @staticmethod
    def update_memory_summary(user_id: str):
        """
        Update compressed memory summary (run nightly or after each entry)
        For MVP: Can skip this, just use last 5 entries
        """
        # TODO: Implement aggregation logic for post-MVP
        pass
