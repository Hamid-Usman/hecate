import type { ReactNode } from "react";
import { Icon, type IconName } from "./icons";

export function Card({ children, className = "", tone = "paper" }: { children: ReactNode; className?: string; tone?: "paper" | "danger" }) {
  return (
    <div className={`rounded-3xl border bg-paper/80 ${tone === "danger" ? "border-bad/30" : "border-ink/10"} ${className}`}>{children}</div>
  );
}

/** A titled block of a page: heading, one line of explanation, optional action on the right. */
export function Section({
  title,
  description,
  action,
  children,
  id,
}: {
  title: string;
  description?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  id?: string;
}) {
  return (
    <section id={id} className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="max-w-2xl">
          <h2 className="font-serif text-2xl tracking-tight">{title}</h2>
          {description ? <p className="mt-1 text-sm leading-relaxed text-slate">{description}</p> : null}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

export function PageHeader({ eyebrow, title, description, action, badge }: { eyebrow?: string; title: string; description?: ReactNode; action?: ReactNode; badge?: ReactNode }) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-4 pb-2">
      <div className="min-w-0">
        {eyebrow ? <p className="font-mono text-[11px] tracking-wide text-rust uppercase">{eyebrow}</p> : null}
        <div className="mt-1 flex flex-wrap items-center gap-3">
          <h1 className="font-serif text-4xl tracking-tight sm:text-[2.6rem]">{title}</h1>
          {badge}
        </div>
        {description ? <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-slate">{description}</p> : null}
      </div>
      {action}
    </header>
  );
}

type Tone = "neutral" | "ok" | "warn" | "bad" | "rust";
const tones: Record<Tone, string> = {
  neutral: "border-ink/12 text-slate",
  ok: "border-ok/30 bg-ok/10 text-ok",
  warn: "border-warn/30 bg-warn/10 text-warn",
  bad: "border-bad/30 bg-bad/10 text-bad",
  rust: "border-rust/30 bg-rust/10 text-rust",
};

export function Badge({ children, tone = "neutral", dot }: { children: ReactNode; tone?: Tone; dot?: boolean }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium whitespace-nowrap ${tones[tone]}`}>
      {dot ? <span className="h-1.5 w-1.5 rounded-full bg-current" /> : null}
      {children}
    </span>
  );
}

export function StatusBadge({ status }: { status: "active" | "suspended" }) {
  return status === "active" ? (
    <Badge tone="ok" dot>
      Active
    </Badge>
  ) : (
    <Badge tone="warn" dot>
      Suspended
    </Badge>
  );
}

export function EnvBadge({ environment }: { environment: "development" | "production" }) {
  return <Badge tone={environment === "production" ? "rust" : "neutral"}>{environment === "production" ? "Production" : "Development"}</Badge>;
}

export function StatTile({ label, value, hint, icon }: { label: string; value: ReactNode; hint?: ReactNode; icon?: IconName }) {
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between text-slate">
        <p className="font-mono text-[11px] tracking-wide uppercase">{label}</p>
        {icon ? <Icon name={icon} className="h-4 w-4 text-slate/70" /> : null}
      </div>
      <p className="mt-3 font-serif text-4xl leading-none tracking-tight">{value}</p>
      {hint ? <p className="mt-2 text-[13px] text-slate">{hint}</p> : null}
    </Card>
  );
}

export function EmptyState({ icon, title, body, action }: { icon: IconName; title: string; body: ReactNode; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center rounded-3xl border border-dashed border-ink/20 px-6 py-14 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-full border border-ink/12 bg-paper text-rust">
        <Icon name={icon} className="h-5 w-5" />
      </span>
      <h3 className="mt-5 font-serif text-2xl">{title}</h3>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-slate">{body}</p>
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}

const callouts = {
  info: { icon: "info", cls: "border-ink/12 bg-mist/60 text-ink" },
  warn: { icon: "alert", cls: "border-warn/30 bg-warn/10 text-ink" },
  danger: { icon: "alert", cls: "border-bad/30 bg-bad/10 text-ink" },
  ok: { icon: "check", cls: "border-ok/30 bg-ok/10 text-ink" },
} as const;

export function Callout({ tone = "info", title, children }: { tone?: keyof typeof callouts; title?: string; children: ReactNode }) {
  const c = callouts[tone];
  return (
    <div role={tone === "danger" ? "alert" : undefined} className={`flex gap-3 rounded-2xl border p-4 text-sm leading-relaxed ${c.cls}`}>
      <Icon name={c.icon} className={`mt-0.5 h-4 w-4 ${tone === "danger" ? "text-bad" : tone === "warn" ? "text-warn" : tone === "ok" ? "text-ok" : "text-slate"}`} />
      <div>
        {title ? <p className="font-medium">{title}</p> : null}
        <div className={title ? "mt-0.5 text-slate" : ""}>{children}</div>
      </div>
    </div>
  );
}

export function Skeleton({ className = "" }: { className?: string }) {
  return <div aria-hidden="true" className={`animate-pulse rounded-2xl bg-ink/[0.06] ${className}`} />;
}

/** Inline monospace, for ids, columns and keys. */
export function Mono({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <code className={`rounded-md bg-ink/[0.06] px-1.5 py-0.5 font-mono text-[12.5px] ${className}`}>{children}</code>;
}
