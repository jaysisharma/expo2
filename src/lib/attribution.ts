// Traffic source attribution — shared by the client tracker and API routes.
// Detects which social network / site / campaign brought a visitor, using
// UTM parameters first (reliable) and document.referrer as a fallback.

export const ATTRIBUTION_COOKIE = "hhe_src";
export const ATTRIBUTION_MAX_AGE_DAYS = 90;

export interface Attribution {
  source: string; // e.g. "facebook", "instagram", "google", "direct"
  medium: string; // "social" | "search" | "referral" | "email" | "direct" | utm_medium
  campaign: string;
  referrer: string; // referring hostname, if any
  landingPage: string;
  firstSeenAt: string;
}

// Hostname fragments → canonical source + medium
const KNOWN_SOURCES: { match: string[]; source: string; medium: string }[] = [
  { match: ["mail.google.com", "outlook.", "mail.yahoo."], source: "email", medium: "email" },
  { match: ["facebook.com", "fb.com", "fb.me", "messenger.com"], source: "facebook", medium: "social" },
  { match: ["instagram.com"], source: "instagram", medium: "social" },
  { match: ["linkedin.com", "lnkd.in"], source: "linkedin", medium: "social" },
  { match: ["t.co", "twitter.com", "x.com"], source: "twitter", medium: "social" },
  { match: ["youtube.com", "youtu.be"], source: "youtube", medium: "social" },
  { match: ["tiktok.com"], source: "tiktok", medium: "social" },
  { match: ["whatsapp.com", "wa.me"], source: "whatsapp", medium: "social" },
  { match: ["viber.com"], source: "viber", medium: "social" },
  { match: ["telegram.org", "t.me"], source: "telegram", medium: "social" },
  { match: ["reddit.com"], source: "reddit", medium: "social" },
  { match: ["pinterest.com"], source: "pinterest", medium: "social" },
  { match: ["threads.net"], source: "threads", medium: "social" },
  { match: ["google."], source: "google", medium: "search" },
  { match: ["bing.com"], source: "bing", medium: "search" },
  { match: ["duckduckgo.com"], source: "duckduckgo", medium: "search" },
  { match: ["yahoo.com"], source: "yahoo", medium: "search" },
  { match: ["chatgpt.com", "openai.com"], source: "chatgpt", medium: "ai" },
  { match: ["perplexity.ai"], source: "perplexity", medium: "ai" },
  { match: ["claude.ai"], source: "claude", medium: "ai" },
];

// Friendly aliases people commonly type into utm_source
const SOURCE_ALIASES: Record<string, string> = {
  fb: "facebook",
  ig: "instagram",
  insta: "instagram",
  x: "twitter",
  li: "linkedin",
  yt: "youtube",
  wa: "whatsapp",
};

export const SOURCE_LABELS: Record<string, string> = {
  facebook: "Facebook",
  instagram: "Instagram",
  linkedin: "LinkedIn",
  twitter: "X / Twitter",
  youtube: "YouTube",
  tiktok: "TikTok",
  whatsapp: "WhatsApp",
  viber: "Viber",
  telegram: "Telegram",
  reddit: "Reddit",
  pinterest: "Pinterest",
  threads: "Threads",
  google: "Google",
  bing: "Bing",
  duckduckgo: "DuckDuckGo",
  yahoo: "Yahoo",
  chatgpt: "ChatGPT",
  perplexity: "Perplexity",
  claude: "Claude",
  email: "Email",
  direct: "Direct / Unknown",
  admin: "Added by Admin",
  qr: "QR Code / Print",
};

export function sourceLabel(source?: string) {
  if (!source) return SOURCE_LABELS.direct;
  return SOURCE_LABELS[source] || source;
}

function matchHost(host: string) {
  const h = host.toLowerCase().replace(/^www\./, "");
  for (const entry of KNOWN_SOURCES) {
    if (entry.match.some((m) => (m.endsWith(".") ? h.includes(m) : h === m || h.endsWith(`.${m}`)))) {
      return entry;
    }
  }
  return null;
}

