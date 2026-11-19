const date = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
const dateTime = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "UTC" });
const compact = new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 });
const full = new Intl.NumberFormat("en");

export const formatDate = (iso: string) => date.format(new Date(iso));
export const formatDateTime = (iso: string) => `${dateTime.format(new Date(iso))} UTC`;
export const formatCompact = (n: number) => compact.format(n);
export const formatNumber = (n: number) => full.format(n);

/** "my-app-3fa9" from "My app!", the id shape the backend accepts. */
export function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 36);
}

export const PROJECT_ID_PATTERN = /^[a-z0-9][a-z0-9_-]{2,39}$/;
