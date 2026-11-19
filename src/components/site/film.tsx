import { useEffect, useRef } from "react";

/**
 * Hero background film: autoplays muted and looped (the only way browsers allow autoplay),
 * and pauses while scrolled out of view so it costs nothing further down the page.
 * On wide screens the portrait clip sits sharp on the right over a blurred still of itself;
 * on phones it fills the hero.
 */
export function HeroVideo({ src, poster, className = "" }: { src: string; poster: string; className?: string }) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    // React doesn't always render the `muted` attribute on the server; iOS needs it set before play().
    video.muted = true;
    const play = () => void video.play().catch(() => {});
    if (typeof IntersectionObserver === "undefined") {
      play();
      return;
    }
    const observer = new IntersectionObserver(([entry]) => (entry?.isIntersecting ? play() : video.pause()), { threshold: 0.05 });
    observer.observe(video);
    return () => observer.disconnect();
  }, []);

  return (
    <div className={`hero-video ${className}`.trim()} aria-hidden="true">
      <img className="hero-video__backdrop" src={poster} alt="" decoding="async" />
      <video ref={ref} className="hero-video__clip" src={src} poster={poster} muted loop playsInline autoPlay preload="auto" />
    </div>
  );
}
