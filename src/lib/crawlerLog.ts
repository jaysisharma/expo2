// Logs crawler page hits to Firestore via the REST API (no SDK), so it can run
// inside middleware. One document per day per crawler, with incrementing
// counters, keeps the collection small even when Googlebot crawls heavily.
import { firebaseConfig } from "./firebaseConfig";
import type { CrawlerCategory } from "./crawlers";

export const CRAWLER_COLLECTION = "crawler_stats";

export async function logCrawlerHit(crawler: { name: string; category: CrawlerCategory }, pathname: string) {
  const { projectId, apiKey } = firebaseConfig;
  const date = new Date().toISOString().slice(0, 10);
  const slug = crawler.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const docName = `projects/${projectId}/databases/(default)/documents/${CRAWLER_COLLECTION}/${date}_${slug}`;
  const safePath = pathname.replace(/[`\\]/g, "").slice(0, 120) || "/";

  const body = {
    writes: [
      {
        update: {
          name: docName,
          fields: {
            bot: { stringValue: crawler.name },
            category: { stringValue: crawler.category },
            date: { stringValue: date },
            lastPath: { stringValue: safePath },
            lastSeen: { timestampValue: new Date().toISOString() },
          },
        },
        updateMask: { fieldPaths: ["bot", "category", "date", "lastPath", "lastSeen"] },
        updateTransforms: [
          { fieldPath: "hits", increment: { integerValue: "1" } },
          { fieldPath: `paths.\`${safePath}\``, increment: { integerValue: "1" } },
        ],
      },
    ],
  };

  try {
    await fetch(
      `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents:commit?key=${apiKey}`,
      { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }
    );
  } catch {
    // Logging must never affect the response
  }
}
