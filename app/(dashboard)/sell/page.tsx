import type { Metadata } from "next";

import { DEMO_BRANDS, DEMO_CATEGORIES } from "@/features/marketplace/data/fixtures";
import { CreateListingForm } from "@/features/listings/components/create-listing-form";

export const metadata: Metadata = { title: "Post your ad" };

export default function SellPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <header className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Post your ad</h1>
        <p className="text-muted-foreground text-sm">
          Add a few photos and details to reach thousands of buyers near you.
        </p>
      </header>
      <CreateListingForm categories={DEMO_CATEGORIES} brands={DEMO_BRANDS} />
    </div>
  );
}
