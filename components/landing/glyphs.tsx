"use client";

import type { SVGProps } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type IconProps = SVGProps<SVGSVGElement> & {
  animated?: boolean;
};

export function Mark({
  className,
  animated = false,
  interactive = true,
}: {
  className?: string;
  animated?: boolean;
  interactive?: boolean;
}) {
  const reduce = useReducedMotion();
  const shouldAnimate = animated && !reduce;

  return (
    <motion.svg
      viewBox="0 0 32 32"
      className={className}
      aria-hidden
      whileHover={interactive && !reduce ? "hover" : undefined}
      initial="initial"
      animate={shouldAnimate ? "animate" : "initial"}
    >
      <circle cx="16" cy="16" r="15" fill="#a14c32" />
      {/* Outer subtle orbiting dashed stroke */}
      <circle
        cx="16"
        cy="16"
        r="14"
        fill="none"
        stroke="#f4f3f0"
        strokeWidth="0.8"
        strokeDasharray="3 4"
        className={shouldAnimate ? "stroke-flow-sync" : undefined}
        opacity={0.4}
      />
      {/* Central trunk */}
      <motion.path
        d="M16 7.5v17"
        fill="none"
        stroke="#f4f3f0"
        strokeWidth="1.7"
        strokeLinecap="round"
        variants={{
          initial: { pathLength: 1 },
          hover: { pathLength: [0, 1], transition: { duration: 0.45, ease: "easeOut" } },
          animate: {
            pathLength: [0.2, 1, 0.2],
            transition: { duration: 3.6, repeat: Infinity, ease: "easeInOut" },
          },
        }}
      />
      {/* Left branch */}
      <motion.path
        d="M16 16.2 7.8 23.2"
        fill="none"
        stroke="#f4f3f0"
        strokeWidth="1.7"
        strokeLinecap="round"
        variants={{
          initial: { pathLength: 1 },
          hover: { pathLength: [0, 1], transition: { duration: 0.35, delay: 0.12, ease: "easeOut" } },
          animate: {
            pathLength: [0.2, 1, 0.2],
            transition: { duration: 3.6, repeat: Infinity, ease: "easeInOut", delay: 0.3 },
          },
        }}
      />
      {/* Right branch */}
      <motion.path
        d="M16 16.2l8.2 7"
        fill="none"
        stroke="#f4f3f0"
        strokeWidth="1.7"
        strokeLinecap="round"
        variants={{
          initial: { pathLength: 1 },
          hover: { pathLength: [0, 1], transition: { duration: 0.35, delay: 0.22, ease: "easeOut" } },
          animate: {
            pathLength: [0.2, 1, 0.2],
            transition: { duration: 3.6, repeat: Infinity, ease: "easeInOut", delay: 0.6 },
          },
        }}
      />
    </motion.svg>
  );
}

export function DatabaseGlyph({ animated = true, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.4" {...props}>
      <ellipse cx="24" cy="12" rx="14" ry="6" />
      <path d="M10 12v16c0 3.3 6.3 6 14 6s14-2.7 14-6V12" />
      <path d="M10 20c0 3.3 6.3 6 14 6s14-2.7 14-6" />
      {animated && (
        <path
          d="M10 20c0 3.3 6.3 6 14 6s14-2.7 14-6"
          stroke="#a14c32"
          strokeWidth="1.6"
          className="stroke-packet-travel"
          opacity="0.8"
        />
      )}
    </svg>
  );
}

export function SyncGlyph({ animated = true, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.4" {...props}>
      <path d="M14 18h18l-5-5M34 30H16l5 5" strokeLinecap="round" strokeLinejoin="round" />
      <circle
        cx="24"
        cy="24"
        r="16"
        strokeDasharray="3 4"
        className={animated ? "stroke-flow-sync" : undefined}
      />
      {animated && (
        <path
          d="M14 18h18l-5-5M34 30H16l5 5"
          stroke="#a14c32"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="stroke-packet-travel"
          opacity="0.75"
        />
      )}
    </svg>
  );
}

export function BoltGlyph({ animated = true, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.4" {...props}>
      <path d="M26 8 14 26h10l-2 14 14-20H26l0-12Z" strokeLinejoin="round" />
      {animated && (
        <path
          d="M26 8 14 26h10l-2 14 14-20H26l0-12Z"
          stroke="#a14c32"
          strokeWidth="1.6"
          strokeLinejoin="round"
          className="stroke-packet-travel"
          opacity="0.85"
        />
      )}
    </svg>
  );
}

export function KeyGlyph({ animated = true, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.4" {...props}>
      <circle cx="18" cy="20" r="7" />
      <path d="M23.5 24.5 38 39M32 33l5 1M34 37l4 1" strokeLinecap="round" />
      {animated && (
        <>
          <circle
            cx="18"
            cy="20"
            r="7"
            stroke="#a14c32"
            strokeWidth="1.3"
            strokeDasharray="3 5"
            className="stroke-flow-sync"
            opacity="0.7"
          />
          <path
            d="M23.5 24.5 38 39"
            stroke="#a14c32"
            strokeWidth="1.5"
            strokeLinecap="round"
            className="dash-flow-fast"
            opacity="0.75"
          />
        </>
      )}
    </svg>
  );
}

export function BranchGlyph({ animated = true, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.4" {...props}>
      <circle cx="14" cy="14" r="4" />
      <circle cx="34" cy="18" r="4" />
      <circle cx="22" cy="34" r="4" />
      <path d="M14 18v6c0 6 8 6 8 10M34 22c0 6-8 4-10 8" />
      {animated && (
        <path
          d="M14 18v6c0 6 8 6 8 10M34 22c0 6-8 4-10 8"
          stroke="#a14c32"
          strokeWidth="1.5"
          className="dash-flow-fast"
          opacity="0.8"
        />
      )}
    </svg>
  );
}

export function WaveGlyph({ animated = true, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.4" {...props}>
      <path d="M6 30c4-8 8-8 12 0s8 8 12 0 8-8 12 0" strokeLinecap="round" />
      <path d="M8 18h6M34 14h8M12 38h10" strokeLinecap="round" />
      {animated && (
        <path
          d="M6 30c4-8 8-8 12 0s8 8 12 0 8-8 12 0"
          stroke="#a14c32"
          strokeWidth="1.6"
          strokeLinecap="round"
          className="dash-flow-fast"
          opacity="0.8"
        />
      )}
    </svg>
  );
}

export function CubeGlyph({ animated = true, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.4" {...props}>
      <path d="M24 8 40 16 24 24 8 16 24 8Z" />
      <path d="M8 16v14l16 8V24M40 16v14L24 38" />
      {animated && (
        <path
          d="M24 8 40 16 24 24 8 16 24 8Z"
          stroke="#a14c32"
          strokeWidth="1.5"
          className="stroke-packet-travel"
          opacity="0.7"
        />
      )}
    </svg>
  );
}

export function FlagGlyph({ animated = true, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.4" {...props}>
      <path d="M16 40V8" strokeLinecap="round" />
      <path d="M16 10h18l-4 6 4 6H16" />
      {animated && (
        <path
          d="M16 10h18l-4 6 4 6H16"
          stroke="#a14c32"
          strokeWidth="1.5"
          className="dash-flow-fast"
          opacity="0.75"
        />
      )}
    </svg>
  );
}
