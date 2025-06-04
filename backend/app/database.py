# Webapp/backend/app/database.py
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate # Keep Migrate import here

# Instantiate SQLAlchemy and Migrate globally
# These objects will be configured with the app in __init__.py
db = SQLAlchemy()
migrate = Migrate()