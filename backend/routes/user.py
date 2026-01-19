from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.user import User, GrowthArea
from bson import ObjectId

user_bp = Blueprint('user', __name__)


@user_bp.route('/profile', methods=['GET'])
@jwt_required()
def get_profile():
    """Get user profile"""
    user_id = get_jwt_identity()

    user = User.objects(id=user_id).first()
    if not user:
        return jsonify({'error': 'User not found'}), 404

    return jsonify(user.to_dict()), 200


@user_bp.route('/growth-areas', methods=['GET'])
@jwt_required()
def get_growth_areas():
    """Get user's growth areas"""
    user_id = get_jwt_identity()

    user = User.objects(id=user_id).first()
    if not user:
        return jsonify({'error': 'User not found'}), 404

    return jsonify({
        'growthAreas': [area.to_dict() for area in user.growthAreas]
    }), 200


@user_bp.route('/growth-areas', methods=['POST'])
@jwt_required()
def update_growth_areas():
    """Update user's growth areas"""
    user_id = get_jwt_identity()
    data = request.json

    user = User.objects(id=user_id).first()
    if not user:
        return jsonify({'error': 'User not found'}), 404

    growth_areas_data = data.get('growthAreas', [])

    new_areas = []
    for area_data in growth_areas_data:
        area = GrowthArea(
            name=area_data.get('name'),
            description=area_data.get('description', ''),
            isActive=area_data.get('isActive', True)
        )
        new_areas.append(area)

    user.growthAreas = new_areas
    user.save()

    return jsonify({
        'message': 'Growth areas updated',
        'growthAreas': [area.to_dict() for area in user.growthAreas]
    }), 200


@user_bp.route('/growth-areas/<area_id>', methods=['PUT'])
@jwt_required()
def update_growth_area(area_id):
    """Update a specific growth area"""
    user_id = get_jwt_identity()
    data = request.json

    user = User.objects(id=user_id).first()
    if not user:
        return jsonify({'error': 'User not found'}), 404

    for area in user.growthAreas:
        if str(area._id) == area_id:
            if 'name' in data:
                area.name = data['name']
            if 'description' in data:
                area.description = data['description']
            if 'isActive' in data:
                area.isActive = data['isActive']
            user.save()
            return jsonify({
                'message': 'Growth area updated',
                'growthArea': area.to_dict()
            }), 200

    return jsonify({'error': 'Growth area not found'}), 404


@user_bp.route('/growth-areas/<area_id>', methods=['DELETE'])
@jwt_required()
def delete_growth_area(area_id):
    """Delete a growth area"""
    user_id = get_jwt_identity()

    user = User.objects(id=user_id).first()
    if not user:
        return jsonify({'error': 'User not found'}), 404

    original_count = len(user.growthAreas)
    user.growthAreas = [area for area in user.growthAreas if str(area._id) != area_id]

    if len(user.growthAreas) == original_count:
        return jsonify({'error': 'Growth area not found'}), 404

    user.save()

    return jsonify({'message': 'Growth area deleted'}), 200
