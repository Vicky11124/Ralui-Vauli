import { createFileRoute } from "@tanstack/react-router";
import { ArrowUpRight, Instagram } from "lucide-react";

import { NextChapter, PageHero, SectionHeading, SitePage } from "@/components/site/chrome";
import { Lookbook } from "@/components/site/lookbook";
import { INSTAGRAM_URL } from "@/components/site/nav";
import { BUSINESS } from "@/lib/site-data";
import { photo, type PhotoId } from "@/lib/photos";
import { ExpandingImage, Marquee, ParallaxImage, Reveal, ScrollText } from "@/components/site/motion";

export const Route = createFileRoute("/runway")({
  head: () => ({
    meta: [
      { title: "Runway — RALUI VALUI" },
      {
        name: "description",
        content: "Limited-edition wearable art in motion: botanical eco-printed and naturally dyed looks by RALUI VALUI, straight from the runway.",
      },
      { property: "og:title", content: "Runway — RALUI VALUI" },
    ],
  }),
  component: RunwayPage,
});

const hero = photo("rw-0w3a0120");
const expand = photo("rw-0w3a0165");
const follow = photo("pr-img7290");

const looks: { id: PhotoId; name: string; detail: string; strength: number }[] = [
  {
    id: "rw-0w3a9983",
    name: "The ivory cape",
    detail: "Sweeping ivory sleeves traced with the faintest leaf prints — light enough to move with every step.",
    strength: 10,
  },
  {
    id: "rw-0w3a0120",
    name: "Sunlit kaftan",
    detail: "A full, flowing kaftan printed with leaves and naturally dyed in warm, glowing yellows.",
    strength: 18,
  },
  {
    id: "rw-0w3a0154",
    name: "The gold drape",
    detail: "A softly gathered column worn with a long golden drape carrying bold leaf prints.",
    strength: 12,
  },
];

function RunwayPage() {
  return (
    <SitePage className="page--dark">
      <PageHero
        index="Runway"
        eyebrow="Limited-edition wearable art"
        title={["A living", <em key="em">collection.</em>]}
        description="Botanical eco-prints and natural dyes on flowing natural fibres — straight from the runway."
        image={hero.at(1600)}
        imageSrcSet={hero.srcSet}
        imageAlt="A model on the runway twirling a yellow, leaf-printed kaftan"
        imageWidth={1600}
        imageHeight={2400}
        imagePosition="center 28%"
        scrollTarget="#looks"
        align="center"
      />

      <section className="statement statement--dark section-wrap">
        <Reveal as="p" className="eyebrow statement__eyebrow" variant="fade">
          <span className="eyebrow__line" /> On the runway
        </Reveal>
        <ScrollText text="A print is only half finished on the table. It is completed in motion — in light, in wind, in the way a leaf moves when you walk." />
      </section>

      <section className="lookbook section-wrap" id="looks" aria-labelledby="looks-title">
        <SectionHeading
          id="looks-title"
          eyebrow="Signature looks"
          lines={["Three looks,", <em key="em">one living print.</em>]}
          note="Each look carries its own leaves, its own colour and its own story. None of them can be made twice."
        />
        <div className="lookbook__grid">
          {looks.map((look, index) => {
            const p = photo(look.id);
            return (
              <Reveal as="figure" className={`look look--${index + 1}`} key={look.id} delay={index * 140}>
                <ParallaxImage
                  className="look__image"
                  src={p.src}
                  srcSet={p.srcSet}
                  sizes="(max-width: 760px) 50vw, 33vw"
                  alt={`${look.name}: ${look.detail}`}
                  width={p.width}
                  height={p.height}
                  position="center 30%"
                  strength={look.strength}
                />
                <figcaption>
                  <strong>{look.name}</strong>
                  <p>{look.detail}</p>
                </figcaption>
              </Reveal>
            );
          })}
        </div>
      </section>

      <Marquee items={["Wearable art", "Limited edition", "Eco-printed", "Naturally dyed", "Natural fibres"]} tone="dark" />

      <section className="lookbook section-wrap" aria-labelledby="all-looks-title">
        <SectionHeading
          id="all-looks-title"
          eyebrow="The full lookbook"
          lines={["Every look", <em key="em">from the show.</em>]}
          note="Browse by set, and tap any photo to see it full-screen."
        />
        <Lookbook />
      </section>

      <ExpandingImage src={expand.at(1600)} srcSet={expand.srcSet} alt="A model walking away in a long, leaf-printed golden silk drape" position="center 40%" tone="dark">
        <p className="eyebrow">The finale</p>
        <h2>
          Made for the light,
          <br />
          <em>the wind and the walk.</em>
        </h2>
      </ExpandingImage>

      <section className="runway-follow section-wrap">
        <Reveal className="runway-follow__image" variant="clip">
          <img src={follow.src} srcSet={follow.srcSet} sizes="(max-width: 760px) 100vw, 40vw" alt="Eco-printed scarves hanging at the RALUI VALUI stall" loading="lazy" decoding="async" />
        </Reveal>
        <div className="runway-follow__copy">
          <SectionHeading eyebrow="See it first" lines={["Follow the", <em key="em">next collection.</em>]} />
          <Reveal as="p" delay={120}>
            New pieces, works in progress and the moments in between are shared first on Instagram.
          </Reveal>
          <Reveal delay={200}>
            <a className="cta-band__button cta-band__button--ivory" href={INSTAGRAM_URL} target="_blank" rel="noreferrer">
              <Instagram aria-hidden="true" /> Follow {BUSINESS.instagramHandle} <ArrowUpRight aria-hidden="true" />
            </a>
          </Reveal>
        </div>
      </section>

      <NextChapter current="/runway" />
    </SitePage>
  );
}
