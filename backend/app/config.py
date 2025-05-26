from dotenv import load_dotenv
import os

load_dotenv()

class Config:
    SECRET_KEY = os.getenv('klaproosjebloei')
    SQLALCHEMY_DATABASE_URI = os.getenv('postgresql://Penny2312:klaproosje123@192.168.1.179:5432/groeibloei')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
