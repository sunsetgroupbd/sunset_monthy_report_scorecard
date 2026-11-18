from typing import Optional, List
from datetime import date, datetime
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.core.database import get_db
from app.dependencies.auth import get_current_user, require_role, check_employee_access
from app.models.models import Profile, ManualScorecard
from app.schemas.scorecard import (
    ScorecardUpsertRequest,
    ScorecardStatusUpdateRequest,
    ScorecardResponse
)
from app.schemas.profile import SubordinateResponse, ProfileResponse
from app.repositories.scorecard_repo import ScorecardRepository
from app.services.scorecard_service import ScorecardService

router = APIRouter(prefix="/manual-scorecard", tags=["Manual Scorecard"])


def parse_month_query(month_str: str) -> date:
    try:
        if len(month_str) == 7:  # YYYY-MM
            parts = month_str.split("-")
            return date(int(parts[0]), int(parts[1]), 1)
        return ScorecardService.normalize_month(date.fromisoformat(month_str))
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid month format: '{month_str}'. Expected 'YYYY-MM' or 'YYYY-MM-DD'."
        )


@router.get("", response_model=ScorecardResponse)
def get_scorecard(
    employee_id: str = Query(..., description="UUID or 8-digit Employee ID"),
    month: str = Query(..., description="Month in YYYY-MM format"),
    current_user: Profile = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get full scorecard for an employee and month.
    If it does not exist, returns an initialized empty DRAFT scorecard structure.
    """
    if not check_employee_access(current_user, employee_id, db):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not authorized to view this employee's scorecard."
        )

    target_month = parse_month_query(month)

    # Find target employee profile
    target_profile = db.query(Profile).filter(
        or_(Profile.id == employee_id, Profile.employee_id == employee_id)
    ).first()

    if not target_profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Employee '{employee_id}' not found."
        )

    scorecard = ScorecardRepository.get_by_employee_and_month(db, target_profile.id, target_month)

    if not scorecard:
        # Return initialized empty DRAFT structure
        return ScorecardService.construct_empty_scorecard(target_profile, target_month, current_user)

    return ScorecardRepository.format_scorecard_response(scorecard, current_user)


@router.put("", response_model=ScorecardResponse)
def upsert_scorecard(
    payload: ScorecardUpsertRequest,
    current_user: Profile = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Create or update scorecard in a single atomic database transaction.
    """
    if not check_employee_access(current_user, payload.employee_id, db):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not authorized to edit this employee's scorecard."
        )

    scorecard = ScorecardRepository.atomic_upsert(db, payload, current_user)
    # Reload with full relationships
    reloaded = ScorecardRepository.get_by_id(db, scorecard.id)
    return ScorecardRepository.format_scorecard_response(reloaded, current_user)


@router.post("/{scorecard_id}/status", response_model=ScorecardResponse)
def update_scorecard_status(
    scorecard_id: str,
    payload: ScorecardStatusUpdateRequest,
    current_user: Profile = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update scorecard workflow status with validation and audit trail.
    """
    scorecard = ScorecardRepository.get_by_id(db, scorecard_id)
    if not scorecard:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Scorecard '{scorecard_id}' not found."
        )

    if not check_employee_access(current_user, scorecard.employee_id, db):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not authorized to change the status of this scorecard."
        )

    updated_sc = ScorecardRepository.update_status(
        db,
        scorecard_id=scorecard_id,
        new_status=payload.status,
        current_user=current_user,
        notes=payload.notes
    )

    return ScorecardRepository.format_scorecard_response(updated_sc, current_user)


@router.get("/subordinates", response_model=List[SubordinateResponse])
def get_subordinates(
    current_user: Profile = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Return list of employees accessible to the authenticated user.
    """
    if current_user.role == "ADMIN":
        query = db.query(Profile).filter(Profile.is_active == True).order_by(Profile.full_name)
    elif current_user.role in ("TL", "CO"):
        query = db.query(Profile).filter(
            Profile.is_active == True,
            or_(
                Profile.id == current_user.id,
                Profile.supervisor_id == current_user.id,
                (Profile.team_id == current_user.team_id) if current_user.team_id else False
            )
        ).order_by(Profile.full_name)
    else:  # EMPLOYEE
        query = db.query(Profile).filter(Profile.id == current_user.id)

    profiles = query.all()
    results = []
    for p in profiles:
        team_name = p.team.name if p.team else None
        results.append(SubordinateResponse(
            id=p.id,
            employee_id=p.employee_id,
            full_name=p.full_name,
            email=p.email,
            designation=p.designation,
            role=p.role,
            team_id=p.team_id,
            team_name=team_name
        ))
    return results


@router.get("/employees", response_model=List[ProfileResponse])
def get_all_employees(
    current_user: Profile = Depends(require_role(["ADMIN"])),
    db: Session = Depends(get_db)
):
    """
    Admin-only endpoint returning all employee profiles.
    """
    profiles = db.query(Profile).order_by(Profile.full_name).all()
    return profiles


@router.get("/months", response_model=List[str])
def get_available_months(
    current_user: Profile = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Return available scorecard months formatted as YYYY-MM.
    Includes existing scorecard months plus rolling 12 months.
    """
    db_months = db.query(ManualScorecard.month).distinct().all()
    existing = {m[0].strftime("%Y-%m") for m in db_months if m[0]}

    # Rolling past 12 months to next 2 months
    today = date.today()
    rolling = []
    for offset in range(-12, 3):
        # Calculate year and month
        y = today.year + (today.month + offset - 1) // 12
        m = (today.month + offset - 1) % 12 + 1
        rolling.append(f"{y:04d}-{m:02d}")

    all_months = sorted(list(existing.union(set(rolling))), reverse=True)
    return all_months
