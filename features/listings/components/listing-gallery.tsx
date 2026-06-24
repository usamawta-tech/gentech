"use client";

import * as React from "react";
import Image from "next/image";
import { Smartphone } from "lucide-react";

import { cn } from "@/lib/utils";
import type { ListingImageData } from "@/types/marketplace";

export function ListingGallery({
  images,
  title,
  brand,
}: {
  images: ListingImageData[];
  title: string;
  brand?: string;
}) {
  const [active, setActive] = React.useState(0);

  if (images.length === 0) {
    return (
      <div className="from-primary/10 to-primary/5 text-foreground/30 flex aspect-4/3 w-full flex-col items-center justify-center gap-2 rounded-xl border bg-gradient-to-br">
        <Smartphone className="size-16" />
        {brand ? <span className="text-foreground/50 font-medium">{brand}</span> : null}
      </div>
    );
  }

  const current = images[Math.min(active, images.length - 1)]!;

  return (
    <div className="space-y-3">
      <div className="bg-muted relative aspect-4/3 w-full overflow-hidden rounded-xl border">
        <Image
          src={current.url}
          alt={title}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 60vw"
          className="object-cover"
        />
      </div>

      {images.length > 1 ? (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((image, index) => (
            <button
              key={image.url}
              type="button"
              onClick={() => setActive(index)}
              aria-label={`View image ${index + 1}`}
              className={cn(
                "relative size-16 shrink-0 overflow-hidden rounded-lg border-2 transition-colors",
                index === active ? "border-primary" : "border-transparent",
              )}
            >
              <Image src={image.url} alt="" fill sizes="64px" className="object-cover" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
