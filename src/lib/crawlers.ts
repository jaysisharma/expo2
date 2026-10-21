// Web crawler detection — shared by middleware (server-side crawler logging)
// and /api/track (so bots that run JavaScript aren't counted as visitors).

export type CrawlerCategory = "search" | "ai" | "social" | "seo" | "other";

const CRAWLERS: { pattern: RegExp; name: string; category: CrawlerCategory }[] = [
  // Search engines
  { pattern: /googlebot|google-inspectiontool|storebot-google/i, name: "Googlebot", category: "search" },
  { pattern: /bingbot|msnbot|bingpreview/i, name: "Bingbot", category: "search" },
  { pattern: /yandex/i, name: "YandexBot", category: "search" },
  { pattern: /baiduspider/i, name: "Baiduspider", category: "search" },
  { pattern: /duckduckbot|duckassistbot/i, name: "DuckDuckBot", category: "search" },
  { pattern: /applebot(?!-extended)/i, name: "Applebot", category: "search" },
  { pattern: /yahoo! slurp/i, name: "Yahoo Slurp", category: "search" },
  // AI crawlers & assistants
  { pattern: /gptbot/i, name: "GPTBot (OpenAI)", category: "ai" },
  { pattern: /chatgpt-user|oai-searchbot/i, name: "ChatGPT Search", category: "ai" },
  { pattern: /claudebot|claude-user|claude-searchbot|anthropic-ai/i, name: "Claude (Anthropic)", category: "ai" },
  { pattern: /perplexitybot|perplexity-user/i, name: "Perplexity", category: "ai" },
  { pattern: /google-extended|google-cloudvertexbot/i, name: "Google AI", category: "ai" },
  { pattern: /applebot-extended/i, name: "Apple AI", category: "ai" },
  { pattern: /meta-externalagent|meta-externalfetcher/i, name: "Meta AI", category: "ai" },
  { pattern: /bytespider/i, name: "Bytespider (TikTok)", category: "ai" },
  { pattern: /amazonbot/i, name: "Amazonbot", category: "ai" },
  { pattern: /ccbot/i, name: "Common Crawl", category: "ai" },
  { pattern: /cohere-ai|mistralai-user|youbot|diffbot/i, name: "Other AI", category: "ai" },
  // Social link previews
  { pattern: /facebookexternalhit|facebookcatalog/i, name: "Facebook preview", category: "social" },
  { pattern: /whatsapp/i, name: "WhatsApp preview", category: "social" },
  { pattern: /twitterbot/i, name: "X / Twitter preview", category: "social" },
  { pattern: /linkedinbot/i, name: "LinkedIn preview", category: "social" },
  { pattern: /telegrambot/i, name: "Telegram preview", category: "social" },
  { pattern: /slackbot|discordbot|viber|skypeuripreview|pinterestbot|redditbot/i, name: "Other link preview", category: "social" },
  // SEO tools
  { pattern: /ahrefsbot|semrushbot|mj12bot|dotbot|rogerbot|screaming frog|serpstatbot|dataforseo/i, name: "SEO tool", category: "seo" },
  // Generic fallbacks
  { pattern: /headlesschrome|lighthouse|pagespeed|pingdom|uptimerobot/i, name: "Monitoring / headless", category: "other" },
  { pattern: /bot\b|crawl|spider|scrapy|python-requests|curl\/|wget/i, name: "Other bot", category: "other" },
];

export function detectCrawler(userAgent: string | null | undefined) {
  if (!userAgent) return null;
  const hit = CRAWLERS.find((c) => c.pattern.test(userAgent));
  return hit ? { name: hit.name, category: hit.category } : null;
}

export const CRAWLER_CATEGORY_LABELS: Record<CrawlerCategory, string> = {
  search: "Search engines",
  ai: "AI crawlers & assistants",
  social: "Social link previews",
  seo: "SEO tools",
  other: "Other bots",
};
