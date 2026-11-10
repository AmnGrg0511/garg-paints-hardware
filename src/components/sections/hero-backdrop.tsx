"use client";

import { WALL_SHADES, useWallShade } from "@/store/wall-shade";
import { cn } from "@/lib/utils";

/**
 * Hero shade effects without LCP penalties: a full-bleed solid colour wash
 * (background-color is never an LCP candidate, and it interpolates smoothly)
 * plus an SVG glow that flows out of the visualizer toward the headline.
 * SVG shapes are not LCP candidates either, so the hero text stays the LCP.
 */
export function HeroShadeFx({ className }: { className?: string }) {
  const index = useWallShade((state) => state.index);
  const shade = WALL_SHADES[index] ?? WALL_SHADES[0];

  return (
    <div
      aria-hidden
      className={cn("pointer-events-none absolute inset-0", className)}
      style={{
        backgroundColor: `color-mix(in oklab, ${shade.hex} 12%, transparent)`,
        transition: "background-color 700ms ease",
      }}
    />
  );
}

/** Soft SVG glow behind the visualizer card — flows toward the headline. */
export function VisualizerGlow({ className }: { className?: string }) {
  const index = useWallShade((state) => state.index);

  return (
    <svg
      aria-hidden
      className={cn("pointer-events-none absolute", className)}
      viewBox="0 0 900 720"
      style={{ overflow: "visible" }}
    >
      {WALL_SHADES.map((shade, i) => (
        <ellipse
          key={shade.key}
          cx="620"
          cy="330"
          rx="560"
          ry="400"
          fill={shade.hex}
          opacity={i === index ? 0.16 : 0}
          style={{ transition: "opacity 700ms ease" }}
        />
      ))}
    </svg>
  );
}
