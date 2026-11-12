import Link from "next/link";
import { ArrowRightIcon, PhoneIcon } from "lucide-react";
import { callUrl } from "@/lib/whatsapp";
import { Localized } from "@/i18n/Localized";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { TrackedLink } from "@/components/analytics/tracked-link";

export function CtaBand() {
  return (
    <section className="container-page py-10 sm:py-16" aria-labelledby="cta-heading">
      <div className="relative isolate overflow-hidden rounded-[1.25rem] bg-[#101A2E] px-6 py-10 text-white sm:px-10 sm:py-12 dark:bg-[#0D1526]">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-16 -top-24 size-80 rounded-full bg-[radial-gradient(circle,var(--primary),transparent_65%)] opacity-25 blur-2xl"
        />
        <div className="relative flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-xl">
            <p className="text-[0.65rem] font-bold uppercase tracking-[0.18em] text-white/60">
              <Localized en="Need a rate today?" hi="आज ही रेट चाहिए?" />
            </p>
            <h2 id="cta-heading" className="mt-2 text-2xl font-extrabold tracking-tight sm:text-3xl">
              <Localized
                en="Build the list. We will confirm your best rate."
                hi="लिस्ट बनाएँ। आपका बेस्ट रेट हम कन्फ़र्म करेंगे।"
              />
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-white/70">
              <Localized
                en="Priced items can be added to the order list. Quote-only items go straight to WhatsApp for pack sizes and bulk rates."
                hi="लिस्टेड-रेट वाले items ऑर्डर लिस्ट में जोड़ें। रेट-पूछने वाले items WhatsApp पर pack size और बल्क रेट के लिए भेजें।"
              />
            </p>
          </div>

          <div className="flex flex-col gap-2.5 sm:flex-row">
            <Link
              href="/products"
              className={cn(
                buttonVariants({ size: "lg" }),
                "h-12 rounded-full bg-white px-6 text-base font-bold text-[#101A2E] hover:bg-white/90",
              )}
            >
              <Localized en="Shop products" hi="उत्पाद देखें" />
              <ArrowRightIcon className="size-4" aria-hidden />
            </Link>
            <TrackedLink
              event="click_call"
              params={{ source: "cta_band" }}
              href={callUrl}
              className="dana-texture inline-flex h-12 items-center justify-center gap-2 rounded-full border border-white/30 px-6 text-sm font-bold text-white transition-colors hover:bg-white/10"
            >
              <PhoneIcon className="size-4" aria-hidden />
              <Localized en="Call the shop" hi="दुकान पर call करें" />
            </TrackedLink>
          </div>
        </div>
      </div>
    </section>
  );
}
