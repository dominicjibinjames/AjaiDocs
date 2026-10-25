"use client";

import { FormEvent, useState } from "react";
import { useSearchParams } from "next/navigation";
import { DEMO_ACCOUNTS } from "@/lib/constants";
import { Button } from "@/components/ui/button";

export function LoginForm() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setPending(true);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ email, password }),
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        setError(data.error ?? "Could not sign in.");
        return;
      }
      const next = searchParams.get("next") || "/docs";
      window.location.assign(next);
    } catch {
      setError("Network error. Try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-md">
      <div className="rounded-2xl border border-line bg-canvas p-8 shadow-[0_16px_40px_rgba(28,26,23,0.08)]">
        <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-accent">AjaiDocs</p>
        <h1 className="mt-2 font-serif text-4xl font-semibold tracking-tight">Sign in</h1>
        <p className="mt-2 font-serif text-base italic leading-7 text-ink-secondary">
          Internal documents for teams that need a quiet place to write, share, and come back later.
        </p>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold">Email</span>
            <input
              data-testid="login-email"
              type="email"
              autoComplete="username"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-lg border border-line-strong bg-canvas px-3 py-2.5 text-sm outline-none ring-accent/20 placeholder:text-muted focus:border-accent focus:ring-4"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold">Password</span>
            <input
              data-testid="login-password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-lg border border-line-strong bg-canvas px-3 py-2.5 text-sm outline-none ring-accent/20 placeholder:text-muted focus:border-accent focus:ring-4"
            />
          </label>
          {error ? (
            <p data-testid="login-error" className="rounded-lg bg-danger-soft px-3 py-2 text-sm text-danger">
              {error}
            </p>
          ) : null}
          <Button data-testid="login-submit" type="submit" disabled={pending} className="h-11 w-full">
            {pending ? "Signing in…" : "Sign in"}
          </Button>
        </form>
      </div>

      <div className="mt-4 rounded-2xl border border-line bg-canvas/80 p-4">
        <p className="text-sm font-semibold">Demo accounts</p>
        <p className="mt-1 text-xs text-muted">Password for all accounts: demo1234</p>
        <ul className="mt-3 space-y-2">
          {DEMO_ACCOUNTS.map((account) => (
            <li key={account.email}>
              <button
                type="button"
                onClick={() => {
                  setEmail(account.email);
                  setPassword(account.password);
                  setError("");
                }}
                className="flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-left text-sm hover:bg-subdued"
              >
                <span>{account.name}</span>
                <span className="text-muted">{account.email}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
