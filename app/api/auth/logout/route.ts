import { NextResponse } from "next/server";
import { destroySession } from "@/lib/auth";

export async function POST() {
  const response = NextResponse.json({ ok: true });
  await destroySession(response);
  // #region agent log
  fetch("http://127.0.0.1:7515/ingest/50601b8e-2e31-41a1-b6c4-bc41327995aa", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "ae0ad2" },
    body: JSON.stringify({
      sessionId: "ae0ad2",
      runId: "pre-fix",
      hypothesisId: "H1",
      location: "app/api/auth/logout/route.ts:POST",
      message: "logout response prepared",
      data: { cleared: true },
      timestamp: Date.now(),
    }),
  }).catch(() => {});
  // #endregion
  return response;
}
