"use client";

import { cn } from "@/lib/utils";
import { Localized } from "@/i18n/Localized";

export type ChamkiMode = "gold" | "silver" | "off" | null;

/**
 * Chamki glitter cycles exactly like the shade cycle: it alternates
 * golden ↔ silver on every tick, pauses on hover, holds on pick for a
 * moment, then resumes. The colour is derived from the shade index so the
 * two cycles always stay in lockstep.
 */
export function chamkiColourFor(
  activeIndex: number,
  pinned: ChamkiMode = null,
): "gold" | "silver" | null {
  if (pinned === "off") return null;
  return pinned ?? (activeIndex % 2 === 0 ? "gold" : "silver");
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
 * Two finish chips styled exactly like the shade row: colour dot + label.
 * Golden, silver — picking one holds it briefly, then the cycle resumes.
 */
export function ChamkiFinishPicker({
  colour,
  onPick,
  className,
}: {
  colour: "gold" | "silver" | null;
  onPick: (colour: ChamkiMode) => void;
  className?: string;
}) {
  const options = [
    { key: "gold" as const, label: "Golden", dot: "#E9B84B" },
    { key: "silver" as const, label: "Silver", dot: "#C9D6E4" },
  ];

  return (
    <fieldset className={cn("mt-4", className)}>
      <legend className="text-[0.7rem] font-bold uppercase tracking-[0.14em] text-muted-foreground">
        <Localized en="Chamki finish" hi="chamki फ़िनिश" />
      </legend>
      <div className="mt-3 flex flex-wrap gap-2.5">
        {options.map((option) => (
          <button
            key={option.key}
            type="button"
            role="radio"
            aria-checked={colour === option.key}
            onClick={() => onPick(option.key)}
            className={cn(
              "dana-texture inline-flex min-h-11 items-center gap-2 rounded-full border py-1 pl-1 pr-3 text-xs font-semibold transition-all",
              colour === option.key
                ? "border-primary ring-2 ring-ring/40"
                : "border-border hover:border-primary/50",
            )}
          >
            <span
              className="size-7 overflow-hidden rounded-full border border-black/10"
              style={{ background: option.dot }}
              aria-hidden
            />
            {option.label}
            <span className="sr-only">
              chamki finish — tap to hold, the cycle resumes after a moment
            </span>
          </button>
        ))}
      </div>
    </fieldset>
  );
}
