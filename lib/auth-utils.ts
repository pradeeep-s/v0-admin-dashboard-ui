import bcrypt from 'bcryptjs'
import { queryOne, query } from '@/lib/db'
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
 * Steps:
 * 1. Look up user by email in users table
 * 2. Verify password against password_hash using bcrypt
 * 3. Check if user is active
 * 4. If user doesn't exist, create new user with provided credentials
 * 5. Return user with role information from users table
 */
export async function authenticateUser(
  email: string,
  password: string
): Promise<{ user: User | null; error: string | null; isNewUser: boolean }> {
  try {
    console.log('[DB] Authenticating user with email:', email)

    // Step 1: Try to find user by email in users table
    const storedUser = await queryOne<any>(
      'SELECT id, email, password_hash, role, is_active, username FROM public.users WHERE email = $1',
      [email]
    )

    if (storedUser && storedUser.password_hash) {
      console.log('[DB] Found user in users table for:', email)

      // Step 2: Verify password using bcrypt
      const passwordMatch = await verifyPassword(password, storedUser.password_hash)

      if (passwordMatch) {
        console.log('[DB] Password verification succeeded for:', email, 'Role:', storedUser.role)
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

      console.log('[DB] Password verification failed for:', email)
      return {
        user: null,
        error: 'Invalid email or password',
        isNewUser: false,
      }
    }

    // Step 3: User not found - create new user with credentials
    console.log('[DB] User not found, creating new user with email:', email)
    const passwordHash = await hashPassword(password)

    // Generate username from email
    const username = email.split('@')[0]

    // Create new user ID
    const newUserId = generateUUID()

    const newUser = await queryOne<any>(
      `INSERT INTO public.users (id, email, username, password_hash, role, is_active, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW())
       RETURNING id, email, username, role, is_active`,
      [newUserId, email, username, passwordHash, 'Operator', true]
    )

    if (!newUser) {
      console.error('[DB] Error creating new user')
      return {
        user: null,
        error: 'Failed to create user account',
        isNewUser: false,
      }
    }

    console.log('[DB] New user created successfully:', email, 'Role: Operator')
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
    console.error('[DB] Authentication error:', error)
    return {
      user: null,
      error: 'Authentication failed',
      isNewUser: false,
    }
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
    const passwordHash = await hashPassword(newPassword)

    const result = await query(
      'UPDATE public.users SET password_hash = $1 WHERE id = $2 RETURNING id',
      [passwordHash, userId]
    )

    return result.rowCount !== null && result.rowCount > 0
  } catch (error) {
    console.error('[DB] Error in updateUserPassword:', error)
    return false
  }
}
