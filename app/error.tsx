"use client";

export default function ErrorPage({
  error: _error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
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
