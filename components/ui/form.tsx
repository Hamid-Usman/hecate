"use client";

import { useId, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from "react";

const control =
  "w-full rounded-xl border border-ink/15 bg-paper px-3.5 text-sm text-ink placeholder:text-slate/60 transition-colors duration-200 hover:border-ink/40 focus:border-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-rust/30 disabled:cursor-not-allowed disabled:bg-mist disabled:text-slate aria-[invalid=true]:border-bad";

/** A labelled form control with hint and error text, wired up for screen readers. */
export function Field({
  label,
  hint,
  error,
  optional,
  children,
}: {
  label: string;
  hint?: ReactNode;
  error?: string | null;
  optional?: boolean;
  children: (props: { id: string; "aria-describedby"?: string; "aria-invalid"?: boolean }) => ReactNode;
}) {
  const id = useId();
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="flex items-baseline gap-2 text-[13px] font-medium text-ink">
        {label}
        {optional ? <span className="font-mono text-[11px] font-normal tracking-wide text-slate uppercase">optional</span> : null}
      </label>
      {children({ id, "aria-describedby": describedBy, "aria-invalid": error ? true : undefined })}
      {error ? (
        <p id={`${id}-error`} role="alert" className="text-[13px] text-bad">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="text-[13px] text-slate">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

export function Input({ className = "", mono, ...props }: InputHTMLAttributes<HTMLInputElement> & { mono?: boolean }) {
  return <input {...props} className={`${control} h-10 ${mono ? "font-mono text-[13px]" : ""} ${className}`} />;
}

export function Textarea({ className = "", ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={`${control} min-h-24 py-2.5 ${className}`} />;
}

export function Select({ className = "", children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select {...props} className={`${control} h-10 appearance-none bg-[url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23515159' stroke-width='1.6' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")] bg-[length:16px] bg-[right_0.75rem_center] bg-no-repeat pr-9 ${className}`}>
      {children}
    </select>
  );
}

/** An on/off switch. */
export function Toggle({ checked, onChange, label, disabled }: { checked: boolean; onChange: (v: boolean) => void; label: string; disabled?: boolean }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative h-6 w-11 shrink-0 rounded-full transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rust disabled:opacity-50 ${checked ? "bg-rust" : "bg-ink/20"}`}
    >
      <span className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-paper shadow transition-transform duration-200 ${checked ? "translate-x-5" : ""}`} />
    </button>
  );
}

/** A group of cards where exactly one can be chosen. */
export function OptionCards<T extends string>({
  name,
  value,
  onChange,
  options,
  disabled,
}: {
  name: string;
  value: T;
  onChange: (v: T) => void;
  options: { value: T; title: string; body: string; footnote?: string }[];
  disabled?: boolean;
}) {
  return (
    <div role="radiogroup" className="grid gap-2.5 sm:grid-cols-2">
      {options.map((o) => {
        const selected = o.value === value;
        return (
          <label
            key={o.value}
            className={`relative flex cursor-pointer flex-col gap-1 rounded-2xl border p-4 transition duration-200 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-rust ${
              selected ? "border-ink bg-ink text-paper" : "border-ink/12 bg-paper hover:border-ink/40"
            } ${disabled ? "pointer-events-none opacity-60" : ""}`}
          >
            <input type="radio" name={name} value={o.value} checked={selected} disabled={disabled} onChange={() => onChange(o.value)} className="sr-only" />
            <span className="flex items-center justify-between gap-2 text-sm font-medium">
              {o.title}
              <span className={`h-4 w-4 rounded-full border ${selected ? "border-rust bg-rust shadow-[inset_0_0_0_3px_#1c1b1c]" : "border-ink/30"}`} />
            </span>
            <span className={`text-[13px] leading-snug ${selected ? "text-mist/80" : "text-slate"}`}>{o.body}</span>
            {o.footnote ? <span className={`mt-1 text-xs leading-snug ${selected ? "text-mist/60" : "text-slate/80"}`}>{o.footnote}</span> : null}
          </label>
        );
      })}
    </div>
  );
}
