import Link from "next/link";
import { CodeBlock } from "@/components/ui/copy";
import { Callout, Card, Mono } from "@/components/ui/primitives";
import { connectSnippets } from "@/lib/snippets";
import type { ProjectDetail } from "@/lib/types";

function Step({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <li className="flex gap-4">
      <span className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-ink font-mono text-[12px] text-paper">{n}</span>
      <div className="min-w-0 flex-1 space-y-3 pb-2">
        <h3 className="font-serif text-2xl tracking-tight">{title}</h3>
        {children}
      </div>
    </li>
  );
}

const p = "text-[15px] leading-relaxed text-slate";

/** How a developer connects an app to this project, with the project's own values filled in. */
export function ConnectGuide({ project, engine }: { project: ProjectDetail; engine: string }) {
  const s = connectSnippets(project, engine);
  const hasKey = project.apiKeys.some((k) => !k.revoked);
  const tenantRule = Object.values(project.rules?.tables ?? {}).some((t) => t.tenant_column);

  return (
    <div className="space-y-8">
      <Card className="p-6 sm:p-7">
        <h2 className="font-serif text-2xl tracking-tight">How syncing fits together</h2>
        <p className={`mt-2 ${p}`}>
          Your app reads and writes a local SQLite database, so it works offline. The Hecate SDK records each change and, when there is a connection, sends it to the engine, which applies it to the shared database and delivers other devices’ changes back. Devices never hold a secret: your server hands each one a short-lived token.
        </p>
        <ol className="mt-5 grid gap-3 sm:grid-cols-3">
          {[
            ["Your app", "Local SQLite plus the Hecate SDK. Works with no connection."],
            ["Your server", "Signs the user in, then asks the engine for a device token using your API key."],
            ["Hecate engine", "Checks the token and your rules, applies changes, fans them out to other devices."],
          ].map(([t, b]) => (
            <li key={t} className="rounded-2xl border border-ink/10 bg-mist/50 p-4">
              <p className="text-sm font-medium">{t}</p>
              <p className="mt-1 text-[13px] leading-snug text-slate">{b}</p>
            </li>
          ))}
        </ol>
      </Card>

      {!hasKey ? (
        <Callout tone="warn" title="You need an API key first">
          Step 2 uses one. <Link href={`/projects/${project.id}/api-keys`} className="underline underline-offset-4">Create an API key</Link>, then come back.
        </Callout>
      ) : null}

      <ol className="space-y-10">
        <Step n={1} title="Install the SDK in your app">
          <p className={p}>Add the package and Expo’s SQLite module. Node 22+ apps can use the built-in <Mono>node:sqlite</Mono> instead.</p>
          <CodeBlock title="terminal" code={s.install} />
        </Step>

        <Step n={2} title="Add a token endpoint to your server">
          <p className={p}>
            Devices can’t hold your API key, so your server makes the call. Authenticate the user the way you already do, then ask the engine for a token for that user’s device. Put the key in an environment variable called <Mono>HECATE_API_KEY</Mono>.
            {tenantRule ? " Your rules use a tenant column, so pass the user’s tenant here: a device only receives rows that match it." : ""}
          </p>
          <CodeBlock title="your server (Node)" code={s.server} />
          <p className="text-[13px] text-slate">The SDK asks for a new token on its own when one expires, so you don’t handle refreshes.</p>
        </Step>

        <Step n={3} title="Start syncing in your app">
          <p className={p}>
            Create your tables as usual, list the ones to sync, and call <Mono>start()</Mono>. The project id and engine address below are already yours. Create the same tables in the app that your rules name{project.rules ? ` (${Object.keys(project.rules.tables).join(", ")})` : ""}.
          </p>
          <CodeBlock title="your app (Expo)" code={s.app} />
        </Step>

        <Step n={4} title="Use your database as normal">
          <p className={p}>There is nothing special to write. Triggers installed by <Mono>start()</Mono> queue every insert, update and delete, whether or not the phone is online.</p>
          <CodeBlock title="your app" code={s.use} />
        </Step>
      </ol>

      <Card className="p-6 sm:p-7">
        <h2 className="font-serif text-2xl tracking-tight">If something doesn’t work</h2>
        <dl className="mt-4 divide-y divide-ink/8 text-sm">
          {[
            ["The token request fails with 401", "The API key is wrong, revoked, or belongs to another project. Create a new key and check you copied all of it."],
            ["Syncing fails with 403 “project suspended”", "The project is suspended. Resume it under Settings; devices keep their queued changes and send them once it is active."],
            ["A device gets no rows", "Rows only reach devices whose token matches the row’s tenant or user column in your Rules. Check the tenant_id you put in the token."],
            ["Writes are refused", "The table isn’t in your Rules. Add it, or switch Rules to sync every table."],
            ["429 too many requests", "You hit a limit set under Settings → Limits. Raise it or slow the device’s sync rate."],
            ["The engine is slow the first time", "Free hosting sleeps when idle and takes about 15 seconds to wake. The SDK retries on its own."],
          ].map(([q, a]) => (
            <div key={q} className="py-3">
              <dt className="font-medium">{q}</dt>
              <dd className="mt-0.5 text-slate">{a}</dd>
            </div>
          ))}
        </dl>
      </Card>
    </div>
  );
}
