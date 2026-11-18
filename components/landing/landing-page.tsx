"use client";

import { AnimatePresence, motion, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion";
import { useEffect, useState } from "react";
import { FloatingField } from "./floating-field";
import { Mark } from "./glyphs";
import { IsoScene } from "./iso-scene";

const nav = [
  { href: "#product", label: "Product" },
  { href: "#capabilities", label: "Capabilities" },
  { href: "#architecture", label: "Architecture" },
  { href: "#guarantees", label: "Guarantees" },
  { href: "#roadmap", label: "Roadmap" },
];

const stackRow = ["SQLite", "PostgreSQL", "Go", "TypeScript", "Expo", "WebSockets", "pgx", "Docker"];

const localFeatures = [
  "Offline reads and writes",
  "Local change tracking with SQLite triggers",
  "Durable pending-change storage",
  "Client-to-server and server-to-client sync",
  "Selective, authorization-aware subscriptions",
  "Device identity, retry, and diagnostics",
];

const databaseFeatures = [
  "Initial snapshots and continuous capture",
  "Transaction-aware pgoutput decoding",
  "One-way replication with commit order preserved",
  "Idempotent destination application",
  "Checkpointing, retry, and slot monitoring",
  "Table and row filtering",
];

const primitives = [
  ["Event identity", "Stable ids, source identity, and source-specific cursors such as LSNs and SQLite sequences."],
  ["Durable processing", "Events survive restarts. Pending work is stored, not held in memory."],
  ["Delivery", "At-least-once transport with explicit acknowledgements."],
  ["Checkpoints", "A successful apply and its checkpoint commit together when the destination allows it."],
  ["Idempotency", "Replays do not duplicate effects on the destination."],
  ["Recovery", "Interrupted batches resume from the last durable point."],
  ["Observability", "Structured logs, metrics, and sync status for operators and devices."],
  ["Configuration", "YAML for developers, validated before the runtime starts."],
];

const guarantees = [
  { n: "01", title: "At-least-once", body: "Hecate does not promise exactly-once delivery across independent databases. Application is idempotent, so a replay is safe." },
  { n: "02", title: "Atomic checkpoints", body: "Destination writes and the checkpoint that records them commit in one transaction wherever the database can do that." },
  { n: "03", title: "Source cursors", body: "PostgreSQL LSNs and SQLite change sequences stay distinct. Ordering mechanisms are not flattened into one fake clock." },
  { n: "04", title: "Explicit conflicts", body: "Offline clients will write concurrently. Last-write-wins is a policy you choose, not a silent default." },
  { n: "05", title: "Authorized fan-out", body: "Subscriptions enforce user, tenant, and record-level access before a row is offered to a device." },
  { n: "06", title: "Backpressure", body: "When a destination falls behind, consumption slows. Queue depth and PostgreSQL WAL retention stay visible." },
];

const phases = [
  ["0", "Foundations", "Protocol, identity, acknowledgements, conflicts, and authorization — written down before the engine."],
  ["1", "Primitives", "A Go runtime that can identify, validate, deliver, checkpoint, and retry events."],
  ["2", "SQLite", "Triggers, change logs, transaction boundaries, and pending work that survives restart."],
  ["3", "Upstream", "Device auth, batched HTTP upload, transactional apply on PostgreSQL, duplicate suppression."],
  ["4", "Downstream", "Subscriptions, row filters, WebSocket hints, and HTTP catch-up for reconnecting devices."],
  ["5", "Conflicts", "Versioning, concurrent-update detection, and policies: server, client, last-write, or application."],
  ["6", "SDK", "A TypeScript SDK and Expo integration so apps do not build their own sync engine."],
  ["7", "Database sync", "One-way PostgreSQL logical replication. The next capability, not a gate on the first prototype."],
  ["8", "Developer experience", "CLI, YAML, health, Docker, and a path from install to a running sync."],
  ["9", "Hardening", "Partitions, crashes, large batches, schema changes, and slot growth — tested and documented."],
];

const demo = [
  ["Device A, offline", "A customer record is created in SQLite. The change log keeps it."],
  ["Restart", "The app closes and opens again. Pending work is still there."],
  ["Reconnect", "Device A reaches the Hecate server and resumes from its checkpoint."],
  ["Central apply", "The record lands in PostgreSQL inside a transaction."],
  ["Device B", "An authorized subscription receives the new row."],
  ["Edit on B", "Device B updates the customer. The change is captured upstream."],
  ["Back to A", "Device A receives the modification on the next catch-up."],
  ["Conflict", "Concurrent edits are detected and resolved by the configured policy."],
  ["Partition", "The network drops mid-batch. Nothing is acknowledged early."],
  ["Resume", "Sync continues without lost changes or duplicate effects."],
];

const faqs = [
  {
    q: "What does the first release actually sync?",
    a: "Local Sync. A React Native or Expo app stores data in SQLite, tracks changes locally, and synchronizes with a central PostgreSQL database over HTTP, with WebSockets for “changes are waiting” notifications.",
  },
  {
    q: "Is delivery exactly once?",
    a: "No. Independent databases cannot share one atomic commit. Hecate uses at-least-once delivery and idempotent application, and it checkpoints a write only after that write has succeeded.",
  },
  {
    q: "What happens when two devices edit the same row?",
    a: "The runtime detects the conflict instead of overwriting it quietly. Initial policies are server wins, client wins, last-write-wins (with the clock limits documented), and an application-defined callback.",
  },
  {
    q: "When does PostgreSQL-to-PostgreSQL replication arrive?",
    a: "After the Local Sync prototype. It uses logical replication and pgoutput, keeps commit order, and starts as one-way replication. Bidirectional sync is later.",
  },
  {
    q: "How do clients receive only their own data?",
    a: "Subscriptions are selective. Distribution checks user, tenant, and record-level rules before a change is queued for a device.",
  },
  {
    q: "What do we not need on day one?",
    a: "IndexedDB, extra database adapters, Protocol Buffers, Kubernetes, and a hosted cloud. JSON, Docker, and a Linux VPS are enough for the MVP.",
  },
];

const categories = [
  {
    title: "Core runtime",
    rows: [
      ["Go", "Synchronization runtime"],
      ["pgx", "PostgreSQL connectivity"],
      ["pglogrepl", "Logical replication protocol"],
      ["pgoutput", "Change decoding"],
    ],
  },
  {
    title: "Local sync",
    rows: [
      ["SQLite", "Offline inserts, updates, deletes"],
      ["TypeScript", "Client SDK"],
      ["expo-sqlite", "React Native integration"],
      ["HTTP + WebSockets", "Batches and notifications"],
    ],
  },
  {
    title: "Operate",
    rows: [
      ["Cobra", "Hecate CLI"],
      ["YAML", "Developer configuration"],
      ["Docker Compose", "Local environment"],
      ["OpenTelemetry", "Instrumentation"],
    ],
  },
];

const syncStates = [
  { label: "Offline", detail: "3 local changes pending" },
  { label: "Reconnected", detail: "Resuming from checkpoint" },
  { label: "Applying", detail: "PostgreSQL transaction open" },
  { label: "Caught up", detail: "Device B notified" },
];

const fade = {
  hidden: { opacity: 0, y: 22 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const } },
};

