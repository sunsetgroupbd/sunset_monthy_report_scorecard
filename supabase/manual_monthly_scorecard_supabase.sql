-- ===========================================================================
-- Manual Monthly Scorecard Management System - Supabase Complete Script
-- Target: Supabase PostgreSQL (SQL Editor)
--
-- Features:
--   1. Enables pgcrypto and uuid-ossp extensions.
--   2. Creates public.teams and public.profiles with native Supabase UUIDs.
--   3. Creates public.users view for backward compatibility.
--   4. Creates manual_scorecards, manual_scorecard_periods,
--      manual_scorecard_customers, and manual_scorecard_audit_logs.
--   5. INSERTS complete sample data (Teams, Auth Users, Profiles, Scorecard,
--      Weekly Periods 1-5, Targets, and Customer Collection Plan).
--
-- How to run:
--   Open Supabase Dashboard -> SQL Editor -> New Query -> Paste all -> Click Run.
-- ===========================================================================

BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ---------------------------------------------------------------------------
-- 1. Teams Table
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.teams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    code VARCHAR(20) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ---------------------------------------------------------------------------
-- 2. Profiles Table (Linked to Supabase Auth)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    employee_id VARCHAR(8) NOT NULL UNIQUE CHECK (length(employee_id) = 8),
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    designation VARCHAR(100) NOT NULL,
    team_id UUID REFERENCES public.teams(id) ON DELETE SET NULL,
    joining_date DATE NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('ADMIN', 'TL', 'CO', 'EMPLOYEE')),
    supervisor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_profiles_employee_id ON public.profiles(employee_id);
CREATE INDEX IF NOT EXISTS idx_profiles_team_id ON public.profiles(team_id);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_supervisor_id ON public.profiles(supervisor_id);

-- Compatibility view for legacy systems expecting public.users
CREATE OR REPLACE VIEW public.users WITH (security_invoker = true) AS 
SELECT 
    id,
    employee_id,
    full_name,
    email,
    designation,
    team_id,
    supervisor_id AS reporting_manager_id,
    role,
    id AS auth_user_id,
    is_active,
    created_at,
    updated_at
FROM public.profiles;

-- ---------------------------------------------------------------------------
-- 3. Manual Scorecards Table
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.manual_scorecards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    month DATE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'SUBMITTED', 'APPROVED', 'CLOSED')),
    
    -- Attendance
    planned_leave NUMERIC(5, 2) NOT NULL DEFAULT 0.0 CHECK (planned_leave >= 0),
    unauthorized_leave NUMERIC(5, 2) NOT NULL DEFAULT 0.0 CHECK (unauthorized_leave >= 0),
    working_days NUMERIC(5, 2) NOT NULL DEFAULT 0.0 CHECK (working_days >= 0),
    
    -- Forecast (BDT)
    prediction_amount NUMERIC(15, 2) NOT NULL DEFAULT 0.0 CHECK (prediction_amount >= 0),
    
    -- Supervisor Only Evaluation
    sheet_score NUMERIC(6, 2) DEFAULT NULL,
    call_score NUMERIC(6, 2) DEFAULT NULL,
    marking NUMERIC(5, 2) DEFAULT NULL CHECK (marking IS NULL OR (marking >= 0 AND marking <= 100)),
    supervisor_notes TEXT DEFAULT NULL,
    
    -- Portfolio Due Snapshot (EMI)
    emi_due_monthly NUMERIC(15, 2) NOT NULL DEFAULT 0.0 CHECK (emi_due_monthly >= 0),
    emi_client_count INTEGER NOT NULL DEFAULT 0 CHECK (emi_client_count >= 0),
    emi_hold_count INTEGER NOT NULL DEFAULT 0 CHECK (emi_hold_count >= 0),
    emi_cancel_count INTEGER NOT NULL DEFAULT 0 CHECK (emi_cancel_count >= 0),
    
    -- Portfolio Due Snapshot (TB)
    tb_due_amount NUMERIC(15, 2) NOT NULL DEFAULT 0.0 CHECK (tb_due_amount >= 0),
    tb_client_count INTEGER NOT NULL DEFAULT 0 CHECK (tb_client_count >= 0),
    tb_share_count INTEGER NOT NULL DEFAULT 0 CHECK (tb_share_count >= 0),
    tb_hold_count INTEGER NOT NULL DEFAULT 0 CHECK (tb_hold_count >= 0),
    tb_cancel_count INTEGER NOT NULL DEFAULT 0 CHECK (tb_cancel_count >= 0),
    
    -- Timestamps
    submitted_at TIMESTAMPTZ DEFAULT NULL,
    submitted_by_id UUID REFERENCES public.profiles(id) DEFAULT NULL,
    approved_at TIMESTAMPTZ DEFAULT NULL,
    approved_by_id UUID REFERENCES public.profiles(id) DEFAULT NULL,
    closed_at TIMESTAMPTZ DEFAULT NULL,
    closed_by_id UUID REFERENCES public.profiles(id) DEFAULT NULL,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    
    CONSTRAINT uq_manual_scorecard_employee_month UNIQUE (employee_id, month)
);

