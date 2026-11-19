from typing import Optional, List
from datetime import date, datetime
from decimal import Decimal
from pydantic import BaseModel, Field, ConfigDict
from app.schemas.profile import ProfileResponse


class PeriodMetrics(BaseModel):
    # Financial Collections
    new_sales: Decimal = Field(default=Decimal("0.00"), ge=0)
    tb_amount: Decimal = Field(default=Decimal("0.00"), ge=0)
    emi_amount: Decimal = Field(default=Decimal("0.00"), ge=0)
    total_collection: Decimal = Field(default=Decimal("0.00"), ge=0)
    total_collection_override: Optional[Decimal] = Field(default=None, ge=0)
    total_achieved_override: Optional[Decimal] = Field(default=None, ge=0)

    # Lead Pipeline
    total_leads: int = Field(default=0, ge=0)
    fair_leads: int = Field(default=0, ge=0)
    fb_leads: int = Field(default=0, ge=0)
    hp: int = Field(default=0, ge=0)
    p: int = Field(default=0, ge=0)
    fup: int = Field(default=0, ge=0)

    # Activity Metrics
    dialed_calls: int = Field(default=0, ge=0)
    connected_calls: int = Field(default=0, ge=0)
    outdoor_visits: int = Field(default=0, ge=0)
    indoor_cx: int = Field(default=0, ge=0)
    meeting_hours: Decimal = Field(default=Decimal("0.0"), ge=0)

    # Lead Pipeline & Results (From Scorecard Report)
    hold: int = Field(default=0, ge=0)
    cancel: int = Field(default=0, ge=0)
    sold_fair_leads: int = Field(default=0, ge=0)
    sold_fb_leads: int = Field(default=0, ge=0)
    sold_other_leads: int = Field(default=0, ge=0)

    model_config = ConfigDict(from_attributes=True)


class PeriodItem(PeriodMetrics):
    id: Optional[str] = None
    period_index: int = Field(..., ge=0, le=10, description="0=Target, 1..6=Period intervals (Till 5th..30/31st), 7..9=Prior Months")


class CustomerItem(BaseModel):
    id: Optional[str] = None
    customer_name: str = Field(..., min_length=1, max_length=255)
    cx_type: Optional[str] = Field(default="New Sales", description="New Sales, TB, EMI")
    payment_type: Optional[str] = Field(default="Paid", description="Payable Amount, Paid")
    amount: Decimal = Field(default=Decimal("0.00"), ge=0)
    payment_date: Optional[date] = None
    payment_status: Optional[str] = Field(default="Paid", description="Paid, Pending")
    paid_amount: Decimal = Field(default=Decimal("0.00"), ge=0)
    unpaid_amount: Decimal = Field(default=Decimal("0.00"), ge=0)
    collection_date: Optional[date] = None
    next_collection_date: Optional[date] = None
    next_collection_date_2: Optional[date] = None
    date_1: Optional[date] = None
    date_2: Optional[date] = None
    in_out_plan: Optional[str] = Field(default="In Plan", max_length=100)
    new_sales_amount: Decimal = Field(default=Decimal("0.00"), ge=0)
    tb_amount: Decimal = Field(default=Decimal("0.00"), ge=0)
    emi_amount: Decimal = Field(default=Decimal("0.00"), ge=0)
    total_collection: Decimal = Field(default=Decimal("0.00"), ge=0)
    lead_status: str = Field(default="HP", description="HP, P, Fup, Cancel, Hold, Next Month, Next Year, NR")
    collection_probability: int = Field(default=50, ge=10, le=100)
    remarks: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class ScorecardUpsertRequest(BaseModel):
    employee_id: str
    month: date  # Month representation (will be normalized to 1st of month)

    # Target (BDT)
    target: Decimal = Field(default=Decimal("0.00"), ge=0)

    # Attendance
    planned_leave: Decimal = Field(default=Decimal("0.0"), ge=0)
    unauthorized_leave: Decimal = Field(default=Decimal("0.0"), ge=0)
    working_days: Decimal = Field(default=Decimal("0.0"), ge=0)

    # Forecast
    prediction_amount: Decimal = Field(default=Decimal("0.00"), ge=0)

    # Supervisor Evaluation (read-only for EMPLOYEE role)
    sheet_score: Optional[Decimal] = None
    call_score: Optional[Decimal] = None
    marking: Optional[Decimal] = Field(default=None, ge=0, le=100)
    supervisor_notes: Optional[str] = None

    # Portfolio Snapshot (EMI)
    emi_due_monthly: Decimal = Field(default=Decimal("0.00"), ge=0)
    emi_client_count: int = Field(default=0, ge=0)
    emi_hold_count: int = Field(default=0, ge=0)
    emi_cancel_count: int = Field(default=0, ge=0)

    # Portfolio Snapshot (TB)
    tb_due_amount: Decimal = Field(default=Decimal("0.00"), ge=0)
    tb_client_count: int = Field(default=0, ge=0)
    tb_share_count: int = Field(default=0, ge=0)
    tb_hold_count: int = Field(default=0, ge=0)
    tb_cancel_count: int = Field(default=0, ge=0)

    # Sub-records
    periods: List[PeriodItem] = Field(default_factory=list)
    customers: List[CustomerItem] = Field(default_factory=list)


