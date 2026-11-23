import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, MapPin } from "lucide-react";

import { photo } from "@/lib/photos";
import processImage from "@/assets/eco-art-process.jpg";
import founderImage from "@/assets/founder.jpg";
import { NextChapter, PageHero, SectionHeading, SitePage } from "@/components/site/chrome";
import { Marquee, ParallaxImage, Reveal } from "@/components/site/motion";
import { BUSINESS } from "@/lib/site-data";

export const Route = createFileRoute("/our-story")({
  head: () => ({
    meta: [
      { title: "Our story — RALUI VALUI" },
      {
        name: "description",
        content:
          "RALUI VALUI is a nature-inspired textile and clothing brand from Manipur and Nagaland, founded by Ralui Valui — botanical eco-printing and natural dyeing on natural fibres.",
      },
      { property: "og:title", content: "Our story — RALUI VALUI" },
    ],
  }),
  component: StoryPage,
});

const values = [
  {
    title: "Natural fibres only",
    text: "We work exclusively with natural-fibre fabrics — silk, cotton, linen and other natural textiles — chosen for their texture, comfort, quality and timeless appeal.",
  },
  {
    title: "Colour from nature",
    text: "Leaves, flowers and natural dyes give every piece its pattern and its colour. What you see on the cloth is a true trace of something that grew.",
  },
  {
    title: "Craft, by hand",
    text: "Each creation brings together the beauty of nature and the art of textile craftsmanship — printed, dyed and finished by hand.",
  },
  {
    title: "Celebrating individuality",
    text: "No two leaves are alike, so no two pieces are. Every creation celebrates the relationship between nature, textiles and the person who wears it.",
  },
];

function StoryPage() {
  return (
    <SitePage>
      <PageHero
        index="Our story"
        eyebrow="The heart of RALUI VALUI"
        title={["Fashion,", <>rooted in <em>nature.</em></>]}
        description="A nature-inspired textile and clothing brand from Manipur and Nagaland — specialising in botanical eco-printing, natural dyeing and handcrafted wearable art."
        image={processImage}
        imageAlt="Hands carefully placing leaves onto natural cloth"
        imageWidth={1024}
        imageHeight={1280}
        imagePosition="center 58%"
        scrollTarget="#maker"
      />

      <section className="maker" id="maker" aria-labelledby="maker-title">
        <Reveal variant="clip" className="maker__image">
          <ParallaxImage
            src={founderImage}
            alt="Ralui Valui, founder of RALUI VALUI"
            width={768}
            height={1024}
            position="center 20%"
            strength={14}
          />
        </Reveal>
        <div className="maker__copy">
          <SectionHeading id="maker-title" eyebrow="The founder" lines={[<span key="name" className="nowrap">Ralui <em>Valui.</em></span>]} />
          <Reveal as="p" className="maker__lead" delay={100}>
            Every piece begins with a leaf, a length of natural cloth, and the hand of the maker.
          </Reveal>
          <Reveal as="p" className="maker__body" delay={180}>
            Founded by Ralui Valui, RALUI VALUI specialises in premium handmade textiles — botanical eco-printing,
            natural dyeing and handcrafted wearable art. Fabric and botanicals are brought together by hand, and
            leaves, flowers and natural colour leave their own signatures on the cloth.
          </Reveal>
          <Reveal as="p" className="maker__body" delay={240}>
            The result is thoughtfully crafted clothing and accessories with a real connection to the natural world —
            dresses, silk scarves, naturally dyed shawls, exclusive textiles and limited-edition pieces.
          </Reveal>
          <Reveal as="a" className="maker__place" href={BUSINESS.offices[0].mapsUrl} target="_blank" rel="noreferrer" delay={300}>
            <MapPin aria-hidden="true" /> Made in Manipur & Nagaland
          </Reveal>
        </div>
      </section>

      <Marquee items={["Botanical eco-printing", "Natural dyeing", "Silk · Cotton · Linen", "Handcrafted", "One of a kind"]} tone="olive" />

      <section className="values section-wrap" aria-labelledby="values-title">
        <div className="values__sticky">
          <SectionHeading id="values-title" eyebrow="What we believe" lines={["Nature, textiles", <em key="em">& individuality.</em>]} />
          <Reveal as="p" className="values__intro" delay={200}>
            Four ideas guide every collection — from the fabric we choose to the way a piece is finished.
          </Reveal>
        </div>
        <ol className="values__list">
          {values.map((value, index) => (
            <Reveal as="li" className="value" key={value.title} delay={index * 60}>
              <div>
                <h3>{value.title}</h3>
                <p>{value.text}</p>
              </div>
            </Reveal>
          ))}
        </ol>
      </section>

      <section className="duo" aria-label="Moments from the studio">
        <ParallaxImage className="duo__image duo__image--a" src={photo("pr-img7279").src} srcSet={photo("pr-img7279").srcSet} sizes="(max-width: 760px) 50vw, 40vw" alt="Close-up of eco-printed fabric with leaf impressions" width={960} height={1280} strength={10} />
        <ParallaxImage className="duo__image duo__image--b" src={photo("pr-img7315").src} srcSet={photo("pr-img7315").srcSet} sizes="(max-width: 760px) 50vw, 50vw" alt="The RALUI VALUI market stall with eco-printed clothing on display" width={960} height={1280} position="center 55%" strength={10} />
        <Reveal className="duo__quote">
          <span aria-hidden="true">“</span>
          <p>We believe in the beauty of natural fibres.</p>
          <small>— Ralui Valui</small>
        </Reveal>
      </section>

      <section className="cta-band cta-band--light">
        <Reveal className="cta-band__inner">
          <p className="eyebrow">
            <span className="eyebrow__line" /> Keep reading
          </p>
          <h2>
            See how a leaf
            <br />
            <em>becomes a print.</em>
          </h2>
          <Link className="cta-band__button" to="/the-art">
            Discover the art <ArrowRight aria-hidden="true" />
          </Link>
        </Reveal>
      </section>

      <NextChapter current="/our-story" />
    </SitePage>
  );
}
