'use server'

import { createClient } from '@/utils/supabase/server'

export interface StudentRecord {
  id: string
  category_name: string
  category_type: 'violation' | 'achievement'
  point_value: number
  notes: string | null
  created_at: string
}

export interface StudentData {
  profile: {
    id: string
    full_name: string
    nis: string | null
  }
  totalScore: number
  records: StudentRecord[]
}

/**
 * Get student's data by NIS (public access - no authentication required)
 */
export async function getStudentDataByNIS(nis: string): Promise<StudentData | null> {
  const supabase = await createClient()

  if (!nis || nis.trim() === '') {
    return null
  }

  // Get student profile by NIS
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, full_name, nis')
    .eq('nis', nis.trim())
    .eq('role', 'student')
    .maybeSingle()

  if (profileError) {
    console.error('Error fetching profile:', profileError)
    return null
  }

  if (!profile || !profile.id) {
    return null
  }

  // Get student records
  const { data: records, error: recordsError } = await supabase
    .from('student_records')
    .select('id, notes, created_at, category_id')
    .eq('student_id', profile.id)
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

  if (recordsError) {
    console.error('Error fetching records:', recordsError)
    return null
  }

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
      }
    }) || []

  return {
    profile,
    totalScore,
    records: transformedRecords,
  }
}

/**
 * Get student's data by NIS (for admin viewing)
 */
export async function getStudentDataByNISForAdmin(nis: string): Promise<StudentData | null> {
  return getStudentDataByNIS(nis)
}

