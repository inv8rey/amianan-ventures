export type Category = 'news' | 'founder-stories'

export type DirectoryType = 'startup' | 'incubator' | 'government' | 'university' | 'community'

export type DirectoryLocation = 'baguio' | 'cordillera' | 'cagayan-valley' | 'ilocos-region' | 'pangasinan' | 'national'

export const DIRECTORY_LOCATIONS: { value: DirectoryLocation; label: string }[] = [
  { value: 'baguio', label: 'Baguio City' },
  { value: 'cordillera', label: 'Cordillera' },
  { value: 'cagayan-valley', label: 'Cagayan Valley' },
  { value: 'ilocos-region', label: 'Ilocos Region' },
  { value: 'pangasinan', label: 'Pangasinan' },
  { value: 'national', label: 'National' },
]

export interface DirectoryEntry {
  id: string
  name: string
  type: DirectoryType
  sector: string | null
  city: string | null
  location: DirectoryLocation | null
  logo_url: string | null
  website: string | null
  featured: boolean
  status: 'published' | 'draft'
  created_at: string
  updated_at: string
}

export type Location =
  | 'cordillera'
  | 'cagayan-valley'
  | 'ilocos-region'
  | 'pangasinan'
  | 'national'

export const LOCATIONS: { value: Location; label: string }[] = [
  { value: 'cordillera', label: 'Cordillera' },
  { value: 'cagayan-valley', label: 'Cagayan Valley' },
  { value: 'ilocos-region', label: 'Ilocos Region' },
  { value: 'pangasinan', label: 'Pangasinan' },
  { value: 'national', label: 'National' },
]

export interface Article {
  id: string
  title: string
  slug: string
  excerpt: string
  content: string
  category: Category
  location: Location | null
  author: string
  cover_image: string | null
  tags: string[]
  status: 'draft' | 'published' | 'scheduled'
  featured: boolean
  published_at: string | null
  created_at: string
  updated_at: string
}

export interface Event {
  id: string
  title: string
  slug: string
  description: string
  content: string
  date: string
  end_date: string | null
  location: string
  event_url: string | null
  cover_image: string | null
  status: 'draft' | 'published'
  created_at: string
  updated_at: string
}

export interface NewsletterSubscriber {
  id: string
  email: string
  status: 'active' | 'unsubscribed'
  source: string | null
  created_at: string
}

export type FormSubmissionType = 'startup' | 'partner' | 'founder-story'

export interface FormSubmission {
  id: string
  type: FormSubmissionType
  name: string
  email: string
  organization: string | null
  message: string
  extra_data: Record<string, string> | null
  status: 'new' | 'reviewed' | 'archived'
  created_at: string
}

export interface FeaturedListing {
  id: string
  title: string
  tagline: string | null
  description: string | null
  image_url: string | null
  cta_url: string | null
  sponsor_label: string
  display_order: number
  status: 'draft' | 'published'
  created_at: string
  updated_at: string
}

export interface ArticleFormData {
  title: string
  slug: string
  excerpt: string
  content: string
  category: Category
  location: Location | null
  author: string
  cover_image: string | null
  tags: string[]
  status: 'draft' | 'published' | 'scheduled'
  featured: boolean
  published_at: string | null
}

export interface EventFormData {
  title: string
  slug: string
  description: string
  content: string
  date: string
  end_date: string | null
  location: string
  event_url: string | null
  cover_image: string | null
  status: 'draft' | 'published'
}
