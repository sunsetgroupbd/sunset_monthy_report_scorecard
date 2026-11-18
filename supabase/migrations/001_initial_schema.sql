-- ====================================================================
-- Migration: 001_initial_schema.sql
-- Description: Core schema for Manual Monthly Scorecard System
-- ====================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Teams Table
CREATE TABLE IF NOT EXISTS public.teams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    code VARCHAR(20) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. Profiles Table (Linked to Supabase Auth)
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

-- Indexes for profiles
CREATE INDEX IF NOT EXISTS idx_profiles_employee_id ON public.profiles(employee_id);
CREATE INDEX IF NOT EXISTS idx_profiles_team_id ON public.profiles(team_id);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_supervisor_id ON public.profiles(supervisor_id);

-- 3. Manual Scorecards Table
CREATE TABLE IF NOT EXISTS public.manual_scorecards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    month DATE NOT NULL, -- Stored as the 1st of the month (e.g. 2026-11-01)
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
    
    -- Audit / Workflow timestamps
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

-- 4. Manual Scorecard Periods Table (Periods 1-5 + 0 for Target)
CREATE TABLE IF NOT EXISTS public.manual_scorecard_periods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scorecard_id UUID NOT NULL REFERENCES public.manual_scorecards(id) ON DELETE CASCADE,
    period_index INTEGER NOT NULL CHECK (period_index >= 0 AND period_index <= 5),
    
    -- Financial Collections
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

-- 5. Manual Scorecard Customers Table
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

-- 6. Audit Logs Table
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
