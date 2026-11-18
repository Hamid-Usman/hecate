"use client";

import { motion, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion";
import { useEffect, type ComponentType, type SVGProps } from "react";
import { BoltGlyph, BranchGlyph, CubeGlyph, DatabaseGlyph, FlagGlyph, KeyGlyph, SyncGlyph, WaveGlyph } from "./glyphs";

const pieces: Array<{
  Icon: ComponentType<SVGProps<SVGSVGElement>>;
  top: string;
  left: string;
  size: number;
  opacity: number;
  depth: number;
  drift: number;
  rotate: number;
}> = [
  { Icon: DatabaseGlyph, top: "8%", left: "6%", size: 72, opacity: 0.16, depth: 18, drift: 40, rotate: -8 },
  { Icon: SyncGlyph, top: "18%", left: "88%", size: 84, opacity: 0.14, depth: 28, drift: -50, rotate: 12 },
  { Icon: CubeGlyph, top: "42%", left: "4%", size: 64, opacity: 0.12, depth: 14, drift: 30, rotate: 8 },
  { Icon: KeyGlyph, top: "58%", left: "92%", size: 70, opacity: 0.13, depth: 22, drift: -36, rotate: -14 },
  { Icon: BranchGlyph, top: "72%", left: "8%", size: 78, opacity: 0.12, depth: 16, drift: 48, rotate: 6 },
  { Icon: WaveGlyph, top: "34%", left: "78%", size: 60, opacity: 0.11, depth: 26, drift: -24, rotate: -6 },
  { Icon: FlagGlyph, top: "86%", left: "84%", size: 58, opacity: 0.14, depth: 12, drift: 22, rotate: 10 },
  { Icon: BoltGlyph, top: "90%", left: "18%", size: 54, opacity: 0.12, depth: 20, drift: -28, rotate: -12 },
  { Icon: DatabaseGlyph, top: "48%", left: "48%", size: 120, opacity: 0.05, depth: 36, drift: 16, rotate: 18 },
  { Icon: SyncGlyph, top: "12%", left: "42%", size: 46, opacity: 0.1, depth: 10, drift: -18, rotate: 20 },
];

export function FloatingField() {
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const smx = useSpring(mx, { stiffness: 40, damping: 20 });
  const smy = useSpring(my, { stiffness: 40, damping: 20 });

  useEffect(() => {
    if (reduce) return;
    const onMove = (event: MouseEvent) => {
      mx.set((event.clientX / window.innerWidth - 0.5) * 2);
      my.set((event.clientY / window.innerHeight - 0.5) * 2);
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, [mx, my, reduce]);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {pieces.map((piece, index) => (
        <Floater key={index} piece={piece} scroll={scrollYProgress} mx={smx} my={smy} reduce={!!reduce} />
      ))}
    </div>
  );
}

function Floater({
  piece,
  scroll,
  mx,
  my,
  reduce,
}: {
  piece: (typeof pieces)[number];
  scroll: ReturnType<typeof useScroll>["scrollYProgress"];
  mx: ReturnType<typeof useSpring>;
  my: ReturnType<typeof useSpring>;
  reduce: boolean;
}) {
  const y = useTransform(scroll, [0, 1], [0, piece.drift]);
  const x = useTransform(mx, [-1, 1], [-piece.depth, piece.depth]);
  const py = useTransform(my, [-1, 1], [-piece.depth * 0.6, piece.depth * 0.6]);
  const Icon = piece.Icon;

  return (
    <motion.div
      className="absolute text-ink"
      style={{
        top: piece.top,
        left: piece.left,
        opacity: piece.opacity,
        x: reduce ? 0 : x,
        y: reduce ? 0 : y,
        translateY: reduce ? 0 : py,
        rotate: piece.rotate,
      }}
    >
      <motion.div
        animate={reduce ? undefined : { y: [0, -10, 0], rotate: [piece.rotate, piece.rotate + 4, piece.rotate] }}
        transition={{ duration: 7 + (piece.depth % 5), repeat: Infinity, ease: "easeInOut" }}
      >
        <Icon className="block" style={{ width: piece.size, height: piece.size }} />
      </motion.div>
    </motion.div>
  );
}
