import os
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from app.core.config import settings

db_url = settings.SUPABASE_DB_URL

if db_url and db_url.startswith("postgres://"):
    db_url = db_url.replace("postgres://", "postgresql://", 1)

if not db_url or "YOUR_DB_PASSWORD" in db_url:
    # Local fallback for development and tests if Supabase DB URL is not provided or still has placeholder
    db_url = "sqlite:///./scorecard_local.db"

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
