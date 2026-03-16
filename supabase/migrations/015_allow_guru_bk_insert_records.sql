-- =====================================================
-- Allow Guru BK to insert student records
-- =====================================================
-- This migration adds RLS policies to allow users with
-- role 'guru_bk' to insert records into student_records
-- =====================================================

-- Create helper function to check if user is Guru BK
CREATE OR REPLACE FUNCTION public.is_guru_bk()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid()
    AND role = 'guru_bk'
  );
END;
$$;

-- Create helper function to check if user is Admin or Guru BK
CREATE OR REPLACE FUNCTION public.is_admin_or_guru_bk()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid()
    AND role IN ('admin', 'guru_bk')
  );
END;
$$;

-- Allow Guru BK to insert student records
CREATE POLICY "Guru BK can insert student records"
    ON public.student_records
    FOR INSERT
    TO authenticated
    WITH CHECK (
        public.is_guru_bk() OR public.is_admin()
    );

-- Allow Guru BK to view all student records (for dashboard)
CREATE POLICY "Guru BK can view all student records"
    ON public.student_records
    FOR SELECT
    TO authenticated
    USING (
        public.is_guru_bk() OR public.is_admin()
    );

-- Update existing Admin policy to use helper function for consistency
-- Drop old policy first
DROP POLICY IF EXISTS "Admin can manage all student records" ON public.student_records;

-- Recreate with better naming that includes Guru BK
CREATE POLICY "Admin and Guru BK can manage all student records"
    ON public.student_records
    FOR ALL
    TO authenticated
    USING (
        public.is_admin_or_guru_bk()
    )
    WITH CHECK (
        public.is_admin_or_guru_bk()
    );

-- =====================================================
-- Note:
-- - Guru BK can now insert and view student records
-- - Admin retains full CRUD access
-- - Students can still view their own records (existing policy)
-- =====================================================

