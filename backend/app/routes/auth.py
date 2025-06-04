# Webapp/backend/app/routes/auth.py
from flask import Blueprint, request, jsonify
from ..models import User, Greenhouse, AuthToken # Go up one level to app, then to models
from ..database import db # Go up one level to app, then to database
import jwt
from datetime import datetime, timedelta
from flask import current_app

# Define the Blueprint - THIS MUST BE auth_bp
auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/signup', methods=['POST'])
def signup():
    data = request.get_json()
    name = data.get('name')
    email = data.get('email')
    password = data.get('password')
    
    if not name or not email or not password:
        return jsonify({"message": "Missing name, email, or password"}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({"message": "User with this email already exists"}), 409

    new_user = User(username=name, email=email)
    new_user.set_password(password)
    
    db.session.add(new_user)
    db.session.commit()

    return jsonify({"message": "User created successfully", "user_id": new_user.id}), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    remember_me = data.get('rememberMe', False)

    user = User.query.filter_by(email=email).first()

    if not user or not user.check_password(password):
        return jsonify({"message": "Invalid email or password"}), 401

    expires_delta = timedelta(days=7) if remember_me else timedelta(hours=1)
    token = jwt.encode({
        'user_id': user.id,
        'user_email': user.email,
        'exp': datetime.utcnow() + expires_delta
    }, current_app.config['SECRET_KEY'], algorithm="HS256")

    new_auth_token = AuthToken(user_id=user.id, token=token, expires_at=datetime.utcnow() + expires_delta)
    db.session.add(new_auth_token)
    db.session.commit()

    return jsonify({"message": "Login successful", "token": token, "user_id": user.id}), 200

@auth_bp.route('/link-greenhouse', methods=['POST'])
def link_greenhouse():
    data = request.get_json()
    user_id = data.get('userId')
    setup_key = data.get('setupKey')

    if not user_id or not setup_key:
        return jsonify({"message": "Missing user ID or setup key"}), 400

    user = User.query.get(user_id)
    if not user:
        return jsonify({"message": "User not found"}), 404

    greenhouse = Greenhouse.query.filter_by(setup_key=setup_key).first()

    if not greenhouse:
        return jsonify({"message": "Invalid setup key or Greenhouse not found"}), 404
    
    if greenhouse.users.first():
        return jsonify({"message": "This greenhouse is already linked to another user."}), 409
    
    if greenhouse in user.greenhouses:
        return jsonify({"message": "This greenhouse is already linked to your account."}), 409

    user.greenhouses.append(greenhouse)
    db.session.commit()

    return jsonify({"message": "Greenhouse linked successfully!"}), 200

# You might have other routes here...