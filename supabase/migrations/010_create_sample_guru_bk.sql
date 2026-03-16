-- =====================================================
-- Create sample Guru BK user (for testing)
-- =====================================================
-- WARNING: This creates a user directly in auth.users
-- For production, use Supabase Dashboard instead
-- =====================================================

-- This is a helper script - in production, create users via Supabase Dashboard
-- Then run: SELECT public.setup_guru_bk_profile('guru.bk@sman101jkt.sch.id', 'Guru BK');

-- Alternative: If you want to create a test user directly (NOT RECOMMENDED FOR PRODUCTION)
-- You would need to use Supabase Auth API or Dashboard

-- =====================================================
-- RECOMMENDED APPROACH:
-- =====================================================
-- 
-- 1. Go to Supabase Dashboard > Authentication > Users
-- 2. Click "Add User" 
-- 3. Fill in:
--    - Email: guru.bk@sman101jkt.sch.id
--    - Password: (set a secure password)
--    - Auto Confirm User: Yes
-- 4. After user is created, run this SQL:
--
--    SELECT public.setup_guru_bk_profile('guru.bk@sman101jkt.sch.id', 'Nama Guru BK');
--
-- OR manually:
--
--    UPDATE public.profiles
--    SET role = 'guru_bk'::user_role,
--        full_name = 'Nama Guru BK'
--    WHERE id IN (
--      SELECT id FROM auth.users 
--      WHERE email = 'guru.bk@sman101jkt.sch.id'
--    );
--
-- =====================================================

