"use client";

import * as React from "react";
import { toast } from "sonner";

import { signIn } from "@/lib/auth-client";
import { ROUTES } from "@/lib/constants";
import { Button } from "@/components/ui/button";

export interface EnabledSocialProviders {
  google?: boolean;
  facebook?: boolean;
}

interface SocialButtonsProps {
  providers: EnabledSocialProviders;
  callbackURL?: string;
}

/**
 * Renders OAuth sign-in buttons for the providers that are configured server-side.
 * Renders nothing when no social provider is enabled.
 */
export function SocialButtons({ providers, callbackURL = ROUTES.dashboard }: SocialButtonsProps) {
  const [pending, setPending] = React.useState<"google" | "facebook" | null>(null);

  const enabled = [providers.google, providers.facebook].some(Boolean);
  if (!enabled) return null;

  async function handle(provider: "google" | "facebook") {
    try {
      setPending(provider);
      await signIn.social({ provider, callbackURL });
    } catch {
      toast.error("Could not start sign-in. Please try again.");
      setPending(null);
    }
  }

  return (
    <div className="grid gap-2">
      {providers.google ? (
        <Button
          type="button"
          variant="outline"
          className="w-full"
          disabled={pending !== null}
          onClick={() => handle("google")}
        >
          <GoogleIcon className="size-4" />
          Continue with Google
        </Button>
      ) : null}

      {providers.facebook ? (
        <Button
          type="button"
          variant="outline"
          className="w-full"
          disabled={pending !== null}
          onClick={() => handle("facebook")}
        >
          <FacebookIcon className="size-4" />
          Continue with Facebook
        </Button>
      ) : null}
    </div>
  );
}

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1Z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84Z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.06l3.66 2.84C6.71 7.3 9.14 5.38 12 5.38Z"
      />
    </svg>
  );
}

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#1877F2"
        d="M24 12a12 12 0 1 0-13.88 11.85v-8.38H7.08V12h3.04V9.36c0-3 1.79-4.67 4.53-4.67 1.31 0 2.68.24 2.68.24v2.95h-1.51c-1.49 0-1.96.93-1.96 1.87V12h3.33l-.53 3.47h-2.8v8.38A12 12 0 0 0 24 12Z"
      />
    </svg>
  );
}
