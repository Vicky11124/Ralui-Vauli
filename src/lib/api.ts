/**
 * Server functions for the public site and the admin panel. Handlers run only on the server;
 * server-only modules are imported inside them so nothing node-specific reaches the browser.
 */
import { createServerFn } from "@tanstack/react-start";

import { isCategory, type Piece, type SiteData } from "./site-data";

const MAX_IMAGE_BYTES = 4 * 1024 * 1024; // Vercel functions accept bodies up to ~4.5 MB
const ALLOWED_TYPES = ["image/webp", "image/jpeg", "image/png"];

/* ---------------------------------------------------------------- public ---------------------- */

/** Public site address for canonical / Open Graph URLs. */
export const getSiteOrigin = createServerFn({ method: "GET" }).handler(async () => {
  const { siteOrigin, isIndexable } = await import("@/server/site-url");
  const { getRequest } = await import("@tanstack/react-start/server");
  let request: Request | undefined;
  try {
    request = getRequest();
  } catch {
    request = undefined;
  }
  return { origin: siteOrigin(request), indexable: isIndexable() };
});

export const getSiteData = createServerFn({ method: "GET" }).handler(async (): Promise<SiteData> => {
  const { readSiteData } = await import("@/server/storage");
  return readSiteData();
});

/* ---------------------------------------------------------------- session --------------------- */

export const getAdminSession = createServerFn({ method: "GET" }).handler(async () => {
  const { isAdminConfigured, isSignedIn } = await import("@/server/auth");
  const { loadLocalEnv } = await import("@/server/env");
  loadLocalEnv();
  const storage = process.env["BLOB_READ_WRITE_TOKEN"] ? "blob" : process.env["VERCEL"] ? "missing" : "local";
  return { configured: isAdminConfigured(), signedIn: isSignedIn(), storage } as const;
});

export const adminSignIn = createServerFn({ method: "POST" })
  .validator((input: { password: string }) => {
    if (typeof input?.password !== "string" || input.password.length > 200) throw new Error("Enter your password.");
    return input;
  })
  .handler(async ({ data }) => {
    const { signIn } = await import("@/server/auth");
    await signIn(data.password);
    return { ok: true };
  });

export const adminSignOut = createServerFn({ method: "POST" }).handler(async () => {
  const { signOut } = await import("@/server/auth");
  signOut();
  return { ok: true };
});

/* ---------------------------------------------------------------- pieces ---------------------- */

const text = (form: FormData, key: string, max: number) => String(form.get(key) ?? "").trim().slice(0, max);

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40);

/** Checks the first bytes so only real WebP/JPEG/PNG files are stored. */
function looksLikeImage(bytes: Uint8Array, type: string) {
  if (type === "image/jpeg") return bytes[0] === 0xff && bytes[1] === 0xd8;
  if (type === "image/png") return bytes[0] === 0x89 && bytes[1] === 0x50;
  if (type === "image/webp") return String.fromCharCode(...bytes.slice(8, 12)) === "WEBP";
  return false;
}

