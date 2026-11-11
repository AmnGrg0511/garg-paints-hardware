import { getCategoryCounts } from "@/lib/catalog";
import { Localized } from "@/i18n/Localized";
import { cn } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";
import { ArrowRightIcon } from "lucide-react";
import { SectionHeading } from "@/components/sections/section-heading";

const categoryMeta: Record<
  string,
  {
    blurb: string;
    tone: string;
    image?: string;
  }
> = {
  "Wall Textures & Aggregates": {
    blurb:
      "Madrasi dana granules in four shades for facades and plaster finishes.",
    tone: "swatch-terracotta",
    image: "/products/madrasi-dana.webp?v=8",
  },
  "Acrylic Binders & Emulsions": {
    blurb: "Pidicryl 126 M binder for emulsions, distempers and textures.",
    tone: "swatch-cream",
    image: "/products/pidicryl-126-m.webp?v=8",
  },
  "Plastering Tools & Hardware": {
    blurb: "Stainless steel gurmala for spreading, flattening and scraping.",
    tone: "swatch-peach",
    image: "/products/plastering-trowel.webp?v=8",
  },
  "Industrial Binders & Thickeners": {
    blurb: "White and yellow CMC powder for putty and viscosity control.",
    tone: "swatch-slate",
    image: "/products/cmc-powder.webp?v=8",
  },
  "Decorative Paint Additives": {
    blurb: "Chamki glitter flakes for textured and designer finishes.",
    tone: "swatch-gold",
    image: "/products/chamki-powder.webp?v=8",
  },
};

export function CategoryBento() {
  const counts = getCategoryCounts();
  const categories = counts.map((entry) => ({
    ...entry,
    meta: categoryMeta[entry.category] ?? {
      blurb: "",
      tone: "swatch-cream",
    },
  }));

  return (
    <section
      className="container-page py-12 sm:py-16"
      aria-labelledby="categories-heading"
    >
      <SectionHeading
        id="categories-heading"
        eyebrow="Shop by category"
        title="Everything for the wall, from one counter."
        body="Five supply lines for contractors, painters, dealers and builders — from the binder that holds the mix to the tool that finishes it."
        href="/products"
        linkLabel="View all products"
      />

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((entry) => (
          <Link
            key={entry.category}
            href={`/products?category=${encodeURIComponent(entry.category)}`}
            className="group surface-card relative isolate flex items-center gap-4 overflow-hidden rounded-2xl p-4 transition-[transform,box-shadow] duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_40px_-20px_hsl(var(--shadow-color)/0.28)] sm:p-5"
          >
            <span
              className={cn(
                "relative grid size-20 shrink-0 overflow-hidden rounded-xl sm:size-24",
                entry.meta.tone,
              )}
              aria-hidden
            >
              {entry.meta.image && (
                <Image
                  src={entry.meta.image}
                  alt=""
                  fill
                  sizes="96px"
                  className="object-cover opacity-90 transition-transform duration-500 group-hover:scale-105"
                />
              )}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[0.95rem] font-bold leading-snug sm:text-base">
                {entry.category}
              </span>
              <span className="mt-1 block line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                {entry.meta.blurb}
              </span>
              <span className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-primary">
                <Localized
                  en={`${entry.count} product${entry.count === 1 ? "" : "s"}`}
                  hi={`${entry.count} product${entry.count === 1 ? "" : "s"}`}
                />
                <ArrowRightIcon className="size-3.5" aria-hidden />
              </span>
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
