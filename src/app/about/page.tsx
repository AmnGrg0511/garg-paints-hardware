import Link from "next/link";
import {
  ArrowRightIcon,
  BadgeCheckIcon,
  Building2Icon,
  ClockIcon,
  MapPinIcon,
  ShieldCheckIcon,
} from "lucide-react";
import { business, hasFullAddress, SITE_URL } from "@/config/businessData";
import { buildPageMetadata } from "@/lib/seo";
import { breadcrumbSchema } from "@/lib/schema";
import { SEO } from "@/components/SEO";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { SectionHeading } from "@/components/sections/section-heading";
import { CtaBand } from "@/components/sections/cta-band";
import { TrackedLink } from "@/components/analytics/tracked-link";
import { Localized } from "@/i18n/Localized";
import { FacadeVisualizer } from "@/components/sections/facade-visualizer";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { generalEnquiryUrl } from "@/lib/whatsapp";

export const metadata = buildPageMetadata({
  title: "About Garg Paints & Hardware, Ballabgarh",
  description:
    "Garg Paints & Hardware is a wholesaler and retailer of paint additives, binders, wall textures and plastering tools in Ballabgarh, Faridabad. Established 2017. Better rates on every order — negotiable by quantity.",
  path: "/about",
});

const aboutSchema = {
  "@context": "https://schema.org",
  "@type": "AboutPage",
  name: "About Garg Paints & Hardware",
  mainEntity: { "@id": `${SITE_URL}/#store` },
};

