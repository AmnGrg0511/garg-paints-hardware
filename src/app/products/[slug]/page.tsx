import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowRightIcon,
  CheckCircle2Icon,
  ExternalLinkIcon,
  LayersIcon,
  WrenchIcon,
} from "lucide-react";
import {
  business,
  products,
} from "@/config/businessData";
import {
  getFrequentlyBoughtTogether,
  getProductBySlug,
} from "@/lib/catalog";
import { getPriceTypeLabel, isQuoteOnly } from "@/lib/pricing";
import { buildPageMetadata } from "@/lib/seo";
import {
  breadcrumbSchema,
  faqSchema,
  productSchema,
} from "@/lib/schema";
import { SEO } from "@/components/SEO";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { ProductDetailActions } from "@/components/product/product-detail-actions";
import { ProductGallery } from "@/components/product/product-gallery";
import { ProductCard } from "@/components/product/product-card";
import { FaqAccordion } from "@/components/faq/faq-accordion";
import { BulkCallout } from "@/components/sections/bulk-callout";
import { cn } from "@/lib/utils";
import { Localized } from "@/i18n/Localized";

export const dynamicParams = false;

const guides: Record<
  string,
  { audience: readonly string[]; usage: readonly string[]; source?: string }
> = {
  "gph-01": {
    audience: [
      "Paint formulators mixing water-based architectural coatings",
      "Painters working with emulsions, distempers and texture finishes",
      "Dealers stocking binders for local contractor crews",
    ],
    usage: [
      "Use as the binder component in an interior or exterior emulsion, distemper or texture formulation.",
      "Confirm the addition ratio for your specific formulation with your technical supervisor before mixing.",
      "Keep the container closed and store it in a cool, dry place; check the manufacturer's handling guidance.",
    ],
    source: "https://www.pidilite.com/",
  },
  "gph-02": {
    audience: [
      "Contractors finishing exterior facades and feature walls",
      "Painters applying decorative plaster-finish textures",
      "Builders comparing shades for a project elevation",
    ],
    usage: [
      "Choose the shade against a physical reference before ordering a full bag quantity.",
      "Apply as a decorative granule texture for exterior facades or plaster-finish wall texturing.",
      "Confirm surface preparation and coat sequence with your applicator; pack weight is confirmed on enquiry.",
    ],
  },
  "gph-03": {
    audience: [
      "Plasterers applying and flattening texture coats",
      "Painters scraping and finishing wall surfaces",
      "Site supervisors equipping a contractor crew",
    ],
    usage: [
      "Use the stainless steel blade for texture application, cement flattening and wall scraping.",
      "Keep the blade clean and dry after use to protect the finish.",
      "Confirm the exact blade and handle requirement on WhatsApp if your team has a specification.",
    ],
  },
  "gph-04": {
    audience: [
      "Wall putty and distemper formulators",
      "Construction chemical traders buying in bulk",
      "Contractors preparing smooth interior finishes",
    ],
    usage: [
      "White CMC is used as a thickener in wall putty, interior distempers and smooth texture formulation.",
      "Yellow CMC is the technical industrial grade used for viscosity control and water retention.",
      "Confirm the dosage for your formulation and request the available pack size on WhatsApp.",
    ],
  },
  "gph-05": {
    audience: [
      "Applicators creating designer and sparkle finishes",
      "Roof coating contractors adding a decorative flake",
      "Painters mixing feature-wall textures",
    ],
    usage: [
      "Blend the glitter and metallic flakes into wall texture, roof coating or designer emulsion.",
      "Test a small panel first to judge flake density and the final sparkle under site lighting.",
      "Pack sizes are quoted on request; share the quantity needed for an accurate rate.",
    ],
  },
};

