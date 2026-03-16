-- =====================================================
-- Fix RLS policies for profiles to prevent infinite recursion
-- =====================================================
-- This migration fixes the infinite recursion issue by:
-- 1. Dropping ALL existing SELECT policies on profiles
-- 2. Recreating them using is_admin() function (SECURITY DEFINER)
-- =====================================================

-- Drop ALL existing SELECT policies on profiles table
-- (This handles any policy names that might exist)
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (
        SELECT policyname 
        FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'profiles'
        AND cmd = 'SELECT'
    ) LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.profiles', r.policyname);
    END LOOP;
END $$;

-- Recreate policies using the is_admin() function to avoid recursion
-- Admin: Can view all profiles (uses is_admin() function which is SECURITY DEFINER)
CREATE POLICY "Admin can view all profiles"
    ON public.profiles
    FOR SELECT
    TO authenticated
    USING (public.is_admin());

-- Users: Can always view their own profile
-- This is important for login flow and doesn't cause recursion
CREATE POLICY "Users can view own profile"
    ON public.profiles
    FOR SELECT
    TO authenticated
    USING (id = auth.uid());

-- =====================================================
-- Note: 
-- 1. "Admin can view all profiles" uses is_admin() function which is
--    SECURITY DEFINER, so it doesn't trigger RLS recursion
-- 2. "Users can view own profile" only checks id = auth.uid(), no recursion
-- 3. These two policies work together: users see their own profile,
--    admins see all profiles
-- 4. This migration is idempotent - can be run multiple times safely
-- =====================================================
