import { CONTACT_DETAILS } from "@/data/contactInfo";
import { SITE_URL } from "@/lib/site";

// /llms.txt — a plain-text summary that AI assistants (ChatGPT, Claude, Perplexity…)
// can read to answer questions about the Expo accurately. See https://llmstxt.org
export const dynamic = "force-static";

export function GET() {
  const c = CONTACT_DETAILS;
  const body = `# Himalayan Green Energy Expo 2027

> South Asia's clean energy exhibition and conference (5th edition), ${c.venue.dates} (${c.venue.bikramSambatDates}) at ${c.venue.shortName}, ${c.venue.city}. Jointly organised by the Independent Power Producers' Association, Nepal (IPPAN) and Event Solution Pvt. Ltd.

The Expo brings together hydropower and renewable energy developers, independent power producers, EPC contractors, equipment and technology suppliers, financiers, policymakers and researchers. It includes an exhibition, a conference programme, B2B networking, a networking dinner and an EV Rally.

## Key facts
- Dates: ${c.venue.dates}
- Venue: ${c.venue.name} (${c.venue.address})
- Trade visitor registration: free, online at ${SITE_URL}/register
- Exhibitors: book stalls at ${SITE_URL}/book-stall (floor plan: ${SITE_URL}/floor-plan)
- Contact: ${c.emails.expo} · ${c.mobiles[0].display} · WhatsApp ${c.whatsapp.display}
- Office: ${c.address.full}

## Pages
- [Register as a visitor or delegate](${SITE_URL}/register)
- [Exhibit and book a stall](${SITE_URL}/exhibit)
- [Interactive floor plan](${SITE_URL}/floor-plan)
- [Exhibitors](${SITE_URL}/exhibitors)
- [Sponsors and partners](${SITE_URL}/sponsors)
- [Conference programme](${SITE_URL}/conference)
- [Networking dinner](${SITE_URL}/networking-dinner)
- [EV Rally](${SITE_URL}/ev-rally)
- [Plan your visit](${SITE_URL}/visit)
- [Venue](${SITE_URL}/venue)
- [News](${SITE_URL}/news)
- [FAQ](${SITE_URL}/faq)
- [Contact](${SITE_URL}/contact)
`;
  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
