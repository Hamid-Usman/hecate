"use client";

import { useState } from "react";
import { useRevokeSigningKey, useRotateSigningKey } from "@/lib/queries";
import { formatDate } from "@/lib/format";
import type { SigningKey } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm";
import { Badge, Callout, Card, Mono } from "@/components/ui/primitives";
import { useToast } from "@/components/ui/toast";

/** `keys` comes from the cached project; rotating and revoking update that cache. */
export function SigningKeysPanel({ projectId, keys, readOnly }: { projectId: string; keys: SigningKey[]; readOnly: boolean }) {
  const { toast } = useToast();
  const rotate = useRotateSigningKey(projectId);
  const revoke = useRevokeSigningKey(projectId);
  const [rotating, setRotating] = useState(false);
  const [revoking, setRevoking] = useState<SigningKey | null>(null);

  const ordered = [...keys].sort((a, b) => Number(b.kid.slice(1)) - Number(a.kid.slice(1)));
  const activeCount = keys.filter((k) => !k.revoked).length;
  const signing = ordered.find((k) => !k.revoked)?.kid;
  const nextKid = `k${Math.max(...keys.map((k) => Number(k.kid.slice(1)))) + 1}`;

  return (
    <div className="space-y-6">
      <Callout title="How rotation works">
        Hecate signs every device token with your newest active key. Rotating adds a new key and starts using it, while tokens signed by older keys keep working, so nobody is signed out. Once those tokens have expired, revoke the old key. If a key might have leaked, revoke it right away: every token it signed is rejected.
      </Callout>

      <div className="flex justify-end">
        <Button icon="refresh" onClick={() => setRotating(true)} disabled={readOnly} title={readOnly ? "Only owners and admins can rotate keys" : undefined}>
          Rotate signing key
        </Button>
      </div>

      <Card className="divide-y divide-ink/8 overflow-hidden">
        {ordered.map((k) => {
          const onlyActive = !k.revoked && activeCount === 1;
          return (
            <div key={k.kid} className={`flex flex-wrap items-center gap-x-6 gap-y-2 px-5 py-4 ${k.revoked ? "opacity-60" : ""}`}>
              <div className="min-w-0 flex-1 basis-full sm:basis-0">
                <p className="flex items-center gap-2 text-sm font-medium">
                  <Mono>{k.kid}</Mono>
                  {k.kid === signing ? <Badge tone="rust">Signing new tokens</Badge> : null}
                </p>
                <p className="mt-1 text-[13px] text-slate">Created {formatDate(k.createdAt)} · the secret never leaves the server</p>
              </div>
              {k.revoked ? <Badge tone="bad">Revoked</Badge> : <Badge tone="ok" dot>Active</Badge>}
              {!k.revoked && !readOnly ? (
                <Button
                  variant="danger-outline"
                  size="sm"
                  icon="trash"
                  disabled={onlyActive}
                  title={onlyActive ? "This is the only active key. Rotate first, then revoke it." : undefined}
                  onClick={() => setRevoking(k)}
                >
                  Revoke
                </Button>
              ) : null}
            </div>
          );
        })}
      </Card>

      <ConfirmDialog
        open={rotating}
        onClose={() => setRotating(false)}
        tone="primary"
        title="Rotate the signing key?"
        confirmLabel={`Add ${nextKid}`}
        body={
          <p>
            A new key, <Mono>{nextKid}</Mono>, is added and used for every token issued from now on. Existing tokens keep working until you revoke the keys that signed them.
          </p>
        }
        onConfirm={async () => {
          const { kid } = await rotate.mutateAsync();
          toast(`Signing key ${kid} is now in use.`);
        }}
      />

      <ConfirmDialog
        open={revoking !== null}
        onClose={() => setRevoking(null)}
        title={`Revoke ${revoking?.kid}?`}
        confirmLabel="Revoke key"
        phrase={revoking?.kid}
        body={
          <>
            <p>
              Every device token signed with <Mono>{revoking?.kid}</Mono> is rejected from now on. Those devices stop syncing until your server issues them a new token, and any changes they made offline wait on the device.
            </p>
            <p className="mt-2">This can’t be undone.</p>
          </>
        }
        onConfirm={async () => {
          const target = revoking!;
          await revoke.mutateAsync(target.kid);
          toast(`Signing key ${target.kid} revoked.`);
        }}
      />
    </div>
  );
}
