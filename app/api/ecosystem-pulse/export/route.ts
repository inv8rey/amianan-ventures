import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'
import { createClient } from '@/lib/supabase/server'
import { format } from 'date-fns'

export async function GET(request: Request) {
  // Verify admin session
  const supabaseAuth = await createClient()
  const { data: { user } } = await supabaseAuth.auth.getUser()
  if (!user) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const reportId = searchParams.get('reportId')
  if (!reportId) {
    return new NextResponse('Missing reportId', { status: 400 })
  }

  const supabase = createServiceClient()

  const [{ data: report }, { data: leads }] = await Promise.all([
    supabase.from('ecosystem_reports').select('title').eq('id', reportId).single(),
    supabase
      .from('report_downloads')
      .select('name, organization, email, downloaded_at')
      .eq('report_id', reportId)
      .order('downloaded_at', { ascending: false }),
  ])

  if (!report) return new NextResponse('Report not found', { status: 404 })

  const rows = [
    ['Name', 'Organization', 'Email', 'Downloaded At'],
    ...(leads ?? []).map((l) => [
      l.name,
      l.organization ?? '',
      l.email,
      format(new Date(l.downloaded_at), 'yyyy-MM-dd HH:mm:ss'),
    ]),
  ]

  const csv = rows
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\n')

  const filename = `ecosystem-pulse-leads-${reportId.slice(0, 8)}.csv`

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
}
