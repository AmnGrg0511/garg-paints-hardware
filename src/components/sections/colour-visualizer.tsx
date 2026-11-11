"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowRightIcon } from "lucide-react";
import { useInView } from "@/lib/use-in-view";
import { WALL_SHADES, useWallShade } from "@/store/wall-shade";
import { VisualizerGlow } from "@/components/sections/hero-backdrop";
import {
  ChamkiFinishPicker,
  SparkleFlake,
  chamkiColourFor,
} from "@/components/sections/chamki-shared";
import { OrderKitButton } from "@/components/sections/order-kit-button";
import { cn } from "@/lib/utils";

const CYCLE_MS = 3000;

/** Glitter spots across the room wall (480x300 viewBox space). */
const HERO_SPARKLE_SPOTS: Array<[number, number, number, number]> = [
  [46, 56, 4, 0],
  [132, 68, 4.6, 0.9],
  [224, 74, 3.6, 0.2],
  [312, 66, 4.4, 1.1],
  [104, 132, 3.8, 0.5],
  [210, 140, 4.4, 0.1],
  [316, 148, 3.8, 1.4],
  [128, 224, 4.2, 1.0],
  [246, 232, 3.8, 1.6],
  [352, 236, 4.2, 1.1],
  [168, 268, 3.8, 0.4],
  [262, 122, 4, 0.8],
];

/** Tiny glitter dots: deterministic positions so SSR and client agree. */
function seededDots(
  count: number,
  x0: number,
  x1: number,
  y0: number,
  y1: number,
  seed: number,
): Array<[number, number, number, number]> {
  let s = seed >>> 0;
  const rand = () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0xffffffff;
  };
  return Array.from({ length: count }, () => [
    +(x0 + rand() * (x1 - x0)).toFixed(1),
    +(y0 + rand() * (y1 - y0)).toFixed(1),
    +(0.5 + rand() * 0.8).toFixed(2),
    +(rand() * 1.9).toFixed(2),
  ]);
}

const HERO_GLITTER_DOTS = seededDots(44, 8, 472, 10, 288, 0x9e3779b9);

/**
 * Try-the-shade panel: the wall is painted in one of the five real Madrasi
 * dana shades. Shades auto-cycle until the visitor taps one; the hero
 * backdrop follows the same shade via the wall-shade store.
 */
