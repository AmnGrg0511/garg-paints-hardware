"use client";

import { create } from "zustand";

type VariantSelectionState = {
  /** productId -> selected variant label */
  byProduct: Record<string, string | undefined>;
  select: (productId: string, label: string) => void;
};

/**
 * Keeps the currently selected variant per product so the product photo can
 * follow the shade the visitor picks. Not persisted — the selection is a
 * view concern, the cart keeps its own copy.
 */
export const useVariantSelection = create<VariantSelectionState>()((set) => ({
  byProduct: {},
  select: (productId, label) =>
    set((state) => ({
      byProduct: { ...state.byProduct, [productId]: label },
    })),
}));

export function useSelectedVariantLabel(productId: string): string | undefined {
  return useVariantSelection((state) => state.byProduct[productId]);
}
