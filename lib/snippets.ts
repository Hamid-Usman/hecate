import type { ProjectDetail } from "./types";

/** Code shown in the Connect guide, filled in with the project's real id, engine URL and tables. */
export function connectSnippets(project: ProjectDetail, engine: string) {
  const tables = Object.entries(project.rules?.tables ?? { notes: { tenant_column: "tenant_id" } });
  const tableLines = tables.map(([name, r]) => {
    const cols = ["id", r.tenant_column, r.user_column].filter(Boolean);
    return `    ${name}: { columns: [${cols.map((c) => `"${c}"`).join(", ")} /* , …your other columns */] },`;
  });
  const first = tables[0]![0];
  const firstTenant = tables[0]![1].tenant_column;

  const install = ["npm install hecates-engine", "npx expo install expo-sqlite"].join("\n");

  const server = [
    "// On YOUR server, after you have signed the user in to your own app.",
    "// The API key never leaves the server.",
    'app.get("/hecate-token", requireUser, async (req, res) => {',
    `  const r = await fetch("${engine}/v1/tokens", {`,
    '    method: "POST",',
    "    headers: {",
    '      Authorization: "Bearer " + process.env.HECATE_API_KEY,',
    '      "Content-Type": "application/json",',
    "    },",
    "    body: JSON.stringify({",
    "      device_id: req.query.deviceId,        // stable per app install",
    "      user_id: req.user.id,",
    firstTenant ? `      tenant_id: req.user.orgId,            // matched against "${firstTenant}" by your rules` : "      // tenant_id: req.user.orgId,        // add if your rules use a tenant column",
    "      ttl_seconds: 3600,",
    "    }),",
    "  });",
    "  res.json(await r.json());               // { token, expires_at }",
    "});",
  ].join("\n");

  const app = [
    'import * as SQLite from "expo-sqlite";',
    'import { Hecate, fromExpoSqlite } from "hecates-engine";',
    "",
    'const db = await SQLite.openDatabaseAsync("app.db");',
    "",
    "// 1. Create your tables as usual.",
    `await db.execAsync("CREATE TABLE IF NOT EXISTS ${first} (id TEXT PRIMARY KEY${firstTenant ? `, ${firstTenant} TEXT NOT NULL` : ""} /* …your columns */)");`,
    "",
    "// 2. Tell Hecate which tables to sync.",
    "export const hecate = new Hecate({",
    "  db: fromExpoSqlite(db),",
    `  serverUrl: "${engine}",`,
    `  projectId: "${project.id}",`,
    "  deviceId,                          // generate once per install and keep it",
    "  getToken: async () => {",
    '    const res = await fetch("https://YOUR-SERVER/hecate-token?deviceId=" + deviceId, {',
    "      headers: { Authorization: `Bearer ${yourSessionToken}` },",
    "    });",
    "    return (await res.json()).token;",
    "  },",
    "  tables: {",
    ...tableLines,
    "  },",
    "});",
    "",
    "// 3. Start. Safe on every launch.",
    "await hecate.start();",
  ].join("\n");

  const use = [
    "// Use your database exactly as before. Hecate records every change, online or off.",
    `await db.runAsync("INSERT INTO ${first} (id${firstTenant ? `, ${firstTenant}` : ""}) VALUES (?${firstTenant ? ", ?" : ""})", [${firstTenant ? '"n1", "acme"' : '"n1"'}]);`,
    "hecate.syncSoon();                   // optional: sync in about 300 ms",
    "",
    "// Phones pause timers in the background, so also sync when the app returns",
    "// to the foreground and when the network comes back:",
    "await hecate.syncNow();",
    "",
    '// Other devices\' changes arrive after a sync. Re-read your table on "idle":',
    'hecate.on("status", (s) => { if (s.state === "idle") reload(); });',
  ].join("\n");

  return { install, server, app, use };
}
