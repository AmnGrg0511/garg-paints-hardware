"use client";

import { usePathname } from "next/navigation";
import { generalEnquiryUrl } from "@/lib/whatsapp";
import { TrackedLink } from "@/components/analytics/tracked-link";
import { WhatsAppGlyph } from "@/components/icons/brand";

export function FloatingWhatsApp() {
  const pathname = usePathname();
  if (pathname.startsWith("/checkout")) return null;

  return (
    <TrackedLink
      event="click_whatsapp"
      params={{ source: "floating_desktop" }}
      href={generalEnquiryUrl()}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with Garg Paints & Hardware on WhatsApp"
      className="fixed bottom-7 right-7 z-40 hidden size-14 items-center justify-center rounded-full bg-[#0d7a5f] text-white shadow-[0_16px_40px_-12px_rgba(13,122,95,0.7)] transition-transform hover:scale-105 focus-visible:scale-105 md:flex"
    >
      <WhatsAppGlyph className="size-7" />
    </TrackedLink>
  );
}
