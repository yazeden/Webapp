from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity, exceptions 
from ..models import SensorData, Greenhouse, User, Sensor, Unit, Plant
from ..database import db 
from datetime import datetime, timezone 
from sqlalchemy import desc 

api_bp = Blueprint('api', __name__)

def is_preflight_request():
    return request.method == 'OPTIONS'

def handle_jwt_protection():
    try:
        current_user_id = get_jwt_identity()
        if current_user_id is None:
            return jsonify({"message": "Authorization token missing or invalid"}), 401
        return current_user_id 
    except exceptions.NoAuthorizationError:
        return jsonify({"message": "Authorization token required"}), 401
    except exceptions.ExpiredSignatureError:
        return jsonify({"message": "Authorization token has expired"}), 401
    except (exceptions.InvalidTokenError, exceptions.DecodeError) as e:
        current_app.logger.error(f"Invalid token provided: {e}")
        return jsonify({"message": f"Invalid authorization token: {e}"}), 401
    except Exception as e:
        current_app.logger.error(f"Unexpected error during JWT processing: {e}")
        return jsonify({"message": "An error occurred during authentication."}), 500

@api_bp.route('/pi/data', methods=['POST'])
def receive_pi_data():
    data = request.get_json()
    if not data:
        return jsonify({"message": "Request must be JSON"}), 400

    setup_key = data.get('setup_key')
    incoming_readings = data.get('readings')
    pi_timestamp_str = data.get('timestamp')

    if not setup_key or not incoming_readings or not isinstance(incoming_readings, list):
        return jsonify({"message": "Missing setup_key or readings (must be a list)"}), 400

    greenhouse = Greenhouse.query.filter_by(setup_key=setup_key).first()
    if not greenhouse:
        return jsonify({"message": "Greenhouse not found with this setup key"}), 404

    current_timestamp = datetime.now(timezone.utc)
    if pi_timestamp_str:
        try:
            parsed_pi_timestamp = datetime.fromisoformat(pi_timestamp_str.replace('Z', '+00:00'))
            current_timestamp = parsed_pi_timestamp.astimezone(timezone.utc) if parsed_pi_timestamp.tzinfo else parsed_pi_timestamp.replace(tzinfo=timezone.utc)
        except ValueError:
            current_app.logger.warning(f"Invalid timestamp format from Pi: {pi_timestamp_str}. Using server time.")
            pass

    processed_readings = 0
    errors = []

    for reading_item in incoming_readings:
        sensor_type = reading_item.get('sensor_type')
        value = reading_item.get('value')
        unit_symbol = reading_item.get('unit_symbol')
        sensor_location = reading_item.get('location')

        if sensor_type is None or value is None or unit_symbol is None:
            errors.append(f"Skipped reading due to missing fields: {reading_item}")
            continue

        sensor = Sensor.query.filter_by(
            type=sensor_type,
            location=sensor_location,
            greenhouse_id=greenhouse.id
        ).first()

        if not sensor:
            errors.append(f"Sensor not found for type: {sensor_type} at location: {sensor_location} in greenhouse {greenhouse.name}")
            continue

        unit = Unit.query.filter_by(symbol=unit_symbol).first()
        if not unit:
            errors.append(f"Unit not found for symbol: {unit_symbol}")
            continue

        try:
            new_sensor_data_entry = SensorData(
                timestamp=current_timestamp,
                value=float(value),
                sensors_id=sensor.id,
                units_id=unit.id,
                greenhouse_id_direct=greenhouse.id
            )
            db.session.add(new_sensor_data_entry)
            processed_readings += 1
        except Exception as e:
            errors.append(f"Error creating sensor data entry for {sensor_type}: {str(e)}")

    if processed_readings > 0:
        try:
            db.session.commit()
        except Exception as e:
            db.session.rollback()
            current_app.logger.error(f"DB commit error in receive_pi_data: {e}")
            return jsonify({"message": "Error committing sensor data.", "detail": str(e), "partial_errors": errors}), 500

        response_message = f"{processed_readings} sensor data entries stored for greenhouse '{greenhouse.name}'."
        if errors:
            response_message += f" Issues: {'; '.join(errors)}"
        return jsonify({"message": response_message}), 201
    elif errors:
        return jsonify({"message": "No data processed due to errors.", "errors": errors}), 400
    else:
        return jsonify({"message": "No valid readings provided to process."}), 400


# --- get linked greenhouse ---
@api_bp.route('/user/greenhouses', methods=['GET', 'OPTIONS'])
@jwt_required(optional=True) 
def get_user_greenhouses():
    current_app.logger.info(f"Authorization Header: {request.headers.get('Authorization')}")
    if is_preflight_request():
        return jsonify({"message": "Preflight OK"}), 200 

    # actual get request
    auth_result = handle_jwt_protection()
    if isinstance(auth_result, tuple): 
        return auth_result
    current_user_id = auth_result

    user = User.query.get(current_user_id)
    current_app.logger.info(f"User Object: {user}")
    if not user:
        current_app.logger.error(f"User not found for ID: {current_user_id}")
        return jsonify({"message": "User not found"}), 404

    greenhouses_data = []
    for gh in user.greenhouses:
        greenhouses_data.append({
            "id": gh.id,
            "name": gh.name,
            "setup_key": gh.setup_key
        })
    return jsonify(greenhouses_data), 200

