import { Link } from "@tanstack/react-router";
import { ArrowRight, Phone, Mail, MapPin, Instagram, Facebook, Youtube } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="relative overflow-hidden">
      {/* Dark premium background */}
      <div className="bg-gradient-dark">
        {/* Top CTA strip */}
        <div className="border-b border-white/10">
          <div className="mx-auto max-w-7xl px-6 md:px-10 py-16 flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
            <div>
              <div className="text-[10px] tracking-luxe uppercase text-gold mb-3">
                Plan Your Event
              </div>
              <h3 className="font-display text-3xl md:text-4xl text-white">
                Ready to create something <span className="italic text-gold">unforgettable</span>?
              </h3>
            </div>
            <Link to="/contact" className="btn-primary shrink-0">
              Get in Touch <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {/* Main footer content */}
        <div className="mx-auto max-w-7xl px-6 md:px-10 py-20 grid gap-12 md:gap-8 md:grid-cols-12">
          {/* Brand */}
          <div className="md:col-span-5">
            <div className="font-display text-3xl text-white">SAF Convention Center</div>
            <p className="mt-6 text-sm text-white/50 max-w-sm leading-relaxed">
              Elevating every event experience with style, space and exceptional service. From royal
              weddings to landmark summits, every moment is curated with cinematic precision at
              South India's most distinguished convention venue.
            </p>
            <div className="mt-8 flex gap-4">
              {[
                { icon: Instagram, label: "Instagram", href: "https://www.instagram.com/safconventioncenter?igsh=MXlrczhnMDhxOXIx" },
                { icon: Facebook, label: "Facebook", href: "#" },
                { icon: Youtube, label: "YouTube", href: "#" },
              ].map(({ icon: Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  target={href !== "#" ? "_blank" : undefined}
                  rel={href !== "#" ? "noopener noreferrer" : undefined}
                  aria-label={label}
                  className="w-10 h-10 rounded-full border border-white/15 flex items-center justify-center text-white/40 hover:text-gold hover:border-gold/40 transition-all duration-300"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick links */}
          <div className="md:col-span-2">
            <h4 className="text-[10px] tracking-luxe uppercase text-gold mb-6">Explore</h4>
            <ul className="space-y-3">
              {[
                { to: "/", label: "Home" },
                { to: "/venues", label: "Venues" },
                { to: "/about", label: "About Us" },
                { to: "/contact", label: "Contact" },
              ].map((item) => (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    className="text-sm text-white/50 hover:text-gold transition-colors duration-300 flex items-center gap-2 group"
                  >
                    <span className="h-px w-0 bg-gold group-hover:w-3 transition-all duration-300" />
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Venues */}
          <div className="md:col-span-2">
            <h4 className="text-[10px] tracking-luxe uppercase text-gold mb-6">Venues</h4>
            <ul className="space-y-3">
              {["SAF Grand", "SAF Aura", "SAF Crown"].map((v) => (
                <li key={v}>
                  <Link
                    to="/venues"
                    className="text-sm text-white/50 hover:text-gold transition-colors duration-300 flex items-center gap-2 group"
                  >
                    <span className="h-px w-0 bg-gold group-hover:w-3 transition-all duration-300" />
                    {v}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="md:col-span-3">
            <h4 className="text-[10px] tracking-luxe uppercase text-gold mb-6">Reach Us</h4>
            <ul className="space-y-5">
              <li className="flex items-start gap-3">
                <Phone className="h-4 w-4 text-gold/60 mt-0.5 shrink-0" />
                <div>
                  <div className="text-sm text-white/70">+91 9400066303, +91 9961483330</div>
                  <div className="text-xs text-white/30 mt-0.5">24/7 Concierge</div>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Mail className="h-4 w-4 text-gold/60 mt-0.5 shrink-0" />
                <div>
                  <div className="text-sm text-white/70">safconventioncentre111@gmail.com</div>
                  <div className="text-xs text-white/30 mt-0.5">General enquiries</div>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="h-4 w-4 text-gold/60 mt-0.5 shrink-0" />
                <div>
                  <div className="text-sm text-white/70">Chullimanoor, Nedumangad, Trivandrum</div>
                  <div className="text-xs text-white/30 mt-0.5">By appointment</div>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10 py-6">
          <div className="mx-auto max-w-7xl px-6 md:px-10 flex flex-col md:flex-row items-center justify-between gap-4 text-[11px] text-white/30 tracking-wider uppercase text-center md:text-left">
            <span className="max-w-[280px] md:max-w-none">
              © {new Date().getFullYear()} SAF Convention Centre
            </span>
            <div className="flex flex-wrap justify-center gap-4 md:gap-6">
              <span className="hover:text-white/60 cursor-pointer transition-colors">Privacy</span>
              <span className="hover:text-white/60 cursor-pointer transition-colors">Terms</span>
              <span className="hover:text-white/60 cursor-pointer transition-colors">Sitemap</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
