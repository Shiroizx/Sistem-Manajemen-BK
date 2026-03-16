-- =====================================================
-- Add class_name to student_scores view for dashboard
-- =====================================================

DROP VIEW IF EXISTS public.student_scores;

CREATE VIEW public.student_scores AS
SELECT
    p.id AS student_id,
    p.full_name,
    p.nis,
    COALESCE(SUM(pc.point_value), 0) AS total_score,
    COUNT(sr.id) AS total_records,
    p.class_name
FROM public.profiles p
LEFT JOIN public.student_records sr ON sr.student_id = p.id
LEFT JOIN public.point_categories pc ON pc.id = sr.category_id
WHERE p.role = 'student'
GROUP BY p.id, p.full_name, p.nis, p.class_name;