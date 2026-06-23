export type ResourceStatus = 'published' | 'coming_soon'

export interface FounderResource {
  id: string
  title: string
  description: string | null
  category: string
  format: string
  editable: boolean
  file_url: string | null
  status: ResourceStatus
  featured: boolean
  sort_order: number
  download_count: number
  created_at: string
  updated_at: string
}

export interface FounderResourceFormData {
  title: string
  description: string
  category: string
  format: string
  editable: boolean
  file_url: string | null
  status: ResourceStatus
  featured: boolean
  sort_order: number
}

export const RESOURCE_CATEGORIES = [
  'Startup Planning',
  'Fundraising',
  'Marketing & Sales',
  'Legal & Compliance',
  'Operations',
  'Other',
] as const

export const RESOURCE_FORMATS = ['PDF', 'DOCX', 'XLSX', 'PPTX', 'ZIP'] as const
