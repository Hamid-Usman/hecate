import Link from "next/link";
import type { ButtonHTMLAttributes, ComponentProps } from "react";
import { Icon, type IconName } from "./icons";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "danger-outline";
type Size = "sm" | "md";

const variants: Record<Variant, string> = {
  primary: "bg-rust text-paper hover:bg-bark",
  secondary: "border border-ink/15 text-ink hover:border-ink hover:bg-ink hover:text-paper",
  ghost: "text-slate hover:bg-ink/5 hover:text-ink",
  danger: "bg-bad text-paper hover:bg-bad/85",
  "danger-outline": "border border-bad/30 text-bad hover:border-bad hover:bg-bad hover:text-paper",
};
const sizes: Record<Size, string> = { sm: "h-8 gap-1.5 px-3 text-[13px]", md: "h-10 gap-2 px-4 text-sm" };

export function buttonClass(variant: Variant = "primary", size: Size = "md", extra = "") {
  return `inline-flex shrink-0 items-center justify-center rounded-full font-medium whitespace-nowrap transition duration-300 ease-out focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rust disabled:pointer-events-none disabled:opacity-50 ${variants[variant]} ${sizes[size]} ${extra}`;
}

interface Common {
  variant?: Variant;
  size?: Size;
  icon?: IconName;
}

export function Button({
  variant,
  size,
  icon,
  loading,
  children,
  className = "",
  ...props
}: Common & { loading?: boolean } & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button type="button" {...props} disabled={props.disabled || loading} aria-busy={loading || undefined} className={buttonClass(variant, size, className)}>
      {loading ? <Spinner /> : icon ? <Icon name={icon} /> : null}
      {children}
    </button>
  );
}

export function ButtonLink({ variant, size, icon, children, className = "", ...props }: Common & ComponentProps<typeof Link>) {
  return (
    <Link {...props} className={buttonClass(variant, size, className)}>
      {icon ? <Icon name={icon} /> : null}
      {children}
    </Link>
  );
}

export function Spinner({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={`animate-spin ${className}`} fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}
