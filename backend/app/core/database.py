import os
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from app.core.config import settings

db_url = settings.SUPABASE_DB_URL

if db_url and db_url.startswith("postgres://"):
    db_url = db_url.replace("postgres://", "postgresql://", 1)

if not db_url or "YOUR_DB_PASSWORD" in db_url:
    # Local fallback for development and Docker if Supabase DB URL is not provided or has placeholder
    base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    local_db_path = os.path.join(base_dir, "scorecard_local.db")
    
    # If local_db_path was created as a directory (common Docker volume mount accident on Linux), handle safely
    if os.path.exists(local_db_path) and os.path.isdir(local_db_path):
        db_file = os.path.join(local_db_path, "scorecard.db")
    else:
        db_file = local_db_path

    # Ensure parent directory exists
    parent_dir = os.path.dirname(os.path.abspath(db_file))
    if parent_dir:
        os.makedirs(parent_dir, exist_ok=True)

    clean_path = os.path.abspath(db_file).replace(os.sep, "/")
    if not clean_path.startswith("/"):
        clean_path = "/" + clean_path
    db_url = f"sqlite://{clean_path}"

connect_args = {}
if "sqlite" in db_url:
    connect_args = {"check_same_thread": False}

engine = create_engine(
    db_url,
    pool_pre_ping=True,
    connect_args=connect_args
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
