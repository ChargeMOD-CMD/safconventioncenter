import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Award, Users, Heart, Star, Sparkles, Shield } from "lucide-react";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import heroImg from "@/assets/hero-convention.png";
import weddingImg from "@/assets/venue-wedding.png";
import galaImg from "@/assets/venue-gala.png";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — SAF Celestia EventVerse" },
      {
        name: "description",
        content:
          "The story, philosophy and craft behind SAF Convention Centre Celestia EventVerse.",
      },
    ],
  }),
  component: About,
});

const values = [
  {
    icon: Award,
    title: "Excellence",
    desc: "Every detail refined to perfection — from lighting to linen.",
  },
  {
    icon: Heart,
    title: "Hospitality",
    desc: "Warm, attentive service rooted in decades of tradition.",
  },
  { icon: Sparkles, title: "Innovation", desc: "Cutting-edge technology meets timeless elegance." },
  { icon: Shield, title: "Trust", desc: "5,000+ successful events and a legacy of reliability." },
];

const milestones = [
  { year: "2009", event: "SAF Convention Centre founded" },
  { year: "2012", event: "Expanded to 100,000 sq.ft." },
  { year: "2016", event: "Celestia Luxe flagship hall inaugurated" },
  { year: "2019", event: "Crossed 250,000 sq.ft. of event space" },
  { year: "2022", event: "Named South India's Premier Convention Centre" },
  { year: "2025", event: "Celestia EventVerse digital experience launched" },
];

function About() {
  useScrollReveal();
  return (
    <div>
      {/* Hero Banner */}
      <section className="relative isolate h-[60vh] min-h-[450px] flex items-center justify-center overflow-hidden">
        <img src={heroImg} alt="" className="absolute inset-0 h-full w-full object-cover -z-10" />
        <div className="absolute inset-0 bg-black/55 -z-10" />
        <div className="text-center px-6 max-w-4xl text-white reveal">
          <div className="inline-flex items-center gap-3 mb-4">
            <span className="h-px w-8 bg-gold/60" />
            <span className="text-[10px] tracking-[0.5em] uppercase text-gold/90">Our Story</span>
            <span className="h-px w-8 bg-gold/60" />
          </div>
          <h1 className="font-display text-5xl md:text-7xl">
            A house built for <span className="italic gold-text">unforgettable</span> nights.
          </h1>
        </div>
      </section>

      {/* About Section */}
      <section className="mx-auto max-w-7xl px-6 md:px-10 py-28">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          <div className="reveal-left">
            <div className="inline-flex items-center gap-3 mb-4">
              <span className="h-px w-10 bg-gold" />
              <span className="text-[10px] tracking-luxe uppercase text-crimson">About Us</span>
            </div>
            <h2 className="font-display text-4xl md:text-5xl leading-tight">
              Where <span className="gold-text italic">Legacy</span> Meets Innovation
            </h2>
            <div className="mt-6 hairline-gold w-20" />
            <p className="mt-8 text-lg text-muted-foreground leading-relaxed">
              SAF Celestia is the meeting point of royal hospitality and future-forward design. We
              marry timeless craft — marble, gold leaf, hand-cut crystal — with adaptive light, AI
              orchestration and cinematic storytelling.
            </p>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              Founded by hospitality veterans and stage directors, every space is rehearsed like a
              production. Every guest is a protagonist.
            </p>
            <div className="mt-10 grid grid-cols-3 gap-6">
              {[
                ["15+", "Years"],
                ["40", "Designers"],
                ["98%", "Repeat hosts"],
              ].map(([n, l]) => (
                <div key={l}>
                  <div className="font-display text-4xl gold-text">{n}</div>
                  <div className="mt-1 text-xs uppercase tracking-widest text-muted-foreground">
                    {l}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="reveal-right relative">
            <div className="absolute -inset-8 bg-gold/5 blur-3xl rounded-full" />
            <img
              src={weddingImg}
              alt="Celestia interior"
              className="relative w-full h-[520px] object-cover shadow-royal"
              loading="lazy"
            />
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="bg-secondary/40 py-28 section-divider">
        <div className="mx-auto max-w-7xl px-6 md:px-10">
          <div className="flex flex-col items-center text-center mb-16 reveal">
            <div className="inline-flex items-center gap-3 mb-4">
              <span className="h-px w-10 bg-gold" />
              <span className="text-[10px] tracking-luxe uppercase text-crimson">
                Our Principles
              </span>
              <span className="h-px w-10 bg-gold" />
            </div>
            <h2 className="font-display text-4xl md:text-5xl">
              Values We <span className="italic gold-text">Stand By</span>
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 stagger-children">
            {values.map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="reveal bg-card border border-border p-8 text-center hover:shadow-soft hover:border-gold/30 transition-all duration-500 group"
              >
                <div className="w-14 h-14 mx-auto rounded-full bg-gold/10 flex items-center justify-center mb-6 group-hover:bg-gold/20 transition-colors">
                  <Icon className="h-6 w-6 text-gold" />
                </div>
                <h3 className="font-display text-xl">{title}</h3>
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="mx-auto max-w-4xl px-6 md:px-10 py-28">
        <div className="flex flex-col items-center text-center mb-16 reveal">
          <div className="inline-flex items-center gap-3 mb-4">
            <span className="h-px w-10 bg-gold" />
            <span className="text-[10px] tracking-luxe uppercase text-crimson">Milestones</span>
            <span className="h-px w-10 bg-gold" />
          </div>
          <h2 className="font-display text-4xl md:text-5xl">
            Our <span className="italic gold-text">Journey</span>
          </h2>
        </div>
        <div className="relative">
          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-border -translate-x-1/2" />
          {milestones.map((m, i) => (
            <div
              key={m.year}
              className={`reveal relative flex items-center gap-8 mb-12 ${
                i % 2 === 0 ? "flex-row" : "flex-row-reverse"
              }`}
            >
              <div className={`flex-1 ${i % 2 === 0 ? "text-right" : "text-left"}`}>
                <div className="font-display text-3xl crimson-text">{m.year}</div>
                <p className="mt-1 text-sm text-muted-foreground">{m.event}</p>
              </div>
              <div className="relative z-10 w-4 h-4 rounded-full bg-gold border-4 border-background shadow-sm" />
              <div className="flex-1" />
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="relative isolate overflow-hidden">
        <img src={galaImg} alt="" className="absolute inset-0 h-full w-full object-cover -z-10" />
        <div className="absolute inset-0 bg-crimson/80 mix-blend-multiply -z-10" />
        <div className="mx-auto max-w-4xl px-6 md:px-10 py-28 text-center text-white reveal">
          <h2 className="font-display text-4xl md:text-5xl text-balance">
            Ready to create your <span className="italic">legendary event</span>?
          </h2>
          <Link to="/contact" className="mt-10 btn-gold inline-flex">
            Start Planning <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
