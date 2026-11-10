import {
  SITE_URL,
  business,
  hasFullAddress,
  hasGeoCoordinates,
  type Product,
} from "@/config/businessData";
import { parsePrice } from "@/lib/pricing";

export type JsonLd = Record<string, unknown>;
type JsonLdValue = JsonLd | readonly JsonLd[];
export type JsonLdInput = JsonLdValue | readonly JsonLdValue[];

const STORE_ID = `${SITE_URL}/#store`;
const WEBSITE_ID = `${SITE_URL}/#website`;

function absoluteUrl(path: string): string {
  return new URL(path, SITE_URL).toString();
}

export function storeSchema(): JsonLd {
  const address: JsonLd = {
    "@type": "PostalAddress",
    addressLocality: business.locality,
    addressRegion: business.state,
    addressCountry: business.countryCode,
  };

  if (hasFullAddress) {
    address.streetAddress = business.address.street;
    address.postalCode = business.address.postalCode;
  }

  const schema: JsonLd = {
    "@context": "https://schema.org",
    "@type": "HardwareStore",
    "@id": STORE_ID,
    name: business.name,
    description: business.description,
    url: SITE_URL,
    foundingDate: String(business.established),
    founder: {
      "@type": "Person",
      name: business.proprietor.displayName,
    },
    telephone: business.phoneE164,
    address,
    areaServed: business.areaServed.map((area) => ({
      "@type": "City",
      name: area,
    })),
    sameAs: [business.marketplaceUrl],
    openingHoursSpecification: business.hours.days.map((day) => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: `https://schema.org/${day}`,
      opens: business.hours.opens,
      closes: business.hours.closes,
    })),
  };

  if (business.legalName) schema.legalName = business.legalName;
  if (business.email) schema.email = business.email;
  if (hasGeoCoordinates && business.geo) {
    schema.geo = {
      "@type": "GeoCoordinates",
      latitude: business.geo.latitude,
      longitude: business.geo.longitude,
    };
  }

  return schema;
}

export function websiteSchema(): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    name: business.name,
    url: SITE_URL,
    inLanguage: ["en-IN", "hi-IN"],
    publisher: { "@id": STORE_ID },
  };
}

export function breadcrumbSchema(
  items: readonly { name: string; path?: string }[],
): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      ...(item.path ? { item: absoluteUrl(item.path) } : {}),
    })),
  };
}

export function faqSchema(
  faqs: readonly { question: string; answer: string }[],
): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

export function productListSchema(products: readonly Product[]): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Garg Paints & Hardware catalogue",
    numberOfItems: products.length,
    itemListElement: products.map((product, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: product.name,
      url: absoluteUrl(`/products/${product.slug}`),
    })),
  };
}

function offerFor(product: Product, priceDisplay: string): JsonLd | null {
  const price = parsePrice(priceDisplay);
  if (price.onRequest || price.amount === undefined) return null;

  return {
    "@type": "Offer",
    price: price.amount,
    priceCurrency: "INR",
    url: absoluteUrl(`/products/${product.slug}`),
    seller: { "@id": STORE_ID },
  };
}

function productBase(product: Product, variantLabel?: string): JsonLd {
  const name = variantLabel
    ? `${product.name} — ${variantLabel}`
    : product.name;

  const schema: JsonLd = {
    "@type": "Product",
    name,
    description: product.description,
    category: product.category,
    sku: variantLabel
      ? `${product.id}-${variantLabel.toLowerCase().replace(/\s+/g, "-")}`
      : product.id,
    image: absoluteUrl(product.image),
    url: absoluteUrl(`/products/${product.slug}`),
    seller: { "@id": STORE_ID },
  };

  if (product.brand) {
    schema.brand = { "@type": "Brand", name: product.brand };
  }

  return schema;
}

export function productSchema(product: Product): JsonLd {
  if (product.kind === "simple") {
    const schema = productBase(product);
    const offer = offerFor(product, product.price);
    if (offer) schema.offers = offer;
    return { "@context": "https://schema.org", ...schema };
  }

  const variants = product.variants.map((variant) => {
    const schema = productBase(product, variant.label);
    const offer = offerFor(product, variant.price);
    if (offer) schema.offers = offer;
    if (variant.description) schema.description = variant.description;
    return schema;
  });

  return {
    "@context": "https://schema.org",
    "@type": "ProductGroup",
    name: product.name,
    description: product.description,
    productGroupID: product.id,
    category: product.category,
    brand: product.brand
      ? { "@type": "Brand", name: product.brand }
      : undefined,
    image: absoluteUrl(product.image),
    url: absoluteUrl(`/products/${product.slug}`),
    variesBy: "https://schema.org/color",
    hasVariant: variants,
    seller: { "@id": STORE_ID },
  };
}

/** Serialises JSON-LD safely for inline script tags. */
export function serializeJsonLd(data: JsonLdInput): string {
  return JSON.stringify(data)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
}
