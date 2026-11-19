import heroImage from "@/assets/eco-art-hero.jpg";
import processImage from "@/assets/eco-art-process.jpg";
import { photo } from "@/lib/photos";

import { BUSINESS } from "@/lib/site-data";

export const INSTAGRAM_URL = BUSINESS.instagramUrl;
export const INSTAGRAM_DM_URL = BUSINESS.instagramDmUrl;

export type SitePath = "/" | "/collections" | "/our-story" | "/the-art" | "/runway" | "/contact";

export type SitePage = {
  label: string;
  to: SitePath;
  /** Short line used on the "next chapter" link at the foot of each page. */
  teaser: string;
  image: string;
};

export const sitePages: SitePage[] = [
  { label: "Home", to: "/", teaser: "Where nature becomes wearable art", image: heroImage },
  { label: "Our story", to: "/our-story", teaser: "Rooted in nature, made by hand", image: processImage },
  { label: "The art", to: "/the-art", teaser: "Eco-printing & natural dyeing", image: photo("pr-img7278").at(1600) },
  { label: "Runway", to: "/runway", teaser: "A living collection", image: photo("rw-0w3a0120").at(1600) },
  { label: "Collections", to: "/collections", teaser: "Made by nature, made to be yours", image: photo("rw-0w3a9985").at(1600) },
  { label: "Contact", to: "/contact", teaser: "Wear what the earth remembers", image: photo("pr-img7315").at(1600) },
];

/** The page that follows `path` in the navigation order, wrapping back to Home. */
export function nextPage(path: SitePath) {
  const index = sitePages.findIndex((page) => page.to === path);
  return sitePages[(index + 1) % sitePages.length] ?? sitePages[0]!;
}
