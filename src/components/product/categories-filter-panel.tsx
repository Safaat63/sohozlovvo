"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";

interface CategoryFilterItem {
  id: string;
  name: string;
  slug: string;
  _count?: {
    products?: number;
  } | null;
}

interface CategoriesFilterPanelProps {
  categories: CategoryFilterItem[];
  brands: string[];
  priceRange: {
    min: number;
    max: number;
  };
  selected: {
    category?: string;
    brand?: string;
    minPrice?: number;
    maxPrice?: number;
    flag?: "best_selling" | "new_arrival";
  };
  basePath?: string;
  categoryRouteBase?: string;
}

function formatPrice(value: number) {
  return `৳${value.toLocaleString("en-US")}`;
}

function PriceRangeSection({
  min,
  max,
  selectedMin,
  selectedMax,
  onCommit,
}: {
  min: number;
  max: number;
  selectedMin: number;
  selectedMax: number;
  onCommit: (value: number[]) => void;
}) {
  const [range, setRange] = useState<[number, number]>([
    selectedMin,
    selectedMax,
  ]);

  return (
    <section className="rounded-xs border border-border bg-card p-4 shadow-sm">
      <div className="flex items-center justify-between pb-3">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-foreground">
          Price Range
        </h3>
      </div>
      <div className="h-0.5 w-10 bg-primary mb-4" />
      <div className="space-y-4">
        <Slider
          value={range}
          min={min}
          max={max}
          step={10}
          onValueChange={(value) => setRange(value as [number, number])}
          onValueCommit={onCommit}
        />
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{formatPrice(range[0])}</span>
          <span>{formatPrice(range[1])}</span>
        </div>
      </div>
    </section>
  );
}

export function CategoriesFilterPanel({
  categories,
  brands,
  priceRange,
  selected,
  basePath = "/categories",
  categoryRouteBase,
}: CategoriesFilterPanelProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const defaultRange = useMemo(
    () => [priceRange.min, priceRange.max] as [number, number],
    [priceRange.max, priceRange.min],
  );

  const priceRangeKey = `${defaultRange[0]}-${defaultRange[1]}-${
    selected.minPrice ?? ""
  }-${selected.maxPrice ?? ""}`;

  const updateParams = (
    next: Record<string, string | undefined>,
    nextPath = basePath,
  ) => {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(next).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });

    params.delete("page");

    const query = params.toString();
    router.push(query ? `${nextPath}?${query}` : nextPath);
  };

  const handleCategoryToggle = (slug: string) => {
    const nextCategory = selected.category === slug ? undefined : slug;
    if (categoryRouteBase) {
      updateParams(
        { category: undefined },
        nextCategory ? `${categoryRouteBase}/${nextCategory}` : basePath,
      );
      return;
    }
    updateParams({ category: nextCategory });
  };

  const handleBrandToggle = (brand: string) => {
    updateParams({ brand: selected.brand === brand ? undefined : brand });
  };

  const handleFlagToggle = (flag: "best_selling" | "new_arrival") => {
    updateParams({ flag: selected.flag === flag ? undefined : flag });
  };

  const handleRangeCommit = (value: number[]) => {
    const [min, max] = value as [number, number];
    updateParams({
      minPrice: min !== defaultRange[0] ? String(min) : undefined,
      maxPrice: max !== defaultRange[1] ? String(max) : undefined,
    });
  };

  return (
    <div className="space-y-4">
      <section className="rounded-xs border border-border bg-card p-4 shadow-sm">
        <div className="flex items-center justify-between pb-3">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-foreground">
            Filter by Category
          </h3>
        </div>
        <div className="h-0.5 w-10 bg-primary mb-4" />
        <div className="space-y-2">
          {categories.map((category) => {
            const checked = selected.category === category.slug;
            return (
              <label
                key={category.id}
                className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer"
              >
                <Checkbox
                  checked={checked}
                  onCheckedChange={() => handleCategoryToggle(category.slug)}
                />
                <span className={checked ? "text-foreground font-medium" : ""}>
                  {category.name}
                </span>
              </label>
            );
          })}
        </div>
      </section>

      <PriceRangeSection
        key={priceRangeKey}
        min={defaultRange[0]}
        max={defaultRange[1]}
        selectedMin={selected.minPrice ?? defaultRange[0]}
        selectedMax={selected.maxPrice ?? defaultRange[1]}
        onCommit={handleRangeCommit}
      />

      <section className="rounded-xs border border-border bg-card p-4 shadow-sm">
        <div className="flex items-center justify-between pb-3">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-foreground">
            Brands
          </h3>
        </div>
        <div className="h-0.5 w-10 bg-primary mb-4" />
        <div className="space-y-2">
          {brands.map((brand) => {
            const checked = selected.brand === brand;
            return (
              <label
                key={brand}
                className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer"
              >
                <Checkbox
                  checked={checked}
                  onCheckedChange={() => handleBrandToggle(brand)}
                />
                <span className={checked ? "text-foreground font-medium" : ""}>
                  {brand}
                </span>
              </label>
            );
          })}
        </div>
      </section>

      <section className="rounded-xs border border-border bg-card p-4 shadow-sm">
        <div className="flex items-center justify-between pb-3">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-foreground">
            Product Flag
          </h3>
        </div>
        <div className="h-0.5 w-10 bg-primary mb-4" />
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
            <Checkbox
              checked={selected.flag === "best_selling"}
              onCheckedChange={() => handleFlagToggle("best_selling")}
            />
            <span
              className={
                selected.flag === "best_selling"
                  ? "text-foreground font-medium"
                  : ""
              }
            >
              Best Selling
            </span>
          </label>
          <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
            <Checkbox
              checked={selected.flag === "new_arrival"}
              onCheckedChange={() => handleFlagToggle("new_arrival")}
            />
            <span
              className={
                selected.flag === "new_arrival"
                  ? "text-foreground font-medium"
                  : ""
              }
            >
              New Arrival
            </span>
          </label>
        </div>
      </section>
    </div>
  );
}
