import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import heroImg from "@/assets/hero-convention.png";
import weddingImg from "@/assets/venue-wedding.png";
import corporateImg from "@/assets/venue-corporate.png";
import galaImg from "@/assets/venue-gala.png";
import outdoorImg from "@/assets/venue-outdoor.png";

export const Route = createFileRoute("/venues")({
  head: () => ({
    meta: [
      { title: "Venues — SAF Celestia International Convention Centre" },
      {
        name: "description",
        content:
          "Eleven signature halls — from the 5000 PAX Celestia Luxe to intimate boardrooms and open-air terraces.",
      },
    ],
  }),
  component: Venues,
});

const venues = [
  {
    img: weddingImg,
    name: "Celestia Luxe",
    pax: "5,000 PAX",
    note: "Our flagship hall — an awe-inspiring setting for grand weddings, corporate launches and cultural events.",
    features: ["Adaptive LED lighting", "360° sound system", "VIP lounge"],
  },
  {
    img: galaImg,
    name: "Celestia Grand",
    pax: "1,500 PAX",
    note: "Premium dining arena for traditional feasts, gala dinners and multicultural buffets.",
    features: ["Chef's kitchen", "Wine cellar", "Stage setup"],
  },
  {
    img: corporateImg,
    name: "Celestia Crown",
    pax: "2,000 PAX",
    note: "Our Mini Hall — luxury and professionalism for mid-size weddings and regional summits.",
    features: ["AV equipment", "Breakout rooms", "Green room"],
  },
  {
    img: outdoorImg,
    name: "Celestia Gala",
    pax: "1,000 PAX",
    note: "Sleek, versatile space for chic receptions and stylish corporate gatherings.",
    features: ["Modular layout", "Natural light", "Bar counter"],
  },
  {
    img: heroImg,
    name: "Oasis",
    pax: "300 PAX",
    note: "Mid-size hall for birthdays, engagements, anniversaries and creative workshops.",
    features: ["Warm ambiance", "Private entrance", "Custom décor"],
  },
  {
    img: galaImg,
    name: "Mehfil",
    pax: "300 PAX",
    note: "Elegant hall for naming ceremonies, baptisms and intimate weddings.",
    features: ["Acoustic panels", "Garden view", "Buffet area"],
  },
  {
    img: corporateImg,
    name: "Miracle",
    pax: "300 PAX",
    note: "Versatile mid-size venue doubling as breakout rooms for academic sessions.",
    features: ["Projector setup", "U-shape layout", "Wi-Fi"],
  },
  {
    img: weddingImg,
    name: "Celestia Onyx",
    pax: "150 PAX",
    note: "A thoughtfully designed boardroom for strategic meetings and high-level negotiations.",
    features: ["Video conferencing", "Executive seating", "Refreshment bar"],
  },
  {
    img: outdoorImg,
    name: "Celestia Atrium",
    pax: "3,500 PAX",
    note: "Our signature outdoor venue — magical moments under the stars with an elevated stage.",
    features: ["Open-air canopy", "LED trees", "Fire features"],
  },
  {
    img: heroImg,
    name: "Moonlight Terrace",
    pax: "300 PAX",
    note: "Rooftop venue for pre-wedding events, intimate gatherings and starlit soirées.",
    features: ["Panoramic views", "Lounge seating", "DJ booth"],
  },
];

function Venues() {
  useScrollReveal();
  return (
    <div>
      {/* Hero */}
      <section className="relative isolate h-[60vh] min-h-[450px] flex items-center justify-center overflow-hidden">
        <img src={heroImg} alt="" className="absolute inset-0 h-full w-full object-cover -z-10" />
        <div className="absolute inset-0 bg-black/55 -z-10" />
        <div className="text-center px-6 max-w-4xl text-white reveal">
          <div className="inline-flex items-center gap-3 mb-4">
            <span className="h-px w-8 bg-gold/60" />
            <span className="text-[10px] tracking-[0.5em] uppercase text-gold/90">Venues</span>
            <span className="h-px w-8 bg-gold/60" />
          </div>
          <h1 className="font-display text-5xl md:text-7xl">
            Eleven Halls. <span className="italic gold-text">One Legend.</span>
          </h1>
          <p className="mt-4 text-white/60 max-w-2xl mx-auto">
            Every SAF Celestia venue is engineered with adaptive light, cinematic acoustics and
            concierge-grade hospitality.
          </p>
        </div>
      </section>

      {/* Venues Grid */}
      <section className="mx-auto max-w-7xl px-6 md:px-10 py-28">
        <div className="grid md:grid-cols-2 gap-10 stagger-children">
          {venues.map((v) => (
            <article
              key={v.name}
              className="reveal venue-card bg-card border border-border overflow-hidden group"
            >
              <div className="relative aspect-[16/10] overflow-hidden">
                <img
                  src={v.img}
                  alt={v.name}
                  className="h-full w-full object-cover parallax-img"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute top-4 right-4 glass-dark text-[10px] tracking-luxe uppercase text-gold px-3 py-1.5">
                  {v.pax}
                </div>
                <div className="absolute bottom-4 left-6">
                  <h2 className="font-display text-3xl text-white">{v.name}</h2>
                </div>
              </div>
              <div className="p-8">
                <p className="text-sm text-muted-foreground leading-relaxed">{v.note}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {v.features.map((f) => (
                    <span
                      key={f}
                      className="text-[10px] tracking-wider uppercase px-3 py-1 border border-gold/20 text-gold/80 bg-gold/5"
                    >
                      {f}
                    </span>
                  ))}
                </div>
                <Link
                  to="/contact"
                  className="mt-6 inline-flex items-center gap-2 text-xs tracking-luxe uppercase crimson-text border-b border-crimson/30 pb-1 hover:border-crimson transition-colors group"
                >
                  Enquire{" "}
                  <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="relative isolate overflow-hidden">
        <img
          src={weddingImg}
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
