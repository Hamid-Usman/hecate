# hecate-touch

The web app for **Hecate**, a data synchronization tool that keeps local application databases and
a central PostgreSQL database consistent: offline writes, delivery, conflict handling and
per-tenant access, as infrastructure instead of application code.

This repository has two parts:

- **The landing page** at `/`, which explains the product.
- **The dashboard**, where developers sign up, create projects, manage keys, rules and limits, watch
  usage, and get the code to connect their app.

## How it fits together

```
 browser ──▶ hecate-touch (Next.js) ──▶ hecates-backend (control plane) ──▶ hecates-engine (sync server)
 developer      this repo                accounts, projects, keys, rules       apps sync with this
```

The dashboard talks only to **`hecates-backend`**, never to the engine and never from the browser.
Developers' apps talk to the engine directly, using the address the dashboard shows them. See
[`hecates-engine`](../hecates-engine) for the sync server and SDK, and
[`hecates-backend`](../hecates-backend) for the API this app calls.

## Dashboard

| Route | What it does |
|---|---|
| `/login`, `/register` | Sign in or create an account (email and password) |
| `/projects` | Projects of the selected account; create a project |
| `/projects/[id]` | Overview: today's numbers, 30-day traffic, setup checklist, recent activity |
| `/projects/[id]/connect` | **Connect your app**: engine address and status, and the code for your server and app, filled in with the project's values |
| `/projects/[id]/api-keys` | Create and revoke server-side API keys (a new key is shown once) |
| `/projects/[id]/signing-keys` | Rotate and revoke the keys that sign device tokens |
| `/projects/[id]/rules` | Which tables sync, and the tenant/user columns that scope each device's rows |
| `/projects/[id]/usage` | Changes and pushes per day, 7 to 90 days |
| `/projects/[id]/activity` | Audit trail of who changed what |
| `/projects/[id]/settings` | Name, conflict policy, limits, suspend or resume, delete |
| `/settings` | Your profile, your accounts and roles, sign out |

Members of an account get read-only views; owners and admins can change things. Destructive actions
(revoking a signing key, deleting a project) ask you to type the name to confirm.

## Running it

You need the backend running first (see its README), and Node 20+.

```bash
npm install
cp .env.example .env.local      # then edit the values below
npm run dev                     # http://localhost:3001
```

| Variable | Purpose |
|---|---|
| `API_URL` | Where `hecates-backend` runs (default `http://localhost:3000`). Used on the server only. |
| `ENGINE_URL` | The public address of the Hecate engine that developers' apps sync with (default `http://localhost:8080`). Shown in the Connect guide and snippets, and health-checked from the dashboard. It must be an engine that reads its projects from the same backend. |

For a quick look with Docker, `docker compose up` in `hecates-backend` starts the backend and its
database (add `--profile engine` to start an engine as well).

### Scripts

```bash
npm run dev        # development server on port 3001
npm run build      # production build (also type-checks)
npm start          # serve the production build
npm run lint
```

## How sign-in works

Signing in calls the backend's `/v1/auth/login` from a Server Action, which stores the returned
token in an **httpOnly cookie**. JavaScript in the browser never sees it. Every call to the backend
is made on the server with that token.

`proxy.ts` (Next.js 16's replacement for middleware) redirects signed-out visitors to `/login`,
signed-in visitors away from it, and swaps the token for a fresh one shortly before it expires. If
the backend rejects the token, the visitor is sent back to sign in. The backend verifies every
request; the proxy only decides where the browser goes.

## Code layout

```
app/(auth)/            sign-in and register pages
app/(dashboard)/       the dashboard: projects/[projectId]/*, settings
components/ui/         buttons, forms, dialogs, toasts, cards (no UI library)
components/projects/   the project pages' building blocks
components/charts/     the usage chart (plain SVG)
components/landing/    the landing page
lib/api/               typed axios calls to the backend, one file per area
lib/data.ts            reads used by pages
lib/actions.ts         writes (Server Actions): return results instead of throwing
lib/session*.ts        session cookie helpers
proxy.ts               redirects and token refresh
```

`lib/types.ts` mirrors the backend's response shapes, so an API change shows up as a type error.

## Working in this codebase

- **This is not the Next.js you may know.** The app uses Next.js 16 with Cache Components, so
  reading the session, `params` or `searchParams` must happen inside a `<Suspense>` boundary, never
  at the top of a layout. Read the guides in `node_modules/next/dist/docs/` before changing routing
  or data fetching; `npm run build` fails on a violation.
- **Errors from the backend** arrive as one `ApiError` with the backend's message. Server Actions
  return `{ ok, ... }` results (use `unwrap()` on the client) because Next hides thrown messages in
  production.
- **Styling** is Tailwind CSS 4 with the design tokens in `app/globals.css`: paper, ink and rust,
  serif headings, mono labels.

## Status

Working against the real backend: sign-up and sign-in, projects, API and signing keys, rules,
policy and limits, usage, the audit log, and the Connect guide. Verified by hand in a browser at
desktop and phone widths; there are **no automated frontend tests yet**.

Not built yet: a device list and recent-errors view, password reset and email verification,
inviting teammates, and billing. The landing page's "Get started" buttons do not yet link to
`/register`. Hecate is an early preview: the Expo adapter of the SDK has not been tried on a
physical device.
