-- =====================================================
-- Fix: Ensure only students appear in student list
-- =====================================================
-- This script helps identify and fix users with wrong roles
-- =====================================================

-- Check all profiles and their roles
-- Note: email is in auth.users, not in profiles table
SELECT 
  p.id,
  p.full_name,
  p.role,
  u.email,
  p.nis
FROM public.profiles p
JOIN auth.users u ON p.id = u.id
ORDER BY p.full_name;

-- If you see a user with name "gurubk" or similar with role 'student',
-- update it to 'guru_bk':
-- UPDATE public.profiles
-- SET role = 'guru_bk'::user_role
-- WHERE full_name ILIKE '%gurubk%' OR full_name ILIKE '%guru bk%'
-- AND role = 'student';

-- Check profiles with email (join with auth.users)
SELECT 
  p.id,
  p.full_name,
  p.role,
  u.email,
  p.nis
FROM public.profiles p
JOIN auth.users u ON p.id = u.id
WHERE p.full_name ILIKE '%gurubk%' OR p.full_name ILIKE '%guru bk%'
ORDER BY p.full_name;

-- Verify the student_scores view only shows students
SELECT 
  student_id,
  full_name,
  nis,
  total_score,
  total_records
FROM public.student_scores
ORDER BY full_name;

-- =====================================================
-- Note: 
-- The view student_scores already filters by role = 'student'
-- If "gurubk" appears, it means that user has role = 'student' in database
-- Update that user's role to 'guru_bk' using the UPDATE query above
-- =====================================================

