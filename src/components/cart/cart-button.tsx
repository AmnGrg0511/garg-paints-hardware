"use client";

import { useEffect, useRef } from "react";
import { ShoppingBag } from "lucide-react";
import { CART_GLOW_EVENT, prefersReducedMotion } from "@/lib/ui-events";
import { useCartCount, useCartStore } from "@/store/cart";
import { useLocale } from "@/i18n/LocaleProvider";
import { cn } from "@/lib/utils";

export function CartButton({ className }: { className?: string }) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const glowTimer = useRef<number | null>(null);

  // When an item lands in the cart, glow + shake the button so the user
  // sees where the item went.
  useEffect(() => {
    const onGlow = () => {
      const el = buttonRef.current;
      if (!el || prefersReducedMotion()) return;
      el.classList.remove("gph-cart-glow");
      // Restart the animation even when it is already playing.
      void el.offsetWidth;
      el.classList.add("gph-cart-glow");
      if (glowTimer.current) window.clearTimeout(glowTimer.current);
      glowTimer.current = window.setTimeout(
        () => el.classList.remove("gph-cart-glow"),
        1100,
      );
    };
    window.addEventListener(CART_GLOW_EVENT, onGlow);
    return () => {
      window.removeEventListener(CART_GLOW_EVENT, onGlow);
      if (glowTimer.current) window.clearTimeout(glowTimer.current);
    };
  }, []);

  const count = useCartCount();
  const open = useCartStore((state) => state.open);
  const hydrated = useCartStore((state) => state.hydrated);
  const { t } = useLocale();

  return (
    <button
      ref={buttonRef}
      type="button"
      data-cart-button
      onClick={open}
      aria-label={
        hydrated && count > 0
          ? `${t("common.openCart")}, ${count}`
          : t("common.openCart")
      }
      className={cn(
        "relative inline-flex h-11 items-center gap-2 rounded-full border border-border/80 bg-surface/75 px-3.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary",
        className,
      )}
    >
      <ShoppingBag className="size-4.5" aria-hidden />
      <span className="hidden lg:inline">{t("common.cart")}</span>
      {hydrated && count > 0 && (
        <span
          key={count}
          className="gph-badge-pop grid min-w-5 place-items-center rounded-full bg-primary px-1.5 py-0.5 text-[0.68rem] font-bold leading-tight text-primary-foreground"
          aria-hidden
        >
          {count}
        </span>
      )}
    </button>
  );
}
