import "server-only";

import { prisma } from "@/lib/prisma";
import { Prisma } from "@/lib/generated/prisma/client";
import { uniqueSlug } from "@/utils/slug";
import type {
  ListingCardData,
  ListingDetail,
  ListingFilters,
  ListingSearchResult,
} from "@/types/marketplace";
import type { CreateListingInput } from "@/features/listings/schemas/create-listing";
import { formatAttributes } from "@/features/listings/lib/attributes";

/** Columns projected for a listing card — keep this tight to avoid over-fetching. */
const cardSelect = {
  id: true,
  title: true,
  slug: true,
  price: true,
  currency: true,
  condition: true,
  city: true,
  isFeatured: true,
  negotiable: true,
  views: true,
  createdAt: true,
  brand: { select: { name: true, slug: true } },
  category: { select: { slug: true } },
  images: {
    where: { isPrimary: true },
    take: 1,
    select: { url: true },
    orderBy: { position: "asc" },
  },
} satisfies Prisma.ListingSelect;

type ListingCardRow = Prisma.ListingGetPayload<{ select: typeof cardSelect }>;

function buildWhere(filters: ListingFilters): Prisma.ListingWhereInput {
  const where: Prisma.ListingWhereInput = {
    status: "ACTIVE",
    deletedAt: null,
  };

  if (filters.q) {
    where.OR = [
      { title: { contains: filters.q, mode: "insensitive" } },
      { description: { contains: filters.q, mode: "insensitive" } },
    ];
  }
  if (filters.category) where.category = { slug: filters.category };
  if (filters.brand) where.brand = { slug: filters.brand };
  if (filters.condition) where.condition = filters.condition;
  if (filters.city) where.city = { equals: filters.city, mode: "insensitive" };

  if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
    where.price = {
      ...(filters.minPrice !== undefined ? { gte: filters.minPrice } : {}),
      ...(filters.maxPrice !== undefined ? { lte: filters.maxPrice } : {}),
    };
  }

  return where;
}

function buildOrderBy(sort: ListingFilters["sort"]): Prisma.ListingOrderByWithRelationInput[] {
  // Featured items always float to the top, then the chosen sort, then a stable tiebreak.
  const featuredFirst: Prisma.ListingOrderByWithRelationInput = { isFeatured: "desc" };
  const tiebreak: Prisma.ListingOrderByWithRelationInput = { createdAt: "desc" };

  switch (sort) {
    case "price_asc":
      return [featuredFirst, { price: "asc" }, tiebreak];
    case "price_desc":
      return [featuredFirst, { price: "desc" }, tiebreak];
    case "popular":
      return [featuredFirst, { views: "desc" }, tiebreak];
    case "recent":
    default:
      return [featuredFirst, tiebreak];
  }
}

function toCardData(row: ListingCardRow): ListingCardData {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    price: Number(row.price),
    currency: row.currency,
    condition: row.condition,
    city: row.city ?? "—",
    brand: row.brand?.name,
    brandSlug: row.brand?.slug,
    categorySlug: row.category.slug,
    isFeatured: row.isFeatured,
    negotiable: row.negotiable,
    views: row.views,
    createdAt: row.createdAt.toISOString(),
    imageUrl: row.images[0]?.url,
  };
}

