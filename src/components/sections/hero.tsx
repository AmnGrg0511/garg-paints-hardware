import Link from "next/link";
import {
  BadgeCheckIcon,
  BadgePercentIcon,
  CalendarDaysIcon,
  PhoneCallIcon,
  TruckIcon,
} from "lucide-react";
import { business } from "@/config/businessData";
import { generalEnquiryUrl, callUrl } from "@/lib/whatsapp";
import { Localized } from "@/i18n/Localized";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { TrackedLink } from "@/components/analytics/tracked-link";
import { ColourVisualizer } from "@/components/sections/colour-visualizer";
import { HeroShadeFx } from "@/components/sections/hero-backdrop";
import { CallBackForm } from "@/components/lead/call-back-form";

const tickerItems = [
  "Better rates than anywhere",
  "Genuine quality, guaranteed",
  "Quick delivery",
  "Dealer & contractor pricing",
  "IndiaMART seller",
  "Open 24x7",
];

const trustBadges = [
  {
    icon: BadgePercentIcon,
    label: "Better rates than anywhere",
    hi: "कहीं से बेहतर रेट",
  },
  {
    icon: BadgeCheckIcon,
    label: "Genuine quality, guaranteed",
    hi: "असली माल, quality की गारंटी",
  },
  {
    icon: TruckIcon,
    label: "Quick delivery",
    hi: "तेज़ delivery",
  },
  {
    icon: CalendarDaysIcon,
    label: "Since 2017",
    hi: "2017 से",
  },
];

export function Hero() {
  const headingId = "hero-heading";

  return (
    <section
      className="relative overflow-hidden bg-surface-2"
      aria-labelledby={headingId}
    >
      <HeroShadeFx />
      <div className="container-page relative grid items-center gap-8 pb-10 pt-8 sm:pb-14 sm:pt-12 lg:grid-cols-[1.02fr_0.98fr] lg:gap-12 lg:pb-16 lg:pt-14">
        <div className="max-w-2xl">
          <p className="inline-flex items-center gap-2 rounded-full bg-secondary px-3 py-1.5 text-[0.68rem] font-bold uppercase tracking-[0.14em] text-secondary-foreground">
            <Localized
              en="Ballabgarh, Faridabad · Paints & hardware"
              hi="बल्लभगढ़, फ़रीदाबाद · पेंट और हार्डवेयर"
            />
          </p>

          <h1 id={headingId} className="display-xl mt-4">
            <Localized
              en="Paint, texture and tools for every wall."
              hi="पेंट, टेक्सचर और टूल्स — हर दीवार के लिए।"
            />
          </h1>

          <p className="mt-4 max-w-xl text-[1rem] leading-relaxed text-muted-foreground sm:text-[1.05rem]">
            <Localized
              en="Madrasi dana wall textures, Pidicryl binders, CMC, chamki and stainless steel trowels — at rates negotiated for you, with genuine quality and quick delivery."
              hi="Madrasi dana वॉल टेक्सचर, Pidicryl binder, CMC, chamki और स्टेनलेस स्टील gurmala — आपके लिए negotiate किए गए रेट पर, असली quality और तेज़ delivery के साथ।"
            />
          </p>

          <div className="mt-6 flex flex-col gap-2.5 sm:flex-row">
            <Link
              href="/products"
              className={cn(
                buttonVariants({ size: "lg" }),
                "h-12 rounded-full px-7 text-base font-bold",
              )}
            >
              <Localized en="Shop products" hi="उत्पाद देखें" />
            </Link>
            <TrackedLink
              event="click_whatsapp"
              params={{ source: "hero" }}
              href={generalEnquiryUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "h-12 rounded-full bg-card px-6 text-base font-bold",
              )}
            >
              <Localized en="Order on WhatsApp" hi="WhatsApp पर ऑर्डर" />
            </TrackedLink>
            <TrackedLink
              event="click_call"
              params={{ source: "hero" }}
              href={callUrl}
              className={cn(
                buttonVariants({ variant: "ghost", size: "lg" }),
                "hidden h-12 rounded-full px-4 text-base font-bold sm:inline-flex",
              )}
              aria-label={`${business.phoneDisplay} — call for orders`}
            >
              <PhoneCallIcon className="size-4.5 text-primary" aria-hidden />
              <span className="hidden xl:inline">{business.phoneDisplay}</span>
            </TrackedLink>
          </div>

          <ul className="mt-6 flex flex-wrap gap-2">
            {trustBadges.map((badge) => {
              const Icon = badge.icon;
              const content = (
                <>
                  <Icon className="size-3.5 text-primary" aria-hidden />
                  <Localized en={badge.label} hi={badge.hi} />
                </>
              );
              return (
                <li key={badge.label}>
                  <span className="flex min-h-9 items-center gap-1.5 rounded-full border border-border bg-background px-3 text-xs font-semibold text-muted-foreground">
                    {content}
                  </span>
                </li>
              );
            })}
          </ul>

          <p className="mt-4 flex items-start gap-1.5 text-xs leading-relaxed text-muted-foreground">
            <BadgeCheckIcon
              className="mt-0.5 size-3.5 shrink-0 text-primary"
              aria-hidden
            />
            <Localized
              en="No payment on this website. Availability and your best rate are confirmed by the team on call or WhatsApp."
              hi="इस website पर payment नहीं। उपलब्धता और आपका बेस्ट रेट टीम call या WhatsApp पर कन्फ़र्म करेगी।"
            />
          </p>

          <CallBackForm source="hero" className="mt-6 max-w-md" />
        </div>

        <ColourVisualizer className="aspect-auto w-full" />
      </div>

      <div className="border-y border-border/70 bg-background">
        <div className="overflow-hidden py-2.5">
          <div className="flex w-max animate-marquee items-center gap-7 pr-7 hover:[animation-play-state:paused] motion-reduce:animate-none">
            {[...tickerItems, ...tickerItems].map((item, index) => (
              <span
                key={`${item}-${index}`}
                className="flex items-center gap-7 whitespace-nowrap text-[0.7rem] font-bold uppercase tracking-[0.14em] text-muted-foreground"
                aria-hidden={index >= tickerItems.length}
              >
                {item}
                <span className="size-1.5 rounded-full bg-primary/70" aria-hidden />
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
