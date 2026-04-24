import { createClient } from '@/lib/supabase/server'
import { format } from 'date-fns'
import { Inbox } from 'lucide-react'
import type { FormSubmission, FormSubmissionType } from '@/types'

const TYPE_LABELS: Record<FormSubmissionType, string> = {
  startup: 'Submit Startup',
  partner: 'Partner Inquiry',
  'founder-story': 'Founder Story',
}

const TYPE_COLORS: Record<FormSubmissionType, string> = {
  startup: 'bg-blue-500/15 text-blue-400',
  partner: 'bg-emerald-500/15 text-emerald-400',
  'founder-story': 'bg-amber-500/15 text-amber-400',
}

export default async function SubmissionsPage() {
  const supabase = await createClient()
  const { data: submissions } = await supabase
    .from('form_submissions')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Form Submissions</h1>
          <p className="text-muted-foreground text-sm mt-1">All incoming submissions from the public forms</p>
        </div>
        <span className="text-sm text-muted-foreground">{submissions?.length ?? 0} total</span>
      </div>

      {!submissions?.length ? (
        <div className="rounded-lg border border-border/40 bg-card p-12 text-center">
          <Inbox className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm font-semibold text-muted-foreground">No submissions yet</p>
          <p className="text-xs text-muted-foreground mt-1">Submissions from your public forms will appear here.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {(submissions as FormSubmission[]).map((sub) => (
            <div key={sub.id} className="rounded-lg border border-border/40 bg-card p-5">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex items-center gap-3">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${TYPE_COLORS[sub.type]}`}>
                    {TYPE_LABELS[sub.type]}
                  </span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                    sub.status === 'new' ? 'bg-primary/15 text-primary' :
                    sub.status === 'reviewed' ? 'bg-muted text-muted-foreground' :
                    'bg-muted text-muted-foreground'
                  }`}>
                    {sub.status}
                  </span>
                </div>
                <span className="text-xs text-muted-foreground shrink-0">
                  {format(new Date(sub.created_at), 'MMM d, yyyy · h:mm a')}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 mb-3 text-sm">
                <div>
                  <span className="text-xs text-muted-foreground">Name: </span>
                  <span className="font-medium">{sub.name}</span>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">Email: </span>
                  <a href={`mailto:${sub.email}`} className="font-medium text-primary hover:underline">{sub.email}</a>
                </div>
                {sub.organization && (
                  <div>
                    <span className="text-xs text-muted-foreground">Organization: </span>
                    <span className="font-medium">{sub.organization}</span>
                  </div>
                )}
                {sub.extra_data && Object.entries(sub.extra_data).filter(([, v]) => v).map(([k, v]) => (
                  <div key={k}>
                    <span className="text-xs text-muted-foreground capitalize">{k.replace(/_/g, ' ')}: </span>
                    <span className="font-medium">{v}</span>
                  </div>
                ))}
              </div>

              {sub.message && (
                <div className="rounded-md bg-muted/40 px-4 py-3 text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  {sub.message}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