export function generateStaticParams() {
  return products.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) return {};

  return buildPageMetadata({
    title: `${product.name} in Ballabgarh, Faridabad`,
    description: `${product.description} Buy from Garg Paints & Hardware in ${business.locality}, ${business.city} with a GST invoice and dealer pricing on request.`,
    path: `/products/${product.slug}`,
    image: product.image,
  });
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) notFound();

  const related = getFrequentlyBoughtTogether(product);
  const priceType = getPriceTypeLabel(product);
  const quoteOnly = isQuoteOnly(product);
  const guide = guides[product.id];

  return (
    <>
      <SEO
        data={[
          productSchema(product),
          faqSchema(product.faqs),
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Products", path: "/products" },
            { name: product.name },
          ]),
        ]}
      />

      <div className="container-page pb-8 pt-6 sm:pt-10">
        <Breadcrumbs
          items={[
            { name: "Home", path: "/" },
            { name: "Products", path: "/products" },
            { name: product.name },
          ]}
        />

        <div className="mt-6 grid gap-8 lg:grid-cols-[1.02fr_0.98fr] lg:gap-12">
          <div>
            <ProductGallery product={product} />

            <dl className="mt-4 grid grid-cols-2 gap-2 text-xs">
              <div className="rounded-xl border border-border bg-card p-3">
                <dt className="text-muted-foreground">Packing</dt>
                <dd className="mt-0.5 font-semibold">{product.packaging}</dd>
              </div>
              <div className="rounded-xl border border-border bg-card p-3">
                <dt className="text-muted-foreground">GST invoice</dt>
                <dd className="mt-0.5 font-semibold">Yes, on confirmation</dd>
              </div>
              <div className="rounded-xl border border-border bg-card p-3">
                <dt className="text-muted-foreground">HSN code</dt>
                <dd className="mt-0.5 font-semibold">{product.hsnCode}</dd>
              </div>
              <div className="rounded-xl border border-border bg-card p-3">
                <dt className="text-muted-foreground">Price type</dt>
                <dd className="mt-0.5 font-semibold">{priceType}</dd>
              </div>
            </dl>
          </div>

          <div>
            <p className="eyebrow">{product.category}</p>
            <h1 className="display-lg mt-2">{product.name}</h1>

            <div className="mt-5 rounded-2xl border border-border bg-secondary/60 p-4 sm:p-5">
              <p className="text-[0.68rem] font-bold uppercase tracking-[0.14em] text-primary">
                Quick answer
              </p>
              <p className="mt-1.5 text-[0.95rem] leading-relaxed text-foreground/90">
                {product.summary}
              </p>
            </div>

            <ProductDetailActions product={product} />

            <div className="mt-4 flex flex-wrap items-center gap-2 text-[0.7rem] text-muted-foreground">
              <span className="inline-flex items-center gap-1 rounded-full border border-border/60 px-2.5 py-1">
                <CheckCircle2Icon className="size-3 text-primary" aria-hidden />
                <Localized
                  en="GST-registered seller"
                  hi="GST-registered seller"
                />
              </span>
              <span className="inline-flex items-center gap-1 rounded-full border border-border/60 px-2.5 py-1">
                <CheckCircle2Icon className="size-3 text-primary" aria-hidden />
                <Localized
                  en="Order 24x7 on WhatsApp"
                  hi="WhatsApp पर 24x7 ऑर्डर"
                />
              </span>
              <span className="inline-flex items-center gap-1 rounded-full border border-border/60 px-2.5 py-1">
                <CheckCircle2Icon className="size-3 text-primary" aria-hidden />
                <Localized
                  en="No online payment"
                  hi="ऑनलाइन payment नहीं"
                />
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="container-page grid gap-10 py-8 lg:grid-cols-[1.15fr_0.85fr] lg:gap-14">
        <section aria-labelledby="specs-heading">
          <h2 id="specs-heading" className="font-display text-2xl sm:text-3xl">
            <Localized en="Specifications" hi="विशेषताएँ" />
          </h2>
          <div className="mt-4 overflow-hidden rounded-2xl border border-border/70">
            <table className="w-full border-collapse text-left text-sm">
              <caption className="sr-only">
                Specifications for {product.name}
              </caption>
              <tbody>
                {[
                  ["Product", product.name],
                  ["Category", product.category],
                  ["Grade", product.grade],
                  ["Packaging", product.packaging],
                  ["Use cases", product.useCases.join(", ")],
                  ["HSN code", `${product.hsnCode} (as provided by the owner)`],
                  ["Price type", priceType],
                  ["GST invoice", "Yes · shared on confirmation"],
                ].map(([label, value], index) => (
                  <tr
                    key={label}
                    className={cn(
                      "border-b border-border/60 last:border-0",
                      index % 2 === 0 ? "bg-card/40" : "bg-background/30",
                    )}
                  >
                    <th
                      scope="row"
                      className="w-36 px-4 py-3 align-top text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground sm:w-44"
                    >
                      {label}
                    </th>
                    <td className="px-4 py-3 align-top text-foreground/90">
                      {value}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-2 text-[0.7rem] leading-relaxed text-muted-foreground">
            HSN codes are shown as provided by the owner and still need CA
            confirmation. No GST rate is stated on this site; the final
            classification and invoice are shared on confirmation.
          </p>
        </section>

        <section aria-labelledby="buy-heading" className="space-y-4">
          <h2 id="buy-heading" className="font-display text-2xl sm:text-3xl">
            <Localized en="How to buy" hi="कैसे ख़रीदें" />
          </h2>
          <div className="surface-card rounded-2xl p-5">
            <ol className="space-y-4">
              {[
                quoteOnly
                  ? "Send the variant and quantity on WhatsApp for a bulk quote."
                  : "Choose a variant if applicable, set the quantity and add it to the order list.",
                "Continue to IndiaMART or send the pre-filled WhatsApp message.",
                "The team confirms availability and shares the final GST invoice.",
              ].map((step, index) => (
                <li key={step} className="flex gap-3">
                  <span className="grid size-7 shrink-0 place-items-center rounded-full bg-primary/10 font-display text-sm font-semibold text-primary">
                    {index + 1}
                  </span>
                  <span className="text-sm leading-relaxed text-muted-foreground">
                    {step}
                  </span>
                </li>
              ))}
            </ol>
            <Link
              href="/checkout"
              className="mt-5 inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-primary"
            >
              <Localized en="Review your order list" hi="ऑर्डर लिस्ट देखें" />
              <ArrowRightIcon className="size-4" aria-hidden />
            </Link>
          </div>
          <div className="rounded-2xl border border-border/70 bg-background/40 p-4 text-xs leading-relaxed text-muted-foreground">
            <p className="font-semibold text-foreground">
              <Localized
                en="Bulk or dealer pricing"
                hi="बल्क या डीलर रेट"
              />
            </p>
            <p className="mt-1">
              <Localized
                en="Share the project quantity for a contractor rate. The final GST invoice is confirmed directly by the business."
                hi="प्रोजेक्ट की मात्रा भेजें — contractor रेट के लिए। फ़ाइनल GST invoice सीधे business कन्फ़र्म करेगा।"
              />
            </p>
          </div>
          {guide?.source && (
            <p className="text-[0.7rem] leading-relaxed text-muted-foreground">
              Manufacturer reference:{" "}
              <a
                href={guide.source}
                target="_blank"
                rel="noopener noreferrer"
                className="text-link inline-flex items-center gap-1 font-medium text-primary"
              >
                Pidilite
                <ExternalLinkIcon className="size-3" aria-hidden />
              </a>{" "}
              — verify current technical data with the manufacturer before use.
            </p>
          )}
        </section>
      </div>

      {guide && (
        <section className="container-page pb-8" aria-labelledby="use-heading">
          <h2 id="use-heading" className="font-display text-2xl sm:text-3xl">
            <Localized
              en="Who uses it, and how"
              hi="कौन इस्तेमाल करता है, कैसे"
            />
          </h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="surface-card rounded-2xl p-5">
              <p className="flex items-center gap-2 font-semibold">
                <LayersIcon className="size-4 text-primary" aria-hidden />
                <Localized en="Who uses this" hi="कौन इस्तेमाल करता है" />
              </p>
              <ul className="mt-3 space-y-2.5">
                {guide.audience.map((item) => (
                  <li
                    key={item}
                    className="flex gap-2 text-sm leading-relaxed text-muted-foreground"
                  >
                    <span className="mt-2 size-1 shrink-0 rounded-full bg-primary" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="surface-card rounded-2xl p-5">
              <p className="flex items-center gap-2 font-semibold">
                <WrenchIcon className="size-4 text-primary" aria-hidden />
                <Localized en="How to use it" hi="कैसे इस्तेमाल करें" />
              </p>
              <ol className="mt-3 space-y-2.5">
                {guide.usage.map((item, index) => (
                  <li
                    key={item}
                    className="flex gap-2 text-sm leading-relaxed text-muted-foreground"
                  >
                    <span className="grid size-5 shrink-0 place-items-center rounded-full bg-secondary text-[0.65rem] font-bold text-secondary-foreground">
                      {index + 1}
                    </span>
                    {item}
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>
      )}

      <section
        className="container-page py-10"
        aria-labelledby="product-faq-heading"
      >
        <div className="grid gap-8 lg:grid-cols-[0.7fr_1.3fr] lg:gap-14">
          <div>
            <p className="eyebrow">Product questions</p>
            <h2
              id="product-faq-heading"
              className="display-lg mt-2 text-[2rem] sm:text-[2.6rem]"
            >
              <Localized
                en="Answers before you order."
                hi="ऑर्डर से पहले जवाब।"
              />
            </h2>
          </div>
          <FaqAccordion faqs={product.faqs} />
        </div>
      </section>

      {related.length > 0 && (
        <section
          className="container-page py-10"
          aria-labelledby="related-heading"
        >
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="eyebrow">Often ordered together</p>
              <h2 id="related-heading" className="display-lg mt-2 text-[2rem] sm:text-[2.6rem]">
                <Localized
                  en="Frequently bought together"
                  hi="अक्सर साथ ख़रीदे जाते हैं"
                />
              </h2>
            </div>
            <Link
              href="/products"
              className="inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-primary"
            >
              <Localized en="All products" hi="सभी उत्पाद" />
              <ArrowRightIcon className="size-4" aria-hidden />
            </Link>
          </div>
          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            {related.map((item) => (
              <ProductCard key={item.id} product={item} compact />
            ))}
          </div>
        </section>
      )}

      <BulkCallout />
    </>
  );
}
