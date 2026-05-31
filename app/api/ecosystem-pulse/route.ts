import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'
import { sendReportDownloadLink } from '@/lib/email'

export async function POST(request: Request) {
  try {
    const { reportId, name, organization, email } = await request.json()

    if (!reportId || !name || !email) {
      return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 })
    }

    const supabase = createServiceClient()

    // Fetch the report to get title and file_url
    const { data: report, error: reportErr } = await supabase
      .from('ecosystem_reports')
      .select('id, title, file_url, is_published')
      .eq('id', reportId)
      .eq('is_published', true)
      .single()

    if (reportErr || !report) {
      return NextResponse.json({ error: 'Report not found.' }, { status: 404 })
    }

    // Save lead (upsert by email+report to avoid duplicates)
    const { error: leadErr } = await supabase
      .from('report_downloads')
      .upsert(
        { report_id: reportId, email: email.toLowerCase().trim(), name: name.trim(), organization: organization?.trim() ?? null },
        { onConflict: 'report_id,email' },
      )

    if (leadErr) {
      console.error('[ecosystem-pulse] lead save error:', leadErr.message)
      // Don't block the user — still send email
    }

    // Send download email
    await sendReportDownloadLink({
      to: email.trim(),
      name: name.trim(),
      reportTitle: report.title,
      downloadUrl: report.file_url,
    })

    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('[ecosystem-pulse] error:', e)
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 })
  }
}
