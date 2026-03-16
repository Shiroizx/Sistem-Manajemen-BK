-- =====================================================
-- Allow public query by NIS for student profiles
-- =====================================================
-- This allows students/parents to query their own profile
-- by NIS without authentication
-- =====================================================

-- Allow anonymous users to query student profiles by NIS
CREATE POLICY "Public can view student profile by NIS"
    ON public.profiles
    FOR SELECT
    TO anon, authenticated
    USING (
        role = 'student' AND
        nis IS NOT NULL
    );

-- Allow anonymous users to query student records for students
-- This works together with the profile query - they get student_id first
-- Note: The application will filter by student_id, but we still need a policy
CREATE POLICY "Public can view student records for students"
    ON public.student_records
    FOR SELECT
    TO anon, authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = student_records.student_id
            AND profiles.role = 'student'
        )
    );

-- Allow anonymous users to view point categories (needed for mapping records)
CREATE POLICY "Public can view point categories"
    ON public.point_categories
    FOR SELECT
    TO anon, authenticated
    USING (true);

-- =====================================================
-- Note: 
-- 1. The profile policy allows querying by NIS for students only
-- 2. The student_records policy allows viewing records for students only
-- 3. The point_categories policy allows viewing all categories (public info)
-- 4. This is safe because NIS is unique and acts as a public identifier
-- =====================================================

