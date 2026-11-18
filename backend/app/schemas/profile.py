from typing import Optional
from datetime import date, datetime
from pydantic import BaseModel, EmailStr, Field, ConfigDict


class TeamBase(BaseModel):
    name: str = Field(..., max_length=100)
    code: str = Field(..., max_length=20)
    description: Optional[str] = None


class TeamCreate(TeamBase):
    pass


class TeamResponse(TeamBase):
    id: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ProfileBase(BaseModel):
    employee_id: str = Field(..., min_length=8, max_length=8, pattern=r"^\d{8}$", description="8-digit Employee ID")
    full_name: str = Field(..., min_length=2, max_length=255)
    email: EmailStr
    designation: str = Field(..., min_length=2, max_length=100)
    team_id: Optional[str] = None
    joining_date: date
    role: str = Field(default="EMPLOYEE", pattern=r"^(ADMIN|TL|CO|EMPLOYEE)$")
    supervisor_id: Optional[str] = None
    is_active: bool = True


class ProfileCreate(ProfileBase):
    id: Optional[str] = None  # If passing Supabase auth.users.id directly


class ProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    designation: Optional[str] = None
    team_id: Optional[str] = None
    joining_date: Optional[date] = None
    role: Optional[str] = None
    supervisor_id: Optional[str] = None
    is_active: Optional[bool] = None


class ProfileResponse(ProfileBase):
    id: str
    team: Optional[TeamResponse] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class SubordinateResponse(BaseModel):
    id: str
    employee_id: str
    full_name: str
    email: str
    designation: str
    role: str
    team_id: Optional[str] = None
    team_name: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)
