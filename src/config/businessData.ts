/**
 * Single source of truth for business details and the product catalogue.
 *
 * Rules for this file:
 * - Never invent an address, pincode, email, coordinate or legal name.
 * - `null` means "not provided yet". UI that depends on a null value must hide.
 * - HSN codes are the owner-provided best matches and still need CA verification.
 * - Do not add GST rates to this file or anywhere in the UI.
 */

/** TODO owner: set NEXT_PUBLIC_SITE_URL to the final production domain before launch. */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://gargpaintshardware.example";

export const WHATSAPP_NUMBER = "919899284391";

export type BusinessData = {
  name: string;
  legalName: string | null;
  proprietor: {
    displayName: string;
    fullName: string | null;
  };
  established: number;
  gstin: string | null;
  locality: string;
  city: string;
  state: string;
  country: string;
  countryCode: string;
  phoneDisplay: string;
  phoneE164: string;
  whatsappNumber: string;
  whatsappConfirmed: boolean;
  hours: {
    label: string;
    opens: string;
    closes: string;
    days: readonly string[];
  };
  marketplaceUrl: string;
  address: {
    street: string | null;
    postalCode: string | null;
  };
  geo: {
    latitude: number;
    longitude: number;
  } | null;
  email: string | null;
  areaServed: readonly string[];
  description: string;
};

export const business: BusinessData = {
  name: "Garg Paints & Hardware",
  // TODO owner: confirm exact legal/trade name as printed on the GST certificate.
  legalName: null,
  proprietor: {
    displayName: "Mahesh",
    // TODO owner: confirm full name for display, for example "Mahesh Garg".
    fullName: null,
  },
  established: 2017,
  // The GST number is intentionally absent from the entire site (owner
  // request). Re-add here only if the owner later asks for it on invoices.
  gstin: null as string | null,
  locality: "Ballabgarh",
  city: "Faridabad",
  state: "Haryana",
  country: "India",
  countryCode: "IN",
  phoneDisplay: "+91 98992 84391",
  phoneE164: "+919899284391",
  whatsappNumber: WHATSAPP_NUMBER,
  // TODO owner: confirm this number is active on WhatsApp.
  whatsappConfirmed: false,
  hours: {
    label: "Open 24x7, all seven days",
    opens: "00:00",
    closes: "23:59",
    days: [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ],
  },
  marketplaceUrl: "https://www.indiamart.com/gargpaintshardware/",
  address: {
    // TODO owner: provide the street address exactly as it should appear in NAP listings.
    street: null,
    // TODO owner: provide the postal code together with the street address.
    postalCode: null,
  },
  // TODO owner: provide verified coordinates. The map and directions stay hidden until then.
  geo: null,
  // TODO owner: provide a monitored business email.
  email: null,
  areaServed: ["Ballabgarh", "Faridabad", "Delhi NCR"],
  description:
    "Wholesaler and retailer of paint additives, binders, wall textures and plastering tools in Ballabgarh, Faridabad, Haryana. Supplying contractors, painters, dealers and builders since 2017.",
};

/** True only when every field the NAP block needs has been supplied. */
export const hasFullAddress = Boolean(
  business.address.street && business.address.postalCode,
);

export const hasGeoCoordinates = business.geo !== null;

export type ProductVariant = {
  label: string;
  price: string;
  description?: string;
  /** Per-variant art so the bag colour can follow the selected shade. */
  image?: string;
  /** Soft backdrop tint shown around the photo for the selected shade. */
  tint?: string;
};

