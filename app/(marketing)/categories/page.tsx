import type { Metadata } from "next";

import { DEMO_CATEGORIES } from "@/features/marketplace/data/fixtures";
import { CategoryGrid } from "@/features/marketplace/components/category-grid";

export const metadata: Metadata = {
  title: "Categories",
  description: "Browse all phone and accessory categories.",
};

export default function CategoriesPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">All categories</h1>
        <p className="text-muted-foreground mt-1">
          Pick a category to start browsing listings near you.
        </p>
      </header>
      <CategoryGrid categories={DEMO_CATEGORIES} />
    </div>
  );
}
