"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Layers3 } from "lucide-react";

export type PageCurtainPhase = "idle" | "cover" | "reveal";

type Tile = {
  id: number;
  color: string;
  enterDelay: number;
  leaveDelay: number;
};

const COLUMNS = 12;
const ROWS = 10;
const COLORS = [
  "#09152e", "#0e2045", "#112b5b", "#10244f", "#163577",
  "#0e2756", "#1647a4", "#0a1d42", "#10d5b6", "#18b9ca",
];

// Deterministic values avoid server/client hydration mismatches.
const TILES: Tile[] = Array.from({ length: COLUMNS * ROWS }, (_, id) => {
  const row = Math.floor(id / COLUMNS);
  const column = id % COLUMNS;
  const colorIndex = (id * 17 + row * 13 + column * 5) % COLORS.length;
  const jitter = ((id * 7 + row * 11) % 5) * 0.012;

  return {
    id,
    color: COLORS[colorIndex],
    enterDelay: column * 0.018 + (ROWS - row - 1) * 0.018 + jitter,
    leaveDelay: (COLUMNS - column - 1) * 0.018 + row * 0.018 + jitter,
  };
});

export default function PageCurtain({ phase }: { phase: PageCurtainPhase }) {
  return (
    <AnimatePresence>
      {phase !== "idle" && (
        <motion.div
          key="bayflow-page-curtain"
          className="bf-page-curtain"
          role="presentation"
          aria-hidden="true"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.12 } }}
        >
          <div className="bf-page-curtain-tiles">
            {TILES.map((tile) => (
              <motion.div
                key={tile.id}
                className="bf-page-curtain-tile"
                style={{ backgroundColor: tile.color }}
                initial={{ scaleY: 0 }}
                animate={{ scaleY: phase === "cover" ? 1 : 0 }}
                transition={{
                  duration: phase === "cover" ? 0.48 : 0.43,
                  delay: phase === "cover" ? tile.enterDelay : tile.leaveDelay,
                  ease: [0.22, 1, 0.36, 1],
                }}
              />
            ))}
          </div>

          <div className="bf-page-curtain-brand-wrap">
          <motion.div
            className="bf-page-curtain-brand"
            initial={{ opacity: 0, scale: 0.85, y: 18 }}
            animate={{
              opacity: phase === "cover" ? 1 : 0,
              scale: phase === "cover" ? 1 : 1.08,
              y: phase === "cover" ? 0 : -12,
            }}
            transition={{
              duration: phase === "cover" ? 0.42 : 0.18,
              delay: phase === "cover" ? 0.4 : 0,
              ease: "easeOut",
            }}
          >
            <span className="bf-page-curtain-icon">
              <Layers3 size={32} strokeWidth={1.8} />
            </span>
            <span className="bf-page-curtain-wordmark">
              bay<span>flow</span>
            </span>
            <small>THE AUTO SERVICE PLATFORM</small>
          </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
