"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { cn } from "@/lib/utils";
import { LISTING_CONDITION_LABELS, PK_CITIES } from "@/lib/constants";
import type { BrandItem, CategoryItem, ListingFilters } from "@/types/marketplace";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useListingHref } from "@/features/listings/hooks/use-listing-href";

interface Props {
  categories: CategoryItem[];
  brands: BrandItem[];
  filters: ListingFilters;
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-b py-4 first:pt-0 last:border-b-0">
      <h3 className="mb-2 text-sm font-semibold">{title}</h3>
      {children}
    </div>
  );
}

export function MarketplaceFilters({ categories, brands, filters }: Props) {
  const router = useRouter();
  const buildHref = useListingHref();

  const [minPrice, setMinPrice] = React.useState(filters.minPrice?.toString() ?? "");
  const [maxPrice, setMaxPrice] = React.useState(filters.maxPrice?.toString() ?? "");

  function applyPrice(e: React.FormEvent) {
    e.preventDefault();
    router.push(buildHref({ minPrice: minPrice || null, maxPrice: maxPrice || null }));
  }

  const conditionEntries = Object.entries(LISTING_CONDITION_LABELS);

  return (
    <div className="text-sm">
      <FilterGroup title="Category">
        <ul className="space-y-0.5">
          {categories.map((c) => {
            const active = filters.category === c.slug;
            return (
              <li key={c.id}>
                <Link
                  href={buildHref({ category: active ? null : c.slug })}
                  className={cn(
                    "hover:bg-accent flex items-center justify-between rounded-md px-2 py-1.5",
                    active && "bg-accent font-medium",
                  )}
                >
                  {c.name}
                  {typeof c.count === "number" ? (
                    <span className="text-muted-foreground text-xs">{c.count}</span>
                  ) : null}
                </Link>
              </li>
            );
          })}
        </ul>
      </FilterGroup>

      <FilterGroup title="Brand">
        <div className="flex flex-wrap gap-1.5">
          {brands.map((b) => {
            const active = filters.brand === b.slug;
            return (
              <Link
                key={b.id}
                href={buildHref({ brand: active ? null : b.slug })}
                className={cn(
                  "rounded-full border px-2.5 py-1 text-xs transition-colors",
                  active ? "border-primary bg-primary text-primary-foreground" : "hover:bg-accent",
                )}
              >
                {b.name}
              </Link>
            );
          })}
        </div>
      </FilterGroup>

      <FilterGroup title="Condition">
        <ul className="space-y-0.5">
          {conditionEntries.map(([value, label]) => {
            const active = filters.condition === value;
            return (
              <li key={value}>
                <Link
                  href={buildHref({ condition: active ? null : value })}
                  className={cn(
                    "hover:bg-accent block rounded-md px-2 py-1.5",
                    active && "bg-accent font-medium",
                  )}
                >
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </FilterGroup>

      <FilterGroup title="Price (PKR)">
        <form onSubmit={applyPrice} className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="grid gap-1">
              <Label htmlFor="minPrice" className="text-muted-foreground text-xs">
                Min
              </Label>
              <Input
                id="minPrice"
                inputMode="numeric"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value.replace(/\D/g, ""))}
                placeholder="0"
                className="h-9"
              />
            </div>
            <div className="grid gap-1">
              <Label htmlFor="maxPrice" className="text-muted-foreground text-xs">
                Max
              </Label>
              <Input
                id="maxPrice"
                inputMode="numeric"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value.replace(/\D/g, ""))}
                placeholder="Any"
                className="h-9"
              />
            </div>
          </div>
          <Button type="submit" variant="outline" size="sm" className="w-full">
            Apply price
          </Button>
        </form>
      </FilterGroup>

      <FilterGroup title="City">
        <select
          value={filters.city ?? ""}
          onChange={(e) => router.push(buildHref({ city: e.target.value || null }))}
          aria-label="Filter by city"
          className="border-input bg-background h-9 w-full rounded-md border px-2 text-sm"
        >
          <option value="">All cities</option>
          {PK_CITIES.map((city) => (
            <option key={city} value={city}>
              {city}
            </option>
          ))}
        </select>
      </FilterGroup>
    </div>
  );
}
