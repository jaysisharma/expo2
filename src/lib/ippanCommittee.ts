// Keeps the site's IPPAN members in step with the Executive Committee page on ippan.org.np.
// The page is a WordPress grid: each card has a photo, the name (<h4>) and the position (<h6>).
import "server-only";

export const IPPAN_COMMITTEE_URL = "https://www.ippan.org.np/executive-committee-members";
const IPPAN_ORGANIZATION = "Independent Power Producers' Association, Nepal (IPPAN)";
// Fewer cards than this means the page failed to load or its layout changed; never sync from it
const MIN_COMMITTEE_SIZE = 15;
// The daily cron leaves bigger removals for an admin to review
export const MAX_AUTO_REMOVALS = 5;
const FEATURED_TITLES = ["president", "senior vice president", "vice president", "general secretary", "chief advisor"];

export interface IppanCommitteeMember {
  name: string;
  title: string;
  photo: string;
  profileUrl: string;
}

export interface IppanSyncPlan {
  members: any[];
  added: { name: string; title: string }[];
  removed: { name: string; title: string }[];
  updated: { name: string; from: string; to: string }[];
  committeeSize: number;
}

const decode = (s: string) =>
  s
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&#0?39;|&rsquo;|&#8217;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&nbsp;/g, " ")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/\s+/g, " ")
    .trim();

/** "Mr. Milan khadka" and "Milan Khadka" -> "milan khadka" */
export function nameKey(name: string) {
  return decode(name)
    .toLowerCase()
    .replace(/^(mr|mrs|ms|miss|dr|er|prof)\.?\s+/, "")
    .replace(/[^a-z ]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

// "IPP&Chief Advisor" and "IPP & Chief Advisor" are the same position
const titleKey = (title: string) => title.toLowerCase().replace(/[^a-z]/g, "");

export function parseIppanCommittee(html: string): IppanCommitteeMember[] {
  const members: IppanCommitteeMember[] = [];
  for (const card of html.split('class="vc_grid-item ').slice(1)) {
    const name = decode(card.match(/<h4[^>]*>([\s\S]*?)<\/h4>/)?.[1] || "");
    const title = decode(card.match(/<h6[^>]*>([\s\S]*?)<\/h6>/)?.[1] || "");
    if (!name || !title) continue;
    members.push({
      name,
      title,
      photo: card.match(/<img[^>]+src="([^"]+)"/)?.[1] || "",
      profileUrl: card.match(/href="(https:\/\/www\.ippan\.org\.np\/[^"]+)"/)?.[1] || IPPAN_COMMITTEE_URL,
    });
  }
  return members;
}

export async function fetchIppanCommittee(): Promise<IppanCommitteeMember[]> {
  const res = await fetch(IPPAN_COMMITTEE_URL, {
    headers: { "User-Agent": "Mozilla/5.0 (compatible; HIGEX-member-sync)" },
    cache: "no-store",
    signal: AbortSignal.timeout(20_000),
  });
  if (!res.ok) throw new Error(`IPPAN website returned HTTP ${res.status}`);
  const committee = parseIppanCommittee(await res.text());
  if (committee.length < MIN_COMMITTEE_SIZE || !committee.some((m) => titleKey(m.title) === "president")) {
    throw new Error(
      `Only found ${committee.length} committee members on the IPPAN page; its layout may have changed, so nothing was synced.`
    );
  }
  return committee;
}

const slug = (s: string) => nameKey(s).replace(/ /g, "-");

/**
 * The members list after syncing IPPAN entries with the committee page. Existing people keep
 * their id, photo, bio, category and featured flag (only the position is updated); new people get
 * the IPPAN photo; people no longer on the page are dropped. Non-IPPAN members are untouched.
 */
export function planIppanSync(current: any[], committee: IppanCommitteeMember[]): IppanSyncPlan {
  const existing = new Map<string, any>();
  for (const m of current) if (m.orgType === "IPPAN") existing.set(nameKey(m.name), m);

  const added: IppanSyncPlan["added"] = [];
  const updated: IppanSyncPlan["updated"] = [];
  const seen = new Set<string>();
  const ippanMembers = committee.map((c) => {
    const key = nameKey(c.name);
    seen.add(key);
    const prev = existing.get(key);
    if (prev) {
      if (titleKey(prev.title) === titleKey(c.title)) return prev;
      updated.push({ name: prev.name, from: prev.title, to: c.title });
      return { ...prev, title: c.title, bio: prev.bio === `${prev.title} at ${IPPAN_ORGANIZATION}.` ? `${c.title} at ${IPPAN_ORGANIZATION}.` : prev.bio };
    }
    added.push({ name: c.name, title: c.title });
    return {
      id: `ippan-${slug(c.name)}`,
      name: c.name,
      title: c.title,
      organization: IPPAN_ORGANIZATION,
      orgType: "IPPAN",
      photo: c.photo || "/images/committee/mohan-kumar-dangi.webp",
      category: "IPPAN Leadership",
      bio: `${c.title} at ${IPPAN_ORGANIZATION}.`,
      featured: FEATURED_TITLES.some((t) => c.title.toLowerCase().includes(t)),
    };
  });

  const removed = current
    .filter((m) => m.orgType === "IPPAN" && !seen.has(nameKey(m.name)))
    .map((m) => ({ name: m.name, title: m.title }));

  // IPPAN members go where the IPPAN block was, in the committee page's order
  const firstIppan = current.findIndex((m) => m.orgType === "IPPAN");
  const others = current.filter((m) => m.orgType !== "IPPAN");
  const insertAt = firstIppan === -1 ? 0 : current.slice(0, firstIppan).filter((m) => m.orgType !== "IPPAN").length;
  const members = [...others.slice(0, insertAt), ...ippanMembers, ...others.slice(insertAt)];

  return { members, added, removed, updated, committeeSize: committee.length };
}
