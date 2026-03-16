-- =====================================================
-- Add 'guru_bk' role to user_role enum
-- =====================================================
-- This allows separating Guru BK from Admin
-- =====================================================

-- Add 'guru_bk' to the enum
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'guru_bk';

-- =====================================================
-- Note: 
-- Now we have 3 roles:
-- - 'admin': System administrator (full access)
-- - 'guru_bk': Guidance counselor (BK teacher)
-- - 'student': Student
-- =====================================================

