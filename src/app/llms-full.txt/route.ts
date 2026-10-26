import { buildLlmsFullTxt } from "@/lib/llms";
import { getFirebaseNews } from "@/lib/firebaseDb";

// /llms-full.txt — the long version of /llms.txt: full FAQ, packages, speakers, partners and news.
// Rebuilt hourly so new news articles appear without a redeploy
export const revalidate = 3600;

export async function GET() {
  let news: any[] = [];
  try {
    news = (await getFirebaseNews()) || [];
  } catch {
    // News is optional; the rest of the file is still useful
  }
  return new Response(buildLlmsFullTxt(news), { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
