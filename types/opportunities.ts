export type OpportunityCategory =
  | 'funding-grants'
  | 'competition'
  | 'program-incubation'
  | 'events'
  | 'partnerships'
  | 'jobs-fellowships'

export const OPPORTUNITY_CATEGORY_LABELS: Record<OpportunityCategory, string> = {
  'funding-grants': 'Funding & Grants',
  competition: 'Competition',
  'program-incubation': 'Program & Incubation',
  events: 'Events',
  partnerships: 'Partnerships',
  'jobs-fellowships': 'Jobs & Fellowships',
}

/** Short names for filter chips. */
export const OPPORTUNITY_CATEGORY_SHORT: Record<OpportunityCategory, string> = {
  'funding-grants': 'Funding',
  competition: 'Competitions',
  'program-incubation': 'Programs',
  events: 'Events',
  partnerships: 'Partnerships',
  'jobs-fellowships': 'Jobs',
}

export interface Opportunity {
  id: string
  title: string
  slug: string
  category: OpportunityCategory
  organization: string
  summary: string | null
  location: string | null
  deadline: string // ISO timestamptz; display in Asia/Manila
  apply_url: string | null
  cover_image: string | null
  featured: boolean
  status: 'draft' | 'published'
  created_at: string
  updated_at: string
}

export const OPPORTUNITY_TIMEZONE = 'Asia/Manila'
