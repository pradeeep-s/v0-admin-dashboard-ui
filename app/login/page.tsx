import { LoginForm } from '@/components/auth/login-form'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Login - Excel Data Processing System',
  description: 'Sign in to access the admin dashboard',
}

export default function LoginPage() {
  return <LoginForm />
}
