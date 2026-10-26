// Plain-text content for /llms.txt and /llms-full.txt (https://llmstxt.org).
// Built from the same data files the site renders, so AI assistants quote current facts.
import { CONTACT_DETAILS } from "@/data/contactInfo";
import { EXPO_EVENT_META, SPACE_DETAILS, SPONSORSHIP_DETAILS } from "@/data/officialTariffsData";
import { editionsData } from "@/data/editions";
import { sectorsData } from "@/data/sectors";
import { faqsData } from "@/data/faqs";
import { speakersData } from "@/data/speakers";
import { sponsorsData } from "@/data/sponsors";
import { exhibitorsData } from "@/data/exhibitors";
import { SITE_URL } from "@/lib/site";

const c = CONTACT_DETAILS;

function header() {
  return `# Himalayan Green Energy Expo 2027

> South Asia's clean energy exhibition and conference (5th edition), ${c.venue.dates} (${c.venue.bikramSambatDates}) at ${c.venue.shortName}, ${c.venue.city}. Theme: "${EXPO_EVENT_META.theme}". Jointly organised by the Independent Power Producers' Association, Nepal (IPPAN) and Event Solution Pvt. Ltd.

The Expo brings together hydropower and renewable energy developers, independent power producers, EPC contractors, equipment and technology suppliers, financiers, policymakers and researchers. It includes an exhibition, a conference programme, B2B networking, a networking dinner and an EV Rally.

## Key facts
- Dates: ${c.venue.dates}
- Venue: ${c.venue.name} (${c.venue.address})
- Trade visitor registration: free, online at ${SITE_URL}/register
- Exhibitors: book stalls at ${SITE_URL}/book-stall (floor plan: ${SITE_URL}/floor-plan)
- Networking dinner: ${EXPO_EVENT_META.networkingDinnerVenue}, ${EXPO_EVENT_META.networkingDinnerNationalPrice} (Nepali) / ${EXPO_EVENT_META.networkingDinnerInternationalPrice} (international)
- Contact: ${c.emails.expo} · ${c.mobiles[0].display} · WhatsApp ${c.whatsapp.display}
- Office: ${c.address.full}
`;
}

function stallRates() {
  const rows = SPACE_DETAILS.map(
    (s) => `- ${s.block}: ${s.size}, ${s.spaceType} — NPR ${s.rateNPR} / USD ${s.rateUSD}${s.notes ? ` (${s.notes})` : ""}`
  );
  return `## Stall rates
${rows.join("\n")}
${EXPO_EVENT_META.notes.map((n) => `- ${n}`).join("\n")}
`;
}

function sponsorshipSummary() {
  const rows = SPONSORSHIP_DETAILS.map((t) => `- ${t.tier}: NPR ${t.amountNPR} / USD ${t.amountUSD}`);
  return `## Sponsorship packages
${rows.join("\n")}
Full benefits: ${SITE_URL}/sponsors · Book: ${SITE_URL}/book-stall
`;
}

function sponsorshipFull() {
  const rows = SPONSORSHIP_DETAILS.map(
    (t) =>
      `### ${t.tier}
- Price: NPR ${t.amountNPR} / USD ${t.amountUSD}
- Bare space: ${t.bareSpace}
- Promotional display areas: ${t.promotionalDisplayArea}
- Inauguration invitation passes: ${t.inaugurationInvitationPass}
- Networking dinner passes: ${t.networkingDinnerPass}
- Exhibitor passes: ${t.exhibitorPass}
- Normal passes: ${t.normalPass}`
  );
  return `## Sponsorship packages\n\n${rows.join("\n\n")}\n`;
}

function editions() {
  const rows = editionsData.map(
    (e) => `- ${e.year} — ${e.edition}${e.isUpcoming ? " (upcoming)" : ""}: ${e.description}${e.highlightStat ? ` (${e.highlightStat})` : ""}`
  );
  return `## Past and upcoming editions\n${rows.join("\n")}\n`;
}

function sectorsSummary() {
  return `## Exhibition sectors\n${sectorsData.map((s) => `- ${s.title}`).join("\n")}\n`;
}

function sectorsFull() {
  const rows = sectorsData.map((s) => `### ${s.title}\n${s.description}\n- Includes: ${s.subsectors.join("; ")}`);
  return `## Exhibition sectors\n\n${rows.join("\n\n")}\n`;
}

function pages() {
  return `## Pages
- [Register as a visitor or delegate](${SITE_URL}/register)
- [Exhibit and book a stall](${SITE_URL}/exhibit)
- [Interactive floor plan](${SITE_URL}/floor-plan)
- [Exhibitors](${SITE_URL}/exhibitors)
- [Sponsors and partners](${SITE_URL}/sponsors)
- [Conference programme](${SITE_URL}/conference)
- [Speakers](${SITE_URL}/speakers)
- [Networking dinner](${SITE_URL}/networking-dinner)
- [EV Rally](${SITE_URL}/ev-rally)
- [Plan your visit](${SITE_URL}/visit)
- [Venue](${SITE_URL}/venue)
- [News](${SITE_URL}/news)
- [FAQ](${SITE_URL}/faq)
- [Contact](${SITE_URL}/contact)
`;
}

export function buildLlmsTxt() {
  return [
    header(),
    stallRates(),
    sponsorshipSummary(),
    sectorsSummary(),
    editions(),
    pages(),
    `## Optional\n- [Full details: FAQ, speakers, partners, news](${SITE_URL}/llms-full.txt)\n`,
  ].join("\n");
}

type NewsItem = { title?: string; slug?: string; id?: string; date?: string; summary?: string };

export function buildLlmsFullTxt(news: NewsItem[]) {
  const faq = faqsData.map((f) => `### ${f.question}\n${f.answer}`).join("\n\n");

  const speakers = speakersData
    .map((s) => `- ${s.name} — ${s.title}, ${s.organization}${s.bio ? `. ${s.bio}` : ""}`)
    .join("\n");

  const partners = sponsorsData
    .map((cat) => `### ${cat.tier}\n${cat.sponsors.map((s) => `- ${s.name} (${s.type})`).join("\n")}`)
    .join("\n\n");

  const exhibitors = exhibitorsData.length
    ? exhibitorsData
        .map((e) => `- [${e.name}](${SITE_URL}/exhibitors/${e.slug}) — ${e.category}, ${e.country}, stall ${e.boothNumber}`)
        .join("\n")
    : `The exhibitor list is published at ${SITE_URL}/exhibitors as bookings are confirmed.`;

  const articles = news
    .filter((a) => a.title && (a.slug || a.id))
    .map(
      (a) =>
        `- [${a.title}](${SITE_URL}/news/${encodeURIComponent(a.slug || a.id!)})${a.date ? ` (${a.date})` : ""}${a.summary ? `: ${a.summary}` : ""}`
    )
    .join("\n");

  return [
    header(),
    stallRates(),
    sponsorshipFull(),
    sectorsFull(),
    editions(),
    `## Frequently asked questions\n\n${faq}\n`,
    `## Speakers and committee\n${speakers}\n`,
    `## Partners and supporters\n\n${partners}\n`,
    `## Exhibitors\n${exhibitors}\n`,
    articles ? `## News\n${articles}\n` : "",
    pages(),
  ]
    .filter(Boolean)
    .join("\n");
}
