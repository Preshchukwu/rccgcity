import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from './supabase'

export async function requireAdmin(): Promise<{ error: NextResponse } | { error: null }> {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
  }

  // Authorization check — passes if any of these are true:
  // 1. User has app_metadata.role === 'admin' (set via Supabase dashboard)
  // 2. User's email is in the ADMIN_EMAILS env var (comma-separated)
  // 3. Neither check is configured (ADMIN_EMAILS not set, no role) → backward compat
  const adminEmails = (process.env.ADMIN_EMAILS ?? '')
    .split(',')
    .map(e => e.trim())
    .filter(Boolean)

  const isAdminByRole = user.app_metadata?.role === 'admin'
  const isAdminByEmail = adminEmails.length > 0 && adminEmails.includes(user.email ?? '')

  if (adminEmails.length > 0 && !isAdminByRole && !isAdminByEmail) {
    return { error: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) }
  }

  return { error: null }
}
