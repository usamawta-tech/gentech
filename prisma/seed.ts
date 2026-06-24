/**
 * Database seed — catalog reference data.
 *
 * Seeds the phone-focused category tree and popular brands. Idempotent: safe to
 * run repeatedly (everything upserts by unique slug). User accounts are NOT seeded
 * here — they go through Better Auth's sign-up flow so passwords hash correctly.
 *
 * Run via `pnpm db:seed` or automatically after `pnpm db:migrate`.
 */
import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "../lib/generated/prisma/client";

// Prisma 7 no longer auto-loads .env; load it for standalone `pnpm db:seed` runs.
try {
  process.loadEnvFile();
} catch {
  // Ignore — env vars may already be present in the ambient environment.
}

/** Category tree: each root may declare children. */
const CATEGORIES: Array<{
  name: string;
  slug: string;
  icon?: string;
  children?: Array<{ name: string; slug: string }>;
}> = [
  {
    name: "Mobile Phones",
    slug: "mobile-phones",
    icon: "smartphone",
    children: [
      { name: "Smartphones", slug: "smartphones" },
      { name: "Feature Phones", slug: "feature-phones" },
      { name: "Tablets", slug: "tablets" },
      { name: "Smart Watches", slug: "smart-watches" },
    ],
  },
  {
    name: "Accessories",
    slug: "accessories",
    icon: "cable",
    children: [
      { name: "Chargers & Cables", slug: "chargers-cables" },
      { name: "Cases & Covers", slug: "cases-covers" },
      { name: "Power Banks", slug: "power-banks" },
      { name: "Earphones & Headphones", slug: "earphones-headphones" },
    ],
  },
];

const BRANDS = [
  "Apple",
  "Samsung",
  "Xiaomi",
  "Oppo",
  "Vivo",
  "Realme",
  "Infinix",
  "Tecno",
  "OnePlus",
  "Google",
  "Nokia",
  "Huawei",
  "Motorola",
];

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function main() {
  const connectionString = process.env.DIRECT_URL ?? process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL (or DIRECT_URL) must be set to seed the database.");
  }

  const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

  try {
    // Categories (roots, then children referencing the root id).
    for (const [rootIndex, root] of CATEGORIES.entries()) {
      const parent = await prisma.category.upsert({
        where: { slug: root.slug },
        update: { name: root.name, icon: root.icon, position: rootIndex },
        create: { name: root.name, slug: root.slug, icon: root.icon, position: rootIndex },
      });

      for (const [childIndex, child] of (root.children ?? []).entries()) {
        await prisma.category.upsert({
          where: { slug: child.slug },
          update: { name: child.name, parentId: parent.id, position: childIndex },
          create: {
            name: child.name,
            slug: child.slug,
            parentId: parent.id,
            position: childIndex,
          },
        });
      }
    }

    // Brands.
    for (const [index, name] of BRANDS.entries()) {
      const slug = slugify(name);
      await prisma.brand.upsert({
        where: { slug },
        update: { name, position: index },
        create: { name, slug, position: index },
      });
    }

    const [categoryCount, brandCount] = await Promise.all([
      prisma.category.count(),
      prisma.brand.count(),
    ]);
    console.info(`✓ Seed complete — ${categoryCount} categories, ${brandCount} brands.`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error("Seed failed:", error);
  process.exit(1);
});
