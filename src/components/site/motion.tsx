import {
  createElement,
  useEffect,
  useRef,
  type CSSProperties,
  type ElementType,
  type ReactNode,
  type RefObject,
} from "react";

/* ------------------------------------------------------------------------------------------------
 * Scroll-linked effects.
 *
 * Where the browser supports CSS scroll-driven animations (Chrome, Edge, Safari 26+), every
 * parallax, pin and fade is declared in styles.css and runs on the compositor, perfectly in step
 * with the scroll. Nothing here runs in that case.
 *
 * Elsewhere (e.g. Firefox) one shared loop writes a `--progress` variable (0 → 1) on each element.
 * It never reads layout while scrolling: element positions are cached and only re-measured when
 * the page resizes, so each frame is a little arithmetic and a few style writes.
 * ---------------------------------------------------------------------------------------------- */

type ProgressMode =
  /** 0 when the element's top meets the viewport bottom, 1 when its bottom leaves the top. */
  | "through"
  /** For tall sections with a sticky child: 0 when the top hits the viewport top, 1 at the end. */
  | "pin"
  /** 0 when the element enters at the bottom, 1 when its centre reaches the viewport centre. */
  | "enter";

type Entry = { el: HTMLElement; mode: ProgressMode; last: number; top: number; height: number };

const entries = new Set<Entry>();
let frame = 0;
let listening = false;
let viewport = 0;
let resizeObserver: ResizeObserver | null = null;

const clamp = (value: number) => Math.min(1, Math.max(0, value));

/** True when the browser runs scroll-linked CSS animations natively. */
export function supportsScrollTimeline() {
  return typeof CSS !== "undefined" && CSS.supports("animation-timeline: view()");
}

/** Re-reads element positions. Only runs on resize / layout changes, never per scroll frame. */
function remeasure() {
  viewport = window.innerHeight;
  const scrollY = window.scrollY;
  const rects = [...entries].map((entry) => entry.el.getBoundingClientRect());
  [...entries].forEach((entry, index) => {
    const rect = rects[index]!;
    entry.top = rect.top + scrollY;
    entry.height = rect.height;
  });
  update();
}

function update() {
  frame = 0;
  const scrollY = window.scrollY;
  const vh = viewport;
  for (const entry of entries) {
    const top = entry.top - scrollY;
    // Skip elements far outside the viewport: nothing about them is visible.
    if (top > vh * 1.5 || top + entry.height < -vh * 0.5) continue;
    let progress: number;
    if (entry.mode === "pin") {
      const travel = entry.height - vh;
      progress = travel > 0 ? clamp(-top / travel) : top <= 0 ? 1 : 0;
    } else if (entry.mode === "enter") {
      progress = clamp((vh - top) / (vh / 2 + entry.height / 2));
    } else {
      progress = clamp((vh - top) / (vh + entry.height));
    }
    const rounded = Math.round(progress * 1000) / 1000;
    if (rounded !== entry.last) {
      entry.last = rounded;
      entry.el.style.setProperty("--progress", String(rounded));
    }
  }
}

function schedule() {
  if (!frame) frame = requestAnimationFrame(update);
}

function scheduleRemeasure() {
  cancelAnimationFrame(frame);
  frame = requestAnimationFrame(remeasure);
}

function start() {
  if (listening) return;
  listening = true;
  window.addEventListener("scroll", schedule, { passive: true });
  window.addEventListener("resize", scheduleRemeasure);
  resizeObserver = new ResizeObserver(scheduleRemeasure);
  resizeObserver.observe(document.body);
}

function stop() {
  if (!listening || entries.size) return;
  listening = false;
  window.removeEventListener("scroll", schedule);
  window.removeEventListener("resize", scheduleRemeasure);
  resizeObserver?.disconnect();
  resizeObserver = null;
}

export function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Keeps a live `--progress` (0 → 1) on the element — only in browsers without native scroll timelines. */
export function useScrollProgress<T extends HTMLElement>(ref: RefObject<T | null>, mode: ProgressMode = "through") {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (prefersReducedMotion()) {
      // Static resting state: everything fully shown, nothing moving.
      el.style.setProperty("--progress", mode === "through" ? "0.5" : "1");
      return;
    }
    if (supportsScrollTimeline()) return;
    const entry: Entry = { el, mode, last: -1, top: 0, height: 0 };
    entries.add(entry);
    start();
    scheduleRemeasure();
    return () => {
      entries.delete(entry);
      stop();
    };
  }, [ref, mode]);
}

