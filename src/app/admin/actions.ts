'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export interface StudentWithScore {
  student_id: string
  full_name: string
  nis: string | null
  class_name: string | null
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

/**
 * Fetch all students with their total scores
 */
export async function getStudents(): Promise<StudentWithScore[]> {
  const supabase = await createClient()

  // Get current user to verify admin role
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch students with their scores using the view
  const { data: students, error } = await supabase
    .from('student_scores')
    .select('*')
    .order('full_name', { ascending: true })

  if (error) {
    console.error('Error fetching students:', error)
    return []
  }

  // Pastikan selalu mengembalikan struktur StudentWithScore lengkap
  return (
    students?.map((s) => ({
      student_id: s.student_id,
      full_name: s.full_name,
      nis: s.nis,
      class_name: (s as { class_name?: string | null }).class_name ?? null,
      total_score: s.total_score,
      total_records: s.total_records,
    })) || []
  )
}

/**
 * Fetch all point categories
 */
export async function getPointCategories(): Promise<PointCategory[]> {
  const supabase = await createClient()

  const { data: categories, error } = await supabase
    .from('point_categories')
    .select('*')
    .order('name', { ascending: true })

  if (error) {
    console.error('Error fetching categories:', error)
    return []
  }

  return categories || []
}

/**
 * Get dashboard statistics
 */
export async function getDashboardStats(): Promise<DashboardStats> {
  const supabase = await createClient()

  // Get total students
  const { count: totalStudents } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('role', 'student')

  // Get total records
  const { count: totalRecords } = await supabase
    .from('student_records')
    .select('*', { count: 'exact', head: true })

  return {
    totalStudents: totalStudents || 0,
    totalRecords: totalRecords || 0,
  }
}

/**
 * Insert a new student record
 */
export async function addStudentRecord(
  studentId: string,
  categoryId: string,
  notes: string | null
) {
  const supabase = await createClient()

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return {
      error: 'Unauthorized',
    }
  }

  // Insert the record
  const { error } = await supabase.from('student_records').insert({
    student_id: studentId,
    category_id: categoryId,
    notes: notes || null,
    created_by: user.id,
  })

  if (error) {
    console.error('Error adding record:', error)
    return {
      error: error.message || 'Gagal menambahkan catatan',
    }
  }

  // Revalidate the admin page to refresh data
  revalidatePath('/admin')
  return {
    success: true,
  }
}

/**
 * Logout action
 */
export async function logoutAction() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/login')
}

