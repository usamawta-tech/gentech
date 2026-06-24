import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function SectionHeader({
  title,
  description,
  href,
  actionLabel = "See all",
}: {
  title: string;
  description?: string;
  href?: string;
  actionLabel?: string;
}) {
  return (
    <div className="mb-5 flex items-end justify-between gap-4">
      <div>
        <h2 className="text-xl font-bold tracking-tight sm:text-2xl">{title}</h2>
        {description ? <p className="text-muted-foreground text-sm">{description}</p> : null}
      </div>
      {href ? (
        <Link
          href={href}
          className="text-muted-foreground hover:text-foreground flex shrink-0 items-center gap-1 text-sm font-medium"
        >
          {actionLabel}
          <ArrowRight className="size-4" />
        </Link>
      ) : null}
    </div>
  );
}
