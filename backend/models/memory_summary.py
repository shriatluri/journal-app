from mongoengine import Document, DateTimeField, ListField, DictField, ObjectIdField
from datetime import datetime


class MemorySummary(Document):
    userId = ObjectIdField(required=True, unique=True)
    lastUpdated = DateTimeField(default=datetime.utcnow)
    growthTimelines = ListField(DictField())

    meta = {
        'collection': 'memorySummaries',
        'indexes': [
            {'fields': ['userId'], 'unique': True}
        ]
    }

    def to_dict(self):
        return {
            'id': str(self.id),
            'userId': str(self.userId),
            'lastUpdated': self.lastUpdated.isoformat() if self.lastUpdated else None,
            'growthTimelines': self.growthTimelines
        }
