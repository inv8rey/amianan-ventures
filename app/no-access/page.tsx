import type { Metadata } from 'next'
import Link from 'next/link'
import { AdminLogout } from '@/components/admin/AdminLogout'

export const metadata: Metadata = { title: 'No access', robots: { index: false } }

export default function NoAccessPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm text-center">
        <h1 className="text-2xl font-semibold">This account isn&rsquo;t an admin.</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          You&rsquo;re signed in, but this email isn&rsquo;t approved for the admin area. Sign out to use another account.
        </p>
        <div className="mt-6 flex flex-col items-center gap-2">
          <AdminLogout />
          <Link href="/" className="text-sm underline underline-offset-4">Back to the news site</Link>
        </div>
      </div>
    </main>
  )
}
