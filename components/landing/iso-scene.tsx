"use client";

import { motion, useReducedMotion } from "framer-motion";

type Block = {
  id: string;
  cx: number;
  cy: number;
  w: number;
  h: number;
  d: number;
  top: string;
  left: string;
  right: string;
  icon: "sqlite" | "log" | "core" | "pg" | "sub" | "conflict" | "check" | "socket" | "sdk";
  float: number;
};

type Callout = {
  id: string;
  n: string;
  title: string;
  detail: string;
  x: number;
  y: number;
  anchor: [number, number];
  align: "start" | "end";
};

type Conduit = {
  id: string;
  d: string;
  direction?: "forward" | "reverse";
  highlight?: boolean;
};

const blocks: Block[] = [
  { id: "check", cx: 292, cy: 148, w: 58, h: 30, d: 20, top: "#f7f6f3", left: "#d9d7d2", right: "#eceae5", icon: "check", float: 5.2 },
  { id: "conflict", cx: 468, cy: 124, w: 52, h: 27, d: 18, top: "#f3e4dc", left: "#c9a090", right: "#e7cfc4", icon: "conflict", float: 4.4 },
  { id: "sub", cx: 648, cy: 168, w: 58, h: 30, d: 20, top: "#f7f6f3", left: "#d9d7d2", right: "#eceae5", icon: "sub", float: 6 },
  { id: "log", cx: 168, cy: 262, w: 64, h: 33, d: 22, top: "#f7f6f3", left: "#d4d2cd", right: "#eceae5", icon: "log", float: 4.8 },
  { id: "core", cx: 418, cy: 286, w: 82, h: 42, d: 30, top: "#1c1b1c", left: "#3a3838", right: "#2a2929", icon: "core", float: 5.6 },
  { id: "socket", cx: 692, cy: 304, w: 54, h: 28, d: 18, top: "#f7f6f3", left: "#d9d7d2", right: "#eceae5", icon: "socket", float: 4.2 },
  { id: "sqlite", cx: 246, cy: 408, w: 72, h: 37, d: 26, top: "#f7f6f3", left: "#cfcbc4", right: "#e8e6e1", icon: "sqlite", float: 5 },
  { id: "pg", cx: 572, cy: 418, w: 74, h: 38, d: 26, top: "#a14c32", left: "#7a3824", right: "#c46a4c", icon: "pg", float: 5.8 },
  { id: "sdk", cx: 392, cy: 528, w: 62, h: 32, d: 22, top: "#f7f6f3", left: "#d9d7d2", right: "#eceae5", icon: "sdk", float: 4.6 },
];

const callouts: Callout[] = [
  { id: "c1", n: "01", title: "Change log", detail: "SQLite triggers", x: 28, y: 214, anchor: [168, 229], align: "start" },
  { id: "c2", n: "02", title: "Hecate runtime", detail: "Delivery & checkpoints", x: 418, y: 36, anchor: [418, 244], align: "start" },
  { id: "c3", n: "03", title: "PostgreSQL", detail: "Central store", x: 760, y: 392, anchor: [646, 418], align: "end" },
  { id: "c4", n: "04", title: "Subscriptions", detail: "Row-level auth", x: 760, y: 132, anchor: [706, 168], align: "end" },
  { id: "c5", n: "05", title: "Conflicts", detail: "Explicit policy", x: 520, y: 78, anchor: [468, 97], align: "start" },
];

// Ground conduits connecting the architecture stack
const conduits: Conduit[] = [
  { id: "sdk-sqlite", d: "M 392 596 C 330 575, 285 535, 246 485", direction: "reverse", highlight: true },
  { id: "sqlite-log", d: "M 246 485 C 205 435, 175 380, 168 331", direction: "forward", highlight: true },
  { id: "log-core", d: "M 168 331 C 240 325, 335 345, 418 372", direction: "forward", highlight: true },
  { id: "core-pg", d: "M 418 372 C 468 410, 520 455, 572 496", direction: "forward", highlight: true },
  { id: "core-conflict", d: "M 418 372 C 428 290, 448 230, 468 183", direction: "forward" },
  { id: "conflict-check", d: "M 468 183 C 400 175, 345 190, 292 212", direction: "forward" },
  { id: "core-socket", d: "M 418 372 C 505 355, 610 360, 692 364", direction: "forward", highlight: true },
  { id: "socket-sub", d: "M 692 364 C 685 315, 668 270, 648 232", direction: "forward" },
];

function pts(pairs: Array<[number, number]>) {
  return pairs.map(([x, y]) => `${x},${y}`).join(" ");
}

