// Turns the Traffic Sources numbers into actionable suggestions.
// ruleBasedInsights() always works offline; the AI endpoint builds on the same summary.
import { sourceLabel } from "./attribution";

export interface TrafficSummary {
  days: number;
  totalVisits: number;
  socialVisits?: number;
  trackedSignups?: number;
  sources: { source: string; visits: number; registrations: number; inquiries: number }[];
  campaigns: { campaign: string; source: string; visits: number }[];
  landingPages: { page: string; visits: number }[];
  devices: Record<string, number>;
  countries: Record<string, number>;
  crawlers: { category: string; bot: string; hits: number }[];
  funnel?: { flow: string; started: number; submitted: number }[];
  payments?: { success: number; failed: number };
}

export interface Insight {
  title: string;
  detail: string;
  priority: "high" | "medium" | "low";
}

const SOCIAL = ["facebook", "instagram", "linkedin", "twitter", "youtube", "tiktok", "whatsapp", "viber", "telegram", "threads"];

export function ruleBasedInsights(s: TrafficSummary): Insight[] {
  const out: Insight[] = [];
  if (s.totalVisits === 0) {
    return [
      {
        title: "No visits recorded yet",
        detail: "Share tagged links (use the link builder below) on your social pages to start collecting data.",
        priority: "high",
      },
    ];
  }

  const direct = s.sources.find((x) => x.source === "direct");
  const directShare = direct ? direct.visits / s.totalVisits : 0;
  if (directShare > 0.4) {
    out.push({
      title: `${Math.round(directShare * 100)}% of visits have no known source`,
      detail:
        "Instagram, WhatsApp and TikTok usually hide where visitors come from. Put tagged links from the link builder in your bio, stories, WhatsApp broadcasts and printed QR codes.",
      priority: "high",
    });
  }

  const withConversions = s.sources.filter((x) => x.source !== "direct" && x.source !== "admin" && x.visits >= 20);
  const rate = (x: { visits: number; registrations: number; inquiries: number }) => (x.registrations + x.inquiries) / x.visits;
  const best = [...withConversions].sort((a, b) => rate(b) - rate(a))[0];
  if (best && rate(best) > 0) {
    out.push({
      title: `${sourceLabel(best.source)} converts best`,
      detail: `${((rate(best)) * 100).toFixed(1)}% of ${sourceLabel(best.source)} visitors registered or booked. Consider posting there more often or boosting your best posts.`,
      priority: "medium",
    });
  }
  const leaky = withConversions.filter((x) => x.visits >= 50 && rate(x) === 0);
  leaky.forEach((x) =>
    out.push({
      title: `${sourceLabel(x.source)} brings visits but no sign-ups`,
      detail: `${x.visits} visits from ${sourceLabel(x.source)} and no registrations yet. Link those posts straight to /register or /book-stall with a clear call to action instead of the home page.`,
      priority: "medium",
    })
  );

  const socialTotal = s.sources.filter((x) => SOCIAL.includes(x.source)).reduce((n, x) => n + x.visits, 0);
  if (socialTotal / s.totalVisits < 0.15) {
    out.push({
      title: "Social media is a small share of traffic",
      detail: "Under 15% of visits come from social networks. Regular posts on Facebook and LinkedIn (where energy-sector professionals are) can grow registrations.",
      priority: "low",
    });
  }

  const hasLinkedIn = s.sources.some((x) => x.source === "linkedin" && x.visits > 0);
  if (!hasLinkedIn) {
    out.push({
      title: "No LinkedIn traffic yet",
      detail: "LinkedIn is where exhibitors, sponsors and delegates are. Share exhibitor announcements and speaker posts there with tagged links.",
      priority: "low",
    });
  }

  const mobile = s.devices.mobile || 0;
  if (mobile / s.totalVisits > 0.6) {
    out.push({
      title: `${Math.round((mobile / s.totalVisits) * 100)}% of visitors are on mobile`,
      detail: "Test the registration and stall-booking flows on a phone regularly; that is where most of your audience is.",
      priority: "low",
    });
  }

  if (s.campaigns.length === 0) {
    out.push({
      title: "No campaigns are being tracked",
      detail: "Add a campaign name (e.g. gala-dinner-launch) when building links, so you can compare which posts and announcements work best.",
      priority: "low",
    });
  }

  (s.funnel || [])
    .filter((f) => f.started >= 10 && f.submitted / f.started < 0.3)
    .forEach((f) =>
      out.push({
        title: `Most people abandon the ${f.flow.replace("_", " ")} form`,
        detail: `${f.started} started but only ${f.submitted} submitted (${Math.round((f.submitted / f.started) * 100)}%). Try shortening the form, making required fields clearer, and testing it on a phone.`,
        priority: "high",
      })
    );
  if (s.payments && s.payments.failed >= 3 && s.payments.failed > s.payments.success) {
    out.push({
      title: "More payments fail than succeed",
      detail: `${s.payments.failed} failed vs ${s.payments.success} successful payments. Check the payment gateway setup and offer bank transfer / QR as a clear alternative.`,
      priority: "high",
    });
  }

  const aiCrawls = s.crawlers.filter((c) => c.category === "ai").reduce((n, c) => n + c.hits, 0);
  if (aiCrawls > 0) {
    out.push({
      title: "AI assistants are reading your site",
      detail: `${aiCrawls} visits from AI crawlers (ChatGPT, Claude, Perplexity…). Keep key facts — dates, venue, prices, how to register — written clearly in page text so AI answers about the Expo are accurate.`,
      priority: "low",
    });
  }

  return out;
}
