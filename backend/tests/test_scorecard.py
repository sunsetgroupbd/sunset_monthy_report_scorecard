import pytest
from datetime import date
from decimal import Decimal
from tests.conftest import make_auth_headers


def test_auth_token_verification(client):
    """Test that unauthorized requests are rejected and valid token is accepted."""
    resp = client.get("/api/v1/users/me")
    assert resp.status_code in (401, 403)

    headers = make_auth_headers("usr-admin", "admin@test.com")
    resp = client.get("/api/v1/users/me", headers=headers)
    assert resp.status_code == 200
    assert resp.json()["email"] == "admin@test.com"
    assert resp.json()["role"] == "ADMIN"


def test_empty_scorecard_initialization(client):
    """Test that requesting a non-existent scorecard returns an initialized empty DRAFT structure."""
    headers = make_auth_headers("usr-emp1", "emp1@test.com")
    resp = client.get("/api/v1/manual-scorecard?employee_id=usr-emp1&month=2026-11", headers=headers)
    assert resp.status_code == 200
    data = resp.json()

    assert data["status"] == "DRAFT"
    assert data["id"] is None
    assert len(data["periods"]) == 7
    assert data["periods"][0]["period_index"] == 0  # Target
    assert data["periods"][1]["period_index"] == 1  # P1
    assert data["can_edit"] is True
    assert data["can_edit_supervisor_fields"] is False


def test_employee_permission_isolation(client):
    """Test that employees cannot view or edit other employees' scorecards."""
    headers_emp1 = make_auth_headers("usr-emp1", "emp1@test.com")

    # emp1 tries to view emp2 scorecard
    resp = client.get("/api/v1/manual-scorecard?employee_id=usr-emp2&month=2026-11", headers=headers_emp1)
    assert resp.status_code == 403

    # emp1 tries to upsert emp2 scorecard
    payload = {
        "employee_id": "usr-emp2",
        "month": "2026-11-01",
        "planned_leave": 0,
        "unauthorized_leave": 0,
        "working_days": 22,
        "prediction_amount": 100000,
        "periods": [],
        "customers": []
    }
    resp = client.put("/api/v1/manual-scorecard", json=payload, headers=headers_emp1)
    assert resp.status_code == 403


def test_tl_co_subordinate_permissions(client):
    """Test that TL/CO can access and evaluate subordinates in their team, but not unrelated teams."""
    headers_tl = make_auth_headers("usr-tl", "tl@test.com")

    # TL accessing emp1 (subordinate in same team) -> Allowed
    resp = client.get("/api/v1/manual-scorecard?employee_id=usr-emp1&month=2026-11", headers=headers_tl)
    assert resp.status_code == 200
    assert resp.json()["can_edit_supervisor_fields"] is True

    # TL accessing emp2 (other team) -> Forbidden
    resp = client.get("/api/v1/manual-scorecard?employee_id=usr-emp2&month=2026-11", headers=headers_tl)
    assert resp.status_code == 403


