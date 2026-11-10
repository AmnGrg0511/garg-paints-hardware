"use client";

import Image from "next/image";
import { HomeIcon, ShoppingBagIcon, Trash2Icon } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import {
  useCartStore,
  useEstimatedTotal,
} from "@/store/cart";
import { formatAmount, getQuantityConfig, getUnitLabel } from "@/lib/pricing";
import { QuantityStepper } from "@/components/product/quantity-stepper";
import { useIsClient } from "@/lib/use-is-client";
import { useLocale } from "@/i18n/LocaleProvider";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

const toneClasses = {
  terracotta: "swatch-terracotta",
  peach: "swatch-peach",
  slate: "swatch-slate",
  gold: "swatch-gold",
  cream: "swatch-cream",
} as const;

export function CartDrawer() {
  const isOpen = useCartStore((state) => state.isOpen);
  const close = useCartStore((state) => state.close);
  const lines = useCartStore((state) => state.lines);
  const hydrated = useCartStore((state) => state.hydrated);
  const remove = useCartStore((state) => state.remove);
  const setQty = useCartStore((state) => state.setQty);
  const clear = useCartStore((state) => state.clear);
  const { amount, hasQuoteLines } = useEstimatedTotal();
  const { t } = useLocale();
  const isClient = useIsClient();

  const count = lines.reduce((total, line) => total + line.qty, 0);
  const visibleLines = isClient && hydrated ? lines : [];

  return (
    <Sheet open={isOpen} onOpenChange={(open) => (open ? undefined : close())}>
      <SheetContent
        side="right"
        className="w-full gap-0 p-0 sm:max-w-md"
        showCloseButton
      >
        <SheetHeader className="border-b border-border/70 px-5 pb-4 pt-5">
          <SheetTitle className="font-display text-2xl tracking-tight">
            {t("cart.title")}
          </SheetTitle>
          <SheetDescription>
            {count > 0
              ? `${count} ${count === 1 ? "item" : "items"} · ${t("cart.estimated")}`
              : t("cart.emptyBody")}
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {visibleLines.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-4 py-16 text-center">
              <span className="grid size-16 place-items-center rounded-full bg-secondary text-primary">
                <ShoppingBagIcon className="size-7" aria-hidden />
              </span>
              <div>
                <p className="font-display text-xl">{t("cart.empty")}</p>
                <p className="mx-auto mt-1 max-w-[28ch] text-sm text-muted-foreground">
                  {t("cart.emptyBody")}
                </p>
              </div>
              <Button
                render={<Link href="/products" />}
                onClick={close}
                className="h-11 rounded-full px-5"
              >
                {t("cart.browse")}
              </Button>
            </div>
          ) : (
            <ul className="space-y-3">
              {visibleLines.map((line) => (
                <li
                  key={line.key}
                  className="surface-card flex gap-3 rounded-2xl p-3"
                >
                  <span
                    className={cn(
                      "relative size-16 shrink-0 overflow-hidden rounded-xl",
                      toneClasses[line.tone],
                    )}
                    aria-hidden
                  >
                    <Image
                      src={line.image}
                      alt=""
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <Link
                          href={`/products/${line.slug}`}
                          onClick={close}
                          className="text-sm font-semibold leading-snug hover:text-primary"
                        >
                          {line.name}
                        </Link>
                        {line.variantLabel && (
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            {line.variantLabel}
                          </p>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => remove(line.key)}
                        aria-label={`${t("common.remove")} ${line.name}`}
                        className="grid size-9 shrink-0 place-items-center rounded-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                      >
                        <Trash2Icon className="size-4" aria-hidden />
                      </button>
                    </div>

                    <div className="mt-3 flex items-center justify-between gap-2">
                      <QuantityStepper
                        value={line.qty}
                        onChange={(next) => setQty(line.key, next)}
                        steps={getQuantityConfig(line.productId).steps}
                        max={getQuantityConfig(line.productId).max}
                        min={0}
                        size="sm"
                        label={`Quantity for ${line.name}`}
                      />
                      <div className="text-right text-sm">
                        {line.amount !== null ? (
                          <>
                            <span className="font-semibold">
                              <span className="rupee">₹</span>
                              {formatAmount(line.amount * line.qty)}
                            </span>
                            <span className="block text-[0.68rem] text-muted-foreground">
                              <span className="rupee">₹</span>
                              {formatAmount(line.amount)}
                              {line.unit ? `/${getUnitLabel(line.unit)}` : ""} ·{" "}
                              {t("cart.estimated")}
                            </span>
                          </>
                        ) : (
                          <span className="text-xs font-medium text-muted-foreground">
                            {t("cart.quoteLine")}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {visibleLines.length > 0 && (
          <div className="border-t border-border/70 bg-card px-5 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4">
            <div className="flex items-end justify-between gap-3">
              <div>
                <p className="text-xs text-muted-foreground">
                  {t("cart.estimated")}
                </p>
                <p className="font-display text-3xl tracking-tight">
                  <span className="rupee">₹</span>
                  {formatAmount(amount)}
                </p>
                {hasQuoteLines && (
                  <p className="mt-1 text-xs font-semibold text-primary">
                    + {t("cart.quoteLine")}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={() => {
                  clear();
                  toast.success("Order list cleared");
                }}
                className="text-xs font-medium text-muted-foreground underline underline-offset-4 hover:text-foreground"
              >
                {t("cart.clear")}
              </button>
            </div>
            <p className="mt-2 text-[0.7rem] leading-relaxed text-muted-foreground">
              {t("cart.note")}
            </p>
            <Button
              render={<Link href="/checkout" />}
              onClick={close}
              className="mt-3 h-12 w-full rounded-full text-base font-semibold"
            >
              {t("cart.checkout")}
            </Button>
          </div>
        )}

        {isOpen && visibleLines.length === 0 && (
          <p className="border-t border-border/70 px-5 py-4 text-center text-xs text-muted-foreground">
            <HomeIcon className="mr-1 inline size-3" aria-hidden />
            {t("cart.note")}
          </p>
        )}
      </SheetContent>
    </Sheet>
  );
}
