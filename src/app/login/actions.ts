'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export interface AuthActionResult {
  error?: string
  success?: boolean
}

/**
 * Server Action to handle user login
 * Authenticates user with Supabase and redirects based on role
 */
export async function loginAction(
  formData: FormData
): Promise<AuthActionResult> {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  // Validate input
  if (!email || !password) {
    return {
      error: 'Email dan password harus diisi',
    }
  }

  const supabase = await createClient()

  // Sign in with password
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (authError) {
    // Handle specific error messages
    if (authError.message.includes('Invalid login credentials')) {
      return {
        error: 'Email atau password salah',
      }
    }
    return {
      error: authError.message || 'Terjadi kesalahan saat login',
    }
  }

  if (!authData.user) {
    return {
      error: 'Gagal mendapatkan data pengguna',
    }
  }

  // Fetch user profile to get role
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', authData.user.id)
    .maybeSingle()

  let userRole: 'admin' | 'student' | 'guru_bk' = 'student'

  if (profileError) {
    console.error('Profile query error:', profileError)
    
    // If profile doesn't exist, try to create it
    const { data: newProfile, error: createError } = await supabase
      .from('profiles')
      .insert({
        id: authData.user.id,
        full_name: authData.user.user_metadata?.full_name || authData.user.email?.split('@')[0] || 'User',
        role: (authData.user.user_metadata?.role as 'admin' | 'student') || 'student',
      })
      .select('role')
      .single()

    if (createError || !newProfile) {
      console.error('Error creating profile:', createError)
      return {
        error: `Gagal mendapatkan atau membuat profil. Pastikan profil sudah dibuat di database untuk user ini. Error: ${createError?.message || profileError.message}`,
      }
    }

    userRole = newProfile.role
  } else if (profile) {
    userRole = profile.role
  } else {
    // Profile is null - try to create it
    const { data: newProfile, error: createError } = await supabase
      .from('profiles')
      .insert({
        id: authData.user.id,
        full_name: authData.user.user_metadata?.full_name || authData.user.email?.split('@')[0] || 'User',
        role: (authData.user.user_metadata?.role as 'admin' | 'student') || 'student',
      })
      .select('role')
      .single()

    if (createError || !newProfile) {
      console.error('Error creating profile:', createError)
      return {
        error: `Gagal membuat profil. Silakan hubungi administrator untuk membuat profil manual. Error: ${createError?.message || 'Unknown error'}`,
      }
    }

    userRole = newProfile.role
  }

  // Redirect based on role
  let redirectPath = '/login'
  const role = userRole as 'admin' | 'student' | 'guru_bk'
  
  // Debug logging
  console.log('User role:', role, 'User ID:', authData.user.id)
  
  if (role === 'admin') {
    redirectPath = '/admin'
  } else if (role === 'guru_bk') {
    redirectPath = '/guru-bk'
  } else {
    // Student doesn't need login, redirect to student portal
    redirectPath = '/student'
  }
  
  console.log('Redirecting to:', redirectPath)
  
  revalidatePath('/', 'layout')
  redirect(redirectPath)
}

