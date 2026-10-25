"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { FilePlus, FileText, Upload } from "lucide-react";
import { AppHeader } from "@/components/app-header";
import { Button } from "@/components/ui/button";
import { ImportModal } from "@/components/import/import-modal";
import { formatRelativeTime } from "@/lib/dates";
import type { SessionUser } from "@/lib/auth";

function RelativeTime({ value }: { value: string }) {
  const [label, setLabel] = useState("");
  useEffect(() => {
    setLabel(formatRelativeTime(value));
  }, [value]);
  return <>{label}</>;
}

export type DocListItem = {
  id: string;
  title: string;
  updatedAt: string;
  owner: { id: string; name: string; email: string };
  role: "VIEW" | "EDIT";
};

type Filter = "all" | "owned" | "shared";

export function DocsHome({
  user,
  owned,
  shared,
}: {
  user: SessionUser;
  owned: DocListItem[];
  shared: DocListItem[];
}) {
  const [creating, setCreating] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [error, setError] = useState("");
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [draftTitle, setDraftTitle] = useState("");
  const [ownedDocs, setOwnedDocs] = useState(owned);
  const [sharedDocs, setSharedDocs] = useState(shared);
  const [filter, setFilter] = useState<Filter>("all");
  const deletedIds = useRef(new Set<string>());

  useEffect(() => {
    setOwnedDocs(owned.filter((doc) => !deletedIds.current.has(doc.id)));
  }, [owned]);
  useEffect(() => {
    setSharedDocs(shared);
  }, [shared]);

  const showOwned = filter !== "shared";
  const showShared = filter !== "owned";
  const empty = ownedDocs.length === 0 && sharedDocs.length === 0;
  const visibleEmpty =
    (filter === "owned" && ownedDocs.length === 0) ||
    (filter === "shared" && sharedDocs.length === 0) ||
    empty;

  async function createDocument() {
    setCreating(true);
    setError("");
    try {
      const response = await fetch("/api/documents", { method: "POST" });
      const data = (await response.json()) as { id?: string; error?: string };
      if (!response.ok || !data.id) {
        setError(data.error ?? "Could not create a document.");
        return;
      }
      window.location.assign(`/docs/${data.id}`);
    } catch {
      setError("Network error. Try again.");
    } finally {
      setCreating(false);
    }
  }

  async function rename(id: string, title: string) {
    const next = title.trim() || "Untitled";
    setOwnedDocs((docs) => docs.map((doc) => (doc.id === id ? { ...doc, title: next } : doc)));
    setRenamingId(null);
    await fetch(`/api/documents/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: next }),
    });
  }

  async function remove(id: string) {
    const snapshot = ownedDocs;
    deletedIds.current.add(id);
    setOwnedDocs((docs) => docs.filter((doc) => doc.id !== id));
    const response = await fetch(`/api/documents/${id}`, { method: "DELETE" });
    if (!response.ok) {
      deletedIds.current.delete(id);
      setOwnedDocs(snapshot);
      const data = (await response.json().catch(() => ({}))) as { error?: string };
      setError(data.error ?? "Could not delete that document.");
    }
  }

  return (
    <div className="min-h-screen bg-surface pt-16">
      <AppHeader user={user} />
      <main className="relative mx-auto w-full max-w-5xl px-6 pb-16">
        <header className="flex flex-col justify-between gap-6 py-10 md:flex-row md:items-end">
          <div className="max-w-xl">
            <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.06em] text-muted">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-accent-deep" />
              Personal sanctuary and archive
            </div>
            <h1 className="mt-2 font-serif text-4xl font-semibold tracking-tight">Documents</h1>
            <p className="mt-2 font-serif text-lg italic text-ink-secondary">
              Write locally, save quietly, share when you are ready.
            </p>
          </div>
          <div className="flex shrink-0 gap-2">
            <Button variant="secondary" onClick={() => setImportOpen(true)} data-testid="import-open">
              <Upload className="h-4 w-4" />
              Import
            </Button>
            <Button onClick={createDocument} disabled={creating} data-testid="new-document">
              <FilePlus className="h-4 w-4" />
              {creating ? "Creating…" : "New document"}
            </Button>
          </div>
        </header>

        <section className="mb-6 rounded-xl bg-subdued p-2 shadow-sm">
          <div className="flex flex-wrap items-center gap-1" role="tablist" aria-label="Document filters">
            {(
              [
                ["all", "All documents"],
                ["owned", "My documents"],
                ["shared", "Shared with me"],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={filter === id}
                onClick={() => setFilter(id)}
                className={`rounded-lg px-4 py-1.5 text-sm transition-colors ${
                  filter === id
                    ? "bg-canvas font-semibold text-accent-deep shadow-sm"
                    : "text-muted hover:bg-paper hover:text-ink"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </section>

        {error ? <p className="mb-4 text-sm text-danger">{error}</p> : null}

        {visibleEmpty ? (
          <div className="rounded-2xl border border-dashed border-line-strong bg-canvas px-6 py-16 text-center shadow-[0_1px_3px_rgba(28,26,23,0.04)]">
            <p className="font-serif text-xl">Nothing here yet</p>
            <p className="mt-2 text-sm text-muted">Create a document or import a .txt, .md, or .docx file.</p>
          </div>
        ) : null}

        {showOwned && ownedDocs.length > 0 ? (
          <section className="mt-6">
            <div className="mb-3 flex items-center justify-between px-1">
              <h2 className="text-[11px] font-semibold uppercase tracking-[0.06em] text-muted">My documents</h2>
              <span className="hidden text-[11px] text-muted sm:inline">{ownedDocs.length} owned</span>
            </div>
            <ul className="overflow-hidden rounded-xl bg-canvas shadow-[0_1px_3px_rgba(28,26,23,0.04)]">
              {ownedDocs.map((doc, index) => (
                <li key={doc.id}>
                  {index > 0 ? <div className="h-px bg-subdued" /> : null}
                  <div className="flex flex-col justify-between gap-3 px-5 py-4 transition-colors hover:bg-subdued sm:flex-row sm:items-center">
                    {renamingId === doc.id ? (
                      <div className="flex min-w-0 flex-1 items-start gap-4">
                        <div className="mt-0.5 grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-subdued text-accent-deep">
                          <FileText className="h-5 w-5" />
                        </div>
                        <input
                          autoFocus
                          value={draftTitle}
                          onChange={(event) => setDraftTitle(event.target.value)}
                          onBlur={() => rename(doc.id, draftTitle)}
                          onKeyDown={(event) => {
                            if (event.key === "Enter") rename(doc.id, draftTitle);
                            if (event.key === "Escape") setRenamingId(null);
                          }}
                          className="min-w-0 flex-1 rounded-lg border border-line-strong bg-canvas px-2 py-1 text-sm outline-none ring-accent/20 focus:ring-4"
                        />
                      </div>
                    ) : (
                      <Link
                        href={`/docs/${doc.id}`}
                        className="flex min-w-0 flex-1 items-start gap-4"
                        onClick={(event) => {
                          event.preventDefault();
                          window.location.assign(`/docs/${doc.id}`);
                        }}
                      >
                        <div className="mt-0.5 grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-subdued text-accent-deep">
                          <FileText className="h-5 w-5" />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-serif text-xl font-medium">{doc.title}</p>
                          <p className="mt-0.5 text-[13px] text-muted">
                            Edited <RelativeTime value={doc.updatedAt} /> · You own this
                          </p>
                        </div>
                      </Link>
                    )}
                    <div className="flex shrink-0 items-center gap-1 self-end sm:self-center">
                      <button
                        type="button"
                        className="rounded-lg px-2.5 py-1 text-[11px] font-semibold text-muted hover:bg-paper hover:text-ink"
                        onClick={() => {
                          setRenamingId(doc.id);
                          setDraftTitle(doc.title);
                        }}
                      >
                        Rename
                      </button>
                      <button
                        type="button"
                        className="rounded-lg px-2.5 py-1 text-[11px] font-semibold text-muted hover:bg-danger-soft hover:text-danger"
                        onClick={() => remove(doc.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {showShared && !visibleEmpty ? (
          <section className="mt-8">
            <div className="mb-3 flex items-center justify-between px-1">
              <h2 className="text-[11px] font-semibold uppercase tracking-[0.06em] text-muted">Shared with me</h2>
              <span className="hidden text-[11px] text-muted sm:inline">{sharedDocs.length} shared</span>
            </div>
            {sharedDocs.length === 0 ? (
              <p className="text-sm text-muted">Nothing shared yet.</p>
            ) : (
              <ul className="overflow-hidden rounded-xl bg-canvas shadow-[0_1px_3px_rgba(28,26,23,0.04)]">
                {sharedDocs.map((doc, index) => (
                  <li key={doc.id}>
                    {index > 0 ? <div className="h-px bg-subdued" /> : null}
                    <Link
                      href={`/docs/${doc.id}`}
                      className="flex items-start gap-4 px-5 py-4 transition-colors hover:bg-subdued"
                      onClick={(event) => {
                        event.preventDefault();
                        window.location.assign(`/docs/${doc.id}`);
                      }}
                    >
                      <div className="mt-0.5 grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-subdued text-accent-deep">
                        <FileText className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-serif text-xl font-medium">{doc.title}</p>
                        <p className="mt-0.5 text-[13px] text-muted">
                          Shared by {doc.owner.name} · {doc.role === "EDIT" ? "Can edit" : "View only"}
                          {" · "}
                          <RelativeTime value={doc.updatedAt} />
                        </p>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        ) : null}
      </main>
      {importOpen ? (
        <ImportModal
          onClose={() => setImportOpen(false)}
          onImported={(doc) => {
            setOwnedDocs((docs) => [
              {
                id: doc.id,
                title: doc.title,
                updatedAt: new Date().toISOString(),
                owner: { id: user.id, name: user.name, email: user.email },
                role: "EDIT",
              },
              ...docs.filter((item) => item.id !== doc.id),
            ]);
          }}
        />
      ) : null}
    </div>
  );
}
