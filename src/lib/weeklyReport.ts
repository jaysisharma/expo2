// Builds the weekly traffic report email (server only).
import "server-only";
import { sourceLabel } from "./attribution";
import { escapeHtml } from "./resend";
import { SITE_URL } from "./site";
import { FUNNEL_LABELS } from "./trafficSummary";
import type { Insight, TrafficSummary } from "./trafficInsights";

const GREEN = "#218A59";

function row(cells: (string | number)[], header = false) {
  const tag = header ? "th" : "td";
  return `<tr>${cells
    .map(
      (c, i) =>
        `<${tag} style="padding:6px 10px;border-bottom:1px solid #e2e8f0;font-size:13px;text-align:${i === 0 ? "left" : "right"};${
          header ? "color:#64748b;font-size:11px;text-transform:uppercase;" : "color:#0f172a;"
        }">${typeof c === "number" ? c.toLocaleString() : c}</${tag}>`
    )
    .join("")}</tr>`;
}

function section(title: string, body: string) {
  return `<h2 style="font-size:15px;margin:28px 0 8px;color:#0f172a;">${title}</h2>${body}`;
}

function table(header: string[], rows: (string | number)[][]) {
  if (rows.length === 0) return `<p style="font-size:13px;color:#64748b;">No data this week.</p>`;
  return `<table cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;">${row(header, true)}${rows
    .map((r) => row(r))
    .join("")}</table>`;
}

export function renderWeeklyReport(summary: TrafficSummary, insights: Insight[], aiUsed: boolean) {
  const kpi = (label: string, value: string | number) =>
    `<td style="padding:12px;border:1px solid #e2e8f0;border-radius:8px;width:25%;"><div style="font-size:11px;color:#64748b;text-transform:uppercase;">${label}</div><div style="font-size:22px;font-weight:700;color:#0f172a;">${
      typeof value === "number" ? value.toLocaleString() : value
    }</div></td>`;

  const topSource = summary.sources.find((s) => s.source !== "direct");
  const payments = summary.payments || { success: 0, failed: 0 };

  const html = `<!doctype html><html><body style="margin:0;background:#f8fafc;font-family:Arial,Helvetica,sans-serif;">
<div style="max-width:640px;margin:0 auto;padding:24px;background:#ffffff;">
  <div style="font-size:11px;letter-spacing:2px;color:${GREEN};text-transform:uppercase;font-weight:700;">Weekly traffic report</div>
  <h1 style="font-size:22px;margin:6px 0 4px;color:#0f172a;">Himalayan Green Energy Expo website — last ${summary.days} days</h1>
  <p style="font-size:13px;color:#64748b;margin:0 0 16px;">Where visitors came from, what they signed up for, and what to do next.</p>

  <table cellpadding="0" cellspacing="6" style="width:100%;"><tr>
    ${kpi("Visits", summary.totalVisits)}
    ${kpi("Top source", topSource ? escapeHtml(sourceLabel(topSource.source)) : "—")}
    ${kpi("From social", summary.totalVisits ? `${Math.round(((summary.socialVisits || 0) / summary.totalVisits) * 100)}%` : "0%")}
    ${kpi("Sign-ups", summary.trackedSignups || 0)}
  </tr></table>

  ${section(
    aiUsed ? "AI suggestions" : "Suggestions",
    `<ul style="padding-left:18px;margin:0;">${insights
      .map(
        (i) =>
          `<li style="margin-bottom:10px;font-size:13px;color:#334155;"><strong style="color:#0f172a;">${escapeHtml(i.title)}</strong> <span style="font-size:10px;color:${
            i.priority === "high" ? "#be123c" : i.priority === "medium" ? "#b45309" : "#64748b"
          };text-transform:uppercase;">${i.priority}</span><br/>${escapeHtml(i.detail)}</li>`
      )
      .join("")}</ul>`
  )}

  ${section(
    "By source",
    table(
      ["Source", "Visits", "Registrations", "Inquiries / bookings"],
      summary.sources.slice(0, 12).map((s) => [escapeHtml(sourceLabel(s.source)), s.visits, s.registrations, s.inquiries])
    )
  )}

  ${section(
    "Form funnel",
    table(
      ["Form", "Started", "Submitted", "Completion"],
      (summary.funnel || []).map((f) => [
        FUNNEL_LABELS[f.flow] || f.flow,
        f.started,
        f.submitted,
        f.started ? `${Math.min(100, Math.round((f.submitted / f.started) * 100))}%` : "—",
      ])
    ) + `<p style="font-size:12px;color:#64748b;">Payments: ${payments.success} succeeded · ${payments.failed} failed</p>`
  )}

  ${section(
    "Campaigns",
    table(["Campaign", "Visits"], summary.campaigns.slice(0, 8).map((c) => [`${escapeHtml(c.campaign)} <span style="color:#64748b;">(${escapeHtml(sourceLabel(c.source))})</span>`, c.visits]))
  )}

  ${section("Top landing pages", table(["Page", "Visits"], summary.landingPages.slice(0, 8).map((l) => [escapeHtml(l.page), l.visits])))}

  ${section(
    "Web crawlers",
    table(["Crawler", "Page fetches"], summary.crawlers.slice(0, 8).map((c) => [escapeHtml(c.bot), c.hits]))
  )}

  <p style="margin-top:28px;"><a href="${SITE_URL}/admin/traffic" style="display:inline-block;background:${GREEN};color:#ffffff;text-decoration:none;padding:10px 18px;border-radius:8px;font-size:13px;font-weight:700;">Open the Traffic Sources dashboard</a></p>
  <p style="font-size:11px;color:#94a3b8;margin-top:20px;">Sent automatically every Monday. Change recipients with the REPORT_EMAILS setting.</p>
</div></body></html>`;

  return {
    subject: `Expo website weekly report: ${summary.totalVisits.toLocaleString()} visits, ${summary.trackedSignups || 0} sign-ups`,
    html,
  };
}
