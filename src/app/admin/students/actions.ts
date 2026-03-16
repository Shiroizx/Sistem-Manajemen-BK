'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'

export interface StudentProfile {
  id: string
  full_name: string
  nis: string | null
  role: string
  created_at: string
  updated_at: string
  class_name: string | null
  birth_place: string | null
  birth_date: string | null
  address: string | null
  student_wa: string | null
  father_name: string | null
  father_wa: string | null
  mother_name: string | null
  mother_wa: string | null
}

export interface ActionResult {
  success: boolean
  error?: string
}

/**
 * Fetch all students (profiles with role = 'student'), ordered by class_name and full_name
 */
export async function getStudents(): Promise<StudentProfile[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('role', 'student')
    .order('class_name', { ascending: true, nullsFirst: false })
    .order('full_name', { ascending: true })

  if (error) {
    console.error('Error fetching students:', error)
    return []
  }

  return (data || []) as StudentProfile[]
}

/**
 * Create a new student (auth user + profile via RPC). Admin only.
 */
export async function createStudent(formData: FormData): Promise<ActionResult> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'User not authenticated' }
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || (profile.role as string) !== 'admin') {
    return { success: false, error: 'Unauthorized: Hanya Admin yang dapat menambah siswa' }
  }

  const nis = (formData.get('nis') as string)?.trim()
  const full_name = (formData.get('full_name') as string)?.trim()
  if (!nis || !full_name) {
    return { success: false, error: 'NIS dan Nama Lengkap wajib diisi' }
  }

  const birthDateRaw = formData.get('birth_date') as string
  const birth_date = birthDateRaw ? birthDateRaw : null

  const { error } = await supabase.rpc('create_student_profile', {
    p_nis: nis,
    p_full_name: full_name,
    p_class_name: (formData.get('class_name') as string)?.trim() || null,
    p_birth_place: (formData.get('birth_place') as string)?.trim() || null,
    p_birth_date: birth_date,
    p_address: (formData.get('address') as string)?.trim() || null,
    p_student_wa: (formData.get('student_wa') as string)?.trim() || null,
    p_father_name: (formData.get('father_name') as string)?.trim() || null,
    p_father_wa: (formData.get('father_wa') as string)?.trim() || null,
    p_mother_name: (formData.get('mother_name') as string)?.trim() || null,
    p_mother_wa: (formData.get('mother_wa') as string)?.trim() || null,
  })

  if (error) {
    console.error('Error creating student:', error)
    if (error.code === '23505') {
      return { success: false, error: 'NIS sudah digunakan oleh siswa lain' }
    }
    return { success: false, error: 'Gagal menambahkan siswa: ' + error.message }
  }

  revalidatePath('/admin/students')
  return { success: true }
}

/**
 * Update an existing student profile. Admin only.
 */
export async function updateStudent(
  id: string,
  formData: FormData
): Promise<ActionResult> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'User not authenticated' }
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || (profile.role as string) !== 'admin') {
    return { success: false, error: 'Unauthorized: Hanya Admin yang dapat mengubah data siswa' }
  }

  const full_name = (formData.get('full_name') as string)?.trim()
  if (!full_name) {
    return { success: false, error: 'Nama Lengkap wajib diisi' }
  }

  const birthDateRaw = formData.get('birth_date') as string
  const birth_date = birthDateRaw ? birthDateRaw : null

  const { error } = await supabase
    .from('profiles')
    .update({
      full_name,
      nis: (formData.get('nis') as string)?.trim() || null,
      class_name: (formData.get('class_name') as string)?.trim() || null,
      birth_place: (formData.get('birth_place') as string)?.trim() || null,
      birth_date,
      address: (formData.get('address') as string)?.trim() || null,
      student_wa: (formData.get('student_wa') as string)?.trim() || null,
      father_name: (formData.get('father_name') as string)?.trim() || null,
      father_wa: (formData.get('father_wa') as string)?.trim() || null,
      mother_name: (formData.get('mother_name') as string)?.trim() || null,
      mother_wa: (formData.get('mother_wa') as string)?.trim() || null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .eq('role', 'student')

  if (error) {
    console.error('Error updating student:', error)
    if (error.code === '23505') {
      return { success: false, error: 'NIS sudah digunakan oleh siswa lain' }
    }
    return { success: false, error: 'Gagal memperbarui data siswa: ' + error.message }
  }

  revalidatePath('/admin/students')
  return { success: true }
}

/**
 * Delete a student (profile + auth user via RPC). Fails if student has records (handled by DB/cascade).
 * Admin only.
 */
export async function deleteStudent(id: string): Promise<ActionResult> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'User not authenticated' }
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || (profile.role as string) !== 'admin') {
    return { success: false, error: 'Unauthorized: Hanya Admin yang dapat menghapus siswa' }
  }

  const { data: deleted, error } = await supabase.rpc('delete_student_profile', {
    p_profile_id: id,
  })

  if (error) {
    console.error('Error deleting student:', error)
    return { success: false, error: 'Gagal menghapus siswa: ' + error.message }
  }

  if (!deleted) {
    return { success: false, error: 'Siswa tidak ditemukan atau gagal dihapus' }
  }

  revalidatePath('/admin/students')
  return { success: true }
}
