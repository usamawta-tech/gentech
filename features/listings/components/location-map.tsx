import { MapPin } from "lucide-react";

import { env } from "@/lib/env";

export function LocationMap({
  city,
  area,
  latitude,
  longitude,
}: {
  city: string;
  area?: string;
  latitude?: number;
  longitude?: number;
}) {
  const key = env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const query =
    latitude != null && longitude != null
      ? `${latitude},${longitude}`
      : `${area ? `${area}, ` : ""}${city}, Pakistan`;

  return (
    <section>
      <h2 className="mb-3 text-lg font-semibold">Location</h2>
      {key ? (
        <iframe
          title="Listing location"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="aspect-video w-full rounded-xl border"
          src={`https://www.google.com/maps/embed/v1/place?key=${key}&q=${encodeURIComponent(query)}`}
        />
      ) : (
        <div className="bg-muted/40 text-muted-foreground flex aspect-video w-full flex-col items-center justify-center gap-1 rounded-xl border">
          <MapPin className="size-8" />
          <p className="text-foreground text-sm font-medium">
            {area ? `${area}, ` : ""}
            {city}
          </p>
          <p className="text-xs">Approximate location</p>
        </div>
      )}
    </section>
  );
}
