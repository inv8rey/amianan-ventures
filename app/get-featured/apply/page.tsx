import type { Metadata } from 'next'
import { ApplyWizard } from '@/components/site/ApplyWizard'

export const metadata: Metadata = {
  title: 'Apply to Get Featured — Amianan Ventures',
  description: 'Tell us about your business and apply to be featured by Amianan Ventures.',
}

export default function GetFeaturedApplyPage() {
  return <ApplyWizard />
}
