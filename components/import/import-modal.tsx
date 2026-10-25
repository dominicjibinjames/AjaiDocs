"use client";

import { useRef, useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { MAX_IMPORT_BYTES } from "@/lib/constants";

export function ImportModal({
  onClose,
  onImported,
}: {
  onClose: () => void;
  onImported?: (doc: { id: string; title: string }) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function upload(file: File) {
    setError("");
    if (file.size > MAX_IMPORT_BYTES) {
      setError("That file is larger than 2 MB. Split it or export a smaller copy.");
      return;
    }
    const ext = file.name.toLowerCase().split(".").pop();
    if (!ext || !["txt", "md", "docx"].includes(ext)) {
      setError("Only .txt, .md, and .docx files can be imported.");
      return;
    }

    setPending(true);
    try {
      const form = new FormData();
      form.set("file", file);
      const response = await fetch("/api/documents/import", { method: "POST", body: form });
      const data = (await response.json()) as { id?: string; title?: string; error?: string };
      if (!response.ok || !data.id) {
        // #region agent log
        fetch("http://127.0.0.1:7515/ingest/50601b8e-2e31-41a1-b6c4-bc41327995aa", {
          method: "POST",
          headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "ae0ad2" },
          body: JSON.stringify({
            sessionId: "ae0ad2",
            runId: "pre-fix",
            hypothesisId: "H4",
            location: "components/import/import-modal.tsx:upload",
            message: "import rejected",
            data: { status: response.status, hasId: Boolean(data.id) },
            timestamp: Date.now(),
          }),
        }).catch(() => {});
        // #endregion
        setError(data.error ?? "Could not import that file.");
        return;
      }
      // #region agent log
      fetch("http://127.0.0.1:7515/ingest/50601b8e-2e31-41a1-b6c4-bc41327995aa", {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "ae0ad2" },
        body: JSON.stringify({
          sessionId: "ae0ad2",
          runId: "pre-fix",
          hypothesisId: "H4",
          location: "components/import/import-modal.tsx:upload",
          message: "import ok, pushing editor",
          data: { status: response.status, hasId: Boolean(data.id) },
          timestamp: Date.now(),
        }),
      }).catch(() => {});
      // #endregion
      onImported?.({ id: data.id, title: data.title ?? "Untitled" });
      window.location.assign(`/docs/${data.id}`);
    } catch {
      setError("Network error. Try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <Modal
      title="Import a file"
      description="Supported types: .txt, .md, and .docx. Maximum size 2 MB."
      onClose={onClose}
    >
      <label
        onDragOver={(event) => {
          event.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragOver(false);
          const file = event.dataTransfer.files[0];
          if (file) void upload(file);
        }}
        className={`flex min-h-40 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 text-center ${
          dragOver ? "border-accent bg-accent-soft" : "border-line-strong bg-canvas"
        }`}
      >
        <input
          ref={inputRef}
          data-testid="import-input"
          type="file"
          accept=".txt,.md,.docx,text/plain,text/markdown,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          className="sr-only"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) void upload(file);
          }}
        />
        <p className="text-sm font-medium">Drop a file here, or browse</p>
        <p className="mt-1 text-xs text-muted">.txt, .md, or .docx — up to 2 MB</p>
        <Button
          type="button"
          variant="secondary"
          className="mt-4"
          disabled={pending}
          onClick={() => inputRef.current?.click()}
        >
          {pending ? "Importing…" : "Choose file"}
        </Button>
      </label>
      {error ? (
        <p data-testid="import-error" className="mt-3 text-sm text-danger">
          {error}
        </p>
      ) : null}
    </Modal>
  );
}
