"use client";

import { useState } from "react";
import { MinusIcon, PlusIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Quantity control built for real trade ordering:
 *  - Row 1: − / typed value / + (any weight, e.g. 7 kg or 13 kg)
 *  - Row 2: bulk chips (+10, +100, +5, +25 …) matching the product's
 *    ordering steps.
 * Wraps gracefully instead of overflowing narrow rows.
 */
export function QuantityStepper({
  value,
  onChange,
  steps,
  max = 999,
  min = 1,
  label,
  size = "md",
  className,
}: {
  value: number;
  onChange: (next: number) => void;
  steps: readonly number[];
  max?: number;
  min?: number;
  label: string;
  size?: "md" | "sm";
  className?: string;
}) {
  const ordered = [...steps].sort((a, b) => a - b);
  const bulk = ordered.filter((step) => step > 1);
  const [text, setText] = useState(String(value));

  const clamp = (next: number) => Math.max(min, Math.min(max, next));
  const bump = (next: number) => {
    const clamped = clamp(next);
    setText(String(clamped));
    onChange(clamped);
  };
  // Live price: every valid keystroke updates the totals immediately.
  const commitInput = (raw: string) => {
    const digits = raw.replace(/\D/g, "");
    if (digits === "") return; // keep the previous value until something is typed
    const parsed = Number(digits);
    if (!Number.isFinite(parsed)) return;
    const clamped = clamp(parsed);
    setText(String(clamped));
    onChange(clamped);
  };

  const btnBase =
    size === "sm"
      ? "min-h-8 min-w-8 text-xs"
      : "min-h-9 min-w-9 text-sm";
  const btn =
    "grid place-items-center rounded-full border border-border bg-card font-bold text-foreground transition-colors hover:bg-secondary active:scale-95 disabled:opacity-40 disabled:pointer-events-none";
  const chipBase =
    size === "sm"
      ? "min-h-7 px-2 text-[0.66rem]"
      : "min-h-8 px-2.5 text-xs";
  const chip =
    "rounded-full border border-border bg-card font-bold text-foreground transition-colors hover:bg-secondary hover:border-primary/40 active:scale-95";

  return (
    <div className={cn("max-w-full", className)}>
      <div className="inline-flex items-center gap-1 rounded-full border border-border bg-background/80 p-1">
        <button
          type="button"
          className={cn(btn, btnBase)}
          onClick={() => bump(value - 1)}
          disabled={value - 1 < min}
          aria-label={`Decrease by one`}
        >
          <MinusIcon className="size-3.5" aria-hidden />
        </button>
        <input
          type="text"
          inputMode="numeric"
          value={text}
          onChange={(event) => {
            setText(event.target.value);
            commitInput(event.target.value);
          }}
          aria-label={`${label} — type a value`}
          className={cn(
            "w-14 border-0 bg-transparent p-0 text-center font-extrabold tabular-nums focus:outline-none",
            size === "sm" ? "text-sm" : "text-base",
          )}
        />
        <button
          type="button"
          className={cn(btn, btnBase)}
          onClick={() => bump(value + 1)}
          disabled={value + 1 > max}
          aria-label={`Increase by one`}
        >
          <PlusIcon className="size-3.5" aria-hidden />
        </button>
      </div>
      {bulk.length > 0 && (
        <div className="mt-1.5 flex flex-wrap items-center gap-1.5" role="group" aria-label={`${label} — bulk steps`}>
          {bulk.map((step) => (
            <button
              key={`bulk-${step}`}
              type="button"
              className={cn(chip, chipBase)}
              onClick={() => bump(value + step)}
              disabled={value + step > max}
              aria-label={`Add ${step}`}
            >
              +{step}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
