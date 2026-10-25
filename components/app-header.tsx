"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { SessionUser } from "@/lib/auth";

export function AppHeader({
  user,
  saveStatus,
}: {
  user: SessionUser;
  saveStatus?: string;
}) {
  const pathname = usePathname();
  const onEditor = Boolean(pathname && pathname.startsWith("/docs/") && pathname !== "/docs");

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST", credentials: "same-origin" });
    window.location.assign("/login");
  }

  return (
    <header className="fixed top-0 left-0 z-50 w-full bg-surface/90 shadow-[0_1px_8px_rgba(29,27,24,0.04)] backdrop-blur-md">
      <div className="flex h-16 w-full items-center justify-between gap-4 px-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-4">
          <Link href="/docs" className="shrink-0 font-serif text-xl font-medium tracking-tight text-accent-deep">
            AjaiDocs
          </Link>
          <nav className="hidden items-center gap-1 text-sm text-muted sm:flex">
            <span className="px-1">Workspace</span>
            <span className="text-muted/60">/</span>
            <Link
              href="/docs"
              className={`rounded px-1.5 py-0.5 transition-colors ${
                !onEditor ? "bg-accent text-canvas" : "hover:text-ink"
              }`}
            >
              Documents
            </Link>
            <span
              className={`rounded px-1.5 py-0.5 ${
                onEditor ? "bg-accent text-canvas" : "text-muted"
              }`}
            >
              Editor
            </span>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          {saveStatus ? (
            <p className="hidden items-center gap-1.5 text-xs text-muted lg:flex" data-testid="header-save-status">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-accent" />
              {saveStatus}
            </p>
          ) : null}
          <div className="hidden text-right xl:block">
            <p className="text-sm font-semibold leading-none">{user.name}</p>
            <p className="mt-1 text-[11px] tracking-wide text-muted">{user.email}</p>
          </div>
          <div
            aria-hidden
            className="grid h-8 w-8 place-items-center rounded-full bg-accent text-xs font-semibold text-canvas ring-1 ring-line-strong"
          >
            {user.name.slice(0, 1)}
          </div>
          <button
            type="button"
            data-testid="logout"
            onClick={logout}
            className="rounded-lg px-2.5 py-1.5 text-sm text-muted hover:bg-subdued hover:text-ink"
          >
            Sign out
          </button>
        </div>
      </div>
    </header>
  );
}
