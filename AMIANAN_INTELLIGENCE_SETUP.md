# Amianan Intelligence setup

Amianan Intelligence is a private workspace inside the existing News app admin. It reuses the existing admin allowlist, Supabase project, and Vercel deployment. The dashboard and scan endpoints require an admin session; the scheduled GET endpoint requires the server-side `CRON_SECRET`.

## 1. Create the database tables

In the Supabase SQL Editor, review and run `amianan-intelligence-schema.sql` once. It creates private tables with RLS policies that use the existing `public.is_admin()` function, then registers the initial source directory. Do not put the service role key in SQL, browser code, or a `NEXT_PUBLIC_` environment variable.

## 2. Configure server secrets

In the News app Vercel project, add these server-side environment variables for Production and Preview as appropriate:

- `GEMINI_API_KEY` for Gemini 3.5 Flash-Lite analysis.
- `GROQ_API_KEY` (optional) to add Groq as a second AI provider. When both keys are configured, analysis requests are split between Gemini and Groq, each provider falls back to the other on errors, and the per-scan analysis cap increases from 30 to 50 findings. Without either key, scans still collect source titles and excerpts, but scores remain zero and findings default to `MONITOR`.
- `CRON_SECRET` for the daily scheduled scan. Vercel sends it as a Bearer token to the scheduled route. Keep it private and rotate it if exposed.

The app already needs `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` for its existing admin features. Never expose the service-role key to the browser.

## 3. Open the workspace

Sign in with an account in the existing admin allowlist, then open `/rkgd6dg3k0w935/intelligence`. Use **Run intelligence scan** for a manual scan. Scheduled scans are configured for 06:00 Philippine time (22:00 UTC). The schedule requires a Vercel plan that supports Cron Jobs and a configured `CRON_SECRET`.

## Source handling and limitations

The scanner automatically seeds 31 RSS feeds: 19 direct publisher and DOST feeds, plus 12 Google News topic feeds covering Northern Luzon innovation, DOST-CAR and Region I, Philippine startup funding, open calls, MSME support, research commercialization, accelerators, PCIEERD, Startup Philippines, and ASEAN opportunities. Google News feeds are discovery leads only; findings from these feeds cannot be one-click published as opportunities. Google News RSS endpoints returned entries during implementation; production feed health is reported in the dashboard because availability can vary by host.

Each run checks up to 40 enabled RSS/GDELT feeds, reads up to four recent entries per source, deduplicates URLs, and selects fairly across sources with extra weight for timely opportunities and Northern Luzon coverage. It analyzes up to 50 new items when both Gemini and Groq are configured, or 30 with one key. Requests are paced to reduce free-tier quota errors. A failed source is paused for six hours before retry. The dashboard reports source health, items collected, AI assessments, and new findings; scan history exposes warning details. GDELT can rate-limit requests. Check the [Groq rate limits](https://console.groq.com/docs/rate-limits) and [Gemini API pricing and quotas](https://ai.google.dev/gemini-api/docs/pricing) for current account-specific limits.

Directory entries typed `official` or `philgeps` remain references and are not crawled as arbitrary websites. Add only trusted RSS URLs to the source table with `source_type='rss'`. The scanner does not treat AI output as verified facts. Review deadlines, eligibility, procurement needs, and contacts against the original source before acting. The `deadline_at` field is only populated when the source states an unambiguous date and timezone.

Each run is bounded by the source and analysis limits above to fit the hosted function window. If more fresh entries arrive than the AI quota allows, the scanner prioritizes a balanced subset and reports how many were deferred. Deferred entries may be collected on a later scan while they remain in a feed. Duplicate source URLs are ignored.

## First-run check

After schema and environment setup, run a manual scan. Confirm source check timestamps update, findings link to their original URLs, and repeated scans do not create duplicate rows. Missing or invalid AI credentials do not fabricate assessments.

## One-click publishing to Opportunities

Findings the AI identifies as open calls appear under the Intelligence **Opportunities** filter. Open a finding and use **Publish live to Opportunities** to add it directly to the existing public opportunities table and directory at `/opportunities` (the News site destination linked from the main site). The action is admin-only, deduplicates by the official application URL, and records the review as actioned.

Publishing is enabled only when the finding has an AI opportunity classification, an explicit future deadline with timezone, an organizer, a source-backed summary, and an HTTPS source URL. Verify the original source before clicking. The existing opportunities schema and the `tags` field are reused; no additional database migration is needed.
