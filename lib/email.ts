import { Resend } from 'resend'

// Lazy-init so the module can be imported at build time without a key set.
function getResend() {
  return new Resend(process.env.RESEND_API_KEY ?? 'placeholder')
}

const FROM = process.env.CONTRIBUTOR_FROM_EMAIL ?? 'onboarding@resend.dev'
const EDITOR_EMAIL = process.env.EDITOR_EMAIL ?? ''
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://amiananventures.org'

function baseHtml(content: string) {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#f9fafb;margin:0;padding:32px 16px">
  <div style="max-width:520px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb">
    <div style="background:#000;padding:20px 28px;display:flex;align-items:center;gap:10px">
      <span style="color:#00cc6a;font-size:18px;font-weight:900;letter-spacing:-0.5px">AV</span>
      <span style="color:#ffffff;font-size:13px;font-weight:600;letter-spacing:0.3px">AMIANAN INNOVATION VENTURES</span>
    </div>
    <div style="padding:28px">
      ${content}
    </div>
    <div style="padding:16px 28px;border-top:1px solid #f3f4f6;background:#f9fafb">
      <p style="margin:0;font-size:11px;color:#9ca3af">
        Amianan Innovation Ventures · Baguio City, Philippines ·
        <a href="${SITE_URL}" style="color:#00a855;text-decoration:none">amiananventures.org</a>
      </p>
    </div>
  </div>
</body>
</html>`
}

function h1(text: string) {
  return `<h1 style="margin:0 0 12px;font-size:20px;font-weight:700;color:#111827;line-height:1.3">${text}</h1>`
}
function p(text: string) {
  return `<p style="margin:0 0 14px;font-size:14px;color:#374151;line-height:1.6">${text}</p>`
}
function btn(href: string, label: string) {
  return `<a href="${href}" style="display:inline-block;background:#000;color:#fff;text-decoration:none;padding:10px 20px;border-radius:7px;font-size:13px;font-weight:600;margin-top:6px">${label}</a>`
}
function pill(text: string, color = '#00a855') {
  return `<span style="display:inline-block;background:${color}1a;color:${color};font-size:11px;font-weight:600;padding:3px 10px;border-radius:99px;text-transform:uppercase;letter-spacing:0.5px">${text}</span>`
}
function callout(content: string, color = '#f59e0b') {
  return `<div style="background:${color}1a;border-left:3px solid ${color};border-radius:0 8px 8px 0;padding:14px 16px;margin:16px 0">${content}</div>`
}

// ── Contributor emails ──────────────────────────────────────────────────────

export async function sendSubmissionReceived(
  to: string,
  { headline, submissionId }: { headline: string; submissionId: string }
) {
  return getResend().emails.send({
    from: `Amianan Ventures <${FROM}>`,
    to,
    subject: `We received your submission: "${headline}"`,
    html: baseHtml(`
      ${h1('Submission received!')}
      ${p(`Thanks for submitting to Amianan Innovation Ventures. We've received your article and our editor will review it soon.`)}
      <div style="background:#f9fafb;border-radius:8px;padding:14px 16px;margin:16px 0">
        <p style="margin:0 0 4px;font-size:11px;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:0.5px">Submission</p>
        <p style="margin:0;font-size:15px;font-weight:600;color:#111827">${headline}</p>
        <p style="margin:4px 0 0;font-size:11px;color:#9ca3af">ID: ${submissionId}</p>
      </div>
      ${p('You\'ll hear from us within 5–7 business days. You can track your submission status on your dashboard.')}
      ${btn(`${SITE_URL}/dashboard`, 'View My Dashboard')}
    `),
  })
}

export async function sendUnderReview(
  to: string,
  { headline }: { headline: string }
) {
  return getResend().emails.send({
    from: `Amianan Ventures <${FROM}>`,
    to,
    subject: `Your submission is now under review: "${headline}"`,
    html: baseHtml(`
      ${h1('Your article is under review')}
      ${pill('Under Review', '#f59e0b')}
      <div style="margin-top:16px">
        ${p(`Our editor has started reviewing your submission <strong>"${headline}"</strong>. We'll get back to you with feedback or approval shortly.`)}
        ${p('In the meantime, feel free to update your contributor profile to add a bio or photo — it helps us introduce you alongside your piece.')}
        ${btn(`${SITE_URL}/dashboard`, 'View My Dashboard')}
      </div>
    `),
  })
}

export async function sendRevisionRequested(
  to: string,
  { headline, notes }: { headline: string; notes: string }
) {
  return getResend().emails.send({
    from: `Amianan Ventures <${FROM}>`,
    to,
    subject: `Revision requested for: "${headline}"`,
    html: baseHtml(`
      ${h1('A few revisions needed')}
      ${pill('Revision Requested', '#f97316')}
      <div style="margin-top:16px">
        ${p(`Our editor reviewed <strong>"${headline}"</strong> and has some feedback before we can move forward.`)}
        ${callout(`<p style="margin:0 0 6px;font-size:12px;font-weight:600;color:#92400e;text-transform:uppercase;letter-spacing:0.5px">Editor's Notes</p><p style="margin:0;font-size:14px;color:#78350f;line-height:1.5">${notes}</p>`)}
        ${p('Please review the feedback and resubmit when you\'re ready. You can edit your submission directly from your dashboard.')}
        ${btn(`${SITE_URL}/dashboard`, 'View Feedback & Resubmit')}
      </div>
    `),
  })
}

export async function sendApproved(
  to: string,
  { headline }: { headline: string }
) {
  return getResend().emails.send({
    from: `Amianan Ventures <${FROM}>`,
    to,
    subject: `Your article has been approved: "${headline}"`,
    html: baseHtml(`
      ${h1('Your article is approved! 🎉')}
      ${pill('Approved', '#10b981')}
      <div style="margin-top:16px">
        ${p(`Congratulations! Our editor has approved your submission <strong>"${headline}"</strong>. We'll schedule it for publication on <a href="${SITE_URL}" style="color:#00a855">amiananventures.org</a> and notify you when it goes live.`)}
        ${p('Thank you for contributing to the Northern Luzon innovation ecosystem.')}
        ${btn(`${SITE_URL}/dashboard`, 'View My Dashboard')}
      </div>
    `),
  })
}

export async function sendRejected(
  to: string,
  { headline }: { headline: string }
) {
  return getResend().emails.send({
    from: `Amianan Ventures <${FROM}>`,
    to,
    subject: `Update on your submission: "${headline}"`,
    html: baseHtml(`
      ${h1('An update on your submission')}
      ${p(`Thank you for taking the time to submit <strong>"${headline}"</strong> to Amianan Innovation Ventures.`)}
      ${p('After careful review, our editor has decided not to move forward with this particular piece at this time. This doesn\'t reflect on the quality of your work — editorial decisions are often about fit, timing, and our current content mix.')}
      ${p('We encourage you to submit again in the future. Your perspective and experience are valuable to our community.')}
      ${btn(`${SITE_URL}/contribute`, 'Submit Another Piece')}
    `),
  })
}

export async function sendPublished(
  to: string,
  { headline, url }: { headline: string; url: string }
) {
  return getResend().emails.send({
    from: `Amianan Ventures <${FROM}>`,
    to,
    subject: `Your article is live: "${headline}"`,
    html: baseHtml(`
      ${h1('Your article is now live! 🚀')}
      ${pill('Published', '#00a855')}
      <div style="margin-top:16px">
        ${p(`<strong>"${headline}"</strong> is now published on Amianan Innovation Ventures. Share it with your network and help spread the word about the Northern Luzon innovation ecosystem!`)}
        ${btn(url, 'Read Your Article')}
        <p style="margin-top:16px;font-size:13px;color:#6b7280">
          Direct link: <a href="${url}" style="color:#00a855">${url}</a>
        </p>
      </div>
    `),
  })
}

// ── Editor notification ──────────────────────────────────────────────────────

export async function sendReportDownloadLink({
  to,
  name,
  reportTitle,
  downloadUrl,
}: {
  to: string
  name: string
  reportTitle: string
  downloadUrl: string
}) {
  return getResend().emails.send({
    from: `Amianan Ventures <${FROM}>`,
    to,
    subject: `Your download: ${reportTitle}`,
    html: baseHtml(`
      ${h1(`Here's your report, ${name.split(' ')[0]}!`)}
      ${p(`Thank you for your interest in the Amianan Ventures Ecosystem Pulse series. Your requested report is ready to download.`)}
      <div style="background:#f9fafb;border-radius:8px;padding:14px 16px;margin:16px 0;border-left:3px solid #00cc6a">
        <p style="margin:0;font-size:13px;font-weight:700;color:#111827">${reportTitle}</p>
        <p style="margin:4px 0 0;font-size:11px;color:#6b7280">Ecosystem Pulse · Amianan Ventures</p>
      </div>
      ${btn(downloadUrl, 'Download Report')}
      ${p(`<span style="font-size:12px;color:#9ca3af">If the button doesn't work, copy and paste this link: <a href="${downloadUrl}" style="color:#00a855">${downloadUrl}</a></span>`)}
    `),
  })
}

export async function sendEditorAlert({
  contributor,
  headline,
  submissionId,
  contentType,
}: {
  contributor: string
  headline: string
  submissionId: string
  contentType: string
}) {
  if (!EDITOR_EMAIL) return
  return getResend().emails.send({
    from: `Amianan Ventures <${FROM}>`,
    to: EDITOR_EMAIL,
    subject: `New submission: "${headline}"`,
    html: baseHtml(`
      ${h1('New contributor submission')}
      ${p(`<strong>${contributor}</strong> has submitted a new article for review.`)}
      <div style="background:#f9fafb;border-radius:8px;padding:14px 16px;margin:16px 0">
        <p style="margin:0 0 8px;font-size:13px;color:#6b7280"><strong>Type:</strong> ${contentType}</p>
        <p style="margin:0 0 4px;font-size:15px;font-weight:600;color:#111827">${headline}</p>
        <p style="margin:4px 0 0;font-size:11px;color:#9ca3af">ID: ${submissionId}</p>
      </div>
      ${btn(`${SITE_URL}/admin/contributions/${submissionId}`, 'Review Submission')}
    `),
  })
}

// ── Get Featured / Spotlight emails ───────────────────────────────────────────

export async function sendSpotlightSubmitted(
  to: string,
  { businessName }: { businessName: string }
) {
  return getResend().emails.send({
    from: `Amianan Ventures <${FROM}>`,
    to,
    subject: `We received your Get Featured application: "${businessName}"`,
    html: baseHtml(`
      ${h1('Application received!')}
      ${p(`Thanks for applying to be featured, <strong>${businessName}</strong>. Our team will review your application and get back to you within 1–3 business days.`)}
      ${p('You can keep editing your details from your dashboard at any time before payment.')}
      ${btn(`${SITE_URL}/dashboard`, 'View My Dashboard')}
    `),
  })
}

export async function sendSpotlightApproved(
  to: string,
  { businessName }: { businessName: string }
) {
  return getResend().emails.send({
    from: `Amianan Ventures <${FROM}>`,
    to,
    subject: `Your Get Featured application was approved: "${businessName}"`,
    html: baseHtml(`
      ${h1('Your application is approved! 🎉')}
      ${pill('Approved', '#10b981')}
      <div style="margin-top:16px">
        ${p(`Congratulations! <strong>${businessName}</strong> has been approved for the Amianan Startup Spotlight. The next step is payment — head to your dashboard to see your payment instructions and upload your proof of payment.`)}
        ${p('Payment is requested only after your application has been reviewed and approved — exactly where you are now.')}
        ${btn(`${SITE_URL}/spotlight`, 'Complete Payment')}
      </div>
    `),
  })
}

export async function sendSpotlightRejected(
  to: string,
  { businessName, notes }: { businessName: string; notes: string }
) {
  return getResend().emails.send({
    from: `Amianan Ventures <${FROM}>`,
    to,
    subject: `Update on your Get Featured application: "${businessName}"`,
    html: baseHtml(`
      ${h1('An update on your application')}
      ${p(`Thank you for applying to be featured, <strong>${businessName}</strong>.`)}
      ${p('After careful review, we\'re not able to move forward with your application at this time.')}
      ${notes ? callout(`<p style="margin:0 0 6px;font-size:12px;font-weight:600;color:#92400e;text-transform:uppercase;letter-spacing:0.5px">Notes</p><p style="margin:0;font-size:14px;color:#78350f;line-height:1.5">${notes}</p>`) : ''}
      ${p('We encourage you to apply again in the future.')}
    `),
  })
}

export async function sendSpotlightPaymentConfirmed(
  to: string,
  { businessName }: { businessName: string }
) {
  return getResend().emails.send({
    from: `Amianan Ventures <${FROM}>`,
    to,
    subject: `Payment confirmed: "${businessName}"`,
    html: baseHtml(`
      ${h1('Payment confirmed!')}
      ${pill('Paid', '#10b981')}
      <div style="margin-top:16px">
        ${p(`We've confirmed your payment for <strong>${businessName}</strong>. Our team will now start producing your feature story and content assets.`)}
        ${btn(`${SITE_URL}/spotlight`, 'View My Application')}
      </div>
    `),
  })
}

export async function sendSpotlightPublished(
  to: string,
  { businessName, url }: { businessName: string; url: string }
) {
  return getResend().emails.send({
    from: `Amianan Ventures <${FROM}>`,
    to,
    subject: `Your feature is live: "${businessName}"`,
    html: baseHtml(`
      ${h1('Your feature is now live! 🚀')}
      ${pill('Published', '#00a855')}
      <div style="margin-top:16px">
        ${p(`<strong>${businessName}</strong> is now featured on Amianan Innovation Ventures. Share it with your network!`)}
        ${btn(url, 'View Your Feature')}
        <p style="margin-top:16px;font-size:13px;color:#6b7280">
          Direct link: <a href="${url}" style="color:#00a855">${url}</a>
        </p>
      </div>
    `),
  })
}

export async function sendEditorSpotlightAlert({
  businessName,
  applicationId,
}: {
  businessName: string
  applicationId: string
}) {
  if (!EDITOR_EMAIL) return
  return getResend().emails.send({
    from: `Amianan Ventures <${FROM}>`,
    to: EDITOR_EMAIL,
    subject: `New Get Featured application: "${businessName}"`,
    html: baseHtml(`
      ${h1('New Get Featured application')}
      ${p(`<strong>${businessName}</strong> has submitted a Get Featured application for review.`)}
      ${btn(`${SITE_URL}/admin/spotlight/${applicationId}`, 'Review Application')}
    `),
  })
}
