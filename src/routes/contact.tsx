import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { ArrowRight, ArrowUpRight, Check, Gem, Handshake, Instagram, MapPin, MessageCircle, Phone, Plus } from "lucide-react";

import textileImage from "@/assets/eco-art-textile.jpg";
import { NextChapter, PageHero, SectionHeading, SitePage } from "@/components/site/chrome";
import { Reveal } from "@/components/site/motion";
import { useSiteData } from "@/components/site/use-site";
import { BUSINESS, whatsappLink } from "@/lib/site-data";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — RALUI VALUI" },
      {
        name: "description",
        content:
          "Contact RALUI VALUI about custom pieces, collaborations or any piece in the collection. Head office in Ukhrul, branch in Dimapur, Nagaland.",
      },
      { property: "og:title", content: "Contact — RALUI VALUI" },
    ],
  }),
  component: ContactPage,
});

const topics = [
  {
    id: "custom",
    icon: Gem,
    title: "Custom pieces",
    text: "A dress, scarf or shawl made just for you — your colours, your fabric, your botanicals.",
  },
  {
    id: "collaboration",
    icon: Handshake,
    title: "Collaborations",
    text: "Boutiques, designers, stylists and makers who want to create something together.",
  },
  {
    id: "hello",
    icon: MessageCircle,
    title: "Ask about a piece",
    text: "Availability, sizes, fabric or care for anything in the collection.",
  },
] as const;

type TopicId = (typeof topics)[number]["id"];

const faqs = [
  {
    q: "Which fabrics do you use?",
    a: "Only natural fibres — silk, cotton, linen and other natural textiles, chosen for their texture, comfort, quality and timeless appeal.",
  },
  {
    q: "Is every piece one of a kind?",
    a: "Yes. Every print is made with real leaves and flowers, placed by hand, so no two pieces are ever exactly alike. Limited-edition pieces are made in very small numbers.",
  },
  {
    q: "Can I request a custom piece?",
    a: "Absolutely. Send a note with what you have in mind — the kind of piece, the fabric, colours you love — and we'll take it from there.",
  },
  {
    q: "How should I care for eco-printed and naturally dyed fabric?",
    a: "As a general guide: hand wash gently in cool water with a mild, pH-neutral soap, avoid bleach, and dry in the shade. Silk needs extra care — ask us about your specific piece.",
  },
  {
    q: "Will the colours change over time?",
    a: "Natural colour is alive. It may soften gently with light and washing — part of what makes each piece personal.",
  },
];

function ContactPage() {
  const { settings } = useSiteData();
  const [topic, setTopic] = useState<TopicId>("custom");

  const chooseTopic = (id: TopicId) => {
    setTopic(id);
    document.getElementById("compose")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <SitePage>
      <PageHero
        index="Contact"
        eyebrow="Get in touch"
        title={["Wear what", <em key="em">the earth remembers.</em>]}
        description="For custom pieces, collaborations and enquiries about any piece in the collection. We'd love to hear from you."
        image={textileImage}
        imageAlt="Botanical eco-printed cloth with fern and leaf impressions"
        imageWidth={1024}
        imageHeight={1280}
        imagePosition="center 35%"
        scrollTarget="#topics"
        align="center"
      />

      <section className="topics section-wrap" id="topics" aria-labelledby="topics-title">
        <SectionHeading
          id="topics-title"
          eyebrow="How can we help?"
          lines={["Start with", <em key="em">what brings you here.</em>]}
          note="Choose a reason and we'll set up your note. Every message is read and answered personally."
        />
        <div className="topics__grid">
          {topics.map((item, index) => (
            <Reveal key={item.id} delay={index * 120}>
              <button
                type="button"
                className={`topic-card${topic === item.id ? " is-selected" : ""}`}
                onClick={() => chooseTopic(item.id)}
                aria-pressed={topic === item.id}
              >
                <item.icon aria-hidden="true" />
                <h3>{item.title}</h3>
                <p>{item.text}</p>
                <span className="topic-card__cta">
                  Write about this <ArrowRight aria-hidden="true" />
                </span>
              </button>
            </Reveal>
          ))}
        </div>
      </section>

      <Composer topic={topic} onTopicChange={setTopic} />

      <section className="visit section-wrap" aria-labelledby="visit-title">
        <SectionHeading id="visit-title" eyebrow="Find us" lines={["Visit us in", <em key="em">Ukhrul & Dimapur.</em>]} />
        <div className="visit__grid">
          {BUSINESS.offices.map((office, index) => (
            <Reveal className="visit__card" key={office.label} delay={index * 120}>
              <MapPin aria-hidden="true" />
              <h3>{office.label}</h3>
              <address>
                {office.lines.map((line) => (
                  <span key={line}>{line}</span>
                ))}
              </address>
              <a className="text-link" href={office.mapsUrl} target="_blank" rel="noreferrer">
                Open in Google Maps <ArrowUpRight aria-hidden="true" />
              </a>
            </Reveal>
          ))}
          <Reveal className="visit__card" delay={240}>
            <Phone aria-hidden="true" />
            <h3>Phone & WhatsApp</h3>
            <p>For custom commissions, sizing, or direct enquiries, call or message us directly.</p>
            <a className="text-link" href={whatsappLink(settings) ?? `https://wa.me/${BUSINESS.whatsappNumber}`} target="_blank" rel="noreferrer">
              WhatsApp {BUSINESS.phone} <ArrowUpRight aria-hidden="true" />
            </a>
            <a className="text-link" href={`tel:${BUSINESS.phoneTel}`}>
              Call {BUSINESS.phone} <ArrowUpRight aria-hidden="true" />
            </a>
          </Reveal>
          <Reveal className="visit__card" delay={360}>
            <Instagram aria-hidden="true" />
            <h3>Instagram</h3>
            <p>New pieces and works in progress are shared first on Instagram.</p>
            <a className="text-link" href={BUSINESS.instagramUrl} target="_blank" rel="noreferrer">
              {BUSINESS.instagramHandle} <ArrowUpRight aria-hidden="true" />
            </a>
          </Reveal>
        </div>
      </section>

      <section className="faq section-wrap" aria-labelledby="faq-title">
        <div className="faq__aside">
          <SectionHeading id="faq-title" eyebrow="Good to know" lines={["Questions,", <em key="em">gently answered.</em>]} />
        </div>
        <div className="faq__list">
          {faqs.map((item, index) => (
            <Reveal as="details" className="faq__item" key={item.q} delay={index * 60}>
              <summary>
                <span>{item.q}</span>
                <Plus aria-hidden="true" />
              </summary>
              <p>{item.a}</p>
            </Reveal>
          ))}
        </div>
      </section>

      <NextChapter current="/contact" />
    </SitePage>
  );
}

