-- =====================================================
-- Update dummy student profiles with complete data
-- =====================================================
-- Jalankan setelah 022_profiles_student_columns.sql
-- Mengisi class_name, birth_place, birth_date, address,
-- student_wa, father_name, father_wa, mother_name, mother_wa
-- untuk semua profil dengan role = 'student'
-- =====================================================

DO $$
DECLARE
  r RECORD;
  idx INTEGER := 0;
  kelas TEXT;
  kota TEXT;
  tgl DATE;
  alamat TEXT;
  wa_siswa TEXT;
  ayah TEXT;
  wa_ayah TEXT;
  ibu TEXT;
  wa_ibu TEXT;
  kelas_opt TEXT[] := ARRAY['X IPA 1', 'X IPA 2', 'X IPS 1', 'X IPS 2', 'XI IPA 1', 'XI IPA 2', 'XI IPS 1', 'XII IPA 1', 'XII IPA 2', 'XII IPS 1'];
  kota_opt TEXT[] := ARRAY['Jakarta', 'Bandung', 'Surabaya', 'Yogyakarta', 'Semarang', 'Medan', 'Makassar', 'Bogor', 'Depok', 'Tangerang'];
  ayah_nama TEXT[] := ARRAY['Budi Santoso', 'Agus Wijaya', 'Eko Prasetyo', 'Hadi Nugroho', 'Joko Rahman', 'Rudi Kusuma', 'Tono Purnomo', 'Ahmad Setiawan', 'Dedi Kurniawan', 'Bambang Hidayat'];
  ibu_nama TEXT[] := ARRAY['Siti Rahayu', 'Dewi Lestari', 'Fitri Wulandari', 'Indah Sari', 'Kartika Dewi', 'Nina Saputri', 'Putri Anggraini', 'Sari Handayani', 'Umi Farida', 'Yuni Marlina'];
BEGIN
  FOR r IN
    SELECT id, nis, full_name
    FROM public.profiles
    WHERE role = 'student'
    ORDER BY nis NULLS LAST, full_name
  LOOP
    idx := idx + 1;
    kelas := kelas_opt[1 + (idx - 1) % array_length(kelas_opt, 1)];
    kota := kota_opt[1 + (idx - 1) % array_length(kota_opt, 1)];
    tgl := DATE '2008-01-01' + floor(random() * 365 * 3)::INTEGER;
    alamat := 'Jl. Pendidikan No. ' || (10 + idx) || ', ' || kota;
    wa_siswa := '0812345' || LPAD((10000 + idx)::TEXT, 5, '0');
    ayah := ayah_nama[1 + (idx - 1) % array_length(ayah_nama, 1)];
    wa_ayah := '0812346' || LPAD((10000 + idx)::TEXT, 5, '0');
    ibu := ibu_nama[1 + (idx - 1) % array_length(ibu_nama, 1)];
    wa_ibu := '0812347' || LPAD((10000 + idx)::TEXT, 5, '0');

    UPDATE public.profiles
    SET
      class_name = kelas,
      birth_place = kota,
      birth_date = tgl,
      address = alamat,
      student_wa = wa_siswa,
      father_name = ayah,
      father_wa = wa_ayah,
      mother_name = ibu,
      mother_wa = wa_ibu,
      updated_at = NOW()
    WHERE id = r.id;
  END LOOP;

  RAISE NOTICE 'Updated % student profiles with full dummy data', idx;
END $$;
