'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'

export interface PointCategory {
  id: string
  name: string
  description: string | null
  point_value: number
  type: 'violation' | 'achievement'
  created_at: string
  updated_at: string
}

export interface CategoryFormData {
  name: string
  description: string | null
  point_value: number
  type: 'violation' | 'achievement'
}

export interface ActionResult {
  success: boolean
  error?: string
}

/**
 * Fetch all categories ordered by type and name
 */
export async function getCategories(): Promise<PointCategory[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('point_categories')
    .select('*')
    .order('type', { ascending: true })
    .order('name', { ascending: true })

  if (error) {
    console.error('Error fetching categories:', error)
    return []
  }

  return data || []
}

/**
 * Create a new category
 */
export async function createCategory(
  formData: CategoryFormData
): Promise<ActionResult> {
  const supabase = await createClient()

  // Verify user is authenticated and is admin or guru_bk
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'User not authenticated' }
  }

  // Verify user role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const userRole = profile?.role as 'admin' | 'student' | 'guru_bk' | undefined
  if (!profile || (userRole !== 'admin' && userRole !== 'guru_bk')) {
    return { success: false, error: 'Unauthorized: Only Admin and Guru BK can manage categories' }
  }

  // Validate and format point_value based on type
  let pointValue = formData.point_value
  if (formData.type === 'violation' && pointValue > 0) {
    pointValue = -Math.abs(pointValue)
  } else if (formData.type === 'achievement' && pointValue < 0) {
    pointValue = Math.abs(pointValue)
  }

  const { error } = await supabase.from('point_categories').insert({
    name: formData.name.trim(),
    description: formData.description?.trim() || null,
    point_value: pointValue,
    type: formData.type,
  })

  if (error) {
    console.error('Error creating category:', error)
    return { success: false, error: 'Gagal menambahkan kategori: ' + error.message }
  }

  revalidatePath('/admin/categories')
  revalidatePath('/guru-bk/categories') // Also revalidate guru-bk path
  return { success: true }
}

/**
 * Update an existing category
 */
export async function updateCategory(
  id: string,
  formData: CategoryFormData
): Promise<ActionResult> {
  const supabase = await createClient()

  // Verify user is authenticated and is admin or guru_bk
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'User not authenticated' }
  }

  // Verify user role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const userRole = profile?.role as 'admin' | 'student' | 'guru_bk' | undefined
  if (!profile || (userRole !== 'admin' && userRole !== 'guru_bk')) {
    return { success: false, error: 'Unauthorized: Only Admin and Guru BK can manage categories' }
  }

  // Validate and format point_value based on type
  let pointValue = formData.point_value
  if (formData.type === 'violation' && pointValue > 0) {
    pointValue = -Math.abs(pointValue)
  } else if (formData.type === 'achievement' && pointValue < 0) {
    pointValue = Math.abs(pointValue)
  }

  const { error } = await supabase
    .from('point_categories')
    .update({
      name: formData.name.trim(),
      description: formData.description?.trim() || null,
      point_value: pointValue,
      type: formData.type,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)

  if (error) {
    console.error('Error updating category:', error)
    return { success: false, error: 'Gagal memperbarui kategori: ' + error.message }
  }

  revalidatePath('/admin/categories')
  revalidatePath('/guru-bk/categories') // Also revalidate guru-bk path
  return { success: true }
}

/**
 * Delete a category
 */
export async function deleteCategory(id: string): Promise<ActionResult> {
  const supabase = await createClient()

  // Verify user is authenticated and is admin or guru_bk
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'User not authenticated' }
  }

  // Verify user role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const userRole = profile?.role as 'admin' | 'student' | 'guru_bk' | undefined
  if (!profile || (userRole !== 'admin' && userRole !== 'guru_bk')) {
    return { success: false, error: 'Unauthorized: Only Admin and Guru BK can manage categories' }
  }

  // Check if category is being used in student_records
  const { data: records, error: checkError } = await supabase
    .from('student_records')
    .select('id')
    .eq('category_id', id)
    .limit(1)

  if (checkError) {
    console.error('Error checking category usage:', checkError)
    return { success: false, error: 'Gagal memeriksa penggunaan kategori' }
  }

  if (records && records.length > 0) {
    return {
      success: false,
      error: 'Kategori tidak dapat dihapus karena masih digunakan dalam catatan siswa. Hapus atau ubah catatan yang menggunakan kategori ini terlebih dahulu.',
    }
  }

  const { error } = await supabase.from('point_categories').delete().eq('id', id)

  if (error) {
    console.error('Error deleting category:', error)
    // Check for foreign key constraint error
    if (error.code === '23503') {
      return {
        success: false,
        error: 'Kategori tidak dapat dihapus karena masih digunakan dalam catatan siswa.',
      }
    }
    return { success: false, error: 'Gagal menghapus kategori: ' + error.message }
  }

  revalidatePath('/admin/categories')
  revalidatePath('/guru-bk/categories') // Also revalidate guru-bk path
  return { success: true }
}

