"use client";

import { useEffect, useState } from "react";
import { CookieIcon } from "lucide-react";
import { getConsent, setConsent } from "@/lib/analytics";
import { Button } from "@/components/ui/button";

export function ConsentBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (getConsent() === null) {
      const timer = window.setTimeout(() => setVisible(true), 1200);
      return () => window.clearTimeout(timer);
    }
  }, []);

  if (!visible) return null;

  const decide = (state: "granted" | "denied") => {
    setConsent(state);
    setVisible(false);
  };

  return (
    <div
      role="region"
      aria-label="Analytics consent"
      className="fixed bottom-24 left-4 right-4 z-50 rounded-2xl border border-border bg-popover p-4 shadow-2xl md:bottom-6 md:left-auto md:right-6 md:max-w-sm"
    >
      <div className="flex items-start gap-3">
        <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-full bg-secondary text-primary">
          <CookieIcon className="size-4" aria-hidden />
        </span>
        <div>
          <p className="text-sm font-semibold">Optional analytics</p>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            With your permission we record anonymous order actions such as
            WhatsApp clicks, to improve the site. No data is sold. Declining
            changes nothing about ordering.
          </p>
          <div className="mt-3 flex gap-2">
            <Button
              onClick={() => decide("granted")}
              className="h-9 rounded-full px-4 text-xs"
            >
              Allow analytics
            </Button>
            <Button
              variant="outline"
              onClick={() => decide("denied")}
              className="h-9 rounded-full px-4 text-xs"
            >
              Decline
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
