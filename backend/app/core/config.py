import os
from typing import Optional
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # Supabase configuration
    SUPABASE_URL: str = "https://your-supabase-project.supabase.co"
    SUPABASE_ANON_KEY: str = "your-supabase-anon-key"
    SUPABASE_SERVICE_ROLE_KEY: str = "your-supabase-service-role-key"
    SUPABASE_DB_URL: Optional[str] = None
    JWT_SECRET: Optional[str] = "super-secret-jwt-token-with-at-least-32-bytes-long"

    # API configuration
    API_V1_PREFIX: str = "/api/v1"
    PROJECT_NAME: str = "Manual Monthly Scorecard System"
    APP_TIMEZONE: str = "Asia/Dhaka"
    
    # CORS
    CORS_ORIGINS: list[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
        "http://127.0.0.1:8000"
    ]

    model_config = SettingsConfigDict(
        env_file=os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), ".env"),
        env_file_encoding="utf-8",
        extra="ignore"
    )


settings = Settings()
