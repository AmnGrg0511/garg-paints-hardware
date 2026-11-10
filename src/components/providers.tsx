"use client";

import type { ReactNode } from "react";
import { ThemeProvider } from "next-themes";
import { LocaleProvider } from "@/i18n/LocaleProvider";
import { Toaster } from "@/components/ui/sonner";
import { CartDrawer } from "@/components/cart/cart-drawer";
import { FlyToCart } from "@/components/cart/fly-to-cart";
import { ConsentBanner } from "@/components/analytics/consent-banner";
import { LeadPopup } from "@/components/lead/lead-popup";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <LocaleProvider>
        {children}
        <CartDrawer />
        <FlyToCart />
        <ConsentBanner />
        <LeadPopup />
        <Toaster position="top-center" />
      </LocaleProvider>
    </ThemeProvider>
  );
}
