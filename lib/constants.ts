/**
 * Centralised, framework-agnostic constants.
 * Single source of truth — never hardcode these values inline.
 */

import { env } from "@/lib/env";

/**
 * Fallbacks mirror the defaults in `lib/env.ts`. They matter only when env
 * validation is skipped (e.g. `SKIP_ENV_VALIDATION=1` during a CI build), where
 * Zod defaults are not applied and the raw value may be `undefined`.
 */
const DEFAULT_APP_NAME = "GenTech";
const DEFAULT_APP_URL = "http://localhost:3000";

/** Application-level metadata. */
export const APP = {
  name: env.NEXT_PUBLIC_APP_NAME ?? DEFAULT_APP_NAME,
  url: env.NEXT_PUBLIC_APP_URL ?? DEFAULT_APP_URL,
  description: "Buy and sell mobile phones near you — fast, safe, and simple.",
  locale: "en-PK",
  defaultCurrency: "PKR",
} as const;

/**
 * User roles. A single account may hold buyer + seller capabilities; ADMIN is a
 * privileged superset. Kept in sync with the Prisma `Role` enum.
 */
export const USER_ROLES = {
  USER: "USER",
  ADMIN: "ADMIN",
} as const;

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];

/** Canonical client-side route paths. Import these instead of string literals. */
export const ROUTES = {
  home: "/",
  marketplace: "/marketplace",
  categories: "/categories",
  sell: "/sell",
  // Auth
  signIn: "/sign-in",
  signUp: "/sign-up",
  forgotPassword: "/forgot-password",
  resetPassword: "/reset-password",
  verifyEmail: "/verify-email",
  // Account
  dashboard: "/dashboard",
  myListings: "/dashboard/listings",
  savedSearches: "/dashboard/saved-searches",
  messages: "/dashboard/messages",
  notifications: "/dashboard/notifications",
  account: "/account",
  // Admin
  admin: "/admin",
  adminUsers: "/admin/users",
  adminListings: "/admin/listings",
  adminReports: "/admin/reports",
  adminCategories: "/admin/categories",
} as const;

/** Routes a signed-out user may not visit (redirected to sign-in). */
export const PROTECTED_ROUTE_PREFIXES = ["/dashboard", "/account", "/admin", "/sell"] as const;

/** Routes a signed-in user should be bounced away from (e.g. back to dashboard). */
export const AUTH_ROUTE_PREFIXES = ["/sign-in", "/sign-up"] as const;

/** Pagination defaults used across feeds and search. */
export const PAGINATION = {
  defaultPageSize: 24,
  maxPageSize: 60,
} as const;

/** Listing condition values — kept in sync with the Prisma `ListingCondition` enum. */
export const LISTING_CONDITIONS = {
  NEW: "NEW",
  OPEN_BOX: "OPEN_BOX",
  USED: "USED",
  REFURBISHED: "REFURBISHED",
  FOR_PARTS: "FOR_PARTS",
} as const;

export type ListingCondition = (typeof LISTING_CONDITIONS)[keyof typeof LISTING_CONDITIONS];

/** Human-readable labels for conditions. */
export const LISTING_CONDITION_LABELS: Record<ListingCondition, string> = {
  NEW: "New",
  OPEN_BOX: "Open Box",
  USED: "Used",
  REFURBISHED: "Refurbished",
  FOR_PARTS: "For Parts",
};

/** Listing lifecycle states — kept in sync with the Prisma `ListingStatus` enum. */
export const LISTING_STATUSES = {
  DRAFT: "DRAFT",
  ACTIVE: "ACTIVE",
  SOLD: "SOLD",
  EXPIRED: "EXPIRED",
  REMOVED: "REMOVED",
} as const;

export type ListingStatus = (typeof LISTING_STATUSES)[keyof typeof LISTING_STATUSES];

/** Human-readable labels for listing statuses. */
export const LISTING_STATUS_LABELS: Record<ListingStatus, string> = {
  DRAFT: "Draft",
  ACTIVE: "Active",
  SOLD: "Sold",
  EXPIRED: "Expired",
  REMOVED: "Removed",
};

/** Notification kinds — kept in sync with the Prisma `NotificationType` enum. */
export const NOTIFICATION_TYPES = {
  MESSAGE: "MESSAGE",
  LISTING_SOLD: "LISTING_SOLD",
  LISTING_EXPIRED: "LISTING_EXPIRED",
  NEW_REVIEW: "NEW_REVIEW",
  PRICE_DROP: "PRICE_DROP",
  SYSTEM: "SYSTEM",
} as const;

export type NotificationType = (typeof NOTIFICATION_TYPES)[keyof typeof NOTIFICATION_TYPES];

/** Report lifecycle states — kept in sync with the Prisma `ReportStatus` enum. */
export const REPORT_STATUSES = {
  OPEN: "OPEN",
  REVIEWING: "REVIEWING",
  RESOLVED: "RESOLVED",
  DISMISSED: "DISMISSED",
} as const;

export type ReportStatus = (typeof REPORT_STATUSES)[keyof typeof REPORT_STATUSES];

export const REPORT_STATUS_LABELS: Record<ReportStatus, string> = {
  OPEN: "Open",
  REVIEWING: "Reviewing",
  RESOLVED: "Resolved",
  DISMISSED: "Dismissed",
};

/** Human-readable labels for report reasons (Prisma `ReportReason` enum). */
export const REPORT_REASON_LABELS: Record<string, string> = {
  SPAM: "Spam",
  SCAM_OR_FRAUD: "Scam or fraud",
  PROHIBITED_ITEM: "Prohibited item",
  COUNTERFEIT: "Counterfeit",
  OFFENSIVE: "Offensive",
  WRONG_CATEGORY: "Wrong category",
  OTHER: "Other",
};

/** Major Pakistani cities for the location selector. */
export const PK_CITIES = [
  "Karachi",
  "Lahore",
  "Islamabad",
  "Rawalpindi",
  "Faisalabad",
  "Multan",
  "Peshawar",
  "Quetta",
  "Gujranwala",
  "Sialkot",
  "Hyderabad",
  "Bahawalpur",
] as const;

export type PkCity = (typeof PK_CITIES)[number];
