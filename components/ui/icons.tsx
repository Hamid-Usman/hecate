import type { SVGProps } from "react";

const paths = {
  projects: <><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></>,
  overview: <><path d="M3 12h4l3-8 4 16 3-8h4" /></>,
  key: <><circle cx="8" cy="15" r="4" /><path d="m11 12 9-9m-3 3 3 3m-5-1 2 2" /></>,
  shield: <><path d="M12 3 4 6v6c0 4.5 3.2 7.8 8 9 4.8-1.2 8-4.5 8-9V6l-8-3Z" /><path d="m9 12 2 2 4-4" /></>,
  rules: <><path d="M3 5h18M3 12h12M3 19h8" /><circle cx="19" cy="12" r="2" /><circle cx="15" cy="19" r="2" /></>,
  usage: <><path d="M4 20V10m6 10V4m6 16v-7m4 7H2" /></>,
  audit: <><path d="M8 6h12M8 12h12M8 18h12" /><circle cx="4" cy="6" r="1" /><circle cx="4" cy="12" r="1" /><circle cx="4" cy="18" r="1" /></>,
  settings: <><circle cx="12" cy="12" r="3" /><path d="M12 2v3m0 14v3M2 12h3m14 0h3M5 5l2 2m10 10 2 2M19 5l-2 2M7 17l-2 2" /></>,
  plus: <><path d="M12 5v14M5 12h14" /></>,
  copy: <><rect x="9" y="9" width="11" height="11" rx="2" /><path d="M5 15V6a2 2 0 0 1 2-2h8" /></>,
  check: <><path d="m5 12.5 4.5 4.5L19 7" /></>,
  trash: <><path d="M4 7h16M10 3h4M6 7l1 13h10l1-13M10 11v6m4-6v6" /></>,
  chevron: <><path d="m9 6 6 6-6 6" /></>,
  chevronDown: <><path d="m6 9 6 6 6-6" /></>,
  logout: <><path d="M10 4H5v16h5M15 8l4 4-4 4M19 12H9" /></>,
  alert: <><path d="M12 3 2 20h20L12 3Z" /><path d="M12 10v5m0 3v.01" /></>,
  info: <><circle cx="12" cy="12" r="9" /><path d="M12 11v6m0-10v.01" /></>,
  eye: <><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z" /><circle cx="12" cy="12" r="3" /></>,
  refresh: <><path d="M20 11a8 8 0 0 0-14-4M4 5v4h4M4 13a8 8 0 0 0 14 4m2 2v-4h-4" /></>,
  menu: <><path d="M4 7h16M4 12h16M4 17h16" /></>,
  close: <><path d="M6 6l12 12M18 6 6 18" /></>,
  search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></>,
  external: <><path d="M14 4h6v6M20 4l-9 9M18 14v5H5V6h5" /></>,
  pause: <><path d="M8 5v14M16 5v14" /></>,
  play: <><path d="m7 4 13 8-13 8V4Z" /></>,
  user: <><circle cx="12" cy="8" r="4" /><path d="M4 21c1-4 4-6 8-6s7 2 8 6" /></>,
  database: <><ellipse cx="12" cy="6" rx="8" ry="3" /><path d="M4 6v12c0 1.7 3.6 3 8 3s8-1.3 8-3V6M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3" /></>,
  sync: <><path d="M4 12a8 8 0 0 1 13.5-5.8L20 8M20 4v4h-4M20 12a8 8 0 0 1-13.5 5.8L4 16m0 4v-4h4" /></>,
} as const;

export type IconName = keyof typeof paths;

export function Icon({ name, className = "", ...props }: { name: IconName } & SVGProps<SVGSVGElement>) {
  // Default to 16px unless the caller sets a size (h-* or w-*), so colour-only classNames keep the icon small.
  const sized = /(^|\s)(size|h|w)-/.test(className);
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={`shrink-0 ${sized ? "" : "h-4 w-4"} ${className}`}
      {...props}
    >
      {paths[name]}
    </svg>
  );
}
