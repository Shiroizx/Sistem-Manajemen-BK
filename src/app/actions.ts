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

export interface StudentSearchResult {
  profile: {
    id: string
    full_name: string
    nis: string | null
  }
  totalScore: number
  records: StudentRecord[]
}

type SearchMode = 'nis' | 'name'

async function searchStudentInternal(
  query: string,
  mode: SearchMode
): Promise<StudentSearchResult | null> {
  const supabase = await createClient()

  if (!query || query.trim() === '') {
    return null
  }

  let profile
  let profileError

  if (mode === 'nis') {
    // Cari berdasarkan NIS (kebijakan RLS publik sudah ada)
    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, nis')
      .eq('nis', query.trim())
      .eq('role', 'student')
      .maybeSingle()
    profile = data
    profileError = error
  } else {
    // Cari berdasarkan nama lengkap (ambil satu siswa yang paling cocok)
    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, nis')
      .ilike('full_name', `%${query.trim()}%`)
      .eq('role', 'student')
      .order('full_name', { ascending: true })
      .limit(1)
      .maybeSingle()
    profile = data
    profileError = error
  }

  if (profileError) {
    console.error('Error fetching profile:', profileError)
    return null
  }

  if (!profile || !profile.id) {
    return null
  }

  // Get student records (public access via RLS)
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
 * Search student by NIS (public access - backward compatible helper)
 */
export async function searchStudentByNIS(nis: string): Promise<StudentSearchResult | null> {
  return searchStudentInternal(nis, 'nis')
}

/**
 * Search student by either NIS or full name, based on mode
 */
export async function searchStudent(
  query: string,
  mode: SearchMode
): Promise<StudentSearchResult | null> {
  return searchStudentInternal(query, mode)
}

