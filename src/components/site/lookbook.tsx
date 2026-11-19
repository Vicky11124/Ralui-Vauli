import { useCallback, useEffect, useRef, useState, type TouchEvent } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

import { LOOKBOOK_SETS, lookbookSetTitle, type LookbookPhoto, type LookbookSetId } from "@/lib/site-data";
import { useSiteData } from "./use-site";

const STEP = 12;

type SetId = LookbookSetId | "all";

/**
 * The full runway lookbook: filter by set, reveal 12 at a time, and open any photo full-screen
 * (arrows, swipe, ← → keys, Esc to close).
 */
export function Lookbook() {
  const [set, setSet] = useState<SetId>("all");
  const [shown, setShown] = useState(STEP);
  const [open, setOpen] = useState<number | null>(null);

  // Managed in /admin → Runway lookbook. "All" keeps the sets in order.
  const { lookbook } = useSiteData();
  const bySet = (id: LookbookSetId) => lookbook.filter((p) => p.set === id);
  const photos: LookbookPhoto[] = set === "all" ? LOOKBOOK_SETS.flatMap((s) => bySet(s.id)) : bySet(set);
  const visible = photos.slice(0, shown);
  const activeSet = LOOKBOOK_SETS.find((s) => s.id === set);

  const choose = (id: SetId) => {
    setSet(id);
    setShown(STEP);
  };

  return (
    <div className="lookbook-full">
      <div className="lookbook-full__tabs" role="toolbar" aria-label="Filter the lookbook">
        <button type="button" className={set === "all" ? "is-active" : ""} aria-pressed={set === "all"} onClick={() => choose("all")}>
          All looks <span>{lookbook.length}</span>
        </button>
        {LOOKBOOK_SETS.filter((s) => bySet(s.id).length > 0).map((s) => (
          <button type="button" key={s.id} className={set === s.id ? "is-active" : ""} aria-pressed={set === s.id} onClick={() => choose(s.id)}>
            {s.title} <span>{bySet(s.id).length}</span>
          </button>
        ))}
      </div>
      {activeSet && <p className="lookbook-full__note">{activeSet.note}</p>}

      <ul className="lookbook-full__grid" key={set}>
        {visible.map((item, index) => (
          <li key={item.id} style={{ animationDelay: `${(index % STEP) * 45}ms` }}>
            <button type="button" onClick={() => setOpen(index)} aria-label={`Open look ${index + 1} of ${photos.length} (${lookbookSetTitle(item.set)})`}>
              <img src={item.image} srcSet={item.srcSet} sizes={item.srcSet ? "(max-width: 760px) 50vw, 25vw" : undefined} alt={item.alt} width={item.width} height={item.height} loading="lazy" decoding="async" />
            </button>
          </li>
        ))}
      </ul>

      {shown < photos.length && (
        <div className="lookbook-full__more">
          <button type="button" className="cta-band__button cta-band__button--ivory" onClick={() => setShown((n) => n + STEP)}>
            Show more looks
          </button>
          <span>
            Showing {visible.length} of {photos.length}
          </span>
        </div>
      )}

      {open !== null && <Lightbox photos={photos} index={open} onIndex={setOpen} onClose={() => setOpen(null)} />}
    </div>
  );
}

function Lightbox({
  photos,
  index,
  onIndex,
  onClose,
}: {
  photos: LookbookPhoto[];
  index: number;
  onIndex: (i: number) => void;
  onClose: () => void;
}) {
  const touchX = useRef<number | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const go = useCallback((delta: number) => onIndex((index + delta + photos.length) % photos.length), [index, onIndex, photos.length]);

  // Lock page scroll once while the viewer is open (not on every photo change).
  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, onClose]);

  const item = photos[index];
  if (!item) return null;
  const setTitle = lookbookSetTitle(item.set);

  return (
    <div
      className="lightbox"
      role="dialog"
      aria-modal="true"
      aria-label="Runway photo viewer"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
      onTouchStart={(e: TouchEvent) => (touchX.current = e.touches[0]?.clientX ?? null)}
      onTouchEnd={(e: TouchEvent) => {
        const start = touchX.current;
        const end = e.changedTouches[0]?.clientX;
        if (start !== null && end !== undefined && Math.abs(end - start) > 50) go(end < start ? 1 : -1);
        touchX.current = null;
      }}
    >
      <img key={item.id} className="lightbox__image" src={item.image} srcSet={item.srcSet} sizes={item.srcSet ? "(max-width: 760px) 100vw, 60vw" : undefined} alt={item.alt} />
      <button ref={closeRef} type="button" className="lightbox__close" onClick={onClose} aria-label="Close">
        <X aria-hidden="true" />
      </button>
      <button type="button" className="lightbox__nav lightbox__nav--prev" onClick={() => go(-1)} aria-label="Previous photo">
        <ChevronLeft aria-hidden="true" />
      </button>
      <button type="button" className="lightbox__nav lightbox__nav--next" onClick={() => go(1)} aria-label="Next photo">
        <ChevronRight aria-hidden="true" />
      </button>
      <p className="lightbox__caption">
        {setTitle} <span>{index + 1} / {photos.length}</span>
      </p>
    </div>
  );
}
