// Keeps the site's IPPAN members in step with the Executive Committee page on ippan.org.np.
// The page is a WordPress grid: each card has a photo, the name (<h4>) and the position (<h6>).
import "server-only";
import {
  IPPAN_COMMITTEE_API,
  IPPAN_COMMITTEE_URL,
  decodeHtml as decode,
  parseIppanApiPosts,
  type IppanCommitteeMember,
} from "./ippanCommitteeSource";

export { IPPAN_COMMITTEE_URL, type IppanCommitteeMember };
export const IPPAN_SECRETARIAT_URL = "https://www.ippan.org.np/secretariat";
export const SECRETARIAT_CATEGORY = "IPPAN Secretariat";
// Fewer cards than this on the secretariat page means it failed to load or changed layout
const MIN_SECRETARIAT_SIZE = 3;
const IPPAN_ORGANIZATION = "Independent Power Producers' Association, Nepal (IPPAN)";
// Fewer cards than this means the page failed to load or its layout changed; never sync from it
const MIN_COMMITTEE_SIZE = 15;
// The daily cron leaves bigger removals for an admin to review
export const MAX_AUTO_REMOVALS = 5;
const FEATURED_TITLES = ["president", "senior vice president", "vice president", "general secretary", "chief advisor"];

export interface IppanSyncPlan {
  members: any[];
  added: { name: string; title: string }[];
  removed: { name: string; title: string }[];
  updated: { name: string; from: string; to: string }[];
  committeeSize: number;
}

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

/** Throws unless the list looks like a whole committee (page down or redesigned otherwise) */
export function assertCompleteCommittee(committee: IppanCommitteeMember[]) {
  if (committee.length < MIN_COMMITTEE_SIZE || !committee.some((m) => titleKey(m.title) === "president")) {
    throw new Error(
      `Only found ${committee.length} committee members on the IPPAN website; it may be down or changed, so nothing was synced.`
    );
  }
  return committee;
}

/**
 * Server-side read, used by the daily cron. IPPAN's Cloudflare may answer 403 to Vercel's
 * servers; the admin page then reads the committee from the browser instead.
 */
export async function fetchIppanCommittee(): Promise<IppanCommitteeMember[]> {
  const init = {
    headers: { "User-Agent": "Mozilla/5.0 (compatible; HIGEX-member-sync)", Accept: "application/json,text/html" },
    cache: "no-store" as const,
    signal: AbortSignal.timeout(20_000),
  };
  const api = await fetch(IPPAN_COMMITTEE_API, init);
  if (api.ok) return assertCompleteCommittee(parseIppanApiPosts(await api.json()));
  const page = await fetch(IPPAN_COMMITTEE_URL, init);
  if (!page.ok) throw new Error(`IPPAN website returned HTTP ${page.status} to the server`);
  return assertCompleteCommittee(parseIppanCommittee(await page.text()));
}

/** Secretariat staff from ippan.org.np/secretariat (same card layout as the committee page) */
export async function fetchIppanSecretariat(): Promise<IppanCommitteeMember[]> {
  const page = await fetch(IPPAN_SECRETARIAT_URL, {
    headers: { "User-Agent": "Mozilla/5.0 (compatible; HIGEX-member-sync)", Accept: "text/html" },
    cache: "no-store",
    signal: AbortSignal.timeout(20_000),
  });
  if (!page.ok) throw new Error(`IPPAN secretariat page returned HTTP ${page.status}`);
  const staff = parseIppanCommittee(await page.text());
  if (staff.length < MIN_SECRETARIAT_SIZE) throw new Error(`Only found ${staff.length} secretariat members; page may have changed`);
  return staff;
}

const slug = (s: string) => nameKey(s).replace(/ /g, "-");

/**
 * The members list after syncing IPPAN entries with the committee page. Existing people keep
 * their id, photo, bio, category and featured flag (only the position is updated); new people get
 * the IPPAN photo; people no longer on the page are dropped. Non-IPPAN members are untouched.
 */
export function planIppanSync(
  current: any[],
  executive: IppanCommitteeMember[],
  secretariat: IppanCommitteeMember[] | null = null
): IppanSyncPlan {
  // Committee first; anyone also on the committee is not repeated as secretariat. When the
  // secretariat page could not be read (null) its existing members are kept as they are.
  const execKeys = new Set(executive.map((c) => nameKey(c.name)));
  const staff = (secretariat ?? []).filter((c) => !execKeys.has(nameKey(c.name)));
  const keptStaff = secretariat === null ? current.filter((m) => m.orgType === "IPPAN" && m.category === SECRETARIAT_CATEGORY && !execKeys.has(nameKey(m.name))) : [];
  const committee = [...executive, ...staff.map((c) => ({ ...c, category: SECRETARIAT_CATEGORY }))];
  const existing = new Map<string, any>();
  for (const m of current) if (m.orgType === "IPPAN") existing.set(nameKey(m.name), m);

  const added: IppanSyncPlan["added"] = [];
  const updated: IppanSyncPlan["updated"] = [];
  const seen = new Set<string>();
  for (const m of keptStaff) seen.add(nameKey(m.name));
  const ippanMembers = committee.map((c: IppanCommitteeMember) => {
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
      category: c.category || "IPPAN Leadership",
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
  const members = [...others.slice(0, insertAt), ...ippanMembers, ...keptStaff.map((m) => existing.get(nameKey(m.name)) ?? m), ...others.slice(insertAt)];

  return { members, added, removed, updated, committeeSize: executive.length };
}
