import Link from "next/link";

export default function DocumentNotFound() {
  return (
    <main className="grid min-h-screen place-items-center bg-surface px-4">
      <div className="max-w-md text-center">
        <p className="font-serif text-3xl font-semibold">Document not found</p>
        <p className="mt-2 text-sm text-muted">
          It may have been deleted, or you do not have access. Titles of private documents are not shown.
        </p>
        <Link href="/docs" className="mt-6 inline-block text-sm text-accent underline">
          Back to documents
        </Link>
      </div>
    </main>
  );
}
