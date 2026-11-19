import { createFileRoute } from "@tanstack/react-router";
import type { CSSProperties } from "react";
import { Leaf } from "lucide-react";

import processImage from "@/assets/eco-art-process.jpg";
import { photo } from "@/lib/photos";
import { NextChapter, PageHero, SectionHeading, SitePage } from "@/components/site/chrome";
import { ExpandingImage, Reveal } from "@/components/site/motion";

export const Route = createFileRoute("/the-art")({
  head: () => ({
    meta: [
      { title: "The art — RALUI VALUI" },
      {
        name: "description",
        content:
          "Botanical eco-printing and natural dyeing: the handmade process behind every RALUI VALUI piece, on silk, cotton and linen.",
      },
      { property: "og:title", content: "The art of eco-printing & natural dyeing — RALUI VALUI" },
    ],
  }),
  component: ArtPage,
});

const artHero = photo("pr-img7279");
const artExpand = photo("rw-0w3a0179");

const steps = [
  {
    title: "Gathered",
    text: "Leaves and flowers are chosen for their outline, their veins and the colour they hold — the patterns are already growing around us.",
    image: processImage,
    zoom: 2,
    origin: "6% 88%",
  },
  {
    title: "Prepared",
    text: "Only natural-fibre fabrics are used — silk, cotton, linen and other natural textiles. Each is cleaned and readied so it can receive and keep the colour the plants will give.",
    image: photo("pr-img7278").src,
    zoom: 1,
    origin: "center",
  },
  {
    title: "Arranged",
    text: "Each botanical is placed by hand, with care for its natural shape. This is where composition happens — leaf by leaf, with nothing traced or stencilled.",
    image: processImage,
    zoom: 1.15,
    origin: "72% 60%",
  },
  {
    title: "Printed & dyed",
    text: "The cloth is rolled tightly around its leaves, bound and given heat and time. Natural dyes add depth and ground colour as pigment moves from plant into fibre.",
    image: photo("pr-img7272").src,
    zoom: 1,
    origin: "center",
  },
  {
    title: "Revealed",
    text: "Unrolled, rested and finished. The plant's fleeting imprint appears on the cloth — a print that could never be planned, and will never be repeated.",
    image: photo("pr-img7280").src,
    zoom: 1,
    origin: "center",
  },
];

const palette = [
  { name: "Leaf green", note: "Fine leaves and fronds leave crisp, green-grey outlines.", color: "oklch(0.55 0.06 125)" },
  { name: "Earth brown", note: "Tannin-rich leaves give deep, warm browns.", color: "oklch(0.45 0.05 55)" },
  { name: "Rust", note: "Warm reds and oranges that deepen as they rest.", color: "oklch(0.6 0.1 50)" },
  { name: "Sage", note: "Soft, muted greens that settle into the weave.", color: "oklch(0.72 0.045 125)" },
  { name: "Ivory", note: "Natural silk, cotton and linen — the quiet ground for every print.", color: "oklch(0.95 0.02 90)" },
];

const variables = [
  { label: "The leaf", text: "Every leaf and flower is different — and holds different colour through the year. The same plant, a different print." },
  { label: "The placement", text: "Every leaf is laid by hand, so composition is always a fresh decision." },
  { label: "The fibre", text: "Silk, cotton and linen each take colour in their own way, so the cloth shapes the final tone." },
];

function ArtPage() {
  return (
    <SitePage>
      <PageHero
        index="The art"
        eyebrow="From leaf to cloth"
        title={["No two leaves.", <em key="em">No two stories.</em>]}
        description="Botanical eco-printing and natural dyeing — a conversation between plant, natural fibre and heat. Here is how a leaf becomes a print."
        image={artHero.at(1600)}
        imageSrcSet={artHero.srcSet}
        imageAlt="Close-up of fabric eco-printed with leaves and flowers"
        imageWidth={1600}
        imageHeight={2133}
        imagePosition="center 55%"
        scrollTarget="#process"
      />

      <section className="process section-wrap" id="process" aria-labelledby="process-title">
        <SectionHeading
          id="process-title"
          eyebrow="The process"
          lines={["Five slow steps,", <em key="em">by hand.</em>]}
          note="Every piece moves through the same patient process. Scroll through it, one stage at a time."
        />
        <div className="process__stack">
          {steps.map((step, index) => (
            <article className="process-card" key={step.title} style={{ "--i": index } as CSSProperties}>
              <div className="process-card__copy">
                <h3>{step.title}</h3>
                <p>{step.text}</p>
                <span className="process-card__count">Step {index + 1} of {steps.length}</span>
              </div>
              <div className="process-card__image">
                <img src={step.image} alt="" loading="lazy" style={{ scale: String(step.zoom), transformOrigin: step.origin }} />
              </div>
            </article>
          ))}
        </div>
      </section>

      <ExpandingImage src={artExpand.at(1600)} srcSet={artExpand.srcSet} alt="Two models on the runway in leaf-printed silk" position="center 30%">
        <p className="eyebrow">
          <Leaf aria-hidden="true" /> The result
        </p>
        <h2>
          Nature leaves its mark.
          <br />
          <em>We simply make room for it.</em>
        </h2>
      </ExpandingImage>

      <section className="palette section-wrap" aria-labelledby="palette-title">
        <SectionHeading
          id="palette-title"
          eyebrow="What the plants give"
          lines={["A palette", <em key="em">grown, not mixed.</em>]}
          note="Colour in eco-printing and natural dyeing comes from the plants themselves. These are the tones that run through our work."
        />
        <div className="palette__row">
          {palette.map((swatch, index) => (
            <Reveal className="swatch" key={swatch.name} delay={index * 90} variant="up">
              <span className="swatch__chip" style={{ background: swatch.color }} />
              <h3>{swatch.name}</h3>
              <p>{swatch.note}</p>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="variables" aria-labelledby="variables-title">
        <div className="variables__inner">
          <SectionHeading id="variables-title" eyebrow="Why no two are alike" lines={["Three things", <em key="em">we never control.</em>]} />
          <div className="variables__grid">
            {variables.map((item, index) => (
              <Reveal as="article" className="variable" key={item.label} delay={index * 120}>
                <h3>{item.label}</h3>
                <p>{item.text}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <NextChapter current="/the-art" />
    </SitePage>
  );
}