/* ------------------------------------------------------------------------------------------------
 * Reveal-on-scroll. Elements start hidden only once the `js` class is on <html> (set before paint
 * in __root.tsx), so the content is always readable without JavaScript.
 * ---------------------------------------------------------------------------------------------- */

type RevealVariant = "up" | "fade" | "mask" | "scale" | "left" | "right" | "clip";

type RevealProps = {
  as?: ElementType;
  variant?: RevealVariant;
  /** Delay in milliseconds. */
  delay?: number;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
  [key: string]: unknown;
};

let revealObserver: IntersectionObserver | null = null;

function getRevealObserver() {
  if (!revealObserver) {
    revealObserver = new IntersectionObserver(
      (items) => {
        for (const item of items) {
          if (item.isIntersecting) {
            item.target.classList.add("is-visible");
            revealObserver?.unobserve(item.target);
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.12 },
    );
  }
  return revealObserver;
}

export function Reveal({ as = "div", variant = "up", delay = 0, className = "", style, children, ...rest }: RevealProps) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (prefersReducedMotion() || typeof IntersectionObserver === "undefined") {
      el.classList.add("is-visible");
      return;
    }
    const observer = getRevealObserver();
    observer.observe(el);
    return () => observer.unobserve(el);
  }, []);

  return createElement(
    as,
    {
      ref,
      className: `reveal reveal--${variant} ${className}`.trim(),
      style: delay ? { ...style, "--reveal-delay": `${delay}ms` } : style,
      ...rest,
    },
    children,
  );
}

/** Image that drifts gently against the scroll direction. */
export function ParallaxImage({
  src,
  alt,
  width,
  height,
  className = "",
  strength = 12,
  position,
  priority = false,
}: {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string | undefined;
  /** Total travel as a percentage of the frame height. */
  strength?: number | undefined;
  position?: string | undefined;
  priority?: boolean | undefined;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useScrollProgress(ref);
  return (
    <div ref={ref} className={`parallax ${className}`.trim()} style={{ "--strength": strength } as CSSProperties}>
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : undefined}
        style={position ? { objectPosition: position } : undefined}
      />
    </div>
  );
}

/** A paragraph that lights up word by word as it scrolls through the viewport. */
export function ScrollText({ text, className = "" }: { text: string; className?: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  useScrollProgress(ref, "enter");
  const words = text.split(" ");
  return (
    <p ref={ref} className={`scroll-text ${className}`.trim()} style={{ "--count": words.length } as CSSProperties}>
      {words.map((word, index) => (
        <span key={index} style={{ "--i": index } as CSSProperties}>
          {word}{" "}
        </span>
      ))}
    </p>
  );
}

/** Endless, slow ticker of words. Pauses on hover. */
export function Marquee({ items, tone = "light" }: { items: string[]; tone?: "light" | "olive" | "dark" }) {
  const row = (hidden: boolean) => (
    <div className="marquee__row" aria-hidden={hidden || undefined}>
      {items.map((item) => (
        <span key={item} className="marquee__item">
          {item}
          <span className="marquee__mark" aria-hidden="true">✳</span>
        </span>
      ))}
    </div>
  );
  return (
    <div className={`marquee marquee--${tone}`}>
      <div className="marquee__track">
        {row(false)}
        {row(true)}
      </div>
    </div>
  );
}

/**
 * A framed image that opens up to full width while its tall section is pinned on screen.
 * Children are laid over the image and fade in as it opens.
 */
export function ExpandingImage({
  src,
  alt,
  position,
  children,
  tone = "light",
}: {
  src: string;
  alt: string;
  position?: string | undefined;
  children?: ReactNode;
  tone?: "light" | "dark";
}) {
  const ref = useRef<HTMLElement>(null);
  useScrollProgress(ref, "pin");
  return (
    <section ref={ref} className={`expand expand--${tone}`}>
      <div className="expand__frame">
        <div className="expand__media">
          <img src={src} alt={alt} loading="lazy" style={position ? { objectPosition: position } : undefined} />
          <div className="expand__shade" />
        </div>
        {children && <div className="expand__copy">{children}</div>}
      </div>
    </section>
  );
}
