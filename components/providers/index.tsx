"use client";

import * as React from "react";

import { ThemeProvider } from "@/components/providers/theme-provider";

/**
 * Single composition point for all client-side context providers.
 * Add future providers (auth session, query client, analytics) here so the
 * root layout never needs to change.
 */
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      {children}
    </ThemeProvider>
  );
}
