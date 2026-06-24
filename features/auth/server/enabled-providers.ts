import "server-only";

import { env } from "@/lib/env";
import type { EnabledSocialProviders } from "@/features/auth/components/social-buttons";

/** Which social providers are configured (have both client id + secret). */
export function getEnabledSocialProviders(): EnabledSocialProviders {
  return {
    google: Boolean(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET),
    facebook: Boolean(env.FACEBOOK_CLIENT_ID && env.FACEBOOK_CLIENT_SECRET),
  };
}