export default function AboutPage() {
  const verificationRows: readonly (readonly [string, string])[] = [
    ["Store name", business.name],
    ...(business.legalName
      ? ([["Legal / trade name", business.legalName]] as const)
      : []),
    [
      "Proprietor",
      business.proprietor.fullName ?? business.proprietor.displayName,
    ],
    ["Established", String(business.established)],
    ["Locality", `${business.locality}, ${business.city}, ${business.state}`],
    ["Hours", business.hours.label],
    ["Marketplace", "IndiaMART seller listing"],
  ];

  return (
    <>
      <SEO
        data={[
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "About" },
          ]),
          aboutSchema,
        ]}
      />

      <div className="container-page pt-6 sm:pt-10">
        <Breadcrumbs items={[{ name: "Home", path: "/" }, { name: "About" }]} />

        <div className="mt-6 grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-14">
          <div>
            <p className="eyebrow">Since 2017 · Ballabgarh</p>
            <h1 className="display-lg mt-2">
              <Localized
                en="A supply shop built around the finish."
                hi="फ़िनिश के इर्द-गिर्द बनी supply दुकान।"
              />
            </h1>
            <p className="mt-5 max-w-xl text-[1rem] leading-relaxed text-muted-foreground sm:text-lg">
              <Localized
                en="Garg Paints & Hardware is a wholesaler and retailer of paint additives, binders, wall textures and plastering tools in Ballabgarh, Faridabad. Contractors, painters, dealers and builders have sourced materials here since 2017."
                hi="Garg Paints & Hardware, बल्लभगढ़, फ़रीदाबाद में paint additives, binders, wall textures और plastering tools का wholesaler और retailer है। 2017 से contractors, painters, dealers और builders यहाँ से material लेते हैं।"
              />
            </p>
            <div className="mt-6 flex flex-col gap-2.5 sm:flex-row">
              <Link
                href="/products"
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "h-12 rounded-full px-6 text-base font-semibold",
                )}
              >
                <Localized en="Explore the catalogue" hi="कैटलॉग देखें" />
                <ArrowRightIcon className="size-4" aria-hidden />
              </Link>
              <TrackedLink
                event="click_whatsapp"
                params={{ source: "about" }}
                href={generalEnquiryUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" }),
                  "h-12 rounded-full bg-card/60 px-6 text-base font-semibold",
                )}
              >
                <Localized en="WhatsApp the shop" hi="WhatsApp पर बात करें" />
              </TrackedLink>
            </div>
          </div>

          <FacadeVisualizer className="w-full" />
        </div>

        <section className="grid gap-8 py-10 md:grid-cols-2 lg:grid-cols-4">
          {[
            {
              icon: Building2Icon,
              title: "Wholesaler and retailer",
              body: "Trade quantities and single pieces from the same Ballabgarh counter.",
            },
            {
              icon: MapPinIcon,
              title: "Ballabgarh, Faridabad",
              body: `Serving ${business.locality}, ${business.city} and the wider Delhi NCR area.`,
            },
            {
              icon: ShieldCheckIcon,
              title: "Better rates, negotiated",
              body: "Listed rates are starting points — your final rate depends on your quantity and your relationship with the shop. Regular customers get better deals."
            },
            {
              icon: ClockIcon,
              title: "Enquiries 24x7",
              body: "Call and WhatsApp order enquiries are accepted all seven days.",
            },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="surface-card rounded-2xl p-5"
              >
                <span className="grid size-10 place-items-center rounded-full bg-secondary text-primary">
                  <Icon className="size-5" aria-hidden />
                </span>
                <h2 className="mt-4 font-display text-xl">{item.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {item.body}
                </p>
              </div>
            );
          })}
        </section>

        <section className="py-8 sm:py-12" aria-labelledby="verification-heading">
          <SectionHeading
            id="verification-heading"
            eyebrow={{ en: "Verification details", hi: "प्रमाणन की जानकारी" }}
            title={{ en: "Facts you can check.", hi: "जाँचे जा सकने वाले तथ्य।" }}
            body={{ en: "The business details below are repeated consistently across this site and the IndiaMART listing. Nothing here is an unverified badge or review score.", hi: "नीचे दी गई business जानकारी इस site और IndiaMART listing में एक जैसी है। यहाँ कोई बिना प्रमाण वाला badge या review स्कोर नहीं है।" }}
          />

          <div className="mt-8 grid gap-4 lg:grid-cols-[1fr_1fr]">
            <dl className="surface-card divide-y divide-border/60 rounded-3xl px-6 py-2">
              {verificationRows.map(([label, value]) => (
                <div
                  key={label}
                  className="flex flex-col gap-1 py-3.5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6"
                >
                  <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                    {label}
                  </dt>
                  <dd className="text-sm font-medium text-foreground sm:text-right">
                    {value}
                  </dd>
                </div>
              ))}
            </dl>

            <div className="space-y-4">
              <div className="surface-card rounded-3xl p-6">
                <p className="flex items-center gap-2 font-semibold">
                  <BadgeCheckIcon className="size-4 text-primary" aria-hidden />
                  What this site does not claim
                </p>
                <ul className="mt-3 space-y-2 text-sm leading-relaxed text-muted-foreground">
                  <li>No review scores or ratings are published.</li>
                  <li>No fixed delivery timelines are published — quick delivery is the owner's standing service promise.</li>
                  <li>Listed rates are starting points; final rates are negotiated per order, never published as fixed.</li>
                  <li>No street address, map or pincode is shown until the owner confirms it.</li>
                </ul>
              </div>

              <div className="rounded-3xl border border-border/70 bg-background/40 p-6">
                <p className="font-semibold">
                  <Localized en="Address status" hi="पते की स्थिति" />
                </p>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {hasFullAddress
                    ? `${business.address.street}, ${business.locality}, ${business.city}, ${business.state} ${business.address.postalCode}`
                    : "Street address, pincode and coordinates are still being confirmed by the owner. Until then, call or WhatsApp for directions before visiting."}
                </p>
                <TrackedLink
                  event="click_indiamart"
                  params={{ source: "about_verification" }}
                  href={business.marketplaceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-primary"
                >
                  Find us on IndiaMART
                  <ArrowRightIcon className="size-4" aria-hidden />
                </TrackedLink>
              </div>
            </div>
          </div>
        </section>

        <section className="py-10 sm:py-16" aria-labelledby="approach-heading">
          <SectionHeading
            id="approach-heading"
            eyebrow={{ en: "How we work", hi: "हम कैसे काम करते हैं" }}
            title={{ en: "Plain answers, confirmed orders.", hi: "सीधे जवाब, कन्फ़र्म ऑर्डर।" }}
            body={{ en: "This website is an order-enquiry layer, not a payment gateway. Every order is confirmed by the business before it moves ahead.", hi: "यह website ऑर्डर-पूछताछ का माध्यम है, payment gateway नहीं। हर ऑर्डर business द्वारा कन्फ़र्म होकर ही आगे बढ़ता है।" }}
          />
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {[
              {
                title: "Material, not marketing",
                body: "The catalogue describes what each product is, what it is used for and whether a price is listed or quoted. Nothing is priced by guesswork.",
              },
              {
                title: "Trade-first quantities",
                body: "Contractors, painters and dealers can order by the kilogram, bag or piece, and ask for dealer pricing on a project quantity.",
              },
              {
                title: "Best rates, negotiated per order",
                body: "Listed rates are starting points. The business confirms your best rate directly — quantity and repeat customers get better prices.",
              },
            ].map((item) => (
              <div key={item.title} className="surface-card rounded-2xl p-6">
                <h3 className="font-display text-xl">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {item.body}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>

      <CtaBand />
    </>
  );
}
