-- =====================================================
-- QUICK SETUP: Update existing user to Guru BK
-- =====================================================
-- Use this if you already have a user created
-- Replace 'guru.bk@sman101jkt.sch.id' with your actual email
-- =====================================================

-- Step 1: Check if user exists
SELECT 
  u.id,
  u.email,
  p.full_name,
  p.role as current_role
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE u.email = 'guru.bk@sman101jkt.sch.id';

-- Step 2: Update profile to guru_bk (run this after confirming user exists)
UPDATE public.profiles
SET 
  role = 'guru_bk'::user_role,
  full_name = COALESCE(full_name, 'Guru BK')
WHERE id IN (
  SELECT id FROM auth.users 
  WHERE email = 'guru.bk@sman101jkt.sch.id'
);

-- Step 3: Verify the update (email is in auth.users, need to join)
SELECT 
  p.id,
  p.full_name,
  p.role,
  u.email,
  u.created_at
FROM public.profiles p
JOIN auth.users u ON p.id = u.id
WHERE u.email = 'guru.bk@sman101jkt.sch.id';

-- =====================================================
-- INSTRUCTIONS:
-- 1. Replace 'guru.bk@sman101jkt.sch.id' with your actual email
-- 2. Run Step 1 first to check if user exists
-- 3. If user exists, run Step 2 to update role
-- 4. Run Step 3 to verify the update
-- 5. Logout and login again to test
-- =====================================================

