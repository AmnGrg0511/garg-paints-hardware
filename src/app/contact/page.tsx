import Link from "next/link";
import {
  ArrowRightIcon,
  ClockIcon,
  MapPinIcon,
  NavigationIcon,
  PhoneIcon,
  StoreIcon,
} from "lucide-react";
import {
  business,
  hasFullAddress,
  hasGeoCoordinates,
  SITE_URL,
} from "@/config/businessData";
import { callUrl, generalEnquiryUrl } from "@/lib/whatsapp";
import { buildPageMetadata } from "@/lib/seo";
import { breadcrumbSchema, faqSchema } from "@/lib/schema";
import { SEO } from "@/components/SEO";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { TrackedLink } from "@/components/analytics/tracked-link";
import { FaqAccordion } from "@/components/faq/faq-accordion";
import { CtaBand } from "@/components/sections/cta-band";
import { WhatsAppGlyph } from "@/components/icons/brand";
import { CallBackForm } from "@/components/lead/call-back-form";
import { Localized } from "@/i18n/Localized";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

export const metadata = buildPageMetadata({
  title: "Contact Garg Paints & Hardware, Ballabgarh",
  description:
    "Call +91 98992 84391 or WhatsApp Garg Paints & Hardware in Ballabgarh, Faridabad. Open 24x7 for order enquiries. Better rates on every order — negotiable by quantity. Street address and map pending owner confirmation.",
  path: "/contact",
});

const contactFaqs = [
  {
    question: "What is the phone number for Garg Paints & Hardware?",
    answer:
      "The display number is +91 98992 84391. Calling connects you to the business; the same number is used for WhatsApp order enquiries, subject to the owner confirming WhatsApp availability.",
  },
  {
    question: "Can I visit the shop in Ballabgarh?",
    answer:
      "The business is in Ballabgarh, Faridabad, Haryana. The full street address and pincode are still being confirmed, so call or WhatsApp before visiting for directions.",
  },
  {
    question: "Is there a Google Maps location?",
    answer:
      "Not yet published. Verified coordinates have not been supplied, so the site hides the map and directions link rather than showing an approximate location. Call or WhatsApp for directions.",
  },
  {
    question: "What are the opening hours?",
    answer:
      "The business is open 24x7, all seven days, as stated by the owner. Order enquiries are accepted on call and WhatsApp at any time.",
  },
];

