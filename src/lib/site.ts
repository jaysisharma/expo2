// Canonical site details used for SEO (sitemap, robots, structured data, share previews).
import { CONTACT_DETAILS } from "@/data/contactInfo";

export const SITE_URL = (process.env.NEXT_PUBLIC_APP_URL || "https://himalayanenergyexpo.com").replace(/\/$/, "");
export const SITE_NAME = "Himalayan Green Energy Expo 2027";
export const SITE_DESCRIPTION =
  "South Asia's apex clean energy convergence — 5th edition. 17–19 January 2027 at Bhrikutimandap, Kathmandu, Nepal. Exhibition, conference, B2B networking and the EV Rally.";

export const EVENT = {
  startDate: "2027-01-17T10:00:00+05:45",
  endDate: "2027-01-19T18:00:00+05:45",
  venueName: CONTACT_DETAILS.venue.shortName,
  streetAddress: "Exhibition Road",
  city: "Kathmandu",
  country: "NP",
};

// Public pages to list in the sitemap (admin, staff, payment and verify pages are excluded)
export const PUBLIC_ROUTES: { path: string; priority: number; changeFrequency: "daily" | "weekly" | "monthly" | "yearly" }[] = [
  { path: "/", priority: 1, changeFrequency: "daily" },
  { path: "/register", priority: 0.9, changeFrequency: "weekly" },
  { path: "/book-stall", priority: 0.9, changeFrequency: "daily" },
  { path: "/exhibit", priority: 0.8, changeFrequency: "weekly" },
  { path: "/floor-plan", priority: 0.8, changeFrequency: "daily" },
  { path: "/exhibitors", priority: 0.8, changeFrequency: "weekly" },
  { path: "/sponsors", priority: 0.7, changeFrequency: "weekly" },
  { path: "/conference", priority: 0.7, changeFrequency: "weekly" },
  { path: "/speakers", priority: 0.7, changeFrequency: "weekly" },
  { path: "/networking-dinner", priority: 0.7, changeFrequency: "weekly" },
  { path: "/gala-dinner", priority: 0.6, changeFrequency: "weekly" },
  { path: "/ev-rally", priority: 0.7, changeFrequency: "weekly" },
  { path: "/visit", priority: 0.7, changeFrequency: "monthly" },
  { path: "/venue", priority: 0.6, changeFrequency: "monthly" },
  { path: "/events", priority: 0.6, changeFrequency: "weekly" },
  { path: "/expo", priority: 0.6, changeFrequency: "monthly" },
  { path: "/features", priority: 0.5, changeFrequency: "monthly" },
  { path: "/news", priority: 0.7, changeFrequency: "daily" },
  { path: "/gallery", priority: 0.5, changeFrequency: "weekly" },
  { path: "/press", priority: 0.5, changeFrequency: "weekly" },
  { path: "/about", priority: 0.6, changeFrequency: "monthly" },
  { path: "/faq", priority: 0.6, changeFrequency: "monthly" },
  { path: "/contact", priority: 0.6, changeFrequency: "yearly" },
  { path: "/privacy-policy", priority: 0.2, changeFrequency: "yearly" },
  { path: "/terms", priority: 0.2, changeFrequency: "yearly" },
  { path: "/cookie-policy", priority: 0.2, changeFrequency: "yearly" },
];
