"use client";

import { FormEvent, useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";

export type SharePerson = {
  userId: string;
  role: string;
  user: { id: string; name: string; email: string };
};

export function ShareDialog({
  documentId,
  owner,
  shares,
  canManage,
  onClose,
  onChange,
}: {
  documentId: string;
  owner: { id: string; name: string; email: string };
  shares: SharePerson[];
  canManage: boolean;
  onClose: () => void;
  onChange: (next: { owner: typeof owner; shares: SharePerson[] }) => void;
}) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"VIEW" | "EDIT">("EDIT");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function addPerson(event: FormEvent) {
    event.preventDefault();
    if (!canManage || !documentId) return;
    setPending(true);
    setError("");
    try {
      const response = await fetch(`/api/documents/${documentId}/share`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, role }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error ?? "Could not share.");
        return;
      }
      onChange(data);
      setEmail("");
    } catch {
      setError("Network error. Try again.");
    } finally {
      setPending(false);
    }
  }

  async function updateRole(userId: string, nextRole: "VIEW" | "EDIT") {
    if (!canManage || !documentId) return;
    const response = await fetch(`/api/documents/${documentId}/share`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, role: nextRole }),
    });
    const data = await response.json();
    if (response.ok) onChange(data);
    else setError(data.error ?? "Could not update access.");
  }

  async function removePerson(userId: string) {
    if (!canManage || !documentId) return;
    const response = await fetch(`/api/documents/${documentId}/share?userId=${userId}`, {
      method: "DELETE",
    });
    const data = await response.json();
    if (response.ok) onChange(data);
    else setError(data.error ?? "Could not remove access.");
  }

  return (
    <Modal
      title="Share document"
      description={
        canManage
          ? "Grant view or edit access to a seeded teammate."
          : "Only the owner can change who has access."
      }
      onClose={onClose}
    >
      <div className="space-y-3">
        <div className="flex items-center justify-between rounded-xl border border-line bg-canvas px-3 py-2">
          <div>
            <p className="text-sm font-medium">{owner.name}</p>
            <p className="text-xs text-muted">{owner.email}</p>
          </div>
          <span className="text-xs font-medium uppercase tracking-wide text-accent">Owner</span>
        </div>
        {shares.map((share) => (
          <div
            key={share.userId}
            className="flex items-center justify-between gap-3 rounded-xl border border-line bg-canvas px-3 py-2"
          >
            <div>
              <p className="text-sm font-medium">{share.user.name}</p>
              <p className="text-xs text-muted">{share.user.email}</p>
            </div>
            {canManage ? (
              <div className="flex items-center gap-2">
                <select
                  value={share.role}
                  onChange={(event) => updateRole(share.userId, event.target.value as "VIEW" | "EDIT")}
                  className="rounded-lg border border-line-strong bg-canvas px-2 py-1 text-xs"
                >
                  <option value="EDIT">Can edit</option>
                  <option value="VIEW">Can view</option>
                </select>
                <button
                  type="button"
                  onClick={() => removePerson(share.userId)}
                  className="text-xs text-danger hover:underline"
                >
                  Remove
                </button>
              </div>
            ) : (
              <span className="text-xs text-muted">{share.role === "EDIT" ? "Can edit" : "Can view"}</span>
            )}
          </div>
        ))}
      </div>

      {canManage ? (
        <form onSubmit={addPerson} className="mt-4 grid gap-2 sm:grid-cols-[1fr_auto_auto]">
          <input
            data-testid="share-email"
            type="email"
            required
            placeholder="bob@ajaia.dev"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="rounded-lg border border-line-strong bg-canvas px-3 py-2 text-sm outline-none ring-accent/20 focus:border-accent focus:ring-4"
          />
          <select
            data-testid="share-role"
            value={role}
            onChange={(event) => setRole(event.target.value as "VIEW" | "EDIT")}
            className="rounded-lg border border-line-strong bg-canvas px-3 py-2 text-sm"
          >
            <option value="EDIT">Can edit</option>
            <option value="VIEW">Can view</option>
          </select>
          <Button data-testid="share-submit" type="submit" disabled={pending}>
            {pending ? "Sharing…" : "Share"}
          </Button>
        </form>
      ) : null}

      {error ? (
        <p data-testid="share-error" className="mt-3 text-sm text-danger">
          {error}
        </p>
      ) : null}
    </Modal>
  );
}
