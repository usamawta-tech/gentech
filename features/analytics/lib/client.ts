/**
 * Provider-agnostic analytics facade.
 *
 * A single `track()` fans an event out to every analytics vendor that happens to be
 * loaded (GTM dataLayer, GA4 gtag, Meta Pixel fbq, Mixpanel). Calls are safe no-ops on
 * the server and when a provider isn't configured — feature code never branches on which
 * vendor is active, so providers can be added/removed purely via env + the script loader.
 */

type Props = Record<string, unknown>;

interface MixpanelLike {
  track: (event: string, props?: Props) => void;
  identify: (id: string) => void;
  reset: () => void;
  people?: { set?: (traits: Props) => void };
}

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
    mixpanel?: MixpanelLike;
  }
}

/** Tracks a custom event across all loaded providers. */
export function track(event: string, props?: Props): void {
  if (typeof window === "undefined") return;
  const payload = props ?? {};

  window.dataLayer?.push({ event, ...payload });
  window.gtag?.("event", event, payload);
  window.fbq?.("trackCustom", event, payload);
  window.mixpanel?.track(event, payload);
}

/** Records a page view. Called on every client-side route change. */
export function pageview(url: string): void {
  if (typeof window === "undefined") return;

  window.dataLayer?.push({ event: "page_view", page_path: url });
  window.gtag?.("event", "page_view", { page_path: url });
  window.fbq?.("track", "PageView");
  window.mixpanel?.track("page_view", { page: url });
}

/** Associates subsequent events with a known user. */
export function identify(userId: string, traits?: Props): void {
  if (typeof window === "undefined") return;

  window.gtag?.("set", { user_id: userId });
  window.dataLayer?.push({ event: "identify", user_id: userId, ...(traits ?? {}) });
  window.mixpanel?.identify(userId);
  if (traits) window.mixpanel?.people?.set?.(traits);
}

/** Clears user association (e.g. on sign-out). */
export function resetAnalytics(): void {
  if (typeof window === "undefined") return;
  window.mixpanel?.reset();
}
