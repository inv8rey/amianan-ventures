'use client'

import { useEffect, useMemo, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Activity, ArrowUpRight, Bell, CalendarDays, Check, ChevronDown, CircleDot, ExternalLink, Filter, Globe2, Handshake, LayoutDashboard, LoaderCircle, Menu, Newspaper, Search, Send, Sparkles, Target, Wallet, X } from 'lucide-react'
import type { IntelligenceItem } from '@/lib/intelligence'

type Stats = { total: number; priority: number; opportunities: number; reviewed: number; lastRun: { finished_at: string | null; status: string; items_added: number } | null }
type Source = { id:string; name:string; url:string; source_type:string; enabled:boolean; last_checked_at:string|null; last_error:string|null }
type ScanRun = { finished_at:string|null; started_at:string; status:string; items_added:number; sources_checked:number; error:string|null }
const streams = [{ key:'all', label:'All findings', icon:LayoutDashboard },{ key:'opportunities', label:'Opportunities', icon:CalendarDays },{ key:'client', label:'Client leads', icon:Target },{ key:'funding', label:'Funding', icon:Wallet },{ key:'program', label:'Programs', icon:Sparkles },{ key:'news', label:'News', icon:Newspaper },{ key:'partnership', label:'Partnerships', icon:Handshake }]
const statuses = ['all','new','saved','in_progress','actioned','dismissed']
const statusLabel: Record<string,string> = {new:'New',saved:'Saved',in_progress:'In progress',actioned:'Actioned',dismissed:'Dismissed'}
const actionColor: Record<string,string> = {APPLY:'amber',CONTACT:'lime',PARTNER:'violet',PUBLISH:'blue',MONITOR:'slate',IGNORE:'slate'}
const regionOrder = ['Northern Luzon','Philippines','ASEAN','Global']

function scoreTone(score:number) { return score >= 80 ? 'lime' : score >= 60 ? 'amber' : score >= 40 ? 'blue' : 'slate' }
function relativeDate(date:string|null) { if (!date) return 'Date not listed'; const days = Math.floor((Date.now()-new Date(date).getTime())/86400000); if (days <= 0) return 'Today'; if (days === 1) return 'Yesterday'; if (days < 7) return `${days} days ago`; return new Date(date).toLocaleDateString('en-PH',{month:'short',day:'numeric'}) }

