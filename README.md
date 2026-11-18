# Dedicated Manual Monthly Scorecard Management System (Full Stack)

A production-ready enterprise Manual Monthly Scorecard Management System built with **Next.js 14 (App Router)**, **FastAPI**, and **Supabase (PostgreSQL, Auth & Row Level Security)**.

---

## Architecture Overview

```
monthly_report_scorecard/
├── backend/                        # FastAPI REST API (Python 3.12)
│   ├── app/
│   │   ├── core/                   # Config, Database engine, Security/JWT verification
│   │   ├── models/                 # SQLAlchemy ORM models (Teams, Profiles, Scorecards, Periods, Customers, Audits)
│   │   ├── schemas/                # Pydantic v2 validation models
│   │   ├── repositories/           # Atomic upsert, queries, status workflows
│   │   ├── services/               # Period sums, achievement %, customer summaries, transition checks
│   │   ├── dependencies/           # Supabase JWT extraction, role authorization, team isolation
│   │   ├── routers/                # REST endpoints: /manual-scorecard, /users, /teams, /auth
│   │   └── main.py                 # FastAPI application entrypoint with CORS
│   ├── tests/                      # Pytest automated test suite (9 test suites)
│   ├── seed_data.py                # Database seed script for local test profiles & sample scorecard
│   ├── requirements.txt            # Python dependencies
│   ├── pytest.ini                  # Pytest configuration
│   └── .env                        # Backend environment configuration
│
├── frontend/                       # Next.js 14 App Router (React, TypeScript, Tailwind CSS)
│   ├── app/
│   │   ├── login/                  # Enterprise login page (Supabase Auth & quick role switch)
│   │   ├── forgot-password/        # Password recovery email request
│   │   ├── reset-password/         # Password update flow
│   │   ├── dashboard/              # Performance overview & accessible subordinates
│   │   ├── manual-scorecard/       # Complete Manual Scorecard (Header, Tables 1, 2 & 3, Evaluation)
│   │   │   └── print/              # A4 Landscape print & PDF export view
│   │   └── admin/users/            # Admin console for employee & team management
│   ├── components/                 # Reusable UI components (Navbar, Tables, Cards, Modals)
│   ├── hooks/                      # useAuth authentication hook & session state
│   ├── lib/
│   │   ├── api/                    # Typed API client for FastAPI backend
│   │   ├── supabase/               # Supabase JS client
│   │   └── calculations.ts         # Reactive live calculations (Totals, Achievement %, BDT formatting)
│   ├── types/                      # TypeScript definitions for Scorecards, Periods, Customers, Profiles
│   ├── tests/                      # Frontend calculation unit tests (node:test)
│   └── .env.local                  # Frontend environment configuration
│
└── supabase/                       # Supabase Database Migrations & Seeds
    ├── migrations/
    │   ├── 001_initial_schema.sql  # DDL with constraints, cascades, indexes, unique keys
    │   └── 002_rls_policies.sql    # Row Level Security policies for all tables
    └── seed.sql                    # SQL seed script with teams, auth users, and initial scorecard
```

---

## Key Features

1. **Supabase Database & Authentication**:
   - Single source of authentication with Supabase Auth.
   - Database-level Row Level Security (RLS) enforcing employee data isolation.
   - FastAPI verifies Supabase JWT access tokens before servicing any protected requests.
2. **Role-Based Access Control (RBAC)**:
   - **ADMIN**: Full access to all employee scorecards; can create, update, review, approve, close, and reopen scorecards; full user and team administration.
   - **TL (Team Leader)**: Can view and manage assigned subordinate scorecards; enter supervisor scores and notes; approve/reject submissions; restricted from other teams.
   - **CO (Coordinator)**: Can view assigned team employees; enter supervisor evaluation scores; restricted from unrelated teams.
   - **EMPLOYEE**: Can view and edit their own DRAFT scorecard; submit for review; strictly blocked from editing supervisor scoring fields or accessing other employees' sheets.
3. **Executive Header & Employee Profile**:
   - Month selector (`YYYY-MM`) and employee selector.
   - 8-digit Employee ID, Designation, Team, Joining Date.
   - Attendance fields: `planned_leave`, `unauthorized_leave`, `working_days`.
   - Forecast: `prediction_amount` (BDT).
   - Supervisor-only evaluation: `sheet_score`, `call_score`, `marking` (0–100), `supervisor_notes`.
4. **Table 1: Performance by Period (Day 1 – End of Month)**:
   - 5 manually editable weekly periods:
     - Period 1: Day 1–7
     - Period 2: Day 8–14
     - Period 3: Day 15–21
     - Period 4: Day 22–28
     - Period 5: Day 29–End of Month
   - Monthly Target row (Period 0).
   - Financial Collections (`new_sales`, `tb_amount`, `emi_amount`, `total_collection`).
   - Lead Pipeline (`total_leads`, `fair_leads`, `fb_leads`, `hp`, `p`, `fup`).
   - Activity Metrics (`dialed_calls`, `connected_calls`, `outdoor_visits`, `indoor_cx`, `meeting_hours`).
   - Summary Rows:
     - `Total Achieved` = Sum of Periods 1–5.
     - `Achievement %` = Total Achieved / Monthly Target × 100 (safe against zero targets).
   - Instant live reactive calculations.
   - Manual override support on calculated totals with clear visual distinction.
