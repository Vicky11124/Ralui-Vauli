import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Feather, Leaf, MessageCircle, Sparkles } from "lucide-react";

import heroImage from "@/assets/eco-art-hero.jpg";
import textileImage from "@/assets/eco-art-textile.jpg";
import processImage from "@/assets/eco-art-process.jpg";
import runwayImage from "@/assets/eco-art-runway.jpg";
import { NextChapter, PageHero, SectionHeading, SitePage } from "@/components/site/chrome";
import { Reveal } from "@/components/site/motion";
import { useSiteData } from "@/components/site/use-site";
import { BUSINESS, CATEGORIES, categoryLabel, isCategory, whatsappLink, type CategoryId, type Piece } from "@/lib/site-data";

const PAGE_SIZE = 9;

type CollectionSearch = { category?: CategoryId | undefined; page?: number | undefined };

export const Route = createFileRoute("/collections")({
  validateSearch: (search: Record<string, unknown>): CollectionSearch => {
    const page = Number(search["page"]);
    return {
      category: isCategory(search["category"]) ? search["category"] : undefined,
      page: Number.isInteger(page) && page > 1 ? page : undefined,
    };
  },
  head: () => ({
    meta: [
      { title: "Collections — RALUI VALUI" },
      {
        name: "description",
        content:
          "Botanical eco-printed dresses and clothing, handcrafted silk scarves, naturally dyed shawls, exclusive eco-printed textiles and limited-edition wearable art by RALUI VALUI.",
      },
      { property: "og:title", content: "Collections — RALUI VALUI" },
    ],
  }),
  component: CollectionsPage,
});

const chapters = [
  {
    number: "01",
    name: "Eco-printed clothing",
    kind: "Dresses & clothing",
    category: "clothing" as const,
    text: "Botanical eco-printed dresses and clothing in natural fibres. Flowing silhouettes that carry the full shape of the leaf, made to be worn and loved for years.",
    pieces: ["Dresses", "Tunics", "Layering pieces"],
    image: heroImage,
    alt: "A flowing ivory dress printed with botanical leaves, worn in an open landscape",
    position: "68% 40%",
  },
  {
    number: "02",
    name: "Silk scarves",
    kind: "Handcrafted in silk",
    category: "scarves" as const,
    text: "Handcrafted silk scarves printed with leaves and flowers. Light, luminous and personal — a small piece of the natural world to carry with you.",
    pieces: ["Silk scarves", "Stoles", "Gifting"],
    image: processImage,
    alt: "Hands laying leaves onto natural cloth before printing",
    position: "center 55%",
  },
  {
    number: "03",
    name: "Naturally dyed shawls",
    kind: "Natural colour",
    category: "shawls" as const,
    text: "Shawls coloured with natural dyes, in warm earth tones and soft greens. Comfortable, textured and made to layer through every season.",
    pieces: ["Shawls", "Wraps", "Earth tones"],
    image: runwayImage,
    alt: "A rust-toned naturally dyed shawl worn over an ivory botanical dress",
    position: "88% 35%",
  },
  {
    number: "04",
    name: "Eco-printed textiles",
    kind: "Exclusive lengths",
    category: "textiles" as const,
    text: "Exclusive eco-printed textiles on silk, cotton and linen — for makers, interiors and anyone who wants the print itself.",
    pieces: ["Silk", "Cotton", "Linen"],
    image: textileImage,
    alt: "Folded and rolled cloth printed with fern and leaf impressions",
    position: "center",
  },
  {
    number: "05",
    name: "Limited-edition wearable art",
    kind: "One of a kind",
    category: "limited" as const,
    text: "Statement pieces made in very small numbers — layered in sage, ivory and earth. Each one is the only one of its kind.",
    pieces: ["Occasion wear", "Layered looks", "Collector pieces"],
    image: runwayImage,
    alt: "Three botanical-print looks in sage, ivory and rust",
    position: "center 30%",
  },
];

const promises = [
  { icon: Leaf, title: "Natural fibres only", text: "Silk, cotton, linen and other natural textiles — chosen for texture, comfort, quality and timeless appeal." },
  { icon: Feather, title: "Handcrafted", text: "Every botanical is placed, printed and finished by hand, one piece at a time." },
  { icon: Sparkles, title: "One of a kind", text: "No two leaves are alike, so no two prints are. Your piece is yours alone." },
];

