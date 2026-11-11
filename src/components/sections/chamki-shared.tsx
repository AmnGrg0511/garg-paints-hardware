"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export type ChamkiMode = "gold" | "silver" | "off";

const CHAMKI_CYCLE_MS = 3000;

/**
 * Chamki glitter state with its own rhythm so it never stalls:
 *  - `pinned === null` → the colour alternates (gold ↔ silver) on its own
 *    timer, independent of the wall shades.
 *  - `pinned === "gold" | "silver"` → the finish sticks to that colour.
 *  - `pinned === "off"` → no glitter.
 */
export function useChamki({
  pinned,
  enabled,
}: {
  pinned: ChamkiMode | null;
  enabled: boolean;
}): { visible: boolean; colour: "gold" | "silver" | null } {
  const [tick, setTick] = useState(0);

  const off = pinned === "off";
  useEffect(() => {
    if (!enabled || off) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }
    const timer = window.setInterval(() => {
      setTick((value) => value + 1);
    }, CHAMKI_CYCLE_MS);
    return () => window.clearInterval(timer);
  }, [enabled, off]);

  const colour: "gold" | "silver" | null =
    pinned === "off"
      ? null
      : (pinned ?? (tick % 2 === 0 ? "gold" : "silver"));
  return { visible: colour !== null, colour };
}

/** Four-point glitter flake, drawn around (0,0) then translated. */
export function SparkleFlake({
  cx,
  cy,
  size,
  colourId,
  delay,
}: {
  cx: number;
  cy: number;
  size: number;
  colourId: string;
  delay: number;
}) {
  const s = size;
  return (
    <path
      className="gph-sparkle"
      transform={`translate(${cx} ${cy})`}
      style={{ animationDelay: `${delay}s` }}
      fill={`url(#${colourId})`}
      d={`M0 ${-s} L${s * 0.28} ${-s * 0.28} L${s} 0 L${s * 0.28} ${s * 0.28} L0 ${s} L${-s * 0.28} ${s * 0.28} L${-s} 0 L${-s * 0.28} ${-s * 0.28} Z`}
    />
  );
}

/**
 * Three finish chips styled exactly like the shade row: colour dot + label.
 * Golden, Silver, Off. Tapping the active chip again returns to the cycling
 * shimmer.
 */
export function ChamkiFinishPicker({
  mode,
  onChange,
  className,
}: {
  mode: ChamkiMode | null;
  onChange: (mode: ChamkiMode | null) => void;
  className?: string;
}) {
  const options = [
    { key: "gold" as const, label: "Golden", dot: "#E9B84B" },
    { key: "silver" as const, label: "Silver", dot: "#C9D6E4" },
    { key: "off" as const, label: "Off", dot: null },
  ];

  return (
    <fieldset className={cn("mt-4", className)}>
      <legend className="text-[0.7rem] font-bold uppercase tracking-[0.14em] text-muted-foreground">
        Chamki finish
      </legend>
      <div className="mt-3 flex flex-wrap gap-2.5">
        {options.map((option) => (
          <button
            key={option.key}
            type="button"
            role="radio"
            aria-checked={mode === option.key}
            onClick={() => onChange(mode === option.key ? null : option.key)}
            className={cn(
              "dana-texture inline-flex min-h-11 items-center gap-2 rounded-full border py-1 pl-1 pr-3 text-xs font-semibold transition-all",
              mode === option.key
                ? "border-primary ring-2 ring-ring/40"
                : "border-border hover:border-primary/50",
            )}
          >
            <span
              className="size-7 overflow-hidden rounded-full border border-black/10"
              style={{ background: option.dot ?? "#EDE9E0" }}
              aria-hidden
            >
              {option.dot === null && (
                <span className="grid h-full w-full place-items-center text-[0.6rem] font-bold text-muted-foreground">
                  ✕
                </span>
              )}
            </span>
            {option.label}
            <span className="sr-only">chamki finish</span>
          </button>
        ))}
      </div>
    </fieldset>
  );
}
