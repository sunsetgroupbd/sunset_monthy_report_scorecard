from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.dependencies.auth import get_current_user, require_role
from app.models.models import Profile, Team, generate_uuid
from app.schemas.profile import (
    ProfileResponse,
    ProfileCreate,
    ProfileUpdate,
    TeamResponse,
    TeamCreate
)

router = APIRouter(prefix="/users", tags=["Users & Teams"])


@router.get("/me", response_model=ProfileResponse)
def get_my_profile(current_user: Profile = Depends(get_current_user)):
    """Return the profile of the currently authenticated user."""
    return current_user


@router.get("", response_model=List[ProfileResponse])
def list_users(
    current_user: Profile = Depends(require_role(["ADMIN"])),
    db: Session = Depends(get_db)
):
    """Admin-only: list all profiles."""
    return db.query(Profile).order_by(Profile.employee_id).all()


@router.post("", response_model=ProfileResponse, status_code=status.HTTP_201_CREATED)
def create_user_profile(
    payload: ProfileCreate,
    current_user: Profile = Depends(require_role(["ADMIN"])),
    db: Session = Depends(get_db)
):
    """Admin-only: create a new employee profile."""
    existing_emp = db.query(Profile).filter(Profile.employee_id == payload.employee_id).first()
    if existing_emp:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Employee ID '{payload.employee_id}' is already registered."
        )

    existing_email = db.query(Profile).filter(Profile.email == payload.email).first()
    if existing_email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Email '{payload.email}' is already in use."
        )

    profile = Profile(
        id=payload.id or generate_uuid(),
        employee_id=payload.employee_id,
        full_name=payload.full_name,
        email=payload.email,
        designation=payload.designation,
        team_id=payload.team_id,
        joining_date=payload.joining_date,
        role=payload.role,
        supervisor_id=payload.supervisor_id,
        is_active=payload.is_active
    )
    db.add(profile)
    db.commit()
    db.refresh(profile)
    return profile


@router.put("/{profile_id}", response_model=ProfileResponse)
def update_user_profile(
    profile_id: str,
    payload: ProfileUpdate,
    current_user: Profile = Depends(require_role(["ADMIN"])),
    db: Session = Depends(get_db)
):
    """Admin-only: update user profile."""
    profile = db.query(Profile).filter(Profile.id == profile_id).first()
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Profile '{profile_id}' not found."
        )

    update_data = payload.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(profile, field, value)

    db.commit()
    db.refresh(profile)
    return profile


# Teams router mounted on the same router or exported
teams_router = APIRouter(prefix="/teams", tags=["Teams"])


@teams_router.get("", response_model=List[TeamResponse])
def list_teams(
    current_user: Profile = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """List all teams."""
    return db.query(Team).order_by(Team.name).all()


@teams_router.post("", response_model=TeamResponse, status_code=status.HTTP_201_CREATED)
def create_team(
    payload: TeamCreate,
    current_user: Profile = Depends(require_role(["ADMIN"])),
    db: Session = Depends(get_db)
):
    """Admin-only: create a team."""
    existing = db.query(Team).filter(
        (Team.name == payload.name) | (Team.code == payload.code)
    ).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A team with this name or code already exists."
        )

    team = Team(
        id=generate_uuid(),
        name=payload.name,
        code=payload.code,
        description=payload.description
    )
    db.add(team)
    db.commit()
    db.refresh(team)
    return team
