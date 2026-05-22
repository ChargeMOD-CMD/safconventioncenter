import { Link, useRouterState } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { X, Phone, Mail, Clock, ChevronRight } from "lucide-react";

const nav = [
  { to: "/", label: "Home" },
  { to: "/venues", label: "Venues" },
  { to: "/experiences", label: "Experiences" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const routerState = useRouterState();
  const isHome =
    routerState.location.pathname === "/" ||
    routerState.location.pathname === "/safconventioncenter/";

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Lock body scroll when menu is open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const headerBg = scrolled
    ? "bg-background/95 backdrop-blur-xl border-b border-border shadow-sm"
    : isHome
      ? "bg-transparent border-b border-white/10"
      : "bg-background/95 backdrop-blur-xl border-b border-border";

  const textColor = scrolled || !isHome ? "text-foreground" : "text-white";
  const logoColor = scrolled || !isHome ? "crimson-text" : "text-white";
  const subtitleColor = scrolled || !isHome ? "text-muted-foreground" : "text-white/70";

  return (
    <>
      {/* Fixed header wrapper — info bar + nav in one fixed container */}
      <header className="fixed inset-x-0 top-0 z-50 transition-all duration-500">
        {/* Top info bar – collapses on scroll */}
        <div
          className={`hidden md:block transition-all duration-500 ${
            scrolled ? "h-0 opacity-0 overflow-hidden" : "h-10 opacity-100"
          } ${isHome ? "bg-black/20 backdrop-blur-sm text-white/80" : "bg-secondary text-muted-foreground"}`}
        >
          <div className="mx-auto max-w-7xl h-full flex items-center justify-between px-6 md:px-10 text-[11px] tracking-wider">
            <div className="flex items-center gap-6">
              <span className="flex items-center gap-1.5">
                <Phone className="h-3 w-3" /> +91 98765 43210
              </span>
              <span className="flex items-center gap-1.5">
                <Mail className="h-3 w-3" /> celestia@safconvention.com
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="h-3 w-3" /> Concierge available 24/7
            </div>
          </div>
        </div>

        {/* Main navigation */}
        <div className={`transition-all duration-500 ${headerBg}`}>
          <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 md:px-10 relative">
            {/* Hamburger */}
            <div className="flex-1 flex justify-start">
              <button
                onClick={() => setOpen(true)}
                className={`flex items-center gap-3 text-xs tracking-luxe uppercase ${textColor} hover:opacity-70 transition-opacity`}
                aria-label="Open menu"
              >
                <span className="flex flex-col gap-[5px]">
                  <span
                    className={`block h-[1.5px] w-7 ${scrolled || !isHome ? "bg-foreground" : "bg-white"} transition-colors`}
                  />
                  <span
                    className={`block h-[1.5px] w-5 ${scrolled || !isHome ? "bg-foreground" : "bg-white"} transition-colors`}
                  />
                </span>
                <span className="hidden sm:inline">Menu</span>
              </button>
            </div>

            {/* Logo */}
            <div className="absolute left-1/2 -translate-x-1/2 flex justify-center w-max">
              <Link to="/" className="flex flex-col items-center leading-none group text-center">
                <span
                  className={`font-display text-lg sm:text-xl md:text-2xl transition-colors ${logoColor}`}
                >
                  SAF Convention Center
                </span>
                <span
                  className={`mt-1 hidden sm:block text-[8px] tracking-[0.4em] uppercase transition-colors ${subtitleColor}`}
                ></span>
              </Link>
            </div>

            {/* Nav & CTA */}
            <div className="flex-1 flex justify-end items-center gap-8">
              {/* Desktop nav links */}
              <div className="hidden lg:flex items-center gap-8">
                {nav.slice(1, 4).map((n) => (
                  <Link
                    key={n.to}
                    to={n.to}
                    className={`text-[11px] tracking-[0.2em] uppercase ${textColor} hover:text-gold transition-colors relative after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-[1px] after:bg-gold after:transition-all hover:after:w-full`}
                  >
                    {n.label}
                  </Link>
                ))}
              </div>

              {/* CTA */}
              <Link
                to="/contact"
                className={`inline-flex text-[10px] sm:text-xs tracking-widest sm:tracking-luxe uppercase transition-all ${
                  scrolled || !isHome
                    ? "text-crimson border-b border-crimson/50 pb-1 hover:border-crimson"
                    : "text-white border-b border-white/40 pb-1 hover:border-white"
                }`}
              >
                Book Now
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Full-screen menu overlay */}
      <div
        className={`fixed inset-0 z-[60] transition-all duration-700 ${
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      >
        <div className="absolute inset-0 bg-gradient-dark" />
        <div className="relative h-full flex flex-col">
          {/* Menu header */}
          <div className="flex items-center justify-between px-6 md:px-10 h-20 border-b border-white/10">
            <div className="text-xs tracking-luxe uppercase text-gold">Navigation</div>
            <button
              onClick={() => setOpen(false)}
              aria-label="Close menu"
              className="text-white/70 hover:text-white transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Menu content */}
          <div className="flex-1 flex items-center">
            <div className="mx-auto max-w-7xl w-full px-6 md:px-10">
              <div className="grid lg:grid-cols-[1fr,auto] gap-16">
                <nav className="flex flex-col gap-2">
                  {nav.map((n, i) => (
                    <Link
                      key={n.to}
                      to={n.to}
                      className="group flex items-center gap-4 py-3 text-white hover:text-gold transition-colors duration-300"
                      onClick={() => setOpen(false)}
                    >
                      <span className="text-gold/40 text-sm font-sans tabular-nums group-hover:text-gold transition-colors">
                        0{i + 1}
                      </span>
                      <span className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl">
                        {n.label}
                      </span>
                      <ChevronRight className="h-6 w-6 opacity-0 -translate-x-4 group-hover:opacity-100 group-active:opacity-100 group-hover:translate-x-0 group-active:translate-x-0 transition-all" />
                    </Link>
                  ))}
                </nav>

                {/* Menu sidebar */}
                <div className="hidden lg:flex flex-col justify-end gap-10 pb-4 min-w-[280px]">
                  <div>
                    <div className="text-[10px] tracking-luxe uppercase text-gold mb-3">
                      Contact
                    </div>
                    <div className="text-sm text-white/70 space-y-1">
                      <div>celestia@safconvention.com</div>
                      <div>+91 98765 43210</div>
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] tracking-luxe uppercase text-gold mb-3">
                      Location
                    </div>
                    <div className="text-sm text-white/70">Star Avenue, Skyline District</div>
                  </div>
                  <div>
                    <div className="text-[10px] tracking-luxe uppercase text-gold mb-3">
                      Follow Us
                    </div>
                    <div className="flex gap-4 text-sm text-white/70">
                      <span className="hover:text-gold cursor-pointer transition-colors">
                        Instagram
                      </span>
                      <span className="hover:text-gold cursor-pointer transition-colors">
                        Facebook
                      </span>
                      <span className="hover:text-gold cursor-pointer transition-colors">
                        YouTube
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
