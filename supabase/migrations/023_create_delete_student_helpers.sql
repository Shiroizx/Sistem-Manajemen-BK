-- =====================================================
-- Helper functions to create and delete student profiles
-- =====================================================
-- Students do not log in; admin creates auth user + profile
-- =====================================================

-- Create student: insert auth user (trigger creates profile), then update profile with full data
CREATE OR REPLACE FUNCTION public.create_student_profile(
  p_nis TEXT,
  p_full_name TEXT,
  p_class_name TEXT DEFAULT NULL,
  p_birth_place TEXT DEFAULT NULL,
  p_birth_date DATE DEFAULT NULL,
  p_address TEXT DEFAULT NULL,
  p_student_wa TEXT DEFAULT NULL,
  p_father_name TEXT DEFAULT NULL,
  p_father_wa TEXT DEFAULT NULL,
  p_mother_name TEXT DEFAULT NULL,
  p_mother_wa TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  user_id_val UUID;
  instance_id_val UUID;
  password_hash TEXT;
  student_email TEXT;
BEGIN
  -- Unique placeholder email (students do not log in; auth requires unique email)
  user_id_val := gen_random_uuid();
  student_email := user_id_val::TEXT || '@students.local';

  instance_id_val := (SELECT id FROM auth.instances LIMIT 1);
  IF instance_id_val IS NULL THEN
    instance_id_val := '00000000-0000-0000-0000-000000000000';
  END IF;

  BEGIN
    SELECT extensions.crypt(extensions.gen_random_uuid()::TEXT, extensions.gen_salt('bf')) INTO password_hash;
  EXCEPTION WHEN OTHERS THEN
    password_hash := '$2a$10$rKqY5qJqJqJqJqJqJqJqJ.qJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJq';
  END;

  INSERT INTO auth.users (
    id, instance_id, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
    confirmation_token, recovery_token, is_super_admin, role
  )
  VALUES (
    user_id_val,
    instance_id_val,
    student_email,
    password_hash,
    NOW(),
    '{"provider":"email","providers":["email"]}',
    jsonb_build_object('full_name', p_full_name, 'nis', p_nis),
    NOW(),
    NOW(),
    '',
    '',
    false,
    'authenticated'
  );

  -- Trigger creates profile; update with all student fields
  UPDATE public.profiles
  SET
    full_name = p_full_name,
    nis = NULLIF(TRIM(p_nis), ''),
    class_name = NULLIF(TRIM(p_class_name), ''),
    birth_place = NULLIF(TRIM(p_birth_place), ''),
    birth_date = p_birth_date,
    address = NULLIF(TRIM(p_address), ''),
    student_wa = NULLIF(TRIM(p_student_wa), ''),
    father_name = NULLIF(TRIM(p_father_name), ''),
    father_wa = NULLIF(TRIM(p_father_wa), ''),
    mother_name = NULLIF(TRIM(p_mother_name), ''),
    mother_wa = NULLIF(TRIM(p_mother_wa), ''),
    updated_at = NOW()
  WHERE id = user_id_val;

  RETURN user_id_val;
END;
$$;

-- Delete student: remove profile (cascades to student_records) then auth user
CREATE OR REPLACE FUNCTION public.delete_student_profile(p_profile_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  deleted BOOLEAN;
BEGIN
  DELETE FROM public.profiles WHERE id = p_profile_id;
  deleted := FOUND;
  IF deleted THEN
    DELETE FROM auth.users WHERE id = p_profile_id;
  END IF;
  RETURN deleted;
END;
$$;

GRANT EXECUTE ON FUNCTION public.create_student_profile(TEXT, TEXT, TEXT, TEXT, DATE, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.delete_student_profile(UUID) TO authenticated;
