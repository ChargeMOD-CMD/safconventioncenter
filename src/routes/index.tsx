import { createFileRoute, Link } from "@tanstack/react-router";
import { useRef } from "react";
import { ArrowRight, Play, Star, Users, Calendar, Award, ChevronDown, Quote } from "lucide-react";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import heroImg from "@/assets/bismi-wedding.jpg";
import heroVideoMp4 from "@/assets/hero-video.mp4";
import weddingImg from "@/assets/excel-1.jpg";
import corporateImg from "@/assets/excel-2.jpg";
import galaImg from "@/assets/excel-3.jpg";
import outdoorImg from "@/assets/excel-4.jpg";
import celestiaLuxeImg from "@/assets/venue-celestia-luxe.jpg";
import celestiaGrandImg from "@/assets/venue-celestia-grand.jpg";
import celestiaCrownImg from "@/assets/venue-celestia-crown.png";
import safHallImg from "@/assets/saf-hall-interior.jpg";
//home page video
export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SAF Celestia EventVerse — International Convention Centre" },
      {
        name: "description",
        content:
          "SAF Celestia International Convention Centre — elevating every event with style, space and exceptional service. Weddings, summits, galas and grand celebrations.",
      },
    ],
  }),
  component: Home,
});

/* ─── Data ────────────────────────────────────── */
const venues = [
  {
    img: celestiaLuxeImg,
    name: "SAF Grand",
    pax: "1,750",
    note: "Our flagship venue, SAF Grand, offers an exceptional setting for large-scale weddings, corporate events, cultural programs and prestigious gatherings. Designed with expansive seating, refined interiors, and versatile event spaces, it creates the perfect atmosphere for memorable and successful occasions.",
  },
  {
    img: celestiaGrandImg,
    name: "SAF Aura",
    pax: "350",
    note: "SAF Aura is an elegant mid-sized venue, thoughtfully designed for Reception, Haldi Ceremony, mehndi functions, birthdays, engagements, naming ceremonies, baptisms, anniversaries, intimate weddings, and other special celebrations.",
  },
  {
    img: celestiaCrownImg,
    name: "SAF Crown",
    pax: "200",
    note: "Known as our mini hall, SAF Crown upholds the same elegance and professionalism as our larger venues while being perfectly suited for more intimate and focused gatherings. It is an ideal choice for receptions, birthday celebrations, anniversaries, send-off parties, naming ceremonies, community functions, academic discussions, , seminars, and creative workshops.",
  },
];

const stats = [
  { value: "100+", label: "Parking Space", icon: Award },
  { value: "3", label: "Premium Venues", icon: Star },
  { value: "15,000+", label: "Events Hosted", icon: Calendar },
  { value: "2M+", label: "Happy Guests", icon: Users },
];

const eventTypes = [
  {
    img: outdoorImg,
    label: "Joyous Occasions",
  },
  {
    img: weddingImg,
    label: "Event Performances",
  },
  {
    img: galaImg,
    label: "Cultural Experience",
  },
  {
    img: corporateImg,
    label: "Corporate Events",
  },
];

const testimonials = [
  {
    text: "From the moment we arrived, we felt like VIPs. The hall was breathtaking, the orchestration flawless, and the staff went above and beyond. Five stars all the way.",
    name: "Emma K.",
    role: "Wedding Host",
    rating: 5,
  },
  {
    text: "We celebrated our engagement at SAF Celestia and the experience was nothing short of outstanding — beautifully designed venue, seamless management, every little detail handled with care.",
    name: "Aparna S.",
    role: "Engagement Ceremony",
    rating: 5,
  },
  {
    text: "One of the most full-fledged convention centres I have ever visited. Multiple halls, immaculate service and a grandeur you can feel the moment you step in.",
    name: "Krishna R.",
    role: "Corporate Event Director",
    rating: 5,
  },
];

const attractions = [
  { name: "Skyline Observatory", km: "12 Km" },
  { name: "Royal Heritage Museum", km: "18 Km" },
  { name: "Aurora Botanical Gardens", km: "9 Km" },
  { name: "Old Harbour Boardwalk", km: "21 Km" },
  { name: "Celestia Vineyards", km: "35 Km" },
];

