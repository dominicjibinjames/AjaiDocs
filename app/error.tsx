"use client";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  // #region agent log
  fetch("http://127.0.0.1:7515/ingest/50601b8e-2e31-41a1-b6c4-bc41327995aa", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "ae0ad2" },
    body: JSON.stringify({
      sessionId: "ae0ad2",
      runId: "pre-fix",
      hypothesisId: "D",
      location: "app/error.tsx:ErrorPage",
      message: "react error boundary",
      data: { name: error.name, digest: error.digest ?? null },
      timestamp: Date.now(),
    }),
  }).catch(() => {});
  // #endregion
  return (
    <main className="grid min-h-screen place-items-center bg-surface px-4">
      <div className="max-w-md text-center">
        <p className="font-serif text-3xl font-semibold">Something went wrong</p>
        <p className="mt-2 text-sm text-muted">
          The page hit an unexpected error. Your latest editor changes may still be in this tab if you were writing.
        </p>
        <button
          type="button"
          onClick={reset}
          className="mt-6 rounded-lg bg-accent px-4 py-2 text-sm text-canvas"
        >
          Try again
        </button>
      </div>
    </main>
  );
}
