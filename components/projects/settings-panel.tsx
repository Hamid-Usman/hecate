"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { deleteProject, patchProject } from "@/lib/actions";
import { unwrap } from "@/lib/errors";
import { limitFields, policies, policyLabel } from "@/lib/meta";
import type { ConflictPolicy, Limits, ProjectDetail } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm";
import { Field, Input, OptionCards } from "@/components/ui/form";
import { Callout, Card, Mono, Section } from "@/components/ui/primitives";
import { useToast } from "@/components/ui/toast";

export function SettingsPanel({ project }: { project: ProjectDetail }) {
  const readOnly = project.role === "member";
  return (
    <div className="space-y-12">
      <General project={project} readOnly={readOnly} />
      <PolicySection projectId={project.id} initial={project.policy} readOnly={readOnly} />
      <LimitsSection projectId={project.id} initial={project.limits} readOnly={readOnly} />
      <DangerZone project={project} readOnly={readOnly} />
    </div>
  );
}

/** Save/cancel footer shared by the sections. */
function SaveBar({ dirty, busy, onReset, readOnly }: { dirty: boolean; busy: boolean; onReset: () => void; readOnly: boolean }) {
  if (readOnly) return <p className="text-sm text-slate">Only owners and admins can change this.</p>;
  return (
    <div className="flex items-center gap-2">
      <Button type="submit" disabled={!dirty} loading={busy}>
        Save changes
      </Button>
      {dirty ? (
        <Button variant="ghost" onClick={onReset} disabled={busy}>
          Discard
        </Button>
      ) : null}
    </div>
  );
}

function General({ project, readOnly }: { project: ProjectDetail; readOnly: boolean }) {
  const { toast } = useToast();
  const [saved, setSaved] = useState(project.name);
  const [name, setName] = useState(project.name);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) return setError("The name can’t be empty.");
    setBusy(true);
    try {
      unwrap(await patchProject(project.id, { name: name.trim() }));
      setSaved(name.trim());
      toast("Project renamed.");
    } catch (e) {
      toast((e as Error).message || "Couldn’t save. Please try again.", "error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Section title="General" description="How the project appears in the dashboard.">
      <Card className="p-6">
        <form onSubmit={submit} noValidate className="max-w-md space-y-5">
          <Field label="Project name" error={error}>
            {(p) => <Input {...p} value={name} onChange={(e) => (setName(e.target.value), setError(undefined))} maxLength={80} disabled={readOnly} />}
          </Field>
          <Field label="Project id" hint="Used by the SDK and in URLs. It can’t be changed.">
            {(p) => <Input {...p} mono value={project.id} readOnly disabled />}
          </Field>
          <SaveBar dirty={name.trim() !== saved} busy={busy} onReset={() => setName(saved)} readOnly={readOnly} />
        </form>
      </Card>
    </Section>
  );
}

function PolicySection({ projectId, initial, readOnly }: { projectId: string; initial: ConflictPolicy; readOnly: boolean }) {
  const { toast } = useToast();
  const [saved, setSaved] = useState(initial);
  const [value, setValue] = useState(initial);
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      unwrap(await patchProject(projectId, { policy: value }));
      setSaved(value);
      toast(`Conflicts now resolve as “${policyLabel(value)}”.`);
    } catch (e) {
      toast((e as Error).message || "Couldn’t save. Please try again.", "error");
    } finally {
      setBusy(false);
    }
  }

  const chosen = policies.find((p) => p.value === value);

  return (
    <Section title="Conflict policy" description="When two devices change the same row while offline, this decides which change is kept.">
      <Card className="p-6">
        <form onSubmit={submit} className="space-y-5">
          <OptionCards name="policy" value={value} onChange={setValue} disabled={readOnly} options={policies.map((p) => ({ value: p.value, title: p.label, body: p.summary }))} />
          {chosen ? (
            <Callout title="What this means in practice">{chosen.example}</Callout>
          ) : (
            <Callout>No policy is set, so the engine’s default applies (last write wins). Choose one to be explicit.</Callout>
          )}
          <SaveBar dirty={value !== saved} busy={busy} onReset={() => setValue(saved)} readOnly={readOnly} />
        </form>
      </Card>
    </Section>
  );
}

