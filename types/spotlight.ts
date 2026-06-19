export type SpotlightStatus =
  | 'draft'
  | 'submitted'
  | 'under_review'
  | 'approved'
  | 'rejected'
  | 'awaiting_payment'
  | 'payment_submitted'
  | 'paid'
  | 'in_production'
  | 'published'

export type PaymentMethod = 'gcash' | 'maya' | 'bdo' | 'bpi' | 'unionbank'

export interface SpotlightApplication {
  id: string
  contributor_id: string
  business_name: string
  contact_name: string
  email: string
  phone: string | null
  website: string | null
  industry: string | null
  region: string | null
  what_you_do: string | null
  problem: string | null
  impact: string | null
  why_feature: string | null
  package: string
  amount_php: number
  status: SpotlightStatus
  payment_method: PaymentMethod | null
  payment_reference: string | null
  payment_proof_url: string | null
  editor_notes: string | null
  published_url: string | null
  submitted_at: string | null
  reviewed_at: string | null
  payment_submitted_at: string | null
  paid_at: string | null
  published_at: string | null
  created_at: string
  updated_at: string
}

export const STATUS_LABELS: Record<SpotlightStatus, string> = {
  draft: 'Draft',
  submitted: 'Submitted',
  under_review: 'Under Review',
  approved: 'Approved',
  rejected: 'Rejected',
  awaiting_payment: 'Awaiting Payment',
  payment_submitted: 'Payment Submitted',
  paid: 'Paid',
  in_production: 'In Production',
  published: 'Published',
}

export const STATUS_COLORS: Record<SpotlightStatus, string> = {
  draft: 'bg-zinc-500/15 text-zinc-500',
  submitted: 'bg-blue-500/15 text-blue-400',
  under_review: 'bg-amber-500/15 text-amber-400',
  approved: 'bg-emerald-500/15 text-emerald-400',
  rejected: 'bg-red-500/15 text-red-400',
  awaiting_payment: 'bg-orange-500/15 text-orange-400',
  payment_submitted: 'bg-amber-500/15 text-amber-400',
  paid: 'bg-emerald-500/15 text-emerald-400',
  in_production: 'bg-purple-500/15 text-purple-400',
  published: 'bg-[#00a855]/15 text-[#00a855]',
}

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  gcash: 'GCash',
  maya: 'Maya',
  bdo: 'BDO',
  bpi: 'BPI',
  unionbank: 'UnionBank',
}

// Statuses where the applicant can still edit business/story fields.
// Locking only happens once admin marks the application "In Production".
export const EDITABLE_STATUSES: SpotlightStatus[] = [
  'draft', 'submitted', 'under_review', 'approved', 'rejected',
  'awaiting_payment', 'payment_submitted', 'paid',
]

export const INDUSTRIES = [
  'AgriTech', 'EdTech', 'HealthTech', 'FinTech', 'E-Commerce',
  'Tourism & Hospitality', 'Creative Industries', 'GovTech',
  'Climate / GreenTech', 'Social Enterprise', 'Other',
]

export const SPOTLIGHT_PACKAGE = {
  id: 'founding-rate',
  label: 'Founding Rate',
  amount_php: 1999,
}