export function LandingPage() {
  const reduce = useReducedMotion();
  const [open, setOpen] = useState(false);
  const [faq, setFaq] = useState<number | null>(0);
  const [syncIndex, setSyncIndex] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const { scrollYProgress } = useScroll();
  const bar = useSpring(scrollYProgress, { stiffness: 80, damping: 24, mass: 0.3 });
  const heroShift = useTransform(scrollYProgress, [0, 0.18], [0, reduce ? 0 : 70]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (reduce) return;
    const id = window.setInterval(() => setSyncIndex((value) => (value + 1) % syncStates.length), 2400);
    return () => window.clearInterval(id);
  }, [reduce]);

  return (
    <div className="blueprint relative min-h-screen">
      <motion.div className="fixed inset-x-0 top-0 z-[60] h-[2px] origin-left bg-rust" style={{ scaleX: bar }} />
      <FloatingField />

      <header
        className={`sticky top-0 z-50 border-b transition-colors ${
          scrolled ? "border-ink/10 bg-paper/85 backdrop-blur-md" : "border-transparent bg-paper/40 backdrop-blur-sm"
        }`}
      >
        <div className="mx-auto flex h-[72px] max-w-6xl items-center justify-between px-5">
          <a href="#top" className="flex items-center gap-2.5">
            <Mark className="h-7 w-7" animated interactive />
            <span className="font-serif text-2xl tracking-tight">Hecate</span>
          </a>
          <nav className="hidden items-center gap-7 text-sm text-slate lg:flex">
            {nav.map((item) => (
              <a key={item.href} href={item.href} className="transition-colors hover:text-ink">
                {item.label}
              </a>
            ))}
          </nav>
          <div className="hidden items-center gap-2 lg:flex">
            <a href="#capabilities" className="rounded-full border border-ink/15 px-4 py-2 text-sm transition hover:border-ink">
              Get started
            </a>
            <a href="#mvp" className="rounded-full bg-rust px-4 py-2 text-sm text-paper transition hover:bg-bark">
              Contact
            </a>
          </div>
          <button
            type="button"
            className="rounded-full border border-ink/15 px-3 py-2 text-sm lg:hidden"
            aria-expanded={open}
            onClick={() => setOpen((value) => !value)}
          >
            {open ? "Close" : "Menu"}
          </button>
        </div>
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden border-t border-ink/10 bg-paper lg:hidden"
            >
              <div className="flex flex-col gap-3 px-5 py-4 text-sm">
                {nav.map((item) => (
                  <a key={item.href} href={item.href} onClick={() => setOpen(false)}>
                    {item.label}
                  </a>
                ))}
                <a href="#mvp" onClick={() => setOpen(false)} className="text-rust">
                  See the MVP
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <main id="top">
        <section className="relative mx-auto grid max-w-6xl items-center gap-10 px-5 pb-8 pt-12 lg:grid-cols-[minmax(0,0.86fr)_minmax(0,1.14fr)] lg:pt-16">
          <motion.div style={{ y: heroShift }} className="relative z-10 max-w-xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-ink/10 bg-paper/80 px-3 py-1 text-[11px] tracking-[0.16em] text-bark uppercase">
              <span className="h-1.5 w-1.5 rounded-full bg-rust" />
              Synchronization infrastructure
            </div>
            <h1 className="font-serif text-[clamp(3.3rem,6.4vw,5.7rem)] leading-[0.9] tracking-[-0.03em] text-ink">
              Track. Deliver.
              <br />
              Resolve. Recover.
            </h1>
            <p className="mt-6 max-w-md text-[15.5px] leading-7 text-slate">
              Hecate keeps local application databases and independent backends consistent. Change tracking, delivery,
              retries, checkpoints, and conflict handling live in the platform — not in every app you ship.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#capabilities" className="rounded-full bg-rust px-5 py-3 text-sm text-paper transition hover:bg-bark">
                Start building
              </a>
              <a href="#architecture" className="rounded-full border border-ink bg-paper/70 px-5 py-3 text-sm transition hover:bg-ink hover:text-paper">
                Explore the stack
              </a>
            </div>
            <p className="mt-6 font-mono text-[11px] tracking-wide text-slate uppercase">
              SQLite · PostgreSQL · Expo · Go
            </p>
          </motion.div>

          <div className="relative z-10">
            <motion.div
              initial={reduce ? false : { opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            >
              <IsoScene />
            </motion.div>
            <div className="pointer-events-none absolute bottom-2 left-2 sm:bottom-6 sm:left-6">
              <AnimatePresence mode="wait">
                <motion.div
                  key={syncStates[syncIndex].label}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.35 }}
                  className="pointer-events-auto rounded-2xl border border-ink/10 bg-paper/90 px-4 py-3 shadow-[0_12px_40px_rgba(28,27,28,0.06)] backdrop-blur"
                >
                  <div className="flex items-center gap-2 text-[11px] tracking-[0.14em] text-rust uppercase">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rust opacity-60" />
                      <span className="relative h-1.5 w-1.5 rounded-full bg-rust" />
                    </span>
                    Sync status
                  </div>
                  <p className="mt-1 font-serif text-xl">{syncStates[syncIndex].label}</p>
                  <p className="text-xs text-slate">{syncStates[syncIndex].detail}</p>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </section>

        <section className="border-y border-ink/10 bg-paper/50">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-8 gap-y-4 px-5 py-6">
            {stackRow.map((name) => (
              <span key={name} className="font-serif text-xl text-ink/55 sm:text-2xl">
                {name}
              </span>
            ))}
          </div>
        </section>

        <section id="product" className="mx-auto max-w-6xl px-5 py-24">
          <SectionIntro
            kicker="Product"
            title="Reusable sync, instead of a bespoke engine in every codebase."
            body="Developers already know how to read and write a database. The hard part is keeping that data honest across an offline client and a backend that does not share a transaction."
          />
          <div className="mt-12 grid gap-4 md:grid-cols-4">
            {[
              ["Local first", "Reads and writes succeed with no network. The change log is the queue."],
              ["Two modes", "Local Sync is the product. Database Sync reuses the same runtime later."],
              ["One envelope", "Events carry identity, source, and ordering. Adapters differ. The runtime does not."],
              ["Operable", "Status, retries, slot retention, and diagnostics are part of the design, not an afterthought."],
            ].map(([title, body], index) => (
              <motion.article
                key={title}
                variants={fade}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: "-40px" }}
                transition={{ delay: index * 0.05 }}
                className="rounded-3xl border border-ink/10 bg-paper/80 p-5"
              >
                <p className="font-mono text-[11px] text-rust">0{index + 1}</p>
                <h3 className="mt-3 font-serif text-2xl">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate">{body}</p>
              </motion.article>
            ))}
          </div>
        </section>

        <section id="capabilities" className="mx-auto max-w-6xl px-5 pb-24">
          <SectionIntro
            kicker="Capabilities"
            title="One platform. A primary path, and a second that shares its bones."
          />
          <div className="mt-12 grid gap-5 lg:grid-cols-5">
            <motion.article
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              variants={fade}
              className="rounded-[28px] border border-ink bg-ink p-7 text-paper lg:col-span-3"
            >
              <div className="flex items-center justify-between gap-3">
                <p className="text-[11px] tracking-[0.16em] text-[#e7b5a2] uppercase">Capability A · Primary</p>
                <span className="rounded-full bg-rust px-3 py-1 text-[11px] tracking-wide uppercase">MVP</span>
              </div>
              <h3 className="mt-4 font-serif text-4xl leading-none">Hecate Local Sync</h3>
              <p className="mt-4 max-w-lg text-sm leading-6 text-[#bcbcc3]">
                SQLite on the device, PostgreSQL at the center, a TypeScript SDK in between. HTTP carries batches.
                WebSockets say when the server has something new.
              </p>
              <LocalSyncStreamSVG />
              <ul className="mt-6 grid gap-2 sm:grid-cols-2">
                {localFeatures.map((feature) => (
                  <li key={feature} className="flex gap-2 text-sm text-[#edeeef]">
                    <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-rust" />
                    {feature}
                  </li>
                ))}
              </ul>
              <p className="mt-6 font-mono text-[11px] tracking-wide text-[#bcbcc3] uppercase">
                React Native / Expo · JSON protocol · Device auth
              </p>
            </motion.article>

            <motion.article
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              variants={fade}
              className="rounded-[28px] border border-ink/10 bg-paper/80 p-7 lg:col-span-2"
            >
              <p className="text-[11px] tracking-[0.16em] text-bark uppercase">Capability B · Next</p>
              <h3 className="mt-4 font-serif text-4xl leading-none">Database Sync</h3>
              <p className="mt-4 text-sm leading-6 text-slate">
                Independent PostgreSQL databases, captured with logical replication and applied one way. Bidirectional
                sync waits until the one-way path is boring.
              </p>
              <ul className="mt-6 space-y-2">
                {databaseFeatures.map((feature) => (
                  <li key={feature} className="flex gap-2 text-sm">
                    <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-rust" />
                    {feature}
                  </li>
                ))}
              </ul>
            </motion.article>
          </div>
        </section>

        <section id="architecture" className="border-y border-ink/10 bg-[#efeeeb]">
          <div className="mx-auto max-w-6xl px-5 py-24">
            <SectionIntro
              kicker="Architecture"
              title="Same runtime. Different adapters and consistency rules."
              body="Event shape, delivery, checkpoints, idempotency, retry, observability, and configuration are shared. Sources and destinations are not."
            />
            <div className="mt-12 grid gap-5 lg:grid-cols-2">
              <FlowCard
                label="Local Sync"
                steps={["Application", "TypeScript SDK", "SQLite + change log", "Hecate server", "PostgreSQL"]}
                note="The reverse path sends authorized backend changes back to connected devices."
              />
              <FlowCard
                label="Database Sync"
                steps={["Source PostgreSQL", "Logical replication", "CDC adapter", "Replication engine", "Destination PostgreSQL"]}
                note="pgoutput supplies the stream. The engine preserves transaction boundaries."
              />
            </div>

            <div id="runtime" className="mt-16">
              <h3 className="font-serif text-3xl">Shared runtime</h3>
              <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {primitives.map(([title, body], index) => (
                  <motion.div
                    key={title}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true }}
                    variants={fade}
                    transition={{ delay: (index % 4) * 0.04 }}
                    whileHover={reduce ? undefined : { y: -4 }}
                    className="rounded-2xl border border-ink/10 bg-paper p-4"
                  >
                    <p className="font-mono text-[11px] text-slate">0{index + 1}</p>
                    <h4 className="mt-2 font-medium">{title}</h4>
                    <p className="mt-2 text-sm leading-6 text-slate">{body}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="guarantees" className="mx-auto max-w-6xl px-5 py-24">
          <SectionIntro
            kicker="Guarantees"
            title="Reliability you can state out loud."
            body="These are the constraints the engine is built around. They are also the ones a demo has to survive."
          />
          <div className="mt-12 grid gap-px overflow-hidden rounded-[28px] border border-ink/10 bg-ink/10 sm:grid-cols-2 lg:grid-cols-3">
            {guarantees.map((item) => (
              <article key={item.n} className="bg-paper p-6">
                <p className="font-serif text-3xl text-rust">{item.n}</p>
                <h3 className="mt-3 text-lg">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate">{item.body}</p>
              </article>
            ))}
          </div>
          <p className="mt-6 max-w-3xl text-sm leading-6 text-slate">
            Schema evolution is part of the same contract: clients and servers must define what happens to incompatible
            versions, in-flight events, and migrations before a pending change is applied.
          </p>
        </section>

        <section id="stack" className="mx-auto max-w-6xl px-5 pb-24">
          <SectionIntro kicker="Technology" title="A small stack, chosen so the hard parts stay boring." />
          <div className="mt-12 grid gap-5 lg:grid-cols-3">
            {categories.map((category) => (
              <div key={category.title} className="rounded-[28px] border border-ink/10 bg-paper/75 p-6">
                <h3 className="font-serif text-3xl">{category.title}</h3>
                <dl className="mt-5 divide-y divide-ink/10">
                  {category.rows.map(([name, role]) => (
                    <div key={name} className="flex items-baseline justify-between gap-4 py-3">
                      <dt className="font-medium">{name}</dt>
                      <dd className="text-right text-sm text-slate">{role}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            ))}
          </div>
          <p className="mt-6 text-sm text-slate">
            Later, not now: IndexedDB, more adapters, Protocol Buffers, Kubernetes, and a hosted Hecate Cloud.
          </p>
        </section>

        <section id="roadmap" className="border-t border-ink/10">
          <div className="mx-auto max-w-6xl px-5 py-24">
            <SectionIntro
              kicker="Roadmap"
              title="Local Sync ships first. Database Sync follows the same primitives."
            />
            <ol className="mt-12 grid gap-3 md:grid-cols-2">
              {phases.map(([n, title, body]) => (
                <li key={n} className="flex gap-4 rounded-2xl border border-ink/10 bg-paper/70 p-4">
                  <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-mono text-sm ${n === "7" ? "bg-paper text-bark ring-1 ring-rust" : "bg-ink text-paper"}`}>
                    {n}
                  </span>
                  <div>
                    <h3 className="font-medium">{title}</h3>
                    <p className="mt-1 text-sm leading-6 text-slate">{body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section id="mvp" className="blueprint-dark text-paper">
          <div className="mx-auto max-w-6xl px-5 py-24">
            <p className="text-[11px] tracking-[0.18em] text-[#e7b5a2] uppercase">MVP demonstration</p>
            <h2 className="mt-3 max-w-3xl font-serif text-4xl leading-[1.05] sm:text-5xl">
              Ten steps. Offline, restart, conflict, partition — then a clean resume.
            </h2>
            <ol className="mt-12 grid gap-4 sm:grid-cols-2">
              {demo.map(([title, body], index) => (
                <motion.li
                  key={title}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true, margin: "-20px" }}
                  variants={fade}
                  className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-5"
                >
                  <div className="absolute inset-x-0 top-0 h-[2px] overflow-hidden" aria-hidden>
                    <svg className="h-full w-full" preserveAspectRatio="none">
                      <line
                        x1="0"
                        y1="1"
                        x2="100%"
                        y2="1"
                        stroke="#e7b5a2"
                        strokeWidth="2"
                        strokeDasharray="6 24"
                        className="dash-flow-fast"
                        opacity="0.45"
                      />
                    </svg>
                  </div>
                  <p className="font-mono text-xs text-[#e7b5a2]">{String(index + 1).padStart(2, "0")}</p>
                  <h3 className="mt-2 font-serif text-2xl">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-[#bcbcc3]">{body}</p>
                </motion.li>
              ))}
            </ol>
          </div>
        </section>

        <section id="faq" className="mx-auto max-w-3xl px-5 py-24">
          <SectionIntro kicker="Questions" title="The decisions that usually get buried in a README." />
          <div className="mt-10 divide-y divide-ink/10 border-y border-ink/10">
            {faqs.map((item, index) => {
              const expanded = faq === index;
              return (
                <div key={item.q}>
                  <button
                    type="button"
                    className="flex w-full items-start justify-between gap-6 py-5 text-left"
                    aria-expanded={expanded}
                    onClick={() => setFaq(expanded ? null : index)}
                  >
                    <span className="font-serif text-2xl leading-tight">{item.q}</span>
                    <span className="mt-1 font-mono text-sm text-rust">{expanded ? "–" : "+"}</span>
                  </button>
                  <AnimatePresence initial={false}>
                    {expanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <p className="pb-5 text-sm leading-7 text-slate">{item.a}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-5 pb-24">
          <div className="relative overflow-hidden rounded-[32px] border border-ink bg-paper px-6 py-14 sm:px-12">
            <div className="pointer-events-none absolute -right-6 -bottom-10 opacity-20">
              <Mark className="h-48 w-48" animated interactive={false} />
            </div>
            <p className="text-[11px] tracking-[0.18em] text-bark uppercase">Self-hosted MVP</p>
            <h2 className="mt-3 max-w-2xl font-serif text-4xl leading-[1.05] sm:text-6xl">
              Put sync in the infrastructure. Leave the product code to the product.
            </h2>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#capabilities" className="rounded-full bg-rust px-5 py-3 text-sm text-paper hover:bg-bark">
                Read Local Sync
              </a>
              <a href="#architecture" className="rounded-full border border-ink px-5 py-3 text-sm hover:bg-ink hover:text-paper">
                Inspect the runtime
              </a>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-ink/10">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-5 py-10 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Mark className="h-6 w-6" animated interactive />
              <span className="font-serif text-2xl">Hecate</span>
            </div>
            <p className="mt-3 max-w-sm text-sm text-slate">
              Synchronization infrastructure for SQLite clients and PostgreSQL. At-least-once, idempotent, and explicit
              about conflicts.
            </p>
          </div>
          <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate">
            {nav.map((item) => (
              <a key={item.href} href={item.href} className="hover:text-ink">
                {item.label}
              </a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}

function SectionIntro({ kicker, title, body }: { kicker: string; title: string; body?: string }) {
  return (
    <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: "-80px" }} variants={fade} className="max-w-3xl">
      <p className="text-[11px] tracking-[0.18em] text-bark uppercase">{kicker}</p>
      <h2 className="mt-3 font-serif text-4xl leading-[1.05] tracking-tight sm:text-5xl">{title}</h2>
      {body ? <p className="mt-4 text-[15px] leading-7 text-slate">{body}</p> : null}
    </motion.div>
  );
}

function FlowCard({ label, steps, note }: { label: string; steps: string[]; note: string }) {
  const reduce = useReducedMotion();

  return (
    <article className="rounded-[28px] border border-ink/10 bg-paper p-6">
      <div className="flex items-center justify-between">
        <h3 className="font-serif text-3xl">{label}</h3>
        <span className="flex items-center gap-1.5 font-mono text-[11px] text-rust uppercase tracking-wider">
          <span className="h-1.5 w-1.5 rounded-full bg-rust" />
          Pipeline
        </span>
      </div>
      <div className="relative mt-6">
        {/* Animated vertical SVG stroke pipeline track connecting all steps */}
        <div className="pointer-events-none absolute left-[15px] top-4 bottom-4 w-[2px] -translate-x-1/2" aria-hidden>
          <svg className="h-full w-full overflow-visible" preserveAspectRatio="none">
            <line
              x1="1"
              y1="0"
              x2="1"
              y2="100%"
              stroke="#1c1b1c"
              strokeWidth="1.5"
              strokeOpacity="0.12"
              strokeDasharray="3 4"
            />
            <line
              x1="1"
              y1="0"
              x2="1"
              y2="100%"
              stroke="#a14c32"
              strokeWidth="1.8"
              strokeLinecap="round"
              className={reduce ? undefined : "dash-flow-fast"}
            />
            {!reduce && (
              <line
                x1="1"
                y1="0"
                x2="1"
                y2="100%"
                stroke="#a14c32"
                strokeWidth="2.6"
                strokeLinecap="round"
                className="stroke-packet-travel"
                opacity="0.9"
              />
            )}
          </svg>
        </div>

        <ol className="relative space-y-3 pl-0">
          {steps.map((step, index) => (
            <li key={step} className="group relative flex items-center gap-3">
              <span className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-ink/20 bg-paper font-mono text-[11px] transition-colors group-hover:border-rust group-hover:text-rust shadow-xs">
                {index + 1}
              </span>
              <span className="flex-1 rounded-full border border-ink/10 bg-[#f7f6f3] px-4 py-2 text-sm transition-all group-hover:border-ink/30 group-hover:bg-white">
                {step}
              </span>
              {index < steps.length - 1 ? <span className="sr-only">then</span> : null}
            </li>
          ))}
        </ol>
      </div>
      <p className="mt-5 text-sm leading-6 text-slate">{note}</p>
    </article>
  );
}

function LocalSyncStreamSVG() {
  const reduce = useReducedMotion();

  return (
    <div className="my-6 rounded-2xl border border-white/10 bg-white/5 p-4" aria-hidden>
      <div className="mb-2 flex items-center justify-between font-mono text-[11px] tracking-wider text-[#e7b5a2] uppercase">
        <span>Dual-channel transport</span>
        <span className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-rust" />
          Active flow
        </span>
      </div>
      <svg viewBox="0 0 560 92" className="h-auto w-full overflow-visible">
        {/* Channel 1: Upstream HTTP upload */}
        <path
          d="M 96 28 L 226 28 M 334 28 L 454 28"
          fill="none"
          stroke="#e7b5a2"
          strokeWidth="1.2"
          strokeDasharray="3 4"
          opacity="0.35"
        />
        <path
          d="M 96 28 L 226 28 M 334 28 L 454 28"
          fill="none"
          stroke="#a14c32"
          strokeWidth="1.8"
          strokeLinecap="round"
          className={reduce ? undefined : "dash-flow-fast"}
        />
        {!reduce && (
          <path
            d="M 96 28 L 226 28 M 334 28 L 454 28"
            fill="none"
            stroke="#f4f3f0"
            strokeWidth="2.2"
            strokeLinecap="round"
            className="stroke-packet-travel"
          />
        )}

        {/* Channel 2: Downstream WebSocket hint */}
        <path
          d="M 454 62 L 334 62 M 226 62 L 96 62"
          fill="none"
          stroke="#bcbcc3"
          strokeWidth="1.2"
          strokeDasharray="3 4"
          opacity="0.35"
        />
        <path
          d="M 454 62 L 334 62 M 226 62 L 96 62"
          fill="none"
          stroke="#e7b5a2"
          strokeWidth="1.8"
          strokeLinecap="round"
          className={reduce ? undefined : "dash-flow-reverse"}
        />

        {/* Direction arrows */}
        <polygon points="228,28 221,24 221,32" fill="#a14c32" />
        <polygon points="456,28 449,24 449,32" fill="#a14c32" />
        <polygon points="94,62 101,58 101,66" fill="#e7b5a2" />
        <polygon points="224,62 231,58 231,66" fill="#e7b5a2" />

        {/* Channel labels */}
        <text x="161" y="21" textAnchor="middle" fill="#e7b5a2" fontSize="9" fontFamily="var(--font-geist-mono), monospace">
          HTTP batch upload →
        </text>
        <text x="394" y="21" textAnchor="middle" fill="#e7b5a2" fontSize="9" fontFamily="var(--font-geist-mono), monospace">
          pg apply →
        </text>
        <text x="394" y="75" textAnchor="middle" fill="#bcbcc3" fontSize="9" fontFamily="var(--font-geist-mono), monospace">
          ← change notify
        </text>
        <text x="161" y="75" textAnchor="middle" fill="#bcbcc3" fontSize="9" fontFamily="var(--font-geist-mono), monospace">
          ← WebSocket hint
        </text>

        {/* Node 1: SQLite on Device */}
        <g transform="translate(14, 14)">
          <rect width="82" height="62" rx="12" fill="#1c1b1c" stroke="#bcbcc3" strokeWidth="1.2" />
          <circle cx="41" cy="24" r="11" fill="none" stroke="#e7b5a2" strokeWidth="1" strokeDasharray="2 3" className="stroke-flow-sync" />
          <text x="41" y="44" textAnchor="middle" fill="#f4f3f0" fontSize="10.5" fontFamily="var(--font-geist-sans), sans-serif" fontWeight="600">
            SQLite
          </text>
          <text x="41" y="56" textAnchor="middle" fill="#bcbcc3" fontSize="8" fontFamily="var(--font-geist-sans), sans-serif">
            Client app
          </text>
        </g>

        {/* Node 2: Hecate Server */}
        <g transform="translate(226, 14)">
          <rect width="108" height="62" rx="12" fill="#1c1b1c" stroke="#a14c32" strokeWidth="1.5" />
          <path d="M54 18 v12 M48 24 h12" stroke="#a14c32" strokeWidth="1.5" strokeLinecap="round" />
          <text x="54" y="44" textAnchor="middle" fill="#f4f3f0" fontSize="10.5" fontFamily="var(--font-geist-sans), sans-serif" fontWeight="600">
            Hecate Server
          </text>
          <text x="54" y="56" textAnchor="middle" fill="#e7b5a2" fontSize="8" fontFamily="var(--font-geist-sans), sans-serif">
            Order & retry
          </text>
        </g>

        {/* Node 3: PostgreSQL */}
        <g transform="translate(454, 14)">
          <rect width="92" height="62" rx="12" fill="#1c1b1c" stroke="#bcbcc3" strokeWidth="1.2" />
          <circle cx="46" cy="24" r="11" fill="none" stroke="#e7b5a2" strokeWidth="1" strokeDasharray="3 4" className="stroke-flow-sync" />
          <text x="46" y="44" textAnchor="middle" fill="#f4f3f0" fontSize="10.5" fontFamily="var(--font-geist-sans), sans-serif" fontWeight="600">
            PostgreSQL
          </text>
          <text x="46" y="56" textAnchor="middle" fill="#bcbcc3" fontSize="8" fontFamily="var(--font-geist-sans), sans-serif">
            Central store
          </text>
        </g>
      </svg>
    </div>
  );
}