# --- unlink greenhouse ---
@api_bp.route('/user/greenhouses/<int:greenhouse_id>', methods=['DELETE', 'OPTIONS'])
@jwt_required(optional=True)
def unlink_user_greenhouse(greenhouse_id):
    if is_preflight_request():
        return jsonify({"message": "Preflight OK"}), 200

    auth_result = handle_jwt_protection()
    if isinstance(auth_result, tuple):
        return auth_result
    current_user_id = auth_result

    user = User.query.get(current_user_id)
    greenhouse_to_unlink = Greenhouse.query.get(greenhouse_id)

    if not user: return jsonify({"message": "User not found"}), 404
    if not greenhouse_to_unlink: return jsonify({"message": "Greenhouse not found"}), 404

    if greenhouse_to_unlink in user.greenhouses:
        user.greenhouses.remove(greenhouse_to_unlink)
        try:
            db.session.commit()
            return jsonify({"message": f"Successfully unlinked from greenhouse '{greenhouse_to_unlink.name}'."}), 200
        except Exception as e:
            db.session.rollback()
            current_app.logger.error(f"Error committing unlink for user {current_user_id}, gh {greenhouse_id}: {e}")
            return jsonify({"message": "An error occurred during unlinking."}), 500
    else:
        return jsonify({"message": "You are not linked to this greenhouse."}), 400


# --- get plant profiles ---
@api_bp.route('/plants/custom_profiles', methods=['GET', 'OPTIONS'])
@jwt_required(optional=True)
def get_custom_plant_profiles():
    current_app.logger.info(f"Authorization Header: {request.headers.get('Authorization')}")
    if is_preflight_request():
        return jsonify({"message": "Preflight OK"}), 200

    auth_result = handle_jwt_protection()
    if isinstance(auth_result, tuple):
        return auth_result
    current_user_id = auth_result

    plant_profiles = Plant.query.all()
    current_app.logger.info(f"Plant Profiles: {plant_profiles}")
    if not plant_profiles:
        return jsonify({"message": "No custom plant profiles found"}), 404

    profiles_data = []
    for pp in plant_profiles:
        profiles_data.append({
            "id": pp.id,
            "name": pp.name,
            "ideal_temp_min": pp.ideal_temp_min,
            "ideal_temp_max": pp.ideal_temp_max,
            "ideal_groundmoisture": pp.ideal_groundmoisture,
            "ideal_humidity": pp.ideal_humidity,
            "ideal_co2": pp.ideal_co2,
            "ideal_light": pp.ideal_light,
        })
    return jsonify(profiles_data), 200


# --- create plant profile ---
@api_bp.route('/plants/custom', methods=['POST', 'OPTIONS'])
@jwt_required(optional=True)
def create_custom_plant():
    if is_preflight_request():
        return jsonify({"message": "Preflight OK"}), 200

    auth_result = handle_jwt_protection()
    if isinstance(auth_result, tuple):
        return auth_result
    current_user_id = auth_result

    data = request.get_json()
    name = data.get('name')

    if not name:
        return jsonify({"message": "Plant name is required"}), 400

    new_plant = Plant(
        name=name,
        ideal_temp_min=data.get('ideal_temp_min'),
        ideal_temp_max=data.get('ideal_temp_max'),
        ideal_groundmoisture=data.get('ideal_groundmoisture'),
        ideal_humidity=data.get('ideal_humidity'),
        ideal_co2=data.get('ideal_co2'),
        ideal_light=data.get('ideal_light')
    )
    db.session.add(new_plant)
    db.session.commit()

    return jsonify({"message": "Custom plant profile created", "plant_id": new_plant.id}), 201


# --- greenhouse conditions ---
@api_bp.route('/greenhouses/<int:greenhouse_id>/conditions', methods=['GET', 'OPTIONS'])
@jwt_required(optional=True)
def get_greenhouse_conditions(greenhouse_id):
    if is_preflight_request():
        return jsonify({"message": "Preflight OK"}), 200

    auth_result = handle_jwt_protection()
    if isinstance(auth_result, tuple):
        return auth_result
    current_user_id = auth_result

    user = User.query.get(current_user_id)
    greenhouse = Greenhouse.query.get(greenhouse_id)

    if not greenhouse:
        return jsonify({"message": "Greenhouse not found"}), 404
    if user not in greenhouse.users:
        return jsonify({"message": "Unauthorized to access this greenhouse"}), 403

    conditions = {}
    for sensor in greenhouse.sensors:
        latest_data = SensorData.query.filter_by(sensors_id=sensor.id).order_by(desc(SensorData.timestamp)).first()
        if latest_data:
            conditions[sensor.type] = {
                "value": latest_data.value,
                "unit": latest_data.unit.symbol,
                "timestamp": latest_data.timestamp.isoformat()
            }
    return jsonify(conditions), 200

@api_bp.route('/user/greenhouse_data/<int:user_id>', methods=['GET'])
def get_user_greenhouse_data(user_id):
    return jsonify({"message": "This endpoint is deprecated or not used by current frontend dashboard. Check routing."}), 501


@api_bp.route('/create_test_greenhouse', methods=['POST'])
def create_test_greenhouse():
    data = request.get_json()
    name = data.get('name', 'Test Greenhouse')
    setup_key = data.get('setup_key')

    if not setup_key:
        return jsonify({"message": "Setup key is required"}), 400

    if Greenhouse.query.filter_by(setup_key=setup_key).first():
        return jsonify({"message": "Setup key already exists"}), 409

    new_greenhouse = Greenhouse(name=name, setup_key=setup_key)
    db.session.add(new_greenhouse)
    db.session.commit()
    return jsonify({"message": "Test greenhouse created (unlinked)", "id": new_greenhouse.id}), 201