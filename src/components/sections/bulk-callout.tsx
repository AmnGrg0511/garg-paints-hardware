import { PhoneIcon, StoreIcon } from "lucide-react";
import { generalEnquiryUrl, callUrl } from "@/lib/whatsapp";
import { Localized } from "@/i18n/Localized";
import { TrackedLink } from "@/components/analytics/tracked-link";

export function BulkCallout() {
  return (
    <section className="container-page py-10 sm:py-16" aria-labelledby="bulk-heading">
      <div className="relative isolate overflow-hidden rounded-[1.25rem] bg-primary px-6 py-8 text-white shadow-[0_24px_50px_-30px_hsl(var(--shadow-color)/0.5)] sm:px-10 sm:py-10">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-20 -top-24 size-72 rounded-full border-[24px] border-white/10"
        />
        <div className="relative grid gap-6 md:grid-cols-[1.2fr_0.8fr] md:items-end">
          <div>
            <p className="text-[0.65rem] font-bold uppercase tracking-[0.18em] text-white">
              <Localized en="Wholesale · Retail" hi="Wholesale · Retail" />
            </p>
            <h2 id="bulk-heading" className="mt-2 text-2xl font-extrabold tracking-tight sm:text-3xl">
              <Localized
                en="Dealer / contractor pricing available"
                hi="Dealer / contractor rate uplabdh"
              />
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/85 sm:text-[0.95rem]">
              <Localized
                en="Ordering for a site, a shop or a full crew? Share the material, variant and quantity. We will confirm bulk rates and the final GST invoice on call or WhatsApp."
                hi="Site, dukaan ya poori team ke liye order? Material, variant aur quantity bhejein. Bulk rate aur final GST invoice call ya WhatsApp par confirm hoga."
              />
            </p>
          </div>
          <div className="flex flex-col gap-2.5 sm:flex-row md:justify-end">
            <TrackedLink
              event="click_whatsapp"
              params={{ source: "bulk_callout" }}
              href={generalEnquiryUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="dana-texture inline-flex min-h-12 items-center justify-center rounded-full bg-white px-5 text-sm font-bold text-primary transition-transform hover:scale-[1.02]"
            >
              <Localized en="Ask for bulk rates" hi="Bulk rate poochein" />
            </TrackedLink>
            <TrackedLink
              event="click_call"
              params={{ source: "bulk_callout" }}
              href={callUrl}
              className="dana-texture inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-white/35 px-5 text-sm font-bold text-white transition-colors hover:bg-white/10"
            >
              <PhoneIcon className="size-4" aria-hidden />
              <Localized en="Call the shop" hi="Dukaan par call" />
            </TrackedLink>
          </div>
        </div>

        <div className="relative mt-6 flex flex-wrap gap-x-5 gap-y-2 border-t border-white/20 pt-4 text-[0.7rem] font-medium text-white">
          <span className="inline-flex items-center gap-1.5">
            <StoreIcon className="size-3.5" aria-hidden />
            <Localized
              en="Wholesaler and retailer, Ballabgarh"
              hi="Wholesaler aur retailer, Ballabgarh"
            />
          </span>
          <span>
            <Localized
              en="No payment taken on this website"
              hi="Is website par payment nahi liya jaata"
            />
          </span>
          <span>
            <Localized
              en="GST invoice on confirmation"
              hi="Confirm hone par GST invoice"
            />
          </span>
        </div>
      </div>
    </section>
  );
}
