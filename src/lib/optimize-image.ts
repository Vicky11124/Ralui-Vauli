/**
 * Turns any image the browser can read (JPEG, PNG, WebP, AVIF, GIF, BMP, SVG, and iPhone HEIC/HEIF)
 * into a web-ready file: correctly rotated, at most MAX_EDGE pixels on its long side, and
 * compressed to WebP (JPEG where the browser can't encode WebP). Runs entirely in the browser.
 */

const MAX_EDGE = 2000;
const QUALITY = 0.82;
const MAX_INPUT_BYTES = 50 * 1024 * 1024;

export type OptimisedImage = {
  file: File;
  width: number;
  height: number;
  originalBytes: number;
  previewUrl: string;
};

const isHeic = (file: File) => /image\/hei[cf]/i.test(file.type) || /\.(heic|heif)$/i.test(file.name);

async function decode(blob: Blob): Promise<ImageBitmap | HTMLImageElement> {
  try {
    return await createImageBitmap(blob, { imageOrientation: "from-image" });
  } catch {
    // Older Safari / SVG: fall back to an <img> element.
    const url = URL.createObjectURL(blob);
    try {
      const img = new Image();
      img.decoding = "async";
      img.src = url;
      await img.decode();
      return img;
    } finally {
      URL.revokeObjectURL(url);
    }
  }
}

function toBlob(canvas: HTMLCanvasElement, type: string, quality: number) {
  return new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, quality));
}

export async function optimiseImage(input: File): Promise<OptimisedImage> {
  if (input.size > MAX_INPUT_BYTES) throw new Error("That file is over 50 MB. Please choose a smaller photo.");
  if (!input.type.startsWith("image/") && !isHeic(input)) throw new Error("Please choose an image file.");

  let source: Blob = input;
  if (isHeic(input)) {
    try {
      // Safari can read HEIC natively; other browsers need converting first.
      await createImageBitmap(input);
    } catch {
      const { default: heic2any } = await import("heic2any");
      const converted = await heic2any({ blob: input, toType: "image/jpeg", quality: 0.92 });
      source = Array.isArray(converted) ? converted[0]! : converted;
    }
  }

  let bitmap: ImageBitmap | HTMLImageElement;
  try {
    bitmap = await decode(source);
  } catch {
    throw new Error("This image format can't be read in this browser. Try saving it as JPEG or PNG.");
  }

  const srcWidth = "naturalWidth" in bitmap ? bitmap.naturalWidth : bitmap.width;
  const srcHeight = "naturalHeight" in bitmap ? bitmap.naturalHeight : bitmap.height;
  if (!srcWidth || !srcHeight) throw new Error("This image appears to be empty.");
  const scale = Math.min(1, MAX_EDGE / Math.max(srcWidth, srcHeight));
  const width = Math.round(srcWidth * scale);
  const height = Math.round(srcHeight * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Your browser couldn't process this image.");
  ctx.fillStyle = "#faf7ee"; // transparent PNGs get the site's ivory instead of black
  ctx.fillRect(0, 0, width, height);
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(bitmap, 0, 0, width, height);
  if ("close" in bitmap) bitmap.close();

  let blob = await toBlob(canvas, "image/webp", QUALITY);
  let type = "image/webp";
  if (!blob || blob.type !== "image/webp") {
    blob = await toBlob(canvas, "image/jpeg", 0.85);
    type = "image/jpeg";
  }
  if (!blob) throw new Error("Couldn't compress this image.");

  // Step quality down for unusually detailed photos so uploads stay well under the 4 MB limit.
  for (const q of [0.72, 0.62]) {
    if (blob.size <= 3.5 * 1024 * 1024) break;
    blob = (await toBlob(canvas, type, q)) ?? blob;
  }

  const name = input.name.replace(/\.[^.]+$/, "") + (type === "image/webp" ? ".webp" : ".jpg");
  const file = new File([blob], name, { type });
  return { file, width, height, originalBytes: input.size, previewUrl: URL.createObjectURL(file) };
}

export function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}
