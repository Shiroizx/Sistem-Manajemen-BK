-- =====================================================
-- Insert dummy data: 20 students with sample records
-- =====================================================
-- IMPORTANT: This script requires auth users to exist first
-- For easiest setup, create auth users via Supabase Dashboard first:
-- 1. Go to Authentication > Users > Add User
-- 2. Create users with emails: student_00001@sman101jkt.sch.id, student_00002@sman101jkt.sch.id, etc.
-- 3. Then run this script
-- =====================================================

-- First, ensure we have some point categories
INSERT INTO public.point_categories (name, description, point_value, type)
SELECT * FROM (VALUES
  -- Violations (negative points)
  ('Terlambat Masuk Sekolah', 'Siswa datang terlambat', -5, 'violation'),
  ('Tidak Menggunakan Seragam Lengkap', 'Seragam tidak sesuai aturan', -10, 'violation'),
  ('Tidak Mengerjakan Tugas', 'Tidak mengumpulkan tugas tepat waktu', -15, 'violation'),
  ('Berkelahi', 'Terlibat perkelahian', -50, 'violation'),
  ('Membawa HP ke Sekolah', 'Melanggar aturan membawa HP', -20, 'violation'),
  ('Tidak Mengikuti Upacara', 'Tidak hadir dalam upacara bendera', -10, 'violation'),
  -- Achievements (positive points)
  ('Juara Kelas', 'Mendapat peringkat 1 di kelas', 50, 'achievement'),
  ('Juara Lomba', 'Memenangkan lomba tingkat sekolah', 30, 'achievement'),
  ('Menjadi Ketua OSIS', 'Terpilih sebagai ketua OSIS', 40, 'achievement'),
  ('Membantu Teman', 'Membantu teman yang kesulitan', 10, 'achievement'),
  ('Kehadiran Sempurna', 'Tidak pernah absen selama semester', 25, 'achievement'),
  ('Prestasi Akademik', 'Mendapat nilai sempurna dalam ujian', 20, 'achievement')
) AS v(name, description, point_value, type)
WHERE NOT EXISTS (
  SELECT 1 FROM public.point_categories WHERE point_categories.name = v.name
);

-- Create 20 dummy students
-- This will work if auth users already exist, or if you have permissions to create them
DO $$
DECLARE
  student_ids UUID[] := ARRAY[]::UUID[];
  student_id UUID;
  category_violation_ids UUID[];
  category_achievement_ids UUID[];
  i INTEGER;
  j INTEGER;
  random_category_id UUID;
  record_count INTEGER;
  first_names TEXT[] := ARRAY['Ahmad', 'Budi', 'Citra', 'Dewi', 'Eko', 'Fitri', 'Gita', 'Hadi', 'Indah', 'Joko', 'Kartika', 'Lina', 'Mario', 'Nina', 'Omar', 'Putri', 'Rudi', 'Sari', 'Tono', 'Umi'];
  last_names TEXT[] := ARRAY['Santoso', 'Wijaya', 'Sari', 'Kurniawan', 'Prasetyo', 'Hidayat', 'Sari', 'Nugroho', 'Putri', 'Rahman', 'Lestari', 'Saputra', 'Wulandari', 'Setiawan', 'Dewi', 'Kusuma', 'Hadi', 'Sari', 'Purnomo', 'Sari'];
  nis_text TEXT;
  existing_user_id UUID;
BEGIN
  -- Get category IDs
  SELECT ARRAY_AGG(id) INTO category_violation_ids
  FROM public.point_categories
  WHERE type = 'violation';
  
  SELECT ARRAY_AGG(id) INTO category_achievement_ids
  FROM public.point_categories
  WHERE type = 'achievement';

  -- Create 20 students
  FOR i IN 1..20 LOOP
    nis_text := LPAD(i::TEXT, 5, '0'); -- NIS: 00001, 00002, ..., 00020
    
    -- Try to find existing auth user by email pattern
    SELECT id INTO existing_user_id
    FROM auth.users
    WHERE email = 'student_' || nis_text || '@sman101jkt.sch.id'
    LIMIT 1;
    
    -- If user exists, use it; otherwise generate new UUID (will fail on profile insert if no auth user)
    IF existing_user_id IS NOT NULL THEN
      student_id := existing_user_id;
    ELSE
      student_id := gen_random_uuid();
    END IF;
    
    student_ids := array_append(student_ids, student_id);
    
    -- Insert profile
    BEGIN
      INSERT INTO public.profiles (id, full_name, nis, role)
      VALUES (
        student_id,
        first_names[i] || ' ' || last_names[i],
        nis_text,
        'student'
      )
      ON CONFLICT (id) DO UPDATE SET
        full_name = EXCLUDED.full_name,
        nis = EXCLUDED.nis;
    EXCEPTION WHEN foreign_key_violation THEN
      RAISE NOTICE 'Student % (NIS: %) - Auth user does not exist. Please create auth user first or use Supabase Dashboard to create users.', i, nis_text;
      -- Remove from array if failed
      student_ids := array_remove(student_ids, student_id);
      CONTINUE;
    END;
  END LOOP;

  -- Create some random records for each successfully created student
  FOR i IN 1..array_length(student_ids, 1) LOOP
    student_id := student_ids[i];
    
    IF student_id IS NULL THEN
      CONTINUE;
    END IF;
    
    -- Each student gets 2-5 random records
    record_count := 2 + floor(random() * 4)::INTEGER;
    
    FOR j IN 1..record_count LOOP
      -- Randomly choose violation or achievement (60% violation, 40% achievement)
      IF random() < 0.6 AND array_length(category_violation_ids, 1) > 0 THEN
        random_category_id := category_violation_ids[1 + floor(random() * array_length(category_violation_ids, 1))::INTEGER];
      ELSIF array_length(category_achievement_ids, 1) > 0 THEN
        random_category_id := category_achievement_ids[1 + floor(random() * array_length(category_achievement_ids, 1))::INTEGER];
      ELSE
        CONTINUE;
      END IF;

      -- Insert record with random date in the past 6 months
      INSERT INTO public.student_records (student_id, category_id, notes, created_at, created_by)
      VALUES (
        student_id,
        random_category_id,
        CASE 
          WHEN random() < 0.6 THEN 'Catatan otomatis untuk data dummy - ' || TO_CHAR(NOW() - (random() * INTERVAL '180 days'), 'DD/MM/YYYY')
          ELSE NULL
        END,
        NOW() - (random() * INTERVAL '180 days'),
        student_id
      )
      ON CONFLICT DO NOTHING;
    END LOOP;
  END LOOP;
  
  RAISE NOTICE 'Successfully created % students with records', array_length(student_ids, 1);
END $$;

-- =====================================================
-- Quick verification (uncomment to run)
-- =====================================================

-- View all students with their scores
-- SELECT 
--   p.full_name,
--   p.nis,
--   COUNT(sr.id) as total_records,
--   COALESCE(SUM(pc.point_value), 0) as total_score
-- FROM public.profiles p
-- LEFT JOIN public.student_records sr ON sr.student_id = p.id
-- LEFT JOIN public.point_categories pc ON pc.id = sr.category_id
-- WHERE p.role = 'student'
-- GROUP BY p.id, p.full_name, p.nis
-- ORDER BY p.nis;

-- =====================================================
-- Note:
-- - NIS format: 00001, 00002, ..., 00020
-- - Each student has 2-5 random records
-- - Records distributed over past 6 months
-- - 60% violations, 40% achievements
-- =====================================================