export async function searchListings(filters: ListingFilters): Promise<ListingSearchResult> {
  const where = buildWhere(filters);
  const skip = (filters.page - 1) * filters.pageSize;

  const [rows, total] = await prisma.$transaction([
    prisma.listing.findMany({
      where,
      orderBy: buildOrderBy(filters.sort),
      skip,
      take: filters.pageSize,
      select: cardSelect,
    }),
    prisma.listing.count({ where }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / filters.pageSize));

  return {
    items: rows.map(toCardData),
    total,
    page: filters.page,
    pageSize: filters.pageSize,
    totalPages,
  };
}

/**
 * Ranked full-text search. Uses `websearch_to_tsquery` + `ts_rank` over the
 * `searchVector` GIN index, with the same structured filters as `searchListings`.
 * Requires `filters.q` to be present.
 */
export async function searchListingsRanked(filters: ListingFilters): Promise<ListingSearchResult> {
  const q = filters.q ?? "";
  const tsquery = Prisma.sql`websearch_to_tsquery('english', ${q})`;

  const conditions: Prisma.Sql[] = [
    Prisma.sql`status = 'ACTIVE'`,
    Prisma.sql`"deletedAt" IS NULL`,
    Prisma.sql`"searchVector" @@ ${tsquery}`,
  ];
  if (filters.category) {
    conditions.push(Prisma.sql`"categoryId" IN (SELECT id FROM "category" WHERE slug = ${filters.category})`);
  }
  if (filters.brand) {
    conditions.push(Prisma.sql`"brandId" IN (SELECT id FROM "brand" WHERE slug = ${filters.brand})`);
  }
  if (filters.condition) {
    conditions.push(Prisma.sql`condition::text = ${filters.condition}`);
  }
  if (filters.city) {
    conditions.push(Prisma.sql`lower(city) = lower(${filters.city})`);
  }
  if (filters.minPrice !== undefined) conditions.push(Prisma.sql`price >= ${filters.minPrice}`);
  if (filters.maxPrice !== undefined) conditions.push(Prisma.sql`price <= ${filters.maxPrice}`);

  const whereSql = Prisma.join(conditions, " AND ");
  const skip = (filters.page - 1) * filters.pageSize;

  const [idRows, countRows] = await Promise.all([
    prisma.$queryRaw<Array<{ id: string }>>(Prisma.sql`
      SELECT id FROM "listing"
      WHERE ${whereSql}
      ORDER BY "isFeatured" DESC, ts_rank("searchVector", ${tsquery}) DESC, "createdAt" DESC
      LIMIT ${filters.pageSize} OFFSET ${skip}
    `),
    prisma.$queryRaw<Array<{ count: bigint }>>(Prisma.sql`
      SELECT count(*)::bigint AS count FROM "listing" WHERE ${whereSql}
    `),
  ]);

  const total = Number(countRows[0]?.count ?? 0);
  const ids = idRows.map((r) => r.id);

  // Fetch card data for the ranked ids, then restore rank order.
  const rows = ids.length
    ? await prisma.listing.findMany({ where: { id: { in: ids } }, select: cardSelect })
    : [];
  const byId = new Map(rows.map((row) => [row.id, toCardData(row)]));
  const items = ids.map((id) => byId.get(id)).filter((x): x is ListingCardData => Boolean(x));

  return {
    items,
    total,
    page: filters.page,
    pageSize: filters.pageSize,
    totalPages: Math.max(1, Math.ceil(total / filters.pageSize)),
  };
}

/** Full projection for the listing detail page. */
const detailSelect = {
  id: true,
  title: true,
  slug: true,
  description: true,
  price: true,
  currency: true,
  condition: true,
  negotiable: true,
  city: true,
  area: true,
  latitude: true,
  longitude: true,
  isFeatured: true,
  views: true,
  videoUrl: true,
  attributes: true,
  createdAt: true,
  brand: { select: { name: true, slug: true } },
  category: { select: { name: true, slug: true } },
  images: {
    orderBy: { position: "asc" },
    select: { url: true, width: true, height: true },
  },
  seller: {
    select: {
      id: true,
      name: true,
      image: true,
      createdAt: true,
      profile: { select: { city: true } },
    },
  },
} satisfies Prisma.ListingSelect;

type ListingDetailRow = Prisma.ListingGetPayload<{ select: typeof detailSelect }>;

function toDetail(row: ListingDetailRow): ListingDetail {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    description: row.description,
    price: Number(row.price),
    currency: row.currency,
    condition: row.condition,
    negotiable: row.negotiable,
    city: row.city ?? "—",
    area: row.area ?? undefined,
    latitude: row.latitude ?? undefined,
    longitude: row.longitude ?? undefined,
    brand: row.brand?.name,
    brandSlug: row.brand?.slug,
    categorySlug: row.category.slug,
    categoryName: row.category.name,
    isFeatured: row.isFeatured,
    views: row.views,
    createdAt: row.createdAt.toISOString(),
    images: row.images.map((img) => ({
      url: img.url,
      width: img.width ?? undefined,
      height: img.height ?? undefined,
    })),
    attributes: formatAttributes(row.attributes),
    videoUrl: row.videoUrl ?? undefined,
    seller: {
      id: row.seller.id,
      name: row.seller.name,
      image: row.seller.image,
      city: row.seller.profile?.city ?? row.city ?? undefined,
      memberSince: row.seller.createdAt.toISOString(),
    },
  };
}

