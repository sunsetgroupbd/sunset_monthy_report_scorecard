from decimal import Decimal
from typing import List, Dict, Any, Tuple
from datetime import date
from fastapi import HTTPException, status
from app.models.models import (
    ManualScorecard,
    ManualScorecardPeriod,
    ManualScorecardCustomer,
    ManualScorecardAuditLog,
    Profile
)
from app.schemas.scorecard import (
    PeriodMetrics,
    PeriodItem,
    CustomerItem,
    CustomerSummary,
    ScorecardResponse,
    AuditLogResponse
)
from app.schemas.profile import ProfileResponse, TeamResponse


class ScorecardService:
    @staticmethod
    def normalize_month(target_date: date) -> date:
        """Always normalizes any date in a month to the 1st day of that month."""
        return date(target_date.year, target_date.month, 1)

    @staticmethod
    def calculate_period_totals(periods: List[ManualScorecardPeriod | PeriodItem]) -> Tuple[PeriodMetrics, PeriodMetrics]:
        """
        Calculates Total Achieved (sum of periods 1-5) and Achievement % (Achieved / Target * 100).
        Period index 0 is Monthly Target.
        """
        target_period = None
        weekly_periods = []

        for p in periods:
            if p.period_index == 0:
                target_period = p
            elif 1 <= p.period_index <= 6:
                weekly_periods.append(p)

        # Sum weekly periods 1-6
        achieved_new_sales = sum((p.new_sales or Decimal("0.00")) for p in weekly_periods)
        achieved_tb_amount = sum((p.tb_amount or Decimal("0.00")) for p in weekly_periods)
        achieved_emi_amount = sum((p.emi_amount or Decimal("0.00")) for p in weekly_periods)

        # Total collection calculation or override
        calc_total_collection = achieved_new_sales + achieved_tb_amount + achieved_emi_amount

        achieved_total_leads = sum((p.total_leads or 0) for p in weekly_periods)
        achieved_fair_leads = sum((p.fair_leads or 0) for p in weekly_periods)
        achieved_fb_leads = sum((p.fb_leads or 0) for p in weekly_periods)
        achieved_hp = sum((p.hp or 0) for p in weekly_periods)
        achieved_p = sum((p.p or 0) for p in weekly_periods)
        achieved_fup = sum((p.fup or 0) for p in weekly_periods)

        achieved_dialed = sum((p.dialed_calls or 0) for p in weekly_periods)
        achieved_connected = sum((p.connected_calls or 0) for p in weekly_periods)
        achieved_outdoor = sum((p.outdoor_visits or 0) for p in weekly_periods)
        achieved_indoor = sum((p.indoor_cx or 0) for p in weekly_periods)
        achieved_hours = sum((p.meeting_hours or Decimal("0.0")) for p in weekly_periods)

        achieved_hold = sum((getattr(p, 'hold', 0) or 0) for p in weekly_periods)
        achieved_cancel = sum((getattr(p, 'cancel', 0) or 0) for p in weekly_periods)
        achieved_sold_fair = sum((getattr(p, 'sold_fair_leads', 0) or 0) for p in weekly_periods)
        achieved_sold_fb = sum((getattr(p, 'sold_fb_leads', 0) or 0) for p in weekly_periods)
        achieved_sold_other = sum((getattr(p, 'sold_other_leads', 0) or 0) for p in weekly_periods)

        total_achieved = PeriodMetrics(
            new_sales=achieved_new_sales,
            tb_amount=achieved_tb_amount,
            emi_amount=achieved_emi_amount,
            total_collection=calc_total_collection,
            total_leads=achieved_total_leads,
            fair_leads=achieved_fair_leads,
            fb_leads=achieved_fb_leads,
            hp=achieved_hp,
            p=achieved_p,
            fup=achieved_fup,
            dialed_calls=achieved_dialed,
            connected_calls=achieved_connected,
            outdoor_visits=achieved_outdoor,
            indoor_cx=achieved_indoor,
            meeting_hours=achieved_hours,
            hold=achieved_hold,
            cancel=achieved_cancel,
            sold_fair_leads=achieved_sold_fair,
            sold_fb_leads=achieved_sold_fb,
            sold_other_leads=achieved_sold_other
        )

        # Safe achievement % computation against target (period 0)
        def safe_pct(achieved: Decimal | int | float, target: Decimal | int | float) -> Decimal:
            try:
                dec_target = Decimal(str(target))
                dec_achieved = Decimal(str(achieved))
                if dec_target > Decimal("0.00"):
                    return round((dec_achieved / dec_target) * Decimal("100.00"), 2)
            except Exception:
                pass
            return Decimal("0.00")

        if target_period:
            # Target total collection
            target_tc = target_period.total_collection_override if target_period.total_collection_override is not None else (
                (target_period.new_sales or Decimal("0.00")) +
                (target_period.tb_amount or Decimal("0.00")) +
                (target_period.emi_amount or Decimal("0.00"))
            )

            achievement_pct = PeriodMetrics(
                new_sales=safe_pct(achieved_new_sales, target_period.new_sales or 0),
                tb_amount=safe_pct(achieved_tb_amount, target_period.tb_amount or 0),
                emi_amount=safe_pct(achieved_emi_amount, target_period.emi_amount or 0),
                total_collection=safe_pct(calc_total_collection, target_tc),
                total_leads=int(safe_pct(achieved_total_leads, target_period.total_leads or 0)),
                fair_leads=int(safe_pct(achieved_fair_leads, target_period.fair_leads or 0)),
                fb_leads=int(safe_pct(achieved_fb_leads, target_period.fb_leads or 0)),
                hp=int(safe_pct(achieved_hp, target_period.hp or 0)),
                p=int(safe_pct(achieved_p, target_period.p or 0)),
                fup=int(safe_pct(achieved_fup, target_period.fup or 0)),
                dialed_calls=int(safe_pct(achieved_dialed, target_period.dialed_calls or 0)),
                connected_calls=int(safe_pct(achieved_connected, target_period.connected_calls or 0)),
                outdoor_visits=int(safe_pct(achieved_outdoor, target_period.outdoor_visits or 0)),
                indoor_cx=int(safe_pct(achieved_indoor, target_period.indoor_cx or 0)),
                meeting_hours=safe_pct(achieved_hours, target_period.meeting_hours or 0),
                hold=int(safe_pct(achieved_hold, getattr(target_period, 'hold', 0) or 0)),
                cancel=int(safe_pct(achieved_cancel, getattr(target_period, 'cancel', 0) or 0)),
                sold_fair_leads=int(safe_pct(achieved_sold_fair, getattr(target_period, 'sold_fair_leads', 0) or 0)),
                sold_fb_leads=int(safe_pct(achieved_sold_fb, getattr(target_period, 'sold_fb_leads', 0) or 0)),
                sold_other_leads=int(safe_pct(achieved_sold_other, getattr(target_period, 'sold_other_leads', 0) or 0))
            )
        else:
            achievement_pct = PeriodMetrics()

        return total_achieved, achievement_pct

    @staticmethod
    def calculate_customer_summary(customers: List[ManualScorecardCustomer | CustomerItem]) -> CustomerSummary:
        total_paid = Decimal("0.00")
        total_unpaid = Decimal("0.00")
        total_expected = Decimal("0.00")

        for c in customers:
            paid = c.paid_amount or Decimal("0.00")
            unpaid = c.unpaid_amount or Decimal("0.00")
            prob = Decimal(str(c.collection_probability or 0)) / Decimal("100.0")

            total_paid += paid
            total_unpaid += unpaid
            
            # Expected collection = customer total collection * probability %
            cust_tc = (c.new_sales_amount or Decimal("0.00")) + (c.tb_amount or Decimal("0.00")) + (c.emi_amount or Decimal("0.00"))
            total_expected += (cust_tc * prob)

        return CustomerSummary(
            total_paid=round(total_paid, 2),
            total_unpaid=round(total_unpaid, 2),
            total_expected_collection=round(total_expected, 2)
        )

    @staticmethod
    def validate_status_transition(
        current_status: str,
        new_status: str,
        user_role: str
    ):
        """
        Validates allowed workflow state transitions.
        """
        if current_status == new_status:
            return

        # ADMIN can transition freely and reopen CLOSED scorecards
        if user_role == "ADMIN":
            return

        valid_transitions = {
            "DRAFT": ["SUBMITTED"],
            "SUBMITTED": ["APPROVED", "DRAFT"], # DRAFT = send back / request changes
            "APPROVED": ["CLOSED"],
            "CLOSED": [] # Only Admin can reopen
        }

        allowed = valid_transitions.get(current_status, [])
        if new_status not in allowed:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid status transition from {current_status} to {new_status} for role {user_role}."
            )

        # Role-specific checks
        if user_role == "EMPLOYEE" and new_status != "SUBMITTED":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Employees can only submit draft scorecards."
            )

    @staticmethod
    def construct_empty_scorecard(employee: Profile, target_month: date, current_user: Profile) -> ScorecardResponse:
        """Constructs an initialized empty DRAFT scorecard structure when none exists."""
        normalized_month = ScorecardService.normalize_month(target_month)
        
        # 0=Target, 1..6=Period intervals (Till 5th, Till 10th, Till 15th, Till 20th, Till 25th, Till 30/31st)
        periods = [PeriodItem(period_index=i) for i in range(7)]
        total_achieved, achievement_pct = ScorecardService.calculate_period_totals(periods)
        customer_summary = CustomerSummary()

        can_edit = True
        can_edit_supervisor_fields = (current_user.role in ("ADMIN", "TL", "CO"))
        can_submit = True
        can_approve = False
        can_close = False
        can_reopen = False

        emp_profile_resp = None
        if employee:
            team_resp = None
            if employee.team:
                team_resp = TeamResponse.model_validate(employee.team)
            emp_profile_resp = ProfileResponse(
                id=employee.id,
                employee_id=employee.employee_id,
                full_name=employee.full_name,
                email=employee.email,
                designation=employee.designation,
                team_id=employee.team_id,
                joining_date=employee.joining_date,
                role=employee.role,
                supervisor_id=employee.supervisor_id,
                is_active=employee.is_active,
                created_at=employee.created_at,
                updated_at=employee.updated_at,
                team=team_resp
            )

        return ScorecardResponse(
            id=None,
            employee_id=employee.id,
            month=normalized_month,
            status="DRAFT",
            target=Decimal("0.00"),
            planned_leave=Decimal("0.0"),
            unauthorized_leave=Decimal("0.0"),
            working_days=Decimal("0.0"),
            prediction_amount=Decimal("0.00"),
            sheet_score=None,
            call_score=None,
            marking=None,
            supervisor_notes=None,
            emi_due_monthly=Decimal("0.00"),
            emi_client_count=0,
            emi_hold_count=0,
            emi_cancel_count=0,
            tb_due_amount=Decimal("0.00"),
            tb_client_count=0,
            tb_share_count=0,
            tb_hold_count=0,
            tb_cancel_count=0,
            employee=emp_profile_resp,
            periods=periods,
            customers=[],
            audit_logs=[],
            total_achieved=total_achieved,
            achievement_pct=achievement_pct,
            customer_summary=customer_summary,
            can_edit=can_edit,
            can_edit_supervisor_fields=can_edit_supervisor_fields,
            can_submit=can_submit,
            can_approve=can_approve,
            can_close=can_close,
            can_reopen=can_reopen
        )
