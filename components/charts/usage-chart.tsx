"use client";

import { useState } from "react";
import { formatCompact, formatDate, formatNumber } from "@/lib/format";
import type { UsageDay } from "@/lib/types";

type Metric = "eventsApplied" | "pushes";
const metrics: { key: Metric; label: string; unit: string }[] = [
  { key: "eventsApplied", label: "Changes applied", unit: "changes" },
  { key: "pushes", label: "Pushes", unit: "pushes" },
];

const W = 760;
const H = 240;
const PAD = { top: 12, right: 8, bottom: 26, left: 44 };

/** Daily bars with a hover readout. `data` is newest first, as the API returns it. */
export function UsageChart({ data, limit }: { data: UsageDay[]; limit?: number }) {
  const [metric, setMetric] = useState<Metric>("eventsApplied");
  const [hover, setHover] = useState<number | null>(null);

  const days = [...data].reverse();
  const values = days.map((d) => d[metric]);
  const dataMax = Math.max(...values, 1);
  // Draw the limit only when it is near the data; a far-off limit would flatten every bar.
  const rawCap = metric === "eventsApplied" && limit ? limit : 0;
  const cap = rawCap > 0 && rawCap <= dataMax * 3 ? rawCap : 0;
  const max = Math.max(dataMax, cap);
  const top = niceCeil(max);
  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;
  const slot = innerW / Math.max(days.length, 1);
  const barW = Math.max(slot * 0.68, 2);
  const y = (v: number) => PAD.top + innerH - (v / top) * innerH;
  const ticks = [0, 0.5, 1].map((f) => top * f);
  const active = hover === null ? null : days[hover];
  const label = metrics.find((m) => m.key === metric)!;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div role="tablist" aria-label="Metric" className="inline-flex rounded-full border border-ink/12 p-0.5">
          {metrics.map((m) => (
            <button
              key={m.key}
              role="tab"
              aria-selected={metric === m.key}
              onClick={() => setMetric(m.key)}
              className={`rounded-full px-3.5 py-1.5 text-[13px] transition ${metric === m.key ? "bg-ink text-paper" : "text-slate hover:text-ink"}`}
            >
              {m.label}
            </button>
          ))}
        </div>
        <p className="min-h-5 font-mono text-[12px] text-slate" aria-live="polite">
          {active ? (
            <>
              {formatDate(active.day)} · <span className="text-ink">{formatNumber(active[metric])}</span> {label.unit}
            </>
          ) : (
            <>
              Hover a bar for the day’s {label.unit}
              {rawCap > 0 && !cap ? ` · daily limit ${formatCompact(rawCap)}` : ""}
            </>
          )}
        </p>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} className="mt-4 h-auto w-full" role="img" aria-label={`${label.label} per day, last ${days.length} days`} onMouseLeave={() => setHover(null)}>
        {ticks.map((t) => (
          <g key={t}>
            <line x1={PAD.left} x2={W - PAD.right} y1={y(t)} y2={y(t)} stroke="#1c1b1c" strokeOpacity={t === 0 ? 0.25 : 0.08} strokeDasharray={t === 0 ? undefined : "3 5"} />
            <text x={PAD.left - 8} y={y(t) + 4} textAnchor="end" className="fill-slate font-mono text-[10px]">
              {formatCompact(t)}
            </text>
          </g>
        ))}
        {cap > 0 ? (
          <g>
            <line x1={PAD.left} x2={W - PAD.right} y1={y(cap)} y2={y(cap)} stroke="#9b2c2c" strokeWidth={1.2} strokeDasharray="6 4" />
            <text x={W - PAD.right} y={y(cap) - 5} textAnchor="end" className="fill-bad font-mono text-[10px]">
              daily limit {formatCompact(cap)}
            </text>
          </g>
        ) : null}
        {days.map((d, i) => {
          const h = Math.max(innerH - (y(d[metric]) - PAD.top), d[metric] > 0 ? 1.5 : 0);
          const x = PAD.left + i * slot + (slot - barW) / 2;
          return (
            <g key={d.day} onMouseEnter={() => setHover(i)}>
              <rect x={PAD.left + i * slot} y={PAD.top} width={slot} height={innerH} fill="transparent" />
              <rect x={x} y={PAD.top + innerH - h} width={barW} height={h} rx={Math.min(barW / 2, 3)} fill={hover === i ? "#502a11" : "#a14c32"} fillOpacity={hover === null || hover === i ? 1 : 0.45} />
            </g>
          );
        })}
        {[0, Math.floor((days.length - 1) / 2), days.length - 1].map((i) =>
          days[i] ? (
            <text key={i} x={PAD.left + i * slot + slot / 2} y={H - 6} textAnchor={i === 0 ? "start" : i === days.length - 1 ? "end" : "middle"} className="fill-slate font-mono text-[10px]">
              {formatDate(days[i].day).replace(/ \d{4}$/, "")}
            </text>
          ) : null,
        )}
      </svg>

      <table className="sr-only">
        <caption>{label.label} per day</caption>
        <thead>
          <tr>
            <th>Day</th>
            <th>{label.label}</th>
          </tr>
        </thead>
        <tbody>
          {days.map((d) => (
            <tr key={d.day}>
              <td>{d.day}</td>
              <td>{d[metric]}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function niceCeil(n: number) {
  const pow = 10 ** Math.floor(Math.log10(n));
  const f = n / pow;
  return (f <= 1 ? 1 : f <= 2 ? 2 : f <= 5 ? 5 : 10) * pow;
}
