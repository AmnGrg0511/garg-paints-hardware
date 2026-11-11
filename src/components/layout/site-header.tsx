"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { MenuIcon, PhoneIcon, SearchIcon, XIcon } from "lucide-react";
import { navigation } from "@/config/content";
import { business } from "@/config/businessData";
import { callUrl } from "@/lib/whatsapp";
import { useLocale } from "@/i18n/LocaleProvider";
import { Localized } from "@/i18n/Localized";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/layout/logo";
import { CartButton } from "@/components/cart/cart-button";
import { LanguageToggle } from "@/components/layout/language-toggle";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { TrackedLink } from "@/components/analytics/tracked-link";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

export function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState("");
  const { t } = useLocale();

  const submitSearch = (event: React.FormEvent) => {
    event.preventDefault();
    const q = query.trim();
    router.push(q ? `/products?q=${encodeURIComponent(q)}` : "/products");
    setMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/95 backdrop-blur">
      {/* Utility strip */}
      <div className="hidden border-b border-border/60 bg-secondary/60 md:block">
        <div className="container-page flex min-h-8 items-center justify-between gap-4 text-[0.7rem] font-medium text-muted-foreground">
          <p className="flex items-center gap-3">
            <span>GST invoice on confirmed orders</span>
            <span aria-hidden className="text-border">
              |
            </span>
            <span>{business.hours.label}</span>
          </p>
          <p className="flex items-center gap-3">
            <a
              href={callUrl}
              className="inline-flex items-center gap-1 transition-colors hover:text-foreground"
            >
              <PhoneIcon className="size-3" aria-hidden />
              {business.phoneDisplay}
            </a>
            <span aria-hidden className="text-border">
              |
            </span>
            <TrackedLink
              event="click_indiamart"
              params={{ source: "utility_bar" }}
              href={business.marketplaceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:text-foreground"
            >
              IndiaMART seller listing
            </TrackedLink>
          </p>
        </div>
      </div>

      {/* Main bar */}
      <div className="container-page flex h-16 items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Logo />
        </div>

        <nav aria-label="Primary" className="hidden items-center gap-1 md:flex">
          {navigation.map((item) => {
            const active =
              pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative inline-flex min-h-11 items-center rounded-full px-3.5 text-sm font-semibold transition-colors",
                  active
                    ? "bg-secondary text-secondary-foreground"
                    : "text-foreground/80 hover:bg-secondary/70 hover:text-foreground",
                )}
              >
                <Localized en={item.label} hi={item.hiLabel} />
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-1.5">
          <form
            role="search"
            onSubmit={submitSearch}
            className="relative hidden lg:block"
          >
            <SearchIcon
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
            <input
              type="search"
              name="q"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search paints, tools…"
              aria-label="Search products"
              className="h-10 w-56 rounded-full border border-input bg-muted/60 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/30"
            />
          </form>

          <LanguageToggle className="hidden sm:inline-flex" />
          <ThemeToggle />
          <CartButton />

          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            className="tap-target inline-flex size-11 items-center justify-center rounded-full border border-border/80 bg-surface text-foreground transition-colors hover:bg-secondary md:hidden"
            aria-label={t("common.menu")}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
          >
            <MenuIcon className="size-5" aria-hidden />
          </button>
        </div>
      </div>

      <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
        <SheetContent id="mobile-menu" side="right" className="w-[86%] max-w-sm">
          <SheetHeader className="pb-2">
            <SheetTitle className="text-xl font-bold">Menu</SheetTitle>
            <SheetDescription>
              <Localized
                en="Ballabgarh, Faridabad · Open 24x7"
                hi="बल्लभगढ़, फ़रीदाबाद · 24x7 खुला"
              />
            </SheetDescription>
          </SheetHeader>

          <form role="search" onSubmit={submitSearch} className="px-4">
            <div className="relative">
              <SearchIcon
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden
              />
              <input
                type="search"
                name="q"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search paints, tools…"
                aria-label="Search products"
                className="h-11 w-full rounded-full border border-input bg-muted/60 pl-9 pr-9 text-sm focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/30"
              />
              <button
                type="submit"
                aria-label="Search"
                className="absolute right-1 top-1 grid size-9 place-items-center rounded-full text-muted-foreground hover:bg-secondary"
              >
                <SearchIcon className="size-4" aria-hidden />
              </button>
            </div>
          </form>

          <nav aria-label="Mobile" className="mt-4 flex flex-col gap-1 px-4">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className="flex min-h-12 items-center rounded-xl px-3 text-base font-semibold text-foreground hover:bg-secondary"
              >
                <Localized en={item.label} hi={item.hiLabel} />
              </Link>
            ))}
          </nav>

          <div className="mt-4 space-y-3 px-4 pb-6">
            <div className="hairline" />
            <LanguageToggle />
            <TrackedLink
              event="click_call"
              href={callUrl}
              className="flex min-h-12 items-center gap-3 rounded-xl border border-border bg-card px-3 text-sm font-semibold"
            >
              <PhoneIcon className="size-4 text-primary" aria-hidden />
              <span>
                {business.phoneDisplay}
                <span className="block text-xs font-normal text-muted-foreground">
                  <Localized en="Call for orders" hi="ऑर्डर के लिए call" />
                </span>
              </span>
            </TrackedLink>
            <p className="text-xs leading-relaxed text-muted-foreground">
              <Localized
                en="GST invoice on every confirmed order. No payment is taken on this website."
                hi="Confirm order par GST invoice. इस वेबसाइट पर payment नहीं लिया जाता."
              />
            </p>
            <button
              type="button"
              onClick={() => setMenuOpen(false)}
              className="tap-target inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground"
            >
              <XIcon className="size-4" aria-hidden />
              <Localized en="Close" hi="बंद करें" />
            </button>
          </div>
        </SheetContent>
      </Sheet>
    </header>
  );
}
