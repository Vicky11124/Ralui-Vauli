import { createFileRoute } from "@tanstack/react-router";
import { ArrowUpRight, Instagram } from "lucide-react";

import heroImage from "@/assets/eco-art-hero.jpg";
import textileImage from "@/assets/eco-art-textile.jpg";
import runwayImage from "@/assets/eco-art-runway.jpg";
import { NextChapter, PageHero, SectionHeading, SitePage } from "@/components/site/chrome";
import { INSTAGRAM_URL } from "@/components/site/nav";
import { BUSINESS } from "@/lib/site-data";
import { ExpandingImage, Marquee, ParallaxImage, Reveal, ScrollText } from "@/components/site/motion";

export const Route = createFileRoute("/runway")({
  head: () => ({
    meta: [
      { title: "Runway — RALUI VALUI" },
      {
        name: "description",
        content: "Limited-edition wearable art in motion: botanical eco-printed and naturally dyed looks by RALUI VALUI.",
      },
      { property: "og:title", content: "Runway — RALUI VALUI" },
    ],
  }),
  component: RunwayPage,
});

const looks = [
  {
    number: "Look 01",
    name: "The ivory drape",
    detail: "Light ivory natural fabric, eco-printed with scattered leaves and worn as a single flowing drape.",
    position: "17% 40%",
    strength: 10,
  },
  {
    number: "Look 02",
    name: "Sage layers",
    detail: "A long sage overlay above an ivory print — layered, light and quietly bold.",
    position: "50% 40%",
    strength: 22,
  },
  {
    number: "Look 03",
    name: "Rust & ivory",
    detail: "An ivory botanical column with a naturally dyed rust shawl, carrying the warmth of the earth.",
    position: "84% 40%",
    strength: 14,
  },
];

function RunwayPage() {
  return (
    <SitePage className="page--dark">
      <PageHero
        index="05 — Runway"
        eyebrow="Limited-edition wearable art"
        title={["A living", <em key="em">collection.</em>]}
        description="Botanical eco-prints and natural dyes on flowing natural fibres. See how each print comes alive when it is worn."
        image={runwayImage}
        imageAlt="Three models walking in botanical eco-print designs through a sunlit courtyard"
        imageWidth={1280}
        imageHeight={960}
        imagePosition="center 30%"
        scrollTarget="#looks"
        align="center"
      />

      <section className="statement statement--dark section-wrap">
        <Reveal as="p" className="eyebrow statement__eyebrow" variant="fade">
          <span className="eyebrow__line" /> Botanical studies
        </Reveal>
        <ScrollText text="A print is only half finished on the table. It is completed in motion — in light, in wind, in the way a leaf moves when you walk." />
      </section>

      <section className="lookbook section-wrap" id="looks" aria-labelledby="looks-title">
        <SectionHeading
          id="looks-title"
          eyebrow="The lookbook"
          lines={["Three looks,", <em key="em">one living print.</em>]}
          note="Each look carries its own leaves, its own colour and its own story. None of them can be made twice."
        />
        <div className="lookbook__grid">
          {looks.map((look, index) => (
            <Reveal as="figure" className={`look look--${index + 1}`} key={look.number} delay={index * 140}>
              <ParallaxImage
                className="look__image"
                src={runwayImage}
                alt={`${look.name}: ${look.detail}`}
                width={1280}
                height={960}
                position={look.position}
                strength={look.strength}
              />
              <figcaption>
                <span>{look.number}</span>
                <strong>{look.name}</strong>
                <p>{look.detail}</p>
              </figcaption>
            </Reveal>
          ))}
        </div>
      </section>

      <Marquee items={["Wearable art", "Limited edition", "Eco-printed", "Naturally dyed", "Natural fibres"]} tone="dark" />

      <ExpandingImage src={heroImage} alt="A botanical-print dress worn in an open landscape" position="70% 40%" tone="dark">
        <p className="eyebrow">Out in the open</p>
        <h2>
          Made for the light,
          <br />
          <em>the wind and the walk.</em>
        </h2>
      </ExpandingImage>

      <section className="runway-follow section-wrap">
        <Reveal className="runway-follow__image" variant="clip">
          <img src={textileImage} alt="Close detail of fern prints on ivory cloth" loading="lazy" />
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
