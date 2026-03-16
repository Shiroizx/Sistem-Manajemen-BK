-- =====================================================
-- Create sample Admin user
-- =====================================================
-- This creates a default admin user for testing
-- Email: admin@sman101jkt.sch.id
-- Password: admin123
-- =====================================================

-- Create admin user using helper function
SELECT public.setup_admin_profile(
  'admin@sman101jkt.sch.id',
  'admin123',
  'Administrator'
);

-- =====================================================
-- Verification query (uncomment to run):
-- =====================================================
-- SELECT 
--   p.id,
--   p.full_name,
--   p.role,
--   u.email
-- FROM public.profiles p
-- JOIN auth.users u ON p.id = u.id
-- WHERE p.role = 'admin';
-- =====================================================
-- Note:
-- - Email: admin@sman101jkt.sch.id
-- - Password: admin123
-- - Change password after first login for security
-- =====================================================

