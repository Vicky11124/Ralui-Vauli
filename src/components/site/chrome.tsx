import { Link } from "@tanstack/react-router";
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { ArrowDown, ArrowRight, ArrowUp, ArrowUpRight, Instagram, MapPin, Menu, MessageCircle, Phone, X } from "lucide-react";

import logoIvory from "@/assets/logo-ivory.png";
import logoOlive from "@/assets/logo-olive.png";

import { Button } from "@/components/ui/button";
import { BUSINESS } from "@/lib/site-data";
import { nextPage, sitePages, type SitePath } from "./nav";
import { useWhatsApp } from "./use-site";
import { ParallaxImage, Reveal, useScrollProgress } from "./motion";

/* ----------------------------------------------------------------------------------------------
 * Header: transparent over each page's image hero, solid once the page scrolls, with a thin
 * reading-progress line along its bottom edge.
 * -------------------------------------------------------------------------------------------- */

export function SiteHeader() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const progress = max > 0 ? Math.min(1, window.scrollY / max) : 0;
      headerRef.current?.style.setProperty("--page-progress", progress.toFixed(4));
      setIsScrolled(window.scrollY > 24);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && setMenuOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);

  return (
    <header ref={headerRef} className={`site-header${isScrolled || menuOpen ? " site-header--solid" : ""}`}>
      <Link className="brand-logo" to="/" aria-label="RALUI VALUI, home" onClick={closeMenu}>
        {/* Ivory over the image heroes, olive once the header turns solid. */}
        <img className="brand-logo__light" src={logoIvory} alt="RALUI VALUI" width={976} height={109} />
        <img className="brand-logo__dark" src={logoOlive} alt="" aria-hidden="true" width={976} height={109} />
      </Link>

      <nav className="desktop-nav" aria-label="Main navigation">
        {sitePages.map((page) => (
          <Link
            className="nav-link"
            to={page.to}
            key={page.to}
            activeOptions={{ exact: true }}
            activeProps={{ className: "is-active", "aria-current": "page" }}
          >
            {page.label}
          </Link>
        ))}
      </nav>

      <Button asChild className="header-cta">
        <Link to="/collections">
          Explore collections <ArrowUpRight aria-hidden="true" />
        </Link>
      </Button>

      <Button
        className="menu-toggle"
        variant="ghost"
        size="icon"
        aria-label={menuOpen ? "Close navigation" : "Open navigation"}
        aria-expanded={menuOpen}
        onClick={() => setMenuOpen((open) => !open)}
      >
        {menuOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
      </Button>

      {menuOpen && (
        <nav className="mobile-nav" aria-label="Mobile navigation">
          {sitePages.map((page, index) => (
            <Link
              to={page.to}
              key={page.to}
              onClick={closeMenu}
              activeOptions={{ exact: true }}
              activeProps={{ className: "is-active", "aria-current": "page" }}
              style={{ "--item": index } as CSSProperties}
            >
              <span>{page.label}</span>
              <ArrowUpRight aria-hidden="true" />
            </Link>
          ))}
        </nav>
      )}

      <span className="site-header__progress" aria-hidden="true" />
    </header>
  );
}

/* ----------------------------------------------------------------------------------------------
 * Footer
 * -------------------------------------------------------------------------------------------- */

export function SiteFooter() {
  const whatsapp = useWhatsApp();
  return (
    <footer className="site-footer">
      <div className="site-footer__top">
        <Reveal className="site-footer__intro">
          <Link className="brand-logo brand-logo--footer" to="/" aria-label="RALUI VALUI, home">
            <img src={logoIvory} alt="RALUI VALUI" width={976} height={109} loading="lazy" />
          </Link>
          <p>Botanical eco-printing, natural dyeing and handcrafted wearable art — on natural fibres only.</p>
          <div className="site-footer__offices">
            {BUSINESS.offices.map((office) => (
              <a key={office.label} className="site-footer__address" href={office.mapsUrl} target="_blank" rel="noreferrer">
                <MapPin aria-hidden="true" />
                <span>
                  <strong>{office.label}</strong>
                  {office.lines.map((line) => (
                    <span key={line}>{line}</span>
                  ))}
                </span>
              </a>
            ))}
          </div>
        </Reveal>

        <Reveal as="nav" className="site-footer__nav" aria-label="Footer navigation" delay={120}>
          <span className="site-footer__label">Explore</span>
          {sitePages.map((page) => (
            <Link key={page.to} to={page.to}>
              {page.label}
            </Link>
          ))}
        </Reveal>

        <Reveal className="site-footer__social" delay={220}>
          <span className="site-footer__label">Get in touch</span>
          <a className="footer-instagram" href={BUSINESS.instagramUrl} target="_blank" rel="noreferrer">
            <Instagram aria-hidden="true" /> <span>{BUSINESS.instagramHandle}</span>
            <ArrowUpRight aria-hidden="true" />
          </a>
          {whatsapp && (
            <a className="footer-instagram" href={whatsapp} target="_blank" rel="noreferrer">
              <MessageCircle aria-hidden="true" /> <span>WhatsApp: {BUSINESS.phone}</span>
              <ArrowUpRight aria-hidden="true" />
            </a>
          )}
          <a className="footer-instagram" href={`tel:${BUSINESS.phoneTel}`}>
            <Phone aria-hidden="true" /> <span>Call: {BUSINESS.phone}</span>
            <ArrowUpRight aria-hidden="true" />
          </a>
          <button
            type="button"
            className="back-to-top"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          >
            Back to top <ArrowUp aria-hidden="true" />
          </button>
        </Reveal>
      </div>

      <p className="site-footer__giant" aria-hidden="true">
        RALUI VALUI
      </p>

      <div className="site-footer__bottom">
        <span>© {new Date().getFullYear()} RALUI VALUI · {BUSINESS.places}</span>
        <span>Handmade on natural fibres</span>
      </div>
    </footer>
  );
}

