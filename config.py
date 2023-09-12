import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

DATA_FOLDER = os.path.join(BASE_DIR, "static", "data")
DATA_FOLDER = os.environ.get("APP_DATA_FOLDER", DATA_FOLDER)