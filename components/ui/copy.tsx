"use client";

import { useState } from "react";
import { Icon } from "./icons";

export function CopyButton({ value, label = "Copy", className = "" }: { value: string; label?: string; className?: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
          setDone(true);
          setTimeout(() => setDone(false), 1800);
        } catch {
          /* clipboard blocked: the text stays selectable */
        }
      }}
      aria-label={done ? "Copied" : label}
      className={`inline-flex h-8 items-center gap-1.5 rounded-full border border-ink/12 px-3 text-[13px] text-slate transition hover:border-ink hover:text-ink ${className}`}
    >
      <Icon name={done ? "check" : "copy"} className={`h-3.5 w-3.5 ${done ? "text-ok" : ""}`} />
      {done ? "Copied" : label}
    </button>
  );
}

/** A dark code block with a copy button, for snippets and one-time secrets. */
export function CodeBlock({ code, title, wrap }: { code: string; title?: string; wrap?: boolean }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-ink bg-ink text-mist">
      <div className="flex items-center justify-between gap-3 border-b border-mist/10 px-4 py-2">
        <span className="font-mono text-[11px] tracking-wide text-mist/60 uppercase">{title ?? "snippet"}</span>
        <CopyButton value={code} className="!border-mist/20 !text-mist/80 hover:!border-mist hover:!text-mist" />
      </div>
      <pre className={`px-4 py-3.5 font-mono text-[12.5px] leading-relaxed ${wrap ? "break-all whitespace-pre-wrap" : "overflow-x-auto"}`}>
        <code>{code}</code>
      </pre>
    </div>
  );
}
