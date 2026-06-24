import type {
  ListingStatus,
  ReportStatus,
  UserRole,
} from "@/lib/constants";

/** Headline metrics for the admin overview. */
export interface PlatformStats {
  totalUsers: number;
  newUsers7d: number;
  totalListings: number;
  activeListings: number;
  soldListings: number;
  openReports: number;
}

/** A row in the admin users table. */
export interface AdminUserRow {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  banned: boolean;
  emailVerified: boolean;
  listingCount: number;
  createdAt: string;
}

/** A row in the admin listings table. */
export interface AdminListingRow {
  id: string;
  title: string;
  slug: string;
  price: number;
  currency: string;
  status: ListingStatus;
  city: string;
  views: number;
  sellerName: string;
  createdAt: string;
}

/** A row in the admin reports queue. */
export interface AdminReportRow {
  id: string;
  reason: string;
  details: string | null;
  status: ReportStatus;
  reporterName: string;
  listing: { title: string; slug: string } | null;
  reportedUserName: string | null;
  createdAt: string;
}

/** A row in the admin categories manager. */
export interface AdminCategoryRow {
  id: string;
  name: string;
  slug: string;
  parentName: string | null;
  isActive: boolean;
  listingCount: number;
  position: number;
}

/** A page of rows plus pagination metadata. */
export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
