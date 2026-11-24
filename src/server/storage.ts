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

import { DEFAULT_SETTINGS, SEED_DATA, SEED_LOOKBOOK, type Lead, type SiteData } from "@/lib/site-data";
import { loadLocalEnv } from "./env";

const DATA_PREFIX = "data/site-";

function useBlob() {
  loadLocalEnv();
  if (!process.env["BLOB_READ_WRITE_TOKEN"]) {
    // Stores connected with a custom prefix expose e.g. MY_STORE_READ_WRITE_TOKEN instead;
    // the Blob SDK only reads BLOB_READ_WRITE_TOKEN, so adopt any blob read-write token we find.
    const key = Object.keys(process.env).find(
      (k) => k.endsWith("_READ_WRITE_TOKEN") && process.env[k]?.startsWith("vercel_blob_rw_"),
    );
    if (key) process.env["BLOB_READ_WRITE_TOKEN"] = process.env[key];
  }
  // Newer stores connect with BLOB_STORE_ID + Vercel OIDC instead of a read-write token.
  return Boolean(process.env["BLOB_READ_WRITE_TOKEN"] || process.env["BLOB_STORE_ID"]);
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
  return {
    version: 1,
    pieces: data.pieces,
    // Saved before the lookbook was editable: start from the built-in runway photos.
    lookbook: Array.isArray(data.lookbook) ? data.lookbook : structuredClone(SEED_LOOKBOOK),
    settings: { ...DEFAULT_SETTINGS, ...data.settings },
  };
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

/* ---------------------------------------------------------------- leads ------------------------
 * One small JSON file per lead (leads/<time>-<id>.json), so visitor enquiries never rewrite the
 * main site data and two enquiries arriving together can't overwrite each other.
 */
const LEAD_PREFIX = "leads/";
const localLeadDir = () => path.join(process.cwd(), ".data", "leads");
const leadFileName = (lead: Lead) => `${lead.createdAt.replace(/[:.]/g, "-")}_${lead.id}.json`;

export async function saveLead(lead: Lead) {
  assertWritable();
  const body = JSON.stringify(lead);
  if (useBlob()) {
    const { put } = await import("@vercel/blob");
    await put(`${LEAD_PREFIX}${leadFileName(lead)}`, body, {
      access: "public",
      contentType: "application/json",
      addRandomSuffix: false,
      allowOverwrite: true,
      cacheControlMaxAge: 60,
    });
    return;
  }
  await mkdir(localLeadDir(), { recursive: true });
  await writeFile(path.join(localLeadDir(), leadFileName(lead)), body, "utf8");
}

/** All leads, newest first. */
export async function listLeads(): Promise<Lead[]> {
  if (useBlob()) {
    const { list } = await import("@vercel/blob");
    const blobs: { url: string; uploadedAt: Date }[] = [];
    let cursor: string | undefined;
    do {
      const page = await list({ prefix: LEAD_PREFIX, limit: 1000, ...(cursor ? { cursor } : {}) });
      blobs.push(...page.blobs);
      cursor = page.hasMore ? page.cursor : undefined;
    } while (cursor);
    const leads = await Promise.all(
      blobs.map(async (b) => {
        // The upload time in the URL skips any cached copy after a status change.
        const res = await fetch(`${b.url}?v=${+new Date(b.uploadedAt)}`, { cache: "no-store" });
        return res.ok ? ((await res.json()) as Lead) : null;
      }),
    );
    return sortLeads(leads.filter((l): l is Lead => Boolean(l)));
  }
  try {
    const { readdir } = await import("node:fs/promises");
    const files = (await readdir(localLeadDir())).filter((f) => f.endsWith(".json"));
    const leads = await Promise.all(
      files.map(async (f) => JSON.parse(await readFile(path.join(localLeadDir(), f), "utf8")) as Lead),
    );
    return sortLeads(leads);
  } catch {
    return [];
  }
}

const sortLeads = (leads: Lead[]) => leads.sort((a, b) => b.createdAt.localeCompare(a.createdAt));

export async function deleteLead(lead: Lead) {
  assertWritable();
  if (useBlob()) {
    const { list, del } = await import("@vercel/blob");
    const { blobs } = await list({ prefix: `${LEAD_PREFIX}${leadFileName(lead)}` });
    if (blobs.length) await del(blobs.map((b) => b.url));
    return;
  }
  await rm(path.join(localLeadDir(), leadFileName(lead)), { force: true });
}
