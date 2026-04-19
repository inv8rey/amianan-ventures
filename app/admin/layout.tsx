import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Zap, LayoutDashboard, FileText, Calendar, Building2, Upload } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { AdminLogout } from '@/components/admin/AdminLogout'

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/articles', label: 'Articles', icon: FileText, exact: false },
  { href: '/admin/events', label: 'Events', icon: Calendar, exact: false },
  { href: '/admin/directory', label: 'Directory', icon: Building2, exact: false },
  { href: '/admin/import', label: 'Import CSV', icon: Upload, exact: false },
]

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-60 shrink-0 border-r border-border/40 bg-card flex flex-col">
        <div className="p-5 border-b border-border/40">
          <Link href="/admin" className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded bg-primary">
              <Zap className="h-3.5 w-3.5 text-primary-foreground" />
            </div>
            <span className="text-sm font-bold">AV Admin</span>
          </Link>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-2.5 px-3 py-2 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="p-3 border-t border-border/40">
          <div className="px-3 py-2 mb-2">
            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
          </div>
          <AdminLogout />
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <div className="p-6 lg:p-8">{children}</div>
      </main>
    </div>
  )
}
