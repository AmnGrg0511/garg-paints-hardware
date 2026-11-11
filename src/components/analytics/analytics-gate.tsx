"use client";

import Script from "next/script";
import {
  getConsent,
  listenForConsentChanges,
} from "@/lib/analytics";
import { useSyncExternalStore } from "react";

/**
 * Loads Google Analytics only after the visitor grants consent, and only
 * when a measurement ID is configured. Consent-mode commands are kept in
 * sync with the banner at all times.
 */
const consentStore = {
  subscribe(onChange: () => void) {
    window.addEventListener("gph:consent", onChange);
    window.addEventListener("storage", onChange);
    const stop = listenForConsentChanges();
    return () => {
      window.removeEventListener("gph:consent", onChange);
      window.removeEventListener("storage", onChange);
      stop();
    };
  },
  getSnapshot() {
    return getConsent() === "granted";
  },
  getServerSnapshot() {
    return false;
  },
};

export function AnalyticsGate({ gaId }: { gaId: string }) {
  const granted = useSyncExternalStore(
    consentStore.subscribe,
    consentStore.getSnapshot,
    consentStore.getServerSnapshot,
  );

  return (
    <>
      {/* Consent-mode defaults: denied until the banner grants. */}
      <Script
        id="gph-ga-consent"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}window.gtag=window.gtag||gtag;gtag('consent','default',{ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied',analytics_storage:'denied',wait_for_update:500});`,
        }}
      />
      {granted && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
            strategy="afterInteractive"
          />
          <Script
            id="gph-ga-init"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `gtag('js', new Date());gtag('config', '${gaId}', { anonymize_ip: true });`,
            }}
          />
        </>
      )}
    </>
  );
}
