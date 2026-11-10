"use client";

import { usePathname } from "next/navigation";
import { PhoneIcon, ShoppingBagIcon } from "lucide-react";
import { useCartStore } from "@/store/cart";
import { useLocale } from "@/i18n/LocaleProvider";
import { callUrl, generalEnquiryUrl } from "@/lib/whatsapp";
import { TrackedLink } from "@/components/analytics/tracked-link";
import { WhatsAppGlyph } from "@/components/icons/brand";

export function MobileOrderBar() {
  const pathname = usePathname();
  const open = useCartStore((state) => state.open);
  const { t } = useLocale();

  if (pathname.startsWith("/checkout")) return null;

  return (
    <div
      className="glass fixed inset-x-0 bottom-0 z-40 border-t border-border/70 pb-[env(safe-area-inset-bottom)] md:hidden"
      aria-label="Quick order actions"
    >
      <div className="grid grid-cols-3 gap-2 px-3 py-2.5">
        <button
          type="button"
          onClick={open}
          className="flex min-h-11 flex-col items-center justify-center gap-0.5 rounded-xl text-[0.7rem] font-semibold text-foreground transition-colors hover:bg-secondary/70"
        >
          <ShoppingBagIcon className="size-5" aria-hidden />
          {t("common.addToCart")}
        </button>
        <TrackedLink
          event="click_whatsapp"
          params={{ source: "mobile_bar" }}
          href={generalEnquiryUrl()}
          target="_blank"
          rel="noopener noreferrer"
          className="flex min-h-11 flex-col items-center justify-center gap-0.5 rounded-xl bg-[#0d7a5f] text-[0.7rem] font-semibold text-white transition-transform active:scale-[0.98]"
        >
          <WhatsAppGlyph className="size-5" />
          WhatsApp
        </TrackedLink>
        <TrackedLink
          event="click_call"
          params={{ source: "mobile_bar" }}
          href={callUrl}
          className="flex min-h-11 flex-col items-center justify-center gap-0.5 rounded-xl border border-border bg-card text-[0.7rem] font-semibold text-foreground transition-colors hover:bg-secondary"
        >
          <PhoneIcon className="size-5" aria-hidden />
          {t("common.call")}
        </TrackedLink>
      </div>
    </div>
  );
}
