# Webapp/backend/app/__init__.py
from flask import Flask
from flask_cors import CORS
from .config import Config
from .database import db, migrate # This import should now work
import os

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # Initialize Flask extensions with the app instance
    db.init_app(app)
    migrate.init_app(app, db) 
    CORS(app, supports_credentials=True, origins=Config.FRONTEND_URL)

    # Register blueprints for routes
    from .routes.auth import auth_bp
    from .routes.api import api_bp
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(api_bp, url_prefix='/api')

    # No db.create_all() here; rely on migrations
    return app