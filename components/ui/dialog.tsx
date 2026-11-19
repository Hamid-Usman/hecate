"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { Icon } from "./icons";

/** A modal built on the native <dialog>: focus trap, Escape and the backdrop come with the platform. */
export function Dialog({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = "md",
  dismissible = true,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
  size?: "md" | "lg";
  /** False while a request is running or a one-time secret is on screen. */
  dismissible?: boolean;
}) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) {
      d.showModal();
      // The browser focuses the first control (the close button); move to the first field instead.
      d.querySelector<HTMLElement>("input:not([type=hidden]):not([type=radio]):not([type=checkbox]):not([disabled]), textarea:not([disabled])")?.focus();
    }
    if (!open && d.open) d.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby="dialog-title"
      onCancel={(e) => {
        e.preventDefault();
        if (dismissible) onClose();
      }}
      onClose={onClose}
      onMouseDown={(e) => {
        if (dismissible && e.target === ref.current) onClose();
      }}
      className={`m-auto w-[calc(100%-2rem)] ${size === "lg" ? "max-w-2xl" : "max-w-md"} rounded-3xl border border-ink/10 bg-paper p-0 text-ink shadow-[0_30px_80px_rgba(28,27,28,0.25)] backdrop:bg-ink/40 backdrop:backdrop-blur-sm`}
    >
      {open ? (
        <div className="p-6 sm:p-7">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 id="dialog-title" className="font-serif text-2xl tracking-tight">
                {title}
              </h2>
              {description ? <p className="mt-1.5 text-sm leading-relaxed text-slate">{description}</p> : null}
            </div>
            {dismissible ? (
              <button type="button" onClick={onClose} aria-label="Close" className="-mt-1 -mr-2 rounded-full p-2 text-slate transition hover:bg-ink/5 hover:text-ink">
                <Icon name="close" />
              </button>
            ) : null}
          </div>
          {children ? <div className="mt-5">{children}</div> : null}
          {footer ? <div className="mt-6 flex flex-wrap justify-end gap-2">{footer}</div> : null}
        </div>
      ) : null}
    </dialog>
  );
}
