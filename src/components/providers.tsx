"use client";

import type { ReactNode } from "react";
import { ThemeProvider } from "next-themes";
import { LocaleProvider } from "@/i18n/LocaleProvider";
import { Toaster } from "@/components/ui/sonner";
import { CartDrawer } from "@/components/cart/cart-drawer";
import { FlyToCart } from "@/components/cart/fly-to-cart";
import { LeadPopup } from "@/components/lead/lead-popup";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem
      disableTransitionOnChange
    >
      <LocaleProvider>
        {children}
        <CartDrawer />
        <FlyToCart />
        <LeadPopup />
        <Toaster position="top-center" />
      </LocaleProvider>
    </ThemeProvider>
  );
}
