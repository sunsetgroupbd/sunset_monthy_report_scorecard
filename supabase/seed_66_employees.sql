-- ====================================================================
-- Seed 66 Employees for Sunset Group
-- Generated on: 2026-11-18T07:29:34.331Z
-- Total Employees: 66
-- Default Password: Password123!
-- ====================================================================
DO $$
DECLARE
  v_user_id uuid;
  v_team_id uuid := '11111111-1111-1111-1111-111111111111'::uuid;
  v_encrypted_password text := crypt('Password123!', gen_salt('bf'));
BEGIN

  -- Employee 1: Abu Jafar
  v_user_id := 'b1260972-911b-4013-a56c-0200008ef11f'::uuid;

  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'abu.jafar@sunsetgroupbd.com') THEN
    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at, phone
    ) VALUES (
      '00000000-0000-0000-0000-000000000000'::uuid, v_user_id, 'authenticated', 'authenticated',
      'abu.jafar@sunsetgroupbd.com', v_encrypted_password, NOW(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object('full_name', 'Abu Jafar', 'employee_id', '20240059', 'username', 'abu.jafar', 'designation', 'Asst. Manager (Sales & Marketing)', 'role', 'CO'),
      NOW(), NOW(), '1332508958'
    );
  ELSE
    SELECT id INTO v_user_id FROM auth.users WHERE email = 'abu.jafar@sunsetgroupbd.com';
    UPDATE auth.users
    SET 
      encrypted_password = v_encrypted_password,
      raw_user_meta_data = jsonb_build_object('full_name', 'Abu Jafar', 'employee_id', '20240059', 'username', 'abu.jafar', 'designation', 'Asst. Manager (Sales & Marketing)', 'role', 'CO'),
      updated_at = NOW()
    WHERE id = v_user_id;
  END IF;

  INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, created_at, updated_at)
  VALUES (gen_random_uuid(), v_user_id::text, v_user_id, jsonb_build_object('sub', v_user_id::text, 'email', 'abu.jafar@sunsetgroupbd.com'), 'email', NOW(), NOW())
  ON CONFLICT (provider, provider_id) DO NOTHING;

  INSERT INTO public.profiles (id, employee_id, full_name, email, designation, team_id, joining_date, role, is_active, created_at, updated_at)
  VALUES (v_user_id, '20240059', 'Abu Jafar', 'abu.jafar@sunsetgroupbd.com', 'Asst. Manager (Sales & Marketing)', v_team_id, CURRENT_DATE, 'CO', true, NOW(), NOW())
  ON CONFLICT (id) DO UPDATE SET
    employee_id = EXCLUDED.employee_id,
    full_name = EXCLUDED.full_name,
    designation = EXCLUDED.designation,
    team_id = EXCLUDED.team_id,
    role = EXCLUDED.role,
    is_active = true,
    updated_at = NOW();

  -- Employee 2: Mariam Khanam
  v_user_id := 'ebfa0a1a-b71d-440a-a9c4-36bad47ad41f'::uuid;

  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'mariam.khanam@sunsetgroupbd.com') THEN
    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at, phone
    ) VALUES (
      '00000000-0000-0000-0000-000000000000'::uuid, v_user_id, 'authenticated', 'authenticated',
      'mariam.khanam@sunsetgroupbd.com', v_encrypted_password, NOW(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object('full_name', 'Mariam Khanam', 'employee_id', '20240062', 'username', 'mariam.khanam', 'designation', 'Deputy Manager (Sales & Marketing)', 'role', 'CO'),
      NOW(), NOW(), '1332508943'
    );
  ELSE
    SELECT id INTO v_user_id FROM auth.users WHERE email = 'mariam.khanam@sunsetgroupbd.com';
    UPDATE auth.users
    SET 
      encrypted_password = v_encrypted_password,
      raw_user_meta_data = jsonb_build_object('full_name', 'Mariam Khanam', 'employee_id', '20240062', 'username', 'mariam.khanam', 'designation', 'Deputy Manager (Sales & Marketing)', 'role', 'CO'),
      updated_at = NOW()
    WHERE id = v_user_id;
  END IF;

  INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, created_at, updated_at)
  VALUES (gen_random_uuid(), v_user_id::text, v_user_id, jsonb_build_object('sub', v_user_id::text, 'email', 'mariam.khanam@sunsetgroupbd.com'), 'email', NOW(), NOW())
  ON CONFLICT (provider, provider_id) DO NOTHING;

  INSERT INTO public.profiles (id, employee_id, full_name, email, designation, team_id, joining_date, role, is_active, created_at, updated_at)
  VALUES (v_user_id, '20240062', 'Mariam Khanam', 'mariam.khanam@sunsetgroupbd.com', 'Deputy Manager (Sales & Marketing)', v_team_id, CURRENT_DATE, 'CO', true, NOW(), NOW())
  ON CONFLICT (id) DO UPDATE SET
    employee_id = EXCLUDED.employee_id,
    full_name = EXCLUDED.full_name,
    designation = EXCLUDED.designation,
    team_id = EXCLUDED.team_id,
    role = EXCLUDED.role,
    is_active = true,
    updated_at = NOW();

  -- Employee 3: Sheikh Eitty Akter Moon
  v_user_id := '0a6660d4-3977-4e0e-a03a-fba2fb51f32d'::uuid;

  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'sheikh.moon@sunsetgroupbd.com') THEN
    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at, phone
    ) VALUES (
      '00000000-0000-0000-0000-000000000000'::uuid, v_user_id, 'authenticated', 'authenticated',
      'sheikh.moon@sunsetgroupbd.com', v_encrypted_password, NOW(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object('full_name', 'Sheikh Eitty Akter Moon', 'employee_id', '20240063', 'username', 'sheikh.moon', 'designation', 'Asst. Manager (Sales & Marketing)', 'role', 'CO'),
      NOW(), NOW(), '1332508948'
    );
  ELSE
    SELECT id INTO v_user_id FROM auth.users WHERE email = 'sheikh.moon@sunsetgroupbd.com';
    UPDATE auth.users
    SET 
      encrypted_password = v_encrypted_password,
      raw_user_meta_data = jsonb_build_object('full_name', 'Sheikh Eitty Akter Moon', 'employee_id', '20240063', 'username', 'sheikh.moon', 'designation', 'Asst. Manager (Sales & Marketing)', 'role', 'CO'),
      updated_at = NOW()
    WHERE id = v_user_id;
  END IF;

  INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, created_at, updated_at)
  VALUES (gen_random_uuid(), v_user_id::text, v_user_id, jsonb_build_object('sub', v_user_id::text, 'email', 'sheikh.moon@sunsetgroupbd.com'), 'email', NOW(), NOW())
  ON CONFLICT (provider, provider_id) DO NOTHING;

  INSERT INTO public.profiles (id, employee_id, full_name, email, designation, team_id, joining_date, role, is_active, created_at, updated_at)
  VALUES (v_user_id, '20240063', 'Sheikh Eitty Akter Moon', 'sheikh.moon@sunsetgroupbd.com', 'Asst. Manager (Sales & Marketing)', v_team_id, CURRENT_DATE, 'CO', true, NOW(), NOW())
  ON CONFLICT (id) DO UPDATE SET
    employee_id = EXCLUDED.employee_id,
    full_name = EXCLUDED.full_name,
    designation = EXCLUDED.designation,
    team_id = EXCLUDED.team_id,
    role = EXCLUDED.role,
    is_active = true,
    updated_at = NOW();

  -- Employee 4: Momtaz Parvin Mou
  v_user_id := '2082961b-77fc-41a1-aea2-dc5fb76cc354'::uuid;

  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'momtaz.mou@sunsetgroupbd.com') THEN
    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at, phone
    ) VALUES (
      '00000000-0000-0000-0000-000000000000'::uuid, v_user_id, 'authenticated', 'authenticated',
      'momtaz.mou@sunsetgroupbd.com', v_encrypted_password, NOW(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object('full_name', 'Momtaz Parvin Mou', 'employee_id', '20240064', 'username', 'momtaz.mou', 'designation', 'Manager (Sales & Marketing)', 'role', 'TL'),
      NOW(), NOW(), '1332508956'
    );
  ELSE
    SELECT id INTO v_user_id FROM auth.users WHERE email = 'momtaz.mou@sunsetgroupbd.com';
    UPDATE auth.users
    SET 
      encrypted_password = v_encrypted_password,
      raw_user_meta_data = jsonb_build_object('full_name', 'Momtaz Parvin Mou', 'employee_id', '20240064', 'username', 'momtaz.mou', 'designation', 'Manager (Sales & Marketing)', 'role', 'TL'),
      updated_at = NOW()
    WHERE id = v_user_id;
  END IF;

  INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, created_at, updated_at)
  VALUES (gen_random_uuid(), v_user_id::text, v_user_id, jsonb_build_object('sub', v_user_id::text, 'email', 'momtaz.mou@sunsetgroupbd.com'), 'email', NOW(), NOW())
  ON CONFLICT (provider, provider_id) DO NOTHING;

  INSERT INTO public.profiles (id, employee_id, full_name, email, designation, team_id, joining_date, role, is_active, created_at, updated_at)
  VALUES (v_user_id, '20240064', 'Momtaz Parvin Mou', 'momtaz.mou@sunsetgroupbd.com', 'Manager (Sales & Marketing)', v_team_id, CURRENT_DATE, 'TL', true, NOW(), NOW())
  ON CONFLICT (id) DO UPDATE SET
    employee_id = EXCLUDED.employee_id,
    full_name = EXCLUDED.full_name,
    designation = EXCLUDED.designation,
    team_id = EXCLUDED.team_id,
    role = EXCLUDED.role,
    is_active = true,
    updated_at = NOW();

  -- Employee 5: Nahid Hasan Emon
  v_user_id := 'fc894ce9-6d6b-4df6-a789-7dc17cec15d8'::uuid;

  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'nahid.emon@sunsetgroupbd.com') THEN
    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at, phone
    ) VALUES (
      '00000000-0000-0000-0000-000000000000'::uuid, v_user_id, 'authenticated', 'authenticated',
      'nahid.emon@sunsetgroupbd.com', v_encrypted_password, NOW(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object('full_name', 'Nahid Hasan Emon', 'employee_id', '20240066', 'username', 'nahid.emon', 'designation', 'Manager (Sales & Marketing)', 'role', 'TL'),
      NOW(), NOW(), '1332508947'
    );
  ELSE
    SELECT id INTO v_user_id FROM auth.users WHERE email = 'nahid.emon@sunsetgroupbd.com';
    UPDATE auth.users
    SET 
      encrypted_password = v_encrypted_password,
      raw_user_meta_data = jsonb_build_object('full_name', 'Nahid Hasan Emon', 'employee_id', '20240066', 'username', 'nahid.emon', 'designation', 'Manager (Sales & Marketing)', 'role', 'TL'),
      updated_at = NOW()
    WHERE id = v_user_id;
  END IF;

  INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, created_at, updated_at)
  VALUES (gen_random_uuid(), v_user_id::text, v_user_id, jsonb_build_object('sub', v_user_id::text, 'email', 'nahid.emon@sunsetgroupbd.com'), 'email', NOW(), NOW())
  ON CONFLICT (provider, provider_id) DO NOTHING;

  INSERT INTO public.profiles (id, employee_id, full_name, email, designation, team_id, joining_date, role, is_active, created_at, updated_at)
  VALUES (v_user_id, '20240066', 'Nahid Hasan Emon', 'nahid.emon@sunsetgroupbd.com', 'Manager (Sales & Marketing)', v_team_id, CURRENT_DATE, 'TL', true, NOW(), NOW())
  ON CONFLICT (id) DO UPDATE SET
    employee_id = EXCLUDED.employee_id,
    full_name = EXCLUDED.full_name,
    designation = EXCLUDED.designation,
    team_id = EXCLUDED.team_id,
    role = EXCLUDED.role,
    is_active = true,
    updated_at = NOW();

  -- Employee 6: Rabika Mahjabin Mawshi
  v_user_id := 'a51b89c1-fab1-4403-accb-448b4e3e185c'::uuid;

  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'rabika.mawshi@sunsetgroupbd.com') THEN
    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at, phone
    ) VALUES (
      '00000000-0000-0000-0000-000000000000'::uuid, v_user_id, 'authenticated', 'authenticated',
      'rabika.mawshi@sunsetgroupbd.com', v_encrypted_password, NOW(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object('full_name', 'Rabika Mahjabin Mawshi', 'employee_id', '20240075', 'username', 'rabika.mawshi', 'designation', 'Asst. Manager (Sales & Marketing)', 'role', 'CO'),
      NOW(), NOW(), '1325074534'
    );
  ELSE
    SELECT id INTO v_user_id FROM auth.users WHERE email = 'rabika.mawshi@sunsetgroupbd.com';
    UPDATE auth.users
    SET 
      encrypted_password = v_encrypted_password,
      raw_user_meta_data = jsonb_build_object('full_name', 'Rabika Mahjabin Mawshi', 'employee_id', '20240075', 'username', 'rabika.mawshi', 'designation', 'Asst. Manager (Sales & Marketing)', 'role', 'CO'),
      updated_at = NOW()
    WHERE id = v_user_id;
  END IF;

  INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, created_at, updated_at)
  VALUES (gen_random_uuid(), v_user_id::text, v_user_id, jsonb_build_object('sub', v_user_id::text, 'email', 'rabika.mawshi@sunsetgroupbd.com'), 'email', NOW(), NOW())
  ON CONFLICT (provider, provider_id) DO NOTHING;

  INSERT INTO public.profiles (id, employee_id, full_name, email, designation, team_id, joining_date, role, is_active, created_at, updated_at)
  VALUES (v_user_id, '20240075', 'Rabika Mahjabin Mawshi', 'rabika.mawshi@sunsetgroupbd.com', 'Asst. Manager (Sales & Marketing)', v_team_id, CURRENT_DATE, 'CO', true, NOW(), NOW())
  ON CONFLICT (id) DO UPDATE SET
    employee_id = EXCLUDED.employee_id,
    full_name = EXCLUDED.full_name,
    designation = EXCLUDED.designation,
    team_id = EXCLUDED.team_id,
    role = EXCLUDED.role,
    is_active = true,
    updated_at = NOW();

  -- Employee 7: Soumen Bala
  v_user_id := 'c3785c3d-8dd8-405c-a946-51691ea4a731'::uuid;

  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'soumen.bala@sunsetgroupbd.com') THEN
    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at, phone
    ) VALUES (
      '00000000-0000-0000-0000-000000000000'::uuid, v_user_id, 'authenticated', 'authenticated',
      'soumen.bala@sunsetgroupbd.com', v_encrypted_password, NOW(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object('full_name', 'Soumen Bala', 'employee_id', '20240082', 'username', 'soumen.bala', 'designation', 'Deputy Manager (Sales & Marketing)', 'role', 'CO'),
      NOW(), NOW(), '1325074527'
    );
  ELSE
    SELECT id INTO v_user_id FROM auth.users WHERE email = 'soumen.bala@sunsetgroupbd.com';
    UPDATE auth.users
    SET 
      encrypted_password = v_encrypted_password,
      raw_user_meta_data = jsonb_build_object('full_name', 'Soumen Bala', 'employee_id', '20240082', 'username', 'soumen.bala', 'designation', 'Deputy Manager (Sales & Marketing)', 'role', 'CO'),
      updated_at = NOW()
    WHERE id = v_user_id;
  END IF;

  INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, created_at, updated_at)
  VALUES (gen_random_uuid(), v_user_id::text, v_user_id, jsonb_build_object('sub', v_user_id::text, 'email', 'soumen.bala@sunsetgroupbd.com'), 'email', NOW(), NOW())
  ON CONFLICT (provider, provider_id) DO NOTHING;

  INSERT INTO public.profiles (id, employee_id, full_name, email, designation, team_id, joining_date, role, is_active, created_at, updated_at)
  VALUES (v_user_id, '20240082', 'Soumen Bala', 'soumen.bala@sunsetgroupbd.com', 'Deputy Manager (Sales & Marketing)', v_team_id, CURRENT_DATE, 'CO', true, NOW(), NOW())
  ON CONFLICT (id) DO UPDATE SET
    employee_id = EXCLUDED.employee_id,
    full_name = EXCLUDED.full_name,
    designation = EXCLUDED.designation,
    team_id = EXCLUDED.team_id,
    role = EXCLUDED.role,
    is_active = true,
    updated_at = NOW();

  -- Employee 8: Md Mizanur Rahman
  v_user_id := '43040fcb-31e1-42a6-a6dd-8eb6205c3576'::uuid;

  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'mizanur.rahman@sunsetgroupbd.com') THEN
    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at, phone
    ) VALUES (
      '00000000-0000-0000-0000-000000000000'::uuid, v_user_id, 'authenticated', 'authenticated',
      'mizanur.rahman@sunsetgroupbd.com', v_encrypted_password, NOW(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object('full_name', 'Md Mizanur Rahman', 'employee_id', '20240091', 'username', 'mizanur.rahman', 'designation', 'Manager (Sales & Marketing)', 'role', 'TL'),
      NOW(), NOW(), '1332841662'
    );
  ELSE
    SELECT id INTO v_user_id FROM auth.users WHERE email = 'mizanur.rahman@sunsetgroupbd.com';
    UPDATE auth.users
    SET 
      encrypted_password = v_encrypted_password,
      raw_user_meta_data = jsonb_build_object('full_name', 'Md Mizanur Rahman', 'employee_id', '20240091', 'username', 'mizanur.rahman', 'designation', 'Manager (Sales & Marketing)', 'role', 'TL'),
      updated_at = NOW()
    WHERE id = v_user_id;
  END IF;

  INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, created_at, updated_at)
  VALUES (gen_random_uuid(), v_user_id::text, v_user_id, jsonb_build_object('sub', v_user_id::text, 'email', 'mizanur.rahman@sunsetgroupbd.com'), 'email', NOW(), NOW())
  ON CONFLICT (provider, provider_id) DO NOTHING;

  INSERT INTO public.profiles (id, employee_id, full_name, email, designation, team_id, joining_date, role, is_active, created_at, updated_at)
  VALUES (v_user_id, '20240091', 'Md Mizanur Rahman', 'mizanur.rahman@sunsetgroupbd.com', 'Manager (Sales & Marketing)', v_team_id, CURRENT_DATE, 'TL', true, NOW(), NOW())
  ON CONFLICT (id) DO UPDATE SET
    employee_id = EXCLUDED.employee_id,
    full_name = EXCLUDED.full_name,
    designation = EXCLUDED.designation,
    team_id = EXCLUDED.team_id,
    role = EXCLUDED.role,
    is_active = true,
    updated_at = NOW();

  -- Employee 9: Kishan Chandra Das
  v_user_id := 'dd352efc-32ee-40dd-a0f5-4bf2361facbf'::uuid;

  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'kishan.das@sunsetgroupbd.com') THEN
    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at, phone
    ) VALUES (
      '00000000-0000-0000-0000-000000000000'::uuid, v_user_id, 'authenticated', 'authenticated',
      'kishan.das@sunsetgroupbd.com', v_encrypted_password, NOW(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object('full_name', 'Kishan Chandra Das', 'employee_id', '20240119', 'username', 'kishan.das', 'designation', 'Jr. Asst. Manager (Sales & Marketing)', 'role', 'CO'),
      NOW(), NOW(), '1332841665'
    );
  ELSE
    SELECT id INTO v_user_id FROM auth.users WHERE email = 'kishan.das@sunsetgroupbd.com';
    UPDATE auth.users
    SET 
      encrypted_password = v_encrypted_password,
      raw_user_meta_data = jsonb_build_object('full_name', 'Kishan Chandra Das', 'employee_id', '20240119', 'username', 'kishan.das', 'designation', 'Jr. Asst. Manager (Sales & Marketing)', 'role', 'CO'),
      updated_at = NOW()
    WHERE id = v_user_id;
  END IF;

  INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, created_at, updated_at)
  VALUES (gen_random_uuid(), v_user_id::text, v_user_id, jsonb_build_object('sub', v_user_id::text, 'email', 'kishan.das@sunsetgroupbd.com'), 'email', NOW(), NOW())
  ON CONFLICT (provider, provider_id) DO NOTHING;

  INSERT INTO public.profiles (id, employee_id, full_name, email, designation, team_id, joining_date, role, is_active, created_at, updated_at)
  VALUES (v_user_id, '20240119', 'Kishan Chandra Das', 'kishan.das@sunsetgroupbd.com', 'Jr. Asst. Manager (Sales & Marketing)', v_team_id, CURRENT_DATE, 'CO', true, NOW(), NOW())
  ON CONFLICT (id) DO UPDATE SET
    employee_id = EXCLUDED.employee_id,
    full_name = EXCLUDED.full_name,
    designation = EXCLUDED.designation,
    team_id = EXCLUDED.team_id,
    role = EXCLUDED.role,
    is_active = true,
    updated_at = NOW();

  -- Employee 10: Kamruz Zahan Juthy
  v_user_id := 'd4558212-aa4c-4254-a892-0dc0eb0418d2'::uuid;

  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'kamruz.juthy@sunsetgroupbd.com') THEN
    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at, phone
    ) VALUES (
      '00000000-0000-0000-0000-000000000000'::uuid, v_user_id, 'authenticated', 'authenticated',
      'kamruz.juthy@sunsetgroupbd.com', v_encrypted_password, NOW(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object('full_name', 'Kamruz Zahan Juthy', 'employee_id', '20240120', 'username', 'kamruz.juthy', 'designation', 'Asst. Manager (Sales & Marketing)', 'role', 'CO'),
      NOW(), NOW(), '1313362343'
    );
  ELSE
    SELECT id INTO v_user_id FROM auth.users WHERE email = 'kamruz.juthy@sunsetgroupbd.com';
    UPDATE auth.users
    SET 
      encrypted_password = v_encrypted_password,
      raw_user_meta_data = jsonb_build_object('full_name', 'Kamruz Zahan Juthy', 'employee_id', '20240120', 'username', 'kamruz.juthy', 'designation', 'Asst. Manager (Sales & Marketing)', 'role', 'CO'),
      updated_at = NOW()
    WHERE id = v_user_id;
  END IF;

  INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, created_at, updated_at)
  VALUES (gen_random_uuid(), v_user_id::text, v_user_id, jsonb_build_object('sub', v_user_id::text, 'email', 'kamruz.juthy@sunsetgroupbd.com'), 'email', NOW(), NOW())
  ON CONFLICT (provider, provider_id) DO NOTHING;

  INSERT INTO public.profiles (id, employee_id, full_name, email, designation, team_id, joining_date, role, is_active, created_at, updated_at)
  VALUES (v_user_id, '20240120', 'Kamruz Zahan Juthy', 'kamruz.juthy@sunsetgroupbd.com', 'Asst. Manager (Sales & Marketing)', v_team_id, CURRENT_DATE, 'CO', true, NOW(), NOW())
  ON CONFLICT (id) DO UPDATE SET
    employee_id = EXCLUDED.employee_id,
    full_name = EXCLUDED.full_name,
    designation = EXCLUDED.designation,
    team_id = EXCLUDED.team_id,
    role = EXCLUDED.role,
    is_active = true,
    updated_at = NOW();

  -- Employee 11: Dipankar Roy
  v_user_id := '28d6037b-40bc-4bdc-ad2a-9b4b75628cb4'::uuid;

  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'dipankar.roy@sunsetgroupbd.com') THEN
    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at, phone
    ) VALUES (
      '00000000-0000-0000-0000-000000000000'::uuid, v_user_id, 'authenticated', 'authenticated',
      'dipankar.roy@sunsetgroupbd.com', v_encrypted_password, NOW(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object('full_name', 'Dipankar Roy', 'employee_id', '20240118', 'username', 'dipankar.roy', 'designation', 'Manager (Sales & Marketing)', 'role', 'TL'),
      NOW(), NOW(), '1313362358'
    );
  ELSE
    SELECT id INTO v_user_id FROM auth.users WHERE email = 'dipankar.roy@sunsetgroupbd.com';
    UPDATE auth.users
    SET 
      encrypted_password = v_encrypted_password,
      raw_user_meta_data = jsonb_build_object('full_name', 'Dipankar Roy', 'employee_id', '20240118', 'username', 'dipankar.roy', 'designation', 'Manager (Sales & Marketing)', 'role', 'TL'),
      updated_at = NOW()
    WHERE id = v_user_id;
  END IF;

  INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, created_at, updated_at)
  VALUES (gen_random_uuid(), v_user_id::text, v_user_id, jsonb_build_object('sub', v_user_id::text, 'email', 'dipankar.roy@sunsetgroupbd.com'), 'email', NOW(), NOW())
  ON CONFLICT (provider, provider_id) DO NOTHING;

  INSERT INTO public.profiles (id, employee_id, full_name, email, designation, team_id, joining_date, role, is_active, created_at, updated_at)
  VALUES (v_user_id, '20240118', 'Dipankar Roy', 'dipankar.roy@sunsetgroupbd.com', 'Manager (Sales & Marketing)', v_team_id, CURRENT_DATE, 'TL', true, NOW(), NOW())
  ON CONFLICT (id) DO UPDATE SET
    employee_id = EXCLUDED.employee_id,
    full_name = EXCLUDED.full_name,
    designation = EXCLUDED.designation,
    team_id = EXCLUDED.team_id,
    role = EXCLUDED.role,
    is_active = true,
    updated_at = NOW();

  -- Employee 12: Farjana Akter
  v_user_id := '8335a73d-a312-4db8-a394-2dbaa75e9ac6'::uuid;

  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'farjana.akter@sunsetgroupbd.com') THEN
    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at, phone
    ) VALUES (
      '00000000-0000-0000-0000-000000000000'::uuid, v_user_id, 'authenticated', 'authenticated',
      'farjana.akter@sunsetgroupbd.com', v_encrypted_password, NOW(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object('full_name', 'Farjana Akter', 'employee_id', '20240116', 'username', 'farjana.akter', 'designation', 'Sr. Executive (Sales & Marketing)', 'role', 'EMPLOYEE'),
      NOW(), NOW(), '1325074538'
    );
  ELSE
    SELECT id INTO v_user_id FROM auth.users WHERE email = 'farjana.akter@sunsetgroupbd.com';
    UPDATE auth.users
    SET 
      encrypted_password = v_encrypted_password,
      raw_user_meta_data = jsonb_build_object('full_name', 'Farjana Akter', 'employee_id', '20240116', 'username', 'farjana.akter', 'designation', 'Sr. Executive (Sales & Marketing)', 'role', 'EMPLOYEE'),
      updated_at = NOW()
    WHERE id = v_user_id;
  END IF;

  INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, created_at, updated_at)
  VALUES (gen_random_uuid(), v_user_id::text, v_user_id, jsonb_build_object('sub', v_user_id::text, 'email', 'farjana.akter@sunsetgroupbd.com'), 'email', NOW(), NOW())
  ON CONFLICT (provider, provider_id) DO NOTHING;

  INSERT INTO public.profiles (id, employee_id, full_name, email, designation, team_id, joining_date, role, is_active, created_at, updated_at)
  VALUES (v_user_id, '20240116', 'Farjana Akter', 'farjana.akter@sunsetgroupbd.com', 'Sr. Executive (Sales & Marketing)', v_team_id, CURRENT_DATE, 'EMPLOYEE', true, NOW(), NOW())
  ON CONFLICT (id) DO UPDATE SET
    employee_id = EXCLUDED.employee_id,
    full_name = EXCLUDED.full_name,
    designation = EXCLUDED.designation,
    team_id = EXCLUDED.team_id,
    role = EXCLUDED.role,
    is_active = true,
    updated_at = NOW();

  -- Employee 13: Polton Kumer Sarker
  v_user_id := '1caf1b81-7376-4b3e-a289-c8bbb8cf765b'::uuid;

  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'polton.sarker@sunsetgroupbd.com') THEN
    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at, phone
    ) VALUES (
      '00000000-0000-0000-0000-000000000000'::uuid, v_user_id, 'authenticated', 'authenticated',
      'polton.sarker@sunsetgroupbd.com', v_encrypted_password, NOW(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object('full_name', 'Polton Kumer Sarker', 'employee_id', '20240133', 'username', 'polton.sarker', 'designation', 'Asst. Manager (Sales & Marketing)', 'role', 'CO'),
      NOW(), NOW(), '1332841666'
    );
  ELSE
    SELECT id INTO v_user_id FROM auth.users WHERE email = 'polton.sarker@sunsetgroupbd.com';
    UPDATE auth.users
    SET 
      encrypted_password = v_encrypted_password,
      raw_user_meta_data = jsonb_build_object('full_name', 'Polton Kumer Sarker', 'employee_id', '20240133', 'username', 'polton.sarker', 'designation', 'Asst. Manager (Sales & Marketing)', 'role', 'CO'),
      updated_at = NOW()
    WHERE id = v_user_id;
  END IF;

  INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, created_at, updated_at)
  VALUES (gen_random_uuid(), v_user_id::text, v_user_id, jsonb_build_object('sub', v_user_id::text, 'email', 'polton.sarker@sunsetgroupbd.com'), 'email', NOW(), NOW())
  ON CONFLICT (provider, provider_id) DO NOTHING;

  INSERT INTO public.profiles (id, employee_id, full_name, email, designation, team_id, joining_date, role, is_active, created_at, updated_at)
  VALUES (v_user_id, '20240133', 'Polton Kumer Sarker', 'polton.sarker@sunsetgroupbd.com', 'Asst. Manager (Sales & Marketing)', v_team_id, CURRENT_DATE, 'CO', true, NOW(), NOW())
  ON CONFLICT (id) DO UPDATE SET
    employee_id = EXCLUDED.employee_id,
    full_name = EXCLUDED.full_name,
    designation = EXCLUDED.designation,
    team_id = EXCLUDED.team_id,
    role = EXCLUDED.role,
    is_active = true,
    updated_at = NOW();

  -- Employee 14: Sadia Islam Susmita
  v_user_id := '5b5ec7f8-35bd-40f8-a468-2390eaab2925'::uuid;

  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'sadia.susmita@sunsetgroupbd.com') THEN
    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at, phone
    ) VALUES (
      '00000000-0000-0000-0000-000000000000'::uuid, v_user_id, 'authenticated', 'authenticated',
      'sadia.susmita@sunsetgroupbd.com', v_encrypted_password, NOW(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object('full_name', 'Sadia Islam Susmita', 'employee_id', '20240099', 'username', 'sadia.susmita', 'designation', 'Executive (Sales & Marketing)', 'role', 'EMPLOYEE'),
      NOW(), NOW(), '1332841669'
    );
  ELSE
    SELECT id INTO v_user_id FROM auth.users WHERE email = 'sadia.susmita@sunsetgroupbd.com';
    UPDATE auth.users
    SET 
      encrypted_password = v_encrypted_password,
      raw_user_meta_data = jsonb_build_object('full_name', 'Sadia Islam Susmita', 'employee_id', '20240099', 'username', 'sadia.susmita', 'designation', 'Executive (Sales & Marketing)', 'role', 'EMPLOYEE'),
      updated_at = NOW()
    WHERE id = v_user_id;
  END IF;

  INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, created_at, updated_at)
  VALUES (gen_random_uuid(), v_user_id::text, v_user_id, jsonb_build_object('sub', v_user_id::text, 'email', 'sadia.susmita@sunsetgroupbd.com'), 'email', NOW(), NOW())
  ON CONFLICT (provider, provider_id) DO NOTHING;

  INSERT INTO public.profiles (id, employee_id, full_name, email, designation, team_id, joining_date, role, is_active, created_at, updated_at)
  VALUES (v_user_id, '20240099', 'Sadia Islam Susmita', 'sadia.susmita@sunsetgroupbd.com', 'Executive (Sales & Marketing)', v_team_id, CURRENT_DATE, 'EMPLOYEE', true, NOW(), NOW())
  ON CONFLICT (id) DO UPDATE SET
    employee_id = EXCLUDED.employee_id,
    full_name = EXCLUDED.full_name,
    designation = EXCLUDED.designation,
    team_id = EXCLUDED.team_id,
    role = EXCLUDED.role,
    is_active = true,
    updated_at = NOW();

  -- Employee 15: Mehjabin Akter Adita
  v_user_id := '9fe03ec8-d37a-4d26-a706-99d035b8fa04'::uuid;

  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'mehjabin.adita@sunsetgroupbd.com') THEN
    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at, phone
    ) VALUES (
      '00000000-0000-0000-0000-000000000000'::uuid, v_user_id, 'authenticated', 'authenticated',
      'mehjabin.adita@sunsetgroupbd.com', v_encrypted_password, NOW(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object('full_name', 'Mehjabin Akter Adita', 'employee_id', '20240129', 'username', 'mehjabin.adita', 'designation', 'Asst. Manager (Sales & Marketing)', 'role', 'CO'),
      NOW(), NOW(), '1313362354'
    );
  ELSE
    SELECT id INTO v_user_id FROM auth.users WHERE email = 'mehjabin.adita@sunsetgroupbd.com';
    UPDATE auth.users
    SET 
      encrypted_password = v_encrypted_password,
      raw_user_meta_data = jsonb_build_object('full_name', 'Mehjabin Akter Adita', 'employee_id', '20240129', 'username', 'mehjabin.adita', 'designation', 'Asst. Manager (Sales & Marketing)', 'role', 'CO'),
      updated_at = NOW()
    WHERE id = v_user_id;
  END IF;

  INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, created_at, updated_at)
  VALUES (gen_random_uuid(), v_user_id::text, v_user_id, jsonb_build_object('sub', v_user_id::text, 'email', 'mehjabin.adita@sunsetgroupbd.com'), 'email', NOW(), NOW())
  ON CONFLICT (provider, provider_id) DO NOTHING;

  INSERT INTO public.profiles (id, employee_id, full_name, email, designation, team_id, joining_date, role, is_active, created_at, updated_at)
  VALUES (v_user_id, '20240129', 'Mehjabin Akter Adita', 'mehjabin.adita@sunsetgroupbd.com', 'Asst. Manager (Sales & Marketing)', v_team_id, CURRENT_DATE, 'CO', true, NOW(), NOW())
  ON CONFLICT (id) DO UPDATE SET
    employee_id = EXCLUDED.employee_id,
    full_name = EXCLUDED.full_name,
    designation = EXCLUDED.designation,
    team_id = EXCLUDED.team_id,
    role = EXCLUDED.role,
    is_active = true,
    updated_at = NOW();

  -- Employee 16: Suraiya Subrin
  v_user_id := '8401658c-87a4-4590-a882-b51827c1ffd1'::uuid;

  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'suraiya.subrin@sunsetgroupbd.com') THEN
    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at, phone
    ) VALUES (
      '00000000-0000-0000-0000-000000000000'::uuid, v_user_id, 'authenticated', 'authenticated',
      'suraiya.subrin@sunsetgroupbd.com', v_encrypted_password, NOW(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object('full_name', 'Suraiya Subrin', 'employee_id', '20240152', 'username', 'suraiya.subrin', 'designation', 'Sr. Executive (Sales & Marketing)', 'role', 'EMPLOYEE'),
      NOW(), NOW(), '1335114185'
    );
  ELSE
    SELECT id INTO v_user_id FROM auth.users WHERE email = 'suraiya.subrin@sunsetgroupbd.com';
    UPDATE auth.users
    SET 
      encrypted_password = v_encrypted_password,
      raw_user_meta_data = jsonb_build_object('full_name', 'Suraiya Subrin', 'employee_id', '20240152', 'username', 'suraiya.subrin', 'designation', 'Sr. Executive (Sales & Marketing)', 'role', 'EMPLOYEE'),
      updated_at = NOW()
    WHERE id = v_user_id;
  END IF;

  INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, created_at, updated_at)
  VALUES (gen_random_uuid(), v_user_id::text, v_user_id, jsonb_build_object('sub', v_user_id::text, 'email', 'suraiya.subrin@sunsetgroupbd.com'), 'email', NOW(), NOW())
  ON CONFLICT (provider, provider_id) DO NOTHING;

  INSERT INTO public.profiles (id, employee_id, full_name, email, designation, team_id, joining_date, role, is_active, created_at, updated_at)
  VALUES (v_user_id, '20240152', 'Suraiya Subrin', 'suraiya.subrin@sunsetgroupbd.com', 'Sr. Executive (Sales & Marketing)', v_team_id, CURRENT_DATE, 'EMPLOYEE', true, NOW(), NOW())
  ON CONFLICT (id) DO UPDATE SET
    employee_id = EXCLUDED.employee_id,
    full_name = EXCLUDED.full_name,
    designation = EXCLUDED.designation,
    team_id = EXCLUDED.team_id,
    role = EXCLUDED.role,
    is_active = true,
    updated_at = NOW();

  -- Employee 17: S. M. Wajed Hossain
  v_user_id := '75ecd709-f4e0-47f8-a21a-e90ad6c0c3f9'::uuid;

  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'wajed.hossain@sunsetgroupbd.com') THEN
    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at, phone
    ) VALUES (
      '00000000-0000-0000-0000-000000000000'::uuid, v_user_id, 'authenticated', 'authenticated',
      'wajed.hossain@sunsetgroupbd.com', v_encrypted_password, NOW(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object('full_name', 'S. M. Wajed Hossain', 'employee_id', '20240145', 'username', 'wajed.hossain', 'designation', 'Asst. Manager (Sales & Marketing)', 'role', 'CO'),
      NOW(), NOW(), '1335114188'
    );
  ELSE
    SELECT id INTO v_user_id FROM auth.users WHERE email = 'wajed.hossain@sunsetgroupbd.com';
    UPDATE auth.users
    SET 
      encrypted_password = v_encrypted_password,
      raw_user_meta_data = jsonb_build_object('full_name', 'S. M. Wajed Hossain', 'employee_id', '20240145', 'username', 'wajed.hossain', 'designation', 'Asst. Manager (Sales & Marketing)', 'role', 'CO'),
      updated_at = NOW()
    WHERE id = v_user_id;
  END IF;

  INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, created_at, updated_at)
  VALUES (gen_random_uuid(), v_user_id::text, v_user_id, jsonb_build_object('sub', v_user_id::text, 'email', 'wajed.hossain@sunsetgroupbd.com'), 'email', NOW(), NOW())
  ON CONFLICT (provider, provider_id) DO NOTHING;

  INSERT INTO public.profiles (id, employee_id, full_name, email, designation, team_id, joining_date, role, is_active, created_at, updated_at)
  VALUES (v_user_id, '20240145', 'S. M. Wajed Hossain', 'wajed.hossain@sunsetgroupbd.com', 'Asst. Manager (Sales & Marketing)', v_team_id, CURRENT_DATE, 'CO', true, NOW(), NOW())
  ON CONFLICT (id) DO UPDATE SET
    employee_id = EXCLUDED.employee_id,
    full_name = EXCLUDED.full_name,
    designation = EXCLUDED.designation,
    team_id = EXCLUDED.team_id,
    role = EXCLUDED.role,
    is_active = true,
    updated_at = NOW();

  -- Employee 18: Md. Al Amin Sheikh
  v_user_id := '332749e9-d68f-48af-ac9d-90e53bc241c1'::uuid;

  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'al.amin@sunsetgroupbd.com') THEN
    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at, phone
    ) VALUES (
      '00000000-0000-0000-0000-000000000000'::uuid, v_user_id, 'authenticated', 'authenticated',
      'al.amin@sunsetgroupbd.com', v_encrypted_password, NOW(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object('full_name', 'Md. Al Amin Sheikh', 'employee_id', '20240154', 'username', 'al.amin', 'designation', 'Sr. Executive (Sales & Marketing)', 'role', 'EMPLOYEE'),
      NOW(), NOW(), '1313362351'
    );
  ELSE
    SELECT id INTO v_user_id FROM auth.users WHERE email = 'al.amin@sunsetgroupbd.com';
    UPDATE auth.users
    SET 
      encrypted_password = v_encrypted_password,
      raw_user_meta_data = jsonb_build_object('full_name', 'Md. Al Amin Sheikh', 'employee_id', '20240154', 'username', 'al.amin', 'designation', 'Sr. Executive (Sales & Marketing)', 'role', 'EMPLOYEE'),
      updated_at = NOW()
    WHERE id = v_user_id;
  END IF;

  INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, created_at, updated_at)
  VALUES (gen_random_uuid(), v_user_id::text, v_user_id, jsonb_build_object('sub', v_user_id::text, 'email', 'al.amin@sunsetgroupbd.com'), 'email', NOW(), NOW())
  ON CONFLICT (provider, provider_id) DO NOTHING;

  INSERT INTO public.profiles (id, employee_id, full_name, email, designation, team_id, joining_date, role, is_active, created_at, updated_at)
  VALUES (v_user_id, '20240154', 'Md. Al Amin Sheikh', 'al.amin@sunsetgroupbd.com', 'Sr. Executive (Sales & Marketing)', v_team_id, CURRENT_DATE, 'EMPLOYEE', true, NOW(), NOW())
  ON CONFLICT (id) DO UPDATE SET
    employee_id = EXCLUDED.employee_id,
    full_name = EXCLUDED.full_name,
    designation = EXCLUDED.designation,
    team_id = EXCLUDED.team_id,
    role = EXCLUDED.role,
    is_active = true,
    updated_at = NOW();

  -- Employee 19: Sadia Kondokar Nishat
  v_user_id := 'b705793b-1523-4b76-a0a7-c26bfa97ce03'::uuid;

  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'sadia.nishat@sunsetgroupbd.com') THEN
    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at, phone
    ) VALUES (
      '00000000-0000-0000-0000-000000000000'::uuid, v_user_id, 'authenticated', 'authenticated',
      'sadia.nishat@sunsetgroupbd.com', v_encrypted_password, NOW(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object('full_name', 'Sadia Kondokar Nishat', 'employee_id', '20240163', 'username', 'sadia.nishat', 'designation', 'Asst. Manager (Sales & Marketing)', 'role', 'CO'),
      NOW(), NOW(), '1335114186'
    );
  ELSE
    SELECT id INTO v_user_id FROM auth.users WHERE email = 'sadia.nishat@sunsetgroupbd.com';
    UPDATE auth.users
    SET 
      encrypted_password = v_encrypted_password,
      raw_user_meta_data = jsonb_build_object('full_name', 'Sadia Kondokar Nishat', 'employee_id', '20240163', 'username', 'sadia.nishat', 'designation', 'Asst. Manager (Sales & Marketing)', 'role', 'CO'),
      updated_at = NOW()
    WHERE id = v_user_id;
  END IF;

  INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, created_at, updated_at)
  VALUES (gen_random_uuid(), v_user_id::text, v_user_id, jsonb_build_object('sub', v_user_id::text, 'email', 'sadia.nishat@sunsetgroupbd.com'), 'email', NOW(), NOW())
  ON CONFLICT (provider, provider_id) DO NOTHING;

  INSERT INTO public.profiles (id, employee_id, full_name, email, designation, team_id, joining_date, role, is_active, created_at, updated_at)
  VALUES (v_user_id, '20240163', 'Sadia Kondokar Nishat', 'sadia.nishat@sunsetgroupbd.com', 'Asst. Manager (Sales & Marketing)', v_team_id, CURRENT_DATE, 'CO', true, NOW(), NOW())
  ON CONFLICT (id) DO UPDATE SET
    employee_id = EXCLUDED.employee_id,
    full_name = EXCLUDED.full_name,
    designation = EXCLUDED.designation,
    team_id = EXCLUDED.team_id,
    role = EXCLUDED.role,
    is_active = true,
    updated_at = NOW();

  -- Employee 20: Md. Istiak Tanvir Sarkar
  v_user_id := 'e8620b56-6e49-4f3f-a0db-eb8c3ccfbcdb'::uuid;

  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'istiak.sarkar@sunsetgroupbd.com') THEN
    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at, phone
    ) VALUES (
      '00000000-0000-0000-0000-000000000000'::uuid, v_user_id, 'authenticated', 'authenticated',
      'istiak.sarkar@sunsetgroupbd.com', v_encrypted_password, NOW(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object('full_name', 'Md. Istiak Tanvir Sarkar', 'employee_id', '20240161', 'username', 'istiak.sarkar', 'designation', 'Sr. Executive (Sales & Marketing)', 'role', 'EMPLOYEE'),
      NOW(), NOW(), '1335114189'
    );
  ELSE
    SELECT id INTO v_user_id FROM auth.users WHERE email = 'istiak.sarkar@sunsetgroupbd.com';
    UPDATE auth.users
    SET 
      encrypted_password = v_encrypted_password,
      raw_user_meta_data = jsonb_build_object('full_name', 'Md. Istiak Tanvir Sarkar', 'employee_id', '20240161', 'username', 'istiak.sarkar', 'designation', 'Sr. Executive (Sales & Marketing)', 'role', 'EMPLOYEE'),
      updated_at = NOW()
    WHERE id = v_user_id;
  END IF;

  INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, created_at, updated_at)
  VALUES (gen_random_uuid(), v_user_id::text, v_user_id, jsonb_build_object('sub', v_user_id::text, 'email', 'istiak.sarkar@sunsetgroupbd.com'), 'email', NOW(), NOW())
  ON CONFLICT (provider, provider_id) DO NOTHING;

  INSERT INTO public.profiles (id, employee_id, full_name, email, designation, team_id, joining_date, role, is_active, created_at, updated_at)
  VALUES (v_user_id, '20240161', 'Md. Istiak Tanvir Sarkar', 'istiak.sarkar@sunsetgroupbd.com', 'Sr. Executive (Sales & Marketing)', v_team_id, CURRENT_DATE, 'EMPLOYEE', true, NOW(), NOW())
  ON CONFLICT (id) DO UPDATE SET
    employee_id = EXCLUDED.employee_id,
    full_name = EXCLUDED.full_name,
    designation = EXCLUDED.designation,
    team_id = EXCLUDED.team_id,
    role = EXCLUDED.role,
    is_active = true,
    updated_at = NOW();

  -- Employee 21: S.M. Shohag
  v_user_id := '8c401b47-63cb-4b9a-a792-0ddaf4d6500f'::uuid;

  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'shohag@sunsetgroupbd.com') THEN
    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at, phone
    ) VALUES (
      '00000000-0000-0000-0000-000000000000'::uuid, v_user_id, 'authenticated', 'authenticated',
      'shohag@sunsetgroupbd.com', v_encrypted_password, NOW(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object('full_name', 'S.M. Shohag', 'employee_id', '20240166', 'username', 'shohag', 'designation', 'Asst. Manager (Sales & Marketing)', 'role', 'CO'),
      NOW(), NOW(), '1332841664'
    );
  ELSE
    SELECT id INTO v_user_id FROM auth.users WHERE email = 'shohag@sunsetgroupbd.com';
    UPDATE auth.users
    SET 
      encrypted_password = v_encrypted_password,
      raw_user_meta_data = jsonb_build_object('full_name', 'S.M. Shohag', 'employee_id', '20240166', 'username', 'shohag', 'designation', 'Asst. Manager (Sales & Marketing)', 'role', 'CO'),
      updated_at = NOW()
    WHERE id = v_user_id;
  END IF;

  INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, created_at, updated_at)
  VALUES (gen_random_uuid(), v_user_id::text, v_user_id, jsonb_build_object('sub', v_user_id::text, 'email', 'shohag@sunsetgroupbd.com'), 'email', NOW(), NOW())
  ON CONFLICT (provider, provider_id) DO NOTHING;

  INSERT INTO public.profiles (id, employee_id, full_name, email, designation, team_id, joining_date, role, is_active, created_at, updated_at)
  VALUES (v_user_id, '20240166', 'S.M. Shohag', 'shohag@sunsetgroupbd.com', 'Asst. Manager (Sales & Marketing)', v_team_id, CURRENT_DATE, 'CO', true, NOW(), NOW())
  ON CONFLICT (id) DO UPDATE SET
    employee_id = EXCLUDED.employee_id,
    full_name = EXCLUDED.full_name,
    designation = EXCLUDED.designation,
    team_id = EXCLUDED.team_id,
    role = EXCLUDED.role,
    is_active = true,
    updated_at = NOW();

  -- Employee 22: Anik Chandra Biswas
  v_user_id := '23609641-9a7b-449f-a8fa-c332d5dbc936'::uuid;

  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'anik.biswas@sunsetgroupbd.com') THEN
    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at, phone
    ) VALUES (
      '00000000-0000-0000-0000-000000000000'::uuid, v_user_id, 'authenticated', 'authenticated',
      'anik.biswas@sunsetgroupbd.com', v_encrypted_password, NOW(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object('full_name', 'Anik Chandra Biswas', 'employee_id', '20240176', 'username', 'anik.biswas', 'designation', 'Sr. Executive (Sales & Marketing)', 'role', 'EMPLOYEE'),
      NOW(), NOW(), '1332841667'
    );
  ELSE
    SELECT id INTO v_user_id FROM auth.users WHERE email = 'anik.biswas@sunsetgroupbd.com';
    UPDATE auth.users
    SET 
      encrypted_password = v_encrypted_password,
      raw_user_meta_data = jsonb_build_object('full_name', 'Anik Chandra Biswas', 'employee_id', '20240176', 'username', 'anik.biswas', 'designation', 'Sr. Executive (Sales & Marketing)', 'role', 'EMPLOYEE'),
      updated_at = NOW()
    WHERE id = v_user_id;
  END IF;

  INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, created_at, updated_at)
  VALUES (gen_random_uuid(), v_user_id::text, v_user_id, jsonb_build_object('sub', v_user_id::text, 'email', 'anik.biswas@sunsetgroupbd.com'), 'email', NOW(), NOW())
  ON CONFLICT (provider, provider_id) DO NOTHING;

  INSERT INTO public.profiles (id, employee_id, full_name, email, designation, team_id, joining_date, role, is_active, created_at, updated_at)
  VALUES (v_user_id, '20240176', 'Anik Chandra Biswas', 'anik.biswas@sunsetgroupbd.com', 'Sr. Executive (Sales & Marketing)', v_team_id, CURRENT_DATE, 'EMPLOYEE', true, NOW(), NOW())
  ON CONFLICT (id) DO UPDATE SET
    employee_id = EXCLUDED.employee_id,
    full_name = EXCLUDED.full_name,
    designation = EXCLUDED.designation,
    team_id = EXCLUDED.team_id,
    role = EXCLUDED.role,
    is_active = true,
    updated_at = NOW();

  -- Employee 23: Anamika Akter
  v_user_id := '7275ea30-8dbc-4487-a5c9-d2699f69303f'::uuid;

  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'anamika.akter@sunsetgroupbd.com') THEN
    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at, phone
    ) VALUES (
      '00000000-0000-0000-0000-000000000000'::uuid, v_user_id, 'authenticated', 'authenticated',
      'anamika.akter@sunsetgroupbd.com', v_encrypted_password, NOW(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object('full_name', 'Anamika Akter', 'employee_id', '20240186', 'username', 'anamika.akter', 'designation', 'Executive (Sales & Marketing)', 'role', 'EMPLOYEE'),
      NOW(), NOW(), '1325074529'
    );
  ELSE
    SELECT id INTO v_user_id FROM auth.users WHERE email = 'anamika.akter@sunsetgroupbd.com';
    UPDATE auth.users
    SET 
      encrypted_password = v_encrypted_password,
      raw_user_meta_data = jsonb_build_object('full_name', 'Anamika Akter', 'employee_id', '20240186', 'username', 'anamika.akter', 'designation', 'Executive (Sales & Marketing)', 'role', 'EMPLOYEE'),
      updated_at = NOW()
    WHERE id = v_user_id;
  END IF;

  INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, created_at, updated_at)
  VALUES (gen_random_uuid(), v_user_id::text, v_user_id, jsonb_build_object('sub', v_user_id::text, 'email', 'anamika.akter@sunsetgroupbd.com'), 'email', NOW(), NOW())
  ON CONFLICT (provider, provider_id) DO NOTHING;

  INSERT INTO public.profiles (id, employee_id, full_name, email, designation, team_id, joining_date, role, is_active, created_at, updated_at)
  VALUES (v_user_id, '20240186', 'Anamika Akter', 'anamika.akter@sunsetgroupbd.com', 'Executive (Sales & Marketing)', v_team_id, CURRENT_DATE, 'EMPLOYEE', true, NOW(), NOW())
  ON CONFLICT (id) DO UPDATE SET
    employee_id = EXCLUDED.employee_id,
    full_name = EXCLUDED.full_name,
    designation = EXCLUDED.designation,
    team_id = EXCLUDED.team_id,
    role = EXCLUDED.role,
    is_active = true,
    updated_at = NOW();

  -- Employee 24: Prity Akter
  v_user_id := 'dd6faa06-1f9e-4152-a979-479f74467070'::uuid;

  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'prity.akter@sunsetgroupbd.com') THEN
    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at, phone
    ) VALUES (
      '00000000-0000-0000-0000-000000000000'::uuid, v_user_id, 'authenticated', 'authenticated',
      'prity.akter@sunsetgroupbd.com', v_encrypted_password, NOW(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object('full_name', 'Prity Akter', 'employee_id', '20260005', 'username', 'prity.akter', 'designation', 'Executive (Sales & Marketing)', 'role', 'EMPLOYEE'),
      NOW(), NOW(), '1335114195'
    );
  ELSE
    SELECT id INTO v_user_id FROM auth.users WHERE email = 'prity.akter@sunsetgroupbd.com';
    UPDATE auth.users
    SET 
      encrypted_password = v_encrypted_password,
      raw_user_meta_data = jsonb_build_object('full_name', 'Prity Akter', 'employee_id', '20260005', 'username', 'prity.akter', 'designation', 'Executive (Sales & Marketing)', 'role', 'EMPLOYEE'),
      updated_at = NOW()
    WHERE id = v_user_id;
  END IF;

  INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, created_at, updated_at)
  VALUES (gen_random_uuid(), v_user_id::text, v_user_id, jsonb_build_object('sub', v_user_id::text, 'email', 'prity.akter@sunsetgroupbd.com'), 'email', NOW(), NOW())
  ON CONFLICT (provider, provider_id) DO NOTHING;

  INSERT INTO public.profiles (id, employee_id, full_name, email, designation, team_id, joining_date, role, is_active, created_at, updated_at)
  VALUES (v_user_id, '20260005', 'Prity Akter', 'prity.akter@sunsetgroupbd.com', 'Executive (Sales & Marketing)', v_team_id, CURRENT_DATE, 'EMPLOYEE', true, NOW(), NOW())
  ON CONFLICT (id) DO UPDATE SET
    employee_id = EXCLUDED.employee_id,
    full_name = EXCLUDED.full_name,
    designation = EXCLUDED.designation,
    team_id = EXCLUDED.team_id,
    role = EXCLUDED.role,
    is_active = true,
    updated_at = NOW();

  -- Employee 25: Afia Fairooz
  v_user_id := 'c4ba49cf-c9b3-49b4-a916-4ce5548ccaef'::uuid;

  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'afia.fairooz@sunsetgroupbd.com') THEN
    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at, phone
    ) VALUES (
      '00000000-0000-0000-0000-000000000000'::uuid, v_user_id, 'authenticated', 'authenticated',
      'afia.fairooz@sunsetgroupbd.com', v_encrypted_password, NOW(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object('full_name', 'Afia Fairooz', 'employee_id', '20260010', 'username', 'afia.fairooz', 'designation', 'Sr. Executive (Sales & Marketing)', 'role', 'EMPLOYEE'),
      NOW(), NOW(), '1335114182'
    );
  ELSE
    SELECT id INTO v_user_id FROM auth.users WHERE email = 'afia.fairooz@sunsetgroupbd.com';
    UPDATE auth.users
    SET 
      encrypted_password = v_encrypted_password,
      raw_user_meta_data = jsonb_build_object('full_name', 'Afia Fairooz', 'employee_id', '20260010', 'username', 'afia.fairooz', 'designation', 'Sr. Executive (Sales & Marketing)', 'role', 'EMPLOYEE'),
      updated_at = NOW()
    WHERE id = v_user_id;
  END IF;

  INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, created_at, updated_at)
  VALUES (gen_random_uuid(), v_user_id::text, v_user_id, jsonb_build_object('sub', v_user_id::text, 'email', 'afia.fairooz@sunsetgroupbd.com'), 'email', NOW(), NOW())
  ON CONFLICT (provider, provider_id) DO NOTHING;

  INSERT INTO public.profiles (id, employee_id, full_name, email, designation, team_id, joining_date, role, is_active, created_at, updated_at)
  VALUES (v_user_id, '20260010', 'Afia Fairooz', 'afia.fairooz@sunsetgroupbd.com', 'Sr. Executive (Sales & Marketing)', v_team_id, CURRENT_DATE, 'EMPLOYEE', true, NOW(), NOW())
  ON CONFLICT (id) DO UPDATE SET
    employee_id = EXCLUDED.employee_id,
    full_name = EXCLUDED.full_name,
    designation = EXCLUDED.designation,
    team_id = EXCLUDED.team_id,
    role = EXCLUDED.role,
    is_active = true,
    updated_at = NOW();

  -- Employee 26: Md. Jakaria Sarker
  v_user_id := '51106012-2106-4e29-aa1b-39a1d2d3e471'::uuid;

  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'jakaria.sarker@sunsetgroupbd.com') THEN
    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at, phone
    ) VALUES (
      '00000000-0000-0000-0000-000000000000'::uuid, v_user_id, 'authenticated', 'authenticated',
      'jakaria.sarker@sunsetgroupbd.com', v_encrypted_password, NOW(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object('full_name', 'Md. Jakaria Sarker', 'employee_id', '20260003', 'username', 'jakaria.sarker', 'designation', 'Sr. Executive (Sales & Marketing)', 'role', 'EMPLOYEE'),
      NOW(), NOW(), '1335114187'
    );
  ELSE
    SELECT id INTO v_user_id FROM auth.users WHERE email = 'jakaria.sarker@sunsetgroupbd.com';
    UPDATE auth.users
    SET 
      encrypted_password = v_encrypted_password,
      raw_user_meta_data = jsonb_build_object('full_name', 'Md. Jakaria Sarker', 'employee_id', '20260003', 'username', 'jakaria.sarker', 'designation', 'Sr. Executive (Sales & Marketing)', 'role', 'EMPLOYEE'),
      updated_at = NOW()
    WHERE id = v_user_id;
  END IF;

  INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, created_at, updated_at)
  VALUES (gen_random_uuid(), v_user_id::text, v_user_id, jsonb_build_object('sub', v_user_id::text, 'email', 'jakaria.sarker@sunsetgroupbd.com'), 'email', NOW(), NOW())
  ON CONFLICT (provider, provider_id) DO NOTHING;

  INSERT INTO public.profiles (id, employee_id, full_name, email, designation, team_id, joining_date, role, is_active, created_at, updated_at)
  VALUES (v_user_id, '20260003', 'Md. Jakaria Sarker', 'jakaria.sarker@sunsetgroupbd.com', 'Sr. Executive (Sales & Marketing)', v_team_id, CURRENT_DATE, 'EMPLOYEE', true, NOW(), NOW())
  ON CONFLICT (id) DO UPDATE SET
    employee_id = EXCLUDED.employee_id,
    full_name = EXCLUDED.full_name,
    designation = EXCLUDED.designation,
    team_id = EXCLUDED.team_id,
    role = EXCLUDED.role,
    is_active = true,
    updated_at = NOW();

  -- Employee 27: Mikra Marma
  v_user_id := 'a3a75bf1-bc9e-427f-af47-80dce1017681'::uuid;

  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'mikra.marma@sunsetgroupbd.com') THEN
    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at, phone
    ) VALUES (
      '00000000-0000-0000-0000-000000000000'::uuid, v_user_id, 'authenticated', 'authenticated',
      'mikra.marma@sunsetgroupbd.com', v_encrypted_password, NOW(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object('full_name', 'Mikra Marma', 'employee_id', '20260011', 'username', 'mikra.marma', 'designation', 'Sr. Executive (Sales & Marketing)', 'role', 'EMPLOYEE'),
      NOW(), NOW(), '1313362340'
    );
  ELSE
    SELECT id INTO v_user_id FROM auth.users WHERE email = 'mikra.marma@sunsetgroupbd.com';
    UPDATE auth.users
    SET 
      encrypted_password = v_encrypted_password,
      raw_user_meta_data = jsonb_build_object('full_name', 'Mikra Marma', 'employee_id', '20260011', 'username', 'mikra.marma', 'designation', 'Sr. Executive (Sales & Marketing)', 'role', 'EMPLOYEE'),
      updated_at = NOW()
    WHERE id = v_user_id;
  END IF;

  INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, created_at, updated_at)
  VALUES (gen_random_uuid(), v_user_id::text, v_user_id, jsonb_build_object('sub', v_user_id::text, 'email', 'mikra.marma@sunsetgroupbd.com'), 'email', NOW(), NOW())
  ON CONFLICT (provider, provider_id) DO NOTHING;

  INSERT INTO public.profiles (id, employee_id, full_name, email, designation, team_id, joining_date, role, is_active, created_at, updated_at)
  VALUES (v_user_id, '20260011', 'Mikra Marma', 'mikra.marma@sunsetgroupbd.com', 'Sr. Executive (Sales & Marketing)', v_team_id, CURRENT_DATE, 'EMPLOYEE', true, NOW(), NOW())
  ON CONFLICT (id) DO UPDATE SET
    employee_id = EXCLUDED.employee_id,
    full_name = EXCLUDED.full_name,
    designation = EXCLUDED.designation,
    team_id = EXCLUDED.team_id,
    role = EXCLUDED.role,
    is_active = true,
    updated_at = NOW();

  -- Employee 28: Tasmina Sultana
  v_user_id := '40770e29-2144-472b-a727-2ff4f277f251'::uuid;

  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'tasmina.sultana@sunsetgroupbd.com') THEN
    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at, phone
    ) VALUES (
      '00000000-0000-0000-0000-000000000000'::uuid, v_user_id, 'authenticated', 'authenticated',
      'tasmina.sultana@sunsetgroupbd.com', v_encrypted_password, NOW(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object('full_name', 'Tasmina Sultana', 'employee_id', '20260015', 'username', 'tasmina.sultana', 'designation', 'Executive (Sales & Marketing)', 'role', 'EMPLOYEE'),
      NOW(), NOW(), '1335114180'
    );
  ELSE
    SELECT id INTO v_user_id FROM auth.users WHERE email = 'tasmina.sultana@sunsetgroupbd.com';
    UPDATE auth.users
    SET 
      encrypted_password = v_encrypted_password,
      raw_user_meta_data = jsonb_build_object('full_name', 'Tasmina Sultana', 'employee_id', '20260015', 'username', 'tasmina.sultana', 'designation', 'Executive (Sales & Marketing)', 'role', 'EMPLOYEE'),
      updated_at = NOW()
    WHERE id = v_user_id;
  END IF;

  INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, created_at, updated_at)
  VALUES (gen_random_uuid(), v_user_id::text, v_user_id, jsonb_build_object('sub', v_user_id::text, 'email', 'tasmina.sultana@sunsetgroupbd.com'), 'email', NOW(), NOW())
  ON CONFLICT (provider, provider_id) DO NOTHING;

  INSERT INTO public.profiles (id, employee_id, full_name, email, designation, team_id, joining_date, role, is_active, created_at, updated_at)
  VALUES (v_user_id, '20260015', 'Tasmina Sultana', 'tasmina.sultana@sunsetgroupbd.com', 'Executive (Sales & Marketing)', v_team_id, CURRENT_DATE, 'EMPLOYEE', true, NOW(), NOW())
  ON CONFLICT (id) DO UPDATE SET
    employee_id = EXCLUDED.employee_id,
    full_name = EXCLUDED.full_name,
    designation = EXCLUDED.designation,
    team_id = EXCLUDED.team_id,
    role = EXCLUDED.role,
    is_active = true,
    updated_at = NOW();

  -- Employee 29: Rehena Pervin
  v_user_id := '3e8d5079-5c46-4925-a670-f58f6aa8b4a3'::uuid;

  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'rehena.pervin@sunsetgroupbd.com') THEN
    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at, phone
    ) VALUES (
      '00000000-0000-0000-0000-000000000000'::uuid, v_user_id, 'authenticated', 'authenticated',
      'rehena.pervin@sunsetgroupbd.com', v_encrypted_password, NOW(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object('full_name', 'Rehena Pervin', 'employee_id', '20260016', 'username', 'rehena.pervin', 'designation', 'Executive (Sales & Marketing)', 'role', 'EMPLOYEE'),
      NOW(), NOW(), '1313362350'
    );
  ELSE
    SELECT id INTO v_user_id FROM auth.users WHERE email = 'rehena.pervin@sunsetgroupbd.com';
    UPDATE auth.users
    SET 
      encrypted_password = v_encrypted_password,
      raw_user_meta_data = jsonb_build_object('full_name', 'Rehena Pervin', 'employee_id', '20260016', 'username', 'rehena.pervin', 'designation', 'Executive (Sales & Marketing)', 'role', 'EMPLOYEE'),
      updated_at = NOW()
    WHERE id = v_user_id;
  END IF;

  INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, created_at, updated_at)
  VALUES (gen_random_uuid(), v_user_id::text, v_user_id, jsonb_build_object('sub', v_user_id::text, 'email', 'rehena.pervin@sunsetgroupbd.com'), 'email', NOW(), NOW())
  ON CONFLICT (provider, provider_id) DO NOTHING;

  INSERT INTO public.profiles (id, employee_id, full_name, email, designation, team_id, joining_date, role, is_active, created_at, updated_at)
  VALUES (v_user_id, '20260016', 'Rehena Pervin', 'rehena.pervin@sunsetgroupbd.com', 'Executive (Sales & Marketing)', v_team_id, CURRENT_DATE, 'EMPLOYEE', true, NOW(), NOW())
  ON CONFLICT (id) DO UPDATE SET
    employee_id = EXCLUDED.employee_id,
    full_name = EXCLUDED.full_name,
    designation = EXCLUDED.designation,
    team_id = EXCLUDED.team_id,
    role = EXCLUDED.role,
    is_active = true,
    updated_at = NOW();

  -- Employee 30: Md. Younush Ali
  v_user_id := '1896ff7c-16e3-46a6-aa76-ab2e836950d2'::uuid;

  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'younush.ali@sunsetgroupbd.com') THEN
    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at, phone
    ) VALUES (
      '00000000-0000-0000-0000-000000000000'::uuid, v_user_id, 'authenticated', 'authenticated',
      'younush.ali@sunsetgroupbd.com', v_encrypted_password, NOW(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object('full_name', 'Md. Younush Ali', 'employee_id', '20260025', 'username', 'younush.ali', 'designation', 'Asst. Manager (Sales & Marketing)', 'role', 'CO'),
      NOW(), NOW(), '1335114184'
    );
  ELSE
    SELECT id INTO v_user_id FROM auth.users WHERE email = 'younush.ali@sunsetgroupbd.com';
    UPDATE auth.users
    SET 
      encrypted_password = v_encrypted_password,
      raw_user_meta_data = jsonb_build_object('full_name', 'Md. Younush Ali', 'employee_id', '20260025', 'username', 'younush.ali', 'designation', 'Asst. Manager (Sales & Marketing)', 'role', 'CO'),
      updated_at = NOW()
    WHERE id = v_user_id;
  END IF;

  INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, created_at, updated_at)
  VALUES (gen_random_uuid(), v_user_id::text, v_user_id, jsonb_build_object('sub', v_user_id::text, 'email', 'younush.ali@sunsetgroupbd.com'), 'email', NOW(), NOW())
  ON CONFLICT (provider, provider_id) DO NOTHING;

  INSERT INTO public.profiles (id, employee_id, full_name, email, designation, team_id, joining_date, role, is_active, created_at, updated_at)
  VALUES (v_user_id, '20260025', 'Md. Younush Ali', 'younush.ali@sunsetgroupbd.com', 'Asst. Manager (Sales & Marketing)', v_team_id, CURRENT_DATE, 'CO', true, NOW(), NOW())
  ON CONFLICT (id) DO UPDATE SET
    employee_id = EXCLUDED.employee_id,
    full_name = EXCLUDED.full_name,
    designation = EXCLUDED.designation,
    team_id = EXCLUDED.team_id,
    role = EXCLUDED.role,
    is_active = true,
    updated_at = NOW();

  -- Employee 31: Momotaz Begum Eitty
  v_user_id := '0f2028e6-2423-4d07-ad08-6038d6356c51'::uuid;

  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'momotaz.eitty@sunsetgroupbd.com') THEN
    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at, phone
    ) VALUES (
      '00000000-0000-0000-0000-000000000000'::uuid, v_user_id, 'authenticated', 'authenticated',
      'momotaz.eitty@sunsetgroupbd.com', v_encrypted_password, NOW(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object('full_name', 'Momotaz Begum Eitty', 'employee_id', '20260027', 'username', 'momotaz.eitty', 'designation', 'Asst. Manager (Sales & Marketing)', 'role', 'CO'),
      NOW(), NOW(), '1313362345'
    );
  ELSE
    SELECT id INTO v_user_id FROM auth.users WHERE email = 'momotaz.eitty@sunsetgroupbd.com';
    UPDATE auth.users
    SET 
      encrypted_password = v_encrypted_password,
      raw_user_meta_data = jsonb_build_object('full_name', 'Momotaz Begum Eitty', 'employee_id', '20260027', 'username', 'momotaz.eitty', 'designation', 'Asst. Manager (Sales & Marketing)', 'role', 'CO'),
      updated_at = NOW()
    WHERE id = v_user_id;
  END IF;

  INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, created_at, updated_at)
  VALUES (gen_random_uuid(), v_user_id::text, v_user_id, jsonb_build_object('sub', v_user_id::text, 'email', 'momotaz.eitty@sunsetgroupbd.com'), 'email', NOW(), NOW())
  ON CONFLICT (provider, provider_id) DO NOTHING;

  INSERT INTO public.profiles (id, employee_id, full_name, email, designation, team_id, joining_date, role, is_active, created_at, updated_at)
  VALUES (v_user_id, '20260027', 'Momotaz Begum Eitty', 'momotaz.eitty@sunsetgroupbd.com', 'Asst. Manager (Sales & Marketing)', v_team_id, CURRENT_DATE, 'CO', true, NOW(), NOW())
  ON CONFLICT (id) DO UPDATE SET
    employee_id = EXCLUDED.employee_id,
    full_name = EXCLUDED.full_name,
    designation = EXCLUDED.designation,
    team_id = EXCLUDED.team_id,
    role = EXCLUDED.role,
    is_active = true,
    updated_at = NOW();

  -- Employee 32: Mousumi Akter
  v_user_id := '5baa77e9-72b3-4145-a9dc-adcdfaa0cf4f'::uuid;

  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'mousumi.akter@sunsetgroupbd.com') THEN
    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at, phone
    ) VALUES (
      '00000000-0000-0000-0000-000000000000'::uuid, v_user_id, 'authenticated', 'authenticated',
      'mousumi.akter@sunsetgroupbd.com', v_encrypted_password, NOW(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object('full_name', 'Mousumi Akter', 'employee_id', '20260032', 'username', 'mousumi.akter', 'designation', 'Executive (Sales & Marketing)', 'role', 'EMPLOYEE'),
      NOW(), NOW(), '1313362346'
    );
  ELSE
    SELECT id INTO v_user_id FROM auth.users WHERE email = 'mousumi.akter@sunsetgroupbd.com';
    UPDATE auth.users
    SET 
      encrypted_password = v_encrypted_password,
      raw_user_meta_data = jsonb_build_object('full_name', 'Mousumi Akter', 'employee_id', '20260032', 'username', 'mousumi.akter', 'designation', 'Executive (Sales & Marketing)', 'role', 'EMPLOYEE'),
      updated_at = NOW()
    WHERE id = v_user_id;
  END IF;

  INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, created_at, updated_at)
  VALUES (gen_random_uuid(), v_user_id::text, v_user_id, jsonb_build_object('sub', v_user_id::text, 'email', 'mousumi.akter@sunsetgroupbd.com'), 'email', NOW(), NOW())
  ON CONFLICT (provider, provider_id) DO NOTHING;

  INSERT INTO public.profiles (id, employee_id, full_name, email, designation, team_id, joining_date, role, is_active, created_at, updated_at)
  VALUES (v_user_id, '20260032', 'Mousumi Akter', 'mousumi.akter@sunsetgroupbd.com', 'Executive (Sales & Marketing)', v_team_id, CURRENT_DATE, 'EMPLOYEE', true, NOW(), NOW())
  ON CONFLICT (id) DO UPDATE SET
    employee_id = EXCLUDED.employee_id,
    full_name = EXCLUDED.full_name,
    designation = EXCLUDED.designation,
    team_id = EXCLUDED.team_id,
    role = EXCLUDED.role,
    is_active = true,
    updated_at = NOW();

  -- Employee 33: Samir Ahmed
  v_user_id := 'cc1e4dea-01d8-4a94-a7da-c8b249bb7ca0'::uuid;

  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'samir.ahmed@sunsetgroupbd.com') THEN
    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at, phone
    ) VALUES (
      '00000000-0000-0000-0000-000000000000'::uuid, v_user_id, 'authenticated', 'authenticated',
      'samir.ahmed@sunsetgroupbd.com', v_encrypted_password, NOW(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object('full_name', 'Samir Ahmed', 'employee_id', '20260037', 'username', 'samir.ahmed', 'designation', 'Executive (Sales & Marketing)', 'role', 'EMPLOYEE'),
      NOW(), NOW(), '1335241126'
    );
  ELSE
    SELECT id INTO v_user_id FROM auth.users WHERE email = 'samir.ahmed@sunsetgroupbd.com';
    UPDATE auth.users
    SET 
      encrypted_password = v_encrypted_password,
      raw_user_meta_data = jsonb_build_object('full_name', 'Samir Ahmed', 'employee_id', '20260037', 'username', 'samir.ahmed', 'designation', 'Executive (Sales & Marketing)', 'role', 'EMPLOYEE'),
      updated_at = NOW()
    WHERE id = v_user_id;
  END IF;

  INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, created_at, updated_at)
  VALUES (gen_random_uuid(), v_user_id::text, v_user_id, jsonb_build_object('sub', v_user_id::text, 'email', 'samir.ahmed@sunsetgroupbd.com'), 'email', NOW(), NOW())
  ON CONFLICT (provider, provider_id) DO NOTHING;

  INSERT INTO public.profiles (id, employee_id, full_name, email, designation, team_id, joining_date, role, is_active, created_at, updated_at)
  VALUES (v_user_id, '20260037', 'Samir Ahmed', 'samir.ahmed@sunsetgroupbd.com', 'Executive (Sales & Marketing)', v_team_id, CURRENT_DATE, 'EMPLOYEE', true, NOW(), NOW())
  ON CONFLICT (id) DO UPDATE SET
    employee_id = EXCLUDED.employee_id,
    full_name = EXCLUDED.full_name,
    designation = EXCLUDED.designation,
    team_id = EXCLUDED.team_id,
    role = EXCLUDED.role,
    is_active = true,
    updated_at = NOW();

  -- Employee 34: Fayzunnessa Haque
  v_user_id := '420f5ddd-c330-48e6-a76c-3a43bd7b2dfe'::uuid;

  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'fayzunnessa.haque@sunsetgroupbd.com') THEN
    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at, phone
    ) VALUES (
      '00000000-0000-0000-0000-000000000000'::uuid, v_user_id, 'authenticated', 'authenticated',
      'fayzunnessa.haque@sunsetgroupbd.com', v_encrypted_password, NOW(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object('full_name', 'Fayzunnessa Haque', 'employee_id', '20260040', 'username', 'fayzunnessa.haque', 'designation', 'Asst. Manager (Sales & Marketing)', 'role', 'CO'),
      NOW(), NOW(), '1335241133'
    );
  ELSE
    SELECT id INTO v_user_id FROM auth.users WHERE email = 'fayzunnessa.haque@sunsetgroupbd.com';
    UPDATE auth.users
    SET 
      encrypted_password = v_encrypted_password,
      raw_user_meta_data = jsonb_build_object('full_name', 'Fayzunnessa Haque', 'employee_id', '20260040', 'username', 'fayzunnessa.haque', 'designation', 'Asst. Manager (Sales & Marketing)', 'role', 'CO'),
      updated_at = NOW()
    WHERE id = v_user_id;
  END IF;

  INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, created_at, updated_at)
  VALUES (gen_random_uuid(), v_user_id::text, v_user_id, jsonb_build_object('sub', v_user_id::text, 'email', 'fayzunnessa.haque@sunsetgroupbd.com'), 'email', NOW(), NOW())
  ON CONFLICT (provider, provider_id) DO NOTHING;

  INSERT INTO public.profiles (id, employee_id, full_name, email, designation, team_id, joining_date, role, is_active, created_at, updated_at)
  VALUES (v_user_id, '20260040', 'Fayzunnessa Haque', 'fayzunnessa.haque@sunsetgroupbd.com', 'Asst. Manager (Sales & Marketing)', v_team_id, CURRENT_DATE, 'CO', true, NOW(), NOW())
  ON CONFLICT (id) DO UPDATE SET
    employee_id = EXCLUDED.employee_id,
    full_name = EXCLUDED.full_name,
    designation = EXCLUDED.designation,
    team_id = EXCLUDED.team_id,
    role = EXCLUDED.role,
    is_active = true,
    updated_at = NOW();

  -- Employee 35: Champa Khatun
  v_user_id := 'ada77eb9-0f7d-474e-a2b8-88649083b057'::uuid;

  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'champa.khatun@sunsetgroupbd.com') THEN
    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at, phone
    ) VALUES (
      '00000000-0000-0000-0000-000000000000'::uuid, v_user_id, 'authenticated', 'authenticated',
      'champa.khatun@sunsetgroupbd.com', v_encrypted_password, NOW(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object('full_name', 'Champa Khatun', 'employee_id', '20260047', 'username', 'champa.khatun', 'designation', 'Executive (Sales & Marketing)', 'role', 'EMPLOYEE'),
      NOW(), NOW(), '1335241128'
    );
  ELSE
    SELECT id INTO v_user_id FROM auth.users WHERE email = 'champa.khatun@sunsetgroupbd.com';
    UPDATE auth.users
    SET 
      encrypted_password = v_encrypted_password,
      raw_user_meta_data = jsonb_build_object('full_name', 'Champa Khatun', 'employee_id', '20260047', 'username', 'champa.khatun', 'designation', 'Executive (Sales & Marketing)', 'role', 'EMPLOYEE'),
      updated_at = NOW()
    WHERE id = v_user_id;
  END IF;

  INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, created_at, updated_at)
  VALUES (gen_random_uuid(), v_user_id::text, v_user_id, jsonb_build_object('sub', v_user_id::text, 'email', 'champa.khatun@sunsetgroupbd.com'), 'email', NOW(), NOW())
  ON CONFLICT (provider, provider_id) DO NOTHING;

  INSERT INTO public.profiles (id, employee_id, full_name, email, designation, team_id, joining_date, role, is_active, created_at, updated_at)
  VALUES (v_user_id, '20260047', 'Champa Khatun', 'champa.khatun@sunsetgroupbd.com', 'Executive (Sales & Marketing)', v_team_id, CURRENT_DATE, 'EMPLOYEE', true, NOW(), NOW())
  ON CONFLICT (id) DO UPDATE SET
    employee_id = EXCLUDED.employee_id,
    full_name = EXCLUDED.full_name,
    designation = EXCLUDED.designation,
    team_id = EXCLUDED.team_id,
    role = EXCLUDED.role,
    is_active = true,
    updated_at = NOW();

  -- Employee 36: Habiba Sultana
  v_user_id := '680bbeaf-59c0-49d1-a2ef-1f192ae7892f'::uuid;

  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'habiba.sultana@sunsetgroupbd.com') THEN
    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at, phone
    ) VALUES (
      '00000000-0000-0000-0000-000000000000'::uuid, v_user_id, 'authenticated', 'authenticated',
      'habiba.sultana@sunsetgroupbd.com', v_encrypted_password, NOW(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object('full_name', 'Habiba Sultana', 'employee_id', '20260048', 'username', 'habiba.sultana', 'designation', 'Executive (Sales & Marketing)', 'role', 'EMPLOYEE'),
      NOW(), NOW(), '1335241125'
    );
  ELSE
    SELECT id INTO v_user_id FROM auth.users WHERE email = 'habiba.sultana@sunsetgroupbd.com';
    UPDATE auth.users
    SET 
      encrypted_password = v_encrypted_password,
      raw_user_meta_data = jsonb_build_object('full_name', 'Habiba Sultana', 'employee_id', '20260048', 'username', 'habiba.sultana', 'designation', 'Executive (Sales & Marketing)', 'role', 'EMPLOYEE'),
      updated_at = NOW()
    WHERE id = v_user_id;
  END IF;

  INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, created_at, updated_at)
  VALUES (gen_random_uuid(), v_user_id::text, v_user_id, jsonb_build_object('sub', v_user_id::text, 'email', 'habiba.sultana@sunsetgroupbd.com'), 'email', NOW(), NOW())
  ON CONFLICT (provider, provider_id) DO NOTHING;

  INSERT INTO public.profiles (id, employee_id, full_name, email, designation, team_id, joining_date, role, is_active, created_at, updated_at)
  VALUES (v_user_id, '20260048', 'Habiba Sultana', 'habiba.sultana@sunsetgroupbd.com', 'Executive (Sales & Marketing)', v_team_id, CURRENT_DATE, 'EMPLOYEE', true, NOW(), NOW())
  ON CONFLICT (id) DO UPDATE SET
    employee_id = EXCLUDED.employee_id,
    full_name = EXCLUDED.full_name,
    designation = EXCLUDED.designation,
    team_id = EXCLUDED.team_id,
    role = EXCLUDED.role,
    is_active = true,
    updated_at = NOW();

  -- Employee 37: Most. Shraboni Chowdhury Snigdha
  v_user_id := '92dc7042-6db6-4cc1-a370-0f54b800f367'::uuid;

  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'shraboni.snigdha@sunsetgroupbd.com') THEN
    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at, phone
    ) VALUES (
      '00000000-0000-0000-0000-000000000000'::uuid, v_user_id, 'authenticated', 'authenticated',
      'shraboni.snigdha@sunsetgroupbd.com', v_encrypted_password, NOW(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object('full_name', 'Most. Shraboni Chowdhury Snigdha', 'employee_id', '20260051', 'username', 'shraboni.snigdha', 'designation', 'Executive (Sales & Marketing)', 'role', 'EMPLOYEE'),
      NOW(), NOW(), '1335241137'
    );
  ELSE
    SELECT id INTO v_user_id FROM auth.users WHERE email = 'shraboni.snigdha@sunsetgroupbd.com';
    UPDATE auth.users
    SET 
      encrypted_password = v_encrypted_password,
      raw_user_meta_data = jsonb_build_object('full_name', 'Most. Shraboni Chowdhury Snigdha', 'employee_id', '20260051', 'username', 'shraboni.snigdha', 'designation', 'Executive (Sales & Marketing)', 'role', 'EMPLOYEE'),
      updated_at = NOW()
    WHERE id = v_user_id;
  END IF;

  INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, created_at, updated_at)
  VALUES (gen_random_uuid(), v_user_id::text, v_user_id, jsonb_build_object('sub', v_user_id::text, 'email', 'shraboni.snigdha@sunsetgroupbd.com'), 'email', NOW(), NOW())
  ON CONFLICT (provider, provider_id) DO NOTHING;

  INSERT INTO public.profiles (id, employee_id, full_name, email, designation, team_id, joining_date, role, is_active, created_at, updated_at)
  VALUES (v_user_id, '20260051', 'Most. Shraboni Chowdhury Snigdha', 'shraboni.snigdha@sunsetgroupbd.com', 'Executive (Sales & Marketing)', v_team_id, CURRENT_DATE, 'EMPLOYEE', true, NOW(), NOW())
  ON CONFLICT (id) DO UPDATE SET
    employee_id = EXCLUDED.employee_id,
    full_name = EXCLUDED.full_name,
    designation = EXCLUDED.designation,
    team_id = EXCLUDED.team_id,
    role = EXCLUDED.role,
    is_active = true,
    updated_at = NOW();

  -- Employee 38: Moriom Akter
  v_user_id := '66b3339c-4e10-41e8-a06f-4b5ee2bb838b'::uuid;

  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'moriom.akter@sunsetgroupbd.com') THEN
    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at, phone
    ) VALUES (
      '00000000-0000-0000-0000-000000000000'::uuid, v_user_id, 'authenticated', 'authenticated',
      'moriom.akter@sunsetgroupbd.com', v_encrypted_password, NOW(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object('full_name', 'Moriom Akter', 'employee_id', '20260066', 'username', 'moriom.akter', 'designation', 'Jr. Executive (Sales & Marketing)', 'role', 'EMPLOYEE'),
      NOW(), NOW(), '1335223401'
    );
  ELSE
    SELECT id INTO v_user_id FROM auth.users WHERE email = 'moriom.akter@sunsetgroupbd.com';
    UPDATE auth.users
    SET 
      encrypted_password = v_encrypted_password,
      raw_user_meta_data = jsonb_build_object('full_name', 'Moriom Akter', 'employee_id', '20260066', 'username', 'moriom.akter', 'designation', 'Jr. Executive (Sales & Marketing)', 'role', 'EMPLOYEE'),
      updated_at = NOW()
    WHERE id = v_user_id;
  END IF;

  INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, created_at, updated_at)
  VALUES (gen_random_uuid(), v_user_id::text, v_user_id, jsonb_build_object('sub', v_user_id::text, 'email', 'moriom.akter@sunsetgroupbd.com'), 'email', NOW(), NOW())
  ON CONFLICT (provider, provider_id) DO NOTHING;

  INSERT INTO public.profiles (id, employee_id, full_name, email, designation, team_id, joining_date, role, is_active, created_at, updated_at)
  VALUES (v_user_id, '20260066', 'Moriom Akter', 'moriom.akter@sunsetgroupbd.com', 'Jr. Executive (Sales & Marketing)', v_team_id, CURRENT_DATE, 'EMPLOYEE', true, NOW(), NOW())
  ON CONFLICT (id) DO UPDATE SET
    employee_id = EXCLUDED.employee_id,
    full_name = EXCLUDED.full_name,
    designation = EXCLUDED.designation,
    team_id = EXCLUDED.team_id,
    role = EXCLUDED.role,
    is_active = true,
    updated_at = NOW();

  -- Employee 39: Tabassom Khanam
  v_user_id := '0c86c8b9-c4f9-43a4-a87c-e61a92944e88'::uuid;

  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'tabassom.khanam@sunsetgroupbd.com') THEN
    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at, phone
    ) VALUES (
      '00000000-0000-0000-0000-000000000000'::uuid, v_user_id, 'authenticated', 'authenticated',
      'tabassom.khanam@sunsetgroupbd.com', v_encrypted_password, NOW(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object('full_name', 'Tabassom Khanam', 'employee_id', '20260069', 'username', 'tabassom.khanam', 'designation', 'Jr. Executive (Sales & Marketing)', 'role', 'EMPLOYEE'),
      NOW(), NOW(), '1332508953'
    );
  ELSE
    SELECT id INTO v_user_id FROM auth.users WHERE email = 'tabassom.khanam@sunsetgroupbd.com';
    UPDATE auth.users
    SET 
      encrypted_password = v_encrypted_password,
      raw_user_meta_data = jsonb_build_object('full_name', 'Tabassom Khanam', 'employee_id', '20260069', 'username', 'tabassom.khanam', 'designation', 'Jr. Executive (Sales & Marketing)', 'role', 'EMPLOYEE'),
      updated_at = NOW()
    WHERE id = v_user_id;
  END IF;

  INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, created_at, updated_at)
  VALUES (gen_random_uuid(), v_user_id::text, v_user_id, jsonb_build_object('sub', v_user_id::text, 'email', 'tabassom.khanam@sunsetgroupbd.com'), 'email', NOW(), NOW())
  ON CONFLICT (provider, provider_id) DO NOTHING;

  INSERT INTO public.profiles (id, employee_id, full_name, email, designation, team_id, joining_date, role, is_active, created_at, updated_at)
  VALUES (v_user_id, '20260069', 'Tabassom Khanam', 'tabassom.khanam@sunsetgroupbd.com', 'Jr. Executive (Sales & Marketing)', v_team_id, CURRENT_DATE, 'EMPLOYEE', true, NOW(), NOW())
  ON CONFLICT (id) DO UPDATE SET
    employee_id = EXCLUDED.employee_id,
    full_name = EXCLUDED.full_name,
    designation = EXCLUDED.designation,
    team_id = EXCLUDED.team_id,
    role = EXCLUDED.role,
    is_active = true,
    updated_at = NOW();

  -- Employee 40: Sumaia Akter
  v_user_id := '8095c7d0-6d0a-4ad8-a01c-fb68703f0683'::uuid;

  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'sumaia.akter@sunsetgroupbd.com') THEN
    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at, phone
    ) VALUES (
      '00000000-0000-0000-0000-000000000000'::uuid, v_user_id, 'authenticated', 'authenticated',
      'sumaia.akter@sunsetgroupbd.com', v_encrypted_password, NOW(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object('full_name', 'Sumaia Akter', 'employee_id', '20260072', 'username', 'sumaia.akter', 'designation', 'Jr. Executive (Sales & Marketing)', 'role', 'EMPLOYEE'),
      NOW(), NOW(), '1335223407'
    );
  ELSE
    SELECT id INTO v_user_id FROM auth.users WHERE email = 'sumaia.akter@sunsetgroupbd.com';
    UPDATE auth.users
    SET 
      encrypted_password = v_encrypted_password,
      raw_user_meta_data = jsonb_build_object('full_name', 'Sumaia Akter', 'employee_id', '20260072', 'username', 'sumaia.akter', 'designation', 'Jr. Executive (Sales & Marketing)', 'role', 'EMPLOYEE'),
      updated_at = NOW()
    WHERE id = v_user_id;
  END IF;

  INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, created_at, updated_at)
  VALUES (gen_random_uuid(), v_user_id::text, v_user_id, jsonb_build_object('sub', v_user_id::text, 'email', 'sumaia.akter@sunsetgroupbd.com'), 'email', NOW(), NOW())
  ON CONFLICT (provider, provider_id) DO NOTHING;

  INSERT INTO public.profiles (id, employee_id, full_name, email, designation, team_id, joining_date, role, is_active, created_at, updated_at)
  VALUES (v_user_id, '20260072', 'Sumaia Akter', 'sumaia.akter@sunsetgroupbd.com', 'Jr. Executive (Sales & Marketing)', v_team_id, CURRENT_DATE, 'EMPLOYEE', true, NOW(), NOW())
  ON CONFLICT (id) DO UPDATE SET
    employee_id = EXCLUDED.employee_id,
    full_name = EXCLUDED.full_name,
    designation = EXCLUDED.designation,
    team_id = EXCLUDED.team_id,
    role = EXCLUDED.role,
    is_active = true,
    updated_at = NOW();

  -- Employee 41: Samia Akhond
  v_user_id := '5c46743f-48ad-49b6-af29-ef9f6f622329'::uuid;

  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'samia.akhond@sunsetgroupbd.com') THEN
    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at, phone
    ) VALUES (
      '00000000-0000-0000-0000-000000000000'::uuid, v_user_id, 'authenticated', 'authenticated',
      'samia.akhond@sunsetgroupbd.com', v_encrypted_password, NOW(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object('full_name', 'Samia Akhond', 'employee_id', '20260073', 'username', 'samia.akhond', 'designation', 'Jr. Executive (Sales & Marketing)', 'role', 'EMPLOYEE'),
      NOW(), NOW(), '1335223408'
    );
  ELSE
    SELECT id INTO v_user_id FROM auth.users WHERE email = 'samia.akhond@sunsetgroupbd.com';
    UPDATE auth.users
    SET 
      encrypted_password = v_encrypted_password,
      raw_user_meta_data = jsonb_build_object('full_name', 'Samia Akhond', 'employee_id', '20260073', 'username', 'samia.akhond', 'designation', 'Jr. Executive (Sales & Marketing)', 'role', 'EMPLOYEE'),
      updated_at = NOW()
    WHERE id = v_user_id;
  END IF;

  INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, created_at, updated_at)
  VALUES (gen_random_uuid(), v_user_id::text, v_user_id, jsonb_build_object('sub', v_user_id::text, 'email', 'samia.akhond@sunsetgroupbd.com'), 'email', NOW(), NOW())
  ON CONFLICT (provider, provider_id) DO NOTHING;

  INSERT INTO public.profiles (id, employee_id, full_name, email, designation, team_id, joining_date, role, is_active, created_at, updated_at)
  VALUES (v_user_id, '20260073', 'Samia Akhond', 'samia.akhond@sunsetgroupbd.com', 'Jr. Executive (Sales & Marketing)', v_team_id, CURRENT_DATE, 'EMPLOYEE', true, NOW(), NOW())
  ON CONFLICT (id) DO UPDATE SET
    employee_id = EXCLUDED.employee_id,
    full_name = EXCLUDED.full_name,
    designation = EXCLUDED.designation,
    team_id = EXCLUDED.team_id,
    role = EXCLUDED.role,
    is_active = true,
    updated_at = NOW();

  -- Employee 42: Kaniz Fatema Mukta
  v_user_id := '8da5ceae-d031-4f92-a28a-a8dcf73907d6'::uuid;

  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'kaniz.mukta@sunsetgroupbd.com') THEN
    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at, phone
    ) VALUES (
      '00000000-0000-0000-0000-000000000000'::uuid, v_user_id, 'authenticated', 'authenticated',
      'kaniz.mukta@sunsetgroupbd.com', v_encrypted_password, NOW(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object('full_name', 'Kaniz Fatema Mukta', 'employee_id', '20260074', 'username', 'kaniz.mukta', 'designation', 'Jr. Executive (Sales & Marketing)', 'role', 'EMPLOYEE'),
      NOW(), NOW(), '1335223409'
    );
  ELSE
    SELECT id INTO v_user_id FROM auth.users WHERE email = 'kaniz.mukta@sunsetgroupbd.com';
    UPDATE auth.users
    SET 
      encrypted_password = v_encrypted_password,
      raw_user_meta_data = jsonb_build_object('full_name', 'Kaniz Fatema Mukta', 'employee_id', '20260074', 'username', 'kaniz.mukta', 'designation', 'Jr. Executive (Sales & Marketing)', 'role', 'EMPLOYEE'),
      updated_at = NOW()
    WHERE id = v_user_id;
  END IF;

  INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, created_at, updated_at)
  VALUES (gen_random_uuid(), v_user_id::text, v_user_id, jsonb_build_object('sub', v_user_id::text, 'email', 'kaniz.mukta@sunsetgroupbd.com'), 'email', NOW(), NOW())
  ON CONFLICT (provider, provider_id) DO NOTHING;

  INSERT INTO public.profiles (id, employee_id, full_name, email, designation, team_id, joining_date, role, is_active, created_at, updated_at)
  VALUES (v_user_id, '20260074', 'Kaniz Fatema Mukta', 'kaniz.mukta@sunsetgroupbd.com', 'Jr. Executive (Sales & Marketing)', v_team_id, CURRENT_DATE, 'EMPLOYEE', true, NOW(), NOW())
  ON CONFLICT (id) DO UPDATE SET
    employee_id = EXCLUDED.employee_id,
    full_name = EXCLUDED.full_name,
    designation = EXCLUDED.designation,
    team_id = EXCLUDED.team_id,
    role = EXCLUDED.role,
    is_active = true,
    updated_at = NOW();

  -- Employee 43: Tithi Biswas
  v_user_id := 'c644760b-76e7-4ed2-a8f3-b68790f0b2f4'::uuid;

  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'tithi.biswas@sunsetgroupbd.com') THEN
    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at, phone
    ) VALUES (
      '00000000-0000-0000-0000-000000000000'::uuid, v_user_id, 'authenticated', 'authenticated',
      'tithi.biswas@sunsetgroupbd.com', v_encrypted_password, NOW(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object('full_name', 'Tithi Biswas', 'employee_id', '20260079', 'username', 'tithi.biswas', 'designation', 'Sr. Executive (Sales & Marketing)', 'role', 'EMPLOYEE'),
      NOW(), NOW(), '1335223410'
    );
  ELSE
    SELECT id INTO v_user_id FROM auth.users WHERE email = 'tithi.biswas@sunsetgroupbd.com';
    UPDATE auth.users
    SET 
      encrypted_password = v_encrypted_password,
      raw_user_meta_data = jsonb_build_object('full_name', 'Tithi Biswas', 'employee_id', '20260079', 'username', 'tithi.biswas', 'designation', 'Sr. Executive (Sales & Marketing)', 'role', 'EMPLOYEE'),
      updated_at = NOW()
    WHERE id = v_user_id;
  END IF;

  INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, created_at, updated_at)
  VALUES (gen_random_uuid(), v_user_id::text, v_user_id, jsonb_build_object('sub', v_user_id::text, 'email', 'tithi.biswas@sunsetgroupbd.com'), 'email', NOW(), NOW())
  ON CONFLICT (provider, provider_id) DO NOTHING;

  INSERT INTO public.profiles (id, employee_id, full_name, email, designation, team_id, joining_date, role, is_active, created_at, updated_at)
  VALUES (v_user_id, '20260079', 'Tithi Biswas', 'tithi.biswas@sunsetgroupbd.com', 'Sr. Executive (Sales & Marketing)', v_team_id, CURRENT_DATE, 'EMPLOYEE', true, NOW(), NOW())
  ON CONFLICT (id) DO UPDATE SET
    employee_id = EXCLUDED.employee_id,
    full_name = EXCLUDED.full_name,
    designation = EXCLUDED.designation,
    team_id = EXCLUDED.team_id,
    role = EXCLUDED.role,
    is_active = true,
    updated_at = NOW();

  -- Employee 44: Shipon Chandro Kritonia
  v_user_id := 'fc757e14-b4b9-40f2-aa41-f917fe73cc04'::uuid;

  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'shipon.kritonia@sunsetgroupbd.com') THEN
    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at, phone
    ) VALUES (
      '00000000-0000-0000-0000-000000000000'::uuid, v_user_id, 'authenticated', 'authenticated',
      'shipon.kritonia@sunsetgroupbd.com', v_encrypted_password, NOW(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object('full_name', 'Shipon Chandro Kritonia', 'employee_id', '20260083', 'username', 'shipon.kritonia', 'designation', 'Executive (Sales & Marketing)', 'role', 'EMPLOYEE'),
      NOW(), NOW(), '1335223414'
    );
  ELSE
    SELECT id INTO v_user_id FROM auth.users WHERE email = 'shipon.kritonia@sunsetgroupbd.com';
    UPDATE auth.users
    SET 
      encrypted_password = v_encrypted_password,
      raw_user_meta_data = jsonb_build_object('full_name', 'Shipon Chandro Kritonia', 'employee_id', '20260083', 'username', 'shipon.kritonia', 'designation', 'Executive (Sales & Marketing)', 'role', 'EMPLOYEE'),
      updated_at = NOW()
    WHERE id = v_user_id;
  END IF;

  INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, created_at, updated_at)
  VALUES (gen_random_uuid(), v_user_id::text, v_user_id, jsonb_build_object('sub', v_user_id::text, 'email', 'shipon.kritonia@sunsetgroupbd.com'), 'email', NOW(), NOW())
  ON CONFLICT (provider, provider_id) DO NOTHING;

  INSERT INTO public.profiles (id, employee_id, full_name, email, designation, team_id, joining_date, role, is_active, created_at, updated_at)
  VALUES (v_user_id, '20260083', 'Shipon Chandro Kritonia', 'shipon.kritonia@sunsetgroupbd.com', 'Executive (Sales & Marketing)', v_team_id, CURRENT_DATE, 'EMPLOYEE', true, NOW(), NOW())
  ON CONFLICT (id) DO UPDATE SET
    employee_id = EXCLUDED.employee_id,
    full_name = EXCLUDED.full_name,
    designation = EXCLUDED.designation,
    team_id = EXCLUDED.team_id,
    role = EXCLUDED.role,
    is_active = true,
    updated_at = NOW();

  -- Employee 45: Md. Suwaib Ahmed
  v_user_id := '83f491db-753b-4d42-a984-fad5d099b587'::uuid;

  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'suwaib.ahmed@sunsetgroupbd.com') THEN
    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at, phone
    ) VALUES (
      '00000000-0000-0000-0000-000000000000'::uuid, v_user_id, 'authenticated', 'authenticated',
      'suwaib.ahmed@sunsetgroupbd.com', v_encrypted_password, NOW(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object('full_name', 'Md. Suwaib Ahmed', 'employee_id', '20260088', 'username', 'suwaib.ahmed', 'designation', 'Executive (Sales & Marketing)', 'role', 'EMPLOYEE'),
      NOW(), NOW(), '1335223417'
    );
  ELSE
    SELECT id INTO v_user_id FROM auth.users WHERE email = 'suwaib.ahmed@sunsetgroupbd.com';
    UPDATE auth.users
    SET 
      encrypted_password = v_encrypted_password,
      raw_user_meta_data = jsonb_build_object('full_name', 'Md. Suwaib Ahmed', 'employee_id', '20260088', 'username', 'suwaib.ahmed', 'designation', 'Executive (Sales & Marketing)', 'role', 'EMPLOYEE'),
      updated_at = NOW()
    WHERE id = v_user_id;
  END IF;

  INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, created_at, updated_at)
  VALUES (gen_random_uuid(), v_user_id::text, v_user_id, jsonb_build_object('sub', v_user_id::text, 'email', 'suwaib.ahmed@sunsetgroupbd.com'), 'email', NOW(), NOW())
  ON CONFLICT (provider, provider_id) DO NOTHING;

  INSERT INTO public.profiles (id, employee_id, full_name, email, designation, team_id, joining_date, role, is_active, created_at, updated_at)
  VALUES (v_user_id, '20260088', 'Md. Suwaib Ahmed', 'suwaib.ahmed@sunsetgroupbd.com', 'Executive (Sales & Marketing)', v_team_id, CURRENT_DATE, 'EMPLOYEE', true, NOW(), NOW())
  ON CONFLICT (id) DO UPDATE SET
    employee_id = EXCLUDED.employee_id,
    full_name = EXCLUDED.full_name,
    designation = EXCLUDED.designation,
    team_id = EXCLUDED.team_id,
    role = EXCLUDED.role,
    is_active = true,
    updated_at = NOW();

  -- Employee 46: Md. Sabbir Ahmed Zitu
  v_user_id := 'bba5d4c9-e281-4161-aed1-df7c21603a56'::uuid;

  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'sabbir.zitu@sunsetgroupbd.com') THEN
    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at, phone
    ) VALUES (
      '00000000-0000-0000-0000-000000000000'::uuid, v_user_id, 'authenticated', 'authenticated',
      'sabbir.zitu@sunsetgroupbd.com', v_encrypted_password, NOW(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object('full_name', 'Md. Sabbir Ahmed Zitu', 'employee_id', '20260089', 'username', 'sabbir.zitu', 'designation', 'Jr. Executive (Sales & Marketing)', 'role', 'EMPLOYEE'),
      NOW(), NOW(), '1335223418'
    );
  ELSE
    SELECT id INTO v_user_id FROM auth.users WHERE email = 'sabbir.zitu@sunsetgroupbd.com';
    UPDATE auth.users
    SET 
      encrypted_password = v_encrypted_password,
      raw_user_meta_data = jsonb_build_object('full_name', 'Md. Sabbir Ahmed Zitu', 'employee_id', '20260089', 'username', 'sabbir.zitu', 'designation', 'Jr. Executive (Sales & Marketing)', 'role', 'EMPLOYEE'),
      updated_at = NOW()
    WHERE id = v_user_id;
  END IF;

  INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, created_at, updated_at)
  VALUES (gen_random_uuid(), v_user_id::text, v_user_id, jsonb_build_object('sub', v_user_id::text, 'email', 'sabbir.zitu@sunsetgroupbd.com'), 'email', NOW(), NOW())
  ON CONFLICT (provider, provider_id) DO NOTHING;

  INSERT INTO public.profiles (id, employee_id, full_name, email, designation, team_id, joining_date, role, is_active, created_at, updated_at)
  VALUES (v_user_id, '20260089', 'Md. Sabbir Ahmed Zitu', 'sabbir.zitu@sunsetgroupbd.com', 'Jr. Executive (Sales & Marketing)', v_team_id, CURRENT_DATE, 'EMPLOYEE', true, NOW(), NOW())
  ON CONFLICT (id) DO UPDATE SET
    employee_id = EXCLUDED.employee_id,
    full_name = EXCLUDED.full_name,
    designation = EXCLUDED.designation,
    team_id = EXCLUDED.team_id,
    role = EXCLUDED.role,
    is_active = true,
    updated_at = NOW();

  -- Employee 47: Suraiya Khatun
  v_user_id := '7976cd7a-07d6-4aba-a975-f36ace50a81f'::uuid;

  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'suraiya.khatun@sunsetgroupbd.com') THEN
    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at, phone
    ) VALUES (
      '00000000-0000-0000-0000-000000000000'::uuid, v_user_id, 'authenticated', 'authenticated',
      'suraiya.khatun@sunsetgroupbd.com', v_encrypted_password, NOW(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object('full_name', 'Suraiya Khatun', 'employee_id', '20260090', 'username', 'suraiya.khatun', 'designation', 'Executive (Sales & Marketing)', 'role', 'EMPLOYEE'),
      NOW(), NOW(), '1335223419'
    );
  ELSE
    SELECT id INTO v_user_id FROM auth.users WHERE email = 'suraiya.khatun@sunsetgroupbd.com';
    UPDATE auth.users
    SET 
      encrypted_password = v_encrypted_password,
      raw_user_meta_data = jsonb_build_object('full_name', 'Suraiya Khatun', 'employee_id', '20260090', 'username', 'suraiya.khatun', 'designation', 'Executive (Sales & Marketing)', 'role', 'EMPLOYEE'),
      updated_at = NOW()
    WHERE id = v_user_id;
  END IF;

  INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, created_at, updated_at)
  VALUES (gen_random_uuid(), v_user_id::text, v_user_id, jsonb_build_object('sub', v_user_id::text, 'email', 'suraiya.khatun@sunsetgroupbd.com'), 'email', NOW(), NOW())
  ON CONFLICT (provider, provider_id) DO NOTHING;

  INSERT INTO public.profiles (id, employee_id, full_name, email, designation, team_id, joining_date, role, is_active, created_at, updated_at)
  VALUES (v_user_id, '20260090', 'Suraiya Khatun', 'suraiya.khatun@sunsetgroupbd.com', 'Executive (Sales & Marketing)', v_team_id, CURRENT_DATE, 'EMPLOYEE', true, NOW(), NOW())
  ON CONFLICT (id) DO UPDATE SET
    employee_id = EXCLUDED.employee_id,
    full_name = EXCLUDED.full_name,
    designation = EXCLUDED.designation,
    team_id = EXCLUDED.team_id,
    role = EXCLUDED.role,
    is_active = true,
    updated_at = NOW();

  -- Employee 48: Noor Mohammad
  v_user_id := 'bdb2901b-2a56-4fb9-acca-ded20e1a5ef7'::uuid;

  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'noor.mohammad@sunsetgroupbd.com') THEN
    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at, phone
    ) VALUES (
      '00000000-0000-0000-0000-000000000000'::uuid, v_user_id, 'authenticated', 'authenticated',
      'noor.mohammad@sunsetgroupbd.com', v_encrypted_password, NOW(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object('full_name', 'Noor Mohammad', 'employee_id', '20260091', 'username', 'noor.mohammad', 'designation', 'Executive (Sales & Marketing)', 'role', 'EMPLOYEE'),
      NOW(), NOW(), '1334223422'
    );
  ELSE
    SELECT id INTO v_user_id FROM auth.users WHERE email = 'noor.mohammad@sunsetgroupbd.com';
    UPDATE auth.users
    SET 
      encrypted_password = v_encrypted_password,
      raw_user_meta_data = jsonb_build_object('full_name', 'Noor Mohammad', 'employee_id', '20260091', 'username', 'noor.mohammad', 'designation', 'Executive (Sales & Marketing)', 'role', 'EMPLOYEE'),
      updated_at = NOW()
    WHERE id = v_user_id;
  END IF;

  INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, created_at, updated_at)
  VALUES (gen_random_uuid(), v_user_id::text, v_user_id, jsonb_build_object('sub', v_user_id::text, 'email', 'noor.mohammad@sunsetgroupbd.com'), 'email', NOW(), NOW())
  ON CONFLICT (provider, provider_id) DO NOTHING;

  INSERT INTO public.profiles (id, employee_id, full_name, email, designation, team_id, joining_date, role, is_active, created_at, updated_at)
  VALUES (v_user_id, '20260091', 'Noor Mohammad', 'noor.mohammad@sunsetgroupbd.com', 'Executive (Sales & Marketing)', v_team_id, CURRENT_DATE, 'EMPLOYEE', true, NOW(), NOW())
  ON CONFLICT (id) DO UPDATE SET
    employee_id = EXCLUDED.employee_id,
    full_name = EXCLUDED.full_name,
    designation = EXCLUDED.designation,
    team_id = EXCLUDED.team_id,
    role = EXCLUDED.role,
    is_active = true,
    updated_at = NOW();

  -- Employee 49: Saoda Binta Karim
  v_user_id := 'b2d86926-79fa-4317-a521-ae4cc29a4e62'::uuid;

  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'saoda.karim@sunsetgroupbd.com') THEN
    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at, phone
    ) VALUES (
      '00000000-0000-0000-0000-000000000000'::uuid, v_user_id, 'authenticated', 'authenticated',
      'saoda.karim@sunsetgroupbd.com', v_encrypted_password, NOW(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object('full_name', 'Saoda Binta Karim', 'employee_id', '20260096', 'username', 'saoda.karim', 'designation', 'Jr. Executive (Sales & Marketing)', 'role', 'EMPLOYEE'),
      NOW(), NOW(), '1335241121'
    );
  ELSE
    SELECT id INTO v_user_id FROM auth.users WHERE email = 'saoda.karim@sunsetgroupbd.com';
    UPDATE auth.users
    SET 
      encrypted_password = v_encrypted_password,
      raw_user_meta_data = jsonb_build_object('full_name', 'Saoda Binta Karim', 'employee_id', '20260096', 'username', 'saoda.karim', 'designation', 'Jr. Executive (Sales & Marketing)', 'role', 'EMPLOYEE'),
      updated_at = NOW()
    WHERE id = v_user_id;
  END IF;

  INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, created_at, updated_at)
  VALUES (gen_random_uuid(), v_user_id::text, v_user_id, jsonb_build_object('sub', v_user_id::text, 'email', 'saoda.karim@sunsetgroupbd.com'), 'email', NOW(), NOW())
  ON CONFLICT (provider, provider_id) DO NOTHING;

  INSERT INTO public.profiles (id, employee_id, full_name, email, designation, team_id, joining_date, role, is_active, created_at, updated_at)
  VALUES (v_user_id, '20260096', 'Saoda Binta Karim', 'saoda.karim@sunsetgroupbd.com', 'Jr. Executive (Sales & Marketing)', v_team_id, CURRENT_DATE, 'EMPLOYEE', true, NOW(), NOW())
  ON CONFLICT (id) DO UPDATE SET
    employee_id = EXCLUDED.employee_id,
    full_name = EXCLUDED.full_name,
    designation = EXCLUDED.designation,
    team_id = EXCLUDED.team_id,
    role = EXCLUDED.role,
    is_active = true,
    updated_at = NOW();

  -- Employee 50: Nusrat Jahan
  v_user_id := '96b64d6b-4433-48bc-a7f0-4d570e409147'::uuid;

  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'nusrat.jahan@sunsetgroupbd.com') THEN
    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at, phone
    ) VALUES (
      '00000000-0000-0000-0000-000000000000'::uuid, v_user_id, 'authenticated', 'authenticated',
      'nusrat.jahan@sunsetgroupbd.com', v_encrypted_password, NOW(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object('full_name', 'Nusrat Jahan', 'employee_id', '20260097', 'username', 'nusrat.jahan', 'designation', 'Jr. Executive (Sales & Marketing)', 'role', 'EMPLOYEE'),
      NOW(), NOW(), '1313362344'
    );
  ELSE
    SELECT id INTO v_user_id FROM auth.users WHERE email = 'nusrat.jahan@sunsetgroupbd.com';
    UPDATE auth.users
    SET 
      encrypted_password = v_encrypted_password,
      raw_user_meta_data = jsonb_build_object('full_name', 'Nusrat Jahan', 'employee_id', '20260097', 'username', 'nusrat.jahan', 'designation', 'Jr. Executive (Sales & Marketing)', 'role', 'EMPLOYEE'),
      updated_at = NOW()
    WHERE id = v_user_id;
  END IF;

  INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, created_at, updated_at)
  VALUES (gen_random_uuid(), v_user_id::text, v_user_id, jsonb_build_object('sub', v_user_id::text, 'email', 'nusrat.jahan@sunsetgroupbd.com'), 'email', NOW(), NOW())
  ON CONFLICT (provider, provider_id) DO NOTHING;

  INSERT INTO public.profiles (id, employee_id, full_name, email, designation, team_id, joining_date, role, is_active, created_at, updated_at)
  VALUES (v_user_id, '20260097', 'Nusrat Jahan', 'nusrat.jahan@sunsetgroupbd.com', 'Jr. Executive (Sales & Marketing)', v_team_id, CURRENT_DATE, 'EMPLOYEE', true, NOW(), NOW())
  ON CONFLICT (id) DO UPDATE SET
    employee_id = EXCLUDED.employee_id,
    full_name = EXCLUDED.full_name,
    designation = EXCLUDED.designation,
    team_id = EXCLUDED.team_id,
    role = EXCLUDED.role,
    is_active = true,
    updated_at = NOW();

  -- Employee 51: Md. Habibur Rahman
  v_user_id := '4ab903bf-2da7-4f47-ae30-7fa6f1b73a47'::uuid;

  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'habibur.rahman@sunsetgroupbd.com') THEN
    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at, phone
    ) VALUES (
      '00000000-0000-0000-0000-000000000000'::uuid, v_user_id, 'authenticated', 'authenticated',
      'habibur.rahman@sunsetgroupbd.com', v_encrypted_password, NOW(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object('full_name', 'Md. Habibur Rahman', 'employee_id', '20260098', 'username', 'habibur.rahman', 'designation', 'Executive (Sales & Marketing)', 'role', 'EMPLOYEE'),
      NOW(), NOW(), '1335223423'
    );
  ELSE
    SELECT id INTO v_user_id FROM auth.users WHERE email = 'habibur.rahman@sunsetgroupbd.com';
    UPDATE auth.users
    SET 
      encrypted_password = v_encrypted_password,
      raw_user_meta_data = jsonb_build_object('full_name', 'Md. Habibur Rahman', 'employee_id', '20260098', 'username', 'habibur.rahman', 'designation', 'Executive (Sales & Marketing)', 'role', 'EMPLOYEE'),
      updated_at = NOW()
    WHERE id = v_user_id;
  END IF;

  INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, created_at, updated_at)
  VALUES (gen_random_uuid(), v_user_id::text, v_user_id, jsonb_build_object('sub', v_user_id::text, 'email', 'habibur.rahman@sunsetgroupbd.com'), 'email', NOW(), NOW())
  ON CONFLICT (provider, provider_id) DO NOTHING;

  INSERT INTO public.profiles (id, employee_id, full_name, email, designation, team_id, joining_date, role, is_active, created_at, updated_at)
  VALUES (v_user_id, '20260098', 'Md. Habibur Rahman', 'habibur.rahman@sunsetgroupbd.com', 'Executive (Sales & Marketing)', v_team_id, CURRENT_DATE, 'EMPLOYEE', true, NOW(), NOW())
  ON CONFLICT (id) DO UPDATE SET
    employee_id = EXCLUDED.employee_id,
    full_name = EXCLUDED.full_name,
    designation = EXCLUDED.designation,
    team_id = EXCLUDED.team_id,
    role = EXCLUDED.role,
    is_active = true,
    updated_at = NOW();

  -- Employee 52: Samima Islam Nima
  v_user_id := '17a08040-0e88-4c86-a890-8fd33ccc63f9'::uuid;

  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'samima.nima@sunsetgroupbd.com') THEN
    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at, phone
    ) VALUES (
      '00000000-0000-0000-0000-000000000000'::uuid, v_user_id, 'authenticated', 'authenticated',
      'samima.nima@sunsetgroupbd.com', v_encrypted_password, NOW(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object('full_name', 'Samima Islam Nima', 'employee_id', '20260099', 'username', 'samima.nima', 'designation', 'Jr. Executive (Sales & Marketing)', 'role', 'EMPLOYEE'),
      NOW(), NOW(), '1335223424'
    );
  ELSE
    SELECT id INTO v_user_id FROM auth.users WHERE email = 'samima.nima@sunsetgroupbd.com';
    UPDATE auth.users
    SET 
      encrypted_password = v_encrypted_password,
      raw_user_meta_data = jsonb_build_object('full_name', 'Samima Islam Nima', 'employee_id', '20260099', 'username', 'samima.nima', 'designation', 'Jr. Executive (Sales & Marketing)', 'role', 'EMPLOYEE'),
      updated_at = NOW()
    WHERE id = v_user_id;
  END IF;

  INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, created_at, updated_at)
  VALUES (gen_random_uuid(), v_user_id::text, v_user_id, jsonb_build_object('sub', v_user_id::text, 'email', 'samima.nima@sunsetgroupbd.com'), 'email', NOW(), NOW())
  ON CONFLICT (provider, provider_id) DO NOTHING;

  INSERT INTO public.profiles (id, employee_id, full_name, email, designation, team_id, joining_date, role, is_active, created_at, updated_at)
  VALUES (v_user_id, '20260099', 'Samima Islam Nima', 'samima.nima@sunsetgroupbd.com', 'Jr. Executive (Sales & Marketing)', v_team_id, CURRENT_DATE, 'EMPLOYEE', true, NOW(), NOW())
  ON CONFLICT (id) DO UPDATE SET
    employee_id = EXCLUDED.employee_id,
    full_name = EXCLUDED.full_name,
    designation = EXCLUDED.designation,
    team_id = EXCLUDED.team_id,
    role = EXCLUDED.role,
    is_active = true,
    updated_at = NOW();

  -- Employee 53: Kakuly Akter
  v_user_id := '509fa9f9-32b2-4acb-aa83-d12bccef8ae5'::uuid;

  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'kakuly.akter@sunsetgroupbd.com') THEN
    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at, phone
    ) VALUES (
      '00000000-0000-0000-0000-000000000000'::uuid, v_user_id, 'authenticated', 'authenticated',
      'kakuly.akter@sunsetgroupbd.com', v_encrypted_password, NOW(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object('full_name', 'Kakuly Akter', 'employee_id', '20260100', 'username', 'kakuly.akter', 'designation', 'Executive (Sales & Marketing)', 'role', 'EMPLOYEE'),
      NOW(), NOW(), '1335114192'
    );
  ELSE
    SELECT id INTO v_user_id FROM auth.users WHERE email = 'kakuly.akter@sunsetgroupbd.com';
    UPDATE auth.users
    SET 
      encrypted_password = v_encrypted_password,
      raw_user_meta_data = jsonb_build_object('full_name', 'Kakuly Akter', 'employee_id', '20260100', 'username', 'kakuly.akter', 'designation', 'Executive (Sales & Marketing)', 'role', 'EMPLOYEE'),
      updated_at = NOW()
    WHERE id = v_user_id;
  END IF;

  INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, created_at, updated_at)
  VALUES (gen_random_uuid(), v_user_id::text, v_user_id, jsonb_build_object('sub', v_user_id::text, 'email', 'kakuly.akter@sunsetgroupbd.com'), 'email', NOW(), NOW())
  ON CONFLICT (provider, provider_id) DO NOTHING;

  INSERT INTO public.profiles (id, employee_id, full_name, email, designation, team_id, joining_date, role, is_active, created_at, updated_at)
  VALUES (v_user_id, '20260100', 'Kakuly Akter', 'kakuly.akter@sunsetgroupbd.com', 'Executive (Sales & Marketing)', v_team_id, CURRENT_DATE, 'EMPLOYEE', true, NOW(), NOW())
  ON CONFLICT (id) DO UPDATE SET
    employee_id = EXCLUDED.employee_id,
    full_name = EXCLUDED.full_name,
    designation = EXCLUDED.designation,
    team_id = EXCLUDED.team_id,
    role = EXCLUDED.role,
    is_active = true,
    updated_at = NOW();

  -- Employee 54: Md. Monjurul Islam
  v_user_id := '9e6bbbc8-b414-496a-ae74-c7ddeac992d2'::uuid;

  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'monjurul.islam@sunsetgroupbd.com') THEN
    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at, phone
    ) VALUES (
      '00000000-0000-0000-0000-000000000000'::uuid, v_user_id, 'authenticated', 'authenticated',
      'monjurul.islam@sunsetgroupbd.com', v_encrypted_password, NOW(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object('full_name', 'Md. Monjurul Islam', 'employee_id', '20260102', 'username', 'monjurul.islam', 'designation', 'Executive (Sales & Marketing)', 'role', 'EMPLOYEE'),
      NOW(), NOW(), '1335114197'
    );
  ELSE
    SELECT id INTO v_user_id FROM auth.users WHERE email = 'monjurul.islam@sunsetgroupbd.com';
    UPDATE auth.users
    SET 
      encrypted_password = v_encrypted_password,
      raw_user_meta_data = jsonb_build_object('full_name', 'Md. Monjurul Islam', 'employee_id', '20260102', 'username', 'monjurul.islam', 'designation', 'Executive (Sales & Marketing)', 'role', 'EMPLOYEE'),
      updated_at = NOW()
    WHERE id = v_user_id;
  END IF;

  INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, created_at, updated_at)
  VALUES (gen_random_uuid(), v_user_id::text, v_user_id, jsonb_build_object('sub', v_user_id::text, 'email', 'monjurul.islam@sunsetgroupbd.com'), 'email', NOW(), NOW())
  ON CONFLICT (provider, provider_id) DO NOTHING;

  INSERT INTO public.profiles (id, employee_id, full_name, email, designation, team_id, joining_date, role, is_active, created_at, updated_at)
  VALUES (v_user_id, '20260102', 'Md. Monjurul Islam', 'monjurul.islam@sunsetgroupbd.com', 'Executive (Sales & Marketing)', v_team_id, CURRENT_DATE, 'EMPLOYEE', true, NOW(), NOW())
  ON CONFLICT (id) DO UPDATE SET
    employee_id = EXCLUDED.employee_id,
    full_name = EXCLUDED.full_name,
    designation = EXCLUDED.designation,
    team_id = EXCLUDED.team_id,
    role = EXCLUDED.role,
    is_active = true,
    updated_at = NOW();

  -- Employee 55: Tanvir Rashid Hemal
  v_user_id := 'b7b11234-7175-47bb-a2e2-0a7667431929'::uuid;

  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'tanvir.hemal@sunsetgroupbd.com') THEN
    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at, phone
    ) VALUES (
      '00000000-0000-0000-0000-000000000000'::uuid, v_user_id, 'authenticated', 'authenticated',
      'tanvir.hemal@sunsetgroupbd.com', v_encrypted_password, NOW(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object('full_name', 'Tanvir Rashid Hemal', 'employee_id', '20260105', 'username', 'tanvir.hemal', 'designation', 'Jr. Executive (Sales & Marketing)', 'role', 'EMPLOYEE'),
      NOW(), NOW(), '1335114196'
    );
  ELSE
    SELECT id INTO v_user_id FROM auth.users WHERE email = 'tanvir.hemal@sunsetgroupbd.com';
    UPDATE auth.users
    SET 
      encrypted_password = v_encrypted_password,
      raw_user_meta_data = jsonb_build_object('full_name', 'Tanvir Rashid Hemal', 'employee_id', '20260105', 'username', 'tanvir.hemal', 'designation', 'Jr. Executive (Sales & Marketing)', 'role', 'EMPLOYEE'),
      updated_at = NOW()
    WHERE id = v_user_id;
  END IF;

  INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, created_at, updated_at)
  VALUES (gen_random_uuid(), v_user_id::text, v_user_id, jsonb_build_object('sub', v_user_id::text, 'email', 'tanvir.hemal@sunsetgroupbd.com'), 'email', NOW(), NOW())
  ON CONFLICT (provider, provider_id) DO NOTHING;

  INSERT INTO public.profiles (id, employee_id, full_name, email, designation, team_id, joining_date, role, is_active, created_at, updated_at)
  VALUES (v_user_id, '20260105', 'Tanvir Rashid Hemal', 'tanvir.hemal@sunsetgroupbd.com', 'Jr. Executive (Sales & Marketing)', v_team_id, CURRENT_DATE, 'EMPLOYEE', true, NOW(), NOW())
  ON CONFLICT (id) DO UPDATE SET
    employee_id = EXCLUDED.employee_id,
    full_name = EXCLUDED.full_name,
    designation = EXCLUDED.designation,
    team_id = EXCLUDED.team_id,
    role = EXCLUDED.role,
    is_active = true,
    updated_at = NOW();

  -- Employee 56: Syeda Arifa Yeasmin
  v_user_id := '5f9fddce-6b81-4ce2-a138-ac9729d697b5'::uuid;

  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'syeda.yeasmin@sunsetgroupbd.com') THEN
    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at, phone
    ) VALUES (
      '00000000-0000-0000-0000-000000000000'::uuid, v_user_id, 'authenticated', 'authenticated',
      'syeda.yeasmin@sunsetgroupbd.com', v_encrypted_password, NOW(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object('full_name', 'Syeda Arifa Yeasmin', 'employee_id', '20260106', 'username', 'syeda.yeasmin', 'designation', 'Jr. Executive (Sales & Marketing)', 'role', 'EMPLOYEE'),
      NOW(), NOW(), '1335223405'
    );
  ELSE
    SELECT id INTO v_user_id FROM auth.users WHERE email = 'syeda.yeasmin@sunsetgroupbd.com';
    UPDATE auth.users
    SET 
      encrypted_password = v_encrypted_password,
      raw_user_meta_data = jsonb_build_object('full_name', 'Syeda Arifa Yeasmin', 'employee_id', '20260106', 'username', 'syeda.yeasmin', 'designation', 'Jr. Executive (Sales & Marketing)', 'role', 'EMPLOYEE'),
      updated_at = NOW()
    WHERE id = v_user_id;
  END IF;

  INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, created_at, updated_at)
  VALUES (gen_random_uuid(), v_user_id::text, v_user_id, jsonb_build_object('sub', v_user_id::text, 'email', 'syeda.yeasmin@sunsetgroupbd.com'), 'email', NOW(), NOW())
  ON CONFLICT (provider, provider_id) DO NOTHING;

  INSERT INTO public.profiles (id, employee_id, full_name, email, designation, team_id, joining_date, role, is_active, created_at, updated_at)
  VALUES (v_user_id, '20260106', 'Syeda Arifa Yeasmin', 'syeda.yeasmin@sunsetgroupbd.com', 'Jr. Executive (Sales & Marketing)', v_team_id, CURRENT_DATE, 'EMPLOYEE', true, NOW(), NOW())
  ON CONFLICT (id) DO UPDATE SET
    employee_id = EXCLUDED.employee_id,
    full_name = EXCLUDED.full_name,
    designation = EXCLUDED.designation,
    team_id = EXCLUDED.team_id,
    role = EXCLUDED.role,
    is_active = true,
    updated_at = NOW();

  -- Employee 57: Rohana Ferdous Jahan
  v_user_id := '92df070c-595c-4dc6-a39f-58a62d301992'::uuid;

  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'rohana.jahan@sunsetgroupbd.com') THEN
    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at, phone
    ) VALUES (
      '00000000-0000-0000-0000-000000000000'::uuid, v_user_id, 'authenticated', 'authenticated',
      'rohana.jahan@sunsetgroupbd.com', v_encrypted_password, NOW(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object('full_name', 'Rohana Ferdous Jahan', 'employee_id', '20260107', 'username', 'rohana.jahan', 'designation', 'Jr. Executive (Sales & Marketing)', 'role', 'EMPLOYEE'),
      NOW(), NOW(), '1335223403'
    );
  ELSE
    SELECT id INTO v_user_id FROM auth.users WHERE email = 'rohana.jahan@sunsetgroupbd.com';
    UPDATE auth.users
    SET 
      encrypted_password = v_encrypted_password,
      raw_user_meta_data = jsonb_build_object('full_name', 'Rohana Ferdous Jahan', 'employee_id', '20260107', 'username', 'rohana.jahan', 'designation', 'Jr. Executive (Sales & Marketing)', 'role', 'EMPLOYEE'),
      updated_at = NOW()
    WHERE id = v_user_id;
  END IF;

  INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, created_at, updated_at)
  VALUES (gen_random_uuid(), v_user_id::text, v_user_id, jsonb_build_object('sub', v_user_id::text, 'email', 'rohana.jahan@sunsetgroupbd.com'), 'email', NOW(), NOW())
  ON CONFLICT (provider, provider_id) DO NOTHING;

  INSERT INTO public.profiles (id, employee_id, full_name, email, designation, team_id, joining_date, role, is_active, created_at, updated_at)
  VALUES (v_user_id, '20260107', 'Rohana Ferdous Jahan', 'rohana.jahan@sunsetgroupbd.com', 'Jr. Executive (Sales & Marketing)', v_team_id, CURRENT_DATE, 'EMPLOYEE', true, NOW(), NOW())
  ON CONFLICT (id) DO UPDATE SET
    employee_id = EXCLUDED.employee_id,
    full_name = EXCLUDED.full_name,
    designation = EXCLUDED.designation,
    team_id = EXCLUDED.team_id,
    role = EXCLUDED.role,
    is_active = true,
    updated_at = NOW();

  -- Employee 58: Md Mashrafi Ahmed
  v_user_id := '3cefb487-6911-43fb-aac2-b427c6b79127'::uuid;

  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'mashrafi.ahmed@sunsetgroupbd.com') THEN
    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at, phone
    ) VALUES (
      '00000000-0000-0000-0000-000000000000'::uuid, v_user_id, 'authenticated', 'authenticated',
      'mashrafi.ahmed@sunsetgroupbd.com', v_encrypted_password, NOW(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object('full_name', 'Md Mashrafi Ahmed', 'employee_id', '20260109', 'username', 'mashrafi.ahmed', 'designation', 'Jr. Executive (Sales & Marketing)', 'role', 'EMPLOYEE'),
      NOW(), NOW(), '1335223413'
    );
  ELSE
    SELECT id INTO v_user_id FROM auth.users WHERE email = 'mashrafi.ahmed@sunsetgroupbd.com';
    UPDATE auth.users
    SET 
      encrypted_password = v_encrypted_password,
      raw_user_meta_data = jsonb_build_object('full_name', 'Md Mashrafi Ahmed', 'employee_id', '20260109', 'username', 'mashrafi.ahmed', 'designation', 'Jr. Executive (Sales & Marketing)', 'role', 'EMPLOYEE'),
      updated_at = NOW()
    WHERE id = v_user_id;
  END IF;

  INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, created_at, updated_at)
  VALUES (gen_random_uuid(), v_user_id::text, v_user_id, jsonb_build_object('sub', v_user_id::text, 'email', 'mashrafi.ahmed@sunsetgroupbd.com'), 'email', NOW(), NOW())
  ON CONFLICT (provider, provider_id) DO NOTHING;

  INSERT INTO public.profiles (id, employee_id, full_name, email, designation, team_id, joining_date, role, is_active, created_at, updated_at)
  VALUES (v_user_id, '20260109', 'Md Mashrafi Ahmed', 'mashrafi.ahmed@sunsetgroupbd.com', 'Jr. Executive (Sales & Marketing)', v_team_id, CURRENT_DATE, 'EMPLOYEE', true, NOW(), NOW())
  ON CONFLICT (id) DO UPDATE SET
    employee_id = EXCLUDED.employee_id,
    full_name = EXCLUDED.full_name,
    designation = EXCLUDED.designation,
    team_id = EXCLUDED.team_id,
    role = EXCLUDED.role,
    is_active = true,
    updated_at = NOW();

  -- Employee 59: Sajjad Hossain Sohag
  v_user_id := 'f3d3eebb-b23c-4eef-a936-95c2263748a0'::uuid;

  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'sajjad.sohag@sunsetgroupbd.com') THEN
    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at, phone
    ) VALUES (
      '00000000-0000-0000-0000-000000000000'::uuid, v_user_id, 'authenticated', 'authenticated',
      'sajjad.sohag@sunsetgroupbd.com', v_encrypted_password, NOW(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object('full_name', 'Sajjad Hossain Sohag', 'employee_id', '20260112', 'username', 'sajjad.sohag', 'designation', 'Sr. Executive (Sales & Marketing)', 'role', 'EMPLOYEE'),
      NOW(), NOW(), '1335114194'
    );
  ELSE
    SELECT id INTO v_user_id FROM auth.users WHERE email = 'sajjad.sohag@sunsetgroupbd.com';
    UPDATE auth.users
    SET 
      encrypted_password = v_encrypted_password,
      raw_user_meta_data = jsonb_build_object('full_name', 'Sajjad Hossain Sohag', 'employee_id', '20260112', 'username', 'sajjad.sohag', 'designation', 'Sr. Executive (Sales & Marketing)', 'role', 'EMPLOYEE'),
      updated_at = NOW()
    WHERE id = v_user_id;
  END IF;

  INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, created_at, updated_at)
  VALUES (gen_random_uuid(), v_user_id::text, v_user_id, jsonb_build_object('sub', v_user_id::text, 'email', 'sajjad.sohag@sunsetgroupbd.com'), 'email', NOW(), NOW())
  ON CONFLICT (provider, provider_id) DO NOTHING;

  INSERT INTO public.profiles (id, employee_id, full_name, email, designation, team_id, joining_date, role, is_active, created_at, updated_at)
  VALUES (v_user_id, '20260112', 'Sajjad Hossain Sohag', 'sajjad.sohag@sunsetgroupbd.com', 'Sr. Executive (Sales & Marketing)', v_team_id, CURRENT_DATE, 'EMPLOYEE', true, NOW(), NOW())
  ON CONFLICT (id) DO UPDATE SET
    employee_id = EXCLUDED.employee_id,
    full_name = EXCLUDED.full_name,
    designation = EXCLUDED.designation,
    team_id = EXCLUDED.team_id,
    role = EXCLUDED.role,
    is_active = true,
    updated_at = NOW();

  -- Employee 60: Rotna Khatun
  v_user_id := 'b16175e7-c3fb-4087-afde-1388ba1ea3c4'::uuid;

  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'rotna.khatun@sunsetgroupbd.com') THEN
    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at, phone
    ) VALUES (
      '00000000-0000-0000-0000-000000000000'::uuid, v_user_id, 'authenticated', 'authenticated',
      'rotna.khatun@sunsetgroupbd.com', v_encrypted_password, NOW(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object('full_name', 'Rotna Khatun', 'employee_id', '20260113', 'username', 'rotna.khatun', 'designation', 'Executive (Sales & Marketing)', 'role', 'EMPLOYEE'),
      NOW(), NOW(), '1335114183'
    );
  ELSE
    SELECT id INTO v_user_id FROM auth.users WHERE email = 'rotna.khatun@sunsetgroupbd.com';
    UPDATE auth.users
    SET 
      encrypted_password = v_encrypted_password,
      raw_user_meta_data = jsonb_build_object('full_name', 'Rotna Khatun', 'employee_id', '20260113', 'username', 'rotna.khatun', 'designation', 'Executive (Sales & Marketing)', 'role', 'EMPLOYEE'),
      updated_at = NOW()
    WHERE id = v_user_id;
  END IF;

  INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, created_at, updated_at)
  VALUES (gen_random_uuid(), v_user_id::text, v_user_id, jsonb_build_object('sub', v_user_id::text, 'email', 'rotna.khatun@sunsetgroupbd.com'), 'email', NOW(), NOW())
  ON CONFLICT (provider, provider_id) DO NOTHING;

  INSERT INTO public.profiles (id, employee_id, full_name, email, designation, team_id, joining_date, role, is_active, created_at, updated_at)
  VALUES (v_user_id, '20260113', 'Rotna Khatun', 'rotna.khatun@sunsetgroupbd.com', 'Executive (Sales & Marketing)', v_team_id, CURRENT_DATE, 'EMPLOYEE', true, NOW(), NOW())
  ON CONFLICT (id) DO UPDATE SET
    employee_id = EXCLUDED.employee_id,
    full_name = EXCLUDED.full_name,
    designation = EXCLUDED.designation,
    team_id = EXCLUDED.team_id,
    role = EXCLUDED.role,
    is_active = true,
    updated_at = NOW();

  -- Employee 61: Annapourna Sarker
  v_user_id := '6d3679bc-a635-4382-a98a-916d8f0404cb'::uuid;

  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'annapourna.sarker@sunsetgroupbd.com') THEN
    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at, phone
    ) VALUES (
      '00000000-0000-0000-0000-000000000000'::uuid, v_user_id, 'authenticated', 'authenticated',
      'annapourna.sarker@sunsetgroupbd.com', v_encrypted_password, NOW(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object('full_name', 'Annapourna Sarker', 'employee_id', '20260114', 'username', 'annapourna.sarker', 'designation', 'Jr. Executive (Sales & Marketing)', 'role', 'EMPLOYEE'),
      NOW(), NOW(), NULL
    );
  ELSE
    SELECT id INTO v_user_id FROM auth.users WHERE email = 'annapourna.sarker@sunsetgroupbd.com';
    UPDATE auth.users
    SET 
      encrypted_password = v_encrypted_password,
      raw_user_meta_data = jsonb_build_object('full_name', 'Annapourna Sarker', 'employee_id', '20260114', 'username', 'annapourna.sarker', 'designation', 'Jr. Executive (Sales & Marketing)', 'role', 'EMPLOYEE'),
      updated_at = NOW()
    WHERE id = v_user_id;
  END IF;

  INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, created_at, updated_at)
  VALUES (gen_random_uuid(), v_user_id::text, v_user_id, jsonb_build_object('sub', v_user_id::text, 'email', 'annapourna.sarker@sunsetgroupbd.com'), 'email', NOW(), NOW())
  ON CONFLICT (provider, provider_id) DO NOTHING;

  INSERT INTO public.profiles (id, employee_id, full_name, email, designation, team_id, joining_date, role, is_active, created_at, updated_at)
  VALUES (v_user_id, '20260114', 'Annapourna Sarker', 'annapourna.sarker@sunsetgroupbd.com', 'Jr. Executive (Sales & Marketing)', v_team_id, CURRENT_DATE, 'EMPLOYEE', true, NOW(), NOW())
  ON CONFLICT (id) DO UPDATE SET
    employee_id = EXCLUDED.employee_id,
    full_name = EXCLUDED.full_name,
    designation = EXCLUDED.designation,
    team_id = EXCLUDED.team_id,
    role = EXCLUDED.role,
    is_active = true,
    updated_at = NOW();

  -- Employee 62: Tanvir Ahmed Mollah
  v_user_id := '0f02fb1d-6009-41ff-a37c-b98755bf62cb'::uuid;

  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'tanvir.mollah@sunsetgroupbd.com') THEN
    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at, phone
    ) VALUES (
      '00000000-0000-0000-0000-000000000000'::uuid, v_user_id, 'authenticated', 'authenticated',
      'tanvir.mollah@sunsetgroupbd.com', v_encrypted_password, NOW(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object('full_name', 'Tanvir Ahmed Mollah', 'employee_id', '20260115', 'username', 'tanvir.mollah', 'designation', 'Executive (Sales & Marketing)', 'role', 'EMPLOYEE'),
      NOW(), NOW(), NULL
    );
  ELSE
    SELECT id INTO v_user_id FROM auth.users WHERE email = 'tanvir.mollah@sunsetgroupbd.com';
    UPDATE auth.users
    SET 
      encrypted_password = v_encrypted_password,
      raw_user_meta_data = jsonb_build_object('full_name', 'Tanvir Ahmed Mollah', 'employee_id', '20260115', 'username', 'tanvir.mollah', 'designation', 'Executive (Sales & Marketing)', 'role', 'EMPLOYEE'),
      updated_at = NOW()
    WHERE id = v_user_id;
  END IF;

  INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, created_at, updated_at)
  VALUES (gen_random_uuid(), v_user_id::text, v_user_id, jsonb_build_object('sub', v_user_id::text, 'email', 'tanvir.mollah@sunsetgroupbd.com'), 'email', NOW(), NOW())
  ON CONFLICT (provider, provider_id) DO NOTHING;

  INSERT INTO public.profiles (id, employee_id, full_name, email, designation, team_id, joining_date, role, is_active, created_at, updated_at)
  VALUES (v_user_id, '20260115', 'Tanvir Ahmed Mollah', 'tanvir.mollah@sunsetgroupbd.com', 'Executive (Sales & Marketing)', v_team_id, CURRENT_DATE, 'EMPLOYEE', true, NOW(), NOW())
  ON CONFLICT (id) DO UPDATE SET
    employee_id = EXCLUDED.employee_id,
    full_name = EXCLUDED.full_name,
    designation = EXCLUDED.designation,
    team_id = EXCLUDED.team_id,
    role = EXCLUDED.role,
    is_active = true,
    updated_at = NOW();

  -- Employee 63: Syed Md Atef Bokhtiar
  v_user_id := 'c44e05c4-a2ff-4b1f-af27-fd1b4303e18e'::uuid;

  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'syed.bokhtiar@sunsetgroupbd.com') THEN
    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at, phone
    ) VALUES (
      '00000000-0000-0000-0000-000000000000'::uuid, v_user_id, 'authenticated', 'authenticated',
      'syed.bokhtiar@sunsetgroupbd.com', v_encrypted_password, NOW(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object('full_name', 'Syed Md Atef Bokhtiar', 'employee_id', '20260116', 'username', 'syed.bokhtiar', 'designation', 'Sr. Executive (Sales & Marketing)', 'role', 'EMPLOYEE'),
      NOW(), NOW(), NULL
    );
  ELSE
    SELECT id INTO v_user_id FROM auth.users WHERE email = 'syed.bokhtiar@sunsetgroupbd.com';
    UPDATE auth.users
    SET 
      encrypted_password = v_encrypted_password,
      raw_user_meta_data = jsonb_build_object('full_name', 'Syed Md Atef Bokhtiar', 'employee_id', '20260116', 'username', 'syed.bokhtiar', 'designation', 'Sr. Executive (Sales & Marketing)', 'role', 'EMPLOYEE'),
      updated_at = NOW()
    WHERE id = v_user_id;
  END IF;

  INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, created_at, updated_at)
  VALUES (gen_random_uuid(), v_user_id::text, v_user_id, jsonb_build_object('sub', v_user_id::text, 'email', 'syed.bokhtiar@sunsetgroupbd.com'), 'email', NOW(), NOW())
  ON CONFLICT (provider, provider_id) DO NOTHING;

  INSERT INTO public.profiles (id, employee_id, full_name, email, designation, team_id, joining_date, role, is_active, created_at, updated_at)
  VALUES (v_user_id, '20260116', 'Syed Md Atef Bokhtiar', 'syed.bokhtiar@sunsetgroupbd.com', 'Sr. Executive (Sales & Marketing)', v_team_id, CURRENT_DATE, 'EMPLOYEE', true, NOW(), NOW())
  ON CONFLICT (id) DO UPDATE SET
    employee_id = EXCLUDED.employee_id,
    full_name = EXCLUDED.full_name,
    designation = EXCLUDED.designation,
    team_id = EXCLUDED.team_id,
    role = EXCLUDED.role,
    is_active = true,
    updated_at = NOW();

  -- Employee 64: Shihab Uddin
  v_user_id := '138cc180-b711-46c1-aea6-2ddb09944991'::uuid;

  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'shihab.uddin@sunsetgroupbd.com') THEN
    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at, phone
    ) VALUES (
      '00000000-0000-0000-0000-000000000000'::uuid, v_user_id, 'authenticated', 'authenticated',
      'shihab.uddin@sunsetgroupbd.com', v_encrypted_password, NOW(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object('full_name', 'Shihab Uddin', 'employee_id', '20260117', 'username', 'shihab.uddin', 'designation', 'Executive (Sales & Marketing)', 'role', 'EMPLOYEE'),
      NOW(), NOW(), NULL
    );
  ELSE
    SELECT id INTO v_user_id FROM auth.users WHERE email = 'shihab.uddin@sunsetgroupbd.com';
    UPDATE auth.users
    SET 
      encrypted_password = v_encrypted_password,
      raw_user_meta_data = jsonb_build_object('full_name', 'Shihab Uddin', 'employee_id', '20260117', 'username', 'shihab.uddin', 'designation', 'Executive (Sales & Marketing)', 'role', 'EMPLOYEE'),
      updated_at = NOW()
    WHERE id = v_user_id;
  END IF;

  INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, created_at, updated_at)
  VALUES (gen_random_uuid(), v_user_id::text, v_user_id, jsonb_build_object('sub', v_user_id::text, 'email', 'shihab.uddin@sunsetgroupbd.com'), 'email', NOW(), NOW())
  ON CONFLICT (provider, provider_id) DO NOTHING;

  INSERT INTO public.profiles (id, employee_id, full_name, email, designation, team_id, joining_date, role, is_active, created_at, updated_at)
  VALUES (v_user_id, '20260117', 'Shihab Uddin', 'shihab.uddin@sunsetgroupbd.com', 'Executive (Sales & Marketing)', v_team_id, CURRENT_DATE, 'EMPLOYEE', true, NOW(), NOW())
  ON CONFLICT (id) DO UPDATE SET
    employee_id = EXCLUDED.employee_id,
    full_name = EXCLUDED.full_name,
    designation = EXCLUDED.designation,
    team_id = EXCLUDED.team_id,
    role = EXCLUDED.role,
    is_active = true,
    updated_at = NOW();

  -- Employee 65: Md. Zahid Hasan
  v_user_id := '5d7d4462-ac0a-4132-af77-fff417a31a14'::uuid;

  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'zahid.hasan@sunsetgroupbd.com') THEN
    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at, phone
    ) VALUES (
      '00000000-0000-0000-0000-000000000000'::uuid, v_user_id, 'authenticated', 'authenticated',
      'zahid.hasan@sunsetgroupbd.com', v_encrypted_password, NOW(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object('full_name', 'Md. Zahid Hasan', 'employee_id', '20260118', 'username', 'zahid.hasan', 'designation', 'Asst. Manager (Sales & Marketing)', 'role', 'CO'),
      NOW(), NOW(), NULL
    );
  ELSE
    SELECT id INTO v_user_id FROM auth.users WHERE email = 'zahid.hasan@sunsetgroupbd.com';
    UPDATE auth.users
    SET 
      encrypted_password = v_encrypted_password,
      raw_user_meta_data = jsonb_build_object('full_name', 'Md. Zahid Hasan', 'employee_id', '20260118', 'username', 'zahid.hasan', 'designation', 'Asst. Manager (Sales & Marketing)', 'role', 'CO'),
      updated_at = NOW()
    WHERE id = v_user_id;
  END IF;

  INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, created_at, updated_at)
  VALUES (gen_random_uuid(), v_user_id::text, v_user_id, jsonb_build_object('sub', v_user_id::text, 'email', 'zahid.hasan@sunsetgroupbd.com'), 'email', NOW(), NOW())
  ON CONFLICT (provider, provider_id) DO NOTHING;

  INSERT INTO public.profiles (id, employee_id, full_name, email, designation, team_id, joining_date, role, is_active, created_at, updated_at)
  VALUES (v_user_id, '20260118', 'Md. Zahid Hasan', 'zahid.hasan@sunsetgroupbd.com', 'Asst. Manager (Sales & Marketing)', v_team_id, CURRENT_DATE, 'CO', true, NOW(), NOW())
  ON CONFLICT (id) DO UPDATE SET
    employee_id = EXCLUDED.employee_id,
    full_name = EXCLUDED.full_name,
    designation = EXCLUDED.designation,
    team_id = EXCLUDED.team_id,
    role = EXCLUDED.role,
    is_active = true,
    updated_at = NOW();

  -- Employee 66: Mousumi Akter
  v_user_id := '2110bac8-a8d5-4ea6-ae9d-dcfd04e83602'::uuid;

  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'mousumi.akter2@sunsetgroupbd.com') THEN
    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at, phone
    ) VALUES (
      '00000000-0000-0000-0000-000000000000'::uuid, v_user_id, 'authenticated', 'authenticated',
      'mousumi.akter2@sunsetgroupbd.com', v_encrypted_password, NOW(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object('full_name', 'Mousumi Akter', 'employee_id', '20260119', 'username', 'mousumi.akter2', 'designation', 'Executive (Sales & Marketing)', 'role', 'EMPLOYEE'),
      NOW(), NOW(), NULL
    );
  ELSE
    SELECT id INTO v_user_id FROM auth.users WHERE email = 'mousumi.akter2@sunsetgroupbd.com';
    UPDATE auth.users
    SET 
      encrypted_password = v_encrypted_password,
      raw_user_meta_data = jsonb_build_object('full_name', 'Mousumi Akter', 'employee_id', '20260119', 'username', 'mousumi.akter2', 'designation', 'Executive (Sales & Marketing)', 'role', 'EMPLOYEE'),
      updated_at = NOW()
    WHERE id = v_user_id;
  END IF;

  INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, created_at, updated_at)
  VALUES (gen_random_uuid(), v_user_id::text, v_user_id, jsonb_build_object('sub', v_user_id::text, 'email', 'mousumi.akter2@sunsetgroupbd.com'), 'email', NOW(), NOW())
  ON CONFLICT (provider, provider_id) DO NOTHING;

  INSERT INTO public.profiles (id, employee_id, full_name, email, designation, team_id, joining_date, role, is_active, created_at, updated_at)
  VALUES (v_user_id, '20260119', 'Mousumi Akter', 'mousumi.akter2@sunsetgroupbd.com', 'Executive (Sales & Marketing)', v_team_id, CURRENT_DATE, 'EMPLOYEE', true, NOW(), NOW())
  ON CONFLICT (id) DO UPDATE SET
    employee_id = EXCLUDED.employee_id,
    full_name = EXCLUDED.full_name,
    designation = EXCLUDED.designation,
    team_id = EXCLUDED.team_id,
    role = EXCLUDED.role,
    is_active = true,
    updated_at = NOW();
END $$;
