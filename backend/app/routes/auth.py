from flask import Blueprint, request, jsonify, current_app
from ..models import User, Greenhouse, AuthToken
from flask_jwt_extended import jwt_required, get_jwt_identity, exceptions
from ..database import db
import jwt
from datetime import datetime, timedelta

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
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
    current_app.logger.info(f"--- Login Request Debug Start ---")
    current_app.logger.info(f"Request Headers: {request.headers}")
    current_app.logger.info(f"Request Content-Type: {request.content_type}")
    current_app.logger.info(f"Request Data (raw): {request.data!r}")

    data = None 
    try:
        data = request.get_json(force=True, silent=True)
        if data is None:
            current_app.logger.error("JSON PARSING FAILED: request.get_json() returned None.")
        else:
            current_app.logger.info(f"JSON PARSING SUCCESS: Parsed JSON Data: {data}")

    except Exception as e:
        current_app.logger.error(f"JSON PARSING EXCEPTION: {e}")

    if data is None:
        data = {}
        current_app.logger.error("Proceeding with empty data due to JSON parsing failure.")


    email = data.get('email')
    password = data.get('password')
    remember_me = data.get('rememberMe', False) 

    if not email or not password:
        current_app.logger.error(f"Missing email ({email!r}) or password in parsed JSON.")
        return jsonify({"message": "Email and password are required"}), 400

    user = User.query.filter_by(email=email).first()

    if not user or not user.check_password(password):
        current_app.logger.info(f"Login attempt failed for email: {email} - Invalid credentials.")
        current_app.logger.info(f"--- Login Request Debug End (Failure) ---")
        return jsonify({"message": "Invalid email or password"}), 401

    expires_delta = timedelta(days=7) if remember_me else timedelta(hours=1)
    payload = {
        'sub': str(user.id),
        'iat': datetime.utcnow(),
        'exp': datetime.utcnow() + expires_delta,
    }
    token = jwt.encode(
        payload,
        current_app.config['SECRET_KEY'],
        algorithm="HS256"
    )

    new_auth_token = AuthToken(user_id=user.id, token=token, expires_at=datetime.utcnow() + expires_delta)
    db.session.add(new_auth_token)
    db.session.commit()

    current_app.logger.info(f"Login successful for email: {email}. Token issued.")
    current_app.logger.info(f"--- Login Request Debug End (Success) ---")
    return jsonify({"message": "Login successful", "token": token, "user_id": user.id}), 200


@auth_bp.route('/link-greenhouse', methods=['POST'])
def link_greenhouse_route():
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return jsonify({"message": "Authorization header is missing or invalid"}), 401

    token = auth_header.split(" ")[1]
    try:
        decoded_token = jwt.decode(token, current_app.config['SECRET_KEY'], algorithms=["HS256"])
        current_user_id = decoded_token.get('sub')
        if not current_user_id:
            raise jwt.InvalidTokenError("Token payload missing 'sub' (user ID).")
    except jwt.ExpiredSignatureError:
        return jsonify({"message": "Token has expired."}), 401
    except jwt.InvalidTokenError as e:
        current_app.logger.error(f"Invalid token provided: {e}")
        return jsonify({"message": f"Invalid token: {e}"}), 401
    except Exception as e:
        current_app.logger.error(f"Token processing error: {e}")
        return jsonify({"message": "Error processing token."}), 401

    data = request.get_json()
    setup_key_entered = data.get('setupKey')

    if not setup_key_entered:
        return jsonify({"message": "Setup key is required"}), 400

    user = User.query.get(current_user_id)
    if not user:
        return jsonify({"message": "User associated with token not found."}), 404

    greenhouse_to_link = Greenhouse.query.filter_by(setup_key=setup_key_entered).first()

    if not greenhouse_to_link:
        return jsonify({"message": "Invalid setup key. Greenhouse not found."}), 404

    if greenhouse_to_link in user.greenhouses:
        return jsonify({"message": "This greenhouse is already linked to your account."}), 409

    user.greenhouses.append(greenhouse_to_link)
    try:
        db.session.commit()
        return jsonify({
            "message": "Greenhouse linked successfully to your account!",
            "greenhouse": {
                "id": greenhouse_to_link.id,
                "name": greenhouse_to_link.name
            }
        }), 200
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error linking greenhouse (user_id: {current_user_id}, gh_id: {greenhouse_to_link.id}): {e}")
        return jsonify({"message": "An error occurred while linking the greenhouse. Please try again."}), 500
    
# --- change password ---
@auth_bp.route('/change-password', methods=['POST'])
@jwt_required()
def change_password():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)

    if not user:
        return jsonify({"message": "User not found"}), 404

    data = request.get_json()
    current_password = data.get('currentPassword')
    new_password = data.get('newPassword')

    if not user.check_password(current_password):
        return jsonify({"message": "Incorrect current password."}), 403

    if not new_password or len(new_password) < 6:
        return jsonify({"message": "New password must be at least 6 characters long."}), 400

    user.set_password(new_password)
    try:
        db.session.commit()
        return jsonify({"message": "Password updated successfully."}), 200
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error changing password for user {current_user_id}: {e}")
        return jsonify({"message": "An error occurred while updating the password."}), 500