function Icon({ type, light }: { type: Block["icon"]; light?: boolean }) {
  const stroke = light ? "#f4f3f0" : "#1c1b1c";
  const accent = light ? "#e7b5a2" : "#a14c32";
  if (type === "core") {
    return (
      <g fill="none" stroke={accent} strokeWidth="1.6" strokeLinecap="round">
        <path d="M0-10v20M0 0-9 8M0 0 9 8" className="dash-flow-fast" />
        <circle cx="0" cy="0" r="13" stroke={stroke} strokeOpacity="0.35" />
        <circle cx="0" cy="0" r="13" stroke={accent} strokeWidth="1" strokeDasharray="3 4" className="stroke-flow-sync" />
      </g>
    );
  }
  if (type === "sqlite" || type === "pg") {
    return (
      <g fill="none" stroke={stroke} strokeWidth="1.4">
        <ellipse cx="0" cy="-6" rx="10" ry="4" />
        <ellipse cx="0" cy="-6" rx="10" ry="4" stroke={accent} strokeWidth="1.4" strokeDasharray="3 4" className="stroke-flow-sync" opacity="0.8" />
        <path d="M-10-6v10c0 2.2 4.5 4 10 4s10-1.8 10-4v-10" />
        <path d="M-10 0c0 2.2 4.5 4 10 4s10-1.8 10-4" />
      </g>
    );
  }
  if (type === "log") {
    return (
      <g fill="none" stroke={stroke} strokeWidth="1.4" strokeLinecap="round">
        <path d="M-8-8h16v16H-8z" />
        <path d="M-4-2h8M-4 3h8" stroke={accent} className="stroke-pulse-glow" />
      </g>
    );
  }
  if (type === "conflict") {
    return (
      <g fill="none" stroke="#502a11" strokeWidth="1.4" strokeLinecap="round">
        <path d="M-8 6 0-8 8 6" className="dash-flow-fast" />
        <path d="M-4 6h8" stroke="#a14c32" strokeWidth="1.6" />
      </g>
    );
  }
  if (type === "check") {
    return (
      <g fill="none" stroke={stroke} strokeWidth="1.4" strokeLinecap="round">
        <path d="M-2-10v18" />
        <path d="M-2-7h12l-3 4 3 4H-2" stroke={accent} className="dash-flow-fast" />
      </g>
    );
  }
  if (type === "socket") {
    return (
      <g fill="none" stroke={stroke} strokeWidth="1.4" strokeLinecap="round">
        <path d="M-10 2c3-6 6-6 9 0s6 6 9 0" className="dash-flow-fast" />
        <path d="M-6-6h4M6-8h6" className="stroke-pulse-glow" />
      </g>
    );
  }
  if (type === "sub") {
    return (
      <g fill="none" stroke={stroke} strokeWidth="1.4">
        <circle cx="-6" cy="-4" r="3" />
        <circle cx="7" cy="-2" r="3" />
        <circle cx="0" cy="7" r="3" />
        <path d="M-6-1v3c0 3 4 3 6 5M7 1c0 3-5 2-6 5" className="dash-flow-fast" stroke={accent} />
      </g>
    );
  }
  return (
    <g fill="none" stroke={stroke} strokeWidth="1.4" strokeLinecap="round">
      <path d="M-8-6h16v12H-8z" />
      <path d="M-4-1h6M-4 3h8" className="stroke-pulse-glow" stroke={accent} />
    </g>
  );
}