export function IntelligenceWorkspace({ initialItems, initialSources, initialRuns, initialStats }: { initialItems: IntelligenceItem[]; initialSources: Source[]; initialRuns: ScanRun[]; initialStats: Stats }) {
  const router = useRouter()
  const [items,setItems] = useState(initialItems)
  const [stats,setStats] = useState(initialStats)
  const [sources,setSources] = useState(initialSources)
  const [runs,setRuns] = useState(initialRuns)
  const [active,setActive] = useState('all')
  const [status,setStatus] = useState('all')
  const [region,setRegion] = useState('All regions')
  const [search,setSearch] = useState('')
  const [selected,setSelected] = useState<IntelligenceItem|null>(null)
  const [notice,setNotice] = useState('')
  const [working,setWorking] = useState(false)
  const [publishing,setPublishing] = useState(false)
  const [publishedOpportunity,setPublishedOpportunity] = useState<{itemId:string;path:string}|null>(null)
  const [isPending,startTransition] = useTransition()
  const [mobileNav,setMobileNav] = useState(false)

  useEffect(() => { setItems(initialItems); setStats(initialStats); setSources(initialSources); setRuns(initialRuns) }, [initialItems,initialStats,initialSources,initialRuns])

  const visible = useMemo(() => items.filter(item => (active === 'all' || (active === 'opportunities' ? item.tags.includes('opportunity-candidate') : item.stream === active)) && (status === 'all' || item.review_status === status) && (region === 'All regions' || item.region === region) && (!search || `${item.title} ${item.summary} ${item.organization ?? ''} ${item.tags.join(' ')}`.toLowerCase().includes(search.toLowerCase()))), [items,active,status,region,search])
  const freshCount = items.filter(i => i.review_status === 'new').length
  const counts = useMemo(() => Object.fromEntries(streams.map(s => [s.key, s.key === 'all' ? items.length : s.key === 'opportunities' ? items.filter(i => i.tags.includes('opportunity-candidate')).length : items.filter(i => i.stream === s.key).length])), [items])

  async function updateStatus(item:IntelligenceItem,nextStatus:string,note?:string) {
    let response: Response
    try { response = await fetch('/api/intelligence/review',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({itemId:item.id,status:nextStatus,note})}) } catch { setNotice('Network error. The review update was not saved.'); return }
    if(!response.ok) { setNotice('Could not save the review update.'); return }
    setItems(current=>current.map(row=>row.id===item.id?{...row,review_status:nextStatus}:row))
    setSelected(current=>current?.id===item.id?{...current,review_status:nextStatus}:current)
    setStats(current=>({...current,reviewed:current.reviewed+(item.review_status==='new'&&nextStatus!=='new'?1:0)}))
    setNotice(`Finding marked ${statusLabel[nextStatus]?.toLowerCase() ?? nextStatus}.`)
    setTimeout(()=>setNotice(''),2600)
  }

  async function publishOpportunity(item:IntelligenceItem) {
    setPublishing(true)
    try {
      const response = await fetch('/api/intelligence/publish-opportunity',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({itemId:item.id})})
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Could not publish opportunity')
      const path = result.publicPath as string
      setPublishedOpportunity({itemId:item.id,path})
      setItems(current=>current.map(row=>row.id===item.id?{...row,review_status:'actioned'}:row))
      setSelected(current=>current?.id===item.id?{...current,review_status:'actioned'}:current)
      setNotice(result.alreadyPublished?'This source is already live in Opportunities.':'Opportunity is live on the public Opportunities page.')
      startTransition(()=>router.refresh())
    } catch(e) { setNotice(e instanceof Error?e.message:'Could not publish opportunity') }
    finally { setPublishing(false); setTimeout(()=>setNotice(''),7000) }
  }

  async function runScan() {
    setWorking(true); setNotice('Scanning public sources…')
    try {
      const response=await fetch('/api/intelligence/scan',{method:'POST'})
      const result=await response.json()
      if(!response.ok) throw new Error(result.error||'Scan failed')
      setNotice(result.errors?.length ? `Scan finished with ${result.errors.length} warning(s) · ${result.added} new findings` : `Scan complete · ${result.added} new findings from ${result.sourcesChecked} sources`)
      startTransition(()=>router.refresh())
    } catch(e) { setNotice(e instanceof Error?e.message:'Scan failed') } finally { setWorking(false); setTimeout(()=>setNotice(''),6500) }
  }

  return <div className="intel-shell">
    <aside className={`intel-sidebar ${mobileNav?'is-open':''}`}>
      <div className="intel-brand"><div className="intel-mark">A<span>.</span></div><div><div className="intel-brand-name">AMIANAN</div><div className="intel-brand-caption">VENTURES · INTELLIGENCE</div></div><button className="intel-icon-button intel-mobile-close" onClick={()=>setMobileNav(false)} aria-label="Close navigation"><X size={17}/></button></div>
      <div className="intel-workspace-tag"><span className="intel-live-dot"/> INTERNAL WORKSPACE</div>
      <div className="intel-nav-heading">WORKSPACE</div>
      <nav className="intel-nav">{streams.map((stream,index)=>{const Icon=stream.icon;return <button key={stream.key} onClick={()=>{setActive(stream.key);setMobileNav(false)}} className={`intel-nav-item ${active===stream.key?'is-active':''}`}><Icon size={17}/><span>{stream.label}</span><span className="intel-nav-count">{counts[stream.key] ?? 0}</span>{index===1&&stream.key==='client'&&null}</button>})}</nav>
      <div className="intel-sidebar-spacer"/>
      <div className="intel-region-card"><div className="intel-region-globe"><Globe2 size={16}/></div><div><div className="intel-region-title">REGIONAL FOCUS</div><div className="intel-region-list">Northern Luzon <span>→</span> Philippines <span>→</span> ASEAN</div></div></div>
      <div className="intel-sidebar-footer"><div className="intel-avatar">AV</div><div className="intel-user-meta"><strong>Amianan Ventures</strong><span>Private intelligence</span></div><CircleDot size={14} className="intel-footer-status"/></div>
    </aside>
    {mobileNav&&<button className="intel-nav-backdrop" onClick={()=>setMobileNav(false)} aria-label="Close navigation overlay"/>}

    <main className="intel-main">
      <header className="intel-topbar"><button className="intel-icon-button intel-mobile-menu" onClick={()=>setMobileNav(true)} aria-label="Open navigation"><Menu size={19}/></button><div className="intel-breadcrumb"><span>Amianan Ventures</span><span className="intel-crumb-slash">/</span><strong>Intelligence</strong></div><div className="intel-topbar-right"><span className="intel-privacy"><span/> PRIVATE & SECURE</span><button className="intel-icon-button intel-bell" aria-label={`${freshCount} new findings`}><Bell size={17}/>{freshCount>0&&<i/>}</button><div className="intel-top-avatar">AV</div></div></header>

      <div className="intel-content">
        <section className="intel-greeting"><div><div className="intel-eyebrow"><span/> YOUR DAILY BRIEFING <span className="intel-eyebrow-date">{new Date().toLocaleDateString('en-PH',{weekday:'long',month:'long',day:'numeric'})}</span></div><h1>Your intelligence, <span>in focus.</span></h1><p>Public signals for decisions across your innovation landscape.</p></div><button className="intel-scan-button" onClick={runScan} disabled={working||isPending}>{working?<LoaderCircle size={16} className="intel-spin"/>:<Activity size={16}/>}<span>{working?'Scanning sources…':'Run intelligence scan'}</span><span className="intel-scan-shortcut">↗</span></button></section>

        <section className="intel-metrics"><div className="intel-metric-card"><div className="intel-metric-top"><span>TOTAL FINDINGS</span><div className="intel-metric-icon mint"><LayoutDashboard size={16}/></div></div><div className="intel-metric-value">{stats.total}<span className="intel-metric-unit"> items</span></div><div className="intel-metric-note"><span className="intel-trend">↗</span> Across five intelligence streams</div><div className="intel-sparkline"><i style={{height:'32%'}}/><i style={{height:'45%'}}/><i style={{height:'38%'}}/><i style={{height:'62%'}}/><i style={{height:'51%'}}/><i style={{height:'78%'}}/><i style={{height:'68%'}}/><i style={{height:'92%'}}/><i style={{height:'74%'}}/><i style={{height:'100%'}}/></div></div>
          <div className="intel-metric-card"><div className="intel-metric-top"><span>HIGH PRIORITY</span><div className="intel-metric-icon amber"><Sparkles size={16}/></div></div><div className="intel-metric-value">{stats.priority}<span className="intel-metric-unit"> findings</span></div><div className="intel-metric-note"><span className="intel-note-dot amber-dot"/> Score of 80 or above</div><div className="intel-mini-bars"><i style={{height:'39%'}}/><i style={{height:'52%'}}/><i style={{height:'34%'}}/><i style={{height:'69%'}}/><i style={{height:'56%'}}/><i style={{height:'79%'}}/><i style={{height:'64%'}}/><i style={{height:'100%'}}/><i style={{height:'83%'}}/></div></div>
          <div className="intel-metric-card"><div className="intel-metric-top"><span>OPEN OPPORTUNITIES</span><div className="intel-metric-icon blue"><CalendarDays size={16}/></div></div><div className="intel-metric-value">{stats.opportunities}<span className="intel-metric-unit"> active</span></div><div className="intel-metric-note"><span className="intel-note-dot blue-dot"/> Funding, programs & calls</div><div className="intel-opportunity-dots"><i/><i/><i/><i/><i/><i/><i/><i/><i/><i/><i/><i/><i/><i/><i/><i/><i/><i/><i/><i/><i/><i/><i/><i/><i/><i/><i/><i/></div></div>
          <div className="intel-metric-card"><div className="intel-metric-top"><span>REVIEWED FINDINGS</span><div className="intel-metric-icon violet"><Check size={16}/></div></div><div className="intel-metric-value">{stats.reviewed}<span className="intel-metric-unit"> reviewed</span></div><div className="intel-metric-note"><span className="intel-note-dot violet-dot"/> Human review captured</div><div className="intel-review-progress"><div><span style={{width:`${Math.min(100,stats.total?stats.reviewed/stats.total*100:0)}%`}}/></div><b>{stats.total?Math.round(stats.reviewed/stats.total*100):0}%</b></div></div>
        </section>

        <section className="intel-brief-card"><div className="intel-brief-icon"><Sparkles size={17}/></div><div className="intel-brief-copy"><div className="intel-brief-title">TODAY’S SIGNAL <span className="intel-ai-chip"><Sparkles size={10}/> INTELLIGENCE BRIEF</span></div><p>{stats.lastRun?`Last scan ${stats.lastRun.finished_at?relativeDate(stats.lastRun.finished_at).toLowerCase():'recently'} · ${stats.lastRun.items_added} new items added. Review the highest scoring findings below and capture any next steps.`:'Your intelligence workspace is ready. Run the first scan to collect public announcements and news. Scores are decision-support signals; verify deadlines and eligibility at the original source.'}</p></div><button onClick={()=>setActive('all')} className="intel-brief-link">View briefing <ArrowUpRight size={14}/></button></section>

        <section className="intel-findings-section"><div className="intel-section-header"><div><div className="intel-section-title-row"><h2>Priority findings</h2><span className="intel-new-pill">{freshCount} NEW</span></div><p>Public signals, reviewed for relevance to Amianan Ventures</p></div><button className="intel-view-all" onClick={()=>{setActive('all');setStatus('all')}}>View all findings <ArrowUpRight size={14}/></button></div>
          <div className="intel-toolbar"><div className="intel-tabs">{streams.map(stream=><button key={stream.key} onClick={()=>setActive(stream.key)} className={active===stream.key?'is-active':''}>{stream.label}{stream.key==='all'&&<span>{items.length}</span>}</button>)}</div><div className="intel-filters"><label className="intel-search"><Search size={15}/><input placeholder="Search signals..." value={search} onChange={e=>setSearch(e.target.value)}/>{search&&<button onClick={()=>setSearch('')} aria-label="Clear search"><X size={13}/></button>}</label><label className="intel-select-wrap"><Filter size={14}/><select value={status} onChange={e=>setStatus(e.target.value)} aria-label="Filter by review status">{statuses.map(s=><option key={s} value={s}>{s==='all'?'All status':statusLabel[s]}</option>)}</select><ChevronDown size={13}/></label><label className="intel-select-wrap intel-region-select"><Globe2 size={14}/><select value={region} onChange={e=>setRegion(e.target.value)} aria-label="Filter by region">{['All regions',...regionOrder].map(r=><option key={r}>{r}</option>)}</select><ChevronDown size={13}/></label></div></div>

          <div className="intel-table-wrap"><table className="intel-table"><thead><tr><th>FINDING</th><th>STREAM</th><th>REGION</th><th>RELEVANCE</th><th>DETECTED</th><th>STATUS</th><th/></tr></thead><tbody>{visible.length?visible.map(item=><tr key={item.id} onClick={()=>setSelected(item)} className="intel-finding-row"><td><div className="intel-finding-title">{item.title}{item.tags.includes('opportunity-candidate')&&<span className="intel-ready-pill">OPPORTUNITY</span>}</div><div className="intel-finding-meta">{item.organization&&<><span>{item.organization}</span><i>·</i></>}<span>{item.source_title}</span></div></td><td><span className={`intel-stream-tag stream-${item.stream}`}>{item.stream}</span></td><td><span className="intel-region-cell"><i/>{item.region}</span></td><td><span className={`intel-score score-${scoreTone(item.relevance_score)}`}>{item.relevance_score}<small>/100</small></span></td><td className="intel-date-cell">{relativeDate(item.published_at||item.discovered_at)}</td><td><span className={`intel-status status-${item.review_status}`}>{statusLabel[item.review_status]??item.review_status}</span></td><td><button className="intel-row-open" onClick={e=>{e.stopPropagation();setSelected(item)}} aria-label="Open finding"><ArrowUpRight size={15}/></button></td></tr>):<tr><td colSpan={7}><div className="intel-empty"><div><Search size={19}/></div><strong>{items.length?'No findings match these filters':'Your intelligence feed is ready'}</strong><span>{items.length?'Try a different stream or search term.':'Run a scan to discover relevant public information.'}</span>{!items.length&&<button onClick={runScan} disabled={working}>{working?'Scanning…':'Run first scan'}</button>}</div></td></tr>}</tbody></table></div>
          <div className="intel-table-footer"><span>Showing <b>{visible.length}</b> of <b>{items.length}</b> findings</span><span>Scores support review · always verify at the source</span></div>
        </section>

        <section className="intel-ops-grid">
          <div className="intel-ops-card"><div className="intel-ops-head"><div><h2>Monitored sources</h2><p>Source health and last successful checks</p></div><span>{sources.filter(source=>source.enabled&&['rss','gdelt'].includes(source.source_type)).length} MONITORED</span></div>{sources.length?sources.map(source=><div className="intel-source-row" key={source.id}><span className={`intel-source-health ${source.last_error?'is-error':source.enabled&&['rss','gdelt'].includes(source.source_type)?'is-live':'is-off'}`}/><div className="intel-source-name"><strong>{source.name}</strong><span>{['rss','gdelt'].includes(source.source_type)?source.source_type.toUpperCase():'REFERENCE ONLY'} · {source.last_checked_at?relativeDate(source.last_checked_at):'Not scanned yet'}</span></div>{source.last_error&&<span className="intel-source-error" title={source.last_error}>Needs attention</span>}</div>):<div className="intel-ops-empty">Run the Supabase setup SQL to register trusted public sources.</div>}</div>
          <div className="intel-ops-card"><div className="intel-ops-head"><div><h2>Recent scan history</h2><p>Collection runs and source coverage</p></div><span>{runs.length} RUNS</span></div>{runs.length?runs.map((run,index)=><div className="intel-run-row" key={`${run.started_at}-${index}`}><span className={`intel-run-state ${run.error?'is-partial':run.status==='completed'?'is-done':'is-failed'}`} title={run.error||undefined}>{run.error?'partial':run.status}</span><span>{relativeDate(run.finished_at||run.started_at)}</span><span>{run.sources_checked} sources</span><strong>+{run.items_added}</strong></div>):<div className="intel-ops-empty">No scans yet. Start a manual scan to create the first run.</div>}</div>
        </section>

        <footer className="intel-footer"><span><Activity size={13}/> {stats.lastRun?.finished_at?`Last scan ${relativeDate(stats.lastRun.finished_at).toLowerCase()}`:'Awaiting first scan'}</span><span>Amianan Intelligence <i>·</i> Private internal workspace</span></footer>
      </div>
    </main>

    {notice&&<div className="intel-toast"><span><Check size={14}/></span>{notice}<button onClick={()=>setNotice('')} aria-label="Dismiss"><X size={14}/></button></div>}
    {selected&&<div className="intel-detail-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)setSelected(null)}}><aside className="intel-detail-panel"><div className="intel-detail-top"><div><span className={`intel-stream-tag stream-${selected.stream}`}>{selected.stream}</span><span className={`intel-score score-${scoreTone(selected.relevance_score)}`}>{selected.relevance_score}<small>/100</small></span></div><button className="intel-icon-button" onClick={()=>setSelected(null)} aria-label="Close detail"><X size={18}/></button></div><div className="intel-detail-scroll"><div className="intel-detail-kicker">INTELLIGENCE FINDING</div><h2>{selected.title}</h2><div className="intel-detail-source">{selected.source_title} <span>·</span> {relativeDate(selected.published_at||selected.discovered_at)}</div><div className="intel-detail-tags">{selected.region&&<span><Globe2 size={12}/>{selected.region}</span>}{selected.organization&&<span>{selected.organization}</span>}{selected.location&&<span>{selected.location}</span>}</div><div className="intel-detail-action"><span>RECOMMENDED NEXT STEP</span><strong className={`action-${(actionColor[selected.recommended_action]??'slate')}`}>{selected.recommended_action}</strong></div><section><h3>Intelligence summary</h3><p>{selected.summary||selected.source_excerpt||'No summary available.'}</p></section>{selected.evidence&&<section className="intel-evidence"><h3><Check size={14}/> Source-backed evidence</h3><p>{selected.evidence}</p></section>}{selected.inference&&<section className="intel-inference"><h3><Sparkles size={14}/> Strategic inference</h3><p>{selected.inference}</p></section>}{selected.deadline_text&&<section className="intel-deadline"><h3><CalendarDays size={14}/> Deadline</h3><p>{selected.deadline_text}{selected.deadline_at&&` · ${new Date(selected.deadline_at).toLocaleDateString('en-PH',{dateStyle:'medium'})}`}</p></section>}<section className="intel-confidence"><h3>Assessment confidence</h3><div><span><i style={{width:`${selected.confidence_score}%`}}/></span><b>{selected.confidence_score}%</b></div></section><a className="intel-source-link" href={selected.source_url} target="_blank" rel="noopener noreferrer">Open original source <ExternalLink size={14}/></a>{publishedOpportunity?.itemId===selected.id&&<a className="intel-live-link" href={publishedOpportunity.path} target="_blank" rel="noopener noreferrer"><Check size={14}/> Open live opportunity <ExternalLink size={12}/></a>}</div><div className="intel-detail-actions">{selected.tags.includes('opportunity-candidate')&&<button className="intel-publish-button" onClick={()=>publishOpportunity(selected)} disabled={publishing||publishedOpportunity?.itemId===selected.id||!selected.deadline_at||Date.parse(selected.deadline_at)<=Date.now()||!selected.organization||!selected.summary||!selected.source_url.startsWith('https://')} title={!selected.deadline_at?'A verified future deadline is required':!selected.organization?'An organizing institution is required':!selected.summary?'A source-backed summary is required':!selected.source_url.startsWith('https://')?'An official HTTPS source link is required':undefined}>{publishing?<LoaderCircle size={15} className="intel-spin"/>:<Send size={15}/>} {publishedOpportunity?.itemId===selected.id?'Published live':publishing?'Publishing…':'Publish live to Opportunities'}</button>}<label>REVIEW STATUS<select value={selected.review_status} onChange={e=>updateStatus(selected,e.target.value)}>{statuses.filter(s=>s!=='all').map(s=><option key={s} value={s}>{statusLabel[s]}</option>)}</select></label><button className="intel-save-button" onClick={()=>updateStatus(selected,selected.review_status==='saved'?'new':'saved')}>{selected.review_status==='saved'?<Check size={15}/>:<CircleDot size={15}/>} {selected.review_status==='saved'?'Saved':'Save finding'}</button></div></aside></div>}
  </div>
}
