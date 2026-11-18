import { createFileRoute, Link } from "@tanstack/react-router";
import { useRef } from "react";
import { ArrowDown, ArrowRight, ArrowUpRight, Instagram, Leaf, MessageCircle } from "lucide-react";

import heroImage from "@/assets/eco-art-hero.jpg";
import processImage from "@/assets/eco-art-process.jpg";
import runwayImage from "@/assets/eco-art-runway.jpg";
import { Button } from "@/components/ui/button";
import { SectionHeading, SitePage } from "@/components/site/chrome";
import { Marquee, ParallaxImage, Reveal, useScrollProgress } from "@/components/site/motion";
import { INSTAGRAM_URL } from "@/components/site/nav";
import { useSiteData, useWhatsApp } from "@/components/site/use-site";
import { categoryLabel } from "@/lib/site-data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "RALUI VALUI — Where Nature Becomes Wearable Art" },
      {
        name: "description",
        content:
          "RALUI VALUI: botanical eco-printed clothing, silk scarves, naturally dyed shawls and limited-edition wearable art on natural fibres. Ukhrul & Dimapur.",
      },
      { property: "og:title", content: "RALUI VALUI — Wearable Botanical Art" },
      {
        property: "og:description",
        content:
          "Botanical eco-printing and natural dyeing on silk, cotton and linen — handcrafted, one of a kind.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const PREVIEW_MODIFIERS = ["collection-item--tall", "", "collection-item--offset"];

/** Home panel: the first three pieces marked "featured" in /admin, topped up with the newest. */
function useCollectionPreviews() {
  const { pieces } = useSiteData();
  const featured = pieces.filter((p) => p.featured);
  const rest = pieces.filter((p) => !p.featured);
  return [...featured, ...rest].slice(0, 3);
}

function Index() {
  const heroRef = useRef<HTMLElement>(null);
  useScrollProgress(heroRef, "through");
  const previews = useCollectionPreviews();
  const whatsapp = useWhatsApp();

  return (
    <SitePage>
      <section ref={heroRef} className="hero" id="home" aria-labelledby="hero-title">
        <ParallaxImage
          className="hero__image"
          src={heroImage}
          alt="An artist in a flowing ivory botanical-print dress in an open landscape"
          width={1920}
          height={1200}
          strength={16}
          priority
        />
        <div className="hero__shade" />
        <div className="hero__content">
          <p className="eyebrow hero__eyebrow">
            <Leaf aria-hidden="true" /> Art born of the earth
          </p>
          <h1 id="hero-title">
            Where nature
            <br />
            becomes <em>wearable</em> art.
          </h1>
          <p className="hero__description">
            Botanical eco-printing, natural dyeing and handcrafted wearable art — on silk, cotton, linen and other natural fibres.
          </p>
          <div className="hero__actions">
            <Button asChild className="button-ivory">
              <Link to="/collections">
                Explore collections <ArrowRight aria-hidden="true" />
              </Link>
            </Button>
            <Link className="hero__story-link" to="/our-story">
              Discover our story <ArrowDown aria-hidden="true" />
            </Link>
          </div>
        </div>
        <p className="hero__index">
          <span /> Handmade in Ukhrul & Dimapur
        </p>
        <a className="hero__scroll" href="#collections" aria-label="Scroll to collections">
          <ArrowDown aria-hidden="true" />
        </a>
      </section>

      <section className="intro-band" aria-label="Our approach">
        <Reveal as="p" variant="fade">Natural fibres. Natural colour.</Reveal>
        <span aria-hidden="true">✳</span>
        <Reveal as="p" variant="fade" delay={150}>Every piece, one of a kind.</Reveal>
      </section>

      <section className="collections section-wrap" id="collections" aria-labelledby="collections-title">
        <SectionHeading
          id="collections-title"
          eyebrow="A considered collection"
          lines={["Made by nature.", <em key="em">Made to be yours.</em>]}
          note="Eco-printed dresses, silk scarves, naturally dyed shawls and exclusive textiles — each carrying the true trace of a leaf."
        />
        <div className="collection-grid">
          {previews.map((piece, index) => {
            const modifier = PREVIEW_MODIFIERS[index] ?? "";
            return (
              <Reveal key={piece.id} delay={index * 140} className={`collection-cell ${modifier.replace("item", "cell")}`.trim()}>
                <Link to="/collections" search={{ category: piece.category }} className={`collection-item ${modifier}`.trim()}>
                  <div className="collection-item__image-wrap">
                    <img src={piece.image} alt={piece.title} width={piece.width} height={piece.height} loading="lazy" />
                    <span className="collection-item__arrow">
                      <ArrowUpRight aria-hidden="true" />
                    </span>
                  </div>
                  <div className="collection-item__caption">
                    <span>{piece.title}</span>
                    <span>{categoryLabel(piece.category)}</span>
                  </div>
                </Link>
              </Reveal>
            );
          })}
        </div>
        <Reveal className="section-more">
          <Link className="text-link" to="/collections">
            View all collections <ArrowRight aria-hidden="true" />
          </Link>
        </Reveal>
      </section>

      <section className="story" id="story" aria-labelledby="story-title">
        <Reveal variant="clip" className="story__image-wrap">
          <ParallaxImage
            src={processImage}
            alt="Leaves are carefully placed by hand onto natural cotton in the printing process"
            width={1024}
            height={1280}
            position="50% 53%"
            strength={14}
          />
          <span className="story__image-note">The hand of the maker, the mark of a leaf.</span>
        </Reveal>
        <div className="story__copy">
          <SectionHeading id="story-title" eyebrow="The heart of RALUI VALUI" lines={["Fashion,", <>rooted in <em>nature.</em></>]} />
          <Reveal as="p" className="story__lead" delay={100}>
            Some of the most beautiful patterns are already growing around us.
          </Reveal>
          <Reveal as="p" className="story__body" delay={180}>
            RALUI VALUI is a nature-inspired textile and clothing brand. Working only with natural fibres — silk, cotton, linen — we use leaves, flowers and natural colour to create distinctive patterns and one-of-a-kind pieces.
          </Reveal>
          <Reveal delay={240}>
            <Link className="text-link" to="/our-story">
              Read our story <ArrowRight aria-hidden="true" />
            </Link>
          </Reveal>
          <Reveal as="p" className="story__signature" delay={300}>
            Handcrafted by Ralui Valui
          </Reveal>
        </div>
      </section>

      <section className="art-section" id="art" aria-labelledby="art-title">
        <div className="art-section__top">
          <Reveal as="p" className="eyebrow" variant="fade">
            <span className="eyebrow__line" /> From leaf to cloth
          </Reveal>
          <span className="art-section__number">THE PROCESS</span>
        </div>
        <h2 id="art-title" className="split-lines">
          <Reveal as="span" variant="mask" className="split-lines__mask">
            <span className="split-lines__line">No two leaves.</span>
          </Reveal>
          <Reveal as="span" variant="mask" className="split-lines__mask" delay={110}>
            <span className="split-lines__line"><em>No two stories.</em></span>
          </Reveal>
        </h2>
        <div className="art-steps">
          {[
            ["Chosen", "Natural-fibre fabrics — silk, cotton, linen — selected for texture, comfort and quality."],
            ["Printed", "Leaves and flowers are laid by hand; heat and time carry their imprint into the cloth."],
            ["Dyed", "Natural colour deepens the piece, finishing a print that can never be repeated."],
          ].map(([title, text], index) => (
            <Reveal as="article" className="art-step" key={title} delay={index * 120}>
              <h3>{title}</h3>
              <p>{text}</p>
            </Reveal>
          ))}
        </div>
        <Reveal className="art-section__foot">
          <Leaf aria-hidden="true" />
          <span>Nature leaves its mark. We simply make room for it.</span>
          <Link className="text-link art-section__more" to="/the-art">
            See the full process <ArrowRight aria-hidden="true" />
          </Link>
        </Reveal>
      </section>

      <Marquee items={["Botanical eco-printing", "Natural dyeing", "Silk · Cotton · Linen", "One of a kind", "Wearable art"]} tone="olive" />

      <section className="runway" id="runway" aria-labelledby="runway-title">
        <ParallaxImage className="runway__media" src={runwayImage} alt="Botanical eco-print designs on the runway" width={1280} height={960} position="center 45%" strength={18} />
        <div className="runway__shade" />
        <div className="runway__copy">
          <Reveal as="p" className="eyebrow" variant="fade">In motion, in season</Reveal>
          <h2 id="runway-title" className="split-lines">
            <Reveal as="span" variant="mask" className="split-lines__mask">
              <span className="split-lines__line">A living</span>
            </Reveal>
            <Reveal as="span" variant="mask" className="split-lines__mask" delay={110}>
              <span className="split-lines__line"><em>collection.</em></span>
            </Reveal>
          </h2>
          <Reveal delay={200}>
            <Link to="/runway" className="runway__link">
              Step inside the collection <ArrowUpRight aria-hidden="true" />
            </Link>
          </Reveal>
        </div>
        <p className="runway__caption">RALUI VALUI — LIMITED-EDITION WEARABLE ART</p>
      </section>

      <section className="contact" id="contact" aria-labelledby="contact-title">
        <SectionHeading id="contact-title" eyebrow="A note from nature" lines={["Wear what", <em key="em">the earth remembers.</em>]} center />
        <Reveal as="p" className="contact__text" delay={150}>
          For custom pieces, collaborations and enquiries about any piece in the collection.
        </Reveal>
        <Reveal className="contact__actions" delay={230}>
          <Button asChild className="contact__button">
            <Link to="/contact">
              Get in touch <ArrowRight aria-hidden="true" />
            </Link>
          </Button>
          {whatsapp ? (
            <a className="whatsapp-button" href={whatsapp} target="_blank" rel="noreferrer">
              <MessageCircle aria-hidden="true" /> Chat on WhatsApp
            </a>
          ) : (
            <a className="text-link" href={INSTAGRAM_URL} target="_blank" rel="noreferrer">
              <Instagram aria-hidden="true" /> Find us on Instagram
            </a>
          )}
        </Reveal>
      </section>
    </SitePage>
  );
}