type ProductBase = {
  id: string;
  slug: string;
  name: string;
  category: string;
  description: string;
  /** Only set when the manufacturer/brand is known from supplied data. */
  brand: string | null;
  /** 40–60 word answer-first summary used at the top of the product page and in metadata. */
  summary: string;
  /** TODO verify with CA before showing on invoices. */
  hsnCode: string;
  cta: string;
  image: string;
  imageAlt: string;
  tone: "terracotta" | "peach" | "slate" | "gold" | "cream";
  grade: string;
  packaging: string;
  /** How this product is ordered: unit, bulk steps and sensible maximum. */
  quantity: {
    unit: "Bag" | "Kg" | "Drum" | "Piece";
    steps: readonly number[];
    max: number;
    note?: string;
  };
  useCases: readonly string[];
  faqs: readonly { question: string; answer: string }[];
};

export type SimpleProduct = ProductBase & {
  kind: "simple";
  price: string;
  variants?: never;
};

export type VariantProduct = ProductBase & {
  kind: "variant";
  variants: readonly ProductVariant[];
  price?: never;
};

export type Product = SimpleProduct | VariantProduct;

export const products: readonly Product[] = [
  {
    kind: "simple",
    id: "gph-01",
    slug: "pidicryl-126-m",
    name: "Pidicryl 126 M by Pidilite",
    category: "Acrylic Binders & Emulsions",
    brand: "Pidilite",
    // 50 L / 50 kg drums at the owner's listed ₹130/Kg → ₹6,500 per drum.
    // TODO owner: confirm the actual per-drum rate if it differs.
    price: "₹ 6,500/Drum",
    // TODO verify with CA before showing on invoices.
    hsnCode: "3209",
    description:
      "Fine particle size styrene acrylic copolymer emulsion used as a binder for interior and exterior emulsion paints, distempers and texture finishes.",
    summary:
      "Pidicryl 126 M is a fine-particle styrene acrylic copolymer emulsion from Pidilite, used as a binder in interior and exterior emulsions, distempers and texture finishes. Garg Paints & Hardware supplies it by the kilogram in Ballabgarh, Faridabad — rates are negotiable on quantity, with 24x7 call or WhatsApp ordering.",
    cta: "Buy on IndiaMART / WhatsApp Enquiry",
    image: "/products/pidicryl-126-m.webp?v=8",
    imageAlt:
      "White industrial drum of Pidicryl 126 M styrene acrylic emulsion with a blue product label",
    tone: "cream",
    grade: "Pidicryl 126 M — manufacturer grade",
    packaging: "50 L / 50 kg drums · billed per kilogram",
    quantity: {
      unit: "Drum",
      steps: [1, 10],
      max: 99,
      note: "Supplied in returnable-free 50 L / 50 kg drums. Bulk sites usually take 2–10 drums; drum counts are confirmed before dispatch.",
    },
    useCases: [
      "Interior and exterior emulsion paints",
      "Distempers",
      "Texture finishes",
      "Binder for architectural coatings",
    ],
    faqs: [
      {
        question: "Where can I buy Pidicryl 126 M in Ballabgarh, Faridabad?",
        answer:
          "Garg Paints & Hardware supplies Pidicryl 126 M by the kilogram from Ballabgarh, Faridabad. Call +91 98992 84391 or send a WhatsApp message to confirm current stock and place an order.",
      },
      {
        question: "What is Pidicryl 126 M used for?",
        answer:
          "It is a styrene acrylic copolymer emulsion used as a binder in interior and exterior emulsion paints, distempers and texture finishes. It is suitable for formulators and painters working with water-based architectural coatings.",
      },
      {
        question: "Can I get a better rate for bulk quantities?",
        answer:
          "Yes. Rates are negotiated per order — larger quantities and repeat customers get better prices. Share your quantity on WhatsApp or call for your best rate.",
      },
      {
        question: "Is the listed price final?",
        answer:
          "The listed figure is a starting point, not a final price. Your rate depends on your quantity — repeat customers get better prices. Confirm yours on call or WhatsApp.",
      },
      {
        question: "How do I confirm pack size and minimum quantity?",
        answer:
          "Share the quantity you need on WhatsApp at +91 98992 84391. The team will confirm available packing and the order details directly with you.",
      },
      {
        question: "Can I place a bulk order for a project?",
        answer:
          "Yes. Send the required quantity and project location on WhatsApp or through the IndiaMART listing. Dealer and contractor pricing is available on request.",
      },
    ],
  },
  {
    kind: "variant",
    id: "gph-02",
    slug: "madrasi-dana-wall-texture",
    name: "Madrasi Dana Premium Wall Textures",
    category: "Wall Textures & Aggregates",
    brand: null,
    variants: [
      {
        label: "White Madrasi Dana",
        price: "₹ 150/Bag",
        image: "/products/madrasi-dana-white.webp?v=8",
        tint: "#F2ECDD",
      },
      {
        label: "Red Madrasi Dana",
        price: "₹ 200/Bag",
        image: "/products/madrasi-dana-red.webp?v=8",
        tint: "#A84328",
      },
      {
        label: "Yellow Madrasi Dana",
        price: "₹ 280/Bag",
        image: "/products/madrasi-dana-yellow.webp?v=8",
        tint: "#F0A868",
      },
      // TODO owner: confirm rates for the green and black shades.
      {
        label: "Green Madrasi Dana",
        price: "Contact for Price",
        image: "/products/madrasi-dana-green.webp?v=8",
        tint: "#3D6B41",
      },
      {
        label: "Black Madrasi Dana",
        price: "Contact for Price",
        image: "/products/madrasi-dana-black.webp?v=8",
        tint: "#2B2B2E",
      },
    ],
    // TODO verify with CA before showing on invoices.
    hsnCode: "3209",
    description:
      "Decorative granule wall texture (madrasi dana) for exterior facades and plaster-finish wall texturing, available in white, red, yellow, green and black.",
    summary:
      "Madrasi dana is a decorative granule wall texture for exterior facades and plaster-finish wall texturing. Garg Paints & Hardware stocks five shades — white, red, yellow, green and black — in Ballabgarh, Faridabad. Shades with a listed rate can be ordered by the bag; shades shown as contact-for-price are quoted on WhatsApp. Order by call or WhatsApp — your best rate is negotiated on every order.",
    cta: "Buy on IndiaMART / WhatsApp Enquiry",
    image: "/products/madrasi-dana.webp?v=8",
    imageAlt:
      "Woven sacks of madrasi dana wall texture in white, red, yellow, green and black with spilled granules",
    tone: "terracotta",
    grade: "Premium decorative granule",
    packaging: "Bags of approx. 35–40 kg · pack weight confirmed on enquiry",
    quantity: {
      unit: "Bag",
      steps: [1, 10, 100],
      max: 999,
      note: "Site quantities usually run 10–100 bags per shade. One bag weighs approx. 35–40 kg.",
    },
    useCases: [
      "Exterior facades",
      "Plaster-finish wall texturing",
      "Decorative feature walls",
    ],
    faqs: [
      {
        question: "Which madrasi dana colour is best for exterior texture?",
        answer:
          "There is no single best shade. The shade list shows the current status for each shade — a listed bag rate or a quote-on-request tag. Share a reference photo on WhatsApp if you want help matching an existing finish.",
      },
      {
        question: "What is madrasi dana?",
        answer:
          "Madrasi dana is a decorative granule wall texture used for exterior facades and plaster-finish texturing. It is applied as a textured surface finish rather than as a flat paint.",
      },
      {
        question: "Where can I buy madrasi dana in Ballabgarh, Faridabad?",
        answer:
          "Garg Paints & Hardware supplies madrasi dana in Ballabgarh, Faridabad. Add the shades you need to the order list, or call and WhatsApp +91 98992 84391 to confirm availability.",
      },
      {
        question: "Why do some shades show “Contact for Price”?",
        answer:
          "Shades without a published rate are quoted on request — the shade card and the product page always show the current status. Use the “Request Quote” button to ask for the current rate on WhatsApp; quote-only shades cannot be added to the cart at an estimated price.",
      },
      {
        question: "Can I order multiple colours together?",
        answer:
          "Yes. Select a shade, add it to the order list, then repeat for the other colours. Your WhatsApp order message will list every item, shade and quantity together.",
      },
      {
        question: "Are the listed bag rates final?",
        answer:
          "The listed rates are starting points. The final rate depends on your quantity and your relationship with the shop — regular customers get better deals. Confirm yours on call or WhatsApp.",
      },
    ],
  },
  {
    kind: "simple",
    id: "gph-03",
    slug: "stainless-steel-plastering-trowel",
    name: "Stainless Steel Plastering Trowel (Gurmala)",
    category: "Plastering Tools & Hardware",
    brand: null,
    price: "₹ 75/Piece",
    // TODO verify with CA before showing on invoices.
    hsnCode: "8205",
    description:
      "Heavy-duty ergonomic stainless steel gurmala for texture application, cement flattening and wall scraping.",
    summary:
      "The Gurmala is a heavy-duty stainless steel plastering trowel for texture application, cement flattening and wall scraping. Garg Paints & Hardware supplies it per piece in Ballabgarh, Faridabad. Call or WhatsApp to order — rates are negotiable, and dealer and contractor pricing is available on request.",
    cta: "Buy on IndiaMART / WhatsApp Enquiry",
    image: "/products/plastering-trowel.webp?v=8",
    imageAlt:
      "Stainless steel gurmala plastering trowel with a turned wooden handle and a texture dollop",
    tone: "peach",
    grade: "Heavy-duty stainless steel",
    packaging: "Sold per piece",
    quantity: {
      unit: "Piece",
      steps: [1],
      max: 99,
      note: "Crews usually pick up 2–10 pieces at a time.",
    },
    useCases: [
      "Texture application",
      "Cement flattening",
      "Wall scraping",
      "Plaster finishing",
    ],
    faqs: [
      {
        question: "What is a gurmala used for?",
        answer:
          "A gurmala is a plastering trowel used for texture application, cement flattening and wall scraping. This model has a stainless steel blade and an ergonomic handle for repeated site work.",
      },
      {
        question: "Is the trowel blade stainless steel?",
        answer:
          "Yes. The supplied product data describes a heavy-duty ergonomic stainless steel gurmala. Confirm the exact blade thickness and handle type on WhatsApp if your team has a specific requirement.",
      },
      {
        question: "Where can I buy a plastering trowel in Ballabgarh, Faridabad?",
        answer:
          "Garg Paints & Hardware sells the stainless steel gurmala in Ballabgarh, Faridabad. Add it to the order list or call +91 98992 84391 to confirm availability.",
      },
      {
        question: "What is the price of the trowel?",
        answer:
          "The listed price is shown on the product page — a starting point, negotiated on call or WhatsApp for your quantity.",
      },
      {
        question: "Can I order trowels in bulk for a contractor crew?",
        answer:
          "Yes. Set the quantity you need in the order list and continue on WhatsApp or IndiaMART. Dealer and contractor pricing is available on request.",
      },
    ],
  },
  {
    kind: "variant",
    id: "gph-04",
    slug: "cmc-powder",
    name: "Carboxymethyl Cellulose (CMC) Powder",
    category: "Industrial Binders & Thickeners",
    brand: null,
    variants: [
      {
        label: "White CMC Powder",
        image: "/products/cmc-powder-white.webp?v=8",
        tint: "#E8EDF4",
        description:
          "High-purity water-soluble thickener for wall putty, interior distempers and smooth texture formulation.",
        price: "Contact for Bulk Quote",
      },
      {
        label: "Yellow CMC Powder",
        image: "/products/cmc-powder-yellow.webp?v=8",
        tint: "#F2C230",
        description:
          "Technical industrial grade binder for viscosity control and water retention in construction applications.",
        price: "Contact for Bulk Quote",
      },
    ],
    // TODO verify with CA before showing on invoices.
    hsnCode: "3912",
    description:
      "Carboxymethyl Cellulose (CMC), a thickening and film-forming agent used in wall putty, distempers and architectural coatings.",
    summary:
      "CMC (carboxymethyl cellulose) is a water-soluble thickening and film-forming agent used in wall putty, distempers and architectural coatings. Garg Paints & Hardware offers white CMC for putty and smooth textures, and yellow CMC for technical viscosity control, in Ballabgarh, Faridabad. Grades with a listed rate can be ordered by weight; others are quoted on WhatsApp.",
    cta: "Buy on IndiaMART / WhatsApp Enquiry",
    image: "/products/cmc-powder.webp?v=8",
    imageAlt:
      "Multiwall paper sack of CMC powder with white and yellow grade chips",
    tone: "slate",
    grade: "White and yellow variants",
    packaging: "Sold by weight · commonly 5 kg or 25 kg bags · odd weights (7 kg, 13 kg) are fine",
    quantity: {
      unit: "Kg",
      steps: [1, 5, 25],
      max: 999,
      note: "Commonly 5 kg or 25 kg bags, but any weight works — 7 kg or 13 kg is normal. Share the exact kg on WhatsApp.",
    },
    useCases: [
      "Wall putty",
      "Interior distempers",
      "Smooth texture formulation",
      "Viscosity control and water retention",
    ],
    faqs: [
      {
        question: "Where can I buy bulk white CMC powder in Ballabgarh, Faridabad?",
        answer:
          "Garg Paints & Hardware supplies white CMC powder in Ballabgarh, Faridabad — rates negotiable on quantity. Send your required quantity on WhatsApp at +91 98992 84391 to get your best rate and place the order.",
      },
      {
        question: "What is the difference between white and yellow CMC powder?",
        answer:
          "White CMC is a high-purity water-soluble thickener for wall putty, interior distempers and smooth texture formulation. Yellow CMC is a technical industrial grade binder used for viscosity control and water retention in construction applications.",
      },
      {
        question: "How is CMC used in wall putty?",
        answer:
          "CMC acts as a thickening and film-forming agent in wall putty and architectural coatings. It helps control the working consistency of the mix. Confirm the dosage for your specific formulation with your technical supervisor.",
      },
      {
        question: "Why do some CMC grades show “Contact for Bulk Quote”?",
        answer:
          "Grades without a published rate are quoted because pack size and quantity affect the rate. The site does not attach an estimated price to those grades; request a quote on WhatsApp or IndiaMART.",
      },
      {
        question: "Can I get a better rate on large CMC quantities?",
        answer:
          "Yes — CMC rates are negotiated per order. Larger quantities and repeat orders get better prices. Share your requirement on WhatsApp or IndiaMART.",
      },
      {
        question: "Which CMC grade should I choose for my application?",
        answer:
          "Choose white CMC for putty, distempers and smooth texture work, or yellow CMC for technical viscosity control and water retention. Share your application and quantity on WhatsApp for guidance on the available grade.",
      },
    ],
  },
  {
    kind: "variant",
    id: "gph-05",
    slug: "chamki-powder",
    name: "Premium Chamki Powder (Glitter & Metallic Flakes)",
    category: "Decorative Paint Additives",
    brand: null,
    variants: [
      {
        label: "Golden Chamki Powder",
        price: "Contact for Pack Sizes",
        image: "/products/chamki-powder-gold.webp?v=8",
        tint: "#E9B84B",
      },
      {
        label: "Silver Chamki Powder",
        price: "Contact for Pack Sizes",
        image: "/products/chamki-powder-silver.webp?v=8",
        tint: "#9AA6B8",
      },
    ],
    // TODO verify with CA before showing on invoices.
    hsnCode: "3206",
    description:
      "Glitter and metallic flake additive mixed into wall textures, roof coatings and designer emulsions for a sparkle finish, available in golden and silver.",
    summary:
      "Chamki powder is a glitter and metallic-flake additive for wall textures, roof coatings and designer emulsions, in golden and silver finishes. It adds a sparkle when mixed into the coating. Garg Paints & Hardware supplies both finishes in Ballabgarh, Faridabad — the rate for each finish is shown in the shade list. Share your required quantity on WhatsApp to confirm current pack options.",
    cta: "Buy on IndiaMART / WhatsApp Enquiry",
    image: "/products/chamki-powder.webp?v=8",
    imageAlt:
      "Golden and silver chamki glitter pouches with metallic flakes spilling out",
    tone: "gold",
    grade: "Glitter and metallic flake additive",
    packaging: "Sold by weight · commonly 5 kg or 25 kg bags · odd weights (7 kg, 13 kg) are fine",
    quantity: {
      unit: "Kg",
      steps: [1, 5, 25],
      max: 999,
      note: "Just like CMC — commonly 5 kg or 25 kg bags, and any weight works.",
    },
    useCases: [
      "Wall textures",
      "Roof coatings",
      "Designer emulsions",
      "Sparkle finishes",
    ],
    faqs: [
      {
        question: "Where can I buy chamki powder for wall texture in Faridabad?",
        answer:
          "Garg Paints & Hardware supplies chamki powder for wall textures from Ballabgarh, Faridabad, in golden and silver finishes. Pack sizes are quoted on request, so send your quantity on WhatsApp at +91 98992 84391.",
      },
      {
        question: "What is chamki powder used for?",
        answer:
          "It is a glitter and metallic flake additive mixed into wall textures, roof coatings and designer emulsions to create a sparkle finish. It is an additive, not a standalone wall coating.",
      },
      {
        question: "What pack sizes are available?",
        answer:
          "Pack options are confirmed on enquiry. Share the quantity you need on WhatsApp and the team will confirm the available pack options for your order.",
      },
      {
        question: "Does chamki powder work in roof coatings?",
        answer:
          "The owner lists roof coatings among the applications for this glitter and metallic flake additive. Confirm compatibility with your specific coating system before mixing.",
      },
      {
        question: "How do I order chamki powder?",
        answer:
          "Add the finish to the order list on the product page, or open the IndiaMART listing. Finishes without a listed rate are quoted on WhatsApp instead of an estimated cart price.",
      },
    ],
  },
] as const;

