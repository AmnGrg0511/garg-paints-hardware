"use client";

import { MinusIcon, PlusIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Bulk-aware quantity stepper: renders the product's real ordering steps
 * (bags: ±1/±10/±100 · kg: ±1/±5/±25 · drums: ±1/±10 · pieces: ±1) so a
 * 100-bag order is three taps, not one hundred.
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
  const btnBase =
    size === "sm"
      ? "min-h-8 min-w-8 px-1 text-[0.66rem]"
      : "min-h-9 min-w-9 px-1.5 text-[0.7rem]";
  const btn =
    "grid place-items-center rounded-full border border-border bg-card font-bold text-foreground transition-colors hover:bg-secondary active:scale-95 disabled:opacity-40 disabled:pointer-events-none";

  const clamp = (next: number) => Math.max(min, Math.min(max, next));

  return (
    <div
      className={cn(
        "inline-flex max-w-full flex-wrap items-center justify-center gap-1 rounded-2xl border border-border bg-background/80 p-1",
        className,
      )}
      role="group"
      aria-label={label}
    >
      {[...ordered].reverse().map((step) => (
        <button
          key={`dec-${step}`}
          type="button"
          className={cn(btn, btnBase)}
          onClick={() => onChange(clamp(value - step))}
          disabled={value - step < min}
          aria-label={`Decrease by ${step}`}
        >
          <span className="inline-flex items-center gap-0.5">
            <MinusIcon className="size-3" aria-hidden />
            {step}
          </span>
        </button>
      ))}
      <span
        aria-live="polite"
        className={cn(
          "min-w-10 text-center font-extrabold tabular-nums",
          size === "sm" ? "text-sm" : "text-base",
        )}
      >
        {value}
      </span>
      {ordered.map((step) => (
        <button
          key={`inc-${step}`}
          type="button"
          className={cn(btn, btnBase)}
          onClick={() => onChange(clamp(value + step))}
          disabled={value + step > max}
          aria-label={`Increase by ${step}`}
        >
          <span className="inline-flex items-center gap-0.5">
            <PlusIcon className="size-3" aria-hidden />
            {step}
          </span>
        </button>
      ))}
    </div>
  );
}
