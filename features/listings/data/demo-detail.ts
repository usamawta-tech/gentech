import { LISTING_CONDITION_LABELS } from "@/lib/constants";
import { DEMO_LISTINGS } from "@/features/marketplace/data/fixtures";
import type { AttributePair, ListingCardData, ListingDetail } from "@/types/marketplace";

/** Best-effort spec extraction from a demo title (e.g. "12GB/256GB"). */
function parseSpecs(title: string): AttributePair[] {
  const pairs: AttributePair[] = [];
  const combo = title.match(/(\d+)\s?GB\s?\/\s?(\d+)\s?GB/i);
  if (combo?.[1] && combo[2]) {
    pairs.push({ label: "RAM", value: `${combo[1]}GB` });
    pairs.push({ label: "Storage", value: `${combo[2]}GB` });
  } else {
    const storage = title.match(/(\d+)\s?(GB|TB)\b/i);
    if (storage?.[1] && storage[2]) {
      pairs.push({ label: "Storage", value: `${storage[1]}${storage[2].toUpperCase()}` });
    }
  }
  return pairs;
}

function toDemoDetail(card: ListingCardData): ListingDetail {
  const conditionLabel = LISTING_CONDITION_LABELS[card.condition];
  const ptaApproved = /pta/i.test(card.title);

  const attributes: AttributePair[] = [];
  if (card.brand) attributes.push({ label: "Brand", value: card.brand });
  attributes.push(...parseSpecs(card.title));
  attributes.push({ label: "Condition", value: conditionLabel });
  if (ptaApproved) attributes.push({ label: "PTA Approved", value: "Yes" });

  return {
    id: card.id,
    title: card.title,
    slug: card.slug,
    description: `${card.title} in ${conditionLabel.toLowerCase()} condition, available in ${card.city}. ${
      card.negotiable ? "Price is negotiable — serious buyers only. " : ""
    }Meet in a safe public place and inspect the device before purchase. Box and accessories included where applicable.`,
    price: card.price,
    currency: card.currency ?? "PKR",
    condition: card.condition,
    negotiable: Boolean(card.negotiable),
    city: card.city,
    brand: card.brand,
    brandSlug: card.brandSlug,
    categorySlug: card.categorySlug,
    isFeatured: Boolean(card.isFeatured),
    views: card.views ?? 0,
    createdAt: card.createdAt,
    images: [],
    attributes,
    seller: {
      name: "GenTech Seller",
      city: card.city,
      memberSince: new Date(Date.now() - 400 * 86_400_000).toISOString(),
      rating: 4.8,
      reviewCount: 24,
    },
  };
}

export function getDemoListingDetail(slug: string): ListingDetail | null {
  const card = DEMO_LISTINGS.find((l) => l.slug === slug);
  return card ? toDemoDetail(card) : null;
}

export function getDemoRelated(
  categorySlug: string | undefined,
  excludeId: string,
  limit = 4,
): ListingCardData[] {
  return DEMO_LISTINGS.filter(
    (l) => l.id !== excludeId && (!categorySlug || l.categorySlug === categorySlug),
  ).slice(0, limit);
}
