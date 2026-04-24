import { createClient } from '@/lib/supabase/server'
import { format } from 'date-fns'
import { Mail } from 'lucide-react'
import type { NewsletterSubscriber } from '@/types'

export default async function NewsletterPage() {
  const supabase = await createClient()
  const { data: subscribers } = await supabase
    .from('newsletter_subscribers')
    .select('*')
    .order('created_at', { ascending: false })

  const active = subscribers?.filter((s) => s.status === 'active').length ?? 0

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Newsletter Subscribers</h1>
          <p className="text-muted-foreground text-sm mt-1">{active} active subscriber{active !== 1 ? 's' : ''}</p>
        </div>
      </div>

      {!subscribers?.length ? (
        <div className="rounded-lg border border-border/40 bg-card p-12 text-center">
          <Mail className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm font-semibold text-muted-foreground">No subscribers yet</p>
          <p className="text-xs text-muted-foreground mt-1">Signups from the homepage newsletter form will appear here.</p>
        </div>
      ) : (
        <div className="rounded-lg border border-border/40 bg-card overflow-hidden">
          <div className="divide-y divide-border/40">
            {(subscribers as NewsletterSubscriber[]).map((sub) => (
              <div key={sub.id} className="flex items-center justify-between px-5 py-3">
                <div className="flex items-center gap-3 min-w-0">
                  <Mail className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  <a href={`mailto:${sub.email}`} className="text-sm font-medium hover:text-primary transition-colors truncate">
                    {sub.email}
                  </a>
                  {sub.source && sub.source !== 'homepage' && (
                    <span className="text-[10px] text-muted-foreground">via {sub.source}</span>
                  )}
                </div>
                <div className="flex items-center gap-3 shrink-0 ml-4">
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(sub.created_at), 'MMM d, yyyy')}
                  </span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                    sub.status === 'active'
                      ? 'bg-emerald-500/15 text-emerald-400'
                      : 'bg-muted text-muted-foreground'
                  }`}>
                    {sub.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
