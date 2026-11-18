-- ====================================================================
-- Seed Data: seed.sql
-- Description: Seed initial teams, auth users, and profiles
-- ====================================================================

-- 1. Insert Teams
INSERT INTO public.teams (id, name, code, description) VALUES
    ('11111111-1111-1111-1111-111111111111', 'Dhaka Alpha Sales', 'DHK-ALPHA', 'Dhaka North & Central Core Sales Team'),
    ('22222222-2222-2222-2222-222222222222', 'Chittagong Titans', 'CTG-TITAN', 'Chittagong Regional Sales Team')
ON CONFLICT (code) DO NOTHING;

-- 2. Insert Test Users in auth.users (if using local Supabase or direct SQL)
-- Standard hashed password for test users: Password123!
-- encrypted_password hash generated using bcrypt:
-- $2a$10$w8TfG9m0h1N4qPZ2f2Y5ueO1UuY1uO/5R7x9u7M5P0C0Xy0K.Y0K2 (or placeholder for local dev)

-- Helper to safely seed auth.users if auth schema is accessible
DO $$
DECLARE
    admin_id UUID := 'a0000000-0000-0000-0000-000000000001';
    tl_id UUID    := 'b0000000-0000-0000-0000-000000000002';
    co_id UUID    := 'c0000000-0000-0000-0000-000000000003';
    emp_id UUID   := 'd0000000-0000-0000-0000-000000000004';
    emp2_id UUID  := 'e0000000-0000-0000-0000-000000000005';
BEGIN
    -- Only insert into auth.users if table exists and accessible
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'auth' AND table_name = 'users') THEN
        INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud)
        VALUES
            (admin_id, '00000000-0000-0000-0000-000000000000', 'admin@scorecard.com', crypt('Password123!', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Syed Rahman (Admin)"}', now(), now(), 'authenticated', 'authenticated'),
            (tl_id, '00000000-0000-0000-0000-000000000000', 'tl@scorecard.com', crypt('Password123!', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Tariq Hasan (TL)"}', now(), now(), 'authenticated', 'authenticated'),
            (co_id, '00000000-0000-0000-0000-000000000000', 'co@scorecard.com', crypt('Password123!', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Farhana Islam (CO)"}', now(), now(), 'authenticated', 'authenticated'),
            (emp_id, '00000000-0000-0000-0000-000000000000', 'employee@scorecard.com', crypt('Password123!', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Rafiqul Alam (Employee)"}', now(), now(), 'authenticated', 'authenticated'),
            (emp2_id, '00000000-0000-0000-0000-000000000000', 'employee2@scorecard.com', crypt('Password123!', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Nusrat Jahan (Chittagong)"}', now(), now(), 'authenticated', 'authenticated')
        ON CONFLICT (id) DO NOTHING;
    END IF;

    -- 3. Insert Profiles
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

    -- 4. Sample Scorecard for Rafiqul Alam (2026-11-01)
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

    -- Insert Periods (Target = 0, Periods 1 to 5)
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

    -- Insert Sample Customers
    INSERT INTO public.manual_scorecard_customers (
        scorecard_id, customer_name, paid_amount, unpaid_amount, collection_date,
        date_1, date_2, in_out_plan, new_sales_amount, tb_amount, emi_amount,
        total_collection, lead_status, collection_probability, remarks
    ) VALUES
        ('f0000000-0000-0000-0000-000000000001', 'Bashundhara Group Project', 250000.00, 50000.00, '2026-11-12', '2026-11-05', '2026-11-12', 'In Plan', 200000.00, 30000.00, 20000.00, 250000.00, 'HP', 90, 'Full clearance expected next week'),
        ('f0000000-0000-0000-0000-000000000001', 'Square Textiles Ltd', 180000.00, 70000.00, '2026-11-18', '2026-11-10', '2026-11-18', 'In Plan', 150000.00, 20000.00, 10000.00, 180000.00, 'P', 80, 'Cheque received, under processing'),
        ('f0000000-0000-0000-0000-000000000001', 'Apex Footwear Distribution', 100000.00, 150000.00, '2026-11-25', '2026-11-20', '2026-11-25', 'Out Plan', 50000.00, 30000.00, 20000.00, 100000.00, 'FUP', 60, 'Promised clearance by 25th November')
    ON CONFLICT DO NOTHING;

END $$;