function CollectionsPage() {
  return (
    <SitePage>
      <PageHero
        index="Collections"
        eyebrow="Wearable botanical art"
        title={["Made by nature.", <em key="em">Made to be yours.</em>]}
        description="Botanical eco-printed clothing, silk scarves, naturally dyed shawls, exclusive textiles and limited-edition wearable art — all on natural fibres."
        image={heroImage}
        imageAlt="A flowing ivory botanical-print dress in an open landscape"
        imageWidth={1920}
        imageHeight={1200}
        imagePosition="center 42%"
        scrollTarget="#pieces"
      />

      <PieceGrid />

      <Chapters />

      <section className="promise section-wrap" aria-labelledby="promise-title">
        <SectionHeading
          id="promise-title"
          eyebrow="What every piece shares"
          lines={["Three quiet", <em key="em">promises.</em>]}
          note="Whatever you choose, it carries the same care: real botanicals, natural fibres and a print that belongs to no one else."
        />
        <div className="promise__grid">
          {promises.map((item, index) => (
            <Reveal as="article" className="promise__card" key={item.title} delay={index * 120}>
              <item.icon aria-hidden="true" />
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="cta-band">
        <Reveal className="cta-band__inner">
          <p className="eyebrow">
            <span className="eyebrow__line" /> Made to order
          </p>
          <h2>
            Looking for something
            <br />
            <em>made just for you?</em>
          </h2>
          <Link className="cta-band__button" to="/contact">
            Start a custom piece <ArrowRight aria-hidden="true" />
          </Link>
        </Reveal>
      </section>

      <NextChapter current="/collections" />
    </SitePage>
  );
}

/* ----------------------------------------------------------------------------------------------
 * The pieces managed in /admin: category filter + numbered pagination, both kept in the URL so
 * a filtered page can be shared or bookmarked.
 * -------------------------------------------------------------------------------------------- */
function PieceGrid() {
  const { pieces, settings } = useSiteData();
  const { category, page = 1 } = Route.useSearch();
  const navigate = useNavigate({ from: "/collections" });
  const gridRef = useRef<HTMLElement>(null);
  const firstRender = useRef(true);

  const filtered = category ? pieces.filter((p) => p.category === category) : pieces;
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = Math.min(page, pageCount);
  const visible = filtered.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);
  const counts = Object.fromEntries(CATEGORIES.map((c) => [c.id, pieces.filter((p) => p.category === c.id).length]));

  // Bring the grid back into view when the filter or page changes (not on first load).
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    gridRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [category, current]);

  const go = (next: CollectionSearch) =>
    navigate({ search: next, resetScroll: false, replace: false });

  return (
    <section ref={gridRef} className="pieces section-wrap" id="pieces" aria-labelledby="pieces-title">
      <SectionHeading
        id="pieces-title"
        eyebrow="The collection"
        lines={["Pieces,", <em key="em">one of a kind.</em>]}
        note="Every piece is handmade and unique. See something you love? Ask about it and we'll tell you everything — fabric, size and availability."
      />

      <div className="pieces__filters" role="toolbar" aria-label="Filter by category">
        <button type="button" className={!category ? "is-active" : ""} onClick={() => go({})} aria-pressed={!category}>
          All <span>{pieces.length}</span>
        </button>
        {CATEGORIES.map((c) => (
          <button
            type="button"
            key={c.id}
            className={category === c.id ? "is-active" : ""}
            onClick={() => go({ category: c.id })}
            aria-pressed={category === c.id}
            disabled={!counts[c.id]}
          >
            {c.short} <span>{counts[c.id]}</span>
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <p className="pieces__empty">New pieces in this collection are on their way. Ask us about what's available now.</p>
      ) : (
        <div className="pieces__grid" key={`${category ?? "all"}-${current}`}>
          {visible.map((piece, index) => (
            <PieceCard key={piece.id} piece={piece} index={index} enquire={whatsappLink(settings, `Hello Ralui Valui, I'd love to know more about "${piece.title}" (${categoryLabel(piece.category)}).`)} />
          ))}
        </div>
      )}

      {pageCount > 1 && (
        <nav className="pagination" aria-label="Collection pages">
          <button type="button" onClick={() => go({ category, page: current - 1 })} disabled={current === 1} aria-label="Previous page">
            <ArrowLeft aria-hidden="true" />
          </button>
          {Array.from({ length: pageCount }, (_, i) => i + 1).map((n) => (
            <button
              type="button"
              key={n}
              className={n === current ? "is-active" : ""}
              aria-current={n === current ? "page" : undefined}
              onClick={() => go({ category, page: n })}
            >
              {n}
            </button>
          ))}
          <button type="button" onClick={() => go({ category, page: current + 1 })} disabled={current === pageCount} aria-label="Next page">
            <ArrowRight aria-hidden="true" />
          </button>
          <span className="pagination__summary">
            Showing {(current - 1) * PAGE_SIZE + 1}–{Math.min(current * PAGE_SIZE, filtered.length)} of {filtered.length}
          </span>
        </nav>
      )}
    </section>
  );
}

function PieceCard({ piece, index, enquire }: { piece: Piece; index: number; enquire: string | null }) {
  const [loaded, setLoaded] = useState(false);
  return (
    <article className="piece-card" style={{ animationDelay: `${index * 70}ms` }}>
      <div className={`piece-card__image${loaded ? " is-loaded" : ""}`}>
        <img
          src={piece.image}
          alt={piece.title}
          width={piece.width}
          height={piece.height}
          loading={index < 3 ? "eager" : "lazy"}
          decoding="async"
          onLoad={() => setLoaded(true)}
          ref={(img) => {
            if (img?.complete) setLoaded(true);
          }}
        />
      </div>
      <div className="piece-card__body">
        <p className="piece-card__meta">
          {categoryLabel(piece.category)}
          {piece.fabric && <span> · {piece.fabric}</span>}
        </p>
        <h3>{piece.title}</h3>
        {piece.description && <p className="piece-card__text">{piece.description}</p>}
        <a
          className="piece-card__cta"
          href={enquire ?? BUSINESS.instagramDmUrl}
          target="_blank"
          rel="noreferrer"
        >
          <MessageCircle aria-hidden="true" /> {enquire ? "Enquire on WhatsApp" : "Enquire on Instagram"}
        </a>
      </div>
    </article>
  );
}

/** Sticky image on one side that changes as each collection's text scrolls past on the other. */
function Chapters() {
  const [active, setActive] = useState(0);
  const refs = useRef<(HTMLElement | null)[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (items) => {
        for (const item of items) {
          if (item.isIntersecting) setActive(Number((item.target as HTMLElement).dataset["index"]));
        }
      },
      { rootMargin: "-45% 0px -45% 0px" },
    );
    refs.current.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <section className="chapters" id="edits" aria-labelledby="edits-title">
      <div className="chapters__intro section-wrap">
        <SectionHeading
          id="edits-title"
          eyebrow="Five collections"
          lines={["One practice,", <em key="em">five ways to wear it.</em>]}
        />
      </div>
      <div className="chapters__body">
        <div className="chapters__media" aria-hidden="true">
          {chapters.map((chapter, index) => (
            <img
              key={chapter.name}
              src={chapter.image}
              alt=""
              loading="lazy"
              className={index === active ? "is-active" : ""}
              style={{ objectPosition: chapter.position }}
            />
          ))}
        </div>
        <div className="chapters__list">
          {chapters.map((chapter, index) => (
            <article
              key={chapter.name}
              ref={(el) => {
                refs.current[index] = el;
              }}
              data-index={index}
              className={`chapter${index === active ? " is-active" : ""}`}
            >
              <img className="chapter__mobile-image" src={chapter.image} alt={chapter.alt} loading="lazy" style={{ objectPosition: chapter.position }} />
              <p className="chapter__kind">{chapter.kind}</p>
              <h3>{chapter.name}</h3>
              <p className="chapter__text">{chapter.text}</p>
              <ul className="chapter__pieces">
                {chapter.pieces.map((piece) => (
                  <li key={piece}>{piece}</li>
                ))}
              </ul>
              <Link className="text-link" to="/collections" search={{ category: chapter.category }} hash="pieces">
                See {chapter.name.toLowerCase()} <ArrowRight aria-hidden="true" />
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
