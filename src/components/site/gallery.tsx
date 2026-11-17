import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";

import { prefersReducedMotion, useScrollProgress } from "./motion";

export type GalleryItem = {
  image: string;
  alt: string;
  title: string;
  note: string;
  position?: string;
  shape?: "portrait" | "landscape" | "square";
};

/**
 * A row of images that travels sideways while the page scrolls down. The section is made tall
 * enough to cover the sideways distance and its inner frame stays pinned in the meantime.
 * On small screens and with reduced motion it becomes a normal swipeable row.
 */
export function HorizontalGallery({ items, intro }: { items: GalleryItem[]; intro: ReactNode }) {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [pinned, setPinned] = useState(false);
  useScrollProgress(sectionRef, "pin");

  useEffect(() => {
    const section = sectionRef.current;
    const track = trackRef.current;
    if (!section || !track) return;

    const measure = () => {
      const canPin = window.innerWidth > 760 && !prefersReducedMotion();
      setPinned(canPin);
      if (!canPin) {
        section.style.removeProperty("height");
        return;
      }
      const travel = Math.max(0, track.scrollWidth - window.innerWidth);
      section.style.setProperty("--travel", `${travel}px`);
      section.style.height = `${travel + window.innerHeight}px`;
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(track);
    window.addEventListener("resize", measure);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  return (
    <section ref={sectionRef} className={`h-gallery${pinned ? " h-gallery--pinned" : ""}`} aria-label="Gallery">
      <div className="h-gallery__frame">
        <div ref={trackRef} className="h-gallery__track">
          <div className="h-gallery__intro">{intro}</div>
          {items.map((item, index) => (
            <figure
              className={`h-gallery__card h-gallery__card--${item.shape ?? "portrait"}`}
              key={item.title}
              style={{ "--card": index } as CSSProperties}
            >
              <div className="h-gallery__image">
                <img
                  src={item.image}
                  alt={item.alt}
                  loading="lazy"
                  style={item.position ? { objectPosition: item.position } : undefined}
                />
              </div>
              <figcaption>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <strong>{item.title}</strong>
                <em>{item.note}</em>
              </figcaption>
            </figure>
          ))}
        </div>
        <div className="h-gallery__progress" aria-hidden="true">
          <span />
        </div>
      </div>
    </section>
  );
}