class ScorecardStatusUpdateRequest(BaseModel):
    status: str = Field(..., pattern=r"^(DRAFT|SUBMITTED|APPROVED|CLOSED)$")
    notes: Optional[str] = None


class AuditLogResponse(BaseModel):
    id: str
    changed_by_name: Optional[str] = None
    previous_status: Optional[str] = None
    new_status: Optional[str] = None
    action: str
    notes: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class CustomerSummary(BaseModel):
    total_paid: Decimal = Decimal("0.00")
    total_unpaid: Decimal = Decimal("0.00")
    total_expected_collection: Decimal = Decimal("0.00")


class ScorecardResponse(BaseModel):
    id: Optional[str] = None
    employee_id: str
    month: date
    status: str

    # Target (BDT)
    target: Decimal = Field(default=Decimal("0.00"))

    # Attendance
    planned_leave: Decimal
    unauthorized_leave: Decimal
    working_days: Decimal

    # Forecast
    prediction_amount: Decimal

    # Supervisor Evaluation
    sheet_score: Optional[Decimal]
    call_score: Optional[Decimal]
    marking: Optional[Decimal]
    supervisor_notes: Optional[str]

    # Portfolio Due Snapshot
    emi_due_monthly: Decimal
    emi_client_count: int
    emi_hold_count: int
    emi_cancel_count: int

    tb_due_amount: Decimal
    tb_client_count: int
    tb_share_count: int
    tb_hold_count: int
    tb_cancel_count: int

    # Workflow timestamps & user IDs
    submitted_at: Optional[datetime] = None
    submitted_by_id: Optional[str] = None
    approved_at: Optional[datetime] = None
    approved_by_id: Optional[str] = None
    closed_at: Optional[datetime] = None
    closed_by_id: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    # Related details
    employee: Optional[ProfileResponse] = None
    periods: List[PeriodItem] = Field(default_factory=list)
    customers: List[CustomerItem] = Field(default_factory=list)
    audit_logs: List[AuditLogResponse] = Field(default_factory=list)

    # Computed Summary rows
    total_achieved: PeriodMetrics
    achievement_pct: PeriodMetrics
    customer_summary: CustomerSummary

    # Permissions flags for the requesting user
    can_edit: bool = True
    can_edit_supervisor_fields: bool = False
    can_submit: bool = False
    can_approve: bool = False
    can_close: bool = False
    can_reopen: bool = False

    model_config = ConfigDict(from_attributes=True)
