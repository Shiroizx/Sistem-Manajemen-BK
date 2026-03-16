-- =====================================================
-- Fix is_admin() function to prevent RLS recursion
-- =====================================================
-- The function needs to bypass RLS when checking admin status
-- =====================================================

-- Drop and recreate is_admin() with proper security settings
DROP FUNCTION IF EXISTS public.is_admin();

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
DECLARE
  user_role_value user_role;
BEGIN
  -- Direct query to auth.users metadata or profiles with SECURITY DEFINER
  -- This bypasses RLS because of SECURITY DEFINER
  SELECT role INTO user_role_value
  FROM public.profiles
  WHERE id = auth.uid();
  
  RETURN COALESCE(user_role_value = 'admin'::user_role, false);
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

