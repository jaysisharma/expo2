import { NextResponse } from "next/server";
import { getFirebaseMembers, saveFirebaseMembers } from "@/lib/firebaseDb";
import { getAdminSession } from "@/lib/session";
import {
  assertCompleteCommittee,
  fetchIppanCommittee,
  planIppanSync,
  MAX_AUTO_REMOVALS,
  IPPAN_COMMITTEE_URL,
  type IppanCommitteeMember,
} from "@/lib/ippanCommittee";
import { sanitizeCommittee } from "@/lib/ippanCommitteeSource";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

async function buildPlan(committee?: IppanCommitteeMember[]) {
  const current = await getFirebaseMembers();
  if (!current || current.length === 0) {
    throw new Error("No saved members list yet. Open Admin → Members once so it is saved, then sync.");
  }
  return planIppanSync(current, committee ? assertCompleteCommittee(committee) : await fetchIppanCommittee());
}

const summary = (plan: Awaited<ReturnType<typeof buildPlan>>) => ({
  source: IPPAN_COMMITTEE_URL,
  committeeSize: plan.committeeSize,
  added: plan.added,
  removed: plan.removed,
  updated: plan.updated,
  changed: plan.added.length + plan.removed.length + plan.updated.length > 0,
});

// GET: run daily by the Vercel cron (see vercel.json), authorised with CRON_SECRET, and applied
// automatically unless it would remove more than MAX_AUTO_REMOVALS people.
// Admins get a preview of the changes without saving anything.
export async function GET(req: Request) {
  const cronSecret = process.env.CRON_SECRET;
  const isCron = !!cronSecret && req.headers.get("authorization") === `Bearer ${cronSecret}`;
  const isAdmin = !isCron && !!(await getAdminSession(req));
  if (!isCron && !isAdmin) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  try {
    const plan = await buildPlan();
    const result = summary(plan);
    if (isAdmin) return NextResponse.json({ success: true, preview: true, ...result });

    if (!result.changed) return NextResponse.json({ success: true, applied: false, ...result });
    if (plan.removed.length > MAX_AUTO_REMOVALS) {
      console.warn(`[ippan-members] ${plan.removed.length} removals need an admin to review; not applied`);
      return NextResponse.json({ success: true, applied: false, needsReview: true, ...result });
    }
    const ok = await saveFirebaseMembers(plan.members);
    console.log(`[ippan-members] cron sync: +${plan.added.length} -${plan.removed.length} ~${plan.updated.length} saved=${ok}`);
    return NextResponse.json({ success: ok, applied: ok, ...result }, { status: ok ? 200 : 500 });
  } catch (error: any) {
    console.error("[ippan-members]", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 502 });
  }
}

// POST: admin syncs now (the "Sync from IPPAN" button). The admin page reads the committee in the
// browser and sends it as `committee`; `dryRun` returns the preview without saving.
export async function POST(req: Request) {
  if (!(await getAdminSession(req))) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = await req.json().catch(() => ({}));
    const plan = await buildPlan(body?.committee ? sanitizeCommittee(body.committee) : undefined);
    if (body?.dryRun) return NextResponse.json({ success: true, preview: true, ...summary(plan) });
    const ok = await saveFirebaseMembers(plan.members);
    return NextResponse.json({ success: ok, applied: ok, members: plan.members, ...summary(plan) }, { status: ok ? 200 : 500 });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 502 });
  }
}
