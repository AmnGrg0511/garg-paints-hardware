import { products } from "@/config/businessData";
import { getCatalogueCards } from "@/lib/catalog";
import { buildPageMetadata } from "@/lib/seo";
import { breadcrumbSchema, productListSchema } from "@/lib/schema";
import { SEO } from "@/components/SEO";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { ProductsExplorer } from "@/components/products/products-explorer";
import { Localized } from "@/i18n/Localized";
import { business } from "@/config/businessData";

export const metadata = buildPageMetadata({
  title: "Products — Binders, Wall Textures, CMC, Chamki & Tools",
  description:
    "Browse the Garg Paints & Hardware catalogue: Pidicryl 126 M binder, white/red/peach/green/black madrasi dana, CMC powder, chamki glitter and stainless steel plastering trowels in Ballabgarh, Faridabad.",
  path: "/products",
});

export default function ProductsPage() {
  return (
    <>
      <SEO
        data={[
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Products" },
          ]),
          productListSchema(products),
        ]}
      />
      <div className="container-page pb-16 pt-6 sm:pt-10">
        <Breadcrumbs
          items={[{ name: "Home", path: "/" }, { name: "Products" }]}
        />

        <header className="mt-6 max-w-3xl">
          <p className="eyebrow">The catalogue</p>
          <h1 className="display-lg mt-2">
            <Localized
              en="Five supply lines for a finished wall."
              hi="Finished wall ke liye paanch supply lines."
            />
          </h1>
          <p className="mt-4 text-[0.98rem] leading-relaxed text-muted-foreground sm:text-base">
            Garg Paints &amp; Hardware supplies acrylic binders, madrasi dana
            wall textures, CMC powder, chamki glitter additive and stainless
            steel plastering trowels in {business.locality}, {business.city}.
            Priced items can be ordered from the list; quote-only items open a
            WhatsApp enquiry. All orders are confirmed with a GST invoice.
          </p>
          <p className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
            <span>GST invoice on confirmed orders</span>
            <span aria-hidden>·</span>
            <span>{business.hours.label}</span>
            <span aria-hidden>·</span>
            <span>Dealer / contractor pricing on request</span>
          </p>
        </header>

        <div className="mt-8">
          <h2 className="font-display text-2xl tracking-tight sm:text-3xl">
            <Localized en="All five products" hi="Saare paanch products" />
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            <Localized
              en="Filter by category or price type, or search — every line shows its honest price state."
              hi="Kategorie ya price type se filter karein, ya search karein — har line apna sachcha price state dikhata hai."
            />
          </p>
          <ProductsExplorer initialProducts={getCatalogueCards()} />
        </div>
      </div>
    </>
  );
}
