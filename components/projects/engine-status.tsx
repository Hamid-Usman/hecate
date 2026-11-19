import { CopyButton } from "@/components/ui/copy";
import { Badge, Card } from "@/components/ui/primitives";
import { engineUrl } from "@/lib/config";
import { getEngineHealth } from "@/lib/engine";

/** The engine address apps connect to, with a live reachability check. Render inside <Suspense>. */
export async function EngineStatus() {
  const url = engineUrl();
  const health = await getEngineHealth();

  return (
    <Card className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 p-5">
      <div className="min-w-0">
        <p className="font-mono text-[11px] tracking-wide text-slate uppercase">Engine address</p>
        <p className="mt-1 break-all font-mono text-[13.5px]">{url}</p>
        <p className="mt-1.5 text-[13px] text-slate">
          {health.reachable
            ? `Reachable · version ${health.version}${health.authRequired ? " · authentication on" : ""}`
            : "Not reachable right now. Free-tier hosting sleeps when idle and can take about 15 seconds to wake; reload to check again."}
        </p>
      </div>
      <div className="flex items-center gap-3">
        {health.reachable ? (
          <Badge tone="ok" dot>
            Online
          </Badge>
        ) : (
          <Badge tone="warn" dot>
            Unreachable
          </Badge>
        )}
        <CopyButton value={url} label="Copy URL" />
      </div>
    </Card>
  );
}