export const productCategories = Array.from(
  new Set(products.map((product) => product.category)),
).sort();

// "Most ordered" lineup, per the owner: binder first, then texture, CMC and
// chamki. The gurmala is a tool, not a top seller — it stays out of this row.
export const featuredProductIds = ["gph-01", "gph-02", "gph-04", "gph-05"];

/**
 * Starter-kit order behind the "Order this setup" button on the visualizers.
 * One of each pack so the buyer always has a complete, coherent basket; the
 * shop confirms exact amounts, and every quantity stays adjustable in the
 * order list.
 *
 * TODO owner: confirm the standard project quantities (bags per shade,
 * binder drums per bag, kg of CMC/chamki per bag) so the kit can become an
 * area-based estimate instead of a fixed starter set.
 */
export const starterKit = {
  danaBags: 1,
  pidicrylDrums: 1,
  cmcKg: 5,
  chamkiKg: 1,
  gurmalaPieces: 1,
} as const;

export const frequentlyBoughtTogether: Record<string, readonly string[]> = {
  "gph-01": ["gph-02", "gph-04"],
  "gph-02": ["gph-03", "gph-05"],
  "gph-03": ["gph-02", "gph-05"],
  "gph-04": ["gph-01", "gph-02"],
  "gph-05": ["gph-02", "gph-03"],
};

export const priceTypes = ["Listed price", "Quote on request"] as const;
export type PriceType = (typeof priceTypes)[number];
