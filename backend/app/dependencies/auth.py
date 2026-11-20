from datetime import date
from typing import List, Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import verify_supabase_token
from app.models.models import Profile, Team

security = HTTPBearer(auto_error=True)


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> Profile:
    token = credentials.credentials
    token_data = await verify_supabase_token(token)
    user_id = token_data.get("id")
    email = token_data.get("email")

    profile = db.query(Profile).filter(Profile.id == user_id).first()
    if not profile and email:
        # Check by email as a fallback if IDs haven't synced
        profile = db.query(Profile).filter(Profile.email == email).first()

    raw_meta = token_data.get("payload", {}).get("user_metadata", {}) or {}
    meta_role = raw_meta.get("role")
    meta_designation = raw_meta.get("designation")
    meta_fullname = raw_meta.get("full_name")
    meta_empid = raw_meta.get("employee_id")

    # If profile exists, sync designation, full name, employee_id, and role with Supabase user_metadata
    if profile:
        changed = False
        if meta_designation and profile.designation != meta_designation:
            profile.designation = meta_designation
            changed = True
        if meta_fullname and profile.full_name != meta_fullname:
            profile.full_name = meta_fullname
            changed = True
        if meta_empid and profile.employee_id != meta_empid:
            existing_emp = db.query(Profile).filter(Profile.employee_id == meta_empid, Profile.id != profile.id).first()
            if not existing_emp:
                profile.employee_id = meta_empid
                changed = True
        
        # Only true superadmins get ADMIN role
        if email and email.lower() in ("admin@scorecard.com", "sunsetgroupbd@gmail.com"):
            target_role = "ADMIN"
        elif meta_role in ("ADMIN", "TL", "CO", "EMPLOYEE"):
            target_role = meta_role
        else:
            target_role = profile.role or "EMPLOYEE"

        if profile.role != target_role:
            profile.role = target_role
            changed = True

        if changed:
            try:
                db.commit()
                db.refresh(profile)
            except Exception:
                db.rollback()

    # If profile still does not exist, auto-provision profile using metadata
    if not profile and email:
        try:
            count = db.query(Profile).count()
            emp_id = meta_empid or str(10000001 + count)
            while db.query(Profile).filter(Profile.employee_id == emp_id).first():
                count += 1
                emp_id = str(10000001 + count)

            if email.lower() in ("admin@scorecard.com", "sunsetgroupbd@gmail.com"):
                role = "ADMIN"
            elif meta_role in ("ADMIN", "TL", "CO", "EMPLOYEE"):
                role = meta_role
            else:
                role = "EMPLOYEE"

            first_team = db.query(Team).first()
            team_id = first_team.id if first_team else None
            full_name = meta_fullname or email.split("@")[0].replace(".", " ").title()
            designation = meta_designation or ("Administrator" if role == "ADMIN" else "Relationship Officer")

            profile = Profile(
                id=user_id,
                employee_id=emp_id,
                full_name=full_name,
                email=email,
                designation=designation,
                team_id=team_id,
                joining_date=date.today(),
                role=role,
                is_active=True
            )
            db.add(profile)
            db.commit()
            db.refresh(profile)
        except Exception:
            db.rollback()
            profile = db.query(Profile).filter((Profile.id == user_id) | (Profile.email == email)).first()

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