CREATE INDEX IF NOT EXISTS idx_manual_scorecards_emp_month ON public.manual_scorecards(employee_id, month);
CREATE INDEX IF NOT EXISTS idx_manual_scorecards_status ON public.manual_scorecards(status);

-- ---------------------------------------------------------------------------
-- 4. Manual Scorecard Periods Table (0 = Target, 1..5 = Weekly Periods)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.manual_scorecard_periods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scorecard_id UUID NOT NULL REFERENCES public.manual_scorecards(id) ON DELETE CASCADE,
    period_index INTEGER NOT NULL CHECK (period_index >= 0 AND period_index <= 5),
    
    -- Financial Collections (BDT)
    new_sales NUMERIC(15, 2) NOT NULL DEFAULT 0.0 CHECK (new_sales >= 0),
    tb_amount NUMERIC(15, 2) NOT NULL DEFAULT 0.0 CHECK (tb_amount >= 0),
    emi_amount NUMERIC(15, 2) NOT NULL DEFAULT 0.0 CHECK (emi_amount >= 0),
    total_collection NUMERIC(15, 2) NOT NULL DEFAULT 0.0 CHECK (total_collection >= 0),
    total_collection_override NUMERIC(15, 2) DEFAULT NULL CHECK (total_collection_override IS NULL OR total_collection_override >= 0),
    total_achieved_override NUMERIC(15, 2) DEFAULT NULL CHECK (total_achieved_override IS NULL OR total_achieved_override >= 0),
    
    -- Lead Pipeline
    total_leads INTEGER NOT NULL DEFAULT 0 CHECK (total_leads >= 0),
    fair_leads INTEGER NOT NULL DEFAULT 0 CHECK (fair_leads >= 0),
    fb_leads INTEGER NOT NULL DEFAULT 0 CHECK (fb_leads >= 0),
    hp INTEGER NOT NULL DEFAULT 0 CHECK (hp >= 0),
    p INTEGER NOT NULL DEFAULT 0 CHECK (p >= 0),
    fup INTEGER NOT NULL DEFAULT 0 CHECK (fup >= 0),
    
    -- Activity Metrics
    dialed_calls INTEGER NOT NULL DEFAULT 0 CHECK (dialed_calls >= 0),
    connected_calls INTEGER NOT NULL DEFAULT 0 CHECK (connected_calls >= 0),
    outdoor_visits INTEGER NOT NULL DEFAULT 0 CHECK (outdoor_visits >= 0),
    indoor_cx INTEGER NOT NULL DEFAULT 0 CHECK (indoor_cx >= 0),
    meeting_hours NUMERIC(6, 2) NOT NULL DEFAULT 0.0 CHECK (meeting_hours >= 0),
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    
    CONSTRAINT uq_scorecard_period UNIQUE (scorecard_id, period_index)
);

CREATE INDEX IF NOT EXISTS idx_manual_scorecard_periods_sc_id ON public.manual_scorecard_periods(scorecard_id);

-- ---------------------------------------------------------------------------
-- 5. Manual Scorecard Customers Table
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.manual_scorecard_customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scorecard_id UUID NOT NULL REFERENCES public.manual_scorecards(id) ON DELETE CASCADE,
    customer_name VARCHAR(255) NOT NULL,
    paid_amount NUMERIC(15, 2) NOT NULL DEFAULT 0.0 CHECK (paid_amount >= 0),
    unpaid_amount NUMERIC(15, 2) NOT NULL DEFAULT 0.0 CHECK (unpaid_amount >= 0),
    collection_date DATE DEFAULT NULL,
    date_1 DATE DEFAULT NULL,
    date_2 DATE DEFAULT NULL,
    in_out_plan VARCHAR(100) DEFAULT NULL,
    new_sales_amount NUMERIC(15, 2) NOT NULL DEFAULT 0.0 CHECK (new_sales_amount >= 0),
    tb_amount NUMERIC(15, 2) NOT NULL DEFAULT 0.0 CHECK (tb_amount >= 0),
    emi_amount NUMERIC(15, 2) NOT NULL DEFAULT 0.0 CHECK (emi_amount >= 0),
    total_collection NUMERIC(15, 2) NOT NULL DEFAULT 0.0 CHECK (total_collection >= 0),
    lead_status VARCHAR(20) NOT NULL DEFAULT 'HP' CHECK (lead_status IN ('HP', 'P', 'FUP', 'NI')),
    collection_probability INTEGER NOT NULL DEFAULT 50 CHECK (collection_probability >= 10 AND collection_probability <= 100),
    remarks TEXT DEFAULT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_manual_scorecard_customers_sc_id ON public.manual_scorecard_customers(scorecard_id);

