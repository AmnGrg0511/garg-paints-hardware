import { business } from "@/config/businessData";

export const trustPoints = [
  {
    key: "since",
    label: "Since 2017",
    detail: `Serving ${business.locality} and ${business.city}`,
  },
  {
    key: "gst",
    label: "GST invoice",
    detail: "On confirmed orders",
  },
  {
    key: "indiamart",
    label: "IndiaMART seller",
    detail: "Marketplace listing",
  },
  {
    key: "hours",
    label: "Open 24x7",
    detail: "All seven days",
  },
] as const;

export const globalFaqs = [
  {
    question: "Where is Garg Paints & Hardware located?",
    answer:
      "Garg Paints & Hardware is in Ballabgarh, Faridabad, Haryana. The full street address and map are still being confirmed, so call or WhatsApp +91 98992 84391 for directions before visiting.",
  },
  {
    question: "How do I place an order?",
    answer:
      "Add priced items to the order list, then choose “Purchase via IndiaMART” or “Fast Order via WhatsApp” at checkout. For quote-only items, request a price on WhatsApp or through the IndiaMART listing.",
  },
  {
    question: "Can I get a GST invoice?",
    answer:
      "Yes. Every confirmed order receives a final GST invoice. This website does not state any GST rate.",
  },
  {
    question: "Do you sell wholesale to dealers and contractors?",
    answer:
      "Yes. Garg Paints & Hardware is a wholesaler and retailer supplying contractors, painters, dealers and builders. Dealer and contractor pricing is available on request through call or WhatsApp.",
  },
  {
    question: "Are the prices on the website final?",
    answer:
      "Listed rates are the product prices shown by the business. Quantity, packing and the current rate are confirmed on call or WhatsApp, and the final GST invoice is shared on confirmation.",
  },
  {
    question: "Why do some products say “Contact for Price”?",
    answer:
      "For bulk-quoted products and pack-size enquiries, the owner has not published a fixed price. Those items show a WhatsApp quote button instead of an estimated cart price, so no fake amount is added.",
  },
  {
    question: "What are your opening hours?",
    answer:
      "The business is open 24x7, all seven days, as stated by the owner. Order enquiries are accepted on call and WhatsApp at any time.",
  },
  {
    question: "Which products do you supply?",
    answer:
      "The catalogue covers acrylic binders and emulsions, madrasi dana wall textures, stainless steel plastering trowels, CMC powder and chamki glitter additive. All five products are listed on the Products page with prices or quote states.",
  },
] as const;

export const navigation = [
  { href: "/products", label: "Products", hiLabel: "Products" },
  { href: "/about", label: "About", hiLabel: "Hamare baare mein" },
  { href: "/faq", label: "FAQ", hiLabel: "Sawaal-jawaab" },
  { href: "/contact", label: "Contact", hiLabel: "Sampark" },
] as const;

export const orderSteps = [
  {
    title: "Add to your list",
    body: "Pick quantities on the product pages. Listed prices show an estimate; quote-only items ask for a price instead.",
  },
  {
    title: "Choose a channel",
    body: "Continue on IndiaMART, or send the pre-filled WhatsApp message with every item and quantity.",
  },
  {
    title: "Confirm the invoice",
    body: "The team confirms availability and shares the final GST invoice. No payment is taken on this website.",
  },
] as const;
