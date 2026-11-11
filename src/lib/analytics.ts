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

export const CONSENT_KEY = "gph-analytics-consent";
export type ConsentState = "granted" | "denied";

type DataLayerWindow = Window & {
  dataLayer?: Record<string, unknown>[];
  gtag?: (...args: unknown[]) => void;
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

/** Google consent mode must agree with the banner before any GA cookie use. */
export function applyGtagConsent(state: ConsentState): void {
  const target = window as DataLayerWindow;
  if (!target.gtag) return;
  target.gtag("consent", "update", {
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
    ad_personalization_signals: undefined,
    analytics_storage: state === "granted" ? "granted" : "denied",
  });
}

export function listenForConsentChanges(): () => void {
  const handler = () => {
    const state = getConsent();
    if (state) applyGtagConsent(state);
  };
  window.addEventListener("gph:consent", handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener("gph:consent", handler);
    window.removeEventListener("storage", handler);
  };
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
 * consent. When Google Analytics is configured (NEXT_PUBLIC_GA_ID), events go
 * to GA4; they always land in the local dataLayer as a first-party mirror.
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

  if (typeof target.gtag === "function") {
    target.gtag("event", name, {
      ...params,
      send_to: process.env.NEXT_PUBLIC_GA_ID,
    });
  }
}
