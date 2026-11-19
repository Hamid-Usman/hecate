"use client";

import { useState } from "react";
import { UsageChart } from "@/components/charts/usage-chart";
import { Card, StatTile } from "@/components/ui/primitives";
import { formatDate, formatNumber } from "@/lib/format";
import type { UsageDay } from "@/lib/types";

const ranges = [7, 30, 90] as const;

/** `data` is newest first, up to 90 days. */
export function UsageExplorer({ data, dailyLimit }: { data: UsageDay[]; dailyLimit?: number }) {
  const [range, setRange] = useState<(typeof ranges)[number]>(30);
  const slice = data.slice(0, range);
  const total = slice.reduce((n, d) => n + d.eventsApplied, 0);
  const pushes = slice.reduce((n, d) => n + d.pushes, 0);
  const peak = slice.reduce((best, d) => (d.eventsApplied > best.eventsApplied ? d : best), slice[0]!);

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <div role="group" aria-label="Time range" className="inline-flex rounded-full border border-ink/12 p-0.5">
          {ranges.map((r) => (
            <button key={r} type="button" aria-pressed={range === r} onClick={() => setRange(r)} className={`rounded-full px-4 py-1.5 text-[13px] transition ${range === r ? "bg-ink text-paper" : "text-slate hover:text-ink"}`}>
              {r} days
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatTile label="Changes applied" icon="database" value={formatNumber(total)} hint={`Over ${range} days`} />
        <StatTile label="Push requests" icon="usage" value={formatNumber(pushes)} hint={`About ${formatNumber(Math.round(total / Math.max(pushes, 1)))} changes per push`} />
        <StatTile label="Busiest day" icon="sync" value={formatNumber(peak.eventsApplied)} hint={formatDate(peak.day)} />
      </div>

      <Card className="p-5 sm:p-6">
        <UsageChart data={slice} limit={dailyLimit} />
      </Card>

      <Card className="overflow-hidden">
        <div className="max-h-96 overflow-y-auto">
          <table className="w-full text-sm">
            <caption className="sr-only">Usage per day</caption>
            <thead className="sticky top-0 bg-mist/90 font-mono text-[11px] tracking-wide text-slate uppercase backdrop-blur">
              <tr>
                <th scope="col" className="px-5 py-2.5 text-left font-normal">Day (UTC)</th>
                <th scope="col" className="px-5 py-2.5 text-right font-normal">Changes</th>
                <th scope="col" className="px-5 py-2.5 text-right font-normal">Pushes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/8">
              {slice.map((d) => (
                <tr key={d.day}>
                  <th scope="row" className="px-5 py-2.5 text-left font-normal">{formatDate(d.day)}</th>
                  <td className="px-5 py-2.5 text-right font-mono text-[13px]">{formatNumber(d.eventsApplied)}</td>
                  <td className="px-5 py-2.5 text-right font-mono text-[13px] text-slate">{formatNumber(d.pushes)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
