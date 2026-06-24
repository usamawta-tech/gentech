"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";

/**
 * Accessible light/dark toggle.
 *
 * Icon visibility is driven purely by the `.dark` class via CSS, so there is no
 * hydration mismatch and no `setState`-in-effect. The click handler resolves the
 * concrete theme from `next-themes` at call time and flips it.
 */
export function ThemeToggle() {
  const { setTheme, resolvedTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label="Toggle theme"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
    >
      <Sun className="hidden size-5 dark:block" />
      <Moon className="block size-5 dark:hidden" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
