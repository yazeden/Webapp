# Webapp/backend/app/models.py
from datetime import datetime
from .database import db
import bcrypt

# --- Models for 'user_auth' database (groeibloei) ---
# ... (User, AuthToken, Greenhouse models remain the same as before) ...
user_greenhouse_association = db.Table(
    'user_greenhouse', 
    db.Column('user_id', db.Integer, db.ForeignKey('users.id'), primary_key=True),
    db.Column('greenhouse_id', db.Integer, db.ForeignKey('greenhouses.id'), primary_key=True),
    extend_existing=True 
)

class User(db.Model):
    __tablename__ = 'users' 
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(30), unique=True, nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    greenhouses = db.relationship(
        'Greenhouse',
        secondary=user_greenhouse_association,
        backref=db.backref('users', lazy=True),
        lazy=True
    )
    auth_tokens = db.relationship('AuthToken', backref='user', lazy=True)
    # ... (set_password, check_password, __repr__)

    def set_password(self, password):
        self.password_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

    def check_password(self, password):
        return bcrypt.checkpw(password.encode('utf-8'), self.password_hash.encode('utf-8'))

    def __repr__(self):
        return f'<User {self.username}>'


class AuthToken(db.Model):
    __tablename__ = 'auth_tokens' 
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    token = db.Column(db.String(255), unique=True, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    expires_at = db.Column(db.DateTime)
    # ... (__repr__)
    def __repr__(self):
        return f'<AuthToken {self.token[:10]}...>'


class Greenhouse(db.Model):
    __tablename__ = 'greenhouses'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), nullable=False)
    setup_key = db.Column('code', db.String(20), unique=True, nullable=False)
    sensor_readings = db.relationship('SensorData', backref='origin_greenhouse', lazy=True,
                                      primaryjoin="Greenhouse.id == SensorData.greenhouse_id_direct") # New relationship name
    # Relationship to its own sensors
    sensors = db.relationship('Sensor', backref='parent_greenhouse', lazy=True) # New relationship

    # ... (__repr__)
    def __repr__(self):
        return f'<Greenhouse {self.name}>'


# --- Models for 'groeibloei' database (formerly greenhouse_data) ---

class Plant(db.Model):
    __tablename__ = 'plants'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), nullable=False)
    ideal_temp_min = db.Column(db.Float, nullable=True)
    ideal_temp_max = db.Column(db.Float, nullable=True)
    ideal_groundmoisture = db.Column(db.Float, nullable=True)
    ideal_humidity = db.Column(db.Float, nullable=True)
    ideal_co2 = db.Column(db.Float, nullable=True)
    ideal_light = db.Column(db.Float, nullable=True)
    sensors = db.relationship('Sensor', backref='plant', lazy=True)
    actuators = db.relationship('Actuator', backref='plant', lazy=True)
    # ... (__repr__)
    def __repr__(self):
        return f'<Plant {self.name}>'


class Sensor(db.Model):
    __tablename__ = 'sensors'
    id = db.Column(db.Integer, primary_key=True)
    type = db.Column(db.String(30), nullable=False) 
    location = db.Column(db.String(50), nullable=False) 
    plants_id = db.Column(db.Integer, db.ForeignKey('plants.id'), nullable=True)
    
    # NEW: Foreign Key to Greenhouse
    # This sensor belongs to a specific greenhouse.
    greenhouse_id = db.Column(db.Integer, db.ForeignKey('greenhouses.id'), nullable=False)

    sensor_data = db.relationship('SensorData', backref='sensor', lazy=True)
    # ... (__repr__)
    def __repr__(self):
        return f'<Sensor {self.type} at {self.location}>'


class SensorData(db.Model): 
    __tablename__ = 'sensor_data'
    id = db.Column(db.Integer, primary_key=True)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    value = db.Column(db.Float, nullable=False)
    sensors_id = db.Column(db.Integer, db.ForeignKey('sensors.id'), nullable=False)
    units_id = db.Column(db.Integer, db.ForeignKey('units.id'), nullable=False)

    # NEW: Direct link to Greenhouse for easier querying of all data for a greenhouse
    # This is denormalization but can simplify queries significantly.
    # If you prefer strict normalization, you'd always join through Sensor.
    greenhouse_id_direct = db.Column(db.Integer, db.ForeignKey('greenhouses.id'), nullable=True) # Nullable if some data isn't directly tied

    # ... (__repr__)
    def __repr__(self):
        return f'<SensorData {self.value} for Sensor {self.sensors_id} at {self.timestamp}>'


class Unit(db.Model):
    __tablename__ = 'units'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(30), nullable=False)
    symbol = db.Column(db.String(10), nullable=False)
    datatype = db.Column(db.String(30), nullable=True)
    sensor_data_items = db.relationship('SensorData', backref='unit', lazy=True)
    # ... (__repr__)
    def __repr__(self):
        return f'<Unit {self.name} ({self.symbol})>'


class Actuator(db.Model):
    __tablename__ = 'actuators'
    id = db.Column(db.Integer, primary_key=True)
    type = db.Column(db.String(30), nullable=False)
    location = db.Column(db.String(50), nullable=False)
    plants_id = db.Column(db.Integer, db.ForeignKey('plants.id'), nullable=True)
    
    # NEW: Foreign Key to Greenhouse
    greenhouse_id = db.Column(db.Integer, db.ForeignKey('greenhouses.id'), nullable=False)

    actuators_log = db.relationship('ActuatorLog', backref='actuator', lazy=True)
    # ... (__repr__)
    def __repr__(self):
        return f'<Actuator {self.type} at {self.location}>'


class ActuatorLog(db.Model): 
    __tablename__ = 'actuators_log'
    id = db.Column(db.Integer, primary_key=True)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    action = db.Column(db.String(30), nullable=False)
    actuators_id = db.Column(db.Integer, db.ForeignKey('actuators.id'), nullable=False)
    # ... (__repr__)
    def __repr__(self):
        return f'<ActuatorLog {self.action} for Actuator {self.actuators_id} at {self.timestamp}>'