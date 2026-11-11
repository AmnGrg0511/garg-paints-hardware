"use client";

import { ShoppingBagIcon } from "lucide-react";
import { useCartStore } from "@/store/cart";
import { useWallShade } from "@/store/wall-shade";
import {
  buildStarterKitLines,
} from "@/lib/kit";
import { trackEvent } from "@/lib/analytics";
import { cn } from "@/lib/utils";

type Tone = "terracotta" | "peach" | "slate" | "gold" | "cream";

/**
 * "Order this setup" — adds the starter kit for the currently shown wall
 * shade (and the visitor's chamki finish) to the order list, then opens the
 * order list for review. Quote-only kit items ride along as quote lines.
 */
export function OrderKitButton({
  className,
  chamkiMode = "gold",
}: {
  className?: string;
  /** The visitor's chamki finish from the picker beside this button. */
  chamkiMode?: "gold" | "silver" | "off";
}) {
  const open = useCartStore((state) => state.open);
  const addItem = useCartStore((state) => state.addItem);
  const shadeIndex = useWallShade((state) => state.index);

  const orderKit = () => {
    const shadeIndexSafe = Number.isFinite(shadeIndex) ? shadeIndex : 0;
    const { lines } = buildStarterKitLines(shadeIndexSafe, chamkiMode);
    for (const line of lines) {
      addItem({
        productId: line.productId,
        slug: line.slug,
        name: line.name,
        variantLabel: line.variantLabel,
        displayPrice: line.displayPrice,
        amount: line.amount,
        unit: line.unit,
        image: line.image,
        tone: line.tone as Tone,
        qty: line.qty,
      });
    }
    trackEvent("order_kit", { items: lines.length });
    open();
  };

  return (
    <button
      type="button"
      onClick={orderKit}
      className={cn(
        "dana-texture inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-primary px-5 text-sm font-bold text-primary-foreground transition-transform hover:brightness-110 active:scale-[0.98]",
        className,
      )}
    >
      <ShoppingBagIcon className="size-4.5" aria-hidden />
      Order this setup
      <span className="sr-only">
        — adds the picked shade bag, binder drum, CMC, chamki and a gurmala to
        your order list
      </span>
    </button>
  );
}
