import type { AuditEntry, Me, ProjectDetail, UsageDay } from "./types";

/** Fixed "today" so mock pages render the same on the server and in the browser. */
export const MOCK_TODAY = "2026-11-19";

export const mockMe: Me = {
  user: { id: "6f1c2d3e-0000-4000-8000-000000000001", email: "ada@example.com", name: "Ada Lovelace" },
  accounts: [
    { id: "a1000000-0000-4000-8000-000000000001", name: "Ada Lovelace", plan: "free", role: "owner" },
    { id: "a1000000-0000-4000-8000-000000000002", name: "Analytical Engines Ltd", plan: "free", role: "member" },
  ],
};

const personal = mockMe.accounts[0]!.id;

export const mockProjects: ProjectDetail[] = [
  {
    id: "shop-app",
    accountId: personal,
    name: "Shop companion app",
    environment: "production",
    status: "active",
    policy: "last-write-wins",
    rules: {
      tables: {
        orders: { tenant_column: "store_id" },
        customers: { tenant_column: "store_id" },
        drafts: { user_column: "owner_id" },
      },
    },
    limits: { max_batch: 500, requests_per_second: 20, burst: 60, events_per_day: 2_000_000 },
    createdAt: "2026-08-02T09:14:00.000Z",
    role: "owner",
    signingKeys: [
      { kid: "k2", revoked: false, createdAt: "2026-10-30T11:02:00.000Z" },
      { kid: "k1", revoked: false, createdAt: "2026-08-02T09:14:00.000Z" },
    ],
    apiKeys: [
      { id: "9c41e07a", label: "Backend (production)", revoked: false, createdAt: "2026-08-02T09:20:00.000Z" },
      { id: "52bd10f3", label: "Staging server", revoked: false, createdAt: "2026-09-11T14:41:00.000Z" },
      { id: "d0ae77c1", label: "Old backend", revoked: true, createdAt: "2026-08-02T09:18:00.000Z" },
    ],
  },
  {
    id: "field-notes-3fa9",
    accountId: personal,
    name: "Field notes",
    environment: "development",
    status: "active",
    policy: "server-wins",
    rules: null,
    limits: {},
    createdAt: "2026-11-14T16:30:00.000Z",
    role: "owner",
    signingKeys: [{ kid: "k1", revoked: false, createdAt: "2026-11-14T16:30:00.000Z" }],
    apiKeys: [],
  },
  {
    id: "ledger-sync",
    accountId: personal,
    name: "Ledger sync",
    environment: "production",
    status: "suspended",
    policy: "application",
    rules: { tables: { entries: { tenant_column: "org_id", user_column: "author_id" } } },
    limits: { requests_per_second: 5, events_per_day: 100_000 },
    createdAt: "2026-06-21T08:00:00.000Z",
    role: "owner",
    signingKeys: [{ kid: "k1", revoked: false, createdAt: "2026-06-21T08:00:00.000Z" }],
    apiKeys: [{ id: "7be1a920", label: "Ledger API", revoked: false, createdAt: "2026-06-21T08:05:00.000Z" }],
  },
  {
    id: "team-board",
    accountId: mockMe.accounts[1]!.id,
    name: "Team board",
    environment: "development",
    status: "active",
    policy: "client-wins",
    rules: null,
    limits: {},
    createdAt: "2026-10-03T10:10:00.000Z",
    role: "member",
    signingKeys: [{ kid: "k1", revoked: false, createdAt: "2026-10-03T10:10:00.000Z" }],
    apiKeys: [{ id: "31c9be55", label: "Dev", revoked: false, createdAt: "2026-10-03T10:12:00.000Z" }],
  },
];

/** A deterministic wave, so graphs look like real traffic without randomness. */
export function mockUsage(projectId: string, days: number): UsageDay[] {
  const seed = [...projectId].reduce((n, c) => n + c.charCodeAt(0), 0);
  const base = new Date(`${MOCK_TODAY}T00:00:00Z`);
  const out: UsageDay[] = [];
  for (let i = 0; i < days; i++) {
    const d = new Date(base);
    d.setUTCDate(d.getUTCDate() - i);
    const weekday = d.getUTCDay();
    const quiet = weekday === 0 || weekday === 6 ? 0.45 : 1;
    const wave = 0.6 + 0.4 * Math.sin((i + seed) / 3.1);
    const growth = 1 - i / (days * 2.4);
    const events = Math.round(40_000 * quiet * wave * growth + ((seed * (i + 7)) % 1900));
    out.push({ day: d.toISOString().slice(0, 10), eventsApplied: events, pushes: Math.round(events / 11) });
  }
  return out;
}

export function mockAudit(projectId: string): AuditEntry[] {
  const actor = mockMe.user.id;
  const rows: [string, Record<string, unknown>, string][] = [
    ["signing_key.rotate", { kid: "k2" }, "2026-10-30T11:02:00.000Z"],
    ["project.update", { fields: ["limits"] }, "2026-10-12T15:20:00.000Z"],
    ["api_key.create", { id: "52bd10f3", label: "Staging server" }, "2026-09-11T14:41:00.000Z"],
    ["project.update", { fields: ["rules", "policy"] }, "2026-08-04T10:03:00.000Z"],
    ["api_key.revoke", { id: "d0ae77c1" }, "2026-08-02T09:30:00.000Z"],
    ["api_key.create", { id: "9c41e07a", label: "Backend (production)" }, "2026-08-02T09:20:00.000Z"],
    ["project.create", { name: projectId }, "2026-08-02T09:14:00.000Z"],
  ];
  return rows.map(([action, detail, createdAt], i) => ({ id: String(rows.length - i), actor, action, detail, createdAt }));
}
