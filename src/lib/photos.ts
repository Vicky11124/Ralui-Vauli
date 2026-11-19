/**
 * Real shoot photos in public/photos, each saved at 480 / 960 / 1600px wide WebP.
 * `photo(id)` gives an <img>-ready src + srcSet so browsers download only the size they need.
 *
 * Ids: "rw-…" = runway show, "pr-…" = product & market photos.
 */
import { PHOTO_MANIFEST } from "./photo-manifest";

export type PhotoId = keyof typeof PHOTO_MANIFEST;

export type Photo = {
  src: string;
  srcSet: string;
  width: number;
  height: number;
  /** URL of a specific width, for places that take a single URL. */
  at: (width: 480 | 960 | 1600) => string;
};

export function photo(id: PhotoId): Photo {
  const entry = PHOTO_MANIFEST[id];
  const widths = entry.widths as readonly number[];
  const url = (w: number) => `/photos/${id}-${w}.webp`;
  const largest = widths[widths.length - 1] ?? 960;
  const medium = widths.includes(960) ? 960 : largest;
  return {
    src: url(medium),
    srcSet: widths.map((w) => `${url(w)} ${w}w`).join(", "),
    width: medium,
    height: Math.round(medium / entry.ratio),
    at: (w) => url(widths.includes(w) ? w : largest),
  };
}

/* ---------------------------------------------------------------- runway lookbook ------------- */

export const RUNWAY_SETS = [
  {
    id: "yellows",
    title: "Sunlit yellows",
    note: "Leaf prints on warm, naturally dyed golds and yellows.",
    photos: ["rw-0m2a1803", "rw-0w3a0100", "rw-0m2a1818", "rw-0w3a0116", "rw-0w3a0120", "rw-0m2a1825", "rw-0w3a0123", "rw-0w3a0129", "rw-0w3a0055", "rw-0w3a0058", "rw-0w3a0061"],
  },
  {
    id: "ivory",
    title: "Ivory & leaf",
    note: "Soft ivory silhouettes carrying the quiet trace of every leaf.",
    photos: [
      "rw-0w3a0001", "rw-0w3a0015", "rw-0w3a0018", "rw-0w3a0025", "rw-0w3a0035", "rw-0w3a0041", "rw-0w3a0050",
      "rw-0w3a0067", "rw-0w3a0075", "rw-0w3a0085", "rw-0w3a0092", "rw-0w3a0132", "rw-0w3a0137", "rw-0w3a0140",
      "rw-0w3a9938", "rw-0w3a9944", "rw-0w3a9952", "rw-0w3a9954", "rw-0w3a9965", "rw-0w3a9971", "rw-0w3a9983", "rw-0w3a9985",
    ],
  },
  {
    id: "menswear",
    title: "Menswear",
    note: "Relaxed shirts, shorts and trousers, eco-printed in natural tones.",
    photos: ["rw-0m2a1719", "rw-0m2a1841", "rw-0w3a0143", "rw-0w3a0147", "rw-0w3a9918", "rw-0w3a9922", "rw-0w3a9925", "rw-0w3a9928"],
  },
  {
    id: "finale",
    title: "The finale",
    note: "Draped silk in gold and leaf — the closing looks of the show.",
    photos: ["rw-0w3a0154", "rw-0w3a0156", "rw-0w3a0162", "rw-0w3a0165", "rw-0w3a0166", "rw-0w3a0172", "rw-0w3a0179"],
  },
] as const satisfies readonly { id: string; title: string; note: string; photos: readonly PhotoId[] }[];
