"use client";

import { ShoppingBag } from "lucide-react";
import { useCartCount, useCartStore } from "@/store/cart";
import { useLocale } from "@/i18n/LocaleProvider";
import { cn } from "@/lib/utils";

export function CartButton({ className }: { className?: string }) {
  const count = useCartCount();
  const open = useCartStore((state) => state.open);
  const hydrated = useCartStore((state) => state.hydrated);
  const { t } = useLocale();

  return (
    <button
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
