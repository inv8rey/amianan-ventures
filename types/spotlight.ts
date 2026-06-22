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
  | 'cancelled'

export type PaymentMethod = 'gcash' | 'maya' | 'bdo' | 'bpi' | 'unionbank'

export type StoryQuestionKey = 'q1' | 'q2' | 'q3' | 'q4' | 'q5' | 'q6' | 'q7' | 'q8' | 'q9' | 'q10' | 'q11'

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
  package: PackageId
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
  cancelled: 'Cancelled',
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
  cancelled: 'bg-zinc-500/15 text-zinc-400',
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

export type PackageId = 'founding-rate' | 'ecosystem-visibility'

// Both packages share the same application table/flow (the `package`
// column is a free-form string, not constrained to one value) — they
// differ only in name, price, and a couple of field labels in the form.
export const PACKAGES: Record<PackageId, { id: PackageId; name: string; badge: string; amount_php: number }> = {
  'founding-rate': {
    id: 'founding-rate',
    name: 'Startup Spotlight Package',
    badge: 'Founding Rate',
    amount_php: 599,
  },
  'ecosystem-visibility': {
    id: 'ecosystem-visibility',
    name: 'Ecosystem Visibility Package',
    badge: 'Founding Rate',
    amount_php: 799,
  },
}

export function isPackageId(value: string | null | undefined): value is PackageId {
  return value === 'founding-rate' || value === 'ecosystem-visibility'
}

export interface StoryQuestion {
  key: StoryQuestionKey
  label: string
  placeholder: string
  required: boolean
}

// Canonical story questions per package — same set used on the public
// /share-your-story founder track and on the /spotlight application form,
// so the question bank never drifts between the two entry points.
export const STORY_SETS: Record<PackageId, StoryQuestion[]> = {
  'founding-rate': [
    { key: 'q1', label: 'How did your business or startup begin?', placeholder: 'Tell us the story behind how it started. What inspired you to build it?', required: true },
    { key: 'q2', label: 'What problem are you trying to solve?', placeholder: 'What challenge, need, or opportunity made you decide to start this business or project?', required: true },
    { key: 'q3', label: 'What do you do?', placeholder: 'Tell us about your product, service, or solution and how it helps your customers or community.', required: true },
    { key: 'q4', label: 'What have you achieved so far?', placeholder: "Share any milestones, customers, partnerships, awards, grants, events, sales, or accomplishments you're proud of.", required: false },
    { key: 'q5', label: "What has been the biggest challenge you've faced?", placeholder: 'What has been the hardest part of building your business or startup, and how did you overcome it?', required: true },
    { key: 'q6', label: 'What keeps you motivated?', placeholder: 'What inspires you to keep going, especially during difficult times?', required: true },
    { key: 'q7', label: 'What are your goals for the next 6 to 12 months?', placeholder: 'What are you working toward, and what would success look like for you?', required: true },
    { key: 'q8', label: "What is one lesson you've learned from your journey so far?", placeholder: 'Something you wish you knew earlier or something that might help other entrepreneurs.', required: false },
    { key: 'q9', label: 'What advice would you give someone who wants to start a business or startup?', placeholder: 'Share a piece of advice for aspiring entrepreneurs, founders, or innovators.', required: true },
    { key: 'q10', label: 'Where can people find or support you?', placeholder: 'Share your website, Facebook page, social media accounts, email, or other contact details.', required: false },
    { key: 'q11', label: "Is there anything else you'd like people to know about your journey?", placeholder: "Feel free to share a story, lesson, challenge, or message that wasn't covered above.", required: false },
  ],
  'ecosystem-visibility': [
    { key: 'q1', label: 'How did this organization begin?', placeholder: 'Tell us the story of how your organization or program started.', required: true },
    { key: 'q2', label: 'What problem are you solving?', placeholder: 'Describe the gap or problem your organization is addressing.', required: true },
    { key: 'q3', label: 'What impact are you creating?', placeholder: 'What change are you making for your community, sector, or the ecosystem?', required: true },
    { key: 'q4', label: 'What would you like people to know about your work?', placeholder: 'Share any message, milestone, or vision you want our community to know.', required: false },
  ],
}
