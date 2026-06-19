import { createClient } from '@/lib/supabase/server'
import { format } from 'date-fns'
import { Inbox, ExternalLink } from 'lucide-react'
import type { FormSubmission, FormSubmissionType } from '@/types'

const TYPE_LABELS: Record<FormSubmissionType, string> = {
  startup: 'Submit Startup',
  partner: 'Partner Inquiry',
  'founder-story': 'Founder Story',
  spotlight: 'Get Featured',
}

const TYPE_COLORS: Record<FormSubmissionType, string> = {
  startup: 'bg-blue-500/15 text-blue-400',
  partner: 'bg-emerald-500/15 text-emerald-400',
  'founder-story': 'bg-amber-500/15 text-amber-400',
  spotlight: 'bg-purple-500/15 text-purple-400',
}

/** Safely render any extra_data value as a string */
function renderValue(v: unknown): string {
  if (v === null || v === undefined) return '—'
  if (typeof v === 'string') return v
  if (typeof v === 'number' || typeof v === 'boolean') return String(v)
  if (Array.isArray(v)) return v.join(', ')
  // objects — JSON stringify as fallback
  return JSON.stringify(v)
}

/** Check if a value is a non-empty URL string */
function isUrl(v: unknown): v is string {
  return typeof v === 'string' && (v.startsWith('http://') || v.startsWith('https://'))
}

/** Flatten extra_data: expand nested "answers" object inline */
function flattenExtraData(extra: Record<string, unknown>): Array<{ key: string; value: unknown }> {
  const out: Array<{ key: string; value: unknown }> = []
  for (const [k, v] of Object.entries(extra)) {
    if (k === 'answers' && v && typeof v === 'object' && !Array.isArray(v)) {
      // Expand each answer individually
      for (const [qk, qv] of Object.entries(v as Record<string, unknown>)) {
        out.push({ key: qk.replace(/_/g, ' '), value: qv })
      }
    } else {
      out.push({ key: k.replace(/_/g, ' '), value: v })
    }
  }
  return out
}

export default async function SubmissionsPage() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('form_submissions')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    return (
      <div>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold">Form Submissions</h1>
            <p className="text-muted-foreground text-sm mt-1">All incoming submissions from the public forms</p>
          </div>
        </div>
        <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-8 text-center">
          <p className="text-sm font-semibold text-red-400">Failed to load submissions</p>
          <p className="text-xs text-muted-foreground mt-2 font-mono">{error.message}</p>
          {error.message.includes('does not exist') && (
            <p className="text-xs text-muted-foreground mt-3 max-w-md mx-auto">
              The <code className="font-mono bg-muted px-1 rounded">form_submissions</code> table may not exist yet.
              Run the SQL below in your Supabase dashboard to create it.
            </p>
          )}
        </div>
        {error.message.includes('does not exist') && (
          <div className="mt-4 rounded-lg border border-border/40 bg-card p-4">
            <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">SQL — run in Supabase SQL Editor</p>
            <pre className="text-xs text-muted-foreground overflow-x-auto whitespace-pre-wrap leading-relaxed">{`CREATE TABLE IF NOT EXISTS form_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL CHECK (type IN ('startup', 'partner', 'founder-story', 'spotlight')),
  name text NOT NULL,
  email text NOT NULL,
  organization text,
  message text,
  extra_data jsonb,
  status text NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'reviewed', 'archived')),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE form_submissions ENABLE ROW LEVEL SECURITY;

-- Anyone can insert (public forms)
CREATE POLICY "public_insert" ON form_submissions FOR INSERT TO anon WITH CHECK (true);

-- Only authenticated admins can read
CREATE POLICY "admin_select" ON form_submissions FOR SELECT TO authenticated USING (true);

-- Only authenticated admins can update (e.g. mark reviewed)
CREATE POLICY "admin_update" ON form_submissions FOR UPDATE TO authenticated USING (true);`}
            </pre>
          </div>
        )}
      </div>
    )
  }

  const submissions = data as FormSubmission[]

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Form Submissions</h1>
          <p className="text-muted-foreground text-sm mt-1">All incoming submissions from the public forms</p>
        </div>
        <span className="text-sm text-muted-foreground">{submissions.length} total</span>
      </div>

      {!submissions.length ? (
        <div className="rounded-lg border border-border/40 bg-card p-12 text-center">
          <Inbox className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm font-semibold text-muted-foreground">No submissions yet</p>
          <p className="text-xs text-muted-foreground mt-1">Submissions from your public forms will appear here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {submissions.map((sub) => {
            const extraEntries = sub.extra_data ? flattenExtraData(sub.extra_data as Record<string, unknown>) : []

            return (
              <div key={sub.id} className="rounded-lg border border-border/40 bg-card p-5">
                {/* Header row */}
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${TYPE_COLORS[sub.type]}`}>
                      {TYPE_LABELS[sub.type]}
                    </span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                      sub.status === 'new' ? 'bg-primary/15 text-primary' : 'bg-muted text-muted-foreground'
                    }`}>
                      {sub.status}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground shrink-0">
                    {format(new Date(sub.created_at), 'MMM d, yyyy · h:mm a')}
                  </span>
                </div>

                {/* Core fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5 mb-4 text-sm">
                  <div>
                    <span className="text-xs text-muted-foreground">Name: </span>
                    <span className="font-medium">{sub.name}</span>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground">Email: </span>
                    <a href={`mailto:${sub.email}`} className="font-medium text-primary hover:underline">{sub.email}</a>
                  </div>
                  {sub.organization && (
                    <div className="sm:col-span-2">
                      <span className="text-xs text-muted-foreground">Organization: </span>
                      <span className="font-medium">{sub.organization}</span>
                    </div>
                  )}
                </div>

                {/* Main message */}
                {sub.message && (
                  <div className="rounded-md bg-muted/40 px-4 py-3 text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap mb-4">
                    {sub.message}
                  </div>
                )}

                {/* Extra data — safe rendering */}
                {extraEntries.length > 0 && (
                  <div className="border-t border-border/30 pt-3 space-y-1.5">
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Additional Details</p>
                    {extraEntries.map(({ key, value }) => {
                      if (!value) return null
                      const isLink = isUrl(value)
                      return (
                        <div key={key} className="flex gap-2 text-sm flex-wrap">
                          <span className="text-xs text-muted-foreground capitalize shrink-0 min-w-24">{key}:</span>
                          {isLink ? (
                            <a
                              href={value as string}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-medium text-primary hover:underline flex items-center gap-1"
                            >
                              View file <ExternalLink className="h-3 w-3 inline" />
                            </a>
                          ) : (
                            <span className="font-medium break-all">{renderValue(value)}</span>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
