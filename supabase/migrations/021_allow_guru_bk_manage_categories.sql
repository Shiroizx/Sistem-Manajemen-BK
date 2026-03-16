-- =====================================================
-- Allow Guru BK to manage point categories (CRUD)
-- =====================================================

-- Drop the old admin-only policy
DROP POLICY IF EXISTS "Admin can manage all point categories" ON public.point_categories;

-- Create new policy that allows both Admin and Guru BK to manage categories
CREATE POLICY "Admin and Guru BK can manage all point categories"
    ON public.point_categories
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role IN ('admin', 'guru_bk')
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role IN ('admin', 'guru_bk')
        )
    );

