/**
 * The site's public address, used for canonical tags, the sitemap and robots.txt.
 *
 * 1. SITE_URL, if set (e.g. https://raluivalui.com) — set this once you have a custom domain.
 * 2. On Vercel, the project's production domain (VERCEL_PROJECT_PRODUCTION_URL, provided by
 *    Vercel automatically — it becomes your custom domain once one is added).
 * 3. Otherwise the address of the current request (local development).
 */
import { loadLocalEnv } from "./env";

export function siteOrigin(request?: Request) {
  loadLocalEnv();
  const explicit = process.env["SITE_URL"]?.trim();
  if (explicit) return explicit.replace(/\/+$/, "");
  const production = process.env["VERCEL_PROJECT_PRODUCTION_URL"]?.trim();
  if (production) return `https://${production}`;
  if (request) return new URL(request.url).origin;
  return "http://localhost:8080";
}

/** Only the real production site should be indexed — not Vercel preview deployments. */
export function isIndexable() {
  return !process.env["VERCEL_ENV"] || process.env["VERCEL_ENV"] === "production";
}

/** Public pages listed in the sitemap (admin is deliberately excluded). */
export const PUBLIC_PATHS = ["/", "/our-story", "/the-art", "/runway", "/collections", "/contact"] as const;
