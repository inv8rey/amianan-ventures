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

export type StoryQuestionKey = 'q1' | 'q2' | 'q3' | 'q4' | 'q5' | 'q6' | 'q7' | 'q8'

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
  role: string | null
  social_link: string | null
  story_answers: Partial<Record<StoryQuestionKey, string>> | null
  founder_photo_url: string | null
  startup_logo_url: string | null
  product_photo_url: string | null
  promo: string | null
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

// Same questions used on the public /share-your-story submission form —
// the Get Featured package produces this same feature story, so the
// application collects identical story inputs.
export const STORY_QUESTIONS: { key: StoryQuestionKey; label: string }[] = [
  { key: 'q1', label: 'How did the idea for your startup begin?' },
  { key: 'q2', label: 'What problem are you trying to solve?' },
  { key: 'q3', label: 'What does your startup actually do?' },
  { key: 'q4', label: 'What have you built or done so far?' },
  { key: 'q5', label: 'What has been the biggest challenge in building your startup?' },
  { key: 'q6', label: 'What keeps you motivated to continue building this startup?' },
  { key: 'q7', label: 'What are you working toward in the next 6 to 12 months?' },
  { key: 'q8', label: 'What advice would you give someone starting their first startup in the region?' },
]

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
  amount_php: 599,
}

// Display-only reference for the organizations/programs package on the
// /get-featured marketing page. Applications for this package go through
// the existing /partner inquiry form (form_submissions), not a dedicated
// table — there's no separate review/payment pipeline for it yet.
export const PARTNER_PACKAGE = {
  id: 'ecosystem-visibility',
  label: 'Founding Rate',
  amount_php: 799,
}
