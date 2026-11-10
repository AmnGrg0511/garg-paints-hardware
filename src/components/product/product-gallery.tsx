"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import type { Product } from "@/config/businessData";
import { useSelectedVariantLabel } from "@/store/variant-selection";
import { cn } from "@/lib/utils";

const toneTint = {
  terracotta: "#A84328",
  peach: "#F0A868",
  slate: "#5F6F7D",
  gold: "#E9B84B",
  cream: "#F2ECDD",
} as const;

const CYCLE_MS = 3200;

/**
 * Product photo that follows the selected variant, with a soft backdrop
 * tinted in the same shade. Until the visitor picks a shade, the bag colour
 * cycles through the range (paused on hover; skipped for reduced motion).
 */
export function ProductGallery({
  product,
  className,
}: {
  product: Product;
  className?: string;
}) {
  const selectedLabel = useSelectedVariantLabel(product.id);
  const [showcaseIndex, setShowcaseIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const variants = product.variants ?? [];
  const selectedVariant = variants.find(
    (item) => item.label === selectedLabel,
  );
  const cycling =
    variants.length > 1 && !selectedVariant && !paused;

  useEffect(() => {
    if (!cycling) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }
    const timer = window.setInterval(() => {
      setShowcaseIndex((index) => (index + 1) % variants.length);
    }, CYCLE_MS);
    return () => window.clearInterval(timer);
  }, [cycling, variants.length]);

  const showcased = cycling
    ? variants[showcaseIndex % variants.length]
    : undefined;
  const activeVariant = selectedVariant ?? showcased;
  const src = activeVariant?.image ?? product.image;
  const alt = activeVariant
    ? `${activeVariant.label} — ${product.name}`
    : product.imageAlt;
  const tint = activeVariant?.tint ?? toneTint[product.tone];

  return (
    <div
      className={cn(
        "relative aspect-square overflow-hidden rounded-2xl border border-border/70 bg-surface-2",
        className,
      )}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      {/* Dim backdrop in the active shade, granule-textured like dana */}
      <div
        className="dana-texture absolute inset-0 transition-colors duration-500"
        style={{
          background: `linear-gradient(165deg, ${tint}55 0%, ${tint}22 52%, transparent 100%)`,
        }}
        aria-hidden
      />
      <div className="absolute inset-3 overflow-hidden rounded-xl">
        <Image
          key={src}
          src={src}
          alt={alt}
          fill
          priority
          fetchPriority="high"
          sizes="(min-width: 1024px) 48vw, 100vw"
          className="object-cover"
        />
      </div>
      <div className="absolute left-4 top-4 flex flex-wrap gap-2">
        <span className="rounded-full bg-white px-3 py-1.5 text-[0.65rem] font-bold uppercase tracking-[0.1em] text-[#15203B] shadow-sm">
          HSN {product.hsnCode}
        </span>
        {activeVariant && (
          <span
            className="rounded-full px-3 py-1.5 text-[0.65rem] font-bold uppercase tracking-[0.1em] shadow-sm transition-colors duration-500"
            style={{
              background: tint,
              color: tint === "#F2ECDD" || tint === "#E8EDF4" ? "#15203B" : "#FFFFFF",
            }}
          >
            {activeVariant.label}
          </span>
        )}
      </div>
      {cycling && (
        <span className="absolute bottom-4 right-4 rounded-full bg-black/45 px-2.5 py-1 text-[0.6rem] font-bold uppercase tracking-[0.12em] text-white">
          Shades auto-cycling — tap one to lock
        </span>
      )}
    </div>
  );
}
