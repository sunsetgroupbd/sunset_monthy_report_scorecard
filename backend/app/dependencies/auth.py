from typing import List, Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import verify_supabase_token
from app.models.models import Profile

security = HTTPBearer(auto_error=True)


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> Profile:
    token = credentials.credentials
    token_data = await verify_supabase_token(token)
    user_id = token_data.get("id")

    profile = db.query(Profile).filter(Profile.id == user_id).first()
    if not profile:
        # Check by email as a fallback if IDs haven't synced
        email = token_data.get("email")
        if email:
            profile = db.query(Profile).filter(Profile.email == email).first()

    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User profile not found in system. Please contact an Administrator to set up your profile."
        )

    if not profile.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your account has been deactivated."
        )

    return profile


def require_role(allowed_roles: List[str]):
    def role_checker(current_user: Profile = Depends(get_current_user)) -> Profile:
        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied. Required role in {allowed_roles}, your role is {current_user.role}."
            )
        return current_user
    return role_checker


def check_employee_access(current_user: Profile, target_employee_id: str, db: Session) -> bool:
    """
    Checks if current_user is authorized to view or manage target_employee_id.
    target_employee_id can be profile.id (UUID) or profile.employee_id (8-digit).
    """
    if current_user.role == "ADMIN":
        return True

    target_profile = db.query(Profile).filter(
        (Profile.id == target_employee_id) | (Profile.employee_id == target_employee_id)
    ).first()

    if not target_profile:
        return False

    # Users can always access their own
    if target_profile.id == current_user.id:
        return True

    # EMPLOYEE role cannot access any other employee's scorecard
    if current_user.role == "EMPLOYEE":
        return False

    # TL and CO role can access their direct subordinates or same team members
    if current_user.role in ("TL", "CO"):
        # Check if direct supervisor
        if target_profile.supervisor_id == current_user.id:
            return True
        # Check if member of the same team
        if current_user.team_id and target_profile.team_id == current_user.team_id:
            return True

    return False