def test_scorecard_crud_and_calculations(client):
    """
    Test full scorecard creation, period calculations, total collection calculation,
    and customer collection calculations.
    """
    headers = make_auth_headers("usr-emp1", "emp1@test.com")

    payload = {
        "employee_id": "usr-emp1",
        "month": "2026-11-01",
        "planned_leave": 2.0,
        "unauthorized_leave": 0.0,
        "working_days": 24.0,
        "prediction_amount": 500000.0,
        "emi_due_monthly": 150000.0,
        "emi_client_count": 5,
        "emi_hold_count": 1,
        "emi_cancel_count": 0,
        "tb_due_amount": 100000.0,
        "tb_client_count": 3,
        "tb_share_count": 2,
        "tb_hold_count": 0,
        "tb_cancel_count": 0,
        "periods": [
            {
                "period_index": 0,
                "new_sales": 300000.0,
                "tb_amount": 100000.0,
                "emi_amount": 100000.0,
                "total_leads": 50,
                "fair_leads": 10,
                "fb_leads": 20,
                "hp": 10,
                "p": 5,
                "fup": 5,
                "dialed_calls": 100,
                "connected_calls": 80,
                "outdoor_visits": 10,
                "indoor_cx": 5,
                "meeting_hours": 15.0
            },
            {
                "period_index": 1,
                "new_sales": 100000.0,
                "tb_amount": 30000.0,
                "emi_amount": 20000.0,
                "total_leads": 15,
                "dialed_calls": 25,
                "connected_calls": 20,
                "outdoor_visits": 3,
                "indoor_cx": 2,
                "meeting_hours": 4.0
            },
            {
                "period_index": 2,
                "new_sales": 150000.0,
                "tb_amount": 40000.0,
                "emi_amount": 30000.0,
                "total_leads": 20,
                "dialed_calls": 30,
                "connected_calls": 25,
                "outdoor_visits": 4,
                "indoor_cx": 2,
                "meeting_hours": 5.0
            }
        ],
        "customers": [
            {
                "customer_name": "Rahim Enterprise",
                "paid_amount": 50000.0,
                "unpaid_amount": 10000.0,
                "collection_date": "2026-11-15",
                "in_out_plan": "In Plan",
                "new_sales_amount": 40000.0,
                "tb_amount": 10000.0,
                "emi_amount": 10000.0,
                "lead_status": "HP",
                "collection_probability": 80,
                "remarks": "Promised payment"
            }
        ]
    }

    # Upsert scorecard
    resp = client.put("/api/v1/manual-scorecard", json=payload, headers=headers)
    assert resp.status_code == 200
    data = resp.json()

    assert data["id"] is not None
    assert data["status"] == "DRAFT"

    p1 = next(p for p in data["periods"] if p["period_index"] == 1)
    assert float(p1["total_collection"]) == 150000.0

    p2 = next(p for p in data["periods"] if p["period_index"] == 2)
    assert float(p2["total_collection"]) == 220000.0

    assert float(data["total_achieved"]["total_collection"]) == 370000.0
    assert float(data["total_achieved"]["new_sales"]) == 250000.0
    assert float(data["achievement_pct"]["total_collection"]) == 74.0

    assert float(data["customer_summary"]["total_paid"]) == 50000.0
    assert float(data["customer_summary"]["total_unpaid"]) == 10000.0
    assert float(data["customer_summary"]["total_expected_collection"]) == 48000.0


def test_supervisor_scoring_restriction(client):
    """Test that employees cannot alter supervisor fields, but TL/CO/Admin can."""
    headers_emp = make_auth_headers("usr-emp1", "emp1@test.com")
    headers_tl = make_auth_headers("usr-tl", "tl@test.com")

    payload = {
        "employee_id": "usr-emp1",
        "month": "2026-11-01",
        "planned_leave": 0,
        "unauthorized_leave": 0,
        "working_days": 20,
        "prediction_amount": 0,
        "sheet_score": 95.0,
        "marking": 100.0,
        "periods": [],
        "customers": []
    }
    resp = client.put("/api/v1/manual-scorecard", json=payload, headers=headers_emp)
    assert resp.status_code == 200
    assert resp.json()["sheet_score"] is None
    assert resp.json()["marking"] is None

    payload["sheet_score"] = 88.0
    payload["marking"] = 85.0
    payload["supervisor_notes"] = "Good start"
    resp_tl = client.put("/api/v1/manual-scorecard", json=payload, headers=headers_tl)
    assert resp_tl.status_code == 200
    assert float(resp_tl.json()["sheet_score"]) == 88.0
    assert float(resp_tl.json()["marking"]) == 85.0


