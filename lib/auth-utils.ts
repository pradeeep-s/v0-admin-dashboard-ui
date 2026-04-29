import bcrypt from 'bcryptjs'
import { createClient } from '@/lib/supabase/server'
import { User } from '@/lib/types'

/**
 * Hash password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10)
  return bcrypt.hash(password, salt)
}

/**
 * Verify password against hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

/**
 * Authenticate user with email and password
 * First tries Supabase Auth, then falls back to stored credentials in users table
 * If user doesn't exist in either system, creates them
 */
export async function authenticateUser(
  email: string,
  password: string
): Promise<{ user: User | null; error: string | null; isNewUser: boolean }> {
  try {
    const supabase = await createClient()

    // Step 1: Try Supabase Auth
    console.log('[v0] Attempting Supabase Auth for:', email)
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (!authError && authData.user) {
      console.log('[v0] Supabase Auth succeeded for:', email)
      // Get or create user record
      const userRecord = await getOrCreateUserRecord(supabase, authData.user.id, email)
      return {
        user: userRecord,
        error: null,
        isNewUser: false,
      }
    }

    console.log('[v0] Supabase Auth failed, trying fallback credentials:', authError?.message)

    // Step 2: Try fallback authentication (stored credentials in users table)
    const { data: storedUser, error: fetchError } = await supabase
      .from('users')
      .select('id, email, password_hash, role, is_active, username')
      .eq('email', email)
      .single()

    if (!fetchError && storedUser && storedUser.password_hash) {
      console.log('[v0] Found stored user credentials for:', email)
      const passwordMatch = await verifyPassword(password, storedUser.password_hash)

      if (passwordMatch) {
        console.log('[v0] Password verification succeeded for:', email)
        return {
          user: {
            id: storedUser.id,
            username: storedUser.username || email,
            email: storedUser.email,
            role: storedUser.role,
            isActive: storedUser.is_active,
          },
          error: null,
          isNewUser: false,
        }
      }

      console.log('[v0] Password verification failed for:', email)
    }

    // Step 3: User doesn't exist anywhere - create new user with stored credentials
    console.log('[v0] User not found, creating new user with email:', email)
    const passwordHash = await hashPassword(password)

    // Generate a unique username from email
    const username = email.split('@')[0] + Math.random().toString(36).substring(7)

    // Create user in users table without Supabase Auth ID
    // Use a temporary UUID for new manual users
    const tempUserId = crypto.randomUUID ? crypto.randomUUID() : generateUUID()

    const { data: newUser, error: createError } = await supabase
      .from('users')
      .insert([
        {
          id: tempUserId,
          email,
          username,
          password_hash: passwordHash,
          role: 'Operator', // Default new users to Operator role
          is_active: true,
        },
      ])
      .select('id, email, username, role, is_active')
      .single()

    if (createError) {
      console.error('[v0] Error creating new user:', createError)
      return {
        user: null,
        error: 'Failed to create user',
        isNewUser: false,
      }
    }

    console.log('[v0] New user created:', email)
    return {
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
        isActive: newUser.is_active,
      },
      error: null,
      isNewUser: true,
    }
  } catch (error) {
    console.error('[v0] Authentication error:', error)
    return {
      user: null,
      error: 'Authentication failed',
      isNewUser: false,
    }
  }
}

/**
 * Get existing user record or create one from Supabase Auth
 */
async function getOrCreateUserRecord(
  supabase: any,
  userId: string,
  email: string
): Promise<User> {
  // Try to get existing user
  const { data: existingUser } = await supabase
    .from('users')
    .select('id, username, email, role, is_active')
    .eq('id', userId)
    .single()

  if (existingUser) {
    return {
      id: existingUser.id,
      username: existingUser.username || email,
      email: existingUser.email,
      role: existingUser.role,
      isActive: existingUser.is_active,
    }
  }

  // Create new user record from Supabase Auth user
  const username = email.split('@')[0] + Math.random().toString(36).substring(7)

  const { data: newUser } = await supabase
    .from('users')
    .insert([
      {
        id: userId,
        email,
        username,
        role: 'Operator', // Default to Operator
        is_active: true,
      },
    ])
    .select('id, username, email, role, is_active')
    .single()

  return {
    id: newUser.id,
    username: newUser.username,
    email: newUser.email,
    role: newUser.role,
    isActive: newUser.is_active,
  }
}

/**
 * Simple UUID generator fallback
 */
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

/**
 * Update user password (after creating account)
 */
export async function updateUserPassword(userId: string, newPassword: string): Promise<boolean> {
  try {
    const supabase = await createClient()
    const passwordHash = await hashPassword(newPassword)

    const { error } = await supabase
      .from('users')
      .update({ password_hash: passwordHash })
      .eq('id', userId)

    if (error) {
      console.error('[v0] Error updating password:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('[v0] Error in updateUserPassword:', error)
    return false
  }
}
