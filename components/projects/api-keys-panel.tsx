"use client";

import { useState, type FormEvent } from "react";
import { createApiKey, revokeApiKey } from "@/lib/actions";
import { unwrap } from "@/lib/errors";
import { formatDate } from "@/lib/format";
import type { ApiKey } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm";
import { CodeBlock } from "@/components/ui/copy";
import { Dialog } from "@/components/ui/dialog";
import { Field, Input } from "@/components/ui/form";
import { Badge, Callout, Card, EmptyState, Mono } from "@/components/ui/primitives";
import { useToast } from "@/components/ui/toast";

export function ApiKeysPanel({ projectId, initial, readOnly }: { projectId: string; initial: ApiKey[]; readOnly: boolean }) {
  const { toast } = useToast();
  const [keys, setKeys] = useState(initial);
  const [creating, setCreating] = useState(false);
  const [revoking, setRevoking] = useState<ApiKey | null>(null);

  const active = keys.filter((k) => !k.revoked);
  const revoked = keys.filter((k) => k.revoked);

  const createButton = (
    <Button icon="plus" onClick={() => setCreating(true)} disabled={readOnly} title={readOnly ? "Only owners and admins can create keys" : undefined}>
      Create API key
    </Button>
  );

  return (
    <div className="space-y-6">
      <Callout title="Keep API keys on your server">
        An API key lets your backend ask Hecate for a token for each device. Never put one in your app: anyone who finds it can create tokens for this project.
      </Callout>

      <div className="flex justify-end">{createButton}</div>

      {keys.length === 0 ? (
        <EmptyState icon="key" title="No API keys yet" body="Create a key, store it in your server’s secrets, then use it to issue device tokens." action={createButton} />
      ) : (
        <Card className="divide-y divide-ink/8 overflow-hidden">
          {[...active, ...revoked].map((k) => (
            <div key={k.id} className={`flex flex-wrap items-center gap-x-6 gap-y-2 px-5 py-4 ${k.revoked ? "opacity-60" : ""}`}>
              <div className="min-w-0 flex-1 basis-full sm:basis-0">
                <p className="truncate text-sm font-medium">{k.label || <span className="text-slate">Unnamed key</span>}</p>
                <p className="mt-0.5 text-[13px] text-slate">
                  <Mono>hsk.…{k.id}</Mono> · created {formatDate(k.createdAt)}
                </p>
              </div>
              {k.revoked ? <Badge tone="bad">Revoked</Badge> : <Badge tone="ok" dot>Active</Badge>}
              {!k.revoked && !readOnly ? (
                <Button variant="danger-outline" size="sm" icon="trash" onClick={() => setRevoking(k)}>
                  Revoke
                </Button>
              ) : null}
            </div>
          ))}
        </Card>
      )}

      <CreateKeyDialog
        open={creating}
        projectId={projectId}
        onClose={() => setCreating(false)}
        onCreated={(k) => setKeys((l) => [{ id: k.id, label: k.label, revoked: false, createdAt: new Date().toISOString() }, ...l])}
      />

      <ConfirmDialog
        open={revoking !== null}
        onClose={() => setRevoking(null)}
        title="Revoke this API key?"
        confirmLabel="Revoke key"
        body={
          <>
            <p>
              <strong className="text-ink">{revoking?.label || "This key"}</strong> (<Mono>hsk.…{revoking?.id}</Mono>) stops working immediately. Your server won’t be able to issue new device tokens with it.
            </p>
            <p className="mt-2">Tokens already issued keep working until they expire, so devices that are online are not signed out. This can’t be undone.</p>
          </>
        }
        onConfirm={async () => {
          const target = revoking!;
          unwrap(await revokeApiKey(projectId, target.id));
          setKeys((l) => l.map((k) => (k.id === target.id ? { ...k, revoked: true } : k)));
          toast("API key revoked. The engine stopped accepting it.");
        }}
      />
    </div>
  );
}

function CreateKeyDialog({ open, projectId, onClose, onCreated }: { open: boolean; projectId: string; onClose: () => void; onCreated: (k: { id: string; label: string }) => void }) {
  const [label, setLabel] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState<{ key: string; label: string } | null>(null);
  const [saved, setSaved] = useState(false);

  function close() {
    setLabel("");
    setError(null);
    setCreated(null);
    setSaved(false);
    onClose();
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const k = unwrap(await createApiKey(projectId, label.trim()));
      setCreated({ key: k.key, label: k.label });
      onCreated({ id: k.id, label: k.label });
    } catch (e) {
      setError((e as Error).message || "Couldn’t create the key. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  if (created) {
    return (
      <Dialog
        open={open}
        onClose={close}
        dismissible={false}
        size="lg"
        title="Copy your API key now"
        description={created.label ? `“${created.label}” is ready.` : "Your key is ready."}
        footer={
          <Button disabled={!saved} onClick={close}>
            Done
          </Button>
        }
      >
        <div className="space-y-4">
          <Callout tone="warn" title="This is the only time the full key is shown">
            Hecate stores only a fingerprint of it. If you lose it, create a new key and revoke this one.
          </Callout>
          <CodeBlock title="API key" code={created.key} wrap />
          <label className="flex cursor-pointer items-start gap-3 text-sm">
            <input type="checkbox" checked={saved} onChange={(e) => setSaved(e.target.checked)} className="mt-0.5 h-4 w-4 accent-[#a14c32]" />
            <span>I’ve stored this key somewhere safe.</span>
          </label>
        </div>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onClose={() => !busy && close()} dismissible={!busy} title="Create an API key" description="Name it after where it will live, so you know which to revoke later.">
      <form onSubmit={submit} className="space-y-5">
        {error ? <Callout tone="danger">{error}</Callout> : null}
        <Field label="Label" optional hint="For example “Production backend”.">
          {(p) => <Input {...p} value={label} onChange={(e) => setLabel(e.target.value)} maxLength={60} placeholder="Production backend" autoFocus />}
        </Field>
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={close} disabled={busy}>
            Cancel
          </Button>
          <Button type="submit" loading={busy}>
            Create key
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
