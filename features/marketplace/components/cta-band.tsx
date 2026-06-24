import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { cn } from "@/lib/utils";
import { ROUTES } from "@/lib/constants";
import { buttonVariants } from "@/components/ui/button";

export function CtaBand() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16">
      <div className="from-primary/10 to-primary/5 relative overflow-hidden rounded-3xl border bg-gradient-to-br p-8 text-center sm:p-14">
        <h2 className="text-2xl font-bold tracking-tight text-balance sm:text-3xl">
          Got a phone to sell?
        </h2>
        <p className="text-muted-foreground mx-auto mt-3 max-w-md text-pretty">
          List it in under two minutes and reach thousands of buyers near you — for free.
        </p>
        <Link
          href={ROUTES.sell}
          className={cn(buttonVariants({ size: "lg" }), "mt-6 rounded-full")}
        >
          Post your ad
          <ArrowRight className="size-4" />
        </Link>
      </div>
    </section>
  );
}
