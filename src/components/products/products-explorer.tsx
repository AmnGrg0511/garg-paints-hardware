"use client";

import { useEffect, useMemo, useState } from "react";
import { SearchIcon, SlidersHorizontalIcon, XIcon } from "lucide-react";
import type { ProductCardData } from "@/components/product/product-card";
import { productCategories, products as allProducts } from "@/config/businessData";
import { parsePrice } from "@/lib/pricing";
import { useLocale } from "@/i18n/LocaleProvider";
import { Input } from "@/components/ui/input";import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ProductCard } from "@/components/product/product-card";

type PriceFilter = "listed" | "quote";

type FilterPanelProps = {
  query: string;
  onQueryChange: (value: string) => void;
  selectedCategories: Set<string>;
  onToggleCategory: (category: string) => void;
  selectedPriceTypes: Set<PriceFilter>;
  onTogglePriceType: (type: PriceFilter) => void;
  onClear: () => void;
  activeCount: number;
};

function FilterPanel({
  query,
  onQueryChange,
  selectedCategories,
  onToggleCategory,
  selectedPriceTypes,
  onTogglePriceType,
  onClear,
  activeCount,
}: FilterPanelProps) {
  const { t } = useLocale();

  return (
    <div className="space-y-6">
      <div>
        <label
          htmlFor="product-search"
          className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground"
        >
          {t("filters.search")}
        </label>
        <div className="relative mt-2">
          <SearchIcon
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            id="product-search"
            type="search"
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder={t("filters.searchPlaceholder")}
            className="h-11 rounded-xl bg-background pl-9"
          />
        </div>
      </div>

      <fieldset>
        <legend className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          {t("filters.category")}
        </legend>
        <div className="mt-2 space-y-1">
          {productCategories.map((category) => {
            const count = allProducts.filter(
              (product) => product.category === category,
            ).length;
            return (
              <label
                key={category}
                className="flex min-h-11 cursor-pointer items-center gap-2.5 rounded-lg px-1 text-sm text-foreground hover:bg-secondary/60"
              >
                <Checkbox
                  checked={selectedCategories.has(category)}
                  onCheckedChange={() => onToggleCategory(category)}
                />
                <span className="flex-1">{category}</span>
                <span className="text-xs tabular-nums text-muted-foreground">
                  {count}
                </span>
              </label>
            );
          })}
        </div>
      </fieldset>

      <fieldset>
        <legend className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          {t("filters.priceType")}
        </legend>
        <div className="mt-2 space-y-1">
          {(
            [
              { value: "listed", label: "Listed price" },
              { value: "quote", label: "Quote on request" },
            ] as const
          ).map((option) => (
            <label
              key={option.value}
              className="flex min-h-11 cursor-pointer items-center gap-2.5 rounded-lg px-1 text-sm text-foreground hover:bg-secondary/60"
            >
              <Checkbox
                checked={selectedPriceTypes.has(option.value)}
                onCheckedChange={() => onTogglePriceType(option.value)}
              />
              <span>{option.label}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <Button
        type="button"
        variant="outline"
        onClick={onClear}
        disabled={activeCount === 0}
        className="h-11 w-full rounded-full"
      >
        {t("filters.clear")}
      </Button>
    </div>
  );
}

function productHasListedPrice(product: ProductCardData): boolean {
  if (product.kind === "simple") return !parsePrice(product.price ?? "").onRequest;
  return (product.variants ?? []).some(
    (variant) => !parsePrice(variant.price).onRequest,
  );
}

function productHasQuote(product: ProductCardData): boolean {
  if (product.kind === "simple") return parsePrice(product.price ?? "").onRequest;
  return (product.variants ?? []).some(
    (variant) => parsePrice(variant.price).onRequest,
  );
}

export function ProductsExplorer({
  initialProducts,
}: {
  initialProducts: readonly ProductCardData[];
}) {
  const { t, locale } = useLocale();
  const [query, setQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(
    new Set(),
  );
  const [selectedPriceTypes, setSelectedPriceTypes] = useState<
    Set<PriceFilter>
  >(new Set());
  const [sheetOpen, setSheetOpen] = useState(false);

  // Deep links from the header search and category tiles arrive after
  // hydration; the SSR HTML still shows the full catalogue for crawlers.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const q = params.get("q")?.trim();
    const category = params.get("category")?.trim();
    if (!q && !category) return;
    const frame = window.requestAnimationFrame(() => {
      if (q) setQuery(q);
      if (category && productCategories.includes(category)) {
        setSelectedCategories(new Set([category]));
      }
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return initialProducts.filter((product) => {
      const matchesCategory =
        selectedCategories.size === 0 ||
        selectedCategories.has(product.category);
      if (!matchesCategory) return false;

      if (selectedPriceTypes.size > 0) {
        const matchesListed =
          selectedPriceTypes.has("listed") && productHasListedPrice(product);
        const matchesQuote =
          selectedPriceTypes.has("quote") && productHasQuote(product);
        if (!matchesListed && !matchesQuote) return false;
      }

      if (!needle) return true;
      const haystack = [
        product.name,
        product.category,
        product.description,
        product.kind === "variant"
          ? (product.variants ?? []).map((variant) => variant.label).join(" ")
          : (product.price ?? ""),
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(needle);
    });
  }, [initialProducts, query, selectedCategories, selectedPriceTypes]);

  const activeCount =
    selectedCategories.size +
    selectedPriceTypes.size +
    (query.trim() ? 1 : 0);

  const clearAll = () => {
    setQuery("");
    setSelectedCategories(new Set());
    setSelectedPriceTypes(new Set());
  };

  const toggleCategory = (category: string) => {
    setSelectedCategories((previous) => {
      const next = new Set(previous);
      if (next.has(category)) next.delete(category);
      else next.add(category);
      return next;
    });
  };

  const togglePriceType = (type: PriceFilter) => {
    setSelectedPriceTypes((previous) => {
      const next = new Set(previous);
      if (next.has(type)) next.delete(type);
      else next.add(type);
      return next;
    });
  };

  const panelProps: FilterPanelProps = {
    query,
    onQueryChange: setQuery,
    selectedCategories,
    onToggleCategory: toggleCategory,
    selectedPriceTypes,
    onTogglePriceType: togglePriceType,
    onClear: clearAll,
    activeCount,
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[16rem_1fr] lg:gap-10">
      <aside className="hidden lg:block">
        <div className="sticky top-28 rounded-2xl border border-border/70 bg-card/55 p-5">
          <FilterPanel {...panelProps} />
        </div>
      </aside>

      <div>
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setSheetOpen(true)}
              className="h-11 rounded-full lg:hidden"
            >
              <SlidersHorizontalIcon className="size-4" aria-hidden />
              {t("filters.mobile")}
              {activeCount > 0 && (
                <span className="grid size-5 place-items-center rounded-full bg-primary text-[0.65rem] font-bold text-primary-foreground">
                  {activeCount}
                </span>
              )}
            </Button>
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">
                {filtered.length}
              </span>{" "}
              {t("filters.results")}
            </p>
          </div>

          {activeCount > 0 && (
            <button
              type="button"
              onClick={clearAll}
              className="text-xs font-medium text-primary underline underline-offset-4"
            >
              {t("filters.clear")}
            </button>
          )}
        </div>

        {activeCount > 0 && (
          <ul
            className="mb-5 flex flex-wrap gap-2"
            aria-label={t("filters.active")}
          >
            {query.trim() && (
              <li>
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="inline-flex min-h-8 items-center gap-1.5 rounded-full bg-secondary px-3 text-xs font-medium"
                >
                  “{query.trim()}”
                  <XIcon className="size-3" aria-hidden />
                  <span className="sr-only">Remove search</span>
                </button>
              </li>
            )}
            {Array.from(selectedCategories).map((category) => (
              <li key={category}>
                <button
                  type="button"
                  onClick={() => toggleCategory(category)}
                  className="inline-flex min-h-8 items-center gap-1.5 rounded-full bg-secondary px-3 text-xs font-medium"
                >
                  {category}
                  <XIcon className="size-3" aria-hidden />
                  <span className="sr-only">Remove {category} filter</span>
                </button>
              </li>
            ))}
            {Array.from(selectedPriceTypes).map((type) => (
              <li key={type}>
                <button
                  type="button"
                  onClick={() => togglePriceType(type)}
                  className="inline-flex min-h-8 items-center gap-1.5 rounded-full bg-secondary px-3 text-xs font-medium"
                >
                  {type === "listed" ? "Listed price" : "Quote on request"}
                  <XIcon className="size-3" aria-hidden />
                  <span className="sr-only">Remove price filter</span>
                </button>
              </li>
            ))}
          </ul>
        )}

        {filtered.length === 0 ? (
          <div className="surface-card flex flex-col items-center rounded-3xl px-6 py-16 text-center">
            <span className="grid size-16 place-items-center rounded-full bg-secondary text-primary">
              <SearchIcon className="size-7" aria-hidden />
            </span>
            <h2 className="mt-4 font-display text-2xl">{t("filters.empty")}</h2>
            <p className="mt-2 max-w-sm text-sm text-muted-foreground">
              {t("filters.emptyBody")}
            </p>
            <Button
              onClick={clearAll}
              className="mt-5 h-11 rounded-full px-5"
            >
              {t("filters.clear")}
            </Button>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.map((product, index) => (
              <ProductCard
                key={product.id}
                product={product}
                priority={index === 0}
              />
            ))}
          </div>
        )}
      </div>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="bottom" className="max-h-[88dvh] overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="font-display text-2xl">
              {t("filters.title")}
            </SheetTitle>
            <SheetDescription>
              {locale === "hi"
                ? "Category, price type aur search se product chunein."
                : "Narrow the catalogue by category, price type and search."}
            </SheetDescription>
          </SheetHeader>
          <div className="px-4 pb-8">
            <FilterPanel {...panelProps} />
            <Button
              onClick={() => setSheetOpen(false)}
              className="mt-4 h-12 w-full rounded-full"
            >
              {filtered.length} {t("filters.results")}
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
