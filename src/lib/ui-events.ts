export type FlyToCartDetail = {
  x: number;
  y: number;
  tone: "terracotta" | "peach" | "slate" | "gold" | "cream";
};

export const FLY_EVENT = "gph:fly-to-cart";

export function dispatchFlyToCart(detail: FlyToCartDetail): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent<FlyToCartDetail>(FLY_EVENT, { detail }));
}

export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
