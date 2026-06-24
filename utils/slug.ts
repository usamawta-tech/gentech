/** Converts arbitrary text into a URL-safe slug. */
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

/** Slug with a short random suffix to keep listing URLs unique. */
export function uniqueSlug(input: string): string {
  const suffix = Math.random().toString(36).slice(2, 8);
  const base = slugify(input) || "listing";
  return `${base}-${suffix}`;
}
