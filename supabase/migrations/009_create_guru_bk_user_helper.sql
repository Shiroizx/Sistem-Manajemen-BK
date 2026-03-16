-- =====================================================
-- Helper function to setup Guru BK user profile
-- =====================================================
-- This function should be called AFTER creating a user
-- via Supabase Dashboard (Authentication > Users > Add User)
-- =====================================================

-- Function to setup Guru BK profile
CREATE OR REPLACE FUNCTION public.setup_guru_bk_profile(
  user_email TEXT,
  full_name TEXT DEFAULT NULL
)
RETURNS TABLE(
  success BOOLEAN,
  message TEXT,
  user_id UUID,
  profile_role TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_id_val UUID;
  user_name TEXT;
BEGIN
  -- Get user ID from email
  SELECT id INTO user_id_val
  FROM auth.users
  WHERE email = user_email;
  
  IF user_id_val IS NULL THEN
    RETURN QUERY SELECT 
      false::BOOLEAN,
      format('User with email %s not found. Please create the user first via Supabase Dashboard (Authentication > Users > Add User)', user_email)::TEXT,
      NULL::UUID,
      NULL::TEXT;
    RETURN;
  END IF;
  
  -- Use provided name or extract from email
  user_name := COALESCE(full_name, SPLIT_PART(user_email, '@', 1));
  
  -- Insert or update profile with guru_bk role
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (user_id_val, user_name, 'guru_bk'::user_role)
  ON CONFLICT (id) 
  DO UPDATE SET 
    role = 'guru_bk'::user_role,
    full_name = COALESCE(EXCLUDED.full_name, profiles.full_name);
  
  RETURN QUERY SELECT 
    true::BOOLEAN,
    format('Profile updated successfully for %s with role guru_bk', user_email)::TEXT,
    user_id_val,
    'guru_bk'::TEXT;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.setup_guru_bk_profile(TEXT, TEXT) TO authenticated;

-- =====================================================
-- USAGE INSTRUCTIONS:
-- =====================================================
-- 
-- STEP 1: Create user via Supabase Dashboard
--   1. Go to Authentication > Users
--   2. Click "Add User" or "Invite User"
--   3. Enter email: guru.bk@sman101jkt.sch.id
--   4. Set password (or send invite)
--   5. Note the user's email
--
-- STEP 2: Run this SQL to setup the profile
--   SELECT * FROM public.setup_guru_bk_profile('guru.bk@sman101jkt.sch.id', 'Nama Guru BK');
--
-- OR manually update:
--   UPDATE public.profiles
--   SET role = 'guru_bk'::user_role
--   WHERE id IN (
--     SELECT id FROM auth.users WHERE email = 'guru.bk@sman101jkt.sch.id'
--   );
--
-- =====================================================

