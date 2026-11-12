"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { products } from "@/config/effective-catalog";

export type CartLine = {
  key: string;
  productId: string;
  slug: string;
  name: string;
  variantLabel: string | null;
  qty: number;
  displayPrice: string;
  amount: number | null;
  unit: string | null;
  image: string;
  tone: "terracotta" | "peach" | "slate" | "gold" | "cream";
};

export type NewCartLine = Omit<CartLine, "key" | "qty"> & { qty?: number };

type CartState = {
  lines: CartLine[];
  hydrated: boolean;
  isOpen: boolean;
  addItem: (item: NewCartLine) => void;
  setQty: (key: string, qty: number) => void;
  increment: (key: string) => void;
  decrement: (key: string) => void;
  remove: (key: string) => void;
  clear: () => void;
  open: () => void;
  close: () => void;
  setHydrated: (value: boolean) => void;
};

export const lineKey = (productId: string, variantLabel?: string | null) =>
  variantLabel ? `${productId}::${variantLabel}` : productId;

const MAX_QTY = 999;

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      lines: [],
      hydrated: false,
      isOpen: false,
      addItem: (item) =>
        set((state) => {
          const key = lineKey(item.productId, item.variantLabel);
          const qty = Math.max(1, Math.min(MAX_QTY, item.qty ?? 1));
          const existing = state.lines.find((line) => line.key === key);

          if (existing) {
            return {
              lines: state.lines.map((line) =>
                line.key === key
                  ? { ...line, qty: Math.min(MAX_QTY, line.qty + qty) }
                  : line,
              ),
            };
          }

          return {
            lines: [...state.lines, { ...item, key, qty }],
          };
        }),
      setQty: (key, qty) =>
        set((state) => ({
          lines: state.lines
            .map((line) =>
              line.key === key
                ? { ...line, qty: Math.max(0, Math.min(MAX_QTY, qty)) }
                : line,
            )
            .filter((line) => line.qty > 0),
        })),
      increment: (key) =>
        set((state) => ({
          lines: state.lines.map((line) =>
            line.key === key
              ? { ...line, qty: Math.min(MAX_QTY, line.qty + 1) }
              : line,
          ),
        })),
      decrement: (key) =>
        set((state) => ({
          lines: state.lines
            .map((line) =>
              line.key === key ? { ...line, qty: line.qty - 1 } : line,
            )
            .filter((line) => line.qty > 0),
        })),
      remove: (key) =>
        set((state) => ({
          lines: state.lines.filter((line) => line.key !== key),
        })),
      clear: () => set({ lines: [] }),
      open: () => set({ isOpen: true }),
      close: () => set({ isOpen: false }),
      setHydrated: (value) => set({ hydrated: value }),
    }),
    {
      name: "gph-cart",
      version: 3,
      partialize: (state) => ({ lines: state.lines }),
      // v3: cart lines carry the variant bag art instead of the collective
      // tile, so a persisted Red bag shows as the red sack, not five bags.
      // Merge instead of replace: persist rehydrates asynchronously, so a
      // tap that lands before hydration must not be wiped by the stored
      // (possibly empty) cart.
      merge: (persisted, current) => {
        const stored = Array.isArray(
          (persisted as { lines?: CartLine[] } | null)?.lines,
        )
          ? ((persisted as { lines: CartLine[] }).lines ?? [])
          : [];
        return {
          ...current,
          lines: current.lines.length > 0 ? current.lines : stored,
        };
      },
      migrate: (persisted, version) => {
        if (version < 3 && persisted && typeof persisted === "object") {
          const state = persisted as { lines?: CartLine[] };
          const lines = (state.lines ?? []).map((line) => {
            const product = products.find((item) => item.id === line.productId);
            if (!product || product.kind !== "variant") return line;
            const variant = product.variants.find(
              (item) => item.label === line.variantLabel,
            );
            return variant?.image ? { ...line, image: variant.image } : line;
          });
          return { ...persisted, lines };
        }
        return persisted ?? { lines: [], hydrated: false, isOpen: false };
      },
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    },
  ),
);

export function useCartCount(): number {
  return useCartStore((state) =>
    state.lines.reduce((total, line) => total + line.qty, 0),
  );
}

export function useEstimatedTotal(): {
  amount: number;
  hasQuoteLines: boolean;
} {
  const amount = useCartStore((state) =>
    state.lines.reduce(
      (total, line) => total + (line.amount ?? 0) * line.qty,
      0,
    ),
  );
  const hasQuoteLines = useCartStore((state) =>
    state.lines.some((line) => line.amount === null),
  );

  return { amount, hasQuoteLines };
}
