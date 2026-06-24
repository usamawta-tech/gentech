"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { SlidersHorizontal, X } from "lucide-react";

import type { BrandItem, CategoryItem, ListingFilters } from "@/types/marketplace";
import { Button } from "@/components/ui/button";
import { MarketplaceFilters } from "./marketplace-filters";

/** Mobile entry point to the filters — opens the sidebar in a slide-over. */
export function FilterDrawer(props: {
  categories: CategoryItem[];
  brands: BrandItem[];
  filters: ListingFilters;
}) {
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <Button variant="outline" size="sm" className="lg:hidden" onClick={() => setOpen(true)}>
        <SlidersHorizontal className="size-4" />
        Filters
      </Button>

      <AnimatePresence>
        {open ? (
          <motion.div
            className="fixed inset-0 z-50 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <button
              aria-label="Close filters"
              className="bg-background/80 absolute inset-0 backdrop-blur-sm"
              onClick={() => setOpen(false)}
            />
            <motion.aside
              className="bg-background absolute inset-y-0 right-0 flex w-80 max-w-[88%] flex-col border-l shadow-xl"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              onClickCapture={(e) => {
                if ((e.target as HTMLElement).closest("a")) setOpen(false);
              }}
            >
              <div className="flex items-center justify-between border-b p-4">
                <h2 className="font-semibold">Filters</h2>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Close"
                  onClick={() => setOpen(false)}
                >
                  <X className="size-5" />
                </Button>
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                <MarketplaceFilters {...props} />
              </div>
            </motion.aside>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
