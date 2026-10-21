import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

// Private areas are hidden from all crawlers. Search engines and AI assistants are
// welcome on the public pages so they can answer questions about the Expo accurately.
// To opt out of AI training, add e.g. { userAgent: ["GPTBot", "CCBot", "Google-Extended"], disallow: "/" }.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/staff", "/api/", "/verify", "/payment/", "/floor-plan/builder"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