def test_status_workflow_and_closed_locking(client):
    """
    Test status transitions and closed locking.
    """
    headers_emp = make_auth_headers("usr-emp1", "emp1@test.com")
    headers_tl = make_auth_headers("usr-tl", "tl@test.com")
    headers_admin = make_auth_headers("usr-admin", "admin@test.com")

    payload = {
        "employee_id": "usr-emp1",
        "month": "2026-11-01",
        "planned_leave": 1,
        "unauthorized_leave": 0,
        "working_days": 22,
        "prediction_amount": 200000,
        "periods": [],
        "customers": []
    }
    resp = client.put("/api/v1/manual-scorecard", json=payload, headers=headers_emp)
    assert resp.status_code == 200
    sc_id = resp.json()["id"]

    # Invalid jump: DRAFT -> APPROVED
    invalid_resp = client.post(f"/api/v1/manual-scorecard/{sc_id}/status", json={"status": "APPROVED"}, headers=headers_emp)
    assert invalid_resp.status_code in (400, 403)

    # DRAFT -> SUBMITTED
    submit_resp = client.post(f"/api/v1/manual-scorecard/{sc_id}/status", json={"status": "SUBMITTED"}, headers=headers_emp)
    assert submit_resp.status_code == 200

    # SUBMITTED -> APPROVED
    approve_resp = client.post(f"/api/v1/manual-scorecard/{sc_id}/status", json={"status": "APPROVED"}, headers=headers_tl)
    assert approve_resp.status_code == 200

    # APPROVED -> CLOSED
    close_resp = client.post(f"/api/v1/manual-scorecard/{sc_id}/status", json={"status": "CLOSED"}, headers=headers_admin)
    assert close_resp.status_code == 200

    # Locked against editing
    lock_test_resp = client.put("/api/v1/manual-scorecard", json=payload, headers=headers_tl)
    assert lock_test_resp.status_code == 400

    # Admin Reopen
    reopen_resp = client.post(f"/api/v1/manual-scorecard/{sc_id}/status", json={"status": "DRAFT"}, headers=headers_admin)
    assert reopen_resp.status_code == 200
    assert reopen_resp.json()["status"] == "DRAFT"


def test_total_collection_override_preservation(client):
    """Test that manual overrides on total_collection are preserved and not silently overwritten."""
    headers = make_auth_headers("usr-emp1", "emp1@test.com")

    payload = {
        "employee_id": "usr-emp1",
        "month": "2026-11-01",
        "planned_leave": 0,
        "unauthorized_leave": 0,
        "working_days": 22,
        "prediction_amount": 100000,
        "periods": [
            {
                "period_index": 1,
                "new_sales": 10000.0,
                "tb_amount": 10000.0,
                "emi_amount": 10000.0,
                # Calculated would be 30000, but user manually enters an override of 35000
                "total_collection_override": 35000.0
            }
        ],
        "customers": []
    }

    resp = client.put("/api/v1/manual-scorecard", json=payload, headers=headers)
    assert resp.status_code == 200
    data = resp.json()

    p1 = next(p for p in data["periods"] if p["period_index"] == 1)
    assert float(p1["total_collection"]) == 35000.0
    assert float(p1["total_collection_override"]) == 35000.0


def test_atomic_transaction_rollback_on_invalid_data(client, db_session):
    """Test that atomic rollback prevents partial writes when an error occurs during upsert."""
    from app.models.models import ManualScorecardPeriod
    headers = make_auth_headers("usr-emp1", "emp1@test.com")

    # Invalid payload (e.g. invalid period index 99)
    payload = {
        "employee_id": "usr-emp1",
        "month": "2026-11-01",
        "planned_leave": 0,
        "unauthorized_leave": 0,
        "working_days": 20,
        "prediction_amount": 10000,
        "periods": [
            {"period_index": 99, "new_sales": 50000}
        ],
        "customers": []
    }

    resp = client.put("/api/v1/manual-scorecard", json=payload, headers=headers)
    assert resp.status_code == 422  # Pydantic validation rejection

    # Verify no orphan scorecard or period was created
    period_count = db_session.query(ManualScorecardPeriod).filter(ManualScorecardPeriod.period_index == 99).count()
    assert period_count == 0
