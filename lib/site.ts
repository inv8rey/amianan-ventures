// Where this site lives, and where the main Amianan Ventures studio site lives.
// The media site moved to news.amiananventures.org when the studio site took over
// amiananventures.org, so a NEXT_PUBLIC_SITE_URL still pointing at the main domain
// is treated as stale and ignored.
export const MAIN_SITE_URL = 'https://amiananventures.org'

const NEWS_SITE_URL = 'https://news.amiananventures.org'
const envUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, '')
const pointsAtMainSite = !!envUrl && /^https?:\/\/(www\.)?amiananventures\.org$/i.test(envUrl)

export const SITE_URL = envUrl && !pointsAtMainSite ? envUrl : NEWS_SITE_URL
export const SITE_HOST = SITE_URL.replace(/^https?:\/\//, '')