/** Create (no id) or update (with id) a collection piece. Image is optional on update. */
export const savePiece = createServerFn({ method: "POST" })
  .validator((form: FormData) => {
    if (!(form instanceof FormData)) throw new Error("Invalid form.");
    return form;
  })
  .handler(async ({ data: form }): Promise<SiteData> => {
    const { requireAdmin } = await import("@/server/auth");
    const { readSiteData, writeSiteData, saveImage, removeImage } = await import("@/server/storage");
    requireAdmin();

    const id = text(form, "id", 80);
    const title = text(form, "title", 120);
    const category = text(form, "category", 40);
    if (!title) throw new Error("Give the piece a name.");
    if (!isCategory(category)) throw new Error("Choose a category.");

    const site = await readSiteData();
    const existing = id ? site.pieces.find((p) => p.id === id) : undefined;
    if (id && !existing) throw new Error("That piece no longer exists. Refresh and try again.");

    let image = existing?.image ?? "";
    let width = existing?.width ?? 0;
    let height = existing?.height ?? 0;
    const file = form.get("image");
    if (file instanceof File && file.size > 0) {
      if (!ALLOWED_TYPES.includes(file.type)) throw new Error("Unsupported image format.");
      if (file.size > MAX_IMAGE_BYTES) throw new Error("Image is still too large after optimising (max 4 MB).");
      const bytes = new Uint8Array(await file.arrayBuffer());
      if (!looksLikeImage(bytes, file.type)) throw new Error("That file isn't a valid image.");
      image = await saveImage(bytes, file.type, slugify(title));
      width = Math.max(1, Math.round(Number(form.get("width")) || 0));
      height = Math.max(1, Math.round(Number(form.get("height")) || 0));
      if (existing && existing.image !== image) await removeImage(existing.image);
    }
    if (!image) throw new Error("Add an image for this piece.");

    const piece: Piece = {
      id: existing?.id ?? `piece-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
      title,
      category,
      fabric: text(form, "fabric", 60),
      description: text(form, "description", 500),
      image,
      width,
      height,
      featured: form.get("featured") === "true",
      createdAt: existing?.createdAt ?? new Date().toISOString(),
    };

    site.pieces = existing ? site.pieces.map((p) => (p.id === piece.id ? piece : p)) : [piece, ...site.pieces];
    await writeSiteData(site);
    return site;
  });

export const deletePiece = createServerFn({ method: "POST" })
  .validator((input: { id: string }) => {
    if (typeof input?.id !== "string") throw new Error("Missing piece.");
    return input;
  })
  .handler(async ({ data }): Promise<SiteData> => {
    const { requireAdmin } = await import("@/server/auth");
    const { readSiteData, writeSiteData, removeImage } = await import("@/server/storage");
    requireAdmin();
    const site = await readSiteData();
    const piece = site.pieces.find((p) => p.id === data.id);
    if (!piece) return site;
    site.pieces = site.pieces.filter((p) => p.id !== data.id);
    await writeSiteData(site);
    await removeImage(piece.image);
    return site;
  });

export const movePiece = createServerFn({ method: "POST" })
  .validator((input: { id: string; direction: "up" | "down" }) => {
    if (typeof input?.id !== "string" || !["up", "down"].includes(input.direction)) throw new Error("Invalid move.");
    return input;
  })
  .handler(async ({ data }): Promise<SiteData> => {
    const { requireAdmin } = await import("@/server/auth");
    const { readSiteData, writeSiteData } = await import("@/server/storage");
    requireAdmin();
    const site = await readSiteData();
    const index = site.pieces.findIndex((p) => p.id === data.id);
    const target = data.direction === "up" ? index - 1 : index + 1;
    if (index < 0 || target < 0 || target >= site.pieces.length) return site;
    const [moved] = site.pieces.splice(index, 1);
    site.pieces.splice(target, 0, moved!);
    await writeSiteData(site);
    return site;
  });

/* ---------------------------------------------------------------- settings -------------------- */

export const saveSettings = createServerFn({ method: "POST" })
  .validator((input: { whatsappNumber: string; whatsappMessage: string }) => {
    const digits = String(input?.whatsappNumber ?? "").replace(/\D/g, "");
    if (digits && (digits.length < 10 || digits.length > 15)) {
      throw new Error("Enter the WhatsApp number with country code, e.g. 91 70459 67404.");
    }
    return { whatsappNumber: digits, whatsappMessage: String(input?.whatsappMessage ?? "").trim().slice(0, 300) };
  })
  .handler(async ({ data }): Promise<SiteData> => {
    const { requireAdmin } = await import("@/server/auth");
    const { readSiteData, writeSiteData } = await import("@/server/storage");
    requireAdmin();
    const site = await readSiteData();
    site.settings = { ...site.settings, ...data };
    await writeSiteData(site);
    return site;
  });
