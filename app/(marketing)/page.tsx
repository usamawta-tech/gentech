import { ROUTES } from "@/lib/constants";
import {
  DEMO_CATEGORIES,
  DEMO_FEATURED_LISTINGS,
  DEMO_LATEST_LISTINGS,
} from "@/features/marketplace/data/fixtures";
import { HomeHero } from "@/features/marketplace/components/home-hero";
import { CategoryGrid } from "@/features/marketplace/components/category-grid";
import { ListingsGrid } from "@/features/marketplace/components/listings-grid";
import { SectionHeader } from "@/features/marketplace/components/section-header";
import { HowItWorks } from "@/features/marketplace/components/how-it-works";
import { CtaBand } from "@/features/marketplace/components/cta-band";

export default function HomePage() {
  return (
    <>
      <HomeHero popularCategories={DEMO_CATEGORIES} />

      <section className="mx-auto max-w-6xl px-4 py-12">
        <SectionHeader title="Browse categories" href={ROUTES.marketplace} />
        <CategoryGrid categories={DEMO_CATEGORIES} />
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-12">
        <SectionHeader
          title="Featured listings"
          description="Hand-picked deals from trusted sellers"
          href={`${ROUTES.marketplace}?featured=1`}
        />
        <ListingsGrid listings={DEMO_FEATURED_LISTINGS} />
      </section>

      <HowItWorks />

      <section className="mx-auto max-w-6xl px-4 py-12">
        <SectionHeader
          title="Latest listings"
          description="Fresh ads posted near you"
          href={ROUTES.marketplace}
        />
        <ListingsGrid listings={DEMO_LATEST_LISTINGS} />
      </section>

      <CtaBand />
    </>
  );
}