/* ----------------------------------------------------------------------------------------------
 * Page shell, hero and the "next chapter" link that ends every page.
 * -------------------------------------------------------------------------------------------- */

export function SitePage({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <>
      <SiteHeader />
      <main className={`brand-site page-enter ${className}`.trim()}>{children}</main>
      <SiteFooter />
      <WhatsAppButton />
    </>
  );
}

type PageHeroProps = {
  index: string;
  eyebrow: string;
  title: ReactNode[];
  description: string;
  image: string;
  /** Optional responsive sources for the hero image. */
  imageSrcSet?: string;
  imageAlt: string;
  imageWidth: number;
  imageHeight: number;
  imagePosition?: string;
  scrollTarget?: string;
  align?: "left" | "center";
};

export function PageHero({
  index,
  eyebrow,
  title,
  description,
  image,
  imageSrcSet,
  imageAlt,
  imageWidth,
  imageHeight,
  imagePosition,
  scrollTarget,
  align = "left",
}: PageHeroProps) {
  const ref = useRef<HTMLElement>(null);
  useScrollProgress(ref, "through");

  return (
    <section ref={ref} className={`page-hero page-hero--${align}`} aria-labelledby="page-title">
      <ParallaxImage
        className="page-hero__image"
        src={image}
        srcSet={imageSrcSet}
        alt={imageAlt}
        width={imageWidth}
        height={imageHeight}
        position={imagePosition}
        strength={18}
        priority
      />
      <div className="page-hero__shade" />
      <div className="page-hero__content">
        <p className="eyebrow page-hero__eyebrow">
          <span className="eyebrow__line" /> {eyebrow}
        </p>
        <h1 id="page-title" className="page-hero__title">
          {title.map((line, i) => (
            <span className="split-lines__mask" key={i}>
              <span className="page-hero__line" style={{ "--line": i } as CSSProperties}>
                {line}
              </span>
            </span>
          ))}
        </h1>
        <p className="page-hero__description">{description}</p>
      </div>
      <p className="hero__index page-hero__index">
        {index} <span />
      </p>
      {scrollTarget && (
        <a className="hero__scroll" href={scrollTarget} aria-label="Scroll to content">
          <ArrowDown aria-hidden="true" />
        </a>
      )}
    </section>
  );
}

export function NextChapter({ current }: { current: SitePath }) {
  const next = nextPage(current);
  return (
    <section className="next-chapter" aria-label="Next page">
      <Link to={next.to} className="next-chapter__link">
        <span className="next-chapter__image" aria-hidden="true">
          <img src={next.image} alt="" loading="lazy" />
        </span>
        <span className="next-chapter__label">Next chapter</span>
        <span className="next-chapter__title">
          {next.label}
          <ArrowRight aria-hidden="true" />
        </span>
        <span className="next-chapter__teaser">{next.teaser}</span>
      </Link>
    </section>
  );
}

/** Section heading in the house style: eyebrow, large editorial title, optional side note. */
export function SectionHeading({
  eyebrow,
  lines,
  note,
  id,
  center = false,
}: {
  eyebrow: string;
  lines: ReactNode[];
  note?: string;
  id?: string;
  center?: boolean;
}) {
  return (
    <div className={`section-heading${center ? " section-heading--center" : ""}`}>
      <div>
        <Reveal as="p" className="eyebrow" variant="fade">
          <span className="eyebrow__line" /> {eyebrow}
        </Reveal>
        <h2 id={id} className="split-lines">
          {lines.map((line, i) => (
            <Reveal as="span" variant="mask" className="split-lines__mask" key={i} delay={i * 110}>
              <span className="split-lines__line">{line}</span>
            </Reveal>
          ))}
        </h2>
      </div>
      {note && (
        <Reveal as="p" className="section-heading__note" delay={200}>
          {note}
        </Reveal>
      )}
    </div>
  );
}

/** Floating WhatsApp chat button. Hidden until a number is saved in /admin → Settings. */
export function WhatsAppButton() {
  const href = useWhatsApp();
  if (!href) return null;
  return (
    <a className="whatsapp-fab" href={href} target="_blank" rel="noreferrer" aria-label="Chat with RALUI VALUI on WhatsApp">
      <svg viewBox="0 0 32 32" aria-hidden="true" focusable="false">
        <path
          fill="currentColor"
          d="M16.04 3C9.4 3 4 8.36 4 14.97c0 2.11.56 4.17 1.62 5.99L4 29l8.27-2.15a12.1 12.1 0 0 0 3.77.6h.01c6.63 0 12.03-5.36 12.03-11.97C28.08 8.36 22.68 3 16.04 3Zm0 21.88h-.01a9.95 9.95 0 0 1-5.07-1.39l-.36-.21-4.91 1.28 1.31-4.77-.24-.38a9.84 9.84 0 0 1-1.52-5.24c0-5.47 4.47-9.92 9.97-9.92 2.66 0 5.16 1.03 7.04 2.91a9.83 9.83 0 0 1 2.92 7.02c0 5.47-4.47 9.9-9.13 9.9Zm5.46-7.43c-.3-.15-1.77-.87-2.04-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.47-.89-.79-1.49-1.76-1.66-2.06-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.49s1.07 2.89 1.22 3.09c.15.2 2.1 3.2 5.08 4.48.71.31 1.27.49 1.7.63.71.23 1.36.2 1.88.12.57-.09 1.77-.72 2.02-1.42.25-.7.25-1.29.17-1.42-.07-.12-.27-.2-.57-.35Z"
        />
      </svg>
      <span className="whatsapp-fab__label">Chat with us</span>
    </a>
  );
}
