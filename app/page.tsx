import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";

export default async function HomePage() {
  // #region agent log
  fetch("http://127.0.0.1:7515/ingest/50601b8e-2e31-41a1-b6c4-bc41327995aa", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "ae0ad2" },
    body: JSON.stringify({
      sessionId: "ae0ad2",
      runId: "pre-fix",
      hypothesisId: "C",
      location: "app/page.tsx:HomePage",
      message: "homepage executed",
      data: { ok: true },
      timestamp: Date.now(),
    }),
  }).catch(() => {});
  // #endregion
  const user = await getCurrentUser();
  redirect(user ? "/docs" : "/login");
}
