import Link from "next/link";
import { MapPinIcon, PhoneIcon } from "lucide-react";
import { business, hasFullAddress } from "@/config/businessData";
import { navigation } from "@/config/content";
import { callUrl, generalEnquiryUrl } from "@/lib/whatsapp";
import { Localized } from "@/i18n/Localized";
import { TrackedLink } from "@/components/analytics/tracked-link";
import { Logo } from "@/components/layout/logo";

const COPYRIGHT_YEAR = new Date().getFullYear();

export function SiteFooter() {

  return (
    <footer className="mt-24 border-t border-border/70 bg-surface-2">
      <div className="container-page grid gap-10 py-14 md:grid-cols-[1.4fr_0.8fr_0.8fr_1.1fr]">
        <div className="max-w-sm">
          <Logo />
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            <Localized
              en="Wholesaler and retailer of paint additives, binders, wall textures and plastering tools in Ballabgarh, Faridabad. Supplying contractors, painters, dealers and builders since 2017."
              hi="बल्लभगढ़, फ़रीदाबाद में paint additives, binders, wall textures और plastering tools का wholesaler और retailer। 2017 से contractors, painters, dealers और builders को supply।"
            />
          </p>
          <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
            <Localized
              en="Prices shown are listed starting rates — your best rate is negotiated on call or WhatsApp, based on your quantity. Regular customers get better deals."
              hi="यहाँ दिखे रेट शुरुआती हैं — आपका बेस्ट रेट call या WhatsApp पर आपकी मात्रा के हिसाब से तय होता है। नियमित ग्राहकों को बेहतर रेट मिलते हैं।"
            />
          </p>
        </div>

        <nav aria-label="Footer">
          <h2 className="eyebrow">
            <Localized en="Explore" hi="देखें" />
          </h2>
          <ul className="mt-4 space-y-2.5 text-sm">
            {navigation.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="inline-flex min-h-8 items-center text-muted-foreground transition-colors hover:text-foreground"
                >
                  <Localized en={item.label} hi={item.hiLabel} />
                </Link>
              </li>
            ))}
            <li>
              <Link
                href="/checkout"
                className="inline-flex min-h-8 items-center text-muted-foreground transition-colors hover:text-foreground"
              >
                <Localized en="Review order" hi="ऑर्डर की समीक्षा" />
              </Link>
            </li>
          </ul>
        </nav>

        <div>
          <h2 className="eyebrow">
            <Localized en="Verification" hi="प्रमाणन" />
          </h2>
          <dl className="mt-4 space-y-3 text-sm">
            <div>
              <dt className="text-xs text-muted-foreground">
                <Localized en="Established" hi="शुरुआत" />
              </dt>
              <dd className="font-medium">{business.established}</dd>
            </div>
            {business.legalName && (
              <div>
                <dt className="text-xs text-muted-foreground">
                  <Localized en="Legal name" hi="कानूनी नाम" />
                </dt>
                <dd className="font-medium">{business.legalName}</dd>
              </div>
            )}
            <div>
              <dt className="text-xs text-muted-foreground">
                <Localized en="Hours" hi="समय" />
              </dt>
              <dd className="font-medium">{business.hours.label}</dd>
            </div>
          </dl>
        </div>

        <div>
          <h2 className="eyebrow">
            <Localized en="Contact" hi="संपर्क" />
          </h2>
          <ul className="mt-4 space-y-3 text-sm">
            <li>
              <TrackedLink
                event="click_call"
                params={{ source: "footer" }}
                href={callUrl}
                className="inline-flex min-h-9 items-center gap-2 font-medium text-foreground hover:text-primary"
              >
                <PhoneIcon className="size-4 text-primary" aria-hidden />
                {business.phoneDisplay}
              </TrackedLink>
            </li>
            <li>
              <TrackedLink
                event="click_whatsapp"
                params={{ source: "footer" }}
                href={generalEnquiryUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-9 items-center gap-2 text-muted-foreground hover:text-foreground"
              >
                WhatsApp enquiry
              </TrackedLink>
            </li>
            <li>
              <TrackedLink
                event="click_indiamart"
                params={{ source: "footer" }}
                href={business.marketplaceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-9 items-center gap-2 text-muted-foreground hover:text-foreground"
              >
                Find us on IndiaMART
              </TrackedLink>
            </li>
            <li className="flex gap-2 text-muted-foreground">
              <MapPinIcon
                className="mt-0.5 size-4 shrink-0 text-primary"
                aria-hidden
              />
              <span>
                {hasFullAddress
                  ? `${business.address.street}, ${business.locality}, ${business.city}, ${business.state} ${business.address.postalCode}`
                  : `${business.locality}, ${business.city}, ${business.state}, ${business.country}`}
                {!hasFullAddress && (
                  <span className="mt-1 block text-xs">
                    <Localized
                      en="Street address and map are being confirmed. Call or WhatsApp for directions."
                      hi="सड़क का पता और map कन्फ़र्म हो रहा है। रास्ता जानने के लिए call या WhatsApp करें।"
                    />
                  </span>
                )}
              </span>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-border/60">
        <div className="container-page flex flex-col gap-2 py-5 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {COPYRIGHT_YEAR} {business.name}.{" "}
            <Localized en="All rights reserved." hi="सर्वाधिकार सुरक्षित।" />
          </p>
          <p>
            <Localized
              en="Order enquiries 24x7 on call and WhatsApp."
              hi="call और WhatsApp पर 24x7 ऑर्डर enquiry."
            />
          </p>
        </div>
      </div>
    </footer>
  );
}
