"use client";

import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { Icon, type IconName } from "@/components/ui/icons";

const tabs: { slug: string; label: string; icon: IconName }[] = [
  { slug: "", label: "Overview", icon: "overview" },
  { slug: "connect", label: "Connect", icon: "sync" },
  { slug: "api-keys", label: "API keys", icon: "key" },
  { slug: "signing-keys", label: "Signing keys", icon: "shield" },
  { slug: "rules", label: "Rules", icon: "rules" },
  { slug: "usage", label: "Usage", icon: "usage" },
  { slug: "activity", label: "Activity", icon: "audit" },
  { slug: "settings", label: "Settings", icon: "settings" },
];

export function ProjectTabs() {
  const { projectId } = useParams<{ projectId: string }>();
  const pathname = usePathname();
  const base = `/projects/${projectId}`;

  return (
    <nav aria-label="Project" className="-mx-5 overflow-x-auto px-5 sm:-mx-8 sm:px-8 lg:mx-0 lg:px-0">
      <ul className="flex min-w-max gap-1 border-b border-ink/10">
        {tabs.map((t) => {
          const href = t.slug ? `${base}/${t.slug}` : base;
          const active = pathname === href;
          return (
            <li key={t.slug}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={`relative flex h-11 items-center gap-2 px-3.5 text-sm transition-colors ${active ? "text-ink" : "text-slate hover:text-ink"}`}
              >
                <Icon name={t.icon} className={active ? "text-rust" : ""} />
                {t.label}
                {active ? <span className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-rust" /> : null}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
