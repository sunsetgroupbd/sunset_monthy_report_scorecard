import uuid
from datetime import datetime, timezone
from sqlalchemy import (
    Column, String, Boolean, Date, DateTime, Numeric, Integer, Text, ForeignKey, UniqueConstraint
)
from sqlalchemy.orm import relationship
from app.core.database import Base


def generate_uuid() -> str:
    return str(uuid.uuid4())


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


class Team(Base):
    __tablename__ = "teams"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    name = Column(String(100), nullable=False, unique=True)
    code = Column(String(20), nullable=False, unique=True)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now, nullable=False)

    profiles = relationship("Profile", back_populates="team")


class Profile(Base):
    __tablename__ = "profiles"

    id = Column(String(36), primary_key=True, default=generate_uuid)  # matches auth.users.id
    employee_id = Column(String(8), nullable=False, unique=True, index=True)
    full_name = Column(String(255), nullable=False)
    email = Column(String(255), nullable=False, unique=True, index=True)
    designation = Column(String(100), nullable=False)
    team_id = Column(String(36), ForeignKey("teams.id", ondelete="SET NULL"), nullable=True)
    joining_date = Column(Date, nullable=False)
    role = Column(String(20), nullable=False, default="EMPLOYEE", index=True)  # ADMIN, TL, CO, EMPLOYEE
    supervisor_id = Column(String(36), ForeignKey("profiles.id", ondelete="SET NULL"), nullable=True)
    is_active = Column(Boolean, nullable=False, default=True)
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now, nullable=False)

    team = relationship("Team", back_populates="profiles")
    supervisor = relationship("Profile", remote_side=[id], backref="subordinates")
    scorecards = relationship("ManualScorecard", back_populates="employee", cascade="all, delete-orphan", foreign_keys="ManualScorecard.employee_id")


class ManualScorecard(Base):
    __tablename__ = "manual_scorecards"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    employee_id = Column(String(36), ForeignKey("profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    month = Column(Date, nullable=False)  # stored as YYYY-MM-01
    status = Column(String(20), nullable=False, default="DRAFT", index=True)  # DRAFT, SUBMITTED, APPROVED, CLOSED

    # Target (BDT)
    target = Column(Numeric(15, 2), nullable=False, default=0.0)

    # Attendance
    planned_leave = Column(Numeric(5, 2), nullable=False, default=0.0)
    unauthorized_leave = Column(Numeric(5, 2), nullable=False, default=0.0)
    working_days = Column(Numeric(5, 2), nullable=False, default=0.0)

    # Forecast (BDT)
    prediction_amount = Column(Numeric(15, 2), nullable=False, default=0.0)

    # Supervisor-only fields
    sheet_score = Column(Numeric(6, 2), nullable=True)
    call_score = Column(Numeric(6, 2), nullable=True)
    marking = Column(Numeric(5, 2), nullable=True)  # 0 to 100
    supervisor_notes = Column(Text, nullable=True)

    # Portfolio Due Snapshot (EMI)
    emi_due_monthly = Column(Numeric(15, 2), nullable=False, default=0.0)
    emi_client_count = Column(Integer, nullable=False, default=0)
    emi_hold_count = Column(Integer, nullable=False, default=0)
    emi_cancel_count = Column(Integer, nullable=False, default=0)

    # Portfolio Due Snapshot (TB)
    tb_due_amount = Column(Numeric(15, 2), nullable=False, default=0.0)
    tb_client_count = Column(Integer, nullable=False, default=0)
    tb_share_count = Column(Integer, nullable=False, default=0)
    tb_hold_count = Column(Integer, nullable=False, default=0)
    tb_cancel_count = Column(Integer, nullable=False, default=0)

    # Workflow timestamps
    submitted_at = Column(DateTime(timezone=True), nullable=True)
    submitted_by_id = Column(String(36), ForeignKey("profiles.id"), nullable=True)
    approved_at = Column(DateTime(timezone=True), nullable=True)
    approved_by_id = Column(String(36), ForeignKey("profiles.id"), nullable=True)
    closed_at = Column(DateTime(timezone=True), nullable=True)
    closed_by_id = Column(String(36), ForeignKey("profiles.id"), nullable=True)

    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now, nullable=False)

    __table_args__ = (
        UniqueConstraint("employee_id", "month", name="uq_manual_scorecard_employee_month"),
    )

    employee = relationship("Profile", back_populates="scorecards", foreign_keys=[employee_id])
    periods = relationship("ManualScorecardPeriod", back_populates="scorecard", cascade="all, delete-orphan", order_by="ManualScorecardPeriod.period_index")
    customers = relationship("ManualScorecardCustomer", back_populates="scorecard", cascade="all, delete-orphan", order_by="ManualScorecardCustomer.created_at")
    audit_logs = relationship("ManualScorecardAuditLog", back_populates="scorecard", cascade="all, delete-orphan", order_by="ManualScorecardAuditLog.created_at.desc()")


class ManualScorecardPeriod(Base):
    __tablename__ = "manual_scorecard_periods"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    scorecard_id = Column(String(36), ForeignKey("manual_scorecards.id", ondelete="CASCADE"), nullable=False, index=True)
    period_index = Column(Integer, nullable=False)  # 0 for Target, 1-5 for weekly periods

    # Financial Collections
    new_sales = Column(Numeric(15, 2), nullable=False, default=0.0)
    tb_amount = Column(Numeric(15, 2), nullable=False, default=0.0)
    emi_amount = Column(Numeric(15, 2), nullable=False, default=0.0)
    total_collection = Column(Numeric(15, 2), nullable=False, default=0.0)
    total_collection_override = Column(Numeric(15, 2), nullable=True)
    total_achieved_override = Column(Numeric(15, 2), nullable=True)

    # Lead Pipeline
    total_leads = Column(Integer, nullable=False, default=0)
    fair_leads = Column(Integer, nullable=False, default=0)
    fb_leads = Column(Integer, nullable=False, default=0)
    hp = Column(Integer, nullable=False, default=0)
    p = Column(Integer, nullable=False, default=0)
    fup = Column(Integer, nullable=False, default=0)

    # Activity Metrics
    dialed_calls = Column(Integer, nullable=False, default=0)
    connected_calls = Column(Integer, nullable=False, default=0)
    outdoor_visits = Column(Integer, nullable=False, default=0)
    indoor_cx = Column(Integer, nullable=False, default=0)
    meeting_hours = Column(Numeric(6, 2), nullable=False, default=0.0)

    # Lead Pipeline & Results (From Scorecard Report)
    hold = Column(Integer, nullable=True, default=0)
    cancel = Column(Integer, nullable=True, default=0)
    sold_fair_leads = Column(Integer, nullable=True, default=0)
    sold_fb_leads = Column(Integer, nullable=True, default=0)
    sold_other_leads = Column(Integer, nullable=True, default=0)

    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now, nullable=False)

    __table_args__ = (
        UniqueConstraint("scorecard_id", "period_index", name="uq_scorecard_period"),
    )

    scorecard = relationship("ManualScorecard", back_populates="periods")


