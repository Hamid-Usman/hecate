import type { ConflictPolicy, Limits } from "./types";

export const policies: { value: ConflictPolicy; label: string; summary: string; example: string }[] = [
  {
    value: "last-write-wins",
    label: "Last write wins",
    summary: "The change with the newest timestamp is kept.",
    example: "Two people rename the same note offline. Whoever edited last keeps their title. Device clocks decide, so clocks that drift can pick the wrong winner.",
  },
  {
    value: "server-wins",
    label: "Server wins",
    summary: "The version already on the server is kept; the device is updated to match.",
    example: "A device edits a price that someone changed centrally in the meantime. The central price stays and the device's edit is discarded.",
  },
  {
    value: "client-wins",
    label: "Client wins",
    summary: "The device's edit replaces the server's version.",
    example: "A field worker's report always beats what the office had. Good when the person with the device is the source of truth.",
  },
  {
    value: "application",
    label: "Application decides",
    summary: "Hecate reports the conflict and your app resolves it.",
    example: "Merge two edited paragraphs, or ask the user which to keep. Needs a resolver in your app's SDK code.",
  },
];

export const policyLabel = (p: ConflictPolicy) => (p === "" ? "Engine default" : (policies.find((x) => x.value === p)?.label ?? p));

export const limitFields: { key: keyof Limits; label: string; hint: string; unit: string; step?: number; placeholder: string }[] = [
  { key: "requests_per_second", label: "Requests per second", hint: "Sustained request rate each device may use.", unit: "req/s", step: 0.5, placeholder: "No limit" },
  { key: "burst", label: "Burst", hint: "How many requests can arrive at once before the rate applies.", unit: "requests", placeholder: "Engine default" },
  { key: "max_batch", label: "Largest batch", hint: "The most changes accepted in one push.", unit: "changes", placeholder: "Engine default" },
  { key: "events_per_day", label: "Changes per day", hint: "A daily cap on applied changes for the whole project. Syncing pauses when it is reached and resumes at 00:00 UTC.", unit: "changes", placeholder: "No limit" },
  { key: "max_streams", label: "Live connections", hint: "How many devices may hold a live connection at once.", unit: "connections", placeholder: "No limit" },
];

export const auditActions: Record<string, { label: string; tone: "neutral" | "ok" | "warn" | "bad" }> = {
  "project.create": { label: "Created the project", tone: "ok" },
  "project.update": { label: "Changed settings", tone: "neutral" },
  "project.suspend": { label: "Suspended the project", tone: "warn" },
  "project.activate": { label: "Resumed the project", tone: "ok" },
  "project.delete": { label: "Deleted the project", tone: "bad" },
  "api_key.create": { label: "Created an API key", tone: "ok" },
  "api_key.revoke": { label: "Revoked an API key", tone: "warn" },
  "signing_key.rotate": { label: "Rotated the signing key", tone: "neutral" },
  "signing_key.revoke": { label: "Revoked a signing key", tone: "warn" },
};

export function describeAudit(action: string, detail: Record<string, unknown>): string {
  const bits: string[] = [];
  if (typeof detail.label === "string" && detail.label) bits.push(`“${detail.label}”`);
  if (typeof detail.id === "string") bits.push(detail.id);
  if (typeof detail.kid === "string") bits.push(detail.kid);
  if (Array.isArray(detail.fields)) bits.push(detail.fields.join(", "));
  if (typeof detail.name === "string" && action === "project.create") bits.push(detail.name);
  return bits.join(" · ");
}