export default function ContactPage() {
  return (
    <>
      <SEO
        data={[
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Contact" },
          ]),
          faqSchema(contactFaqs),
          {
            "@context": "https://schema.org",
            "@type": "ContactPage",
            name: "Contact Garg Paints & Hardware",
            url: `${SITE_URL}/contact`,
            mainEntity: { "@id": `${SITE_URL}/#store` },
          },
        ]}
      />

      <div className="container-page pt-6 sm:pt-10">
        <Breadcrumbs
          items={[{ name: "Home", path: "/" }, { name: "Contact" }]}
        />

        <header className="mt-6 max-w-3xl">
          <p className="eyebrow">Contact · Ballabgarh, Faridabad</p>
          <h1 className="display-lg mt-2">
            <Localized
              en="Talk to the shop, not a call centre."
              hi="दुकान से बात करें, call centre से नहीं।"
            />
          </h1>
          <p className="mt-4 text-[1rem] leading-relaxed text-muted-foreground sm:text-lg">
            <Localized
              en="Order enquiries are accepted 24x7 on call and WhatsApp. For a price, a pack size or directions, use the channel that suits you — the team confirms availability and your best final rate directly."
              hi="call और WhatsApp पर 24x7 ऑर्डर संपर्क। रेट, pack size या रास्ता जानने के लिए जो तरीका सही लगे वह चुनें — टीम उपलब्धता और आपका बेस्ट रेट सीधे कन्फ़र्म करेगी।"
            />
          </p>
        </header>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <TrackedLink
            event="click_call"
            params={{ source: "contact_primary" }}
            href={callUrl}
            className="group surface-card flex flex-col rounded-3xl p-6 transition-transform hover:-translate-y-0.5"
          >
            <span className="grid size-11 place-items-center rounded-full bg-primary text-primary-foreground">
              <PhoneIcon className="size-5" aria-hidden />
            </span>
            <span className="mt-4 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              <Localized en="Call now" hi="अभी call करें" />
            </span>
            <span className="mt-1 font-display text-2xl">
              {business.phoneDisplay}
            </span>
            <span className="mt-2 text-sm text-muted-foreground">
              <Localized
                en="Order enquiries, 24x7"
                hi="ऑर्डर संपर्क, 24x7"
              />
            </span>
          </TrackedLink>

          <TrackedLink
            event="click_whatsapp"
            params={{ source: "contact_primary" }}
            href={generalEnquiryUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="group surface-card flex flex-col rounded-3xl p-6 transition-transform hover:-translate-y-0.5"
          >
            <span className="grid size-11 place-items-center rounded-full bg-[#0d7a5f] text-white">
              <WhatsAppGlyph className="size-5" />
            </span>
            <span className="mt-4 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              <Localized en="WhatsApp" hi="WhatsApp" />
            </span>
            <span className="mt-1 font-display text-2xl">
              <Localized en="Send an enquiry" hi="पूछताछ भेजें" />
            </span>
            <span className="mt-2 text-sm text-muted-foreground">
              <Localized
                en="Pre-filled message, no forms"
                hi="मैसेज पहले से तैयार, कोई फ़ॉर्म नहीं"
              />
            </span>
          </TrackedLink>

          <TrackedLink
            event="click_indiamart"
            params={{ source: "contact_primary" }}
            href={business.marketplaceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group surface-card flex flex-col rounded-3xl p-6 transition-transform hover:-translate-y-0.5"
          >
            <span className="grid size-11 place-items-center rounded-full bg-secondary text-secondary-foreground">
              <StoreIcon className="size-5" aria-hidden />
            </span>
            <span className="mt-4 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              IndiaMART
            </span>
            <span className="mt-1 font-display text-2xl">
              <Localized en="Marketplace listing" hi="मार्केटप्लेस listing" />
            </span>
            <span className="mt-2 text-sm text-muted-foreground">
              <Localized
                en="Buy through the IndiaMART seller page"
                hi="IndiaMART सेलर page से ख़रीदें"
              />
            </span>
            <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-primary">
              <Localized en="Open listing" hi="listing खोलें" />
              <ArrowRightIcon className="size-3.5" aria-hidden />
            </span>
          </TrackedLink>
        </div>
      </div>

      <div className="container-page grid gap-8 py-12 lg:grid-cols-[0.95fr_1.05fr] lg:gap-14">
        <section aria-labelledby="callback-heading">
          <h2 id="callback-heading" className="font-display text-2xl sm:text-3xl">
            <Localized
              en="Leave your number — we call back."
              hi="नंबर छोड़ें — हम call करेंगे।"
            />
          </h2>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
            <Localized
              en="One field, no OTP. Your number goes straight to the shop with a WhatsApp callback request ready to send."
              hi="सिर्फ़ एक field, OTP नहीं। आपका नंबर call-back request के साथ सीधे दुकान तक जाता है।"
            />
          </p>
          <CallBackForm source="contact" className="mt-5 max-w-md" />
        </section>

        <section aria-labelledby="location-heading">
          <h2 id="location-heading" className="font-display text-2xl sm:text-3xl">
            <Localized en="Location & hours" hi="जगह और समय" />
          </h2>

          <dl className="mt-5 space-y-4 text-sm">
            <div className="flex gap-3">
              <dt className="flex shrink-0 items-start gap-2 font-semibold">
                <MapPinIcon
                  className="mt-0.5 size-4 shrink-0 text-primary"
                  aria-hidden
                />
                <Localized en="Address" hi="पता" />
              </dt>
              <dd className="mt-0.5 text-muted-foreground">
                {hasFullAddress ? (
                  <>
                    {business.address.street}
                    <br />
                    {business.locality}, {business.city}, {business.state}{" "}
                    {business.address.postalCode}
                    <br />
                    {business.country}
                  </>
                ) : (
                  <>
                    {business.locality}, {business.city}, {business.state},{" "}
                    {business.country}
                    <span className="mt-1 block text-xs">
                      Street address, pincode and coordinates are being
                      confirmed by the owner. Call or WhatsApp for directions
                      before visiting.
                    </span>
                  </>
                )}
              </dd>
            </div>

            <div className="flex gap-3">
              <dt className="flex shrink-0 items-start gap-2 font-semibold">
                <ClockIcon
                  className="mt-0.5 size-4 shrink-0 text-primary"
                  aria-hidden
                />
                <Localized en="Hours" hi="समय" />
              </dt>
              <dd className="mt-0.5 text-muted-foreground">
                {business.hours.label}. Order enquiries accepted on call and
                WhatsApp at any time.
              </dd>
            </div>

            <div className="flex gap-3">
              <dt className="flex shrink-0 items-start gap-2 font-semibold">
                <StoreIcon
                  className="mt-0.5 size-4 shrink-0 text-primary"
                  aria-hidden
                />
                Best rates
              </dt>
              <dd className="mt-0.5 text-muted-foreground">
                Negotiated per order — quantity and repeat customers get better prices.
              </dd>
            </div>

            {business.email && (
              <div className="flex gap-3">
                <dt className="font-semibold">Email</dt>
                <dd className="text-muted-foreground">{business.email}</dd>
              </div>
            )}
          </dl>

          {hasGeoCoordinates && business.geo ? (
            <div className="mt-6 space-y-3">
              <div className="overflow-hidden rounded-2xl border border-border/70">
                <iframe
                  title={`Map showing ${business.name} in ${business.locality}, ${business.city}`}
                  src={`https://www.google.com/maps?q=${business.geo.latitude},${business.geo.longitude}&z=15&output=embed`}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="h-64 w-full border-0"
                  allowFullScreen
                />
              </div>
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${business.geo.latitude},${business.geo.longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-primary"
              >
                <NavigationIcon className="size-4" aria-hidden />
                Get directions
              </a>
            </div>
          ) : (
            <div className="mt-6 rounded-2xl border border-dashed border-border bg-background/40 p-4 text-xs leading-relaxed text-muted-foreground">
              <p className="flex items-center gap-2 font-semibold text-foreground">
                <NavigationIcon className="size-4 text-primary" aria-hidden />
                Map and directions are hidden until verified
              </p>
              <p className="mt-1.5">
                The owner has not supplied coordinates yet. Publishing an
                approximate pin would misdirect contractors, so the map stays
                off and the team gives directions on call or WhatsApp.
              </p>
            </div>
          )}

          <div className="mt-6 flex flex-wrap gap-2.5">
            <Link
              href="/products"
              className={cn(
                buttonVariants({ size: "lg" }),
                "h-11 rounded-full px-5 text-sm font-semibold",
              )}
            >
              <Localized en="Browse products" hi="उत्पाद देखें" />
            </Link>
            <TrackedLink
              event="click_whatsapp"
              params={{ source: "contact_directions" }}
              href={generalEnquiryUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-11 items-center rounded-full border border-border bg-card/60 px-5 text-sm font-semibold"
            >
              <Localized en="Ask for directions" hi="रास्ता पूछें" />
            </TrackedLink>
          </div>
        </section>

        <section aria-labelledby="contact-faq-heading">
          <p className="eyebrow">Before you visit</p>
          <h2
            id="contact-faq-heading"
            className="display-lg mt-2 text-[2rem] sm:text-[2.6rem]"
          >
            <Localized
              en="Contact questions, answered."
              hi="संपर्क के सवाल, जवाब के साथ।"
            />
          </h2>
          <FaqAccordion faqs={contactFaqs} className="mt-5" />
        </section>
      </div>

      <CtaBand />
    </>
  );
}
