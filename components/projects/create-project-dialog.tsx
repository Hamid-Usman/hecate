"use client";

import { useState, type FormEvent } from "react";
import { ApiError } from "@/lib/errors";
import { useCreateProject } from "@/lib/queries";
import { PROJECT_ID_PATTERN, slugify } from "@/lib/format";
import type { Environment, Project } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Field, Input } from "@/components/ui/form";
import { Callout } from "@/components/ui/primitives";

const envs: { value: Environment; title: string; body: string }[] = [
  { value: "development", title: "Development", body: "For building and testing. Use it while you wire up the SDK." },
  { value: "production", title: "Production", body: "For real users. A label only: it changes nothing about how syncing works." },
];

export function CreateProjectDialog({ open, onClose, accountId, onCreated }: { open: boolean; onClose: () => void; accountId: string; onCreated: (p: Project) => void }) {
  const [name, setName] = useState("");
  const [id, setId] = useState("");
  const [idTouched, setIdTouched] = useState(false);
  const [environment, setEnvironment] = useState<Environment>("development");
  const [errors, setErrors] = useState<{ name?: string; id?: string; form?: string }>({});
  const create = useCreateProject(accountId);
  const busy = create.isPending;

  const effectiveId = idTouched ? id : slugify(name);

  function reset() {
    setName("");
    setId("");
    setIdTouched(false);
    setEnvironment("development");
    setErrors({});
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    const next: typeof errors = {};
    if (!name.trim()) next.name = "Give the project a name.";
    if (effectiveId && !PROJECT_ID_PATTERN.test(effectiveId)) next.id = "3–40 characters: lowercase letters, digits, “-” and “_”, starting with a letter or digit.";
    if (Object.keys(next).length) return setErrors(next);

    try {
      const project = await create.mutateAsync({ name: name.trim(), id: effectiveId || undefined, environment });
      reset();
      onCreated(project);
      onClose();
    } catch (err) {
      const e = err as ApiError;
      if (e.status === 409) setErrors({ id: "That project id is already taken. Pick another." });
      else if (e.status === 400) setErrors({ form: e.message });
      else if (e.status === 403) setErrors({ form: "Only owners and admins can create projects in this account." });
      else setErrors({ form: e.message || "Couldn’t create the project. Please try again." });
    }
  }

  return (
    <Dialog open={open} onClose={() => !busy && onClose()} dismissible={!busy} title="New project" description="One project per app. Its devices share one synced database.">
      <form onSubmit={submit} noValidate className="space-y-5">
        {errors.form ? <Callout tone="danger">{errors.form}</Callout> : null}

        <Field label="Name" error={errors.name}>
          {(p) => <Input {...p} value={name} onChange={(e) => (setName(e.target.value), setErrors((x) => ({ ...x, name: undefined })))} placeholder="Shop companion app" autoFocus maxLength={80} />}
        </Field>

        <Field label="Project id" error={errors.id} hint="Used in URLs and by the SDK. It can’t be changed later.">
          {(p) => (
            <Input
              {...p}
              mono
              value={effectiveId}
              onChange={(e) => {
                setIdTouched(true);
                setId(e.target.value.toLowerCase());
                setErrors((x) => ({ ...x, id: undefined }));
              }}
              placeholder="shop-companion-app"
              maxLength={40}
              spellCheck={false}
            />
          )}
        </Field>

        <fieldset>
          <legend className="mb-1.5 text-[13px] font-medium">Environment</legend>
          <div className="grid gap-2 sm:grid-cols-2">
            {envs.map((o) => (
              <label key={o.value} className={`cursor-pointer rounded-2xl border p-3.5 transition has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-rust ${environment === o.value ? "border-ink bg-ink text-paper" : "border-ink/12 hover:border-ink/40"}`}>
                <input type="radio" name="environment" className="sr-only" checked={environment === o.value} onChange={() => setEnvironment(o.value)} />
                <span className="block text-sm font-medium">{o.title}</span>
                <span className={`mt-0.5 block text-xs leading-snug ${environment === o.value ? "text-mist/70" : "text-slate"}`}>{o.body}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <div className="flex justify-end gap-2 pt-1">
          <Button variant="secondary" onClick={onClose} disabled={busy}>
            Cancel
          </Button>
          <Button type="submit" loading={busy}>
            Create project
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
