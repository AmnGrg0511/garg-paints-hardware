import Link from "next/link";
import { ArrowRightIcon } from "lucide-react";
import { globalFaqs } from "@/config/content";
import { products } from "@/config/effective-catalog";
import { buildPageMetadata } from "@/lib/seo";
import { breadcrumbSchema, faqSchema } from "@/lib/schema";
import { SEO } from "@/components/SEO";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { FaqAccordion } from "@/components/faq/faq-accordion";
import { CtaBand } from "@/components/sections/cta-band";
import { Localized } from "@/i18n/Localized";

export const metadata = buildPageMetadata({
  title: "FAQ — Ordering, GST Invoice and Products",
  description:
    "Answers about ordering on WhatsApp or IndiaMART, GST invoices, quote-only products, wholesale pricing and visiting Garg Paints & Hardware in Ballabgarh, Faridabad.",
  path: "/faq",
});

const productFaqs = [
  products.find((product) => product.id === "gph-04")?.faqs[1],
  products.find((product) => product.id === "gph-02")?.faqs[0],
  products.find((product) => product.id === "gph-05")?.faqs[0],
  products.find((product) => product.id === "gph-03")?.faqs[4],
].filter(
  (faq): faq is { question: string; answer: string } => Boolean(faq),
);

const allFaqs = [...globalFaqs, ...productFaqs];

export default function FaqPage() {
  return (
    <>
      <SEO
        data={[
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "FAQ" },
          ]),
          faqSchema(allFaqs),
        ]}
      />

      <div className="container-page pt-6 sm:pt-10">
        <Breadcrumbs items={[{ name: "Home", path: "/" }, { name: "FAQ" }]} />

        <header className="mt-6 max-w-3xl">
          <p className="eyebrow">Questions & answers</p>
          <h1 className="display-lg mt-2">
            <Localized
              en="Everything a contractor asks before ordering."
              hi="ऑर्डर से पहले ठेकेदारों के आम सवाल।"
            />
          </h1>
          <p className="mt-4 text-[1rem] leading-relaxed text-muted-foreground sm:text-lg">
            Garg Paints &amp; Hardware accepts order enquiries 24x7 on call and
            WhatsApp at +91 98992 84391, and through the IndiaMART listing.
            Listed prices appear on product cards; quote-only items never carry
            a guessed price. Every confirmed order receives a GST invoice under
            GST invoice on confirmed orders. This page does not state any GST rate.
          </p>
        </header>

        <div className="mt-10 grid gap-10 lg:grid-cols-[0.62fr_1.38fr] lg:gap-16">
          <aside className="lg:sticky lg:top-28 lg:self-start">
            <div className="surface-card rounded-2xl p-5">
              <p className="eyebrow">On this page</p>
              <ul className="mt-3 space-y-2 text-sm">
                <li>
                  <a href="#ordering" className="text-muted-foreground hover:text-foreground">
                    Ordering &amp; GST
                  </a>
                </li>
                <li>
                  <a href="#products" className="text-muted-foreground hover:text-foreground">
                    Product questions
                  </a>
                </li>
                <li>
                  <Link href="/contact" className="text-muted-foreground hover:text-foreground">
                    Contact the shop
                  </Link>
                </li>
              </ul>
              <div className="hairline my-4" />
              <p className="text-xs leading-relaxed text-muted-foreground">
                Still unsure? Send the product name, variant and quantity on
                WhatsApp. The team will confirm pack sizes and the current
                rate.
              </p>
              <Link
                href="/products"
                className="mt-3 inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-primary"
              >
                Browse the catalogue
                <ArrowRightIcon className="size-4" aria-hidden />
              </Link>
            </div>
          </aside>

          <div className="space-y-12">
            <section id="ordering" aria-labelledby="ordering-heading">
              <h2 id="ordering-heading" className="font-display text-2xl sm:text-3xl">
                <Localized
                  en="Ordering, pricing and GST"
                  hi="ऑर्डरिंग, रेट और GST"
                />
              </h2>
              <FaqAccordion faqs={globalFaqs} className="mt-4" />
            </section>

            <section id="products" aria-labelledby="products-faq-heading">
              <h2
                id="products-faq-heading"
                className="font-display text-2xl sm:text-3xl"
              >
                <Localized
                  en="Product questions"
                  hi="उत्पाद के सवाल"
                />
              </h2>
              <FaqAccordion faqs={productFaqs} className="mt-4" />
              <div className="mt-4 flex flex-wrap gap-2">
                {products.map((product) => (
                  <Link
                    key={product.id}
                    href={`/products/${product.slug}`}
                    className="inline-flex min-h-9 items-center rounded-full border border-border/70 bg-card/50 px-3 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {product.name.replace(" by Pidilite", "")}
                  </Link>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>

      <CtaBand />
    </>
  );
}