function clean(value: string | null | undefined, max = 100) {
  return (value || "").trim().toLowerCase().slice(0, max);
}

/**
 * Work out where a visit came from.
 * @param url       the landing page URL (with query string)
 * @param referrer  document.referrer
 * @param ownHost   this site's hostname, so internal navigation isn't counted as a referral
 */
export function detectAttribution(url: string, referrer: string, ownHost: string): Omit<Attribution, "firstSeenAt"> {
  const landing = new URL(url);
  const params = landing.searchParams;
  const landingPage = landing.pathname;

  let refHost = "";
  try {
    if (referrer) refHost = new URL(referrer).hostname.toLowerCase();
  } catch {}
  if (refHost && (refHost === ownHost || refHost.endsWith(`.${ownHost}`))) refHost = "";

  const refMatch = refHost ? matchHost(refHost) : null;

  // 1. Explicit UTM tags win
  const utmSource = clean(params.get("utm_source"));
  if (utmSource) {
    const source = SOURCE_ALIASES[utmSource] || utmSource;
    const knownMedium = KNOWN_SOURCES.find((k) => k.source === source)?.medium;
    return {
      source,
      medium: clean(params.get("utm_medium")) || knownMedium || "referral",
      campaign: clean(params.get("utm_campaign")),
      referrer: refHost,
      landingPage,
    };
  }

  // 2. Ad click IDs (present even when the referrer is stripped)
  if (params.has("fbclid")) {
    return { source: refMatch?.source === "instagram" ? "instagram" : "facebook", medium: "social", campaign: "", referrer: refHost, landingPage };
  }
  if (params.has("gclid") || params.has("gbraid") || params.has("wbraid")) {
    return { source: "google", medium: "cpc", campaign: "", referrer: refHost, landingPage };
  }
  if (params.has("ttclid")) return { source: "tiktok", medium: "cpc", campaign: "", referrer: refHost, landingPage };
  if (params.has("li_fat_id")) return { source: "linkedin", medium: "cpc", campaign: "", referrer: refHost, landingPage };

  // 3. Referrer header
  if (refMatch) return { source: refMatch.source, medium: refMatch.medium, campaign: "", referrer: refHost, landingPage };
  if (refHost) return { source: refHost.replace(/^www\./, ""), medium: "referral", campaign: "", referrer: refHost, landingPage };

  // 4. Nothing to go on (typed URL, bookmark, or an app that strips the referrer)
  return { source: "direct", medium: "direct", campaign: "", referrer: "", landingPage };
}

export function encodeAttribution(a: Attribution) {
  return encodeURIComponent(JSON.stringify(a));
}

export function decodeAttribution(raw: string | undefined | null): Attribution | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(decodeURIComponent(raw));
    if (parsed && typeof parsed.source === "string") return parsed as Attribution;
  } catch {}
  return null;
}

/**
 * Read the visitor's attribution cookie inside an API route, so form
 * submissions (registrations, bookings, inquiries) can be tagged with
 * the channel that brought the person in.
 * Returns null for requests made from the admin / staff panels.
 */
function isPanelRequest(req: Request) {
  try {
    const refererPath = new URL(req.headers.get("referer") || "").pathname;
    return refererPath.startsWith("/admin") || refererPath.startsWith("/staff");
  } catch {
    return false;
  }
}

export function getAttributionFromRequest(req: Request): Attribution | null {
  if (isPanelRequest(req)) return null;

  const cookieHeader = req.headers.get("cookie") || "";
  const match = cookieHeader.split(/;\s*/).find((c) => c.startsWith(`${ATTRIBUTION_COOKIE}=`));
  return decodeAttribution(match?.slice(ATTRIBUTION_COOKIE.length + 1));
}

/** Compact fields to store on a registration / inquiry record. */
export function attributionFields(req: Request) {
  if (isPanelRequest(req)) return { trafficSource: "admin", trafficMedium: "manual", trafficCampaign: "" };
  const a = getAttributionFromRequest(req);
  return {
    trafficSource: a?.source || "direct",
    trafficMedium: a?.medium || "direct",
    trafficCampaign: a?.campaign || "",
  };
}
