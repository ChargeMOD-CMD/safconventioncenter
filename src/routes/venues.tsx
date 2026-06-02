import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import heroImg from "@/assets/hero-convention.png";
import celestiaLuxeImg from "@/assets/venue-celestia-luxe.jpg";
import celestiaGrandImg from "@/assets/venue-celestia-grand.jpg";
import celestiaCrownImg from "@/assets/venue-celestia-crown.png";
import safHallImg from "@/assets/saf-hall-interior.jpg";

export const Route = createFileRoute("/venues")({
  head: () => ({
    meta: [
      { title: "Venues — SAF Convention Centre" },
      {
        name: "description",
        content:
          "Three signature halls — SAF Grand, SAF Aura, and SAF Crown for grand weddings, corporate events and celebrations.",
      },
    ],
  }),
  component: Venues,
});

const venues = [
  {
    img: celestiaLuxeImg,
    name: "SAF Grand",
    pax: "1,500 PAX",
    note: "Our flagship venue, SAF Grand, offers an exceptional setting for large-scale weddings, corporate events, cultural programs and prestigious gatherings. Designed with expansive seating, refined interiors, and versatile event spaces, it creates the perfect atmosphere for memorable and successful occasions.",
    features: ["Adaptive LED lighting", "360° sound system", "VIP lounge"],
  },
  {
    img: celestiaGrandImg,
    name: "SAF Aura",
    pax: "350 PAX",
    note: "SAF Aura is an elegant mid-sized venue, thoughtfully designed for Reception, Haldi Ceremony, mehndi functions, birthdays, engagements, naming ceremonies, baptisms, anniversaries, intimate weddings, and other special celebrations.",
    features: ["Chef's kitchen", "Stage setup"],
  },
  {
    img: celestiaCrownImg,
    name: "SAF Crown",
    pax: "200 PAX",
    note: "Known as our mini hall, SAF Crown upholds the same elegance and professionalism as our larger venues while being perfectly suited for more intimate and focused gatherings. It is an ideal choice for receptions, birthday celebrations, anniversaries, send-off parties, naming ceremonies, community functions, academic discussions, , seminars, and creative workshops.",
    features: ["AV equipment", "Breakout rooms", "Green room"],
  },
];

function Venues() {
  useScrollReveal();
  return (
    <div>
      {/* Hero */}
      <section className="relative isolate h-[60vh] min-h-[450px] flex items-center justify-center overflow-hidden">
        <img
          src={safHallImg}
          alt=""
          className="absolute inset-0 h-full w-full object-cover -z-10"
        />
        <div className="absolute inset-0 bg-black/55 -z-10" />
        <div className="text-center px-6 max-w-4xl text-white reveal">
          <div className="inline-flex items-center gap-3 mb-4">
            <span className="h-px w-8 bg-gold/60" />
            <span className="text-[10px] tracking-[0.5em] uppercase text-gold/90">Venues</span>
            <span className="h-px w-8 bg-gold/60" />
          </div>
          <h1 className="font-display text-5xl md:text-7xl">
            Three Halls. <span className="italic gold-text">One Legend.</span>
          </h1>
          <p className="mt-4 text-white/60 max-w-2xl mx-auto">
            Every SAF Celestia venue is engineered with adaptive light, cinematic acoustics and
            concierge-grade hospitality.
          </p>
        </div>
      </section>

      {/* Venues Sections */}
      <section className="mx-auto max-w-7xl px-6 md:px-10 py-28">
        {venues.map((v, index) => (
          <article
            key={v.name}
            className={`reveal mb-24 ${index !== venues.length - 1 ? "section-divider" : ""}`}
          >
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div className={index % 2 === 0 ? "order-2 lg:order-1" : "order-2"}>
                <div className="inline-flex items-center gap-3 mb-4">
                  <span className="h-px w-10 bg-gold" />
                  <span className="text-[10px] tracking-luxe uppercase text-crimson">{v.pax}</span>
                </div>
                <h2 className="font-display text-4xl md:text-5xl lg:text-6xl leading-[1.1]">
                  {v.name}
                </h2>
                <div className="mt-6 hairline-gold w-20" />
                <p className="mt-8 text-base md:text-lg text-muted-foreground leading-relaxed">
                  {v.note}
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  {v.features.map((f) => (
                    <span
                      key={f}
                      className="text-[11px] tracking-wider uppercase px-4 py-2 border border-gold/30 text-gold/90 bg-gold/10"
                    >
                      {f}
                    </span>
                  ))}
                </div>
                <Link
                  to="/contact"
                  className="mt-10 inline-flex items-center gap-2 text-sm tracking-luxe uppercase crimson-text border-b border-crimson/40 pb-1 hover:border-crimson transition-colors group"
                >
                  Enquire{" "}
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
              <div className={index % 2 === 0 ? "order-1 lg:order-2" : "order-1"}>
                <div className="relative">
                  <img
                    src={v.img}
                    alt={v.name}
                    className="w-full h-[500px] object-cover shadow-royal"
                    loading="lazy"
                  />
                  <div className="absolute -bottom-6 -right-6 hidden md:block glass-card px-8 py-6 shadow-soft">
                    <div className="font-display text-3xl crimson-text">{v.pax}</div>
                    <div className="text-[10px] tracking-luxe uppercase text-muted-foreground mt-1">
                      Capacity
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </article>
        ))}
      </section>

      {/* Bottom CTA */}
      <section className="relative isolate overflow-hidden">
        <img
          src={celestiaLuxeImg}
          alt=""
          className="absolute inset-0 h-full w-full object-cover -z-10"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-black/10 to-black/25 -z-10" />
        <div className="mx-auto max-w-4xl px-6 md:px-10 py-24 text-center text-white reveal flex flex-col items-center">
          <div className="bg-black/50 backdrop-blur-md p-10 md:p-14 rounded-3xl border border-white/10 shadow-2xl w-full max-w-3xl">
            <h2 className="font-display text-4xl md:text-5xl text-balance text-white drop-shadow-md">
              Can't decide? Let us <span className="italic gold-text">guide you</span>.
            </h2>
            <p className="mt-4 text-white/90 max-w-xl mx-auto">
              Our concierge team will recommend the perfect venue based on your event type, guest
              count and vision.
            </p>
            <Link to="/contact" className="mt-10 btn-gold inline-flex">
              Get Recommendations <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
