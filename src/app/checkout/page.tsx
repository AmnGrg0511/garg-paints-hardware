import { buildPageMetadata } from "@/lib/seo";
import { CheckoutClient } from "@/components/checkout/checkout-client";

export const metadata = buildPageMetadata({
  title: "Checkout",
  description:
    "Review your order list and continue via इंडियामार्ट or व्हाट्सएप. No payment is taken on the Garg Paints & Hardware website.",
  path: "/checkout",
  noIndex: true,
});

export default function CheckoutPage() {
  return <CheckoutClient />;
}
