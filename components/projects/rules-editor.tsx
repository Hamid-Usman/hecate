"use client";

import { useMemo, useState } from "react";
import { patchProject } from "@/lib/actions";
import type { Rules } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { CodeBlock } from "@/components/ui/copy";
import { OptionCards } from "@/components/ui/form";
import { Icon } from "@/components/ui/icons";
import { Callout, Card, Mono } from "@/components/ui/primitives";
import { useToast } from "@/components/ui/toast";

const IDENT = /^[A-Za-z_][A-Za-z0-9_]{0,62}$/;
type Row = { key: number; table: string; tenant: string; user: string };
type Scope = "all" | "some";

const toRows = (rules: Rules | null): Row[] =>
  Object.entries(rules?.tables ?? {}).map(([table, r], i) => ({ key: i, table, tenant: r.tenant_column ?? "", user: r.user_column ?? "" }));

const toRules = (scope: Scope, rows: Row[]): Rules | null =>
  scope === "all"
    ? null
    : { tables: Object.fromEntries(rows.map((r) => [r.table.trim(), { ...(r.tenant.trim() && { tenant_column: r.tenant.trim() }), ...(r.user.trim() && { user_column: r.user.trim() }) }])) };

export function RulesEditor({ initial, readOnly }: { initial: Rules | null; readOnly: boolean }) {
  const { toast } = useToast();
  const [saved, setSaved] = useState(initial);
  const [scope, setScope] = useState<Scope>(initial ? "some" : "all");
  const [rows, setRows] = useState<Row[]>(toRows(initial));
  const [nextKey, setNextKey] = useState(100);
  const [busy, setBusy] = useState(false);
  const [showErrors, setShowErrors] = useState(false);

  const errors = useMemo(() => {
    const out = new Map<number, { table?: string; tenant?: string; user?: string }>();
    const seen = new Set<string>();
    for (const r of rows) {
      const e: { table?: string; tenant?: string; user?: string } = {};
      const t = r.table.trim();
      if (!t) e.table = "Enter a table name.";
      else if (!IDENT.test(t)) e.table = "Letters, digits and underscores only.";
      else if (seen.has(t)) e.table = "Already listed.";
      seen.add(t);
      if (r.tenant.trim() && !IDENT.test(r.tenant.trim())) e.tenant = "Letters, digits and underscores only.";
      if (r.user.trim() && !IDENT.test(r.user.trim())) e.user = "Letters, digits and underscores only.";
      if (Object.keys(e).length) out.set(r.key, e);
    }
    return out;
  }, [rows]);

  const current = toRules(scope, rows);
  const dirty = JSON.stringify(current) !== JSON.stringify(saved);
  const emptyList = scope === "some" && rows.length === 0;
  const invalid = errors.size > 0 || emptyList;

  function addRow() {
    setRows((l) => [...l, { key: nextKey, table: "", tenant: "", user: "" }]);
    setNextKey((k) => k + 1);
  }

  const update = (key: number, patch: Partial<Row>) => setRows((l) => l.map((r) => (r.key === key ? { ...r, ...patch } : r)));

  async function save() {
    setShowErrors(true);
    if (invalid) return;
    setBusy(true);
    try {
      await patchProject("", { rules: current });
      setSaved(current);
      setShowErrors(false);
      toast("Rules saved and sent to the engine.");
    } catch {
      toast("Couldn’t save the rules. Please try again.", "error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <OptionCards
        name="rules-scope"
        value={scope}
        onChange={(v) => {
          setScope(v);
          if (v === "some" && rows.length === 0) addRow();
        }}
        disabled={readOnly}
        options={[
          { value: "all", title: "Sync every table", body: "Any table a device writes to is synced, and every device can read all rows.", footnote: "Fine for a single-user app or while you’re prototyping." },
          { value: "some", title: "Only the tables I list", body: "Other tables are refused. Each table can limit what a device sees to its own tenant or user.", footnote: "Recommended once real users are involved." },
        ]}
      />

      {scope === "some" ? (
        <Card className="overflow-hidden">
          <div className="hidden grid-cols-[1.2fr_1fr_1fr_40px] gap-3 border-b border-ink/10 bg-mist/50 px-5 py-2.5 font-mono text-[11px] tracking-wide text-slate uppercase sm:grid">
            <span>Table</span>
            <span>Tenant column</span>
            <span>User column</span>
            <span />
          </div>
          <ul className="divide-y divide-ink/8">
            {rows.map((r, i) => {
              const e = showErrors || r.table ? errors.get(r.key) : undefined;
              return (
                <li key={r.key} className="grid gap-3 px-5 py-4 sm:grid-cols-[1.2fr_1fr_1fr_40px] sm:items-start">
                  <Cell label="Table" error={e?.table}>
                    <input value={r.table} onChange={(ev) => update(r.key, { table: ev.target.value })} disabled={readOnly} placeholder="orders" spellCheck={false} autoFocus={i === rows.length - 1 && r.table === "" && rows.length > 1} aria-label={`Table ${i + 1}`} className={cell(!!e?.table)} />
                  </Cell>
                  <Cell label="Tenant column" error={e?.tenant}>
                    <input value={r.tenant} onChange={(ev) => update(r.key, { tenant: ev.target.value })} disabled={readOnly} placeholder="optional" spellCheck={false} aria-label={`Tenant column for table ${i + 1}`} className={cell(!!e?.tenant)} />
                  </Cell>
                  <Cell label="User column" error={e?.user}>
                    <input value={r.user} onChange={(ev) => update(r.key, { user: ev.target.value })} disabled={readOnly} placeholder="optional" spellCheck={false} aria-label={`User column for table ${i + 1}`} className={cell(!!e?.user)} />
                  </Cell>
                  <button type="button" onClick={() => setRows((l) => l.filter((x) => x.key !== r.key))} disabled={readOnly} aria-label={`Remove table ${r.table || i + 1}`} className="flex h-10 w-10 items-center justify-center rounded-full text-slate transition hover:bg-bad/10 hover:text-bad disabled:opacity-40">
                    <Icon name="trash" />
                  </button>
                </li>
              );
            })}
          </ul>
          {emptyList ? <p className="px-5 py-6 text-center text-sm text-slate">No tables yet. Add the first one.</p> : null}
          <div className="border-t border-ink/10 px-5 py-3">
            <Button variant="ghost" size="sm" icon="plus" disabled={readOnly} onClick={addRow}>
              Add a table
            </Button>
          </div>
        </Card>
      ) : null}

      {showErrors && emptyList ? <Callout tone="danger">List at least one table, or choose “Sync every table”.</Callout> : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="p-5 text-sm leading-relaxed text-slate">
          <p className="font-medium text-ink">Tenant column</p>
          <p className="mt-1">
            A column such as <Mono>store_id</Mono> or <Mono>org_id</Mono>. A device only receives rows where it equals the <Mono>tenant_id</Mono> in the device’s token, and can only write rows for that tenant.
          </p>
        </Card>
        <Card className="p-5 text-sm leading-relaxed text-slate">
          <p className="font-medium text-ink">User column</p>
          <p className="mt-1">
            A column such as <Mono>owner_id</Mono>. A device only sees rows where it equals the token’s <Mono>user_id</Mono>. Use both columns to scope by tenant and by user.
          </p>
        </Card>
      </div>

      <details className="group rounded-2xl border border-ink/10 px-5 py-3">
        <summary className="cursor-pointer list-none text-sm font-medium [&::-webkit-details-marker]:hidden">
          <span className="flex items-center justify-between">
            What gets sent to the engine
            <Icon name="chevronDown" className="text-slate transition-transform group-open:rotate-180" />
          </span>
        </summary>
        <div className="mt-3">
          <CodeBlock title="rules" code={JSON.stringify(current ?? { tables: "all" }, null, 2)} />
        </div>
      </details>

      {!readOnly ? (
        <div className="sticky bottom-4 z-10 flex items-center justify-between gap-3 rounded-full border border-ink/12 bg-paper/95 py-2 pr-2 pl-5 shadow-[0_12px_40px_rgba(28,27,28,0.12)] backdrop-blur">
          <p className="text-sm text-slate">{dirty ? "You have unsaved changes." : "All changes saved."}</p>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              disabled={!dirty || busy}
              onClick={() => (setScope(saved ? "some" : "all"), setRows(toRows(saved)), setShowErrors(false))}
            >
              Discard
            </Button>
            <Button size="sm" disabled={!dirty} loading={busy} onClick={save}>
              Save rules
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

const cell = (bad: boolean) =>
  `h-10 w-full rounded-xl border bg-paper px-3 font-mono text-[13px] placeholder:text-slate/50 hover:border-ink/40 focus:border-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-rust/30 disabled:bg-mist disabled:text-slate ${bad ? "border-bad" : "border-ink/15"}`;

function Cell({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <span className="mb-1 block text-xs text-slate sm:hidden">{label}</span>
      {children}
      {error ? (
        <p role="alert" className="mt-1 text-xs text-bad">
          {error}
        </p>
      ) : null}
    </div>
  );
}
