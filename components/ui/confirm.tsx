"use client";

import { useState, type ReactNode } from "react";
import { Button } from "./button";
import { Dialog } from "./dialog";
import { Input } from "./form";
import { Callout } from "./primitives";

/**
 * Confirmation for actions that cannot be undone. With `phrase` set, the button stays disabled until
 * the person types it, so a reflex click cannot destroy anything. If `onConfirm` throws, the dialog
 * stays open and shows the message.
 */
export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  body,
  confirmLabel,
  phrase,
  tone = "danger",
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
  title: string;
  body: ReactNode;
  confirmLabel: string;
  phrase?: string;
  tone?: "danger" | "primary";
}) {
  const [typed, setTyped] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const ready = !phrase || typed === phrase;

  const close = () => {
    if (busy) return;
    setTyped("");
    setError(null);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={close}
      title={title}
      dismissible={!busy}
      footer={
        <>
          <Button variant="secondary" onClick={close} disabled={busy}>
            Cancel
          </Button>
          <Button
            variant={tone === "danger" ? "danger" : "primary"}
            disabled={!ready}
            loading={busy}
            onClick={async () => {
              setBusy(true);
              setError(null);
              try {
                await onConfirm();
                setTyped("");
                onClose();
              } catch (e) {
                setError((e as Error).message || "Something went wrong. Please try again.");
              } finally {
                setBusy(false);
              }
            }}
          >
            {confirmLabel}
          </Button>
        </>
      }
    >
      <div className="space-y-4 text-sm leading-relaxed text-slate">
        {error ? <Callout tone="danger">{error}</Callout> : null}
        <div>{body}</div>
        {phrase ? (
          <label className="block space-y-1.5">
            <span className="text-[13px] text-ink">
              Type <code className="rounded bg-ink/[0.06] px-1.5 py-0.5 font-mono text-[12.5px]">{phrase}</code> to confirm
            </span>
            <Input value={typed} onChange={(e) => setTyped(e.target.value)} autoComplete="off" spellCheck={false} mono />
          </label>
        ) : null}
      </div>
    </Dialog>
  );
}
