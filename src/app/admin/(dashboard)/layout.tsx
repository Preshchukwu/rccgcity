import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase'
import AdminShell from '@/components/admin/AdminShell'

export const metadata = { title: 'Admin — RCCGCity' }

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/admin/login')
  return <AdminShell>{children}</AdminShell>
}