export function IsoScene() {
  const reduce = useReducedMotion();
  const ordered = [...blocks].sort((a, b) => a.cy - b.cy);

  return (
    <svg viewBox="0 0 860 620" className="h-auto w-full overflow-visible" role="img" aria-label="Isometric map of the Hecate synchronization stack">
      <defs>
        <filter id="soft" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="10" stdDeviation="6" floodColor="#1c1b1c" floodOpacity="0.08" />
        </filter>
      </defs>

      {/* Ground plane conduits and circuit lines */}
      <g className="conduits" aria-hidden="true">
        {conduits.map((conduit) => {
          const isReverse = conduit.direction === "reverse";
          return (
            <g key={conduit.id}>
              {/* Underlying blueprint track */}
              <path
                d={conduit.d}
                fill="none"
                stroke="#1c1b1c"
                strokeWidth="1.2"
                strokeOpacity="0.14"
                strokeDasharray="3 4"
              />
              {/* Animated active stroke flow */}
              <path
                d={conduit.d}
                fill="none"
                stroke={conduit.highlight ? "#a14c32" : "#515159"}
                strokeWidth="1.5"
                strokeLinecap="round"
                className={isReverse ? "dash-flow-reverse" : "dash-flow-fast"}
                opacity={conduit.highlight ? "0.85" : "0.55"}
              />
              {/* High-speed packet pulses along primary conduits */}
              {conduit.highlight && !reduce && (
                <path
                  d={conduit.d}
                  fill="none"
                  stroke="#a14c32"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  className="stroke-packet-travel"
                  opacity="0.95"
                />
              )}
            </g>
          );
        })}

        {/* Animated radar heartbeat rings at primary nodes on the floor */}
        {!reduce && (
          <>
            <circle cx={418} cy={372} r="10" fill="none" stroke="#a14c32" className="stroke-radar-ring" />
            <circle cx={246} cy={485} r="8" fill="none" stroke="#a14c32" className="stroke-radar-ring" style={{ animationDelay: "1.2s" }} />
            <circle cx={572} cy={496} r="8" fill="none" stroke="#a14c32" className="stroke-radar-ring" style={{ animationDelay: "0.6s" }} />
          </>
        )}
      </g>

      {/* Floating isometric blocks */}
      {ordered.map((block) => {
        const { cx, cy, w, h, d } = block;
        const groundY = cy + h + d + 14;
        const top = pts([
          [cx, cy - h],
          [cx + w, cy],
          [cx, cy + h],
          [cx - w, cy],
        ]);
        const left = pts([
          [cx - w, cy],
          [cx, cy + h],
          [cx, cy + h + d],
          [cx - w, cy + d],
        ]);
        const right = pts([
          [cx + w, cy],
          [cx, cy + h],
          [cx, cy + h + d],
          [cx + w, cy + d],
        ]);
        return (
          <g key={block.id}>
            {/* Ground shadow */}
            <ellipse cx={cx} cy={groundY} rx={w * 0.85} ry="8" fill="rgba(28,27,28,0.06)" />
            {/* Vertical laser beacon connecting ground to floating block */}
            <line
              x1={cx}
              y1={groundY}
              x2={cx}
              y2={cy + h + d}
              stroke="#1c1b1c"
              strokeOpacity="0.12"
              strokeDasharray="2 3"
            />
            {/* Floating block group */}
            <motion.g
              filter="url(#soft)"
              animate={reduce ? undefined : { y: [0, -7, 0] }}
              transition={{ duration: block.float, repeat: Infinity, ease: "easeInOut" }}
            >
              <polygon points={left} fill={block.left} stroke="#1c1b1c" strokeWidth="1.15" strokeLinejoin="round" />
              <polygon points={right} fill={block.right} stroke="#1c1b1c" strokeWidth="1.15" strokeLinejoin="round" />
              <polygon points={top} fill={block.top} stroke="#1c1b1c" strokeWidth="1.15" strokeLinejoin="round" />
              <g transform={`translate(${cx} ${cy - 2})`}>
                <Icon type={block.icon} light={block.icon === "core" || block.icon === "pg"} />
              </g>
            </motion.g>
          </g>
        );
      })}

      {/* Callouts with animated stroke lines */}
      {callouts.map((call) => {
        const labelX = call.align === "end" ? call.x - 148 : call.x;
        const jointX = call.align === "end" ? call.x - 8 : call.x + 132;
        const pathD = `M${call.anchor[0]} ${call.anchor[1]} C ${call.anchor[0]} ${call.y + 18}, ${jointX} ${call.y + 22}, ${jointX} ${call.y + 14}`;
        return (
          <g key={call.id}>
            {/* Background dashed guide */}
            <path
              d={pathD}
              fill="none"
              stroke="#515159"
              strokeWidth="1"
              strokeDasharray="4 6"
              className="dash-flow"
              opacity="0.5"
            />
            {/* Active animated stroke flow along callout pointer */}
            <path
              d={pathD}
              fill="none"
              stroke="#a14c32"
              strokeWidth="1.4"
              strokeLinecap="round"
              className="dash-flow-fast"
              opacity="0.85"
            />
            {/* Anchor pulse ring */}
            <circle cx={call.anchor[0]} cy={call.anchor[1]} r="2.4" fill="#a14c32" />
            {!reduce && (
              <circle
                cx={call.anchor[0]}
                cy={call.anchor[1]}
                r="5"
                fill="none"
                stroke="#a14c32"
                strokeWidth="0.8"
                className="stroke-pulse-glow"
              />
            )}
            {/* Callout badge */}
            <g transform={`translate(${labelX} ${call.y})`}>
              <rect width="148" height="46" rx="23" fill="#f4f3f0" stroke="#1c1b1c" strokeWidth="1" />
              <circle cx="20" cy="23" r="10" fill="#1c1b1c" />
              <text x="20" y="26.5" textAnchor="middle" fill="#f4f3f0" fontSize="8" fontFamily="var(--font-geist-sans), sans-serif">
                {call.n}
              </text>
              <text x="36" y="20" fill="#1c1b1c" fontSize="11" fontFamily="var(--font-geist-sans), sans-serif" fontWeight="600">
                {call.title}
              </text>
              <text x="36" y="34" fill="#515159" fontSize="9.5" fontFamily="var(--font-geist-sans), sans-serif">
                {call.detail}
              </text>
            </g>
          </g>
        );
      })}
    </svg>
  );
}
