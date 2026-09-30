import os

from dotenv import load_dotenv

load_dotenv()

BASE_DIR = os.path.abspath(os.path.dirname(__file__))
PROJECT_ROOT = os.path.dirname(BASE_DIR)


class Config:
    SECRET_KEY = os.environ.get("SECRET_KEY") or "dev-only-change-me"

    SQLALCHEMY_DATABASE_URI = os.environ.get("DATABASE_URL") or (
        "postgresql+psycopg://postgres:postgres@localhost:5432/construction_erp"
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    UPLOAD_FOLDER = os.environ.get(
        "UPLOAD_FOLDER", os.path.join(PROJECT_ROOT, "uploads")
    )
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024

    ALLOWED_EXTENSIONS = {
        "pdf", "png", "jpg", "jpeg", "gif", "doc", "docx",
        "xls", "xlsx", "csv", "txt", "zip",
    }

    PROJECT_STATUSES = ["active", "on-hold", "completed"]

    SESSION_COOKIE_HTTPONLY = True
    SESSION_COOKIE_SAMESITE = "Lax"
    SESSION_COOKIE_SECURE = os.environ.get("SESSION_COOKIE_SECURE") == "1"

    TEMPLATES_AUTO_RELOAD = True
    SEND_FILE_MAX_AGE_DEFAULT = 0