-- ---------------------------------------------------------------------------
-- 6. Audit Logs Table
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.manual_scorecard_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scorecard_id UUID NOT NULL REFERENCES public.manual_scorecards(id) ON DELETE CASCADE,
    changed_by_id UUID NOT NULL REFERENCES public.profiles(id),
    previous_status VARCHAR(20),
    new_status VARCHAR(20),
    action VARCHAR(50) NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_manual_scorecard_audit_logs_sc_id ON public.manual_scorecard_audit_logs(scorecard_id);

-- ---------------------------------------------------------------------------
-- 7. Seed Data Insertions (Sunset Group Bangladesh)
-- ---------------------------------------------------------------------------

-- 7.1 Teams
INSERT INTO public.teams (id, name, code, description) VALUES
    ('11111111-1111-1111-1111-111111111111', 'Dhaka Alpha Sales', 'DHK-ALPHA', 'Dhaka North & Central Core Sales Team'),
    ('22222222-2222-2222-2222-222222222222', 'Chittagong Titans', 'CTG-TITAN', 'Chittagong Regional Sales Team')
ON CONFLICT (code) DO NOTHING;

-- 7.2 Auth Users & Profiles (Default Password: Password123!)
DO $$
DECLARE
    admin_id UUID := 'a0000000-0000-0000-0000-000000000001';
    tl_id UUID    := 'b0000000-0000-0000-0000-000000000002';
    co_id UUID    := 'c0000000-0000-0000-0000-000000000003';
    emp_id UUID   := 'd0000000-0000-0000-0000-000000000004';
    emp2_id UUID  := 'e0000000-0000-0000-0000-000000000005';
