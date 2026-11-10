"use client";

import { useEffect } from "react";
import { FLY_EVENT, prefersReducedMotion, type FlyToCartDetail } from "@/lib/ui-events";

const toneColor = {
  terracotta: "var(--terracotta)",
  peach: "var(--peach)",
  slate: "var(--slate-tone)",
  gold: "var(--gold)",
  cream: "var(--cream)",
} as const;

export function FlyToCart() {
  useEffect(() => {
    const handleFly = (event: Event) => {
      const detail = (event as CustomEvent<FlyToCartDetail>).detail;
      if (!detail || prefersReducedMotion()) return;

      const target = document.querySelector<HTMLElement>("[data-cart-button]");
      if (!target) return;

      const destination = target.getBoundingClientRect();
      const dot = document.createElement("span");
      const size = 26;
      dot.setAttribute("aria-hidden", "true");
      dot.style.position = "fixed";
      dot.style.left = `${detail.x - size / 2}px`;
      dot.style.top = `${detail.y - size / 2}px`;
      dot.style.width = `${size}px`;
      dot.style.height = `${size}px`;
      dot.style.borderRadius = "9999px";
      dot.style.background = toneColor[detail.tone];
      dot.style.zIndex = "60";
      dot.style.pointerEvents = "none";
      dot.style.boxShadow = "0 8px 24px -8px rgba(0,0,0,0.45)";
      dot.style.transition =
        "transform 680ms cubic-bezier(0.22, 0.9, 0.24, 1), opacity 180ms ease 500ms";
      dot.style.willChange = "transform, opacity";
      document.body.appendChild(dot);

      const dx =
        destination.left + destination.width / 2 - detail.x;
      const dy = destination.top + destination.height / 2 - detail.y;

      requestAnimationFrame(() => {
        dot.style.transform = `translate3d(${dx}px, ${dy}px, 0) scale(0.2)`;
        dot.style.opacity = "0";
      });

      window.setTimeout(() => dot.remove(), 780);
    };

    window.addEventListener(FLY_EVENT, handleFly);
    return () => window.removeEventListener(FLY_EVENT, handleFly);
  }, []);

  return null;
}
