-- =====================================================
-- Helper function to create/setup Admin user
-- =====================================================
-- This function creates an auth user and profile for admin
-- =====================================================

-- Create helper function to setup admin profile
CREATE OR REPLACE FUNCTION public.setup_admin_profile(
  admin_email TEXT,
  admin_password TEXT,
  admin_name TEXT DEFAULT 'Administrator'
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
BEGIN
  -- Get instance ID
  instance_id_val := (SELECT id FROM auth.instances LIMIT 1);
  
  IF instance_id_val IS NULL THEN
    instance_id_val := '00000000-0000-0000-0000-000000000000';
  END IF;
  
  -- Generate password hash using pgcrypto
  BEGIN
    SELECT extensions.crypt(admin_password, extensions.gen_salt('bf')) INTO password_hash;
  EXCEPTION WHEN OTHERS THEN
    -- Use a pre-hashed password if gen_salt fails (fallback)
    password_hash := '$2a$10$rKqY5qJqJqJqJqJqJqJqJ.qJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJq';
  END;
  
  -- Generate UUID for the user
  user_id_val := gen_random_uuid();
  
  -- Insert into auth.users
  INSERT INTO auth.users (
    id,
    instance_id,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    recovery_token,
    is_super_admin,
    role
  )
  VALUES (
    user_id_val,
    instance_id_val,
    admin_email,
    password_hash,
    NOW(),
    '{"provider":"email","providers":["email"]}',
    jsonb_build_object('full_name', admin_name),
    NOW(),
    NOW(),
    '',
    '',
    false,
    'authenticated'
  )
  ON CONFLICT (id) DO NOTHING
  RETURNING id INTO user_id_val;
  
  -- If user already exists, get the ID
  IF user_id_val IS NULL THEN
    SELECT id INTO user_id_val
    FROM auth.users
    WHERE email = admin_email
    LIMIT 1;
  END IF;
  
  -- Insert or update profile
  IF user_id_val IS NOT NULL THEN
    INSERT INTO public.profiles (id, full_name, role)
    VALUES (user_id_val, admin_name, 'admin'::user_role)
    ON CONFLICT (id) DO UPDATE SET
      full_name = EXCLUDED.full_name,
      role = 'admin'::user_role;
  END IF;
  
  RETURN user_id_val;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.setup_admin_profile(TEXT, TEXT, TEXT) TO authenticated;

-- =====================================================
-- Example usage:
-- =====================================================
-- SELECT public.setup_admin_profile(
--   'admin@sman101jkt.sch.id',
--   'admin123',
--   'Administrator'
-- );
-- =====================================================

