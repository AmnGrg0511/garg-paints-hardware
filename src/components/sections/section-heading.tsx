import Link from "next/link";
import { ArrowRightIcon } from "lucide-react";
import { Localized } from "@/i18n/Localized";
import { cn } from "@/lib/utils";

type Bilingual = { en: string; hi: string };

/**
 * Bilingual section heading: every string renders in both scripts and the
 * active locale is revealed via CSS.
 */
export function SectionHeading({
  eyebrow,
  title,
  body,
  href,
  linkLabel,
  align = "left",
  className,
  id,
}: {
  eyebrow?: Bilingual;
  title: Bilingual;
  body?: Bilingual;
  href?: string;
  linkLabel?: Bilingual;
  align?: "left" | "center";
  className?: string;
  id?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between",
        align === "center" && "sm:flex-col sm:items-center sm:text-center",
        className,
      )}
    >
      <div className={cn("max-w-2xl", align === "center" && "mx-auto")}>
        {eyebrow && (
          <p className="eyebrow">
            <Localized en={eyebrow.en} hi={eyebrow.hi} />
          </p>
        )}
        <h2 id={id} className="display-lg mt-2">
          <Localized en={title.en} hi={title.hi} />
        </h2>
        {body && (
          <p className="mt-3 max-w-xl text-[0.98rem] leading-relaxed text-muted-foreground sm:text-base">
            <Localized en={body.en} hi={body.hi} />
          </p>
        )}
      </div>
      {href && linkLabel && (
        <Link
          href={href}
          className="dana-texture group inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full border border-border bg-card px-4 text-sm font-semibold transition-colors hover:bg-secondary"
        >
          <Localized en={linkLabel.en} hi={linkLabel.hi} />
          <ArrowRightIcon
            className="size-4 transition-transform group-hover:translate-x-0.5"
            aria-hidden
          />
        </Link>
      )}
    </div>
  );
}
