import type { AttributePair } from "@/types/marketplace";

export function ListingSpecs({ attributes }: { attributes: AttributePair[] }) {
  if (attributes.length === 0) return null;

  return (
    <section>
      <h2 className="mb-3 text-lg font-semibold">Specifications</h2>
      <dl className="grid grid-cols-1 gap-x-10 sm:grid-cols-2">
        {attributes.map((attr) => (
          <div
            key={attr.label}
            className="flex items-center justify-between border-b py-2.5 text-sm"
          >
            <dt className="text-muted-foreground">{attr.label}</dt>
            <dd className="font-medium">{attr.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
