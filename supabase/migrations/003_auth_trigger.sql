-- ====================================================================
-- Migration: 003_auth_trigger.sql
-- Description: Auto-create user profile when user registers via Supabase Auth
-- ====================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  new_emp_id VARCHAR(8);
  next_num INTEGER;
BEGIN
  IF new.raw_user_meta_data->>'employee_id' IS NOT NULL AND length(new.raw_user_meta_data->>'employee_id') = 8 THEN
    new_emp_id := new.raw_user_meta_data->>'employee_id';
  ELSE
    SELECT COALESCE(MAX(SUBSTRING(employee_id FROM 2)::INTEGER), 100000) + 1
    INTO next_num
    FROM public.profiles
    WHERE employee_id ~ '^1[0-9]{7}$';
    
    new_emp_id := '1' || LPAD(COALESCE(next_num, 100006)::TEXT, 7, '0');
  END IF;

  INSERT INTO public.profiles (
    id,
    employee_id,
    full_name,
    email,
    designation,
    role,
    joining_date,
    is_active
  ) VALUES (
    new.id,
    new_emp_id,
    COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.email,
    COALESCE(new.raw_user_meta_data->>'designation', 'Relationship Officer'),
    COALESCE(new.raw_user_meta_data->>'role', 'EMPLOYEE'),
    CURRENT_DATE,
    true
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
