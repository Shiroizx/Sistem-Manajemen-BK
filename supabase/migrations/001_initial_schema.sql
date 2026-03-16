-- =====================================================
-- STEP 1: Database Schema & RLS for BK Management System
-- =====================================================
-- This script creates the complete database schema with
-- Row Level Security (RLS) policies for role-based access.
-- =====================================================

-- =====================================================
-- 1. CREATE ENUMS
-- =====================================================

-- User role enum
CREATE TYPE user_role AS ENUM ('admin', 'student');

-- Point category type enum
CREATE TYPE point_type AS ENUM ('violation', 'achievement');

-- =====================================================
-- 2. CREATE TABLES
-- =====================================================

-- Profiles table: Extends auth.users with additional fields
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    nis TEXT UNIQUE, -- Nomor Induk Siswa (Student ID Number)
    role user_role NOT NULL DEFAULT 'student',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Point categories table: Defines violation and achievement types
CREATE TABLE public.point_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    point_value INTEGER NOT NULL, -- Can be positive (achievement) or negative (violation)
    type point_type NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Student records table: Tracks individual behavior records
CREATE TABLE public.student_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES public.point_categories(id) ON DELETE RESTRICT,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL -- Tracks who created the record (typically admin)
);

-- =====================================================
-- 3. CREATE INDEXES FOR PERFORMANCE
-- =====================================================

CREATE INDEX idx_profiles_role ON public.profiles(role);
CREATE INDEX idx_profiles_nis ON public.profiles(nis);
CREATE INDEX idx_student_records_student_id ON public.student_records(student_id);
CREATE INDEX idx_student_records_category_id ON public.student_records(category_id);
CREATE INDEX idx_student_records_created_at ON public.student_records(created_at DESC);

-- =====================================================
-- 4. CREATE VIEW FOR TOTAL SCORE CALCULATION
-- =====================================================

-- View that calculates total score for each student dynamically
CREATE OR REPLACE VIEW public.student_scores AS
SELECT 
    p.id AS student_id,
    p.full_name,
    p.nis,
    COALESCE(SUM(pc.point_value), 0) AS total_score,
    COUNT(sr.id) AS total_records
FROM public.profiles p
LEFT JOIN public.student_records sr ON sr.student_id = p.id
LEFT JOIN public.point_categories pc ON pc.id = sr.category_id
WHERE p.role = 'student'
GROUP BY p.id, p.full_name, p.nis;

-- =====================================================
-- 5. ENABLE ROW LEVEL SECURITY (RLS)
-- =====================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.point_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_records ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 6. RLS POLICIES FOR PROFILES TABLE
-- =====================================================

-- Admin: Full CRUD access to all profiles
CREATE POLICY "Admin can view all profiles"
    ON public.profiles
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Admin can insert profiles"
    ON public.profiles
    FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Admin can update all profiles"
    ON public.profiles
    FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Admin can delete profiles"
    ON public.profiles
    FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Student: Can only view their own profile
CREATE POLICY "Student can view own profile"
    ON public.profiles
    FOR SELECT
    TO authenticated
    USING (
        id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- =====================================================
-- 7. RLS POLICIES FOR POINT_CATEGORIES TABLE
-- =====================================================

-- Admin: Full CRUD access
CREATE POLICY "Admin can manage all point categories"
    ON public.point_categories
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Student: Read-only access to all categories (needed to view record details)
CREATE POLICY "Student can view all point categories"
    ON public.point_categories
    FOR SELECT
    TO authenticated
    USING (true);

-- =====================================================
-- 8. RLS POLICIES FOR STUDENT_RECORDS TABLE
-- =====================================================

-- Admin: Full CRUD access to all records
CREATE POLICY "Admin can manage all student records"
    ON public.student_records
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Student: Can only view their own records
CREATE POLICY "Student can view own records"
    ON public.student_records
    FOR SELECT
    TO authenticated
    USING (
        student_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- =====================================================
-- 9. NOTE ON STUDENT_SCORES VIEW RLS
-- =====================================================

-- Note: Views automatically inherit RLS from underlying tables.
-- The student_scores view will respect RLS policies on:
-- - profiles table (students can only see their own profile)
-- - student_records table (students can only see their own records)
-- No explicit RLS policies are needed on the view itself.

-- =====================================================
-- 10. HELPER FUNCTION: Get current user role
-- =====================================================

-- Utility function to check if current user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    );
$$;

-- =====================================================
-- 11. TRIGGER: Auto-update updated_at timestamp
-- =====================================================

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

CREATE TRIGGER set_updated_at_profiles
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_point_categories
    BEFORE UPDATE ON public.point_categories
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- =====================================================
-- END OF SCHEMA
-- =====================================================