BEGIN
    INSERT INTO auth.users (
        id, instance_id, email, encrypted_password, email_confirmed_at,
        raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud
    ) VALUES
        (admin_id, '00000000-0000-0000-0000-000000000000', 'admin@scorecard.com', crypt('Password123!', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Syed Rahman (Admin)"}', now(), now(), 'authenticated', 'authenticated'),
        (tl_id, '00000000-0000-0000-0000-000000000000', 'tl@scorecard.com', crypt('Password123!', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Tariq Hasan (TL)"}', now(), now(), 'authenticated', 'authenticated'),
        (co_id, '00000000-0000-0000-0000-000000000000', 'co@scorecard.com', crypt('Password123!', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Farhana Islam (CO)"}', now(), now(), 'authenticated', 'authenticated'),
        (emp_id, '00000000-0000-0000-0000-000000000000', 'employee@scorecard.com', crypt('Password123!', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Rafiqul Alam (Employee)"}', now(), now(), 'authenticated', 'authenticated'),
        (emp2_id, '00000000-0000-0000-0000-000000000000', 'employee2@scorecard.com', crypt('Password123!', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Nusrat Jahan (Chittagong)"}', now(), now(), 'authenticated', 'authenticated')
    ON CONFLICT (id) DO NOTHING;

    INSERT INTO public.profiles (id, employee_id, full_name, email, designation, team_id, joining_date, role, supervisor_id, is_active)
    VALUES
        (admin_id, '10000001', 'Syed Rahman', 'admin@scorecard.com', 'Head of Sales & Strategy', '11111111-1111-1111-1111-111111111111', '2022-01-15', 'ADMIN', NULL, true),
        (tl_id, '10000002', 'Tariq Hasan', 'tl@scorecard.com', 'Team Leader - Sales', '11111111-1111-1111-1111-111111111111', '2022-06-01', 'TL', admin_id, true),
        (co_id, '10000003', 'Farhana Islam', 'co@scorecard.com', 'Sales Coordinator', '11111111-1111-1111-1111-111111111111', '2023-02-10', 'CO', tl_id, true),
        (emp_id, '10000004', 'Rafiqul Alam', 'employee@scorecard.com', 'Senior Relationship Officer', '11111111-1111-1111-1111-111111111111', '2023-08-01', 'EMPLOYEE', tl_id, true),
        (emp2_id, '10000005', 'Nusrat Jahan', 'employee2@scorecard.com', 'Relationship Officer', '22222222-2222-2222-2222-222222222222', '2024-01-15', 'EMPLOYEE', NULL, true)
    ON CONFLICT (id) DO UPDATE SET
        full_name = EXCLUDED.full_name,
        designation = EXCLUDED.designation,
        role = EXCLUDED.role,
        supervisor_id = EXCLUDED.supervisor_id,
        team_id = EXCLUDED.team_id;

    -- 7.3 Sample Scorecard (November 2026 for Rafiqul Alam)
    INSERT INTO public.manual_scorecards (
        id, employee_id, month, status,
        planned_leave, unauthorized_leave, working_days,
        prediction_amount, sheet_score, call_score, marking, supervisor_notes,
        emi_due_monthly, emi_client_count, emi_hold_count, emi_cancel_count,
        tb_due_amount, tb_client_count, tb_share_count, tb_hold_count, tb_cancel_count
    ) VALUES (
        'f0000000-0000-0000-0000-000000000001',
        emp_id,
        '2026-11-01',
        'DRAFT',
        1.0, 0.0, 24.0,
        1500000.00, 85.0, 90.0, 88.0, 'Consistently strong performance in middle periods. Needs focus on TB collections.',
        450000.00, 15, 2, 0,
        320000.00, 8, 4, 1, 0
    ) ON CONFLICT (employee_id, month) DO NOTHING;

    -- 7.4 Weekly Periods 1-5 + Target (0)
    INSERT INTO public.manual_scorecard_periods (
        scorecard_id, period_index, new_sales, tb_amount, emi_amount, total_collection,
        total_leads, fair_leads, fb_leads, hp, p, fup,
        dialed_calls, connected_calls, outdoor_visits, indoor_cx, meeting_hours
    ) VALUES
        ('f0000000-0000-0000-0000-000000000001', 0, 1000000.00, 300000.00, 200000.00, 1500000.00, 100, 30, 40, 20, 10, 5, 250, 180, 20, 15, 30.0),
        ('f0000000-0000-0000-0000-000000000001', 1, 200000.00, 50000.00, 40000.00, 290000.00, 25, 8, 10, 5, 2, 1, 60, 42, 5, 4, 7.5),
        ('f0000000-0000-0000-0000-000000000001', 2, 250000.00, 80000.00, 45000.00, 375000.00, 22, 6, 8, 4, 3, 1, 55, 38, 4, 3, 6.0),
        ('f0000000-0000-0000-0000-000000000001', 3, 300000.00, 90000.00, 50000.00, 440000.00, 30, 9, 12, 6, 2, 1, 65, 48, 6, 5, 8.0),
        ('f0000000-0000-0000-0000-000000000001', 4, 150000.00, 40000.00, 35000.00, 225000.00, 18, 5, 6, 3, 2, 1, 45, 32, 3, 2, 5.0),
        ('f0000000-0000-0000-0000-000000000001', 5, 120000.00, 30000.00, 25000.00, 175000.00, 12, 3, 4, 2, 1, 1, 30, 22, 2, 2, 4.0)
    ON CONFLICT (scorecard_id, period_index) DO NOTHING;

    -- 7.5 Customer Collection Plan
    INSERT INTO public.manual_scorecard_customers (
        scorecard_id, customer_name, paid_amount, unpaid_amount, collection_date,
        date_1, date_2, in_out_plan, new_sales_amount, tb_amount, emi_amount,
        total_collection, lead_status, collection_probability, remarks
    ) VALUES
        ('f0000000-0000-0000-0000-000000000001', 'Bashundhara Group Project', 250000.00, 50000.00, '2026-11-12', '2026-11-05', '2026-11-12', 'In Plan', 200000.00, 30000.00, 20000.00, 'HP', 90, 'Full clearance expected next week'),
        ('f0000000-0000-0000-0000-000000000001', 'Square Textiles Ltd', 180000.00, 70000.00, '2026-11-18', '2026-11-10', '2026-11-18', 'In Plan', 150000.00, 20000.00, 10000.00, 'P', 80, 'Cheque received, under processing'),
        ('f0000000-0000-0000-0000-000000000001', 'Apex Footwear Distribution', 100000.00, 150000.00, '2026-11-25', '2026-11-20', '2026-11-25', 'Out Plan', 50000.00, 30000.00, 20000.00, 'FUP', 60, 'Promised clearance by 25th November')
    ON CONFLICT DO NOTHING;
END $$;

COMMIT;

-- ---------------------------------------------------------------------------
-- 8. Verification Results
-- ---------------------------------------------------------------------------
SELECT 'Teams Count' AS metric, count(*)::text AS count FROM public.teams
UNION ALL
SELECT 'Profiles Count', count(*)::text FROM public.profiles
UNION ALL
SELECT 'Scorecards Count', count(*)::text FROM public.manual_scorecards
UNION ALL
SELECT 'Periods Count', count(*)::text FROM public.manual_scorecard_periods
UNION ALL
SELECT 'Customers Count', count(*)::text FROM public.manual_scorecard_customers;
