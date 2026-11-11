export type AnalyticsEventName =
  | "add_to_cart"
  | "begin_checkout"
  | "click_whatsapp"
  | "click_indiamart"
  | "click_call"
  | "generate_lead"
  | "order_kit"
  | "order_quote_request";

export type AnalyticsParams = Record<string, string | number | boolean | null>;



type DataLayerWindow = Window & {
  dataLayer?: Record<string, unknown>[];
  gtag?: (...args: unknown[]) => void;
};

/**
 * Consent-friendly analytics hook. Nothing is pushed until the visitor grants
 * consent. When Google Analytics is configured (NEXT_PUBLIC_GA_ID), events go
 * to GA4; they always land in the local dataLayer as a first-party mirror.
 */
export function trackEvent(
  name: AnalyticsEventName,
  params: AnalyticsParams = {},
): void {
  if (typeof window === "undefined") return;

  const target = window as DataLayerWindow;
  target.dataLayer = target.dataLayer ?? [];
  target.dataLayer.push({ event: name, ...params });

  if (typeof target.gtag === "function") {
    target.gtag("event", name, {
      ...params,
      send_to: process.env.NEXT_PUBLIC_GA_ID,
    });
  }
}
