/**
 * Server-only storage for the editable site data and uploaded images.
 *
 * - With BLOB_READ_WRITE_TOKEN set (Vercel Blob store connected): everything is stored in
 *   Vercel Blob. Each save writes a new immutable JSON file and removes older ones, so readers
 *   never get a stale CDN copy.
 * - Without it (local development): data lives in `.data/site.json` and images in
 *   `public/uploads/`, which the dev server serves directly.
 *
 * Only import this from inside server function handlers.
 */
import { randomUUID } from "node:crypto";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";

import { DEFAULT_SETTINGS, SEED_DATA, type SiteData } from "@/lib/site-data";
import { loadLocalEnv } from "./env";

const DATA_PREFIX = "data/site-";

function useBlob() {
  loadLocalEnv();
  return Boolean(process.env["BLOB_READ_WRITE_TOKEN"]);
}

export class StorageNotConfiguredError extends Error {
  constructor() {
    super(
      "Image storage isn't set up on this server. In Vercel, open Storage → Create → Blob, connect it to this project, then redeploy.",
    );
  }
}

/** Vercel's filesystem is read-only; without Blob we cannot save anything there. */
function assertWritable() {
  if (!useBlob() && process.env["VERCEL"]) throw new StorageNotConfiguredError();
}

const localDataFile = () => path.join(process.cwd(), ".data", "site.json");
const localUploadDir = () => path.join(process.cwd(), "public", "uploads");

function normalise(data: Partial<SiteData> | null): SiteData {
  if (!data || !Array.isArray(data.pieces)) return structuredClone(SEED_DATA);
  return { version: 1, pieces: data.pieces, settings: { ...DEFAULT_SETTINGS, ...data.settings } };
}

export async function readSiteData(): Promise<SiteData> {
  if (useBlob()) {
    const { list } = await import("@vercel/blob");
    const { blobs } = await list({ prefix: DATA_PREFIX });
    const latest = blobs.sort((a, b) => +new Date(b.uploadedAt) - +new Date(a.uploadedAt))[0];
    if (!latest) return normalise(null);
    const response = await fetch(latest.url, { cache: "no-store" });
    return normalise(response.ok ? ((await response.json()) as SiteData) : null);
  }
  try {
    return normalise(JSON.parse(await readFile(localDataFile(), "utf8")) as SiteData);
  } catch {
    return normalise(null);
  }
}

export async function writeSiteData(data: SiteData) {
  assertWritable();
  const body = JSON.stringify(data, null, 2);
  if (useBlob()) {
    const { put, list, del } = await import("@vercel/blob");
    const saved = await put(`${DATA_PREFIX}${Date.now()}.json`, body, {
      access: "public",
      contentType: "application/json",
      addRandomSuffix: true,
    });
    const { blobs } = await list({ prefix: DATA_PREFIX });
    const old = blobs.filter((b) => b.url !== saved.url).map((b) => b.url);
    if (old.length) await del(old);
    return;
  }
  await mkdir(path.dirname(localDataFile()), { recursive: true });
  await writeFile(localDataFile(), body, "utf8");
}

/** Saves an already-optimised image and returns its public URL. */
export async function saveImage(bytes: Uint8Array, contentType: string, slug: string) {
  assertWritable();
  const ext = contentType === "image/webp" ? "webp" : contentType === "image/png" ? "png" : "jpg";
  const name = `${slug || "piece"}-${randomUUID().slice(0, 8)}.${ext}`;
  if (useBlob()) {
    const { put } = await import("@vercel/blob");
    const saved = await put(`pieces/${name}`, Buffer.from(bytes), {
      access: "public",
      contentType,
      addRandomSuffix: false,
      cacheControlMaxAge: 60 * 60 * 24 * 365,
    });
    return saved.url;
  }
  await mkdir(localUploadDir(), { recursive: true });
  await writeFile(path.join(localUploadDir(), name), bytes);
  return `/uploads/${name}`;
}

/** Removes an uploaded image. Starter images and unknown URLs are left alone. */
export async function removeImage(url: string) {
  try {
    if (url.startsWith("/uploads/")) {
      await rm(path.join(localUploadDir(), path.basename(url)), { force: true });
    } else if (useBlob() && url.includes(".blob.vercel-storage.com/")) {
      const { del } = await import("@vercel/blob");
      await del(url);
    }
  } catch (error) {
    console.warn("Could not remove image", url, error);
  }
}
