export default function DocsLoading() {
  return (
    <div className="min-h-screen bg-surface pt-16">
      <div className="h-16 bg-surface/90" />
      <div className="mx-auto max-w-5xl px-6 py-10">
        <div className="h-10 w-48 animate-pulse rounded-lg bg-canvas" />
        <div className="mt-8 h-12 animate-pulse rounded-xl bg-subdued" />
        <div className="mt-6 h-40 animate-pulse rounded-xl bg-canvas" />
      </div>
    </div>
  );
}
