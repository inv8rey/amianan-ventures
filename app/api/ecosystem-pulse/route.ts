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

    // Fetch the report
    const { data: report, error: reportErr } = await supabase
      .from('ecosystem_reports')
      .select('id, title, file_url, is_published')
      .eq('id', reportId)
      .eq('is_published', true)
      .single()

    if (reportErr || !report) {
      return NextResponse.json({ error: 'Report not found.' }, { status: 404 })
    }

    // Save lead
    const { error: leadErr } = await supabase
      .from('report_downloads')
      .upsert(
        {
          report_id: reportId,
          email: email.toLowerCase().trim(),
          name: name.trim(),
          organization: organization?.trim() ?? null,
        },
        { onConflict: 'report_id,email' },
      )

    if (leadErr) {
      console.error('[ecosystem-pulse] lead save error:', leadErr.message)
    }

    // Send email — capture result and surface errors
    const emailResult = await sendReportDownloadLink({
      to: email.trim(),
      name: name.trim(),
      reportTitle: report.title,
      downloadUrl: report.file_url,
    })

    // Resend returns { data, error } — check for failure
    if (emailResult && 'error' in emailResult && emailResult.error) {
      const resendError = emailResult.error as { message?: string; name?: string }
      console.error('[ecosystem-pulse] Resend error:', resendError)

      // Friendly message for the most common cause (unverified domain)
      const msg = resendError.message ?? String(resendError)
      if (msg.toLowerCase().includes('domain') || msg.toLowerCase().includes('from')) {
        return NextResponse.json(
          { error: 'Email sending is not fully configured. Please contact the site admin.' },
          { status: 500 },
        )
      }
      return NextResponse.json({ error: `Failed to send email: ${msg}` }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('[ecosystem-pulse] unexpected error:', e)
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
  }
}
