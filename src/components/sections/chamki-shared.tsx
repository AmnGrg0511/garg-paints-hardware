"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

export type ChamkiMode = "gold" | "silver" | "off";

/**
 * Chamki is a three-way finish picker: golden, silver or off. The chosen
 * finish stays until changed — no auto-cycling.
 */
export function useChamki({
  enabled,
}: {
  enabled: boolean;
}): {
  visible: boolean;
  colour: "gold" | "silver" | null;
  mode: ChamkiMode;
  setMode: (mode: ChamkiMode) => void;
} {
  const [mode, setMode] = useState<ChamkiMode>("gold");
  const colour: "gold" | "silver" | null = mode === "off" ? null : mode;
  return { visible: enabled && mode !== "off", colour, mode, setMode };
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
 * Golden, Silver, Off.
 */
export function ChamkiFinishPicker({
  mode,
  onChange,
  className,
}: {
  mode: ChamkiMode;
  onChange: (mode: ChamkiMode) => void;
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
            onClick={() => onChange(option.key)}
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
