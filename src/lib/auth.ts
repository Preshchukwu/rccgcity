import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from './supabase'

export async function requireAdmin(): Promise<{ error: NextResponse } | { error: null }> {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
  }
  return { error: null }
}
