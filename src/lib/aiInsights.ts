// AI-written traffic suggestions via Vercel AI Gateway (server only).
// Auth: AI_GATEWAY_API_KEY, or the Vercel OIDC token available on Vercel deployments.
import "server-only";
import type { Insight, TrafficSummary } from "./trafficInsights";

const GATEWAY_URL = "https://ai-gateway.vercel.sh/v1/chat/completions";
const MODEL = process.env.AI_GATEWAY_MODEL || "anthropic/claude-haiku-5.5";

export function gatewayToken(req?: Request) {
  return process.env.AI_GATEWAY_API_KEY || req?.headers.get("x-vercel-oidc-token") || process.env.VERCEL_OIDC_TOKEN || null;
}

function parseInsights(text: string): Insight[] {
  const match = text.match(/\[[\s\S]*\]/);
  if (!match) return [];
  const raw = JSON.parse(match[0]);
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((x) => x && typeof x.title === "string" && typeof x.detail === "string")
    .slice(0, 8)
    .map((x) => ({
      title: x.title.slice(0, 140),
      detail: x.detail.slice(0, 600),
      priority: ["high", "medium", "low"].includes(x.priority) ? x.priority : "medium",
    }));
}

/** Returns suggestions, or throws an Error whose message is safe to show to admins. */
export async function generateAiInsights(summary: TrafficSummary, token: string): Promise<{ insights: Insight[]; model: string }> {
  const prompt = `You are a digital marketing analyst for the Himalayan Green Energy Expo 2027 (17–19 January 2027, Bhrikutimandap, Kathmandu, Nepal) — a clean-energy trade show. Its website takes visitor/delegate registrations, exhibitor stall bookings, sponsorships and dinner pass bookings.

Here is website traffic data for the last ${summary.days} days (JSON). "registrations" and "inquiries" are sign-ups attributed to each source; "direct" means the source is unknown (often Instagram/WhatsApp apps hiding the referrer). "funnel" counts how many people started vs submitted each form. Crawlers are bots, not people.

${JSON.stringify(summary).slice(0, 12000)}

Give 3 to 6 specific, practical suggestions to get more visitors, registrations and stall bookings, based on what this data actually shows. Mention numbers from the data. Keep each detail to 1–3 sentences in plain language for a non-technical events team.

Respond with ONLY a JSON array, no other text: [{"title": "...", "detail": "...", "priority": "high" | "medium" | "low"}]`;

  let res: Response;
  try {
    res = await fetch(GATEWAY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ model: MODEL, messages: [{ role: "user", content: prompt }], max_tokens: 1200 }),
    });
  } catch (e) {
    console.warn("[aiInsights] AI request error:", e);
    throw new Error("AI request failed");
  }

  if (!res.ok) {
    throw new Error(res.status === 402 ? "AI credits exhausted" : res.status === 429 ? "AI rate limited" : `AI request failed (${res.status})`);
  }

  const json = await res.json();
  const insights = parseInsights(json?.choices?.[0]?.message?.content || "");
  if (insights.length === 0) throw new Error("AI returned no suggestions");
  return { insights, model: json.model || MODEL };
}
