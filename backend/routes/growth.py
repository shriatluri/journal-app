from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from bson import ObjectId
from models.journal_entry import JournalEntry
from models.memory_summary import MemorySummary

growth_bp = Blueprint('growth', __name__)


@growth_bp.route('/timeline/<area_name>', methods=['GET'])
@jwt_required()
def get_timeline(area_name):
    """Get growth timeline for a specific area"""
    user_id = get_jwt_identity()

    entries = JournalEntry.objects(
        userId=ObjectId(user_id),
        growthNote__detectedAreas__areaName=area_name
    ).order_by('createdAt')

    timeline = []
    for entry in entries:
        for area in entry.growthNote.get('detectedAreas', []):
            if area.get('areaName') == area_name:
                timeline.append({
                    'date': entry.createdAt.isoformat(),
                    'entryId': str(entry.id),
                    'evidence': area.get('evidenceSnippet'),
                    'progress': area.get('progressIndicator'),
                    'sentiment': entry.growthNote.get('overallSentiment')
                })

    baseline = timeline[0] if timeline else None
    milestones = [t for t in timeline if t.get('progress') == 'improving']

    return jsonify({
        'areaName': area_name,
        'timeline': timeline,
        'baseline': baseline,
        'milestones': milestones[-5:] if milestones else [],
        'totalEntries': len(timeline)
    }), 200


@growth_bp.route('/summary', methods=['GET'])
@jwt_required()
def get_summary():
    """Get summary of progress across all growth areas"""
    user_id = get_jwt_identity()

    pipeline = [
        {'$match': {'userId': ObjectId(user_id)}},
        {'$unwind': '$growthNote.detectedAreas'},
        {'$group': {
            '_id': '$growthNote.detectedAreas.areaName',
            'totalMentions': {'$sum': 1},
            'improvingCount': {
                '$sum': {'$cond': [
                    {'$eq': ['$growthNote.detectedAreas.progressIndicator', 'improving']},
                    1, 0
                ]}
            },
            'strugglingCount': {
                '$sum': {'$cond': [
                    {'$eq': ['$growthNote.detectedAreas.progressIndicator', 'struggling']},
                    1, 0
                ]}
            },
            'lastMention': {'$max': '$createdAt'}
        }},
        {'$sort': {'totalMentions': -1}}
    ]

    results = list(JournalEntry.objects.aggregate(pipeline))

    summary = []
    for result in results:
        summary.append({
            'areaName': result['_id'],
            'totalMentions': result['totalMentions'],
            'improvingCount': result['improvingCount'],
            'strugglingCount': result['strugglingCount'],
            'lastMention': result['lastMention'].isoformat() if result.get('lastMention') else None
        })

    return jsonify({
        'summary': summary,
        'totalEntries': JournalEntry.objects(userId=ObjectId(user_id)).count()
    }), 200
