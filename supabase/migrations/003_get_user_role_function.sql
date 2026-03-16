-- =====================================================
-- Helper function to get user role (bypasses RLS)
-- =====================================================
-- This function can be called during login to get user role
-- without RLS restrictions
-- =====================================================

CREATE OR REPLACE FUNCTION public.get_user_role(user_id UUID)
RETURNS user_role
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_role_value user_role;
BEGIN
  SELECT role INTO user_role_value
  FROM public.profiles
  WHERE id = user_id;
  
  -- If profile doesn't exist, return 'student' as default
  IF user_role_value IS NULL THEN
    RETURN 'student'::user_role;
  END IF;
  
  RETURN user_role_value;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_user_role(UUID) TO authenticated;

