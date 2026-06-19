import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { format } from 'date-fns'
import { ArrowLeft, ExternalLink } from 'lucide-react'
import {
  STATUS_LABELS, STATUS_COLORS, PAYMENT_METHOD_LABELS,
  type SpotlightApplication, type SpotlightStatus, type PaymentMethod,
} from '@/types/spotlight'
import { SpotlightEditorActions } from '@/components/contributor/SpotlightEditorActions'

export default async function SpotlightReviewPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  const supabase = createAdminClient(url, serviceKey, { auth: { persistSession: false } })

  const { data: app } = await supabase
    .from('spotlight_applications')
    .select('*')
    .eq('id', id)
    .single()

  if (!app) notFound()

  let application = app as SpotlightApplication

  // Auto-advance to under_review when editor opens it
  if (application.status === 'submitted') {
    const { data: updated } = await supabase
      .from('spotlight_applications')
      .update({ status: 'under_review', reviewed_at: new Date().toISOString() })
      .eq('id', id)
      .select('*')
      .single()
    if (updated) application = updated as SpotlightApplication
  }

  const status = application.status as SpotlightStatus

  return (
    <div>
      <Link
        href="/admin/spotlight"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground mb-6 transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> All Applications
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-5">
          <div>
            <div className="flex items-start justify-between gap-4 mb-1">
              <div>
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Get Featured Application</span>
                <h1 className="text-xl font-bold mt-1 leading-snug">{application.business_name}</h1>
              </div>
              <span className={`text-[10px] px-2.5 py-1 rounded-full font-semibold shrink-0 ${STATUS_COLORS[status]}`}>
                {STATUS_LABELS[status]}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1.5">
              Created {format(new Date(application.created_at), 'MMMM d, yyyy')}
              {application.submitted_at && ` · Submitted ${format(new Date(application.submitted_at), 'MMM d')}`}
              {application.reviewed_at && ` · Reviewed ${format(new Date(application.reviewed_at), 'MMM d')}`}
            </p>
          </div>

          {/* Business info */}
          <div className="rounded-lg border border-border/40 bg-card p-4 space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Business Information</p>
            <Row label="Contact" value={application.contact_name} />
            <Row label="Email" value={application.email} />
            <Row label="Phone" value={application.phone} />
            <Row label="Website" value={application.website} />
            <Row label="Industry" value={application.industry} />
            <Row label="Region" value={application.region} />
          </div>

          {/* Story */}
          <div className="rounded-lg border border-border/40 bg-card p-4 space-y-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Story</p>
            <StoryBlock label="What does the business do?" value={application.what_you_do} />
            <StoryBlock label="What problem are they solving?" value={application.problem} />
            <StoryBlock label="What impact are they creating?" value={application.impact} />
            <StoryBlock label="Why should they be featured?" value={application.why_feature} />
          </div>

          {/* Payment */}
          {application.payment_method && (
            <div className="rounded-lg border border-border/40 bg-card p-4 space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Payment</p>
              <Row label="Method" value={PAYMENT_METHOD_LABELS[application.payment_method as PaymentMethod]} />
              <Row label="Reference" value={application.payment_reference} />
              <Row label="Amount" value={`₱${application.amount_php.toLocaleString()}`} />
              {application.payment_proof_url && (
                <div className="pt-2">
                  <a href={application.payment_proof_url} target="_blank" rel="noopener noreferrer">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={application.payment_proof_url} alt="Payment proof" className="max-w-xs rounded-lg border border-border/40" />
                  </a>
                </div>
              )}
            </div>
          )}

          {/* Published link */}
          {status === 'published' && application.published_url && (
            <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4">
              <p className="text-xs font-semibold text-emerald-400 mb-1.5">Published Story</p>
              <a href={application.published_url} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm text-emerald-400 hover:underline">
                <ExternalLink className="h-3.5 w-3.5" />
                {application.published_url}
              </a>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <SpotlightEditorActions application={application} />
        </div>
      </div>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string | null }) {
  if (!value) return null
  return (
    <p className="text-xs text-muted-foreground">
      <span className="font-semibold text-foreground">{label}:</span> {value}
    </p>
  )
}

function StoryBlock({ label, value }: { label: string; value: string | null }) {
  if (!value) return null
  return (
    <div>
      <p className="text-[11px] font-semibold text-muted-foreground mb-1">{label}</p>
      <p className="text-sm leading-relaxed">{value}</p>
    </div>
  )
}
