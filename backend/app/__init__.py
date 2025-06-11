from flask import Flask
from flask_cors import CORS
from .config import Config       
from .database import db, migrate 
import os
from flask_jwt_extended import JWTManager

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    db.init_app(app)
    migrate.init_app(app, db)
    CORS(app, resources={r"/api/*": {"origins": "http://localhost:5173"}})

    jwt = JWTManager(app)

    from .routes.auth import auth_bp   
    from .routes.api import api_bp    
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(api_bp, url_prefix='/api')

    return app