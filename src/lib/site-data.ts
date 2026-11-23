/**
 * Business details and the shape of the editable site data (collection pieces + settings).
 * Safe to import from both browser and server code.
 */
import { photo, RUNWAY_SETS, type PhotoId } from "./photos";

function mapsSearch(query: string) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

export const BUSINESS = {
  name: "RALUI VALUI",
  founder: "Ralui Valui",
  category: "Premium handmade textiles, botanical eco-printing & natural dyeing",
  phone: "+91 70459 67404",
  phoneTel: "+917045967404",
  whatsappNumber: "917045967404",
  offices: [
    {
      label: "Head office",
      lines: ["Hamleikhong C-Block", "Near CHSRC Hospital", "Ukhrul, Manipur – 795142"],
      mapsUrl: mapsSearch("Hamleikhong C-Block, Near CHSRC Hospital, Ukhrul, Manipur 795142"),
    },
    {
      label: "Branch",
      lines: ["Providence Abode Bldg, Purana Bazar", "Near Sumi Baptist Church, Middle Colony", "Dimapur, Nagaland – 797116"],
      mapsUrl: mapsSearch("Providence Abode Building, Purana Bazar, Middle Colony, Dimapur, Nagaland 797116"),
    },
  ],
  places: "Manipur & Nagaland",
  instagramHandle: "@eco_art_by_ralui",
  instagramUrl: "https://www.instagram.com/eco_art_by_ralui/",
  instagramDmUrl: "https://ig.me/m/eco_art_by_ralui",
} as const;

export const CATEGORIES = [
  { id: "clothing", label: "Dresses & clothing", short: "Clothing" },
  { id: "scarves", label: "Silk scarves", short: "Scarves" },
  { id: "shawls", label: "Naturally dyed shawls", short: "Shawls" },
  { id: "textiles", label: "Eco-printed textiles", short: "Textiles" },
  { id: "limited", label: "Limited-edition wearable art", short: "Limited edition" },
  { id: "accessories", label: "Accessories & home", short: "Accessories" },
] as const;

export type CategoryId = (typeof CATEGORIES)[number]["id"];

export const isCategory = (value: unknown): value is CategoryId =>
  typeof value === "string" && CATEGORIES.some((c) => c.id === value);

export const categoryLabel = (id: CategoryId) => CATEGORIES.find((c) => c.id === id)?.label ?? id;

export type Piece = {
  id: string;
  title: string;
  category: CategoryId;
  /** e.g. "Silk", "Cotton", "Linen" */
  fabric: string;
  description: string;
  image: string;
  width: number;
  height: number;
  /** Shown in the home page collection panel (first three featured pieces). */
  featured: boolean;
  createdAt: string;
};

export type Settings = {
  /** International format, digits only once saved, e.g. 917045967404. Empty hides WhatsApp. */
  whatsappNumber: string;
  whatsappMessage: string;
};

/* ---------------------------------------------------------------- runway lookbook ------------- */

export const LOOKBOOK_SETS = RUNWAY_SETS.map(({ id, title, note }) => ({ id, title, note }));
export type LookbookSetId = (typeof RUNWAY_SETS)[number]["id"];
export const isLookbookSet = (value: unknown): value is LookbookSetId =>
  typeof value === "string" && LOOKBOOK_SETS.some((s) => s.id === value);
export const lookbookSetTitle = (id: LookbookSetId) => LOOKBOOK_SETS.find((s) => s.id === id)?.title ?? id;

export type LookbookPhoto = {
  id: string;
  set: LookbookSetId;
  image: string;
  /** Responsive sources for the built-in photos; uploads have a single optimised file. */
  srcSet?: string;
  width: number;
  height: number;
  alt: string;
  createdAt: string;
};

/* ---------------------------------------------------------------- leads ----------------------- */

export type LeadSource = "contact-form" | "piece" | "button";
export const LEAD_SOURCES: Record<LeadSource, string> = {
  "contact-form": "Contact form",
  piece: "Piece enquiry",
  button: "WhatsApp button",
};

/** An enquiry started on the website (the visitor then continues in WhatsApp). */
export type Lead = {
  id: string;
  createdAt: string;
  source: LeadSource;
  status: "new" | "contacted";
  page: string;
  name?: string;
  phone?: string;
  topic?: string;
  message?: string;
  piece?: { id: string; title: string };
};

export type SiteData = {
  version: 1;
  pieces: Piece[];
  lookbook: LookbookPhoto[];
  settings: Settings;
};

export const DEFAULT_SETTINGS: Settings = {
  whatsappNumber: "917045967404",
  whatsappMessage: "Hello Ralui Valui, I found you through your website and would love to know more.",
};

/** Real pieces shown until the owner edits the collection in /admin (then their saved list is used). */
type SeedPiece = [id: PhotoId, title: string, category: CategoryId, description: string, featured?: boolean];

