import { Link } from "@tanstack/react-router";
import { ArrowRight, Phone, Mail, MapPin, Instagram, Facebook, Youtube } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="relative overflow-hidden">
      {/* Dark premium background */}
      <div className="bg-gradient-dark">
        {/* Top CTA strip */}
        <div className="border-b border-white/10">
          <div className="mx-auto max-w-7xl px-6 md:px-10 py-16 flex flex-col md:flex-row items-center justify-between gap-8">
            <div>
              <div className="text-[10px] tracking-luxe uppercase text-gold mb-3">
                Plan Your Event
              </div>
              <h3 className="font-display text-3xl md:text-4xl text-white">
                Ready to create something <span className="italic text-gold">unforgettable</span>?
              </h3>
            </div>
            <Link to="/contact" className="btn-primary">
              Get in Touch <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {/* Main footer content */}
        <div className="mx-auto max-w-7xl px-6 md:px-10 py-20 grid gap-12 md:gap-8 md:grid-cols-12">
          {/* Brand */}
          <div className="md:col-span-5">
            <div className="font-display text-3xl text-white">SAF Celestia</div>
            <div className="mt-1 text-[9px] tracking-[0.4em] uppercase text-white/40">
              International Convention Centre
            </div>
            <p className="mt-6 text-sm text-white/50 max-w-sm leading-relaxed">
              Elevating every event experience with style, space and exceptional service. From royal
              weddings to landmark summits, every moment is curated with cinematic precision at
              South India's most distinguished convention venue.
            </p>
            <div className="mt-8 flex gap-4">
              {[
                { icon: Instagram, label: "Instagram" },
                { icon: Facebook, label: "Facebook" },
                { icon: Youtube, label: "YouTube" },
              ].map(({ icon: Icon, label }) => (
                <a
                  key={label}
                  href="#"
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
                { to: "/experiences", label: "Experiences" },
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
              {[
                "Celestia Luxe",
                "Celestia Grand",
                "Celestia Crown",
                "Celestia Gala",
                "Celestia Atrium",
              ].map((v) => (
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
                  <div className="text-sm text-white/70">+91 98765 43210</div>
                  <div className="text-xs text-white/30 mt-0.5">24/7 Concierge</div>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Mail className="h-4 w-4 text-gold/60 mt-0.5 shrink-0" />
                <div>
                  <div className="text-sm text-white/70">celestia@safconvention.com</div>
                  <div className="text-xs text-white/30 mt-0.5">General enquiries</div>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="h-4 w-4 text-gold/60 mt-0.5 shrink-0" />
                <div>
                  <div className="text-sm text-white/70">Star Avenue, Skyline District</div>
                  <div className="text-xs text-white/30 mt-0.5">By appointment</div>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10 py-6">
          <div className="mx-auto max-w-7xl px-6 md:px-10 flex flex-col md:flex-row items-center justify-between gap-3 text-[11px] text-white/30 tracking-wider uppercase">
            <span>© {new Date().getFullYear()} SAF Convention Centre · Celestia EventVerse</span>
            <div className="flex gap-6">
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
