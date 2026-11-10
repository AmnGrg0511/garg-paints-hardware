"use client";

import { useLayoutEffect, useRef, useState } from "react";

/**
 * True once the element has entered the viewport. The reveal fires once.
 *
 * The element stays server-rendered and visible when JavaScript is absent;
 * the hidden state is only applied after hydration (below the fold), so
 * content is never lost and layout never shifts.
 */
export function useInView<T extends HTMLElement>(
  margin = "-8%",
): { ref: React.RefObject<T | null>; inView: boolean } {
  const ref = useRef<T | null>(null);
  const [armed, setArmed] = useState(false);
  const [inView, setInView] = useState(false);

  useLayoutEffect(() => {
    const node = ref.current;
    if (!node) return;
    // Without an observer (or with reduced motion) the element stays
    // statically visible; the hidden state is only armed for animation.
    if (
      typeof IntersectionObserver === "undefined" ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }
    const frame = window.requestAnimationFrame(() => setArmed(true));
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: margin, threshold: 0.08 },
    );
    observer.observe(node);
    return () => {
      window.cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [margin]);

  return { ref, inView: armed && inView };
}
