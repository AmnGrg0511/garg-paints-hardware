"use client";

import { useLocale } from "@/i18n/LocaleProvider";
import { cn } from "@/lib/utils";

export function LanguageToggle({ className }: { className?: string }) {
  const { locale, setLocale, t } = useLocale();

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border border-border/80 bg-surface/70 p-0.5",
        className,
      )}
      role="group"
      aria-label={t("common.language")}
    >
      {(
        [
          { value: "en", label: "EN", lang: "en" },
          { value: "hi", label: "हिं", lang: "hi" },
        ] as const
      ).map((item) => (
        <button
          key={item.value}
          type="button"
          lang={item.lang}
          onClick={() => setLocale(item.value)}
          aria-pressed={locale === item.value}
          className={cn(
            "min-h-9 min-w-9 rounded-full px-2.5 text-xs font-semibold transition-colors",
            locale === item.value
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
