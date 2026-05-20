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
      { title: "Venues — SAF Celestia International Convention Centre" },
      {
        name: "description",
        content:
          "Three signature halls — Celestia Luxe, Celestia Grand, and Celestia Crown for grand weddings, corporate events and celebrations.",
      },
    ],
  }),
  component: Venues,
});

const venues = [
  {
    img: celestiaLuxeImg,
    name: "Celestia Luxe",
    pax: "5,000 PAX",
    note: "Our flagship hall — an awe-inspiring setting for grand weddings, corporate launches and cultural events.",
    features: ["Adaptive LED lighting", "360° sound system", "VIP lounge"],
  },
  {
    img: celestiaGrandImg,
    name: "Celestia Grand",
    pax: "1,500 PAX",
    note: "Premium dining arena for traditional feasts, gala dinners and multicultural buffets.",
    features: ["Chef's kitchen", "Wine cellar", "Stage setup"],
  },
  {
    img: celestiaCrownImg,
    name: "Celestia Crown",
    pax: "2,000 PAX",
    note: "Our Mini Hall — luxury and professionalism for mid-size weddings and regional summits.",
    features: ["AV equipment", "Breakout rooms", "Green room"],
  },
];

function Venues() {
  useScrollReveal();
  return (
    <div>
      {/* Hero */}
      <section className="relative isolate h-[60vh] min-h-[450px] flex items-center justify-center overflow-hidden">
        <img src={safHallImg} alt="" className="absolute inset-0 h-full w-full object-cover -z-10" />
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
            className={`reveal mb-24 ${index !== venues.length - 1 ? 'section-divider' : ''}`}
          >
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div className={index % 2 === 0 ? 'order-1' : 'order-2'}>
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
              <div className={index % 2 === 0 ? 'order-2' : 'order-1'}>
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
        <div className="absolute inset-0 bg-crimson/80 mix-blend-multiply -z-10" />
        <div className="mx-auto max-w-4xl px-6 md:px-10 py-24 text-center text-white reveal">
          <h2 className="font-display text-4xl md:text-5xl text-balance">
            Can't decide? Let us <span className="italic">guide you</span>.
          </h2>
          <p className="mt-4 text-white/60 max-w-xl mx-auto">
            Our concierge team will recommend the perfect venue based on your event type, guest
            count and vision.
          </p>
          <Link to="/contact" className="mt-10 btn-gold inline-flex">
            Get Recommendations <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
