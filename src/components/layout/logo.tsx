import Link from "next/link";
import { cn } from "@/lib/utils";
import { PaintCanGlyph } from "@/components/icons/brand";

export function Logo({
  className,
  compact = false,
}: {
  className?: string;
  compact?: boolean;
}) {
  return (
    <Link
      href="/"
      className={cn(
        "group inline-flex items-center gap-2.5 rounded-lg focus-visible:outline-2",
        className,
      )}
      aria-label="Garg Paints & Hardware — home"
    >
      <span
        className="relative grid size-10 shrink-0 place-items-center overflow-hidden rounded-xl bg-primary text-primary-foreground shadow-sm"
        aria-hidden
      >
        <PaintCanGlyph className="size-7" />
      </span>
      {!compact && (
        <span className="flex flex-col leading-tight">
          <span className="text-[1.02rem] font-extrabold tracking-tight text-foreground">
            Garg Paints
          </span>
          <span className="text-[0.64rem] font-semibold uppercase tracking-[0.18em] text-primary">
            &amp; Hardware
          </span>
        </span>
      )}
    </Link>
  );
}
