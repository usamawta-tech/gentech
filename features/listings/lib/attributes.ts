import type { AttributePair } from "@/types/marketplace";

const LABELS: Record<string, string> = {
  storage: "Storage",
  ram: "RAM",
  color: "Color",
  batteryHealth: "Battery Health",
  ptaApproved: "PTA Approved",
};

function toTitle(key: string): string {
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/[_-]+/g, " ")
    .replace(/^\w/, (c) => c.toUpperCase())
    .trim();
}

/** Normalises a listing's `attributes` JSON into display-ready label/value rows. */
export function formatAttributes(attributes: unknown): AttributePair[] {
  if (!attributes || typeof attributes !== "object") return [];

  const pairs: AttributePair[] = [];
  for (const [key, raw] of Object.entries(attributes as Record<string, unknown>)) {
    if (raw === null || raw === undefined || raw === "") continue;

    let value: string;
    if (key === "ptaApproved") value = raw ? "Yes" : "No";
    else if (key === "batteryHealth") value = `${raw}%`;
    else value = String(raw);

    pairs.push({ label: LABELS[key] ?? toTitle(key), value });
  }
  return pairs;
}
