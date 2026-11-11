import Link from "next/link";
import { ArrowRightIcon } from "lucide-react";
import { Localized } from "@/i18n/Localized";
import { cn } from "@/lib/utils";

const shades = [
  {
    name: "White Madrasi Dana",
    short: "White",
    hex: "#F2ECDD",
    label: "#3F3A2A",
    price: "₹150/Bag",
    slug: "madrasi-dana-wall-texture",
  },
  {
    name: "Red Madrasi Dana",
    short: "Red",
    hex: "#A84328",
    label: "#FFFFFF",
    price: "₹200/Bag",
    slug: "madrasi-dana-wall-texture",
  },
  {
    name: "Yellow Madrasi Dana",
    short: "Yellow",
    hex: "#F0A868",
    label: "#4A2C10",
    price: "₹280/Bag",
    slug: "madrasi-dana-wall-texture",
  },
  {
    name: "Green Madrasi Dana",
    short: "Green",
    hex: "#3D6B41",
    label: "#FFFFFF",
    price: null,
    slug: "madrasi-dana-wall-texture",
  },
  {
    name: "Black Madrasi Dana",
    short: "Black",
    hex: "#2B2B2E",
    label: "#FFFFFF",
    price: null,
    slug: "madrasi-dana-wall-texture",
  },
] as const;

/**
 * Shade-card strip — the colour-first pattern every paint retailer leads
 * with. Shows the four real Madrasi dana shades with their listed rates.
 */
export function ShadeStrip() {
  return (
    <section
      className="container-page pb-4 pt-2 sm:pt-4"
      aria-labelledby="shades-heading"
    >
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">शेड कार्ड</p>
          <h2 id="shades-heading" className="display-lg mt-2">
            <Localized
              en="शेड चुनें। बैग के हिसाब से ऑर्डर करें।"
              hi="शेड चुनें। बैग के हिसाब से ऑर्डर करें।"
            />
          </h2>
          <p className="mt-3 max-w-2xl text-[0.95rem] leading-relaxed text-muted-foreground">
            <Localized
              en="हमारे पास मौजूद पाँच मदरासी दाना शेड, लिस्टेड बैग रेट के साथ। ग्रीन और ब्लैक का रेट पूछने पर मिलेगा — पक्का रेट जानने के लिए अपनी मात्रा व्हाट्सएप पर भेजें।"
              hi="हमारे पास मौजूद पाँच मदरासी दाना शेड, लिस्टेड बैग रेट के साथ। ग्रीन और ब्लैक का रेट पूछने पर मिलेगा — पक्का रेट जानने के लिए अपनी मात्रा व्हाट्सएप पर भेजें।"
            />
          </p>
        </div>
        <Link
          href="/products/madrasi-dana-wall-texture"
          className="inline-flex min-h-11 items-center gap-1.5 rounded-full border border-border bg-card px-4 text-sm font-bold transition-colors hover:bg-secondary"
        >
          <Localized en="टेक्सचर की जानकारी देखें" hi="टेक्सचर की जानकारी देखें" />
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
                  {shade.price ? (
                    <>
                      <span className="rupee">₹</span>
                      {shade.price.replace("₹", "")}
                    </>
                  ) : (
                    <Localized
                      en="Price on request"
                      hi="रेट पूछना होगा"
                    />
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
