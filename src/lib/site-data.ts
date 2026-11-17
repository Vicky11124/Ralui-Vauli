/**
 * Business details and the shape of the editable site data (collection pieces + settings).
 * Safe to import from both browser and server code.
 */

function mapsSearch(query: string) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

export const BUSINESS = {
  name: "RALUI VALUI",
  founder: "Ralui Valui",
  category: "Premium handmade textiles, botanical eco-printing & natural dyeing",
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
  places: "Ukhrul & Dimapur",
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
  /** International format, digits only once saved, e.g. 919876543210. Empty hides WhatsApp. */
  whatsappNumber: string;
  whatsappMessage: string;
};

export type SiteData = {
  version: 1;
  pieces: Piece[];
  settings: Settings;
};

export const DEFAULT_SETTINGS: Settings = {
  whatsappNumber: "919876543210",
  whatsappMessage: "Hello Ralui Valui, I found you through your website and would love to know more.",
};

/** Starter pieces shown until the owner adds their own through /admin. */
export const SEED_DATA: SiteData = {
  version: 1,
  settings: DEFAULT_SETTINGS,
  pieces: [
    {
      id: "seed-living-print-dress",
      title: "The living print dress",
      category: "clothing",
      fabric: "Natural fibre",
      description: "A flowing botanical eco-printed dress carrying the full shape of the leaf.",
      image: "/seed/living-print-dress.webp",
      width: 960,
      height: 1200,
      featured: true,
      createdAt: "2026-11-17T00:00:00.000Z",
    },
    {
      id: "seed-eco-printed-textiles",
      title: "Eco-printed textile lengths",
      category: "textiles",
      fabric: "Natural fibre",
      description: "Exclusive lengths printed with ferns, leaves and flowers — no two alike.",
      image: "/seed/eco-printed-textiles.webp",
      width: 1000,
      height: 1250,
      featured: true,
      createdAt: "2026-11-17T00:00:01.000Z",
    },
    {
      id: "seed-sage-layered-ensemble",
      title: "Sage layered ensemble",
      category: "limited",
      fabric: "Natural fibre",
      description: "A sheer sage layer over an ivory botanical print. Limited-edition wearable art.",
      image: "/seed/sage-layered-ensemble.webp",
      width: 397,
      height: 496,
      featured: true,
      createdAt: "2026-11-17T00:00:02.000Z",
    },
    {
      id: "seed-rust-shawl-ensemble",
      title: "Rust shawl & ivory print",
      category: "shawls",
      fabric: "Natural fibre",
      description: "A naturally dyed rust shawl worn over an ivory eco-printed column.",
      image: "/seed/rust-shawl-ensemble.webp",
      width: 397,
      height: 496,
      featured: false,
      createdAt: "2026-11-17T00:00:03.000Z",
    },
    {
      id: "seed-ivory-botanical-drape",
      title: "Ivory botanical drape",
      category: "clothing",
      fabric: "Natural fibre",
      description: "Scattered leaf prints on a light ivory drape, made to move.",
      image: "/seed/ivory-botanical-drape.webp",
      width: 397,
      height: 496,
      featured: false,
      createdAt: "2026-11-17T00:00:04.000Z",
    },
    {
      id: "seed-leaf-on-cloth",
      title: "Leaf on cloth — in the making",
      category: "scarves",
      fabric: "Natural fibre",
      description: "Botanicals laid by hand before printing. Each piece begins like this.",
      image: "/seed/leaf-on-cloth.webp",
      width: 1000,
      height: 1250,
      featured: false,
      createdAt: "2026-11-17T00:00:05.000Z",
    },
  ],
};

/** wa.me link, or null when no number is configured. */
export function whatsappLink(settings: Settings, message?: string) {
  const digits = (settings.whatsappNumber || DEFAULT_SETTINGS.whatsappNumber).replace(/\D/g, "");
  if (digits.length < 8) return null;
  const text = message ?? settings.whatsappMessage ?? DEFAULT_SETTINGS.whatsappMessage;
  return `https://wa.me/${digits}${text ? `?text=${encodeURIComponent(text)}` : ""}`;
}
