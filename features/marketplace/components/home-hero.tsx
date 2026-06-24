import Link from "next/link";

import { ROUTES } from "@/lib/constants";
import type { CategoryItem } from "@/types/marketplace";
import { SearchBar } from "./search-bar";

export function HomeHero({ popularCategories }: { popularCategories: CategoryItem[] }) {
  return (
    <section className="relative overflow-hidden border-b">
      <div className="bg-primary/5 pointer-events-none absolute inset-0 -z-10 [mask-image:radial-gradient(70%_60%_at_50%_0%,black,transparent)]" />
      <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:py-24">
        <h1 className="text-3xl font-bold tracking-tight text-balance sm:text-5xl">
          Find your next phone, near you.
        </h1>
        <p className="text-muted-foreground mx-auto mt-4 max-w-xl text-base text-pretty sm:text-lg">
          Thousands of phones and accessories from trusted sellers across Pakistan.
        </p>

        <div className="mx-auto mt-8 max-w-2xl">
          <SearchBar variant="hero" />
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
          <span className="text-muted-foreground text-sm">Popular:</span>
          {popularCategories.slice(0, 5).map((category) => (
            <Link
              key={category.id}
              href={`${ROUTES.marketplace}?category=${category.slug}`}
              className="bg-muted hover:bg-accent rounded-full px-3 py-1 text-sm font-medium transition-colors"
            >
              {category.name}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