function LimitsSection({ projectId, initial, readOnly }: { projectId: string; initial: Limits; readOnly: boolean }) {
  const { toast } = useToast();
  const toText = (l: Limits) => Object.fromEntries(limitFields.map((f) => [f.key, l[f.key] === undefined ? "" : String(l[f.key])])) as Record<keyof Limits, string>;
  const [saved, setSaved] = useState(toText(initial));
  const [values, setValues] = useState(toText(initial));
  const [errors, setErrors] = useState<Partial<Record<keyof Limits, string>>>({});
  const [busy, setBusy] = useState(false);

  const dirty = limitFields.some((f) => values[f.key] !== saved[f.key]);

  async function submit(e: FormEvent) {
    e.preventDefault();
    const next: typeof errors = {};
    const limits: Limits = {};
    for (const f of limitFields) {
      const raw = values[f.key].trim();
      if (!raw) continue;
      const n = Number(raw);
      if (!Number.isFinite(n) || n < 0) next[f.key] = "Enter a number, 0 or more.";
      else if (f.key !== "requests_per_second" && !Number.isInteger(n)) next[f.key] = "Use a whole number.";
      else limits[f.key] = n;
    }
    if (Object.keys(next).length) return setErrors(next);

    setBusy(true);
    try {
      unwrap(await patchProject(projectId, { limits }));
      setSaved(values);
      toast("Limits saved and sent to the engine.");
    } catch (e) {
      toast((e as Error).message || "Couldn’t save. Please try again.", "error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Section title="Limits" description="Caps that protect your database and your bill. Leave a field empty for no limit (or the engine’s default).">
      <Card className="p-6">
        <form onSubmit={submit} noValidate className="space-y-6">
          <div className="grid gap-x-6 gap-y-5 sm:grid-cols-2">
            {limitFields.map((f) => (
              <Field key={f.key} label={f.label} hint={f.hint} error={errors[f.key]}>
                {(p) => (
                  <div className="relative">
                    <Input
                      {...p}
                      inputMode="decimal"
                      value={values[f.key]}
                      onChange={(e) => (setValues((v) => ({ ...v, [f.key]: e.target.value })), setErrors((x) => ({ ...x, [f.key]: undefined })))}
                      placeholder={f.placeholder}
                      disabled={readOnly}
                      className="pr-24"
                    />
                    <span className="pointer-events-none absolute inset-y-0 right-3.5 flex items-center font-mono text-[11px] text-slate">{f.unit}</span>
                  </div>
                )}
              </Field>
            ))}
          </div>
          <SaveBar dirty={dirty} busy={busy} onReset={() => setValues(saved)} readOnly={readOnly} />
        </form>
      </Card>
    </Section>
  );
}

function DangerZone({ project, readOnly }: { project: ProjectDetail; readOnly: boolean }) {
  const router = useRouter();
  const { toast } = useToast();
  const [status, setStatus] = useState(project.status);
  const [confirm, setConfirm] = useState<"pause" | "delete" | null>(null);
  const [busy, setBusy] = useState(false);
  const suspended = status === "suspended";

  async function resume() {
    setBusy(true);
    try {
      unwrap(await patchProject(project.id, { status: "active" }));
      setStatus("active");
      toast("Project resumed. Devices will sync again.");
    } catch (e) {
      toast((e as Error).message || "Couldn’t resume the project.", "error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Section title="Danger zone" description="These affect every device using this project.">
      <Card tone="danger" className="divide-y divide-bad/20 overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-4 p-6">
          <div className="max-w-xl">
            <p className="font-medium">{suspended ? "Resume syncing" : "Suspend the project"}</p>
            <p className="mt-1 text-sm leading-relaxed text-slate">
              {suspended
                ? "The project is suspended. Devices keep working offline and queue their changes, and nothing reaches the database."
                : "Stops all syncing right away. Devices keep working offline and send their queued changes when you resume. Nothing is deleted."}
            </p>
          </div>
          {suspended ? (
            <Button icon="play" onClick={resume} loading={busy} disabled={readOnly}>
              Resume project
            </Button>
          ) : (
            <Button variant="danger-outline" icon="pause" onClick={() => setConfirm("pause")} disabled={readOnly}>
              Suspend project
            </Button>
          )}
        </div>
        <div className="flex flex-wrap items-center justify-between gap-4 p-6">
          <div className="max-w-xl">
            <p className="font-medium">Delete this project</p>
            <p className="mt-1 text-sm leading-relaxed text-slate">
              Permanently erases everything devices synced to the database, along with the project’s keys, rules and usage history. The activity log is kept.
            </p>
          </div>
          <Button variant="danger" icon="trash" onClick={() => setConfirm("delete")} disabled={readOnly}>
            Delete project
          </Button>
        </div>
      </Card>
      {readOnly ? <p className="text-sm text-slate">Only owners and admins can do this.</p> : null}

      <ConfirmDialog
        open={confirm === "pause"}
        onClose={() => setConfirm(null)}
        title="Suspend this project?"
        confirmLabel="Suspend"
        body={<p>Syncing stops for every device within a second. Devices keep working offline, and sync again as soon as you resume.</p>}
        onConfirm={async () => {
          unwrap(await patchProject(project.id, { status: "suspended" }));
          setStatus("suspended");
          toast("Project suspended.");
        }}
      />
      <ConfirmDialog
        open={confirm === "delete"}
        onClose={() => setConfirm(null)}
        title="Delete this project?"
        confirmLabel="Delete forever"
        phrase={project.id}
        body={
          <>
            <p>
              Everything devices synced for <Mono>{project.id}</Mono> is erased from the database first, then the project and its keys are removed. Devices stop syncing and their next token request fails.
            </p>
            <p className="mt-2 font-medium text-bad">This can’t be undone.</p>
          </>
        }
        onConfirm={async () => {
          unwrap(await deleteProject(project.id));
          toast(`Project “${project.name}” deleted.`);
          router.push("/projects");
        }}
      />
    </Section>
  );
}
