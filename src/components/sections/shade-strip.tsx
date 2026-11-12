import Link from "next/link";
import { ArrowRightIcon } from "lucide-react";
import { Localized } from "@/i18n/Localized";
import { cn } from "@/lib/utils";
import { products } from "@/config/effective-catalog";
import { parsePrice } from "@/lib/pricing";

/**
 * Visual-only metadata per Madrasi dana shade. Rates never live here —
 * they come from the catalogue (and its bot-committed overrides), so a
 * rate update from Telegram shows up on this card with the next deploy.
 */
const shadeVisuals: Record<string, { short: string; hex: string; label: string }> = {
  "White Madrasi Dana": { short: "White", hex: "#F2ECDD", label: "#3F3A2A" },
  "Red Madrasi Dana": { short: "Red", hex: "#A84328", label: "#FFFFFF" },
  "Yellow Madrasi Dana": { short: "Yellow", hex: "#F0A868", label: "#4A2C10" },
  "Green Madrasi Dana": { short: "Green", hex: "#3D6B41", label: "#FFFFFF" },
  "Black Madrasi Dana": { short: "Black", hex: "#2B2B2E", label: "#FFFFFF" },
};

const dana = products.find((product) => product.id === "gph-02");

const shades = (
  dana?.kind === "variant" ? dana.variants : []
).map((variant) => ({
  name: variant.label,
  slug: dana?.slug ?? "madrasi-dana-wall-texture",
  info: parsePrice(variant.price),
  ...(shadeVisuals[variant.label] ?? {
    short: variant.label.split(/\s+/)[0],
    hex: "#CCCCCC",
    label: "#333333",
  }),
}));

/**
 * Shade-card strip — the colour-first pattern every paint retailer leads
 * with. Shows the Madrasi dana shades with their live rates.
 */
export function ShadeStrip() {
  return (
    <section
      className="container-page pb-4 pt-2 sm:pt-4"
      aria-labelledby="shades-heading"
    >
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow"><Localized en="Shade card" hi="शेड कार्ड" /></p>
          <h2 id="shades-heading" className="display-lg mt-2">
            <Localized
              en="Pick a shade. Order it by the bag."
              hi="शेड चुनें। बैग के हिसाब से ऑर्डर करें।"
            />
          </h2>
          <p className="mt-3 max-w-2xl text-[0.95rem] leading-relaxed text-muted-foreground">
            <Localized
              en="The five Madrasi dana shades we stock, with the current rates from the catalogue. Shades marked price on request are quoted on WhatsApp."
              hi="हमारे पास मौजूद पाँच Madrasi dana शेड, कैटलॉग के मौजूदा रेट के साथ। जिन पर Price on request दिखे, उनका रेट WhatsApp पर पूछें।"
            />
          </p>
        </div>
        <Link
          href="/products/madrasi-dana-wall-texture"
          className="inline-flex min-h-11 items-center gap-1.5 rounded-full border border-border bg-card px-4 text-sm font-bold transition-colors hover:bg-secondary"
        >
          <Localized en="View texture details" hi="टेक्सचर की जानकारी देखें" />
          <ArrowRightIcon className="size-4" aria-hidden />
        </Link>
      </div>

      <ul className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {shades.map((shade) => (
          <li key={shade.name}>
            <Link
              href={`/products/${shade.slug}`}
              className="group block overflow-hidden rounded-2xl border border-border bg-card transition-[transform,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-[0_18px_40px_-20px_hsl(var(--shadow-color)/0.28)]"
            >
              <span
                className={cn(
                  "dana-texture relative flex h-28 items-end p-3 sm:h-36",
                )}
                style={{ background: shade.hex }}
                aria-hidden
              >
                <span
                  className="text-xs font-bold uppercase tracking-[0.14em]"
                  style={{ color: shade.label }}
                >
                  {shade.short}
                </span>
              </span>
              <span className="block p-3.5">
                <span className="block text-sm font-bold leading-snug">
                  {shade.name}
                </span>
                <span className="mt-1 block text-sm font-extrabold">
                  {shade.info.onRequest ? (
                    <Localized
                      en="Price on request"
                      hi="रेट पूछना होगा"
                    />
                  ) : (
                    <>
                      <span className="rupee">₹</span>
                      {new Intl.NumberFormat("en-IN").format(shade.info.amount ?? 0)}
                      <span className="text-xs font-semibold text-muted-foreground">
                        /{shade.info.unit}
                      </span>
                    </>
                  )}
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
