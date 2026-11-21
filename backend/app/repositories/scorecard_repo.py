import logging
from typing import Optional, List, Dict, Any
from datetime import date, datetime, timezone
from decimal import Decimal
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import or_, desc, select
from fastapi import HTTPException, status
from app.models.models import (
    ManualScorecard,
    ManualScorecardPeriod,
    ManualScorecardCustomer,
    ManualScorecardAuditLog,
    Profile,
    Team,
    utc_now,
    generate_uuid
)
from app.schemas.scorecard import (
    ScorecardUpsertRequest,
    ScorecardResponse,
    PeriodItem,
    CustomerItem,
    AuditLogResponse
)
from app.schemas.profile import ProfileResponse, TeamResponse
from app.services.scorecard_service import ScorecardService

logger = logging.getLogger(__name__)


class ScorecardRepository:
    @staticmethod
    def get_by_employee_and_month(
        db: Session,
        employee_id: str,
        target_month: date
    ) -> Optional[ManualScorecard]:
        normalized_month = ScorecardService.normalize_month(target_month)
        # Search by profile id or 8-digit employee_id
        return db.query(ManualScorecard).join(
            Profile, ManualScorecard.employee_id == Profile.id
        ).filter(
            or_(Profile.id == employee_id, Profile.employee_id == employee_id),
            ManualScorecard.month == normalized_month
        ).options(
            joinedload(ManualScorecard.employee).joinedload(Profile.team),
            joinedload(ManualScorecard.periods),
            joinedload(ManualScorecard.customers),
            joinedload(ManualScorecard.audit_logs).joinedload(ManualScorecardAuditLog.changed_by)
        ).first()

    @staticmethod
    def get_by_id(db: Session, scorecard_id: str) -> Optional[ManualScorecard]:
        return db.query(ManualScorecard).filter(
            ManualScorecard.id == scorecard_id
        ).options(
            joinedload(ManualScorecard.employee).joinedload(Profile.team),
            joinedload(ManualScorecard.periods),
            joinedload(ManualScorecard.customers),
            joinedload(ManualScorecard.audit_logs).joinedload(ManualScorecardAuditLog.changed_by)
        ).first()

    @staticmethod
    def atomic_upsert(
        db: Session,
        data: ScorecardUpsertRequest,
        current_user: Profile
    ) -> ManualScorecard:
        """
        Atomically creates or updates the scorecard, periods, and customer rows in a single transaction.
        """
        normalized_month = ScorecardService.normalize_month(data.month)

        # Lookup employee profile
        employee_profile = db.query(Profile).filter(
            or_(Profile.id == data.employee_id, Profile.employee_id == data.employee_id)
        ).first()

        if not employee_profile:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Employee '{data.employee_id}' not found."
            )

        # Check existing scorecard
        scorecard = db.query(ManualScorecard).filter(
            ManualScorecard.employee_id == employee_profile.id,
            ManualScorecard.month == normalized_month
        ).first()

        # Permission check on closed status
        if scorecard and scorecard.status == "CLOSED" and current_user.role != "ADMIN":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Scorecard is CLOSED and locked against modifications. Contact an Administrator to reopen."
            )

        # Employee role restrictions: cannot edit submitted or approved scorecards
        if scorecard and current_user.role == "EMPLOYEE" and scorecard.status != "DRAFT":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Employees cannot modify scorecards in '{scorecard.status}' status."
            )

        try:
            is_new = False
            if not scorecard:
                is_new = True
                scorecard = ManualScorecard(
                    id=generate_uuid(),
                    employee_id=employee_profile.id,
                    month=normalized_month,
                    status="DRAFT"
                )
                db.add(scorecard)
                db.flush()

            # Update Attendance & Forecast
            scorecard.target = data.target
            scorecard.planned_leave = data.planned_leave
            scorecard.unauthorized_leave = data.unauthorized_leave
            scorecard.working_days = data.working_days
            scorecard.prediction_amount = data.prediction_amount

            # Update Portfolio Snapshot
            scorecard.emi_due_monthly = data.emi_due_monthly
            scorecard.emi_client_count = data.emi_client_count
            scorecard.emi_hold_count = data.emi_hold_count
            scorecard.emi_cancel_count = data.emi_cancel_count

            scorecard.tb_due_amount = data.tb_due_amount
            scorecard.tb_client_count = data.tb_client_count
            scorecard.tb_share_count = data.tb_share_count
            scorecard.tb_hold_count = data.tb_hold_count
            scorecard.tb_cancel_count = data.tb_cancel_count

            # Update Supervisor Evaluation fields ONLY if user is authorized (TL, CO, ADMIN)
            if current_user.role in ("ADMIN", "TL", "CO"):
                if data.sheet_score is not None:
                    scorecard.sheet_score = data.sheet_score
                if data.call_score is not None:
                    scorecard.call_score = data.call_score
                if data.marking is not None:
                    scorecard.marking = data.marking
                if data.supervisor_notes is not None:
                    scorecard.supervisor_notes = data.supervisor_notes

            # -------------------------------------------------------------
            # Periods Upsert (indexes 0 to 5)
            # -------------------------------------------------------------
            existing_periods_map = {p.period_index: p for p in scorecard.periods}

            # Map incoming periods by index
            incoming_periods_by_idx = {p.period_index: p for p in data.periods}

            for idx in range(7):
                incoming_p = incoming_periods_by_idx.get(idx)
                period_obj = existing_periods_map.get(idx)

                new_sales = incoming_p.new_sales if incoming_p else Decimal("0.00")
                tb_amount = incoming_p.tb_amount if incoming_p else Decimal("0.00")
                emi_amount = incoming_p.emi_amount if incoming_p else Decimal("0.00")
                
                # Auto-calculate total collection or use override
                auto_total_col = new_sales + tb_amount + emi_amount
                tc_override = incoming_p.total_collection_override if incoming_p else None
                ta_override = incoming_p.total_achieved_override if incoming_p else None
                final_total_col = tc_override if tc_override is not None else auto_total_col

                if not period_obj:
                    period_obj = ManualScorecardPeriod(
                        id=generate_uuid(),
                        scorecard_id=scorecard.id,
                        period_index=idx,
                        new_sales=new_sales,
                        tb_amount=tb_amount,
                        emi_amount=emi_amount,
                        total_collection=final_total_col,
                        total_collection_override=tc_override,
                        total_achieved_override=ta_override,
                        total_leads=incoming_p.total_leads if incoming_p else 0,
                        fair_leads=incoming_p.fair_leads if incoming_p else 0,
                        fb_leads=incoming_p.fb_leads if incoming_p else 0,
                        hp=incoming_p.hp if incoming_p else 0,
                        p=incoming_p.p if incoming_p else 0,
                        fup=incoming_p.fup if incoming_p else 0,
                        dialed_calls=incoming_p.dialed_calls if incoming_p else 0,
                        connected_calls=incoming_p.connected_calls if incoming_p else 0,
                        outdoor_visits=incoming_p.outdoor_visits if incoming_p else 0,
                        indoor_cx=incoming_p.indoor_cx if incoming_p else 0,
                        meeting_hours=incoming_p.meeting_hours if incoming_p else Decimal("0.0"),
                        hold=incoming_p.hold if incoming_p else 0,
                        cancel=incoming_p.cancel if incoming_p else 0,
                        sold_fair_leads=incoming_p.sold_fair_leads if incoming_p else 0,
                        sold_fb_leads=incoming_p.sold_fb_leads if incoming_p else 0,
                        sold_other_leads=incoming_p.sold_other_leads if incoming_p else 0
                    )
                    db.add(period_obj)
                else:
                    period_obj.new_sales = new_sales
                    period_obj.tb_amount = tb_amount
                    period_obj.emi_amount = emi_amount
                    period_obj.total_collection = final_total_col
                    period_obj.total_collection_override = tc_override
                    period_obj.total_achieved_override = ta_override
                    if incoming_p:
                        period_obj.total_leads = incoming_p.total_leads
                        period_obj.fair_leads = incoming_p.fair_leads
                        period_obj.fb_leads = incoming_p.fb_leads
                        period_obj.hp = incoming_p.hp
                        period_obj.p = incoming_p.p
                        period_obj.fup = incoming_p.fup
                        period_obj.dialed_calls = incoming_p.dialed_calls
                        period_obj.connected_calls = incoming_p.connected_calls
                        period_obj.outdoor_visits = incoming_p.outdoor_visits
                        period_obj.indoor_cx = incoming_p.indoor_cx
                        period_obj.meeting_hours = incoming_p.meeting_hours
                        period_obj.hold = incoming_p.hold
                        period_obj.cancel = incoming_p.cancel
                        period_obj.sold_fair_leads = incoming_p.sold_fair_leads
                        period_obj.sold_fb_leads = incoming_p.sold_fb_leads
                        period_obj.sold_other_leads = incoming_p.sold_other_leads

            # -------------------------------------------------------------
            # Customers Upsert / Replace
            # -------------------------------------------------------------
            # Track existing customer IDs
            existing_cust_map = {c.id: c for c in scorecard.customers}
            seen_cust_ids = set()

            for cust_in in data.customers:
                cust_tc = (cust_in.new_sales_amount or Decimal("0.00")) + (cust_in.tb_amount or Decimal("0.00")) + (cust_in.emi_amount or Decimal("0.00"))
                if cust_in.id and cust_in.id in existing_cust_map:
                    # Update
                    cust_obj = existing_cust_map[cust_in.id]
                    seen_cust_ids.add(cust_in.id)
                    cust_obj.customer_name = cust_in.customer_name
                    cust_obj.cx_type = cust_in.cx_type or "New Sales"
                    cust_obj.payment_type = cust_in.payment_type or "Paid"
                    cust_obj.amount = cust_in.amount or Decimal("0.00")
                    cust_obj.payment_date = cust_in.payment_date
                    cust_obj.payment_status = cust_in.payment_status or ("Paid" if (cust_in.paid_amount or 0) > 0 else "Pending")
                    cust_obj.paid_amount = cust_in.paid_amount
                    cust_obj.unpaid_amount = cust_in.unpaid_amount
                    cust_obj.collection_date = cust_in.collection_date
                    cust_obj.next_collection_date = cust_in.next_collection_date
                    cust_obj.next_collection_date_2 = cust_in.next_collection_date_2
                    cust_obj.date_1 = cust_in.date_1
                    cust_obj.date_2 = cust_in.date_2
                    cust_obj.in_out_plan = cust_in.in_out_plan
                    cust_obj.new_sales_amount = cust_in.new_sales_amount
                    cust_obj.tb_amount = cust_in.tb_amount
                    cust_obj.emi_amount = cust_in.emi_amount
                    cust_obj.total_collection = cust_tc
                    cust_obj.lead_status = cust_in.lead_status
                    cust_obj.collection_probability = cust_in.collection_probability
                    cust_obj.remarks = cust_in.remarks
                else:
                    # Insert new customer row
                    new_cust_id = generate_uuid()
                    seen_cust_ids.add(new_cust_id)
                    cust_obj = ManualScorecardCustomer(
                        id=new_cust_id,
                        scorecard_id=scorecard.id,
                        customer_name=cust_in.customer_name,
                        cx_type=cust_in.cx_type or "New Sales",
                        payment_type=cust_in.payment_type or "Paid",
                        amount=cust_in.amount or Decimal("0.00"),
                        payment_date=cust_in.payment_date,
                        payment_status=cust_in.payment_status or ("Paid" if (cust_in.paid_amount or 0) > 0 else "Pending"),
                        paid_amount=cust_in.paid_amount,
                        unpaid_amount=cust_in.unpaid_amount,
                        collection_date=cust_in.collection_date,
                        next_collection_date=cust_in.next_collection_date,
                        next_collection_date_2=cust_in.next_collection_date_2,
                        date_1=cust_in.date_1,
                        date_2=cust_in.date_2,
                        in_out_plan=cust_in.in_out_plan,
                        new_sales_amount=cust_in.new_sales_amount,
                        tb_amount=cust_in.tb_amount,
                        emi_amount=cust_in.emi_amount,
                        total_collection=cust_tc,
                        lead_status=cust_in.lead_status,
                        collection_probability=cust_in.collection_probability,
                        remarks=cust_in.remarks
                    )
                    db.add(cust_obj)

            # Remove deleted customers
            for c_id, c_obj in existing_cust_map.items():
                if c_id not in seen_cust_ids:
                    db.delete(c_obj)

            # Audit Log entry
            action_name = "Scorecard Created" if is_new else "Scorecard Updated"
            audit_log = ManualScorecardAuditLog(
                id=generate_uuid(),
                scorecard_id=scorecard.id,
                changed_by_id=current_user.id,
                previous_status=scorecard.status,
                new_status=scorecard.status,
                action=action_name,
                notes=f"Updated by {current_user.full_name} ({current_user.role})"
            )
            db.add(audit_log)

            db.commit()
            db.refresh(scorecard)
            return scorecard

        except Exception as e:
            db.rollback()
            logger.error(f"Error during atomic upsert of scorecard: {e}")
            raise

    @staticmethod
    def update_status(
        db: Session,
        scorecard_id: str,
        new_status: str,
        current_user: Profile,
        notes: Optional[str] = None
    ) -> ManualScorecard:
        scorecard = ScorecardRepository.get_by_id(db, scorecard_id)
        if not scorecard:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Scorecard with id {scorecard_id} not found."
            )

        prev_status = scorecard.status
        ScorecardService.validate_status_transition(prev_status, new_status, current_user.role)

        now = utc_now()
        scorecard.status = new_status

        if new_status == "SUBMITTED":
            scorecard.submitted_at = now
            scorecard.submitted_by_id = current_user.id
        elif new_status == "APPROVED":
            scorecard.approved_at = now
            scorecard.approved_by_id = current_user.id
        elif new_status == "CLOSED":
            scorecard.closed_at = now
            scorecard.closed_by_id = current_user.id
        elif new_status == "DRAFT" and prev_status == "CLOSED":
            # Reopening closed scorecard by Admin
            scorecard.closed_at = None
            scorecard.closed_by_id = None

        audit_log = ManualScorecardAuditLog(
            id=generate_uuid(),
            scorecard_id=scorecard.id,
            changed_by_id=current_user.id,
            previous_status=prev_status,
            new_status=new_status,
            action=f"Status Changed: {prev_status} -> {new_status}",
            notes=notes or f"Status changed by {current_user.full_name} ({current_user.role})"
        )
        db.add(audit_log)

        db.commit()
        db.refresh(scorecard)
        return scorecard

    @staticmethod
    def format_scorecard_response(
        scorecard: ManualScorecard,
        current_user: Profile
    ) -> ScorecardResponse:
        """Formats the ORM scorecard model into ScorecardResponse schema with live totals."""
        period_items = [
            PeriodItem(
                id=p.id,
                period_index=p.period_index,
                new_sales=p.new_sales,
                tb_amount=p.tb_amount,
                emi_amount=p.emi_amount,
                total_collection=p.total_collection,
                total_collection_override=p.total_collection_override,
                total_achieved_override=p.total_achieved_override,
                total_leads=p.total_leads,
                fair_leads=p.fair_leads,
                fb_leads=p.fb_leads,
                hp=p.hp,
                p=p.p,
                fup=p.fup,
                dialed_calls=p.dialed_calls,
                connected_calls=p.connected_calls,
                outdoor_visits=p.outdoor_visits,
                indoor_cx=p.indoor_cx,
                meeting_hours=p.meeting_hours,
                hold=getattr(p, 'hold', 0) or 0,
                cancel=getattr(p, 'cancel', 0) or 0,
                sold_fair_leads=getattr(p, 'sold_fair_leads', 0) or 0,
                sold_fb_leads=getattr(p, 'sold_fb_leads', 0) or 0,
                sold_other_leads=getattr(p, 'sold_other_leads', 0) or 0
            )
            for p in sorted(scorecard.periods, key=lambda x: x.period_index)
        ]

        # Ensure all 7 periods exist in response (0=Target, 1..6=Period intervals Till 5th..Till 30/31st)
        existing_indices = {p.period_index for p in period_items}
        for i in range(7):
            if i not in existing_indices:
                period_items.append(PeriodItem(period_index=i))
        period_items.sort(key=lambda x: x.period_index)

        customer_items = [
            CustomerItem(
                id=c.id,
                customer_name=c.customer_name,
                cx_type=getattr(c, 'cx_type', 'New Sales') or 'New Sales',
                payment_type=getattr(c, 'payment_type', 'Paid') or 'Paid',
                amount=getattr(c, 'amount', Decimal("0.00")) or Decimal("0.00"),
                payment_date=getattr(c, 'payment_date', None),
                payment_status=getattr(c, 'payment_status', 'Paid') or ('Paid' if (c.paid_amount or 0) > 0 else 'Pending'),
                paid_amount=c.paid_amount,
                unpaid_amount=c.unpaid_amount,
                collection_date=c.collection_date,
                next_collection_date=getattr(c, 'next_collection_date', None),
                next_collection_date_2=getattr(c, 'next_collection_date_2', None),
                date_1=c.date_1,
                date_2=c.date_2,
                in_out_plan=c.in_out_plan,
                new_sales_amount=c.new_sales_amount,
                tb_amount=c.tb_amount,
                emi_amount=c.emi_amount,
                total_collection=c.total_collection,
                lead_status=c.lead_status,
                collection_probability=c.collection_probability,
                remarks=c.remarks
            )
            for c in scorecard.customers
        ]

        total_achieved, achievement_pct = ScorecardService.calculate_period_totals(period_items)
        customer_summary = ScorecardService.calculate_customer_summary(customer_items)

        audit_log_items = [
            AuditLogResponse(
                id=a.id,
                changed_by_name=a.changed_by.full_name if a.changed_by else "System",
                previous_status=a.previous_status,
                new_status=a.new_status,
                action=a.action,
                notes=a.notes,
                created_at=a.created_at
            )
            for a in scorecard.audit_logs
        ]

        emp_profile_resp = None
        if scorecard.employee:
            team_resp = None
            if scorecard.employee.team:
                team_resp = TeamResponse.model_validate(scorecard.employee.team)
            emp_profile_resp = ProfileResponse(
                id=scorecard.employee.id,
                employee_id=scorecard.employee.employee_id,
                full_name=scorecard.employee.full_name,
                email=scorecard.employee.email,
                designation=scorecard.employee.designation,
                team_id=scorecard.employee.team_id,
                joining_date=scorecard.employee.joining_date,
                role=scorecard.employee.role,
                supervisor_id=scorecard.employee.supervisor_id,
                is_active=scorecard.employee.is_active,
                created_at=scorecard.employee.created_at,
                updated_at=scorecard.employee.updated_at,
                team=team_resp
            )

        # Dynamic permission flags based on current user and scorecard status
        is_admin = (current_user.role == "ADMIN")
        is_supervisor = (current_user.role in ("TL", "CO"))
        is_owner = (scorecard.employee_id == current_user.id)
        is_closed = (scorecard.status == "CLOSED")

        # Owner edits draft numbers; Admin/Supervisor evaluates and approves
        can_edit = is_owner and (scorecard.status == "DRAFT") and not is_closed
        can_edit_supervisor_fields = (is_admin or is_supervisor) and not is_closed
        can_submit = (scorecard.status == "DRAFT") and is_owner
        can_approve = (scorecard.status == "SUBMITTED") and (is_supervisor or is_admin)
        can_close = (scorecard.status in ("APPROVED", "SUBMITTED")) and (is_admin or is_supervisor)
        can_reopen = is_closed and is_admin
        can_reject = (scorecard.status == "SUBMITTED") and (is_supervisor or is_admin)

        return ScorecardResponse(
            id=scorecard.id,
            employee_id=scorecard.employee_id,
            month=scorecard.month,
            status=scorecard.status,
            target=getattr(scorecard, 'target', Decimal("0.00")) or Decimal("0.00"),
            planned_leave=scorecard.planned_leave,
            unauthorized_leave=scorecard.unauthorized_leave,
            working_days=scorecard.working_days,
            prediction_amount=scorecard.prediction_amount,
            sheet_score=scorecard.sheet_score,
            call_score=scorecard.call_score,
            marking=scorecard.marking,
            supervisor_notes=scorecard.supervisor_notes,
            emi_due_monthly=scorecard.emi_due_monthly,
            emi_client_count=scorecard.emi_client_count,
            emi_hold_count=scorecard.emi_hold_count,
            emi_cancel_count=scorecard.emi_cancel_count,
            tb_due_amount=scorecard.tb_due_amount,
            tb_client_count=scorecard.tb_client_count,
            tb_share_count=scorecard.tb_share_count,
            tb_hold_count=scorecard.tb_hold_count,
            tb_cancel_count=scorecard.tb_cancel_count,
            submitted_at=scorecard.submitted_at,
            submitted_by_id=scorecard.submitted_by_id,
            approved_at=scorecard.approved_at,
            approved_by_id=scorecard.approved_by_id,
            closed_at=scorecard.closed_at,
            closed_by_id=scorecard.closed_by_id,
            created_at=scorecard.created_at,
            updated_at=scorecard.updated_at,
            employee=emp_profile_resp,
            periods=period_items,
            customers=customer_items,
            audit_logs=audit_log_items,
            total_achieved=total_achieved,
            achievement_pct=achievement_pct,
            customer_summary=customer_summary,
            can_edit=can_edit,
            can_edit_supervisor_fields=can_edit_supervisor_fields,
            can_submit=can_submit,
            can_approve=can_approve,
            can_close=can_close,
            can_reopen=can_reopen,
            can_reject=can_reject
        )

    @staticmethod
    def get_pending_submissions_count(db: Session, current_user: Profile) -> int:
        query = db.query(ManualScorecard).join(
            Profile, ManualScorecard.employee_id == Profile.id
        ).filter(
            ManualScorecard.status == "SUBMITTED"
        )
        if current_user.role != "ADMIN":
            if current_user.team_id:
                query = query.filter(
                    or_(
                        Profile.supervisor_id == current_user.id,
                        Profile.team_id == current_user.team_id
                    )
                )
            else:
                query = query.filter(Profile.supervisor_id == current_user.id)
        return query.count()

    @staticmethod
    def get_submissions(
        db: Session,
        current_user: Profile,
        month: Optional[str] = None,
        status_filter: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        query = db.query(ManualScorecard).join(
            Profile, ManualScorecard.employee_id == Profile.id
        ).options(
            joinedload(ManualScorecard.employee).joinedload(Profile.team),
            joinedload(ManualScorecard.periods)
        )

        if current_user.role != "ADMIN":
            if current_user.team_id:
                query = query.filter(
                    or_(
                        Profile.supervisor_id == current_user.id,
                        Profile.team_id == current_user.team_id
                    )
                )
            else:
                query = query.filter(Profile.supervisor_id == current_user.id)

        if month and month.lower() != "all":
            try:
                parts = month.split("-")
                m_date = date(int(parts[0]), int(parts[1]), 1)
                query = query.filter(ManualScorecard.month == m_date)
            except Exception:
                pass

        if status_filter and status_filter.upper() != "ALL":
            query = query.filter(ManualScorecard.status == status_filter.upper())

        scorecards = query.order_by(
            desc(ManualScorecard.submitted_at),
            desc(ManualScorecard.updated_at)
        ).all()

        results = []
        for sc in scorecards:
            emp = sc.employee
            emp_name = emp.full_name if emp else "Unknown"
            emp_code = emp.employee_id if emp else ""
            desig = emp.designation if emp else ""
            team = emp.team.name if emp and emp.team else None
            m_str = sc.month.strftime("%Y-%m") if sc.month else ""

            # Calculate total achieved collection from periods 1-6
            tot_col = Decimal("0.00")
            for p in sc.periods:
                if 1 <= p.period_index <= 6:
                    tot_col += (p.new_sales or Decimal("0.00")) + (p.tb_amount or Decimal("0.00")) + (p.emi_amount or Decimal("0.00"))

            results.append({
                "id": sc.id,
                "employee_id": sc.employee_id,
                "employee_name": emp_name,
                "employee_code": emp_code,
                "designation": desig,
                "team_name": team,
                "month": m_str,
                "status": sc.status,
                "submitted_at": sc.submitted_at,
                "submitted_by_name": emp_name,
                "target": getattr(sc, 'target', Decimal("0.00")) or Decimal("0.00"),
                "prediction_amount": sc.prediction_amount or Decimal("0.00"),
                "marking": sc.marking,
                "sheet_score": sc.sheet_score,
                "call_score": sc.call_score,
                "total_achieved_collection": tot_col,
                "updated_at": sc.updated_at
            })

        return results