/** A single listing by slug. Increments the view counter (best effort). */
export async function getListingBySlug(slug: string): Promise<ListingDetail | null> {
  const row = await prisma.listing.findFirst({
    where: { slug, deletedAt: null },
    select: detailSelect,
  });
  if (!row) return null;

  void prisma.listing
    .update({ where: { id: row.id }, data: { views: { increment: 1 } } })
    .catch(() => {
      /* view counting is best-effort */
    });

  return toDetail(row);
}

/** Top listing title matches for the search autocomplete. */
export async function suggestListings(
  q: string,
  limit = 6,
): Promise<Array<{ title: string; slug: string }>> {
  return prisma.listing.findMany({
    where: {
      status: "ACTIVE",
      deletedAt: null,
      title: { contains: q, mode: "insensitive" },
    },
    orderBy: [{ isFeatured: "desc" }, { views: "desc" }],
    take: limit,
    select: { title: true, slug: true },
  });
}

/** Up to `limit` other active listings in the same category. */
export async function getRelatedListings(
  categorySlug: string | undefined,
  excludeId: string,
  limit = 4,
): Promise<ListingCardData[]> {
  const rows = await prisma.listing.findMany({
    where: {
      status: "ACTIVE",
      deletedAt: null,
      id: { not: excludeId },
      ...(categorySlug ? { category: { slug: categorySlug } } : {}),
    },
    orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
    take: limit,
    select: cardSelect,
  });
  return rows.map(toCardData);
}

/** All of a seller's listings (any status), newest first. */
export async function getSellerListings(sellerId: string): Promise<ListingCardData[]> {
  const rows = await prisma.listing.findMany({
    where: { sellerId, deletedAt: null },
    orderBy: { createdAt: "desc" },
    select: cardSelect,
  });
  return rows.map(toCardData);
}

/** Builds the category-specific attributes JSON from the validated input. */
function buildAttributes(input: CreateListingInput): Prisma.InputJsonValue | undefined {
  const attributes: Record<string, string | number | boolean> = {};
  if (input.storage) attributes.storage = input.storage;
  if (input.ram) attributes.ram = input.ram;
  if (input.color) attributes.color = input.color;
  if (input.batteryHealth) attributes.batteryHealth = Number(input.batteryHealth);
  if (input.ptaApproved !== undefined) attributes.ptaApproved = input.ptaApproved;
  return Object.keys(attributes).length > 0 ? attributes : undefined;
}

/** Creates a listing (resolving category/brand by slug) with its images. */
export async function createListing(
  input: CreateListingInput,
  sellerId: string,
): Promise<{ id: string; slug: string }> {
  const category = await prisma.category.findUnique({
    where: { slug: input.categorySlug },
    select: { id: true },
  });
  if (!category) throw new Error("Selected category does not exist.");

  const brandId = input.brandSlug
    ? (
        await prisma.brand.findUnique({
          where: { slug: input.brandSlug },
          select: { id: true },
        })
      )?.id
    : undefined;

  const listing = await prisma.listing.create({
    data: {
      title: input.title,
      slug: uniqueSlug(input.title),
      description: input.description,
      price: new Prisma.Decimal(input.price),
      negotiable: input.negotiable ?? false,
      condition: input.condition,
      city: input.city,
      area: input.area,
      attributes: buildAttributes(input),
      sellerId,
      categoryId: category.id,
      brandId,
      images: {
        create: input.images.map((image, index) => ({
          url: image.url,
          publicId: image.publicId,
          width: image.width,
          height: image.height,
          position: index,
          isPrimary: index === 0,
        })),
      },
    },
    select: { id: true, slug: true },
  });

  // Populate the full-text search vector (kept in the app layer so the column stays
  // a normal Prisma-managed column — no DB triggers/generated expressions to maintain).
  await prisma.$executeRaw`
    UPDATE "listing"
    SET "searchVector" = to_tsvector('english', coalesce(title, '') || ' ' || coalesce(description, ''))
    WHERE id = ${listing.id}
  `;

  return listing;
}
