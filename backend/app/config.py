# backend/app/config.py
import os

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') # From .env
    
    # Only ONE primary database URL is needed. This will point to 'groeibloei'.
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or \
                              'postgresql://Penny2312:klaproosje123@localhost:5432/groeibloei' 


    SQLALCHEMY_TRACK_MODIFICATIONS = False

    FRONTEND_URL = os.environ.get('FRONTEND_URL') or 'http://localhost:5173'