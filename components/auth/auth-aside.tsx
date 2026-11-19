import Link from "next/link";
import { Mark } from "@/components/landing/glyphs";

/** The dark side panel of the sign-in and register pages. */
export function AuthAside() {
  return (
    <aside className="blueprint-dark relative hidden overflow-hidden text-mist lg:flex lg:flex-col lg:justify-between lg:p-12">
      <Link href="/" className="flex w-fit items-center gap-2.5">
        <Mark className="h-7 w-7" animated />
        <span className="font-serif text-2xl tracking-tight">Hecate</span>
      </Link>

      <div>
        <svg viewBox="0 0 440 150" className="w-full max-w-md" role="img" aria-label="A device syncs through Hecate to PostgreSQL">
          <g fill="none" stroke="#edeeef" strokeOpacity="0.55" strokeWidth="1.2">
            <rect x="8" y="46" width="76" height="58" rx="12" />
            <rect x="182" y="34" width="76" height="82" rx="14" stroke="#a14c32" strokeOpacity="1" />
            <ellipse cx="392" cy="56" rx="34" ry="11" />
            <path d="M358 56v38c0 6 15 11 34 11s34-5 34-11V56" />
          </g>
          <g className="dash-flow" fill="none" stroke="#a14c32" strokeWidth="1.6">
            <path d="M84 75h98" />
            <path d="M258 75h100" />
          </g>
          <g className="fill-mist" fontFamily="var(--font-geist-mono)" fontSize="9" letterSpacing="1">
            <text x="46" y="130" textAnchor="middle" opacity="0.6">DEVICE</text>
            <text x="220" y="136" textAnchor="middle" opacity="0.6">HECATE</text>
            <text x="392" y="130" textAnchor="middle" opacity="0.6">POSTGRES</text>
          </g>
          <circle cx="46" cy="75" r="4" fill="#a14c32" />
          <circle cx="220" cy="75" r="4" fill="#a14c32" className="stroke-radar-ring" />
        </svg>

        <h2 className="mt-10 max-w-md font-serif text-4xl leading-[1.1] tracking-tight">
          Sync that survives <em className="text-rust not-italic">airplane mode</em>.
        </h2>
        <ul className="mt-6 max-w-md space-y-3 text-[15px] leading-relaxed text-mist/70">
          <li>Create a project, get an API key, and your devices start syncing.</li>
          <li>Choose how conflicts resolve and which rows each device may see.</li>
          <li>Rotate keys and pause a project without redeploying anything.</li>
        </ul>
      </div>

      <p className="font-mono text-[11px] tracking-wide text-mist/40 uppercase">Control plane · hecates-backend</p>
    </aside>
  );
}
