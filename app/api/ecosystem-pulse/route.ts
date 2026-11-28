import { EMAIL_RE, isRateLimited, str, tooMany, UUID_RE } from '@/lib/rate-limit'
import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'
import { sendReportDownloadLink } from '@/lib/email'

export async function POST(request: Request) {
  try {
    if (isRateLimited(request, 'report-email', 5, 10 * 60_000)) return tooMany()
    const body = await request.json().catch(() => ({}))
    const reportId = str(body.reportId, 40)
    const name = str(body.name, 120)
    const organization = str(body.organization, 150)
    const email = str(body.email, 254)

    if (!reportId || !UUID_RE.test(reportId) || !name || !email || !EMAIL_RE.test(email)) {
      return NextResponse.json({ error: 'Please enter your name and a valid email.' }, { status: 400 })
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
          organization,
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
      return NextResponse.json({ error: 'We could not send the email. Please try again later.' }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('[ecosystem-pulse] unexpected error:', e)
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
  }
}