/**
 * Writes a ready-to-send note. With a WhatsApp number set (in /admin → Settings) it opens a
 * WhatsApp chat with the note already typed in. Otherwise it copies the note and opens an
 * Instagram direct message.
 */
function Composer({ topic, onTopicChange }: { topic: TopicId; onTopicChange: (id: TopicId) => void }) {
  const { settings } = useSiteData();
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "sent" | "copied" | "manual">("idle");

  const topicTitle = topics.find((t) => t.id === topic)?.title ?? "";
  const note = `Hello Ralui Valui,${name ? ` I'm ${name}.` : ""}\n\nI'm writing about: ${topicTitle}.\n\n${message.trim()}`;
  const hasWhatsApp = Boolean(whatsappLink(settings));

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const whatsapp = whatsappLink(settings, note);
    if (whatsapp) {
      window.open(whatsapp, "_blank", "noopener,noreferrer");
      setStatus("sent");
      return;
    }
    try {
      await navigator.clipboard.writeText(note);
      setStatus("copied");
    } catch {
      setStatus("manual");
    }
    window.open(BUSINESS.instagramDmUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <section className="composer" id="compose" aria-labelledby="compose-title">
      <div className="composer__inner">
        <div className="composer__intro">
          <Reveal as="p" className="eyebrow" variant="fade">
            <span className="eyebrow__line" /> Write your note
          </Reveal>
          <Reveal as="h2" id="compose-title" delay={80}>
            Tell us a little
            <br />
            <em>about your idea.</em>
          </Reveal>
          <Reveal as="p" className="composer__hint" delay={160}>
            {hasWhatsApp
              ? "Your note opens in a WhatsApp chat with us, already typed out — just press send."
              : `We reply through Instagram. We'll copy your note and open a direct message to ${BUSINESS.instagramHandle} — just paste and send.`}
          </Reveal>
          <Reveal delay={220} className="composer__intro-links">
            <a className="text-link text-link--ivory" href={whatsappLink(settings) ?? `https://wa.me/${BUSINESS.whatsappNumber}`} target="_blank" rel="noreferrer">
              <MessageCircle aria-hidden="true" /> WhatsApp: {BUSINESS.phone} <ArrowUpRight aria-hidden="true" />
            </a>
            <a className="text-link text-link--ivory" href={`tel:${BUSINESS.phoneTel}`}>
              <Phone aria-hidden="true" /> Call: {BUSINESS.phone} <ArrowUpRight aria-hidden="true" />
            </a>
            <a className="text-link text-link--ivory" href={BUSINESS.instagramUrl} target="_blank" rel="noreferrer">
              <Instagram aria-hidden="true" /> Visit our Instagram <ArrowUpRight aria-hidden="true" />
            </a>
          </Reveal>
        </div>

        <Reveal as="form" className="composer__form" onSubmit={onSubmit} delay={120}>
          <fieldset className="composer__topics">
            <legend>I'm writing about</legend>
            {topics.map((item) => (
              <label key={item.id} className={topic === item.id ? "is-selected" : ""}>
                <input
                  type="radio"
                  name="topic"
                  value={item.id}
                  checked={topic === item.id}
                  onChange={() => onTopicChange(item.id)}
                />
                {item.title}
              </label>
            ))}
          </fieldset>

          <label className="field">
            <span>Your name</span>
            <input value={name} onChange={(e) => setName(e.target.value)} autoComplete="given-name" placeholder="How should we greet you?" />
          </label>

          <label className="field">
            <span>Your message</span>
            <textarea
              required
              rows={5}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="A piece you have in mind, fabric or colours you love…"
            />
          </label>

          <button type="submit" className={`composer__submit${hasWhatsApp ? " composer__submit--whatsapp" : ""}`}>
            {hasWhatsApp ? (
              <>
                <MessageCircle aria-hidden="true" /> Send on WhatsApp
              </>
            ) : (
              <>
                Copy note &amp; open Instagram <ArrowUpRight aria-hidden="true" />
              </>
            )}
          </button>

          <p className="composer__status" role="status" aria-live="polite">
            {status === "sent" && (
              <>
                <Check aria-hidden="true" /> WhatsApp opened with your note — just press send.
              </>
            )}
            {status === "copied" && (
              <>
                <Check aria-hidden="true" /> Your note is copied. Paste it into the Instagram chat that just opened.
              </>
            )}
            {status === "manual" && <>Couldn't copy automatically — select your message above and copy it into the Instagram chat.</>}
          </p>
        </Reveal>
      </div>
    </section>
  );
}
