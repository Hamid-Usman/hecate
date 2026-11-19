import { Icon } from "@/components/ui/icons";
import { formatDateTime } from "@/lib/format";
import { auditActions, describeAudit } from "@/lib/meta";
import type { AuditEntry } from "@/lib/types";

const dot = { neutral: "bg-slate", ok: "bg-ok", warn: "bg-warn", bad: "bg-bad" } as const;

/** A timeline of who changed what. `actor` is a user id; the current user shows as “You”. */
export function AuditList({ entries, currentUserId, limit }: { entries: AuditEntry[]; currentUserId: string; limit?: number }) {
  const rows = limit ? entries.slice(0, limit) : entries;
  if (rows.length === 0) return <p className="text-sm text-slate">Nothing has happened in this project yet.</p>;

  return (
    <ol className="relative space-y-5 before:absolute before:top-2 before:bottom-2 before:left-[5px] before:w-px before:bg-ink/10">
      {rows.map((e) => {
        const a = auditActions[e.action] ?? { label: e.action, tone: "neutral" as const };
        const detail = describeAudit(e.action, e.detail);
        return (
          <li key={e.id} className="relative pl-7">
            <span className={`absolute top-1.5 left-0 h-[11px] w-[11px] rounded-full border-2 border-paper ${dot[a.tone]}`} />
            <p className="text-sm">
              <span className="font-medium">{a.label}</span>
              {detail ? <span className="ml-2 font-mono text-[12.5px] text-slate">{detail}</span> : null}
            </p>
            <p className="mt-0.5 flex items-center gap-1.5 text-[13px] text-slate">
              <Icon name="user" className="h-3 w-3" />
              {e.actor === currentUserId ? "You" : `User ${e.actor.slice(0, 8)}`} · {formatDateTime(e.createdAt)}
            </p>
          </li>
        );
      })}
    </ol>
  );
}
