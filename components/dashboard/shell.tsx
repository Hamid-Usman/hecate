"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useRef, useState } from "react";
import { Mark } from "@/components/landing/glyphs";
import { logout } from "@/lib/actions";
import { Icon, type IconName } from "@/components/ui/icons";
import { Skeleton } from "@/components/ui/primitives";
import { ToastProvider } from "@/components/ui/toast";
import type { Account, Me, Project } from "@/lib/types";

const initials = (s: string) =>
  s
    .split(/[\s@.]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]!.toUpperCase())
    .join("");

export function DashboardShell({ me, projects, children }: { me: Me; projects: Project[]; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <ToastProvider>
      <div className="blueprint min-h-screen lg:grid lg:grid-cols-[272px_1fr]">
        <a href="#main" className="sr-only z-[70] rounded-full bg-ink px-4 py-2 text-paper focus:not-sr-only focus:fixed focus:top-3 focus:left-3">
          Skip to content
        </a>

        {/* Mobile top bar */}
        <div className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-ink/10 bg-paper/90 px-4 backdrop-blur-md lg:hidden">
          <Link href="/projects" className="flex items-center gap-2">
            <Mark className="h-6 w-6" animated={false} />
            <span className="font-serif text-xl tracking-tight">Hecate</span>
          </Link>
          <button type="button" aria-label="Open menu" aria-expanded={open} onClick={() => setOpen(true)} className="rounded-full border border-ink/15 p-2">
            <Icon name="menu" />
          </button>
        </div>

        {open ? <div className="fixed inset-0 z-50 bg-ink/40 backdrop-blur-sm lg:hidden" onClick={() => setOpen(false)} aria-hidden="true" /> : null}
        <aside
          className={`fixed inset-y-0 left-0 z-50 w-[272px] border-r border-ink/10 bg-paper transition-transform duration-300 ease-out lg:sticky lg:top-0 lg:z-auto lg:h-screen lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}
        >
          <Suspense fallback={<SidebarSkeleton />}>
            <SidebarContent me={me} projects={projects} onNavigate={() => setOpen(false)} onClose={() => setOpen(false)} />
          </Suspense>
        </aside>

        <main id="main" className="min-w-0 px-5 py-8 sm:px-8 lg:px-12 lg:py-10">
          <div className="mx-auto max-w-5xl">{children}</div>
        </main>
      </div>
    </ToastProvider>
  );
}

function SidebarSkeleton() {
  return (
    <div className="space-y-3 p-5" aria-hidden="true">
      <div className="flex h-8 items-center gap-2.5">
        <Mark className="h-7 w-7" animated={false} />
        <span className="font-serif text-2xl tracking-tight">Hecate</span>
      </div>
      <Skeleton className="h-14" />
      <Skeleton className="h-10" />
      <Skeleton className="h-10" />
    </div>
  );
}

function SidebarContent({ me, projects, onNavigate, onClose }: { me: Me; projects: Project[]; onNavigate: () => void; onClose: () => void }) {
  const pathname = usePathname();
  const nav: { href: string; label: string; icon: IconName; match: (p: string) => boolean }[] = [
    { href: "/projects", label: "Projects", icon: "projects", match: (p) => p === "/projects" },
    { href: "/settings", label: "Account", icon: "settings", match: (p) => p.startsWith("/settings") },
  ];

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center justify-between px-5">
        <Link href="/projects" onClick={onNavigate} className="flex items-center gap-2.5">
          <Mark className="h-7 w-7" animated={false} />
          <span className="font-serif text-2xl tracking-tight">Hecate</span>
        </Link>
        <button type="button" aria-label="Close menu" onClick={onClose} className="rounded-full p-2 text-slate hover:bg-ink/5 lg:hidden">
          <Icon name="close" />
        </button>
      </div>

      <div className="px-3">
        <Suspense fallback={<Skeleton className="h-14" />}>
          <AccountSwitcher accounts={me.accounts} onNavigate={onNavigate} />
        </Suspense>
      </div>

      <nav aria-label="Main" className="mt-4 px-3">
        <ul className="space-y-0.5">
          {nav.map((n) => {
            const active = n.match(pathname);
            return (
              <li key={n.href}>
                <Link
                  href={n.href}
                  onClick={onNavigate}
                  aria-current={active ? "page" : undefined}
                  className={`flex h-10 items-center gap-3 rounded-xl px-3 text-sm transition ${active ? "bg-ink text-paper" : "text-slate hover:bg-ink/5 hover:text-ink"}`}
                >
                  <Icon name={n.icon} />
                  {n.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="mt-6 min-h-0 flex-1 overflow-y-auto px-3">
        <p className="px-3 font-mono text-[11px] tracking-wide text-slate uppercase">Your projects</p>
        <ul className="mt-2 space-y-0.5">
          {projects.map((p) => {
            const active = pathname === `/projects/${p.id}` || pathname.startsWith(`/projects/${p.id}/`);
            return (
              <li key={p.id}>
                <Link
                  href={`/projects/${p.id}`}
                  onClick={onNavigate}
                  aria-current={active ? "page" : undefined}
                  className={`flex h-9 items-center gap-2.5 rounded-xl px-3 text-[13px] transition ${active ? "bg-rust/10 text-ink" : "text-slate hover:bg-ink/5 hover:text-ink"}`}
                >
                  <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${p.status === "active" ? "bg-ok" : "bg-warn"}`} aria-label={p.status} />
                  <span className="truncate">{p.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="border-t border-ink/10 p-3">
        <div className="flex items-center gap-3 rounded-xl px-2 py-2">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-ink font-mono text-[12px] text-paper">{initials(me.user.name ?? me.user.email)}</span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-medium">{me.user.name ?? me.user.email}</p>
            <p className="truncate text-xs text-slate">{me.user.email}</p>
          </div>
          <form action={logout}>
            <button type="submit" aria-label="Sign out" title="Sign out" className="rounded-full p-2 text-slate transition hover:bg-ink/5 hover:text-ink">
              <Icon name="logout" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

/** Shows the account being viewed; choosing another reloads /projects for it. */
function AccountSwitcher({ accounts, onNavigate }: { accounts: Account[]; onNavigate: () => void }) {
  const ref = useRef<HTMLDetailsElement>(null);
  const selected = useSearchParams().get("account");
  const current = accounts.find((a) => a.id === selected) ?? accounts[0]!;

  return (
    <details ref={ref} className="group relative">
      <summary className="flex h-14 cursor-pointer list-none items-center gap-3 rounded-2xl border border-ink/12 bg-paper px-3 transition hover:border-ink/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rust [&::-webkit-details-marker]:hidden">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-rust/10 font-mono text-[12px] text-rust">{initials(current.name)}</span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[13px] font-medium">{current.name}</span>
          <span className="block text-xs text-slate capitalize">{current.plan} plan</span>
        </span>
        <Icon name="chevronDown" className="text-slate transition-transform group-open:rotate-180" />
      </summary>
      <div className="absolute inset-x-0 top-[calc(100%+6px)] z-10 rounded-2xl border border-ink/12 bg-paper p-1.5 shadow-[0_16px_40px_rgba(28,27,28,0.14)]">
        <p className="px-3 pt-2 pb-1 font-mono text-[11px] tracking-wide text-slate uppercase">Accounts</p>
        {accounts.map((a) => (
          <Link
            key={a.id}
            href={`/projects?account=${a.id}`}
            onClick={() => {
              ref.current?.removeAttribute("open");
              onNavigate();
            }}
            className="flex items-center gap-3 rounded-xl px-3 py-2 text-[13px] transition hover:bg-ink/5"
          >
            <span className="min-w-0 flex-1 truncate">{a.name}</span>
            <span className="rounded-full border border-ink/12 px-2 py-0.5 text-[11px] text-slate capitalize">{a.role}</span>
          </Link>
        ))}
      </div>
    </details>
  );
}
