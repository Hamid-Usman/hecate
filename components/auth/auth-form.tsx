"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { ApiError, login, register } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/form";
import { Callout } from "@/components/ui/primitives";

type Mode = "login" | "register";

const copy = {
  login: {
    eyebrow: "Welcome back",
    title: "Sign in",
    lead: "Manage your projects, keys and sync rules.",
    submit: "Sign in",
    alt: ["New to Hecate?", "Create an account", "/register"],
  },
  register: {
    eyebrow: "Get started",
    title: "Create your account",
    lead: "A personal account and your first project take about a minute.",
    submit: "Create account",
    alt: ["Already have an account?", "Sign in", "/login"],
  },
} as const;

export function AuthForm({ mode }: { mode: Mode }) {
  const router = useRouter();
  const c = copy[mode];
  const [values, setValues] = useState({ name: "", email: "", password: "" });
  const [errors, setErrors] = useState<{ name?: string; email?: string; password?: string; form?: string }>({});
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);

  const set = (key: keyof typeof values) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setValues((v) => ({ ...v, [key]: e.target.value }));
    setErrors((er) => ({ ...er, [key]: undefined, form: undefined }));
  };

  async function submit(e: FormEvent) {
    e.preventDefault();
    const next: typeof errors = {};
    if (!/^\S+@\S+\.\S+$/.test(values.email.trim())) next.email = "Enter a valid email address.";
    if (mode === "register" ? values.password.length < 8 : values.password.length === 0) {
      next.password = mode === "register" ? "Use at least 8 characters." : "Enter your password.";
    }
    if (Object.keys(next).length) return setErrors(next);

    setBusy(true);
    try {
      if (mode === "login") await login(values.email.trim(), values.password);
      else await register({ email: values.email.trim(), password: values.password, name: values.name.trim() || undefined });
      router.push("/projects");
    } catch (err) {
      const e = err as ApiError;
      if (e.status === 409) setErrors({ email: "That email is already registered. Try signing in instead." });
      else if (e.status === 429) setErrors({ form: "Too many failed attempts. Try again in 15 minutes." });
      else if (e.status === 401) setErrors({ form: "Wrong email or password." });
      else setErrors({ form: "Something went wrong on our side. Please try again." });
      setBusy(false);
    }
  }

  return (
    <div className="w-full max-w-sm">
      <p className="font-mono text-[11px] tracking-wide text-rust uppercase">{c.eyebrow}</p>
      <h1 className="mt-2 font-serif text-4xl tracking-tight">{c.title}</h1>
      <p className="mt-2 text-[15px] text-slate">{c.lead}</p>

      <form onSubmit={submit} noValidate className="mt-8 space-y-5">
        {errors.form ? <Callout tone="danger">{errors.form}</Callout> : null}

        {mode === "register" ? (
          <Field label="Name" optional>
            {(p) => <Input {...p} value={values.name} onChange={set("name")} autoComplete="name" placeholder="Ada Lovelace" />}
          </Field>
        ) : null}

        <Field label="Email" error={errors.email}>
          {(p) => <Input {...p} type="email" value={values.email} onChange={set("email")} autoComplete="email" placeholder="you@company.com" autoFocus />}
        </Field>

        <Field label="Password" error={errors.password} hint={mode === "register" ? "At least 8 characters." : undefined}>
          {(p) => (
            <div className="relative">
              <Input {...p} type={show ? "text" : "password"} value={values.password} onChange={set("password")} autoComplete={mode === "login" ? "current-password" : "new-password"} className="pr-16" />
              <button type="button" onClick={() => setShow((s) => !s)} aria-pressed={show} className="absolute inset-y-0 right-3 text-[13px] text-slate hover:text-ink">
                {show ? "Hide" : "Show"}
              </button>
            </div>
          )}
        </Field>

        <Button type="submit" loading={busy} className="w-full">
          {c.submit}
        </Button>
      </form>

      <p className="mt-6 text-sm text-slate">
        {c.alt[0]}{" "}
        <Link href={c.alt[2]} className="font-medium text-ink underline decoration-rust underline-offset-4 hover:text-rust">
          {c.alt[1]}
        </Link>
      </p>
    </div>
  );
}
