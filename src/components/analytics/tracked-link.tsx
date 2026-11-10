"use client";

import type { AnchorHTMLAttributes, MouseEvent } from "react";
import {
  trackEvent,
  type AnalyticsEventName,
  type AnalyticsParams,
} from "@/lib/analytics";

type TrackedLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  event: AnalyticsEventName;
  params?: AnalyticsParams;
};

/** Anchor that records a consent-gated conversion event, then follows the link. */
export function TrackedLink({
  event,
  params,
  onClick,
  ...props
}: TrackedLinkProps) {
  const handleClick = (clickEvent: MouseEvent<HTMLAnchorElement>) => {
    trackEvent(event, params);
    onClick?.(clickEvent);
  };

  return <a {...props} onClick={handleClick} />;
}