/* ─── Component ───────────────────────────────── */
function Home() {
  useScrollReveal();
  const videoRef = useRef<HTMLVideoElement>(null);

  return (
    <div>
      {/* ═══════ HERO — Full-screen with video ═══════ */}
      <section className="relative isolate h-[100dvh] min-h-[700px] flex items-center justify-center overflow-hidden">
        {/* Background video */}
        <video
          ref={videoRef}
          className="absolute inset-0 -z-20 h-full w-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
        >
          <source src={heroVideoMp4} type="video/mp4" />
        </video>

        {/* Gradient overlays */}
        <div className="absolute inset-0 -z-10 hero-video-overlay" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-black/40 via-transparent to-black/40" />

        {/* Decorative elements */}
        <div className="absolute top-1/4 left-8 hidden lg:block">
          <div className="w-px h-24 bg-gradient-to-b from-transparent via-gold/40 to-transparent" />
        </div>
        <div className="absolute top-1/4 right-8 hidden lg:block">
          <div className="w-px h-24 bg-gradient-to-b from-transparent via-gold/40 to-transparent" />
        </div>

        {/* Hero content */}
        <div className="relative text-center px-6 max-w-5xl">
          <div
            className="inline-flex items-center gap-3 mb-8"
            style={{ animation: "fadeUp 1s ease-out 0.3s both" }}
          >
            <span className="h-px w-8 bg-gold/60" />
            <span className="text-[10px] tracking-[0.5em] uppercase text-gold/90 font-sans">
              South India's Premier Convention Centre
            </span>
            <span className="h-px w-8 bg-gold/60" />
          </div>

          <h1
            className="font-display text-white text-balance text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl leading-[1.05]"
            style={{ animation: "fadeUp 1s ease-out 0.5s both" }}
          >
            Elevating Every Event
            <br />
            <span className="italic gold-text">with Grandeur</span>
          </h1>

          <p
            className="mt-6 text-white/60 text-sm md:text-base max-w-xl mx-auto leading-relaxed font-sans"
            style={{ animation: "fadeUp 1s ease-out 0.7s both" }}
          ></p>

          <div
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
            style={{ animation: "fadeUp 1s ease-out 0.9s both" }}
          >
            <Link to="/venues" className="btn-primary">
              Explore Venues <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/contact" className="btn-outline">
              <Play className="h-4 w-4" /> Book Your Event
            </Link>
          </div>
        </div>

        {/* Scroll hint */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-scroll-hint">
          <span className="text-[9px] tracking-[0.4em] uppercase text-white/50">Scroll</span>
          <ChevronDown className="h-4 w-4 text-white/50" />
        </div>
      </section>

      {/* ═══════ STATS BAR ═══════ */}
      <section className="relative -mt-16 z-10">
        <div className="mx-auto max-w-6xl px-6">
          <div className="glass-card shadow-royal py-1 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4">
            {stats.map(({ value, label, icon: Icon }) => (
              <div key={label} className="stat-item reveal">
                <Icon className="h-5 w-5 text-gold mx-auto mb-2" />
                <div className="font-display text-3xl md:text-4xl crimson-text">{value}</div>
                <div className="mt-1 text-[10px] tracking-luxe uppercase text-muted-foreground">
                  {label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ WELCOME / ABOUT ═══════ */}
      <section className="mx-auto max-w-7xl px-6 md:px-10 py-32 section-divider">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          <div className="reveal-left">
            <div className="inline-flex items-center gap-3 mb-4">
              <span className="h-px w-10 bg-gold" />
              <span className="text-[10px] tracking-luxe uppercase text-crimson">Who we are</span>
            </div>
            <h2 className="font-display text-4xl md:text-5xl lg:text-6xl leading-[1.1]">
              About <span className="gold-text bold">SAF Convention Centre</span>
            </h2>
            <div className="mt-6 hairline-gold w-20" />
            <p className="mt-8 text-base md:text-lg text-muted-foreground leading-relaxed">
              SAF Convention Centre stands as one of the region's premier destinations for weddings,
              conventions, receptions, ceremonies, school anniversary programs, exhibitions, and
              corporate conferences. Thoughtfully designed with sophistication and elegance, the
              venue is supported by a dedicated team backed by decades of hospitality expertise.
            </p>
            <p className="mt-4 text-base text-muted-foreground leading-relaxed">
              Combining refined architecture, world-class amenities, and exceptional service, SAF
              creates the perfect setting for truly memorable and unforgettable occasions.
            </p>
            <Link
              to="/about"
              className="mt-10 inline-flex items-center gap-2 text-sm tracking-luxe uppercase crimson-text border-b border-crimson/40 pb-1 hover:border-crimson transition-colors group"
            >
              Discover Our Story
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="reveal-right relative">
            <div className="absolute -inset-8 bg-gold/5 blur-3xl rounded-full pointer-events-none" />
            <div className="relative">
              <img
                src={heroImg}
                alt="SAF Celestia Convention Centre exterior"
                className="w-full h-[520px] object-cover shadow-royal"
                loading="lazy"
              />
              <div className="absolute -bottom-6 -left-6 hidden md:block glass-card px-8 py-6 shadow-soft animate-pulse-glow">
                <div className="font-display text-4xl crimson-text">15,000+</div>
                <div className="text-[10px] tracking-luxe uppercase text-muted-foreground mt-1">
                  Events Hosted
                </div>
              </div>
              <div className="absolute -top-4 -right-4 hidden md:block glass-card px-6 py-4 shadow-soft">
                <div className="font-display text-2xl gold-text">20+</div>
                <div className="text-[10px] tracking-luxe uppercase text-muted-foreground mt-1">
                  Years of Legacy
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════ VENUES SHOWCASE ═══════ */}
      <section
        className="relative py-32 section-divider overflow-hidden"
        style={{
          backgroundImage: `url(${safHallImg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-black/70" />
        <div className="relative z-10 mx-auto max-w-7xl px-6 md:px-10">
          <div className="flex flex-col items-center text-center mb-16 reveal">
            <div className="inline-flex items-center gap-3 mb-4">
              <span className="h-px w-10 bg-gold" />
              <span className="text-[10px] tracking-luxe uppercase text-crimson">Our Venues</span>
              <span className="h-px w-10 bg-gold" />
            </div>
            <h2 className="font-display text-4xl md:text-5xl lg:text-6xl text-white">
              Explore Our <span className="italic gold-text">Venues</span>
            </h2>
            <p className="mt-4 text-white/60 max-w-2xl">
              Eleven distinguished halls, each engineered with adaptive lighting, cinematic
              acoustics and concierge-grade hospitality.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 stagger-children">
            {venues.map((v) => (
              <article key={v.name} className="venue-card bg-card border border-border reveal">
                <div className="p-8">
                  <h3 className="font-display text-2xl md:text-3xl crimson-text">{v.name}</h3>
                  <div className="mt-4 glass-dark text-[10px] tracking-luxe uppercase text-gold px-3 py-1.5 inline-block">
                    {v.pax} Pax
                  </div>
                </div>
                <div className="relative aspect-[16/10] overflow-hidden">
                  <img
                    src={v.img}
                    alt={v.name}
                    className="h-full w-full object-cover parallax-img"
                    loading="lazy"
                  />
                </div>
                <div className="p-8">
                  <p className="text-sm text-muted-foreground leading-relaxed">{v.note}</p>
                  <Link
                    to="/venues"
                    className="mt-6 inline-flex items-center gap-2 text-xs tracking-luxe uppercase crimson-text border-b border-crimson/30 pb-1 hover:border-crimson transition-colors group"
                  >
                    Explore{" "}
                    <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </article>
            ))}
          </div>

          <div className="text-center mt-12 reveal">
            <Link to="/venues" className="btn-primary">
              View All Venues <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════ EVENT CATEGORIES — Tall image grid ═══════ */}
      <section className="mx-auto max-w-7xl px-6 md:px-10 py-32 section-divider">
        <div className="flex flex-col items-center text-center mb-16 reveal">
          <div className="inline-flex items-center gap-3 mb-4">
            <span className="h-px w-10 bg-gold" />
            <span className="text-[10px] tracking-luxe uppercase text-crimson">Specialised In</span>
            <span className="h-px w-10 bg-gold" />
          </div>
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl">
            Events We <span className="italic gold-text">Excel At</span>
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 stagger-children">
          {eventTypes.map((c) => (
            <div
              key={c.label}
              className="relative overflow-hidden aspect-[3/4] group venue-card reveal"
            >
              <img
                src={c.img}
                alt={c.label}
                className="h-full w-full object-cover transition duration-700 group-hover:scale-110"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute inset-0 bg-crimson/0 group-hover:bg-crimson/20 transition-colors duration-500" />
              <div className="absolute inset-x-0 bottom-0 p-6 text-white">
                <div className="transform transition-transform duration-500 -translate-y-14 lg:translate-y-0 lg:group-hover:-translate-y-14 lg:group-active:-translate-y-14">
                  <div className="text-[10px] tracking-luxe uppercase text-gold/80 mb-2"></div>
                  <div className="font-display text-2xl md:text-3xl">{c.label}</div>
                  <div className="mt-3 h-px w-12 lg:w-0 bg-gold group-hover:w-12 group-active:w-12 transition-all duration-500" />
                </div>

                <div className="absolute bottom-6 left-6 opacity-100 translate-y-0 lg:opacity-0 lg:translate-y-4 transition-all duration-500 group-hover:opacity-100 group-hover:translate-y-0 pointer-events-auto lg:pointer-events-none lg:group-hover:pointer-events-auto">
                  <Link
                    to="/contact"
                    className="btn-gold px-5 py-2.5 text-xs inline-flex items-center"
                  >
                    Book Now <ArrowRight className="h-3.5 w-3.5 ml-2" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════ MARQUEE TEXT STRIP ═══════ */}
      <section className="bg-gradient-royal py-6 overflow-hidden">
        <div className="animate-marquee whitespace-nowrap flex">
          {Array.from({ length: 4 }).map((_, i) => (
            <span key={i} className="inline-flex items-center gap-6 md:gap-12 mr-6 md:mr-12">
              {[
                "Weddings",
                "Conventions",
                "Receptions",
                "Haldi",
                "Mehandi",
                "Birthdays",
                "Engagements",
                "Naming Ceremonies",
                "Baptisms",
                "Anniversaries",
                "Seminars",
              ].map((word) => (
                <span
                  key={`${i}-${word}`}
                  className="font-display text-xl md:text-2xl text-white/70 flex items-center gap-12"
                >
                  {word}
                  <span className="inline-block w-2 h-2 rounded-full bg-gold/40" />
                </span>
              ))}
            </span>
          ))}
        </div>
      </section>

      {/* ═══════ DISCOVER NEARBY ═══════ */}
      <section className="bg-secondary/40 py-32 section-divider">
        <div className="mx-auto max-w-7xl px-6 md:px-10">
          <div className="flex flex-col items-center text-center mb-16 reveal">
            <div className="inline-flex items-center gap-3 mb-4">
              <span className="h-px w-10 bg-gold" />
              <span className="text-[10px] tracking-luxe uppercase text-crimson">What to Do</span>
              <span className="h-px w-10 bg-gold" />
            </div>
            <h2 className="font-display text-4xl md:text-5xl lg:text-6xl">
              Discover <span className="italic gold-text">Nearby</span> Attractions
            </h2>
          </div>
          <div className="grid sm:grid-cols-3 lg:grid-cols-5 gap-5 stagger-children">
            {attractions.map((a) => (
              <div
                key={a.name}
                className="reveal bg-card border border-border p-6 text-center hover:border-gold/40 hover:shadow-soft transition-all duration-500 group cursor-pointer"
              >
                <div className="w-12 h-12 mx-auto rounded-full border border-gold/20 flex items-center justify-center mb-4 group-hover:border-gold/50 transition-colors">
                  <MapPinIcon className="h-5 w-5 text-gold/60 group-hover:text-gold transition-colors" />
                </div>
                <div className="font-display text-lg">{a.name}</div>
                <div className="mt-2 text-[10px] tracking-luxe uppercase text-gold">
                  Only {a.km}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ TESTIMONIALS ═══════ */}
      <section className="mx-auto max-w-7xl px-6 md:px-10 py-32 section-divider">
        <div className="flex flex-col items-center text-center mb-16 reveal">
          <div className="inline-flex items-center gap-3 mb-4">
            <span className="h-px w-10 bg-gold" />
            <span className="text-[10px] tracking-luxe uppercase text-crimson">Testimonials</span>
            <span className="h-px w-10 bg-gold" />
          </div>
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl">
            What Our <span className="italic gold-text">Clients</span> Say
          </h2>
        </div>
        <div className="grid md:grid-cols-3 gap-8 stagger-children">
          {testimonials.map((t) => (
            <figure
              key={t.name}
              className="reveal bg-card border border-border p-8 hover:shadow-soft transition-all duration-500 group relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-gold transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
              <Quote className="h-8 w-8 text-gold/20 mb-4" />
              <div className="flex gap-1 mb-4">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <Star key={i} className="h-3.5 w-3.5 fill-gold text-gold" />
                ))}
              </div>
              <blockquote className="text-sm text-foreground/80 leading-relaxed italic font-display text-lg">
                {t.text}
              </blockquote>
              <figcaption className="mt-6 pt-4 border-t border-border">
                <div className="text-sm font-medium text-foreground">{t.name}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{t.role}</div>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* ═══════ CTA SECTION ═══════ */}
      <section className="relative isolate overflow-hidden">
        <img
          src={safHallImg}
          alt=""
          className="absolute inset-0 h-full w-full object-cover -z-10"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-black/10 to-black/25 -z-10" />
        <div className="mx-auto max-w-4xl px-6 md:px-10 py-32 text-center text-white reveal flex flex-col items-center">
          <div className="bg-black/50 backdrop-blur-md p-10 md:p-14 rounded-3xl border border-white/10 shadow-2xl w-full max-w-3xl">
            <div className="inline-flex items-center gap-3 mb-6">
              <span className="h-px w-8 bg-white/30" />
              <span className="text-[10px] tracking-[0.5em] uppercase text-white/70">
                Plan Your Event
              </span>
              <span className="h-px w-8 bg-white/30" />
            </div>
            <h2 className="font-display text-4xl md:text-5xl lg:text-6xl text-balance leading-[1.1] text-white drop-shadow-md">
              Reserve a night that will be remembered
              <span className="italic gold-text"> for a lifetime.</span>
            </h2>
            <p className="mt-6 text-white/90 max-w-xl mx-auto leading-relaxed">
              Let our dedicated concierge team craft a bespoke experience tailored to your vision.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/contact" className="btn-gold">
                Book Now <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/venues" className="btn-outline">
                Tour Our Venues
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

/* Simple MapPin icon to avoid extra import */
function MapPinIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}
