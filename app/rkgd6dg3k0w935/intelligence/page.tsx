import './intelligence.css'
import { createServiceClient } from '@/lib/supabase/service'
import { getIntelligenceItems } from '@/lib/intelligence'
import { IntelligenceWorkspace } from '@/components/admin/intelligence-workspace'

export const dynamic = 'force-dynamic'

export default async function IntelligencePage() {
  const supabase = createServiceClient()
  const [items, { count: total }, { count: priority }, { count: opportunities }, { count: reviewed }, { data: runs }, { data: sources }] = await Promise.all([
    getIntelligenceItems(),
    supabase.from('intelligence_items').select('id',{count:'exact',head:true}),
    supabase.from('intelligence_items').select('id',{count:'exact',head:true}).gte('relevance_score',80).neq('review_status','dismissed'),
    supabase.from('intelligence_items').select('id',{count:'exact',head:true}).in('stream',['funding','program']).not('deadline_at','is',null).gte('deadline_at',new Date().toISOString()).neq('review_status','dismissed'),
    supabase.from('intelligence_items').select('id',{count:'exact',head:true}).neq('review_status','new'),
    supabase.from('intelligence_scan_runs').select('finished_at,status,items_added,sources_checked,started_at,error').order('started_at',{ascending:false}).limit(5),
    supabase.from('intelligence_sources').select('id,name,url,source_type,enabled,last_checked_at,last_error').order('name').limit(30),
  ])
  return <IntelligenceWorkspace initialItems={items} initialSources={sources ?? []} initialRuns={runs ?? []} initialStats={{total:total??0,priority:priority??0,opportunities:opportunities??0,reviewed:reviewed??0,lastRun:runs?.[0]??null}} />
}
