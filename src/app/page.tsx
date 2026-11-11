import Link from "next/link";
import { ArrowRightIcon } from "lucide-react";
import { globalFaqs } from "@/config/content";
import { getFeaturedProducts } from "@/lib/catalog";
import { buildPageMetadata } from "@/lib/seo";
import { faqSchema } from "@/lib/schema";
import { SEO } from "@/components/SEO";
import { Hero } from "@/components/sections/hero";
import { CategoryBento } from "@/components/sections/category-bento";
import { ShadeStrip } from "@/components/sections/shade-strip";
import { BulkCallout } from "@/components/sections/bulk-callout";
import { OrderSteps } from "@/components/sections/order-steps";
import { CtaBand } from "@/components/sections/cta-band";
import { SectionHeading } from "@/components/sections/section-heading";
import { ProductCard } from "@/components/product/product-card";
import { FaqAccordion } from "@/components/faq/faq-accordion";
import { Localized } from "@/i18n/Localized";

export const metadata = buildPageMetadata({
  title: "Paint Additives, Madrasi Dana & Plastering Tools in Ballabgarh",
  description:
    "Buy Pidicryl 126 M binder, madrasi dana wall texture, CMC powder, chamki glitter and stainless steel plastering trowels in Ballabgarh, Faridabad. GST invoice, dealer pricing, enquiries 24x7.",
  path: "/",
});

const homeFaqs = globalFaqs.slice(0, 4);

export default function HomePage() {
  const featured = getFeaturedProducts();

  return (
    <>
      <SEO data={faqSchema(homeFaqs)} />
      <Hero />
      <CategoryBento />
      <ShadeStrip />

      <section
        className="container-page py-12 sm:py-16"
        aria-labelledby="featured-heading"
      >
        <SectionHeading
          id="featured-heading"
          eyebrow={{ en: "Popular right now", hi: "अभी सबसे ज़्यादा ऑर्डर" }}
          title={{ en: "What contractors order most.", hi: "ठेकेदार सबसे ज़्यादा क्या ऑर्डर करते हैं।" }}
          body={{ en: "Real catalogue items with honest price states. Add priced items to your order list, or request a quote for bulk and pack-size items.", hi: "असली कैटलॉग items ईमानदार रेट स्थिति के साथ। लिस्टेड-रेट items लिस्ट में जोड़ें, या बल्क और pack size के लिए रेट पूछें।" }}
          href="/products"
          linkLabel={{ en: "View all products", hi: "सभी उत्पाद देखें" }}
        />
        <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {featured.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        <dl className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { value: "05", label: "Catalogue lines" },
            { value: "05", label: "Madrasi dana shades" },
            { value: "02", label: "CMC grades" },
            { value: "24x7", label: "Call & WhatsApp" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl border border-border bg-card px-4 py-3"
            >
              <dt className="text-[0.62rem] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                {stat.label}
              </dt>
              <dd className="mt-1 text-2xl font-extrabold tracking-tight">
                {stat.value}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <BulkCallout />

      <OrderSteps />

      <section
        className="container-page grid gap-8 pb-8 pt-4 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16 lg:pt-8"
        aria-labelledby="faq-heading"
      >
        <div className="lg:sticky lg:top-28 lg:self-start">
          <p className="eyebrow">Questions</p>
          <h2 id="faq-heading" className="display-lg mt-2">
            <Localized
              en="Direct answers, before you call."
              hi="call से पहले सीधे जवाब।"
            />
          </h2>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
            <Localized
              en="Ordering, GST invoices and quote-only items — the details contractors ask about most."
              hi="ऑर्डरिंग, GST invoice और रेट-पूछने वाले items — ठेकेदारों के आम सवाल।"
            />
          </p>
          <Link
            href="/faq"
            className="mt-4 inline-flex min-h-11 items-center gap-1.5 text-sm font-bold text-primary"
          >
            <Localized en="All questions" hi="सभी सवाल" />
            <ArrowRightIcon className="size-4" aria-hidden />
          </Link>
        </div>
        <FaqAccordion faqs={homeFaqs} />
      </section>

      <CtaBand />
    </>
  );
}
