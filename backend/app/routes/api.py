# Webapp/backend/app/routes/api.py
from flask import Blueprint, request, jsonify
# Assuming SensorData is the class name in models.py for your sensor_data table
from ..models import SensorData, Greenhouse, User, Sensor, Unit 
from ..database import db
from datetime import datetime, timezone

api_bp = Blueprint('api', __name__)

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

    # 1. Find the Greenhouse (this part is fine)
    greenhouse = Greenhouse.query.filter_by(setup_key=setup_key).first()
    if not greenhouse:
        return jsonify({"message": "Greenhouse not found with this setup key"}), 404

    current_timestamp = datetime.now(timezone.utc)
    if pi_timestamp_str:
        try:
            parsed_pi_timestamp = datetime.fromisoformat(pi_timestamp_str.replace('Z', '+00:00'))
            current_timestamp = parsed_pi_timestamp.astimezone(timezone.utc) if parsed_pi_timestamp.tzinfo else parsed_pi_timestamp.replace(tzinfo=timezone.utc)
        except ValueError:
            print(f"Warning: Invalid timestamp format from Pi: {pi_timestamp_str}. Using server time.")
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

        # 3. Find the specific Sensor
        # WITHOUT greenhouse_id in Sensor model, this query is less specific.
        # It assumes sensor type + location is unique enough across ALL greenhouses,
        # or that sensors are linked to plants, and plants are somehow linked to this greenhouse.
        # This is a weaker link.
        sensor_query = Sensor.query.filter_by(type=sensor_type)
        if sensor_location:
            sensor_query = sensor_query.filter_by(location=sensor_location)
        
        sensor = sensor_query.first() 

        if not sensor:
            errors.append(f"Sensor not found for type: {sensor_type} at location: {sensor_location}")
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
                units_id=unit.id
                # NO greenhouse_id_direct here yet
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
            return jsonify({"message": "Error committing sensor data.", "detail": str(e), "partial_errors": errors}), 500
        
        response_message = f"{processed_readings} sensor data entries stored."
        if errors:
            response_message += f" Issues: {'; '.join(errors)}"
        return jsonify({"message": response_message}), 201
    elif errors:
        return jsonify({"message": "No data processed due to errors.", "errors": errors}), 400
    else:
        return jsonify({"message": "No valid readings provided."}), 400


@api_bp.route('/user/greenhouse_data/<int:user_id>', methods=['GET'])
def get_user_greenhouse_data(user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({"message": "User not found"}), 404

    user_greenhouse = user.greenhouses.first() 
    if not user_greenhouse:
        return jsonify({"message": "No linked greenhouse found for this user"}), 404

    # This query is difficult and inefficient without a direct link from SensorData or Sensor to Greenhouse.
    # It would involve multiple joins: User -> user_greenhouse_association -> Greenhouse
    # -> (some link to Plant if Sensor is linked to Plant) -> Sensor -> SensorData.
    # Your diagram doesn't show a direct link from Plant to Greenhouse.
    #
    # For now, this will fetch the last 20 readings from ALL sensors, which is not ideal.
    # This highlights why adding greenhouse_id to Sensor/SensorData is beneficial.
    
    all_sensor_data_query = db.session.query(
        SensorData.timestamp,
        SensorData.value,
        Sensor.type.label('sensor_type'),
        Unit.symbol.label('unit_symbol'),
        Sensor.location.label('sensor_location')
    ).join(Sensor, SensorData.sensors_id == Sensor.id)\
     .join(Unit, SensorData.units_id == Unit.id)
    
    # To *try* and filter by the user's greenhouse, we'd need to get all sensor IDs
    # that *could* belong to that greenhouse. This is complex without direct links.
    # Example (very inefficient and assumes Sensor.plants_id is used and Plant has a way to link to Greenhouse):
    #
    # plant_ids_in_greenhouse = [p.id for p in Plant.query.filter(Plant.some_greenhouse_link == user_greenhouse.id).all()] # Fictional link
    # sensor_ids_for_greenhouse = [s.id for s in Sensor.query.filter(Sensor.plants_id.in_(plant_ids_in_greenhouse)).all()]
    # if sensor_ids_for_greenhouse:
    #    all_sensor_data_query = all_sensor_data_query.filter(SensorData.sensors_id.in_(sensor_ids_for_greenhouse))

    # For now, just get latest 20 from all sensors as a placeholder
    all_sensor_data = all_sensor_data_query.order_by(SensorData.timestamp.desc()).limit(20).all()

    output = [{
        "timestamp": r.timestamp.isoformat(),
        "sensor_type": r.sensor_type,
        "value": r.value,
        "unit": r.unit_symbol,
        "location": r.sensor_location
    } for r in all_sensor_data]
    
    return jsonify({"greenhouse_id": user_greenhouse.id, "greenhouse_name": user_greenhouse.name, "data": output}), 200


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