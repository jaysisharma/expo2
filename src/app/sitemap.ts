import type { MetadataRoute } from "next";
import { SITE_URL, PUBLIC_ROUTES } from "@/lib/site";
import { exhibitorsData } from "@/data/exhibitors";
import { getFirebaseNews } from "@/lib/firebaseDb";

// Rebuilt hourly so new news articles appear without a redeploy
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const pages = PUBLIC_ROUTES.map((r) => ({
    url: `${SITE_URL}${r.path === "/" ? "" : r.path}`,
    lastModified: now,
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }));

  const exhibitors = exhibitorsData
    .filter((e) => e.slug)
    .map((e) => ({
      url: `${SITE_URL}/exhibitors/${e.slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.5,
    }));

  let news: MetadataRoute.Sitemap = [];
  try {
    const articles = (await getFirebaseNews()) || [];
    news = articles
      .filter((a: any) => a.slug || a.id)
      .map((a: any) => {
        const date = new Date(a.updatedAt || a.date || a.publishedAt || now);
        return {
          url: `${SITE_URL}/news/${encodeURIComponent(a.slug || a.id)}`,
          lastModified: isNaN(date.getTime()) ? now : date,
          changeFrequency: "monthly" as const,
          priority: 0.6,
        };
      });
  } catch {
    // News is optional; the sitemap still lists every other page
  }

  return [...pages, ...exhibitors, ...news];
}
