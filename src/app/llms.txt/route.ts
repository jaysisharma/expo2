import { buildLlmsTxt } from "@/lib/llms";

// /llms.txt — a plain-text summary that AI assistants (ChatGPT, Claude, Perplexity…)
// can read to answer questions about the Expo accurately. See https://llmstxt.org
export const dynamic = "force-static";

export function GET() {
  return new Response(buildLlmsTxt(), { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
