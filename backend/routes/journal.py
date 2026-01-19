from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from bson import ObjectId
from services.ai_service import AIAnalyzer
from services.memory_service import MemoryService
from services.storage_service import StorageService
from models.journal_entry import JournalEntry
from models.user import User
import base64
import time

journal_bp = Blueprint('journal', __name__)
ai_analyzer = AIAnalyzer()
storage_service = StorageService()


@journal_bp.route('/create', methods=['POST'])
@jwt_required()
def create_entry():
    """Create new journal entry and trigger AI analysis"""
    user_id = get_jwt_identity()
    data = request.json

    entry_text = data.get('text')
    entry_image = data.get('image')

    if not entry_text and not entry_image:
        return jsonify({'error': 'Provide either text or image'}), 400

    image_url = None
    if entry_image:
        try:
            image_bytes = base64.b64decode(entry_image)
            image_url = storage_service.upload_image(user_id, image_bytes)

            if not entry_text:
                entry_text = ai_analyzer.extract_text_from_image(image_bytes)
        except Exception as e:
            return jsonify({'error': f'Image processing failed: {str(e)}'}), 500

    user = User.objects(id=user_id).first()
    if not user:
        return jsonify({'error': 'User not found'}), 404

    growth_areas = [
        {
            'id': str(area._id),
            'name': area.name,
            'description': area.description
        }
        for area in user.growthAreas if area.isActive
    ]

    memory_context = MemoryService.build_context_for_ai(user_id, limit=5)

    start_time = time.time()
    try:
        growth_note = ai_analyzer.analyze_entry(
            entry_text=entry_text,
            growth_areas=growth_areas,
            memory_context=memory_context
        )
    except Exception as e:
        return jsonify({'error': f'AI analysis failed: {str(e)}'}), 500

    processing_time = time.time() - start_time

    entry = JournalEntry(
        userId=ObjectId(user_id),
        rawText=entry_text,
        imageUrl=image_url,
        growthNote=growth_note,
        processingTimeSeconds=processing_time,
        aiModel='gemini-1.5-flash'
    )
    entry.save()

    return jsonify({
        'entryId': str(entry.id),
        'growthNote': growth_note,
        'processingTime': processing_time,
        'message': 'Entry created and analyzed successfully'
    }), 201


@journal_bp.route('/list', methods=['GET'])
@jwt_required()
def list_entries():
    """Get user's journal entries with pagination"""
    user_id = get_jwt_identity()

    limit = int(request.args.get('limit', 10))
    skip = int(request.args.get('skip', 0))

    entries = JournalEntry.objects(
        userId=ObjectId(user_id)
    ).order_by('-createdAt').skip(skip).limit(limit)

    total = JournalEntry.objects(userId=ObjectId(user_id)).count()

    return jsonify({
        'entries': [entry.to_dict() for entry in entries],
        'total': total,
        'limit': limit,
        'skip': skip
    }), 200


@journal_bp.route('/<entry_id>', methods=['GET'])
@jwt_required()
def get_entry(entry_id):
    """Get specific journal entry"""
    user_id = get_jwt_identity()

    entry = JournalEntry.objects(id=entry_id, userId=ObjectId(user_id)).first()
    if not entry:
        return jsonify({'error': 'Entry not found'}), 404

    return jsonify(entry.to_dict()), 200


@journal_bp.route('/<entry_id>', methods=['DELETE'])
@jwt_required()
def delete_entry(entry_id):
    """Delete a journal entry"""
    user_id = get_jwt_identity()

    entry = JournalEntry.objects(id=entry_id, userId=ObjectId(user_id)).first()
    if not entry:
        return jsonify({'error': 'Entry not found'}), 404

    entry.delete()

    return jsonify({'message': 'Entry deleted successfully'}), 200
