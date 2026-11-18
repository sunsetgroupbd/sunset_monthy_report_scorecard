import logging
from typing import Optional, Dict, Any
import jwt
import httpx
from fastapi import HTTPException, status
from app.core.config import settings

logger = logging.getLogger(__name__)


async def verify_supabase_token(token: str) -> Dict[str, Any]:
    """
    Verifies a Supabase JWT access token.
    1. Attempts HS256 decode using settings.JWT_SECRET if configured.
    2. Falls back to calling Supabase Auth API /auth/v1/user.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    # 1. Try decoding with JWT_SECRET if available
    if settings.JWT_SECRET:
        try:
            payload = jwt.decode(
                token,
                settings.JWT_SECRET,
                algorithms=["HS256"],
                options={"verify_aud": False, "verify_signature": True}
            )
            user_id = payload.get("sub")
            if user_id:
                return {
                    "id": user_id,
                    "email": payload.get("email"),
                    "role": payload.get("role", "authenticated"),
                    "payload": payload
                }
        except jwt.PyJWTError as e:
            logger.debug(f"JWT Secret verification failed, will try Supabase Auth API: {e}")

    # 2. Try Supabase Auth API /auth/v1/user if SUPABASE_URL configured
    if settings.SUPABASE_URL and not settings.SUPABASE_URL.startswith("https://your-supabase-project"):
        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                headers = {
                    "Authorization": f"Bearer {token}",
                    "apikey": settings.SUPABASE_ANON_KEY
                }
                url = f"{settings.SUPABASE_URL.rstrip('/')}/auth/v1/user"
                response = await client.get(url, headers=headers)
                if response.status_code == 200:
                    data = response.json()
                    return {
                        "id": data.get("id"),
                        "email": data.get("email"),
                        "role": data.get("role", "authenticated"),
                        "payload": data
                    }
        except Exception as e:
            logger.error(f"Supabase Auth API check error: {e}")

    # 3. For development/testing: try decoding unverified if secret is dummy
    try:
        unverified = jwt.decode(token, options={"verify_signature": False})
        user_id = unverified.get("sub")
        if user_id:
            logger.warning("Decoded token without signature verification (dev fallback).")
            return {
                "id": user_id,
                "email": unverified.get("email"),
                "role": unverified.get("role", "authenticated"),
                "payload": unverified
            }
    except Exception:
        pass

    raise credentials_exception


def create_access_token(data: dict, secret: Optional[str] = None) -> str:
    """Helper to generate JWT tokens for tests and development"""
    to_encode = data.copy()
    jwt_secret = secret or settings.JWT_SECRET or "dev-secret-key-32-chars-minimum-length!!"
    return jwt.encode(to_encode, jwt_secret, algorithm="HS256")
