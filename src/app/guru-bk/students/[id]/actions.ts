'use server'

import { createClient } from '@/utils/supabase/server'

export interface StudentRecord {
  id: string
  category_name: string
  category_type: 'violation' | 'achievement'
  point_value: number
  notes: string | null
  created_at: string
  created_by: string | null
}

export interface StudentDetail {
  profile: {
    id: string
    full_name: string
    nis: string | null
  }
  totalScore: number
  records: StudentRecord[]
}

/**
 * Get student detail with all records (for Guru BK)
 */
export async function getStudentDetail(studentId: string): Promise<StudentDetail | null> {
  const supabase = await createClient()

  // Verify user is authenticated and is admin or guru_bk
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  // Verify user role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const userRole = profile?.role as 'admin' | 'student' | 'guru_bk' | undefined
  if (!profile || (userRole !== 'admin' && userRole !== 'guru_bk')) {
    return null
  }

  // Get student profile
  const { data: studentProfile, error: profileError } = await supabase
    .from('profiles')
    .select('id, full_name, nis')
    .eq('id', studentId)
    .eq('role', 'student')
    .maybeSingle()

  if (profileError || !studentProfile) {
    console.error('Error fetching student profile:', profileError)
    return null
  }

  // Get student records
  const { data: records, error: recordsError } = await supabase
    .from('student_records')
    .select('id, notes, created_at, category_id, created_by')
    .eq('student_id', studentId)
    .order('created_at', { ascending: false })

  if (recordsError) {
    console.error('Error fetching records:', recordsError)
    return null
  }

  // Get all categories to map them
  const { data: categories } = await supabase
    .from('point_categories')
    .select('id, name, type, point_value')

  const categoryMap = new Map(
    categories?.map((cat) => [cat.id, cat]) || []
  )

  // Calculate total score and transform records
  let totalScore = 0
  const transformedRecords: StudentRecord[] =
    records?.map((record) => {
      const category = categoryMap.get(record.category_id)
      const pointValue = category?.point_value || 0
      totalScore += pointValue

      return {
        id: record.id,
        category_name: category?.name || 'Unknown',
        category_type: category?.type || 'violation',
        point_value: pointValue,
        notes: record.notes,
        created_at: record.created_at,
        created_by: record.created_by,
      }
    }) || []

  return {
    profile: studentProfile,
    totalScore,
    records: transformedRecords,
  }
}

