-- =====================================================
-- Helper script to update user profiles to guru_bk role
-- =====================================================
-- Run this script to update specific users to guru_bk role
-- Replace '<user_email>' with the actual email of the Guru BK user
-- =====================================================

-- Option 1: Update by email (recommended)
-- Replace 'nama@guru.sman101jkt.sch.id' with the actual Guru BK email
UPDATE public.profiles
SET role = 'guru_bk'::user_role
WHERE id IN (
  SELECT id FROM auth.users 
  WHERE email = 'nama@guru.sman101jkt.sch.id'
);

-- Option 2: Update by user ID (if you know the UUID)
-- Replace '<user_id>' with the actual user UUID
-- UPDATE public.profiles
-- SET role = 'guru_bk'::user_role
-- WHERE id = '<user_id>'::uuid;

-- Option 3: View all profiles to find the user
-- SELECT p.id, p.full_name, p.role, u.email
-- FROM public.profiles p
-- JOIN auth.users u ON p.id = u.id
-- ORDER BY p.created_at DESC;

-- =====================================================
-- Note: 
-- After running this migration, the user will need to:
-- 1. Logout (if currently logged in)
-- 2. Login again
-- 3. They will be redirected to /guru-bk dashboard
-- =====================================================

