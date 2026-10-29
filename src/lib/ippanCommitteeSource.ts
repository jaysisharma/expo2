// Where the IPPAN Executive Committee comes from, shared by the admin page (which reads it from
// the browser, because IPPAN's Cloudflare blocks requests from Vercel's servers) and the server.
// The committee page is a grid of WordPress posts in category 44, oldest first; the WordPress
// REST API returns the same list and allows cross-origin reads.

export const IPPAN_COMMITTEE_URL = "https://www.ippan.org.np/executive-committee-members";
export const IPPAN_COMMITTEE_API =
  "https://www.ippan.org.np/wp-json/wp/v2/posts?categories=44&orderby=date&order=asc&per_page=100" +
  "&_fields=id,link,title,excerpt,_links.wp:featuredmedia&_embed=wp:featuredmedia";
const IPPAN_ORIGIN = "https://www.ippan.org.np/";

export interface IppanCommitteeMember {
  name: string;
  title: string;
  photo: string;
  profileUrl: string;
}

export const decodeHtml = (s: string) =>
  s
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&#0?39;|&rsquo;|&#8217;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&nbsp;/g, " ")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/\s+/g, " ")
    .trim();

/** Committee members from the WordPress REST API response */
export function parseIppanApiPosts(posts: unknown): IppanCommitteeMember[] {
  if (!Array.isArray(posts)) return [];
  return posts
    .map((p: any) => ({
      name: decodeHtml(String(p?.title?.rendered ?? "")),
      title: decodeHtml(String(p?.excerpt?.rendered ?? "")),
      photo: String(p?._embedded?.["wp:featuredmedia"]?.[0]?.source_url ?? ""),
      profileUrl: String(p?.link ?? ""),
    }))
    .filter((m) => m.name && m.title);
}

/**
 * Cleans a committee list that came from the browser: plain short strings, photos and profile
 * links only from ippan.org.np, and no more than 100 people.
 */
export function sanitizeCommittee(input: unknown): IppanCommitteeMember[] {
  if (!Array.isArray(input)) return [];
  const text = (v: unknown, max: number) => decodeHtml(String(v ?? "")).slice(0, max);
  const ippanUrl = (v: unknown) => {
    const url = String(v ?? "");
    return url.startsWith(IPPAN_ORIGIN) && url.length <= 500 ? url : "";
  };
  return input
    .slice(0, 100)
    .map((m: any) => ({
      name: text(m?.name, 120),
      title: text(m?.title, 120),
      photo: ippanUrl(m?.photo),
      profileUrl: ippanUrl(m?.profileUrl) || IPPAN_COMMITTEE_URL,
    }))
    .filter((m) => m.name && m.title);
}
