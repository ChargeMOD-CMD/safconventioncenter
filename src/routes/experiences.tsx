import { createFileRoute, Link } from "@tanstack/react-router";
import { Sparkles, Crown, Music, Camera, Utensils, Bot, ArrowRight } from "lucide-react";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import heroImg from "@/assets/hero-convention.png";
import galaImg from "@/assets/venue-gala.png";
import safHallImg from "@/assets/saf-hall-interior.jpg";

export const Route = createFileRoute("/experiences")({
  head: () => ({
    meta: [
      { title: "Experiences — SAF Celestia EventVerse" },
      {
        name: "description",
        content: "Holographic showcases, AI concierge, royal dining and cinematic event journeys.",
      },
    ],
  }),
  component: Experiences,
});

const items = [
  {
    icon: Crown,
    t: "Royal Weddings",
    d: "Multi-day ceremonies with bespoke processions, choreographed light and signature scent.",
    color: "from-amber-500/20 to-yellow-500/10",
  },
  {
    icon: Sparkles,
    t: "Holographic Showcases",
    d: "Product reveals, fashion runways and immersive brand worlds powered by volumetric light.",
    color: "from-purple-500/20 to-pink-500/10",
  },
  {
    icon: Music,
    t: "Concerts & Galas",
    d: "Tunable acoustics and a 360° LED proscenium tailored for orchestral and contemporary acts.",
    color: "from-blue-500/20 to-cyan-500/10",
  },
  {
    icon: Bot,
    t: "AI Guest Concierge",
    d: "Personalised guidance from arrival to encore, in 24 languages.",
    color: "from-emerald-500/20 to-teal-500/10",
  },
  {
    icon: Utensils,
    t: "Cinematic Dining",
    d: "Chef-curated tasting journeys with synchronised lighting and storytelling.",
    color: "from-orange-500/20 to-red-500/10",
  },
  {
    icon: Camera,
    t: "EventVerse Capture",
    d: "Multi-cam cinematic films and same-night highlight reels delivered to guests.",
    color: "from-rose-500/20 to-pink-500/10",
  },
];

const processSteps = [
  {
    step: "01",
    title: "Consultation",
    desc: "Share your vision with our dedicated event concierge team.",
  },
  {
    step: "02",
    title: "Design",
    desc: "We craft a bespoke event blueprint — lighting, décor, flow and menu.",
  },
  {
    step: "03",
    title: "Rehearsal",
    desc: "Every detail is tested and refined before the big day.",
  },
  {
    step: "04",
    title: "Showtime",
    desc: "Sit back and enjoy a flawless, cinematic event experience.",
  },
];

function Experiences() {
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
            <span className="text-[10px] tracking-[0.5em] uppercase text-gold/90">Experiences</span>
            <span className="h-px w-8 bg-gold/60" />
          </div>
          <h1 className="font-display text-5xl md:text-7xl">
            A choreography of <span className="italic gold-text">wonder</span>.
          </h1>
          <p className="mt-4 text-white/60 max-w-2xl mx-auto">
            Each Celestia experience is engineered like a film — written, scored, lit and directed
            for the people in the room.
          </p>
        </div>
      </section>

      {/* Experiences Grid */}
      <section className="mx-auto max-w-7xl px-6 md:px-10 py-28">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 stagger-children">
          {items.map(({ icon: Icon, t, d, color }) => (
            <div
              key={t}
              className="reveal group relative overflow-hidden bg-card border border-border p-8 hover:border-gold/30 hover:shadow-soft transition-all duration-500"
            >
              <div
                className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl ${color} rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
              />
              <div className="relative">
                <div className="w-14 h-14 rounded-full bg-gold/10 flex items-center justify-center mb-6 group-hover:bg-gold/20 transition-colors">
                  <Icon className="h-7 w-7 text-gold" />
                </div>
                <h3 className="font-display text-2xl">{t}</h3>
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{d}</p>
                <div className="mt-5 h-px w-0 bg-gold group-hover:w-12 transition-all duration-500" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Process */}
      <section
        className="relative py-28 section-divider overflow-hidden"
        style={{ backgroundImage: `url(${safHallImg})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
      >
        <div className="absolute inset-0 bg-black/70" />
        <div className="relative z-10 mx-auto max-w-7xl px-6 md:px-10">
          <div className="flex flex-col items-center text-center mb-16 reveal">
            <div className="inline-flex items-center gap-3 mb-4">
              <span className="h-px w-10 bg-gold" />
              <span className="text-[10px] tracking-luxe uppercase text-crimson">How It Works</span>
              <span className="h-px w-10 bg-gold" />
            </div>
            <h2 className="font-display text-4xl md:text-5xl text-white">
              Our <span className="italic gold-text">Process</span>
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 stagger-children">
            {processSteps.map(({ step, title, desc }) => (
              <div key={step} className="reveal text-center group">
                <div className="w-16 h-16 mx-auto rounded-full border-2 border-gold/30 flex items-center justify-center mb-6 group-hover:border-gold group-hover:bg-gold/5 transition-all duration-500">
                  <span className="font-display text-2xl gold-text">{step}</span>
                </div>
                <h3 className="font-display text-xl text-white">{title}</h3>
                <p className="mt-3 text-sm text-white/60 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative isolate overflow-hidden">
        <img src={safHallImg} alt="" className="absolute inset-0 h-full w-full object-cover -z-10" />
        <div className="absolute inset-0 bg-crimson/80 mix-blend-multiply -z-10" />
        <div className="mx-auto max-w-4xl px-6 md:px-10 py-28 text-center text-white reveal">
          <h2 className="font-display text-4xl md:text-5xl text-balance">
            Ready to experience the <span className="italic">extraordinary</span>?
          </h2>
          <Link to="/contact" className="mt-10 btn-gold inline-flex">
            Plan Your Event <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
