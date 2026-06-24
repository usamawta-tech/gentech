import { Eye, Heart, Package, ShoppingBag, Tag } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { SellerStats } from "@/features/seller/types";

/** Compact engagement overview for the seller dashboard. */
export function SellerStatsCards({ stats }: { stats: SellerStats }) {
  const cards = [
    { icon: Package, label: "Listings", value: stats.totalListings },
    { icon: Tag, label: "Active", value: stats.activeListings },
    { icon: ShoppingBag, label: "Sold", value: stats.soldListings },
    { icon: Eye, label: "Views", value: stats.totalViews },
    { icon: Heart, label: "Saves", value: stats.totalFavorites },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {cards.map(({ icon: Icon, label, value }) => (
        <Card key={label}>
          <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{label}</CardTitle>
            <Icon className="text-muted-foreground size-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{value.toLocaleString()}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
