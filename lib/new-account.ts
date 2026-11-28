import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'

/**
 * The sign-up routes run right after supabase.auth.signUp(), sometimes before the browser
 * has a session (when email confirmation is on). They used to trust any userId sent to them,
 * which let anyone create or overwrite profiles for other accounts. Now the caller must be
 * signed in as that user, or the account must have been created in the last 15 minutes.
 */
export async function canSetUpAccount(userId: unknown): Promise<boolean> {
  if (typeof userId !== 'string' || !/^[0-9a-f-]{36}$/i.test(userId)) return false

  const session = await createClient()
  const { data: { user } } = await session.auth.getUser()
  if (user) return user.id === userId

  const { data } = await createServiceClient().auth.admin.getUserById(userId)
  const created = data?.user?.created_at ? Date.parse(data.user.created_at) : NaN
  return Number.isFinite(created) && Date.now() - created < 15 * 60 * 1000
}
