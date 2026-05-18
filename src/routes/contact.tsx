import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Mail, Phone, MapPin, Send, Clock, ArrowRight } from "lucide-react";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import heroImg from "@/assets/hero-convention.png";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — SAF Celestia EventVerse" },
      { name: "description", content: "Reserve your event or speak with a Celestia concierge." },
    ],
  }),
  component: Contact,
});

function Contact() {
  const [sent, setSent] = useState(false);
  useScrollReveal();

  return (
    <div>
      {/* Hero */}
      <section className="relative isolate h-[50vh] min-h-[380px] flex items-center justify-center overflow-hidden">
        <img src={heroImg} alt="" className="absolute inset-0 h-full w-full object-cover -z-10" />
        <div className="absolute inset-0 bg-black/55 -z-10" />
        <div className="text-center px-6 max-w-4xl text-white reveal">
          <div className="inline-flex items-center gap-3 mb-4">
            <span className="h-px w-8 bg-gold/60" />
            <span className="text-[10px] tracking-[0.5em] uppercase text-gold/90">
              Get in Touch
            </span>
            <span className="h-px w-8 bg-gold/60" />
          </div>
          <h1 className="font-display text-5xl md:text-7xl">
            Begin your <span className="italic gold-text">story</span>.
          </h1>
        </div>
      </section>

      {/* Contact info strip */}
      <section className="relative -mt-12 z-10">
        <div className="mx-auto max-w-5xl px-6">
          <div className="glass-card shadow-royal py-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: Phone, label: "Phone", value: "+91 98765 43210", sub: "24/7 Concierge" },
              {
                icon: Mail,
                label: "Email",
                value: "celestia@safconvention.com",
                sub: "General enquiries",
              },
              {
                icon: MapPin,
                label: "Address",
                value: "Star Avenue, Skyline District",
                sub: "By appointment",
              },
              {
                icon: Clock,
                label: "Hours",
                value: "Always Open",
                sub: "Concierge available 24/7",
              },
            ].map(({ icon: Icon, label, value, sub }) => (
              <div key={label} className="stat-item text-left flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center shrink-0">
                  <Icon className="h-4 w-4 text-gold" />
                </div>
                <div>
                  <div className="text-[10px] tracking-luxe uppercase text-crimson">{label}</div>
                  <div className="text-sm font-medium mt-0.5">{value}</div>
                  <div className="text-xs text-muted-foreground">{sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Main form */}
      <section className="mx-auto max-w-7xl px-6 md:px-10 py-28">
        <div className="grid lg:grid-cols-2 gap-16 items-start">
          {/* Left */}
          <div className="reveal-left">
            <div className="inline-flex items-center gap-3 mb-4">
              <span className="h-px w-10 bg-gold" />
              <span className="text-[10px] tracking-luxe uppercase text-crimson">Enquiry</span>
            </div>
            <h2 className="font-display text-4xl md:text-5xl leading-tight">
              Let's create something <span className="gold-text italic">remarkable</span>.
            </h2>
            <p className="mt-6 text-muted-foreground max-w-md leading-relaxed">
              Share a few details about your event and a dedicated concierge will respond within the
              hour with a tailored proposal.
            </p>
            <div className="mt-10 hairline-gold w-20" />

            {/* FAQ mini */}
            <div className="mt-10 space-y-6">
              <div>
                <h4 className="font-display text-lg">How far in advance should I book?</h4>
                <p className="mt-1 text-sm text-muted-foreground">
                  We recommend at least 3–6 months for large events, though we can accommodate
                  shorter timelines.
                </p>
              </div>
              <div>
                <h4 className="font-display text-lg">Do you offer custom packages?</h4>
                <p className="mt-1 text-sm text-muted-foreground">
                  Absolutely. Every event at Celestia is bespoke — catering, décor, entertainment
                  and more.
                </p>
              </div>
              <div>
                <h4 className="font-display text-lg">Can I schedule a venue tour?</h4>
                <p className="mt-1 text-sm text-muted-foreground">
                  Yes! Our concierge team will arrange a personalised walkthrough at your
                  convenience.
                </p>
              </div>
            </div>
          </div>

          {/* Right — form */}
          <div className="reveal-right">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setSent(true);
              }}
              className="bg-card border border-border p-8 md:p-10 shadow-soft"
            >
              {sent ? (
                <div className="text-center py-16">
                  <div className="w-16 h-16 mx-auto rounded-full bg-gold/10 flex items-center justify-center mb-6">
                    <Send className="h-7 w-7 text-gold" />
                  </div>
                  <div className="font-display text-3xl gold-text">Thank you.</div>
                  <p className="mt-3 text-muted-foreground">A concierge will reach out shortly.</p>
                  <Link to="/" className="mt-8 btn-primary inline-flex">
                    Back to Home <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              ) : (
                <div className="space-y-5">
                  <div className="text-[10px] tracking-luxe uppercase text-crimson mb-6">
                    Send Us a Message
                  </div>
                  <div className="grid sm:grid-cols-2 gap-5">
                    <Field label="First Name" id="fname" />
                    <Field label="Last Name" id="lname" />
                  </div>
                  <Field label="Email Address" id="email" type="email" />
                  <Field label="Phone Number" id="phone" type="tel" />
                  <Field label="Event Type" id="type" placeholder="Wedding, Conference, Gala…" />
                  <div className="grid sm:grid-cols-2 gap-5">
                    <Field label="Event Date" id="date" type="date" />
                    <Field label="Expected Guests" id="guests" placeholder="e.g. 500" />
                  </div>
                  <div>
                    <label
                      htmlFor="msg"
                      className="text-[11px] uppercase tracking-widest text-muted-foreground font-medium"
                    >
                      Tell us more about your vision
                    </label>
                    <textarea
                      id="msg"
                      rows={4}
                      className="mt-2 w-full border border-border bg-background/60 px-4 py-3 text-sm outline-none focus:border-gold transition-colors resize-none"
                      placeholder="Describe your dream event..."
                    />
                  </div>
                  <button className="w-full btn-primary justify-center">
                    Send Enquiry <Send className="h-4 w-4" />
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      </section>

      {/* Map placeholder */}
      <section className="bg-secondary/40 py-20 section-divider">
        <div className="mx-auto max-w-7xl px-6 md:px-10">
          <div className="flex flex-col items-center text-center mb-10 reveal">
            <div className="inline-flex items-center gap-3 mb-4">
              <span className="h-px w-10 bg-gold" />
              <span className="text-[10px] tracking-luxe uppercase text-crimson">Find Us</span>
              <span className="h-px w-10 bg-gold" />
            </div>
            <h2 className="font-display text-4xl md:text-5xl">
              Our <span className="italic gold-text">Location</span>
            </h2>
          </div>
          <div className="reveal aspect-[16/6] bg-card border border-border overflow-hidden shadow-soft">
            <iframe
              title="SAF Celestia Location"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3929.508236407!2d76.3219!3d9.9312!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3b0612f40e681c6f%3A0x2e5b1e5c1e3f4b0a!2sKochi%2C%20Kerala!5e0!3m2!1sen!2sin!4v1700000000000"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="w-full h-full"
            />
          </div>
        </div>
      </section>
    </div>
  );
}

function Field({
  label,
  id,
  type = "text",
  placeholder,
}: {
  label: string;
  id: string;
  type?: string;
  placeholder?: string;
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="text-[11px] uppercase tracking-widest text-muted-foreground font-medium"
      >
        {label}
      </label>
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        className="mt-2 w-full border border-border bg-background/60 px-4 py-3 text-sm outline-none focus:border-gold transition-colors"
      />
    </div>
  );
}
