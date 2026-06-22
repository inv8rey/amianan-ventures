'use client'

import { useRef, useState } from 'react'
import Link from 'next/link'
import { toast } from 'sonner'
import { format } from 'date-fns'
import {
  Loader2, Upload, CheckCircle2, ExternalLink, Lock, ImageIcon, X,
  FileEdit, Monitor, Quote, IdCard, FileBadge2, CreditCard, PenSquare, Send,
  Megaphone, Share2, Mail, ChevronRight, Building2, User, Sparkles, Info,
  ShieldCheck, Headset, Star, Check, PenLine, Phone, Link2, Calendar, MapPin,
  ArrowUpRight, Globe, Briefcase,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import {
  type SpotlightApplication, type PaymentMethod, type StoryQuestionKey, type PackageId,
  STATUS_LABELS, STATUS_COLORS, EDITABLE_STATUSES, PAYMENT_METHOD_LABELS,
  INDUSTRIES, PACKAGES, STORY_SETS,
} from '@/types/spotlight'
import { CONTRIBUTOR_REGIONS } from '@/types/contributor'

interface FileField {
  url: string | null
  uploading: boolean
}

const PAYMENT_VISIBLE_STATUSES: SpotlightApplication['status'][] = [
  'approved', 'awaiting_payment', 'payment_submitted', 'paid', 'in_production', 'published',
]
const PAYMENT_EDITABLE_STATUSES: SpotlightApplication['status'][] = ['approved', 'awaiting_payment']

// What's included in each package — same lists shown on the /get-featured marketing page.
const PACKAGE_INCLUDED: Record<PackageId, { icon: LucideIcon; title: string; desc: string }[]> = {
  'founding-rate': [
    { icon: FileEdit,  title: 'Featured Article', desc: 'A professionally written article about your startup, business, or innovation published on Amianan Ventures and shared with our community.' },
    { icon: Monitor,   title: 'Homepage Feature', desc: 'Receive dedicated featured placement on the Amianan Ventures homepage for 2 weeks, helping more visitors discover your story.' },
    { icon: Megaphone, title: 'Article Banner Placement', desc: 'Your business is promoted inside selected Amianan Ventures articles, reaching readers already interested in innovation, startups, and business.' },
    { icon: Quote,     title: 'Founder Quote Card', desc: 'A professionally designed social media graphic featuring your story, insight, or message that is ready to share across your channels.' },
    { icon: IdCard,    title: 'Featured Startup Listing', desc: 'Highlighted in the Featured Organizations section of the Northern Luzon Ecosystem Directory to help founders, investors, partners, and stakeholders discover your business.' },
    { icon: Mail,      title: 'Newsletter Inclusion', desc: 'Your story is included in a future Amianan Ventures newsletter distributed to ecosystem stakeholders and community members.' },
  ],
  'ecosystem-visibility': [
    { icon: Monitor,    title: 'Homepage Banner Placement', desc: 'Your organization featured on the Amianan Ventures homepage.' },
    { icon: Megaphone,  title: 'Article Banner Placement', desc: 'Your brand placed inside relevant articles read across the ecosystem.' },
    { icon: FileEdit,   title: 'Featured Article', desc: 'A professionally written feature published on Amianan Ventures.' },
    { icon: IdCard,     title: 'Directory Spotlight', desc: 'A standout profile in the Northern Luzon ecosystem directory.' },
    { icon: Share2,     title: 'Social Media Feature', desc: 'Your organization shared across Amianan Ventures\' channels.' },
    { icon: FileBadge2, title: 'Digital Partner Certificate', desc: 'Official recognition as an Amianan Ventures ecosystem partner.' },
  ],
}

// What happens after saving/submitting — mirrors the "How It Works" steps on /get-featured.
const NEXT_STEPS = [
  { icon: FileEdit,   title: 'Application Review', desc: 'Our team reviews your application within 1–3 business days.', statuses: ['draft', 'submitted', 'under_review'] },
  { icon: CreditCard, title: 'Approval & Payment', desc: 'If approved, payment instructions appear below. Pay to reserve the founding rate.', statuses: ['approved', 'rejected', 'awaiting_payment', 'payment_submitted'] },
  { icon: PenSquare,  title: 'Story Production', desc: 'Our team is drafting your article and preparing your feature assets.', statuses: ['paid', 'in_production'] },
  { icon: Send,       title: 'Publication', desc: 'Your story goes live and we promote it across our channels.', statuses: ['published'] },
] as const

function currentStepIndex(status: SpotlightApplication['status']) {
  const idx = NEXT_STEPS.findIndex((s) => (s.statuses as readonly string[]).includes(status))
  return idx === -1 ? 0 : idx
}

// Shown on the confirmation screen right after saving/submitting.
const SUMMARY_COPY = {
  submitted: {
    heading: 'Application Submitted!',
    body: 'Thank you for submitting your application. Our editorial team will review it within 1–3 business days.',
  },
  review: {
    heading: 'Your Application Is Under Review',
    body: "Our editorial team is currently reviewing your submission. We'll be in touch soon.",
  },
  updated: {
    heading: 'Your Story Has Been Updated!',
    body: 'Thank you for updating your information. Our editorial team will continue reviewing your submission.',
  },
} as const

export function SpotlightForm({ application }: { application: SpotlightApplication }) {
  const [app, setApp] = useState(application)
  const pkg = PACKAGES[app.package]
  const isOrgPackage = app.package === 'ecosystem-visibility'
  const shortPkgName = isOrgPackage ? 'Ecosystem Partner' : 'Startup Spotlight'
  const [form, setForm] = useState({
    business_name: application.business_name,
    contact_name: application.contact_name,
    email: application.email,
    phone: application.phone ?? '',
    website: application.website ?? '',
    industry: application.industry ?? '',
    region: application.region ?? '',
    role: application.role ?? '',
    social_link: application.social_link ?? '',
  })
  const [answers, setAnswers] = useState<Partial<Record<StoryQuestionKey, string>>>(
    application.story_answers ?? {}
  )
  const [founderPhoto, setFounderPhoto] = useState<FileField>({ url: application.founder_photo_url, uploading: false })
  const [startupLogo, setStartupLogo] = useState<FileField>({ url: application.startup_logo_url, uploading: false })
  const [productPhoto, setProductPhoto] = useState<FileField>({ url: application.product_photo_url, uploading: false })
  const [payment, setPayment] = useState({
    payment_method: (application.payment_method ?? '') as PaymentMethod | '',
    payment_reference: application.payment_reference ?? '',
  })
  const [proofUrl, setProofUrl] = useState(application.payment_proof_url)
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [payingLoading, setPayingLoading] = useState(false)
  const [confirmingCancel, setConfirmingCancel] = useState(false)
  const [cancelling, setCancelling] = useState(false)
  const [view, setView] = useState<'edit' | 'summary'>(
    application.status === 'submitted' || application.status === 'under_review' ? 'summary' : 'edit'
  )
  const [summaryReason, setSummaryReason] = useState<keyof typeof SUMMARY_COPY>(
    application.status === 'under_review' ? 'review' : 'submitted'
  )
  const fileInputRef = useRef<HTMLInputElement>(null)

  const set = (key: keyof typeof form, val: string) => setForm((f) => ({ ...f, [key]: val }))
  const setAnswer = (key: StoryQuestionKey, val: string) => setAnswers((a) => ({ ...a, [key]: val }))
  const locked = !EDITABLE_STATUSES.includes(app.status)
  const storyQuestions = STORY_SETS[app.package]
  const submissionId = `AV-${isOrgPackage ? 'EP' : 'SS'}-${new Date(app.created_at).getFullYear()}-${app.id.slice(0, 6).toUpperCase()}`

  function currentAssetFields() {
    return {
      ...form,
      story_answers: answers,
      founder_photo_url: founderPhoto.url,
      startup_logo_url: startupLogo.url,
      product_photo_url: productPhoto.url,
    }
  }

  async function saveRow(updates: Partial<SpotlightApplication>) {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('spotlight_applications')
      .update(updates)
      .eq('id', app.id)
      .select('*')
      .single()
    if (error) {
      toast.error(error.message)
      return null
    }
    setApp(data as SpotlightApplication)
    return data
  }

  async function handleSaveDraft() {
    setSaving(true)
    const result = await saveRow(currentAssetFields())
    setSaving(false)
    if (result) toast.success('Draft saved.')
  }

  async function handleSubmitForReview() {
    const required: (keyof typeof form)[] = ['business_name', 'contact_name', 'email', 'phone', 'role', 'industry', 'region']
    const missingFields = required.filter((k) => !form[k].trim())
    const missingStory = storyQuestions.filter((q) => q.required && !(answers[q.key] ?? '').trim())
    if (missingFields.length > 0 || missingStory.length > 0) {
      toast.error('Please fill out all required fields before submitting.')
      return
    }
    if (!startupLogo.url) {
      toast.error(`Please upload a ${isOrgPackage ? 'logo' : 'startup logo'}.`)
      return
    }
    if (!isOrgPackage && !founderPhoto.url) {
      toast.error('Please upload a founder photo.')
      return
    }
    setSubmitting(true)
    const result = await saveRow({
      ...currentAssetFields(),
      status: 'submitted',
      submitted_at: app.submitted_at ?? new Date().toISOString(),
    })
    setSubmitting(false)
    if (result) {
      toast.success('Application submitted for review!')
      setSummaryReason('submitted')
      setView('summary')
      fetch('/api/spotlight/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ applicationId: app.id }),
      }).catch(() => {})
    }
  }

  async function handleSaveChanges() {
    setSaving(true)
    const result = await saveRow(currentAssetFields())
    setSaving(false)
    if (result) {
      toast.success('Changes saved.')
      if (result.status === 'submitted' || result.status === 'under_review') {
        setSummaryReason('updated')
        setView('summary')
      }
    }
  }

  async function handleUploadAsset(file: File, kind: 'founder' | 'logo' | 'product') {
    const setters = { founder: setFounderPhoto, logo: setStartupLogo, product: setProductPhoto }
    const setter = setters[kind]
    setter({ url: null, uploading: true })
    const supabase = createClient()
    const ext = file.name.split('.').pop()
    const path = `spotlight/${kind}-${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
    const { error } = await supabase.storage.from('submission-assets').upload(path, file, { upsert: false })
    if (error) {
      toast.error('Upload failed. Please try again.')
      setter({ url: null, uploading: false })
      return
    }
    const { data: { publicUrl } } = supabase.storage.from('submission-assets').getPublicUrl(path)
    setter({ url: publicUrl, uploading: false })
  }

  async function handleUploadProof(file: File) {
    setUploading(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      toast.error('Session expired. Please log in again.')
      setUploading(false)
      return
    }
    const ext = file.name.split('.').pop()
    const path = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
    const { error } = await supabase.storage.from('payment-proofs').upload(path, file, { upsert: false })
    if (error) {
      toast.error('Upload failed. Please try again.')
      setUploading(false)
      return
    }
    const { data: { publicUrl } } = supabase.storage.from('payment-proofs').getPublicUrl(path)
    setProofUrl(publicUrl)
    setUploading(false)
  }

  async function handleSubmitPayment() {
    if (!payment.payment_method || !payment.payment_reference.trim() || !proofUrl) {
      toast.error('Please select a payment method, enter a reference number, and upload proof of payment.')
      return
    }
    setPayingLoading(true)
    const result = await saveRow({
      payment_method: payment.payment_method,
      payment_reference: payment.payment_reference.trim(),
      payment_proof_url: proofUrl,
      status: 'payment_submitted',
      payment_submitted_at: new Date().toISOString(),
    })
    setPayingLoading(false)
    if (result) toast.success('Payment submitted! We\'ll confirm receipt shortly.')
  }

  async function handleCancel() {
    setCancelling(true)
    const result = await saveRow({ status: 'cancelled' })
    setCancelling(false)
    setConfirmingCancel(false)
    if (result) toast.success('Application cancelled.')
  }

  return (
    <div className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen">
      <div className="mx-auto max-w-[1480px] px-4 sm:px-6 lg:px-10">
      {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs text-zinc-400 mb-4">
          <Link href="/dashboard" className="hover:text-zinc-600 transition-colors">Dashboard</Link>
          <ChevronRight className="h-3 w-3" />
          <Link href="/feature-packages" className="hover:text-zinc-600 transition-colors">Get Featured</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-zinc-700 font-semibold">{shortPkgName}</span>
        </nav>

        {view === 'edit' && (
          <>
            <div className="flex items-center justify-between gap-3 mb-2 flex-wrap">
              <h1 className="text-2xl font-black text-zinc-900 flex items-center gap-2">
                {isOrgPackage ? "Let's Build Your Partnership" : "Let's Tell Your Story"}
                <Sparkles className="h-5 w-5 text-amber-400 fill-amber-400" />
              </h1>
              <span className={`text-xs font-bold uppercase tracking-wide px-2.5 py-1 rounded-full ${STATUS_COLORS[app.status]}`}>
                {STATUS_LABELS[app.status]}
              </span>
            </div>
            <p className="text-sm text-zinc-500 mb-6">
              {locked
                ? 'Your application is locked while we produce your feature.'
                : `We'll use the information below to create your feature and showcase your ${isOrgPackage ? 'organization' : 'startup'} to the Northern Luzon innovation community.`}
            </p>
          </>
        )}

        {app.status === 'rejected' && app.editor_notes && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 mb-6">
            <p className="text-sm font-bold text-red-700 mb-1">Application not approved</p>
            <p className="text-sm text-red-600">{app.editor_notes}</p>
          </div>
        )}

        {app.status === 'cancelled' && (
          <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 mb-6">
            <p className="text-sm font-bold text-zinc-700 mb-1">Application cancelled</p>
            <p className="text-sm text-zinc-500">
              You cancelled this application. Changed your mind?{' '}
              <Link href="/feature-packages" className="font-bold text-[#00a855] hover:underline">Start a new one</Link>.
            </p>
          </div>
        )}

        {app.status === 'published' && app.published_url && (
          <div className="rounded-xl border border-[#00a855]/20 bg-[#00a855]/5 p-4 mb-6 flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-[#00a855]" />
              <p className="text-sm font-bold text-zinc-900">Your story is live!</p>
            </div>
            <a href={app.published_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm font-bold text-[#00a855] hover:underline">
              View Story <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8">
          {/* Main column */}
          <div className="space-y-5">
            {view === 'summary' ? (
              <>
                {/* Confirmation card */}
                <div className="rounded-2xl border border-zinc-200 bg-gradient-to-br from-[#f3fbf6] to-white p-7 sm:p-8">
                  <div className="flex justify-end mb-2">
                    <span className={`text-xs font-bold uppercase tracking-wide px-2.5 py-1 rounded-full shrink-0 ${STATUS_COLORS[app.status]}`}>
                      {STATUS_LABELS[app.status]}
                    </span>
                  </div>
                  <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                    <div className="relative shrink-0">
                      <div className="w-20 h-20 rounded-full bg-[#00a855]/10 flex items-center justify-center">
                        <CheckCircle2 className="h-10 w-10 text-[#00a855]" />
                      </div>
                      <Sparkles className="absolute -top-1 -right-1 h-5 w-5 text-amber-400 fill-amber-400" />
                    </div>
                    <div className="flex-1 text-center sm:text-left">
                      <h2 className="text-xl font-black text-zinc-900 mb-1.5">
                        {SUMMARY_COPY[summaryReason].heading} 🎉
                      </h2>
                      <p className="text-sm text-zinc-500 leading-relaxed mb-4">
                        {SUMMARY_COPY[summaryReason].body}
                      </p>
                      <div className="grid grid-cols-2 gap-4 bg-white rounded-xl border border-zinc-200 p-4 mb-4 max-w-sm mx-auto sm:mx-0">
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-wide text-zinc-400 mb-0.5">Submission ID</p>
                          <p className="text-sm font-bold text-zinc-900">{submissionId}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-wide text-zinc-400 mb-0.5">Last Updated</p>
                          <p className="text-sm font-bold text-zinc-900">{format(new Date(app.updated_at), "MMM d, yyyy 'at' h:mm a")}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2 text-xs text-zinc-500 justify-center sm:justify-start">
                        <Mail className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                        <p>We&apos;ll notify you via email if there are any updates. You can track your submission status anytime from your dashboard.</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Application summary */}
                <div className="rounded-2xl border border-zinc-200 bg-white p-6">
                  <div className="flex items-center justify-between mb-5">
                    <p className="text-sm font-black text-zinc-900">Your Application Summary</p>
                    <button type="button" onClick={() => setView('edit')} className="inline-flex items-center gap-1 text-xs font-bold text-[#00a855] hover:underline">
                      Edit Application <ArrowUpRight className="h-3 w-3" />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                    <SummaryField icon={Building2} label={isOrgPackage ? 'Organization Name' : 'Startup Name'} value={app.business_name} />
                    <SummaryField icon={User} label={isOrgPackage ? 'Representative' : 'Founder'} value={app.contact_name} />
                    <SummaryField icon={Briefcase} label="Role" value={app.role || 'Not provided'} />
                    <SummaryField icon={Globe} label="Website" value={app.website || 'Not provided'} />
                    <SummaryField icon={Link2} label="LinkedIn / Facebook" value={app.social_link || 'Not provided'} />
                    <SummaryField icon={Mail} label="Email" value={app.email} />
                    <SummaryField icon={Phone} label="Contact Number" value={app.phone || 'Not provided'} />
                    <SummaryField icon={Building2} label="Industry" value={app.industry || 'Not provided'} />
                    <SummaryField icon={MapPin} label="Region" value={app.region || 'Not provided'} />
                    <SummaryField icon={Calendar} label="Last Updated" value={format(new Date(app.updated_at), 'MMM d, yyyy')} />
                    <SummaryField
                      icon={CheckCircle2}
                      label="Status"
                      value={
                        <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full ${STATUS_COLORS[app.status]}`}>
                          {STATUS_LABELS[app.status]}
                        </span>
                      }
                    />
                  </div>
                </div>
              </>
            ) : (
            <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <SectionCard number={1} icon={Building2} title={isOrgPackage ? 'About Your Organization' : 'About Your Startup'}>
                <div className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <Field label={isOrgPackage ? 'Organization Name' : 'Startup Name'} required value={form.business_name} onChange={(v) => set('business_name', v)} disabled={locked} />
                    <Field label="Website" type="url" value={form.website} onChange={(v) => set('website', v)} disabled={locked} />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <SelectField label="Industry" required value={form.industry} onChange={(v) => set('industry', v)} options={INDUSTRIES} disabled={locked} />
                    <SelectField label="Region" required value={form.region} onChange={(v) => set('region', v)} options={CONTRIBUTOR_REGIONS.map((r) => r.label)} disabled={locked} />
                  </div>
                </div>
              </SectionCard>

              <SectionCard number={2} icon={User} title={isOrgPackage ? 'Representative Information' : 'Founder Information'}>
                <div className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <Field label="Full Name" required value={form.contact_name} onChange={(v) => set('contact_name', v)} disabled={locked} />
                    <Field label="Role / Position" required placeholder={isOrgPackage ? 'e.g. Program Director' : 'e.g. Co-founder & CEO'} value={form.role} onChange={(v) => set('role', v)} disabled={locked} />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <Field label="Email" type="email" required value={form.email} onChange={(v) => set('email', v)} disabled={locked} />
                    <Field label="Contact Number" type="tel" required value={form.phone} onChange={(v) => set('phone', v)} disabled={locked} />
                  </div>
                  <Field label="LinkedIn / Facebook Profile (Optional)" type="url" value={form.social_link} onChange={(v) => set('social_link', v)} disabled={locked} />
                </div>
              </SectionCard>
            </div>

            <SectionCard number={3} icon={PenLine} title="Story Information">
              <div className="space-y-5">
                {storyQuestions.map((q) => (
                  <TextareaField
                    key={q.key}
                    label={q.label}
                    placeholder={q.placeholder}
                    required={q.required}
                    value={answers[q.key] ?? ''}
                    onChange={(v) => setAnswer(q.key, v)}
                    maxLength={1000}
                    disabled={locked}
                  />
                ))}
              </div>
            </SectionCard>

            <SectionCard number={4} icon={ImageIcon} title="Upload Assets">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <AssetUpload
                  label={isOrgPackage ? 'Logo' : 'Startup Logo'}
                  required
                  field={startupLogo}
                  disabled={locked}
                  onUpload={(f) => handleUploadAsset(f, 'logo')}
                  onClear={() => setStartupLogo({ url: null, uploading: false })}
                />
                <AssetUpload
                  label={isOrgPackage ? 'Representative Photo' : 'Founder Photo'}
                  required={!isOrgPackage}
                  field={founderPhoto}
                  disabled={locked}
                  onUpload={(f) => handleUploadAsset(f, 'founder')}
                  onClear={() => setFounderPhoto({ url: null, uploading: false })}
                />
                <AssetUpload
                  label={isOrgPackage ? 'Photos (Optional)' : 'Startup Photos (Optional)'}
                  field={productPhoto}
                  disabled={locked}
                  onUpload={(f) => handleUploadAsset(f, 'product')}
                  onClear={() => setProductPhoto({ url: null, uploading: false })}
                />
              </div>
            </SectionCard>

            {(app.status === 'submitted' || app.status === 'under_review') && (
              <p className="text-xs text-zinc-400 text-center">
                Your application is being reviewed. You can keep editing — we&apos;ll see your latest version.
              </p>
            )}

            {/* Payment */}
            {PAYMENT_VISIBLE_STATUSES.includes(app.status) && (
              <div className="rounded-2xl border border-zinc-200 bg-white p-6">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-black text-zinc-900">Payment</p>
                  <p className="text-sm font-black text-zinc-900">₱{(app.amount_php ?? pkg.amount_php).toLocaleString()}</p>
                </div>
                <p className="text-xs text-zinc-500 mb-5">{pkg.name} · {pkg.badge}</p>

                {PAYMENT_EDITABLE_STATUSES.includes(app.status) ? (
                  <div className="space-y-4">
                    <p className="text-xs text-zinc-500 leading-relaxed bg-zinc-50 rounded-lg p-3">
                      Send ₱{(app.amount_php ?? pkg.amount_php).toLocaleString()} via your chosen method below, then enter your reference number and upload a screenshot of the transaction. Our team will confirm receipt and update your status.
                    </p>
                    <div>
                      <label className="block text-sm font-semibold text-zinc-700 mb-1.5">Payment Method <span className="text-red-400">*</span></label>
                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                        {(Object.entries(PAYMENT_METHOD_LABELS) as [PaymentMethod, string][]).map(([value, label]) => (
                          <button
                            key={value}
                            type="button"
                            onClick={() => setPayment((p) => ({ ...p, payment_method: value }))}
                            className={`px-3 py-2.5 rounded-lg border text-sm font-bold transition-colors ${
                              payment.payment_method === value ? 'border-[#00cc6a] bg-[#00cc6a]/10 text-zinc-900' : 'border-zinc-300 text-zinc-600 hover:bg-zinc-50'
                            }`}
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                    </div>
                    <Field label="Reference Number" required value={payment.payment_reference} onChange={(v) => setPayment((p) => ({ ...p, payment_reference: v }))} />
                    <div>
                      <label className="block text-sm font-semibold text-zinc-700 mb-1.5">Proof of Payment <span className="text-red-400">*</span></label>
                      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleUploadProof(e.target.files[0])} />
                      {proofUrl ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img src={proofUrl} alt="Payment proof" className="w-full max-w-xs rounded-lg border border-zinc-200" />
                      ) : (
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={uploading}
                          className="w-full rounded-lg border-2 border-dashed border-zinc-300 py-8 flex flex-col items-center gap-2 text-zinc-400 hover:border-zinc-400 transition-colors disabled:opacity-60"
                        >
                          {uploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Upload className="h-5 w-5" />}
                          <span className="text-xs font-semibold">{uploading ? 'Uploading…' : 'Upload screenshot'}</span>
                        </button>
                      )}
                      {proofUrl && (
                        <button type="button" onClick={() => fileInputRef.current?.click()} className="text-xs font-bold text-zinc-500 hover:underline mt-2">
                          Replace screenshot
                        </button>
                      )}
                    </div>
                    <button
                      onClick={handleSubmitPayment}
                      disabled={payingLoading}
                      className="w-full px-5 py-3 rounded-lg bg-[#00cc6a] text-black text-sm font-bold hover:bg-[#00b85e] disabled:opacity-60 transition-colors"
                    >
                      {payingLoading ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : 'Submit Payment for Verification'}
                    </button>
                  </div>
                ) : (
                  <div className="rounded-lg bg-zinc-50 p-4 space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      {app.status === 'payment_submitted' ? (
                        <Loader2 className="h-4 w-4 text-amber-500" />
                      ) : (
                        <CheckCircle2 className="h-4 w-4 text-[#00a855]" />
                      )}
                      <span className="font-semibold text-zinc-700">
                        {app.status === 'payment_submitted' ? 'Awaiting confirmation' : 'Payment confirmed'}
                      </span>
                    </div>
                    {app.payment_method && (
                      <p className="text-xs text-zinc-500">
                        {PAYMENT_METHOD_LABELS[app.payment_method]} · Ref: {app.payment_reference}
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}

            {locked && (
              <div className="flex items-center gap-2 text-xs text-zinc-400 justify-center">
                <Lock className="h-3 w-3" /> Editing is locked while your feature is in production.
              </div>
            )}

            {/* Cancel application — intentionally tucked away and unobtrusive */}
            {!locked && (
              <div className="pt-4 border-t border-zinc-100 text-center">
                {!confirmingCancel ? (
                  <button
                    type="button"
                    onClick={() => setConfirmingCancel(true)}
                    className="text-xs text-zinc-400 hover:text-zinc-500 transition-colors"
                  >
                    Cancel application
                  </button>
                ) : (
                  <div className="inline-flex flex-col items-center gap-2">
                    <p className="text-xs text-zinc-500">Cancel this application? This can&apos;t be undone.</p>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={handleCancel}
                        disabled={cancelling}
                        className="text-xs font-bold text-red-500 hover:underline disabled:opacity-60"
                      >
                        {cancelling ? <Loader2 className="h-3 w-3 animate-spin inline" /> : 'Yes, cancel it'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmingCancel(false)}
                        className="text-xs text-zinc-400 hover:text-zinc-600"
                      >
                        Never mind
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
            </>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            {view === 'edit' && (
            <div className="rounded-2xl border border-[#00a855]/20 bg-gradient-to-br from-[#eef8f1] to-white p-5">
              <p className="text-[10px] font-black uppercase tracking-widest text-[#00a855] mb-2">Package Selected</p>
              <div className="flex items-start justify-between gap-2 mb-2">
                <h2 className="text-base font-black text-zinc-900 leading-snug">{pkg.name}</h2>
                <div className="w-9 h-9 rounded-full bg-amber-400/15 flex items-center justify-center shrink-0">
                  <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                </div>
              </div>
              <p className="text-xs text-zinc-500 leading-relaxed mb-4">
                {isOrgPackage
                  ? "Promote your organization and get featured across the Amianan Ventures platform."
                  : "Share your startup story and get featured across the Amianan Ventures platform."}
              </p>

              <p className="text-xs font-black text-zinc-900 mb-2">What&apos;s Included</p>
              <div className="space-y-1.5 mb-4">
                {PACKAGE_INCLUDED[app.package].map((item) => (
                  <div key={item.title} className="flex items-center gap-2">
                    <Check className="h-3.5 w-3.5 text-[#00a855] shrink-0" />
                    <span className="text-xs text-zinc-700">{item.title}</span>
                  </div>
                ))}
              </div>

              <div className="pt-3 border-t border-zinc-200/70 mb-4">
                <p className="text-xs font-bold text-zinc-500 mb-0.5">Package Price</p>
                <p className="text-2xl font-black text-[#00a855]">₱{(app.amount_php ?? pkg.amount_php).toLocaleString()}</p>
                <p className="text-xs text-zinc-400">One-time payment</p>
              </div>

              <div className="flex items-start gap-2 rounded-lg bg-blue-50 border border-blue-100 p-3 mb-4">
                <Info className="h-3.5 w-3.5 text-blue-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-blue-700 mb-0.5">What happens next?</p>
                  <p className="text-[11px] text-blue-600 leading-relaxed">
                    Our editorial team will review your submission. If approved, you&apos;ll receive an email with the next steps and payment details.
                  </p>
                </div>
              </div>

              {!locked && (
                <div className="space-y-2">
                  {app.status === 'draft' ? (
                    <>
                      <button onClick={handleSaveDraft} disabled={saving || submitting} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-zinc-300 bg-white text-sm font-bold text-zinc-700 hover:bg-zinc-50 disabled:opacity-60 transition-colors">
                        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <><FileBadge2 className="h-3.5 w-3.5" /> Save Draft</>}
                      </button>
                      <button onClick={handleSubmitForReview} disabled={saving || submitting} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#0a3a22] text-white text-sm font-bold hover:bg-[#042212] disabled:opacity-60 transition-colors">
                        {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Send className="h-3.5 w-3.5" /> Submit Application</>}
                      </button>
                    </>
                  ) : (
                    <button onClick={handleSaveChanges} disabled={saving} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#0a3a22] text-white text-sm font-bold hover:bg-[#042212] disabled:opacity-60 transition-colors">
                      {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save Changes'}
                    </button>
                  )}
                </div>
              )}
            </div>
            )}

            {/* Need to make more changes — summary view only */}
            {view === 'summary' && (
              <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5">
                <div className="flex items-start gap-2.5 mb-3">
                  <Info className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
                  <p className="text-sm font-bold text-blue-700">Need to make more changes?</p>
                </div>
                <p className="text-xs text-blue-600 leading-relaxed mb-3">
                  You can edit your information anytime before your application is approved.
                </p>
                <button type="button" onClick={() => setView('edit')} className="inline-flex items-center gap-1 text-xs font-bold text-blue-700 hover:underline">
                  Edit Application <ArrowUpRight className="h-3 w-3" />
                </button>
              </div>
            )}

            {/* What Happens Next — only once they've engaged beyond the initial draft */}
            {app.status !== 'draft' && (
              <div className="rounded-2xl border border-zinc-200 bg-white p-5">
                <p className="text-sm font-black text-zinc-900 mb-4">What Happens Next</p>
                <div className="space-y-0">
                  {NEXT_STEPS.map((step, i) => {
                    const current = currentStepIndex(app.status)
                    const isDone = i < current || app.status === 'published'
                    const isActive = i === current && app.status !== 'published'
                    return (
                      <div key={step.title} className="flex gap-3">
                        <div className="flex flex-col items-center shrink-0">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                            isDone ? 'bg-[#0a3a22]' : isActive ? 'bg-[#00cc6a]' : 'bg-zinc-100'
                          }`}>
                            {isDone ? (
                              <CheckCircle2 className="h-3 w-3 text-white" />
                            ) : (
                              <step.icon className={`h-3 w-3 ${isActive ? 'text-black' : 'text-zinc-400'}`} />
                            )}
                          </div>
                          {i < NEXT_STEPS.length - 1 && <div className="w-px flex-1 bg-zinc-200 my-1" />}
                        </div>
                        <div className="pb-4">
                          <p className={`text-xs font-bold mb-0.5 ${isActive ? 'text-zinc-900' : isDone ? 'text-zinc-700' : 'text-zinc-400'}`}>
                            {step.title} {isActive && <span className="text-[9px] font-bold uppercase text-[#00a855] ml-1">You are here</span>}
                          </p>
                          <p className={`text-[11px] leading-relaxed ${isActive ? 'text-zinc-500' : 'text-zinc-400'}`}>{step.desc}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            <div className="rounded-2xl border border-zinc-200 bg-white p-5">
              <p className="text-sm font-black text-zinc-900 mb-1">Need help?</p>
              <p className="text-xs text-zinc-500 leading-relaxed mb-4">
                We&apos;re here to help you showcase your story. Contact us and we&apos;ll get back to you.
              </p>
              <a
                href="mailto:amiananventures@gmail.com"
                className="inline-flex items-center justify-center gap-2 border border-zinc-300 text-zinc-700 px-4 py-2.5 rounded-lg font-bold text-sm hover:bg-zinc-50 transition-colors w-full"
              >
                <Headset className="h-3.5 w-3.5" /> Contact Support
              </a>
            </div>
          </div>
        </div>

        {/* Secure & Confidential footer banner */}
        <div className="mt-6 flex items-center justify-between gap-4 flex-wrap rounded-2xl border border-[#00a855]/20 bg-[#00a855]/5 p-5">
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-5 w-5 text-[#00a855] shrink-0" />
            <div>
              <p className="text-sm font-bold text-zinc-900">Secure &amp; Confidential</p>
              <p className="text-xs text-zinc-500 mt-0.5">
                Your information and assets are safe with us. We only use them to create your feature and never share without your permission.
              </p>
            </div>
          </div>
          <Link
            href="/share-your-story"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-zinc-300 bg-white text-zinc-700 text-xs font-bold hover:bg-zinc-50 transition-colors shrink-0"
          >
            <FileEdit className="h-3.5 w-3.5" /> View Content Guidelines
          </Link>
        </div>
      </div>
    </div>
  )
}

function SummaryField({
  icon: Icon, label, value,
}: { icon: LucideIcon; label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2.5">
      <div className="w-7 h-7 rounded-lg bg-[#00a855]/10 flex items-center justify-center shrink-0 mt-0.5">
        <Icon className="h-3.5 w-3.5 text-[#00a855]" />
      </div>
      <div>
        <p className="text-xs font-bold text-zinc-900">{label}</p>
        <p className="text-xs text-zinc-500 mt-0.5">{value}</p>
      </div>
    </div>
  )
}

function SectionCard({
  number, icon: Icon, title, children,
}: { number: number; icon: LucideIcon; title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-7">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-6 h-6 rounded-full bg-[#0a3a22] text-white flex items-center justify-center text-xs font-black shrink-0">
          {number}
        </div>
        <p className="text-sm font-black text-zinc-900 flex-1">{title}</p>
        <div className="w-8 h-8 rounded-lg bg-[#00a855]/10 flex items-center justify-center shrink-0">
          <Icon className="h-4 w-4 text-[#00a855]" />
        </div>
      </div>
      {children}
    </div>
  )
}

function Field({
  label, value, onChange, type = 'text', required, disabled, placeholder,
}: { label: string; value: string; onChange: (v: string) => void; type?: string; required?: boolean; disabled?: boolean; placeholder?: string }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-zinc-700 mb-1.5">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <input
        type={type}
        required={required}
        disabled={disabled}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-zinc-300 px-4 py-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#00cc6a]/40 focus:border-[#00cc6a] disabled:bg-zinc-50 disabled:text-zinc-400 transition-colors"
      />
    </div>
  )
}

function AssetUpload({
  label, hint, required, disabled, field, onUpload, onClear,
}: {
  label: string
  hint?: string
  required?: boolean
  disabled?: boolean
  field: FileField
  onUpload: (file: File) => void
  onClear: () => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  return (
    <div>
      <label className="block text-sm font-semibold text-zinc-700 mb-1.5">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      {hint && <p className="text-xs text-zinc-400 mb-2">{hint}</p>}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0]
          if (f) onUpload(f)
          e.target.value = ''
        }}
      />

      {field.url ? (
        <div className="flex items-center gap-3 p-3 rounded-lg border border-green-200 bg-green-50">
          <ImageIcon className="h-4 w-4 text-green-600 shrink-0" />
          <span className="text-xs text-green-700 font-medium truncate flex-1">Uploaded</span>
          {!disabled && (
            <button type="button" onClick={onClear} className="text-zinc-400 hover:text-red-500 transition-colors">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={disabled || field.uploading}
          className="w-full cursor-pointer rounded-lg border-2 border-dashed border-zinc-300 hover:border-[#00cc6a] transition-colors px-4 py-6 text-center disabled:opacity-60"
        >
          {field.uploading ? (
            <div className="flex items-center justify-center gap-2 text-sm text-zinc-500">
              <Loader2 className="h-4 w-4 animate-spin" /> Uploading…
            </div>
          ) : (
            <>
              <Upload className="h-5 w-5 text-zinc-300 mx-auto mb-1.5" />
              <p className="text-sm text-zinc-500">Click to upload</p>
              <p className="text-xs text-zinc-400 mt-0.5">JPG, PNG, WEBP — max 5 MB</p>
            </>
          )}
        </button>
      )}
    </div>
  )
}

function SelectField({
  label, value, onChange, options, required, disabled,
}: { label: string; value: string; onChange: (v: string) => void; options: string[]; required?: boolean; disabled?: boolean }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-zinc-700 mb-1.5">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <select
        required={required}
        disabled={disabled}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-zinc-300 px-4 py-3 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-[#00cc6a]/40 focus:border-[#00cc6a] disabled:bg-zinc-50 disabled:text-zinc-400 transition-colors bg-white"
      >
        <option value="">Select…</option>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  )
}

function TextareaField({
  label, value, onChange, maxLength, required, disabled, placeholder,
}: { label: string; value: string; onChange: (v: string) => void; maxLength: number; required?: boolean; disabled?: boolean; placeholder?: string }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label className="text-sm font-semibold text-zinc-700">{label} {required && <span className="text-red-400">*</span>}</label>
        <span className="text-xs text-zinc-400">{value.length}/{maxLength}</span>
      </div>
      <textarea
        required={required}
        disabled={disabled}
        rows={3}
        maxLength={maxLength}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-zinc-300 px-4 py-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#00cc6a]/40 focus:border-[#00cc6a] disabled:bg-zinc-50 disabled:text-zinc-400 transition-colors resize-none"
      />
    </div>
  )
}
