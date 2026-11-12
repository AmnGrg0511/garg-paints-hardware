import { business } from "@/config/businessData";

export type OrderMessageLine = {
  name: string;
  variant?: string | null;
  qty: number;
  unit?: string | null;
};

function unitSuffix(unit: string | null | undefined, qty: number): string {
  switch (unit) {
    case "Bag":
      return qty === 1 ? "bag" : "bags";
    case "Drum":
      return qty === 1 ? "drum" : "drums";
    case "Kg":
      return "kg";
    case "Piece":
      return qty === 1 ? "piece" : "pieces";
    default:
      return "";
  }
}

const greeting = `Hello ${business.proprietor.displayName}`;

/**
 * Builds the checkout message. Formatted for WhatsApp with one bullet per
 * line. No GST number is ever included; the invoice is confirmed by the
 * business after the enquiry.
 */
export function buildCartOrderMessage(lines: readonly OrderMessageLine[]): string {
  const items = lines
    .map((line) => {
      const label = line.variant
        ? `${line.name} – ${line.variant}`
        : line.name;
      const suffix = unitSuffix(line.unit, line.qty);
      return `• ${label} × ${line.qty}${suffix ? ` ${suffix}` : ""}`;
    })
    .join("\n");

  return `${greeting},\n\nI want to purchase:\n${items}\n\nPlease confirm availability and share your best rate for this order.`;
}

/** Enquiry message for quote-only products and bulk pricing. */
export function buildQuoteMessage(
  productName: string,
  variantLabel?: string | null,
  qty?: number,
): string {
  const item = variantLabel
    ? `${productName} – ${variantLabel}`
    : productName;
  const quantity = qty && qty > 0 ? `\nQuantity: ${qty}.` : "";

  return `${greeting},\n\nI want a quote for ${item}.${quantity}\n\nPlease share available pack sizes and your best rate.`;
}

/**
 * A bare greeting — "Hello Mahesh". Visitors who prefer WhatsApp skip the
 * form entirely; the shop reads their number straight from the chat, so the
 * message never needs to repeat it.
 */
export function greetingWhatsAppUrl(): string {
  return whatsappUrl(greeting);
}

export function whatsappUrl(message: string): string {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

export function quoteWhatsappUrl(
  productName: string,
  variantLabel?: string | null,
  qty?: number,
): string {
  return whatsappUrl(buildQuoteMessage(productName, variantLabel, qty));
}

export const WHATSAPP_NUMBER = business.whatsappNumber;

export const callUrl = `tel:${business.phoneE164}`;
export const indiaMartUrl = business.marketplaceUrl;

export function generalEnquiryUrl(): string {
  return whatsappUrl(
    `${greeting},\n\nI want to enquire about your paint materials.\n\nPlease share your best rates.`,
  );
}
