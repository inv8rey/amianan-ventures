import { createClient } from '@/lib/supabase/server'

/**
 * Who is signed in, and whether they are an admin. "Admin" means their email is in
 * the admin_users table (see admin-lockdown.sql); signing in alone is not enough.
 */
export async function getSessionRole() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { user: null, isAdmin: false }
  const { data, error } = await supabase.rpc('is_admin')
  return { user, isAdmin: !error && data === true }
}

/** For server actions: throws unless the caller is an admin. */
export async function requireAdmin() {
  const { isAdmin } = await getSessionRole()
  if (!isAdmin) throw new Error('Not authorized')
}
