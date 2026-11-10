import Link from "next/link";
import { ArrowRightIcon, PaintBucketIcon } from "lucide-react";
import { Localized } from "@/i18n/Localized";

export default function NotFound() {
  return (
    <div className="container-page flex flex-col items-center pb-24 pt-20 text-center">
      <span className="grid size-20 place-items-center rounded-full bg-secondary text-primary">
        <PaintBucketIcon className="size-8" aria-hidden />
      </span>
      <p className="eyebrow mt-6">404 · Not found</p>
      <h1 className="display-lg mt-2 max-w-lg">
        <Localized
          en="This shelf is empty."
          hi="Yeh shelf khaali hai."
        />
      </h1>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
        <Localized
          en="The page may have moved. The full catalogue is one tap away, or call the shop and we will point you to the right product."
          hi="Page shayad move ho gaya hai. Poora catalogue ek tap door hai, ya dukaan par call karein."
        />
      </p>
      <div className="mt-6 flex flex-col gap-2.5 sm:flex-row">
        <Link
          href="/products"
          className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground"
        >
          <Localized en="Browse products" hi="Products dekhein" />
          <ArrowRightIcon className="size-4" aria-hidden />
        </Link>
        <Link
          href="/"
          className="inline-flex h-12 items-center justify-center rounded-full border border-border bg-card/60 px-6 text-sm font-semibold"
        >
          <Localized en="Back home" hi="Home par jaayein" />
        </Link>
      </div>
    </div>
  );
}
