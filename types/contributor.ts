export type ContributorRole =
  | 'founder'
  | 'tbi_staff'
  | 'student'
  | 'ecosystem_builder'
  | 'researcher'
  | 'other'

export type ContentType =
  | 'founder_story'
  | 'opinion_essay'
  | 'program_recap'
  | 'ecosystem_spotlight'
  | 'field_notes'

export type SubmissionStatus =
  | 'submitted'
  | 'under_review'
  | 'revision_requested'
  | 'approved'
  | 'rejected'
  | 'published'

export type DraftType = 'text' | 'gdocs'

export interface ContributorProfile {
  id: string
  full_name: string | null
  display_name: string
  role: ContributorRole | null
  organization: string | null
  region: string | null
  bio: string | null
  photo_url: string | null
  linkedin_url: string | null
  facebook_url: string | null
  website_url: string | null
  created_at: string
  updated_at: string
}

export interface ContributorSubmission {
  id: string
  contributor_id: string
  content_type: ContentType
  headline: string
  summary: string
  region: string | null
  sector: string | null
  draft_type: DraftType
  draft_content: string | null
  gdocs_url: string | null
  status: SubmissionStatus
  revision_notes: string | null
  editor_notes: string | null
  published_url: string | null
  submitted_at: string
  reviewed_at: string | null
  published_at: string | null
  created_at: string
  updated_at: string
  // joined
  contributor_profiles?: ContributorProfile
}

export const CONTENT_TYPE_LABELS: Record<ContentType, string> = {
  founder_story: 'Founder Story',
  opinion_essay: 'Opinion / Essay',
  program_recap: 'Program Recap',
  ecosystem_spotlight: 'Ecosystem Spotlight',
  field_notes: 'Field Notes',
}

export const CONTENT_TYPE_DESCRIPTIONS: Record<ContentType, string> = {
  founder_story: 'Your personal journey building a startup or MSME',
  opinion_essay: 'Your perspective on an ecosystem issue or trend',
  program_recap: 'A recap of an event, program, or initiative you ran or attended',
  ecosystem_spotlight: 'Highlighting an organization, community, or initiative',
  field_notes: 'Research observations or thesis findings relevant to the region',
}

export const STATUS_LABELS: Record<SubmissionStatus, string> = {
  submitted: 'Submitted',
  under_review: 'Under Review',
  revision_requested: 'Revision Requested',
  approved: 'Approved',
  rejected: 'Rejected',
  published: 'Published',
}

export const STATUS_COLORS: Record<SubmissionStatus, string> = {
  submitted: 'bg-blue-500/15 text-blue-400',
  under_review: 'bg-amber-500/15 text-amber-400',
  revision_requested: 'bg-orange-500/15 text-orange-400',
  approved: 'bg-emerald-500/15 text-emerald-400',
  rejected: 'bg-red-500/15 text-red-400',
  published: 'bg-[#00a855]/15 text-[#00a855]',
}

export const ROLE_LABELS: Record<ContributorRole, string> = {
  founder: 'Founder / Co-founder',
  tbi_staff: 'TBI / Incubator Staff',
  student: 'Student / Researcher',
  ecosystem_builder: 'Ecosystem Builder',
  researcher: 'Academic / Researcher',
  other: 'Other',
}

export const SECTORS = [
  'Tech & Innovation',
  'Agriculture & Agri-tech',
  'Tourism & Hospitality',
  'Education',
  'Health & Wellness',
  'Finance & Fintech',
  'Creative Industries',
  'Social Enterprise',
  'Government & Public Sector',
  'Other',
] as const

export const CONTRIBUTOR_REGIONS = [
  { value: 'cordillera', label: 'Cordillera' },
  { value: 'cagayan-valley', label: 'Cagayan Valley' },
  { value: 'ilocos-region', label: 'Ilocos Region' },
  { value: 'pangasinan', label: 'Pangasinan' },
  { value: 'national', label: 'National' },
] as const
