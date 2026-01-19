from mongoengine import Document, StringField, DateTimeField, EmbeddedDocument, EmbeddedDocumentListField, BooleanField, ObjectIdField
from datetime import datetime
from bson import ObjectId


class GrowthArea(EmbeddedDocument):
    _id = ObjectIdField(default=ObjectId)
    name = StringField(required=True, max_length=100)
    description = StringField(max_length=500)
    createdAt = DateTimeField(default=datetime.utcnow)
    isActive = BooleanField(default=True)

    def to_dict(self):
        return {
            'id': str(self._id),
            'name': self.name,
            'description': self.description,
            'createdAt': self.createdAt.isoformat() if self.createdAt else None,
            'isActive': self.isActive
        }


class User(Document):
    email = StringField(required=True, unique=True)
    passwordHash = StringField(required=True)
    createdAt = DateTimeField(default=datetime.utcnow)
    growthAreas = EmbeddedDocumentListField(GrowthArea)

    meta = {
        'collection': 'users',
        'indexes': [
            {'fields': ['email'], 'unique': True}
        ]
    }

    def to_dict(self):
        return {
            'id': str(self.id),
            'email': self.email,
            'createdAt': self.createdAt.isoformat() if self.createdAt else None,
            'growthAreas': [area.to_dict() for area in self.growthAreas]
        }