5. **Table 2: Customer Collection Plan**:
   - Editable customer collection rows with New Sales, TB, and EMI amounts.
   - Automatic `total_collection` calculation.
   - Add row, Edit row, Delete with confirmation modal.
   - Live summary totals: `Total Paid`, `Total Unpaid`, `Weighted Expected Collection`.
6. **Table 3: Portfolio Due Snapshot**:
   - EMI Portfolio: `emi_due_monthly`, `emi_client_count`, `emi_hold_count`, `emi_cancel_count`.
   - TB Portfolio: `tb_due_amount`, `tb_client_count`, `tb_share_count`, `tb_hold_count`, `tb_cancel_count`.
7. **Status Workflow & Closed Locking**:
   - DRAFT ➔ SUBMITTED ➔ APPROVED ➔ CLOSED.
   - Closed scorecards are locked against normal modifications.
   - Reopen capability restricted to Admins.
   - Full audit logging of status transitions and changes.
8. **Print & PDF Export**:
   - Dedicated route at `/manual-scorecard/print`.
   - A4 Landscape layout, clean typography, hides interactive buttons.
9. **Responsive Design**:
   - Pinned sticky headers and columns on desktop.
   - Expandable Card Mode toggle for mobile devices.

---

## Environment Variables

### Frontend (`frontend/.env.local`)
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-supabase-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

### Backend (`backend/.env`)
```env
SUPABASE_URL=https://your-supabase-project.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
SUPABASE_DB_URL=postgresql://postgres:[PASSWORD]@db.[REF].supabase.co:5432/postgres
JWT_SECRET=super-secret-jwt-token-with-at-least-32-bytes-long
APP_TIMEZONE=Asia/Dhaka
```
*(Note: If `SUPABASE_DB_URL` is omitted, the backend automatically falls back to local SQLite `sqlite:///./scorecard_local.db` for zero-configuration testing).*

---

## Running the Application

### 1. Backend Setup & Run

```bash
cd backend

# Create & activate Python 3.12 virtual environment
python -m venv .venv
.\.venv\Scripts\activate   # On Windows
# source .venv/bin/activate # On Unix/macOS

# Install dependencies
pip install -r requirements.txt

# Run seed script (seeds initial teams, profiles, and sample scorecard)
python seed_data.py

# Run FastAPI server
uvicorn app.main:app --reload --port 8000
```
API Documentation will be available at:
- Swagger UI: `http://localhost:8000/api/v1/docs`
- ReDoc: `http://localhost:8000/api/v1/redoc`

### 2. Frontend Setup & Run

```bash
cd frontend

# Install dependencies
npm install

# Build Next.js application
npm run build

# Start production server (or npm run dev for dev server)
npm run start
```
Frontend will be accessible at: `http://localhost:3000`.

---

## Running Automated Tests

### Backend Pytest Suite
```bash
cd backend
.\.venv\Scripts\pytest.exe -v
```
Verifies:
- Supabase token authentication & rejection of unauthorized requests.
- Scorecard initialization (empty draft structure).
- Employee permission isolation (cannot view/edit other employees' records).
- TL/CO subordinate permissions (can only access assigned team subordinates).
- Scorecard CRUD and atomic transactions.
- Weekly period calculations (Total Achieved = sum of P1–P5, Achievement %).
- Customer collection calculations (Total Paid, Total Unpaid, Expected Collection).
- Supervisor evaluation restrictions (employees cannot tamper with marks).
- Workflow status transitions and closed scorecard locking.
- Manual override preservation.
- Atomic rollback on invalid payload.

### Frontend Calculation Tests
```bash
cd frontend
npm test
```
Verifies:
- BDT currency formatting (`৳ 1,50,000.00`).
- Period total collection summing (`new_sales + tb_amount + emi_amount`).
- Manual override preservation.
- Customer collection calculations and weighted expected collection.
- Safe achievement % division and zero-target safety.

---

## Test Accounts (Pre-seeded)

| Role | Email | Password | Scope |
|------|-------|----------|-------|
| **ADMIN** | `admin@scorecard.com` | `Password123!` | Full organization, reopen closed scorecards, manage users/teams |
| **TL** | `tl@scorecard.com` | `Password123!` | Dhaka Alpha Sales Team subordinates, enters supervisor scores |
| **CO** | `co@scorecard.com` | `Password123!` | Dhaka Alpha Sales Team, review & evaluation |
| **EMPLOYEE** | `employee@scorecard.com` | `Password123!` | Own scorecard only (Rafiqul Alam, ID: 10000004) |
| **EMPLOYEE 2** | `employee2@scorecard.com` | `Password123!` | Chittagong Titans Team (Nusrat Jahan, ID: 10000005) |
