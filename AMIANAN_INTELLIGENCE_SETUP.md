# Amianan Intelligence setup

Amianan Intelligence is a private workspace inside the existing News app admin. It reuses the existing admin allowlist, Supabase project, and Vercel deployment. The dashboard and scan endpoints require an admin session; the scheduled GET endpoint requires the server-side `CRON_SECRET`.

## 1. Create the database tables

In the Supabase SQL Editor, review and run `amianan-intelligence-schema.sql` once. It creates private tables with RLS policies that use the existing `public.is_admin()` function, then registers the initial source directory. Do not put the service role key in SQL, browser code, or a `NEXT_PUBLIC_` environment variable.

## 2. Configure server secrets

In the News app Vercel project, add these server-side environment variables for Production and Preview as appropriate:

- `GEMINI_API_KEY` for Gemini 3.5 Flash-Lite analysis.
- `GROQ_API_KEY` (optional) to add Groq as a second AI provider. When both keys are configured, analysis requests are split between Gemini and Groq, each provider falls back to the other on errors, and the per-scan AI analysis cap increases from 36 to 60 new findings. Without either key, scans still collect source titles and excerpts, but scores remain zero and findings default to `MONITOR`.
- `CRON_SECRET` for the daily scheduled scan. Vercel sends it as a Bearer token to the scheduled route. Keep it private and rotate it if exposed.

The app already needs `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` for its existing admin features. Never expose the service-role key to the browser.

## 3. Open the workspace

Sign in with an account in the existing admin allowlist, then open `/rkgd6dg3k0w935/intelligence`. Use **Run intelligence scan** for a manual scan. Scheduled scans are configured for 06:00 Philippine time (22:00 UTC). The schedule requires a Vercel plan that supports Cron Jobs and a configured `CRON_SECRET`.

## Source handling and limitations

The scanner automatically ensures nineteen verified RSS feeds are enabled across DOST, GMA News, BusinessWorld, Philstar, Inquirer, Interaksyon, Rappler, YugaTech, UNBOX PH, TechPinas, TechCrunch, YourStory, The Verge, Ars Technica, WIRED, Sifted, EU-Startups, and Startup Daily. It checks up to 30 enabled RSS/GDELT feeds, concurrently fetches up to four recent entries per source, and analyzes up to 36 new items with one provider, or 60 with both Gemini and Groq configured. GDELT remains available as an optional source and may rate-limit frequent requests. Groq uses the `openai/gpt-oss-20b` model; review your Groq plan and usage limits before enabling it because model usage is metered. Directory entries typed `official` or `philgeps` are reference sources and are not scraped by this MVP. Add only verified RSS URLs to the source table with `source_type='rss'`; the scanner intentionally does not crawl arbitrary websites or treat AI output as verified facts. AI output is a prioritization aid. Review deadlines, eligibility, buying needs, and contacts against the original source before acting. The `deadline_at` field is only populated when the source states an unambiguous date and timezone.

Every scan is bounded to eight sources and sixteen feed entries total to fit the hosted function window. Duplicates are ignored by canonical source URL. Source errors and scan history are visible in the dashboard.

## First-run check

After schema and environment setup, run a manual scan. Confirm source check timestamps update, findings link to their original URLs, and repeated scans do not create duplicate rows. Missing or invalid AI credentials do not fabricate assessments.

## One-click publishing to Opportunities

Findings the AI identifies as open calls appear under the Intelligence **Opportunities** filter. Open a finding and use **Publish live to Opportunities** to add it directly to the existing public opportunities table and directory at `/opportunities` (the News site destination linked from the main site). The action is admin-only, deduplicates by the official application URL, and records the review as actioned.

Publishing is enabled only when the finding has an AI opportunity classification, an explicit future deadline with timezone, an organizer, a source-backed summary, and an HTTPS source URL. Verify the original source before clicking. The existing opportunities schema and the `tags` field are reused; no additional database migration is needed.
