"use client";

import { MoonIcon, SunIcon } from "lucide-react";
import { useTheme } from "next-themes";
import { useLocale } from "@/i18n/LocaleProvider";
import { cn } from "@/lib/utils";

export function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();
  const { t } = useLocale();
  const isDark = resolvedTheme === "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={t("common.theme")}
      className={cn(
        "tap-target inline-flex size-11 items-center justify-center rounded-full border border-border/80 bg-surface/70 text-foreground transition-colors hover:bg-secondary",
        className,
      )}
    >
      <span key={isDark ? "moon" : "sun"} className="gph-icon-in inline-flex">
        {isDark ? (
          <SunIcon className="size-5" aria-hidden />
        ) : (
          <MoonIcon className="size-5" aria-hidden />
        )}
      </span>
    </button>
  );
}
