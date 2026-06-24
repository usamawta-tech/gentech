import "server-only";

import crypto from "node:crypto";

import { env } from "@/lib/env";

export function isCloudinaryConfigured(): boolean {
  return Boolean(env.CLOUDINARY_CLOUD_NAME && env.CLOUDINARY_API_KEY && env.CLOUDINARY_API_SECRET);
}

export interface SignedUpload {
  cloudName: string;
  apiKey: string;
  timestamp: number;
  folder: string;
  signature: string;
}

/**
 * Produces a short-lived signature for a direct (browser → Cloudinary) upload.
 * The API secret never leaves the server; the client uploads using the returned
 * `signature` + `apiKey` + `timestamp`.
 */
export function createUploadSignature(folder = "listings"): SignedUpload {
  if (!isCloudinaryConfigured()) {
    throw new Error("Cloudinary is not configured.");
  }

  const timestamp = Math.floor(Date.now() / 1000);

  // Sign the alphabetically-sorted params (excluding file, api_key, cloud_name).
  const paramsToSign: Record<string, string | number> = { folder, timestamp };
  const toSign = Object.keys(paramsToSign)
    .sort()
    .map((key) => `${key}=${paramsToSign[key]}`)
    .join("&");

  const signature = crypto
    .createHash("sha1")
    .update(toSign + env.CLOUDINARY_API_SECRET)
    .digest("hex");

  return {
    cloudName: env.CLOUDINARY_CLOUD_NAME!,
    apiKey: env.CLOUDINARY_API_KEY!,
    timestamp,
    folder,
    signature,
  };
}
