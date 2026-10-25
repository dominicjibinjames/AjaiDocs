"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Placeholder from "@tiptap/extension-placeholder";
import { ArrowLeft, Share2 } from "lucide-react";
import { AppHeader } from "@/components/app-header";
import { Button } from "@/components/ui/button";
import { ShareDialog, type SharePerson } from "@/components/share/share-dialog";
import { EditorToolbar } from "./toolbar";
import type { SessionUser } from "@/lib/auth";
import type { AccessLevel } from "@/lib/access";
import type { TipTapNode } from "@/lib/document-json";

type SaveState = "saved" | "saving" | "error" | "idle";

export function DocumentEditor({
  user,
  documentId,
  initialTitle,
  initialContent,
  recovered,
  initialAccess,
  owner,
  initialShares,
}: {
  user: SessionUser;
  documentId: string;
  initialTitle: string;
  initialContent: TipTapNode;
  recovered: boolean;
  initialAccess: AccessLevel;
  owner: { id: string; name: string; email: string };
  initialShares: SharePerson[];
}) {
  const [title, setTitle] = useState(initialTitle);
  const [access, setAccess] = useState(initialAccess);
  const [shares, setShares] = useState(initialShares);
  const [shareOpen, setShareOpen] = useState(false);
  const [saveState, setSaveState] = useState<SaveState>("saved");
  const [banner, setBanner] = useState(
    recovered ? "We couldn't restore formatting for this document. You can keep writing." : "",
  );
  const readOnly = access !== "edit";
  const inflight = useRef(false);
  const queued = useRef<{ title?: string; contentJson?: TipTapNode } | null>(null);
  const bodyTimer = useRef<number | null>(null);
  const titleTimer = useRef<number | null>(null);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2] } }),
      Underline,
      Placeholder.configure({ placeholder: "Start writing…" }),
    ],
    content: initialContent,
    editable: !readOnly,
    editorProps: {
      attributes: {
        class: "min-h-[68vh]",
        "data-testid": "editor",
      },
    },
  });

  useEffect(() => {
    editor?.setEditable(!readOnly);
  }, [editor, readOnly]);

  async function flush(payload: { title?: string; contentJson?: TipTapNode }) {
    if (inflight.current) {
      queued.current = { ...queued.current, ...payload };
      return;
    }
    inflight.current = true;
    setSaveState("saving");
    try {
      let next: { title?: string; contentJson?: TipTapNode } | null = payload;
      while (next) {
        const response = await fetch(`/api/documents/${documentId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(next),
        });
        if (response.status === 401) {
          setBanner("Your session expired. Sign in again to keep saving.");
          setSaveState("error");
          return;
        }
        if (response.status === 403) {
          setAccess("view");
          setBanner("You no longer have edit access.");
          setSaveState("error");
          return;
        }
        if (response.status === 404) {
          setBanner("This document was deleted.");
          setSaveState("error");
          return;
        }
        if (!response.ok) {
          const data = (await response.json()) as { error?: string };
          setBanner(data.error ?? "Couldn't save. Your latest words are still in this tab.");
          setSaveState("error");
          return;
        }
        next = queued.current;
        queued.current = null;
      }
      setSaveState("saved");
      if (banner.startsWith("Couldn't save")) setBanner("");
    } catch {
      setBanner("Couldn't save. Your latest words are still in this tab.");
      setSaveState("error");
    } finally {
      inflight.current = false;
    }
  }

  useEffect(() => {
    if (!editor) return;
    const onUpdate = () => {
      if (bodyTimer.current) window.clearTimeout(bodyTimer.current);
      bodyTimer.current = window.setTimeout(() => {
        void flush({ contentJson: editor.getJSON() as TipTapNode });
      }, 800);
    };
    editor.on("update", onUpdate);
    return () => {
      editor.off("update", onUpdate);
      if (bodyTimer.current) window.clearTimeout(bodyTimer.current);
    };
  }, [editor]);

  function queueTitle(next: string) {
    setTitle(next);
    if (titleTimer.current) window.clearTimeout(titleTimer.current);
    titleTimer.current = window.setTimeout(() => {
      void flush({ title: next });
    }, 400);
  }

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "s") {
        event.preventDefault();
        if (editor && !readOnly) {
          if (bodyTimer.current) window.clearTimeout(bodyTimer.current);
          void flush({ title, contentJson: editor.getJSON() as TipTapNode });
        }
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [editor, readOnly, title]);

  const statusLabel =
    saveState === "saving" ? "Saving…" : saveState === "error" ? "Couldn't save" : "Saved";

  return (
    <div className="min-h-screen bg-surface pt-16">
      <AppHeader user={user} saveStatus={statusLabel} />
      {readOnly ? (
        <div
          data-testid="readonly-banner"
          className="border-b border-line bg-accent-soft px-4 py-2 text-center text-sm text-accent"
        >
          View only — {owner.name} owns this document.
        </div>
      ) : null}
      {banner ? (
        <div className="border-b border-line bg-danger-soft px-4 py-2 text-center text-sm text-danger">
          {banner}{" "}
          {banner.includes("expired") ? (
            <Link href="/login" className="underline">
              Sign in
            </Link>
          ) : null}
        </div>
      ) : null}

      <section className="sticky top-16 z-40 bg-surface/80 shadow-sm backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-2.5 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <Link
              href="/docs"
              className="flex shrink-0 items-center gap-1 rounded-lg px-2 py-1 text-sm text-muted hover:bg-subdued hover:text-accent"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Documents</span>
            </Link>
            <span className="hidden h-4 w-px bg-line-strong sm:block" />
            <input
              data-testid="doc-title"
              value={title}
              disabled={readOnly}
              onChange={(event) => queueTitle(event.target.value)}
              onBlur={(event) => {
                queueTitle(event.target.value.trim() || "Untitled");
              }}
              className="min-w-0 flex-1 bg-transparent font-serif text-xl font-medium outline-none disabled:text-ink md:max-w-md lg:max-w-lg"
            />
            <p
              data-testid="save-status"
              className="hidden shrink-0 items-center gap-1.5 rounded-full bg-subdued px-2.5 py-0.5 text-[11px] font-semibold text-muted md:flex"
            >
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-accent" />
              {statusLabel}
            </p>
            <p className="text-xs text-muted md:hidden" data-testid="save-status-mobile">
              {statusLabel}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {saveState === "error" ? (
              <Button
                variant="secondary"
                className="h-8 px-2 text-xs"
                onClick={() => editor && flush({ title, contentJson: editor.getJSON() as TipTapNode })}
              >
                Retry
              </Button>
            ) : null}
            <Button data-testid="share-button" className="h-8 px-3.5" onClick={() => setShareOpen(true)}>
              <Share2 className="h-4 w-4" />
              Share
            </Button>
          </div>
        </div>
      </section>

      <div className="mx-auto flex w-full max-w-7xl justify-center px-4 py-8 sm:px-6 lg:py-12">
        <div className="editor-surface flex w-full max-w-[840px] flex-col items-center">
          <EditorToolbar editor={editor} readOnly={readOnly} />
          <div className="w-full min-h-[920px] rounded-2xl bg-canvas px-6 py-12 shadow-[0_1px_3px_rgba(28,26,23,0.04),0_8px_24px_rgba(28,26,23,0.03)] sm:px-12 md:px-16 md:py-20">
            <EditorContent editor={editor} />
          </div>
        </div>
      </div>

      {shareOpen ? (
        <ShareDialog
          documentId={documentId}
          owner={owner}
          shares={shares}
          canManage={owner.id === user.id}
          onClose={() => setShareOpen(false)}
          onChange={(next) => setShares(next.shares)}
        />
      ) : null}
    </div>
  );
}
