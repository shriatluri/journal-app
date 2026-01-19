from mongoengine import Document, StringField, DateTimeField, DictField, FloatField, ObjectIdField
from datetime import datetime


class JournalEntry(Document):
    userId = ObjectIdField(required=True)
    createdAt = DateTimeField(default=datetime.utcnow)

    # Input
    imageUrl = StringField()
    rawText = StringField(required=True)

    # AI Analysis Output
    growthNote = DictField()

    # Metadata
    processingTimeSeconds = FloatField()
    aiModel = StringField(default='gemini-1.5-flash')
    apiCost = FloatField(default=0.0)
    version = FloatField(default=1)

    meta = {
        'collection': 'journalEntries',
        'indexes': [
            {'fields': ['userId', '-createdAt']},
            {'fields': ['growthNote.detectedAreas.areaName']},
            {'fields': [('rawText', 'text')]}
        ]
    }

    def to_dict(self):
        return {
            'id': str(self.id),
            'userId': str(self.userId),
            'createdAt': self.createdAt.isoformat() if self.createdAt else None,
            'imageUrl': self.imageUrl,
            'rawText': self.rawText,
            'growthNote': self.growthNote,
            'processingTimeSeconds': self.processingTimeSeconds,
            'aiModel': self.aiModel
        }
