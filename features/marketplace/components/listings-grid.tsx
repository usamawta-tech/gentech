import type { ListingCardData } from "@/types/marketplace";
import { ListingCard } from "./listing-card";

export function ListingsGrid({ listings }: { listings: ListingCardData[] }) {
  if (listings.length === 0) {
    return (
      <p className="text-muted-foreground rounded-xl border border-dashed p-10 text-center text-sm">
        No listings yet. Be the first to post one.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {listings.map((listing) => (
        <ListingCard key={listing.id} listing={listing} />
      ))}
    </div>
  );
}