export function ColourVisualizer({ className }: { className?: string }) {
  const [active, setActive] = useState(0);
  // Picking a shade shows it for a moment, then cycling resumes — the
  // colours never stop for good.
  const [hold, setHold] = useState(false);
  const holdTimer = useRef<number | null>(null);
  const setIndex = useWallShade((state) => state.setIndex);
  const lock = useWallShade((state) => state.lock);
  const [paused, setPaused] = useState(false);
  const { ref, inView } = useInView<HTMLDivElement>();

  const [chamkiHold, setChamkiHold] = useState<"gold" | "silver" | null>(null);
  const chamkiColour = chamkiHold ?? chamkiColourFor(active);

  const shade = WALL_SHADES[active] ?? WALL_SHADES[0];

  // Auto-cycle until the visitor picks a shade; pauses on hover/focus.
  useEffect(() => {
    if (hold || paused) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }
    const timer = window.setInterval(() => {
      setActive((value) => (value + 1) % WALL_SHADES.length);
    }, CYCLE_MS);
    return () => window.clearInterval(timer);
  }, [hold, paused]);

  // Publish the shade to the hero backdrop AFTER commit, never mid-render
  // (prevents the zustand set-state-in-render warning).
  useEffect(() => {
    setIndex(active);
  }, [active, setIndex]);

  const pick = (i: number) => {
    setActive(i);
    lock(i);
    setHold(true);
    if (holdTimer.current) window.clearTimeout(holdTimer.current);
    // The colours resume after a look at the picked shade.
    holdTimer.current = window.setTimeout(() => setHold(false), 9000);
  };

  return (
    <div
      ref={ref}
      data-visible={inView}
      className={cn("reveal relative", className)}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <VisualizerGlow className="-left-24 -top-16 h-[130%] w-[135%]" />
      <div className="surface-card relative overflow-hidden rounded-3xl">
        <svg viewBox="0 0 480 360" className="block h-auto w-full" role="img" aria-label="Room preview — the wall is painted in the selected shade">
          {/* Floor */}
          <rect x="0" y="300" width="480" height="60" fill="#C8B79A" />
          <rect x="0" y="300" width="480" height="8" fill="#B7A482" />
          {/* Wall */}
          <rect
            x="0"
            y="0"
            width="480"
            height="300"
            fill={shade.hex}
            style={{ transition: "fill 420ms ease" }}
          />
          {/* Granule texture on the wall: two irregular passes + impurities */}
          <rect x="0" y="0" width="480" height="300" fill="url(#gph-granules)" opacity="0.55" />
          <rect x="0" y="0" width="480" height="300" fill="url(#gph-granules2)" opacity="0.5" />
          <g opacity="0.35">
            <circle cx="64" cy="52" r="7" fill="#FFFFFF" opacity="0.22" />
            <circle cx="186" cy="38" r="5" fill="#000000" opacity="0.14" />
            <circle cx="286" cy="70" r="9" fill="#FFFFFF" opacity="0.16" />
            <circle cx="392" cy="34" r="6" fill="#000000" opacity="0.12" />
            <circle cx="120" cy="240" r="8" fill="#000000" opacity="0.1" />
            <circle cx="330" cy="236" r="6" fill="#FFFFFF" opacity="0.2" />
            <circle cx="452" cy="150" r="7" fill="#000000" opacity="0.1" />
            <circle cx="30" cy="150" r="6" fill="#FFFFFF" opacity="0.18" />
          </g>
          {/* Shimmer wash + a field of tiny twinkling glitter dots */}
          <g aria-hidden="true">
              <rect
                x="0"
                y="0"
                width="480"
                height="300"
                fill={chamkiColour === "gold" ? "#F2C14E" : "#C9D6E4"}
                opacity="0.07"
                style={{ transition: "fill 420ms ease" }}
              />
              {HERO_GLITTER_DOTS.map(([cx, cy, r, delay], i) => (
                <circle
                  key={`dot-${i}`}
                  className="gph-sparkle"
                  cx={cx}
                  cy={cy}
                  r={r}
                  fill={chamkiColour === "gold" ? "#FFE9A8" : "#F0F6FC"}
                  style={{ animationDelay: `${delay}s` }}
                />
              ))}
              {HERO_SPARKLE_SPOTS.map(([cx, cy, size, delay]) => (
                <SparkleFlake
                  key={`flake-${cx}-${cy}`}
                  cx={cx}
                  cy={cy}
                  size={size}
                  colourId={chamkiColour === "gold" ? "vis-gold" : "vis-silver"}
                  delay={delay}
                />
              ))}
          </g>
          {/* Skirting */}
          <rect x="0" y="286" width="480" height="14" fill="#FFFFFF" opacity="0.55" />
          {/* Window with light */}
          <rect x="316" y="46" width="112" height="140" rx="6" fill="#FFFFFF" opacity="0.85" />
          <rect x="316" y="46" width="112" height="140" rx="6" fill="url(#gph-sky)" opacity="0.9" />
          <rect x="368" y="46" width="6" height="140" fill={shade.hex} style={{ transition: "fill 420ms ease" }} />
          <rect x="316" y="112" width="112" height="6" fill={shade.hex} style={{ transition: "fill 420ms ease" }} />
          <rect x="316" y="46" width="112" height="140" rx="6" fill="none" stroke="#0F172A" strokeOpacity="0.18" strokeWidth="3" />
          {/* Frame on wall */}
          <rect x="86" y="78" width="92" height="70" rx="4" fill="#FFFFFF" opacity="0.92" />
          <rect x="94" y="86" width="76" height="54" rx="3" fill={shade.hex} style={{ transition: "fill 420ms ease" }} opacity="0.35" />
          {/* Sideboard */}
          <rect x="60" y="212" width="200" height="74" rx="8" fill="#8A6B4F" />
          <rect x="60" y="212" width="200" height="10" rx="5" fill="#79593F" />
          <rect x="78" y="240" width="34" height="30" rx="4" fill="#6E5138" />
          <rect x="208" y="240" width="34" height="30" rx="4" fill="#6E5138" />
          {/* Plant */}
          <ellipse cx="404" cy="284" rx="26" ry="16" fill="#B08968" />
          <path d="M404 282c-4-26 6-44 2-58 10 12 12 34 8 58Z" fill="#3E7C4F" />
          <path d="M404 282c-14-18-16-38-24-46 16 4 26 26 24 46Z" fill="#4E9260" />
          <path d="M404 282c12-16 16-34 24-42-14 2-24 24-24 42Z" fill="#356B44" />
          {/* Soft wall shading */}
          <rect x="0" y="0" width="480" height="300" fill="url(#gph-wall-shade)" opacity="0.5" />
          <defs>
            <linearGradient id="gph-sky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#DCEAFF" />
              <stop offset="1" stopColor="#FDFBF3" />
            </linearGradient>
            <linearGradient id="gph-wall-shade" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor="#000000" stopOpacity="0.10" />
              <stop offset="0.35" stopColor="#000000" stopOpacity="0" />
              <stop offset="0.8" stopColor="#000000" stopOpacity="0.04" />
              <stop offset="1" stopColor="#000000" stopOpacity="0.14" />
            </linearGradient>
            <linearGradient id="vis-gold" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#F6D87C" />
              <stop offset="1" stopColor="#C08F1E" />
            </linearGradient>
            <linearGradient id="vis-silver" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#F2F5F9" />
              <stop offset="1" stopColor="#9AA6B8" />
            </linearGradient>
            <pattern id="gph-granules" width="26" height="26" patternUnits="userSpaceOnUse">
              <circle cx="4" cy="5" r="1.6" fill="#FFFFFF" fillOpacity="0.4" />
              <circle cx="15" cy="3" r="1.2" fill="#000000" fillOpacity="0.18" />
              <circle cx="22" cy="12" r="1.8" fill="#FFFFFF" fillOpacity="0.3" />
              <circle cx="9" cy="18" r="1.4" fill="#000000" fillOpacity="0.16" />
              <circle cx="18" cy="22" r="1.2" fill="#FFFFFF" fillOpacity="0.34" />
            </pattern>
            <pattern id="gph-granules2" width="37" height="37" patternUnits="userSpaceOnUse" patternTransform="rotate(24) scale(1.35)">
              <circle cx="6" cy="8" r="1.9" fill="#000000" fillOpacity="0.13" />
              <circle cx="20" cy="4" r="1.5" fill="#FFFFFF" fillOpacity="0.32" />
              <circle cx="31" cy="16" r="2" fill="#000000" fillOpacity="0.12" />
              <circle cx="13" cy="26" r="1.6" fill="#FFFFFF" fillOpacity="0.3" />
              <circle cx="28" cy="30" r="1.3" fill="#000000" fillOpacity="0.14" />
            </pattern>
          </defs>
        </svg>
        <p className="absolute left-4 top-3 rounded-full bg-black/45 px-2.5 py-1 text-[0.62rem] font-bold uppercase tracking-[0.14em] text-white backdrop-blur-sm">
          {shade.name} · Madrasi dana shade
        </p>

        <div className="relative border-t border-border/70 bg-card p-4 sm:p-5">
        <fieldset>
          <legend className="text-[0.7rem] font-bold uppercase tracking-[0.14em] text-muted-foreground">
            Tap a shade to repaint the wall
          </legend>
          <div className="mt-3 flex flex-wrap gap-2.5">
            {WALL_SHADES.map((option, i) => (
              <button
                key={option.key}
                type="button"
                role="radio"
                aria-checked={i === active}
                onClick={() => pick(i)}
                className={cn(
                  "dana-texture inline-flex min-h-11 items-center gap-2 rounded-full border py-1 pl-1 pr-3 text-xs font-semibold transition-all",
                  i === active
                    ? "border-primary ring-2 ring-ring/40"
                    : "border-border hover:border-primary/50",
                )}
              >
                <span
                  className="size-7 overflow-hidden rounded-full border border-black/10"
                  style={{ background: option.hex }}
                  aria-hidden
                />
                {option.name}
                <span className="sr-only">— repaint the wall with this shade</span>
              </button>
            ))}
          </div>
        </fieldset>
        <ChamkiFinishPicker
          colour={chamkiColour}
          onPick={(colour) => {
            setChamkiHold(colour);
            setHold(true);
            if (holdTimer.current) window.clearTimeout(holdTimer.current);
            holdTimer.current = window.setTimeout(() => {
              setHold(false);
              setChamkiHold(null);
            }, 9000);
          }}
        />
        <OrderKitButton className="mt-4" chamkiColour={chamkiColour} />
        <Link
          href="/products/madrasi-dana-wall-texture"
          className="mt-3 inline-flex min-h-11 items-center gap-1.5 text-sm font-bold text-primary hover:underline"
        >
          Shop Madrasi dana textures
          <ArrowRightIcon className="size-4" aria-hidden />
        </Link>
        </div>
      </div>
    </div>
  );
}
