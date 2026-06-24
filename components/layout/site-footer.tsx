import { APP } from "@/lib/constants";

export function SiteFooter() {
  return (
    <footer className="border-t">
      <div className="text-muted-foreground mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 py-6 text-sm sm:flex-row">
        <p>
          © {new Date().getFullYear()} {APP.name}. All rights reserved.
        </p>
        <p>Buy & sell mobile phones across Pakistan.</p>
      </div>
    </footer>
  );
}