const SEED_PIECES: SeedPiece[] = [
  ["rw-0w3a0120", "Sunlit leaf-print kaftan", "clothing", "A flowing yellow kaftan printed with leaves, naturally dyed in warm sunlit tones.", true],
  ["pr-img7271", "Leaf-print cushion cover", "accessories", "Plum leaf prints on natural cream fabric — a piece of the garden for your home."],
  ["rw-0w3a9983", "Ivory cape-sleeve gown", "limited", "Sweeping cape sleeves in ivory, traced with the faintest leaf prints.", true],
  ["rw-0w3a0154", "Gold silk drape column", "limited", "A softly gathered column worn with a long, leaf-printed golden drape.", true],
  ["pr-img7290", "Cotton tote bag", "accessories", "An eco-printed cotton tote in soft, natural colour — each print entirely its own."],
  ["rw-0w3a0050", "Ivory waistcoat & leaf skirt", "clothing", "A tailored ivory waistcoat paired with a long, leaf-printed skirt."],
  ["pr-img7274", "Fabric-bound journals", "accessories", "Notebooks wrapped in eco-printed fabric, finished with a leather tie."],
  ["rw-0w3a0172", "Mulberry silk gown with cape (teak leaves imprinted)", "clothing", "A mulberry silk gown with a long golden cape, imprinted with teak leaves."],
  ["rw-0w3a0085", "Off-shoulder leaf-print dress", "clothing", "A playful off-shoulder dress with puff sleeves and a scattered leaf print."],
  ["pr-img7357", "Eco-printed scrunchie", "accessories", "A generous scrunchie in naturally printed fabric — the smallest piece of wearable art."],
  ["rw-0w3a0123", "Leaf-print bandeau & skirt", "clothing", "A printed bandeau with a flowing, softly dyed skirt."],
  ["pr-img7272", "Botanical cushion set", "accessories", "Cushion covers printed with large leaves, each one unique."],
  ["rw-0w3a9965", "Kaftan blush dress", "clothing", "A flowing blush-toned kaftan dress with a twisted front and a quiet botanical print."],
  ["pr-img7280", "Sunlit printed journal", "accessories", "A fabric-covered journal printed in yellows and greens."],
  ["rw-0w3a0137", "Ivory peplum & skirt", "clothing", "A one-shoulder peplum top and a long skirt, scattered with leaf prints."],
  ["rw-0w3a9925", "Men's eco-printed shirt", "clothing", "A relaxed short-sleeve shirt with a subtle botanical print."],
  ["pr-img7369", "Scarf, scrunchie & journal", "accessories", "A coordinated set in matching naturally printed fabric — a thoughtful gift."],
  ["rw-0w3a0058", "Yellow jacket & printed skirt", "clothing", "A cream jacket with yellow cuffs over a naturally dyed, leaf-printed skirt."],
  ["pr-img7433", "Naturally dyed pieces", "textiles", "Soft golds and creams from natural dyes, hanging at the market stall."],
  ["pr-img7434", "Waistcoat & sunlit skirt", "clothing", "An ivory waistcoat over a pleated skirt printed in sunny yellow leaves."],
];

/** The runway show photos, grouped into sets; editable in /admin → Runway lookbook. */
export const SEED_LOOKBOOK: LookbookPhoto[] = RUNWAY_SETS.flatMap((set) =>
  set.photos.map((id) => {
    const image = photo(id);
    return {
      id: `seed-${id}`,
      set: set.id,
      image: image.src,
      srcSet: image.srcSet,
      width: image.width,
      height: image.height,
      alt: `Runway look — ${set.title}`,
      createdAt: "2026-11-19T00:00:00.000Z",
    };
  }),
);

export const SEED_DATA: SiteData = {
  version: 1,
  settings: DEFAULT_SETTINGS,
  lookbook: SEED_LOOKBOOK,
  pieces: SEED_PIECES.map(([id, title, category, description, featured = false], index) => {
    const image = photo(id);
    return {
      id: `seed-${id}`,
      title,
      category,
      fabric: "",
      description,
      image: image.src,
      width: image.width,
      height: image.height,
      featured,
      createdAt: new Date(Date.UTC(2026, 10, 19, 0, 0, SEED_PIECES.length - index)).toISOString(),
    };
  }),
};

/** wa.me link, or null when no number is configured. */
export function whatsappLink(settings: Settings, message?: string) {
  const digits = (settings.whatsappNumber || DEFAULT_SETTINGS.whatsappNumber).replace(/\D/g, "");
  if (digits.length < 8) return null;
  const text = message ?? settings.whatsappMessage ?? DEFAULT_SETTINGS.whatsappMessage;
  return `https://wa.me/${digits}${text ? `?text=${encodeURIComponent(text)}` : ""}`;
}
