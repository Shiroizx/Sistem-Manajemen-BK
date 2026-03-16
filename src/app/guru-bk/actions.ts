'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export interface StudentWithScore {
  id: string // This will be mapped from student_id
  full_name: string
  nis: string | null
  total_score: number
  total_records: number
}

export interface PointCategory {
  id: string
  name: string
  description: string | null
  point_value: number
  type: 'violation' | 'achievement'
}

export interface DashboardStats {
  totalStudents: number
  totalRecords: number
}

export interface AuthActionResult {
  error?: string
  success?: boolean
}

/**
 * Fetch all students with their total scores
 */
export async function getStudents(): Promise<StudentWithScore[]> {
  const supabase = await createClient()
  
  // Fetch students directly from profiles with role = 'student' to ensure we only get students
  // Then calculate scores manually
  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('id, full_name, nis, role')
    .eq('role', 'student')
    .order('full_name', { ascending: true })

  if (profilesError) {
    console.error('Error fetching student profiles:', profilesError)
    return []
  }

  if (!profiles || profiles.length === 0) {
    return []
  }

  // Debug: Log to ensure we only get students
  console.log('Fetched students:', profiles.map(p => ({ name: p.full_name, role: p.role })))

  // Get all student records
  const { data: records, error: recordsError } = await supabase
    .from('student_records')
    .select('student_id, category_id')

  if (recordsError) {
    console.error('Error fetching student records:', recordsError)
  }

  // Get all categories
  const { data: categories, error: categoriesError } = await supabase
    .from('point_categories')
    .select('id, point_value')

  if (categoriesError) {
    console.error('Error fetching categories:', categoriesError)
  }

  // Create category map
  const categoryMap = new Map(
    categories?.map((cat) => [cat.id, cat.point_value]) || []
  )

  // Calculate scores for each student
  // Double-check: filter out any non-student roles (safety check)
  const studentsWithScores: StudentWithScore[] = profiles
    .filter((profile) => profile.role === 'student') // Extra safety filter
    .map((profile) => {
      const studentRecords = records?.filter((r) => r.student_id === profile.id) || []
      const totalScore = studentRecords.reduce((sum, record) => {
        const pointValue = categoryMap.get(record.category_id) || 0
        return sum + pointValue
      }, 0)

      return {
        id: profile.id,
        full_name: profile.full_name,
        nis: profile.nis,
        total_score: totalScore,
        total_records: studentRecords.length,
      }
    })

  return studentsWithScores
}

/**
 * Fetch all point categories
 */
export async function getPointCategories(): Promise<PointCategory[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('point_categories')
    .select('*')
    .order('name', { ascending: true })

  if (error) {
    console.error('Error fetching point categories:', error)
    return []
  }

  return data || []
}

/**
 * Fetch dashboard statistics
 */
export async function getDashboardStats(): Promise<DashboardStats> {
  const supabase = await createClient()

  const { count: totalStudents, error: studentError } = await supabase
    .from('profiles')
    .select('id', { count: 'exact' })
    .eq('role', 'student')

  const { count: totalRecords, error: recordError } = await supabase
    .from('student_records')
    .select('id', { count: 'exact' })

  if (studentError || recordError) {
    console.error('Error fetching dashboard stats:', studentError || recordError)
    return { totalStudents: 0, totalRecords: 0 }
  }

  return {
    totalStudents: totalStudents || 0,
    totalRecords: totalRecords || 0,
  }
}

/**
 * Add a new student record
 */
export async function addStudentRecord(
  studentId: string,
  categoryId: string,
  notes: string | null
): Promise<AuthActionResult> {
  const supabase = await createClient()

  // Verify user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'User not authenticated' }
  }

  // Verify user is guru_bk or admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const userRole = profile?.role as 'admin' | 'student' | 'guru_bk' | undefined
  if (!profile || (userRole !== 'guru_bk' && userRole !== 'admin')) {
    return { error: 'Unauthorized: Only Guru BK and Admin can add records' }
  }

  const { error } = await supabase.from('student_records').insert({
    student_id: studentId,
    category_id: categoryId,
    notes: notes,
    created_by: user.id,
  })

  if (error) {
    console.error('Error inserting student record:', error)
    return { error: 'Gagal menambahkan catatan: ' + error.message }
  }

  revalidatePath('/guru-bk')
  return { success: true }
}

/**
 * Logout action for Guru BK
 */
export async function logoutAction() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/login')
}