class ManualScorecardCustomer(Base):
    __tablename__ = "manual_scorecard_customers"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    scorecard_id = Column(String(36), ForeignKey("manual_scorecards.id", ondelete="CASCADE"), nullable=False, index=True)
    customer_name = Column(String(255), nullable=False)
    cx_type = Column(String(50), nullable=False, default="New Sales")  # New Sales, TB, EMI
    payment_type = Column(String(50), nullable=False, default="Paid")  # Payable Amount, Paid
    amount = Column(Numeric(15, 2), nullable=False, default=0.0)
    payment_date = Column(Date, nullable=True)
    payment_status = Column(String(50), nullable=False, default="Paid")  # Paid, Pending
    paid_amount = Column(Numeric(15, 2), nullable=False, default=0.0)
    unpaid_amount = Column(Numeric(15, 2), nullable=False, default=0.0)
    collection_date = Column(Date, nullable=True)
    next_collection_date = Column(Date, nullable=True)
    next_collection_date_2 = Column(Date, nullable=True)
    date_1 = Column(Date, nullable=True)
    date_2 = Column(Date, nullable=True)
    in_out_plan = Column(String(100), nullable=True)
    new_sales_amount = Column(Numeric(15, 2), nullable=False, default=0.0)
    tb_amount = Column(Numeric(15, 2), nullable=False, default=0.0)
    emi_amount = Column(Numeric(15, 2), nullable=False, default=0.0)
    total_collection = Column(Numeric(15, 2), nullable=False, default=0.0)
    lead_status = Column(String(50), nullable=False, default="HP")  # HP, P, Fup, Cancel, Hold, Next Month, Next Year, NR
    collection_probability = Column(Integer, nullable=False, default=50)  # 10 to 100
    remarks = Column(Text, nullable=True)

    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now, nullable=False)

    scorecard = relationship("ManualScorecard", back_populates="customers")


class ManualScorecardAuditLog(Base):
    __tablename__ = "manual_scorecard_audit_logs"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    scorecard_id = Column(String(36), ForeignKey("manual_scorecards.id", ondelete="CASCADE"), nullable=False, index=True)
    changed_by_id = Column(String(36), ForeignKey("profiles.id"), nullable=False)
    previous_status = Column(String(20), nullable=True)
    new_status = Column(String(20), nullable=True)
    action = Column(String(50), nullable=False)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)

    scorecard = relationship("ManualScorecard", back_populates="audit_logs")
    changed_by = relationship("Profile")
