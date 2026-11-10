export type AnalyticsEventName =
  | "add_to_cart"
  | "begin_checkout"
  | "click_whatsapp"
  | "click_indiamart"
  | "click_call"
  | "generate_lead"
  | "order_quote_request";

export type AnalyticsParams = Record<string, string | number | boolean | null>;

export const CONSENT_KEY = "gph-analytics-consent";
export type ConsentState = "granted" | "denied";

type DataLayerWindow = Window & {
  dataLayer?: Record<string, unknown>[];
};

export function getConsent(): ConsentState | null {
  if (typeof window === "undefined") return null;
  try {
    const value = window.localStorage.getItem(CONSENT_KEY);
    return value === "granted" || value === "denied" ? value : null;
  } catch {
    return null;
  }
}

export function setConsent(state: ConsentState): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(CONSENT_KEY, state);
    window.dispatchEvent(new CustomEvent("gph:consent", { detail: state }));
  } catch {
    // Storage can be unavailable in private modes; the banner still dismisses.
  }
}

/**
 * Consent-friendly analytics hook. Nothing is pushed until the visitor grants
 * consent. The app ships with no third-party tags; a dataLayer consumer can be
 * added later without touching call sites.
 */
export function trackEvent(
  name: AnalyticsEventName,
  params: AnalyticsParams = {},
): void {
  if (typeof window === "undefined") return;
  if (getConsent() !== "granted") return;

  const target = window as DataLayerWindow;
  target.dataLayer = target.dataLayer ?? [];
  target.dataLayer.push({ event: name, ...params });
}
