"""
Database seed script for local development and demonstration.
Seeds teams, profiles, and initial scorecard data.
"""
from datetime import date, datetime, timezone
from decimal import Decimal
from app.core.database import SessionLocal, Base, engine
from app.models.models import (
    Team, Profile, ManualScorecard, ManualScorecardPeriod,
    ManualScorecardCustomer, ManualScorecardAuditLog
)

def run_seed():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # 1. Teams
        team_dhaka = db.query(Team).filter(Team.code == "DHK-ALPHA").first()
        if not team_dhaka:
            team_dhaka = Team(
                id="11111111-1111-1111-1111-111111111111",
                name="Dhaka Alpha Sales",
                code="DHK-ALPHA",
                description="Dhaka North & Central Core Sales Team"
            )
            db.add(team_dhaka)

        team_ctg = db.query(Team).filter(Team.code == "CTG-TITAN").first()
        if not team_ctg:
            team_ctg = Team(
                id="22222222-2222-2222-2222-222222222222",
                name="Chittagong Titans",
                code="CTG-TITAN",
                description="Chittagong Regional Sales Team"
            )
            db.add(team_ctg)

        db.flush()

        # 2. Profiles (Admin, TL, CO, Employee)
        admin_id = "a0000000-0000-0000-0000-000000000001"
        tl_id    = "b0000000-0000-0000-0000-000000000002"
        co_id    = "c0000000-0000-0000-0000-000000000003"
        emp_id   = "d0000000-0000-0000-0000-000000000004"
        emp2_id  = "e0000000-0000-0000-0000-000000000005"

        profiles_data = [
            {
                "id": admin_id,
                "employee_id": "10000001",
                "full_name": "Syed Rahman",
                "email": "admin@scorecard.com",
                "designation": "Head of Sales & Strategy",
                "team_id": team_dhaka.id,
                "joining_date": date(2022, 1, 15),
                "role": "ADMIN",
                "supervisor_id": None
            },
            {
                "id": tl_id,
                "employee_id": "10000002",
                "full_name": "Tariq Hasan",
                "email": "tl@scorecard.com",
                "designation": "Team Leader - Sales",
                "team_id": team_dhaka.id,
                "joining_date": date(2022, 6, 1),
                "role": "TL",
                "supervisor_id": admin_id
            },
            {
                "id": co_id,
                "employee_id": "10000003",
                "full_name": "Farhana Islam",
                "email": "co@scorecard.com",
                "designation": "Sales Coordinator",
                "team_id": team_dhaka.id,
                "joining_date": date(2023, 2, 10),
                "role": "CO",
                "supervisor_id": tl_id
            },
            {
                "id": emp_id,
                "employee_id": "10000004",
                "full_name": "Rafiqul Alam",
                "email": "employee@scorecard.com",
                "designation": "Senior Relationship Officer",
                "team_id": team_dhaka.id,
                "joining_date": date(2023, 8, 1),
                "role": "EMPLOYEE",
                "supervisor_id": tl_id
            },
            {
                "id": emp2_id,
                "employee_id": "10000005",
                "full_name": "Nusrat Jahan",
                "email": "employee2@scorecard.com",
                "designation": "Relationship Officer",
                "team_id": team_ctg.id,
                "joining_date": date(2024, 1, 15),
                "role": "EMPLOYEE",
                "supervisor_id": None
            }
        ]

        for p_data in profiles_data:
            existing = db.query(Profile).filter(Profile.id == p_data["id"]).first()
            if not existing:
                prof = Profile(**p_data)
                db.add(prof)
            else:
                for k, v in p_data.items():
                    setattr(existing, k, v)

        db.flush()

        # 3. Sample Scorecard for Rafiqul Alam (November 2026)
        sc_id = "f0000000-0000-0000-0000-000000000001"
        target_month = date(2026, 11, 1)

        scorecard = db.query(ManualScorecard).filter(ManualScorecard.id == sc_id).first()
        if not scorecard:
            scorecard = ManualScorecard(
                id=sc_id,
                employee_id=emp_id,
                month=target_month,
                status="DRAFT",
                planned_leave=Decimal("1.0"),
                unauthorized_leave=Decimal("0.0"),
                working_days=Decimal("24.0"),
                prediction_amount=Decimal("1500000.00"),
                sheet_score=Decimal("85.0"),
                call_score=Decimal("90.0"),
                marking=Decimal("88.0"),
                supervisor_notes="Consistently strong performance in middle periods. Needs focus on TB collections.",
                emi_due_monthly=Decimal("450000.00"),
                emi_client_count=15,
                emi_hold_count=2,
                emi_cancel_count=0,
                tb_due_amount=Decimal("320000.00"),
                tb_client_count=8,
                tb_share_count=4,
                tb_hold_count=1,
                tb_cancel_count=0
            )
            db.add(scorecard)
            db.flush()

            # Periods: Target (0) + 1-5
            periods_data = [
                # Target
                {"period_index": 0, "new_sales": 1000000.00, "tb_amount": 300000.00, "emi_amount": 200000.00, "total_leads": 100, "fair_leads": 30, "fb_leads": 40, "hp": 20, "p": 10, "fup": 5, "dialed_calls": 250, "connected_calls": 180, "outdoor_visits": 20, "indoor_cx": 15, "meeting_hours": 30.0},
                # P1 (1-7)
                {"period_index": 1, "new_sales": 200000.00, "tb_amount": 50000.00, "emi_amount": 40000.00, "total_leads": 25, "fair_leads": 8, "fb_leads": 10, "hp": 5, "p": 2, "fup": 1, "dialed_calls": 60, "connected_calls": 42, "outdoor_visits": 5, "indoor_cx": 4, "meeting_hours": 7.5},
                # P2 (8-14)
                {"period_index": 2, "new_sales": 250000.00, "tb_amount": 80000.00, "emi_amount": 45000.00, "total_leads": 22, "fair_leads": 6, "fb_leads": 8, "hp": 4, "p": 3, "fup": 1, "dialed_calls": 55, "connected_calls": 38, "outdoor_visits": 4, "indoor_cx": 3, "meeting_hours": 6.0},
                # P3 (15-21)
                {"period_index": 3, "new_sales": 300000.00, "tb_amount": 90000.00, "emi_amount": 50000.00, "total_leads": 30, "fair_leads": 9, "fb_leads": 12, "hp": 6, "p": 2, "fup": 1, "dialed_calls": 65, "connected_calls": 48, "outdoor_visits": 6, "indoor_cx": 5, "meeting_hours": 8.0},
                # P4 (22-28)
                {"period_index": 4, "new_sales": 150000.00, "tb_amount": 40000.00, "emi_amount": 35000.00, "total_leads": 18, "fair_leads": 5, "fb_leads": 6, "hp": 3, "p": 2, "fup": 1, "dialed_calls": 45, "connected_calls": 32, "outdoor_visits": 3, "indoor_cx": 2, "meeting_hours": 5.0},
                # P5 (29-End)
                {"period_index": 5, "new_sales": 120000.00, "tb_amount": 30000.00, "emi_amount": 25000.00, "total_leads": 12, "fair_leads": 3, "fb_leads": 4, "hp": 2, "p": 1, "fup": 1, "dialed_calls": 30, "connected_calls": 22, "outdoor_visits": 2, "indoor_cx": 2, "meeting_hours": 4.0},
            ]

            for p_item in periods_data:
                tc = Decimal(str(p_item["new_sales"])) + Decimal(str(p_item["tb_amount"])) + Decimal(str(p_item["emi_amount"]))
                period = ManualScorecardPeriod(
                    scorecard_id=scorecard.id,
                    period_index=p_item["period_index"],
                    new_sales=Decimal(str(p_item["new_sales"])),
                    tb_amount=Decimal(str(p_item["tb_amount"])),
                    emi_amount=Decimal(str(p_item["emi_amount"])),
                    total_collection=tc,
                    total_leads=p_item["total_leads"],
                    fair_leads=p_item["fair_leads"],
                    fb_leads=p_item["fb_leads"],
                    hp=p_item["hp"],
                    p=p_item["p"],
                    fup=p_item["fup"],
                    dialed_calls=p_item["dialed_calls"],
                    connected_calls=p_item["connected_calls"],
                    outdoor_visits=p_item["outdoor_visits"],
                    indoor_cx=p_item["indoor_cx"],
                    meeting_hours=Decimal(str(p_item["meeting_hours"]))
                )
                db.add(period)

            # Customers
            customers_data = [
                {
                    "customer_name": "Bashundhara Group Project",
                    "paid_amount": Decimal("250000.00"),
                    "unpaid_amount": Decimal("50000.00"),
                    "collection_date": date(2026, 11, 12),
                    "date_1": date(2026, 11, 5),
                    "date_2": date(2026, 11, 12),
                    "in_out_plan": "In Plan",
                    "new_sales_amount": Decimal("200000.00"),
                    "tb_amount": Decimal("30000.00"),
                    "emi_amount": Decimal("20000.00"),
                    "total_collection": Decimal("250000.00"),
                    "lead_status": "HP",
                    "collection_probability": 90,
                    "remarks": "Full clearance expected next week"
                },
                {
                    "customer_name": "Square Textiles Ltd",
                    "paid_amount": Decimal("180000.00"),
                    "unpaid_amount": Decimal("70000.00"),
                    "collection_date": date(2026, 11, 18),
                    "date_1": date(2026, 11, 10),
                    "date_2": date(2026, 11, 18),
                    "in_out_plan": "In Plan",
                    "new_sales_amount": Decimal("150000.00"),
                    "tb_amount": Decimal("20000.00"),
                    "emi_amount": Decimal("10000.00"),
                    "total_collection": Decimal("180000.00"),
                    "lead_status": "P",
                    "collection_probability": 80,
                    "remarks": "Cheque received, under processing"
                },
                {
                    "customer_name": "Apex Footwear Distribution",
                    "paid_amount": Decimal("100000.00"),
                    "unpaid_amount": Decimal("150000.00"),
                    "collection_date": date(2026, 11, 25),
                    "date_1": date(2026, 11, 20),
                    "date_2": date(2026, 11, 25),
                    "in_out_plan": "Out Plan",
                    "new_sales_amount": Decimal("50000.00"),
                    "tb_amount": Decimal("30000.00"),
                    "emi_amount": Decimal("20000.00"),
                    "total_collection": Decimal("100000.00"),
                    "lead_status": "FUP",
                    "collection_probability": 60,
                    "remarks": "Promised clearance by 25th November"
                }
            ]

            for c_item in customers_data:
                customer = ManualScorecardCustomer(
                    scorecard_id=scorecard.id,
                    **c_item
                )
                db.add(customer)

            # Audit log
            audit_log = ManualScorecardAuditLog(
                scorecard_id=scorecard.id,
                changed_by_id=emp_id,
                previous_status=None,
                new_status="DRAFT",
                action="Scorecard Initialized",
                notes="Seed data scorecard created."
            )
            db.add(audit_log)

        db.commit()
        print("Database seeded successfully with teams, users, and sample scorecard!")

    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    run_seed()
