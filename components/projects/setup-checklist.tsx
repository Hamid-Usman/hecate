import Link from "next/link";
import { CodeBlock } from "@/components/ui/copy";
import { Icon } from "@/components/ui/icons";
import { Card } from "@/components/ui/primitives";
import type { ProjectDetail } from "@/lib/types";

/** The path from an empty project to a syncing device, with what is already done ticked off. */
export function SetupChecklist({ project }: { project: ProjectDetail }) {
  const base = `/projects/${project.id}`;
  const hasKey = project.apiKeys.some((k) => !k.revoked);
  const steps = [
    { done: true, title: "Project created", body: "Your first signing key, k1, was created with it.", href: null },
    { done: hasKey, title: "Create an API key", body: "Your server uses it to ask Hecate for a token for each device. It is shown once.", href: `${base}/api-keys`, cta: "Create a key" },
    { done: project.rules !== null, title: "Choose which tables sync", body: "Without rules every table syncs. Rules also limit each device to its own tenant or user’s rows.", href: `${base}/rules`, cta: "Set rules" },
    { done: project.policy !== "", title: "Pick a conflict policy", body: "Decide who wins when two devices edit the same row offline.", href: `${base}/settings`, cta: "Choose policy" },
  ];
  const done = steps.filter((s) => s.done).length;

  return (
    <Card className="overflow-hidden">
      <div className="flex items-center justify-between gap-4 p-6 pb-4">
        <div>
          <h2 className="font-serif text-2xl tracking-tight">Connect your app</h2>
          <p className="mt-1 text-sm text-slate">
            {done === steps.length ? "Everything is set up. Your devices can sync." : `${done} of ${steps.length} steps done.`}
          </p>
        </div>
        <div className="h-1.5 w-28 overflow-hidden rounded-full bg-ink/10" role="progressbar" aria-valuenow={done} aria-valuemin={0} aria-valuemax={steps.length} aria-label="Setup progress">
          <div className="h-full rounded-full bg-rust transition-all" style={{ width: `${(done / steps.length) * 100}%` }} />
        </div>
      </div>

      <ol className="divide-y divide-ink/8 border-t border-ink/10">
        {steps.map((s, i) => (
          <li key={s.title} className="flex items-start gap-4 px-6 py-4">
            <span className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-[11px] font-mono ${s.done ? "border-ok bg-ok text-paper" : "border-ink/25 text-slate"}`}>
              {s.done ? <Icon name="check" className="h-3.5 w-3.5" /> : i + 1}
            </span>
            <div className="min-w-0 flex-1">
              <p className={`text-sm font-medium ${s.done ? "text-slate line-through decoration-ink/20" : ""}`}>{s.title}</p>
              <p className="mt-0.5 text-[13px] leading-relaxed text-slate">{s.body}</p>
            </div>
            {!s.done && s.href ? (
              <Link href={s.href} className="shrink-0 rounded-full border border-ink/15 px-3.5 py-1.5 text-[13px] transition hover:border-ink hover:bg-ink hover:text-paper">
                {s.cta}
              </Link>
            ) : null}
          </li>
        ))}
      </ol>

      <div className="space-y-3 border-t border-ink/10 bg-mist/40 p-6">
        <p className="text-sm text-slate">
          Then, from your server, trade the API key for a device token and hand it to the app:
        </p>
        <CodeBlock
          title="your server"
          code={`curl -X POST https://YOUR-ENGINE/v1/tokens \\
  -H "Authorization: Bearer <your API key>" \\
  -H "Content-Type: application/json" \\
  -d '{ "device_id": "device-123", "user_id": "user-42" }'`}
        />
      </div>
    </Card>
  );
}
