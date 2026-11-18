from datetime import datetime, timedelta, timezone
from typing import Optional
from pydantic import BaseModel, EmailStr
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import create_access_token
from app.models.models import Profile

router = APIRouter(prefix="/auth", tags=["Auth Helper"])


class DevTokenRequest(BaseModel):
    email: EmailStr


class DevTokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    profile_id: str
    email: str
    role: str
    full_name: str


@router.post("/dev-token", response_model=DevTokenResponse)
def generate_dev_token(payload: DevTokenRequest, db: Session = Depends(get_db)):
    """
    Development/testing helper: generates a signed JWT token matching a profile email.
    """
    profile = db.query(Profile).filter(Profile.email == payload.email).first()
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with email '{payload.email}' not found."
        )

    exp = datetime.now(timezone.utc) + timedelta(days=7)
    token_claims = {
        "sub": profile.id,
        "email": profile.email,
        "role": "authenticated",
        "exp": int(exp.timestamp())
    }
    token = create_access_token(token_claims)

    return DevTokenResponse(
        access_token=token,
        profile_id=profile.id,
        email=profile.email,
        role=profile.role,
        full_name=profile.full_name
    )
