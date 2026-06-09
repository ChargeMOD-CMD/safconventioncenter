import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { TIME_SLOTS, type TimeSlot } from "@/lib/supabase";
import {
  Mail,
  Phone,
  MapPin,
  Send,
  Clock,
  ArrowRight,
  Navigation,
  Mountain,
  Train,
  Plane,
  Building,
  TreePine,
  Compass,
} from "lucide-react";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import heroImg from "@/assets/hero-convention.png";
import safHallImg from "@/assets/saf-hall-interior.jpg";
import saf01Img from "@/assets/saf01.jpg";
import locationMapImg from "@/assets/location-map.png";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — SAF Convention Centre" },
      { name: "description", content: "Reserve your event or speak with a SAF concierge." },
    ],
  }),
  component: Contact,
});

function Contact() {
  const [sent, setSent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot>("full_day");
  const [bookedSlots, setBookedSlots] = useState<TimeSlot[]>([]);
  const [checkingSlots, setCheckingSlots] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  useScrollReveal();

  // Re-check booked slots whenever date changes
  useEffect(() => {
    if (!selectedDate) {
      setBookedSlots([]);
      return;
    }
    const checkSlots = async () => {
      setCheckingSlots(true);
      const { data } = await supabase
        .from("bookings")
        .select("event_time_slot,status")
        .eq("event_date", selectedDate)
        .in("status", ["approved", "pending"]);

      const taken: TimeSlot[] = [];
      (data || []).forEach((r: { event_time_slot: string; status: string }) => {
        const slot = r.event_time_slot as TimeSlot;
        if (slot === "full_day") {
          taken.push("morning", "afternoon", "evening", "full_day");
        } else {
          taken.push(slot);
        }
      });
      // If any single slot taken, full_day is also unavailable
      if (taken.length > 0 && !taken.includes("full_day")) taken.push("full_day");
      setBookedSlots(Array.from(new Set(taken)));
      setCheckingSlots(false);
    };
    checkSlots();
  }, [selectedDate]);

  const isSlotBooked = (s: TimeSlot) => bookedSlots.includes(s);
  const currentSlotBooked = isSlotBooked(selectedSlot);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg("");

    const formData = new FormData(e.currentTarget);
    const fullName = formData.get("fname") as string;
    const [first_name, ...lastNames] = fullName.trim().split(" ");
    const last_name = lastNames.join(" ");

    const bookingData = {
      first_name,
      last_name,
      email: formData.get("email") as string,
      phone: formData.get("phone") as string,
      event_type: formData.get("type") as string,
      event_date: formData.get("date") as string,
      event_time_slot: selectedSlot,
      expected_guests: parseInt(formData.get("guests") as string) || null,
      message: formData.get("msg") as string,
    };

    const { data: bookingData2, error } = await supabase.from("bookings").insert([bookingData]).select("id, event_date").single();

    if (error) {
      console.error("Booking insert failed:", error);
      setErrorMsg(error.message || "Failed to submit request. Please try again.");
      setIsSubmitting(false);
    } else {
      // Mark the date as Pending on the calendar so admin can see the new request
      if (bookingData2) {
        await (supabase as any)
          .from("calendar_dates")
          .upsert(
            { date: bookingData2.event_date, status: "pending", booking_id: bookingData2.id },
            { onConflict: "date" }
          );
      }
      setSent(true);
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      {/* Hero */}
      <section className="relative isolate h-[50vh] min-h-[380px] flex items-center justify-center overflow-hidden">
        <img
          src={saf01Img}
          alt=""
          className="absolute inset-0 h-full w-full object-cover -z-10"
        />
        <div className="absolute inset-0 bg-black/55 -z-10" />
        <div className="text-center px-6 max-w-4xl text-white reveal">
          <div className="inline-flex items-center gap-3 mb-4">
            <span className="h-px w-8 bg-gold/60" />
            <span className="text-[10px] tracking-[0.5em] uppercase text-gold/90">
              Get in Touch
            </span>
            <span className="h-px w-8 bg-gold/60" />
          </div>
          <h1 className="font-display text-5xl md:text-7xl text-white">
            Begin Your <span className="italic gold-text">story</span>.
          </h1>
        </div>
      </section>

      {/* Contact info strip */}
      <section className="relative -mt-12 z-10">
        <div className="mx-auto max-w-5xl px-6">
          <div className="glass-card shadow-royal py-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: Phone, label: "Phone", value: "+91 9400066303, +91 9961483330", sub: "24/7 Concierge" },
              {
                icon: Mail,
                label: "Email",
                value: "safconventioncentre111@gmail.com",
                sub: "General enquiries",
              },
              {
                icon: MapPin,
                label: "Address",
                value: "Chullimanoor, Nedumangad, Trivandrum",
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
                  <div className="text-sm font-medium mt-0.5 break-all">{value}</div>
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
                  Absolutely. Every event at SAF Convention Centre is bespoke — catering, décor, entertainment
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
              onSubmit={handleSubmit}
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

                  {errorMsg && (
                    <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-md text-red-400 text-sm">
                      {errorMsg}
                    </div>
                  )}

                  <Field label="Full Name" id="fname" required />
                  <Field label="Email Address" id="email" type="email" required />
                  <Field label="Phone Number" id="phone" type="tel" required />
                  <Field
                    label="Event Type"
                    id="type"
                    placeholder="Wedding, Conference, Gala…"
                    required
                  />
                  <div className="grid sm:grid-cols-2 gap-5">
                    <Field
                      label="Event Date"
                      id="date"
                      type="date"
                      required
                      value={selectedDate}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setSelectedDate(e.target.value)
                      }
                    />
                    <Field
                      label="Expected Guests"
                      id="guests"
                      type="number"
                      placeholder="e.g. 500"
                    />
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
                      name="msg"
                      rows={4}
                      className="mt-2 w-full border border-border bg-background/60 px-4 py-3 text-sm outline-none focus:border-gold transition-colors resize-none"
                      placeholder="Describe your dream event..."
                    />
                  </div>
                  <button
                    disabled={isSubmitting || currentSlotBooked || !selectedDate}
                    className="w-full btn-primary justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? "Sending..." : "Send Enquiry"} <Send className="h-4 w-4" />
                  </button>
                  {currentSlotBooked && (
                    <p className="text-xs text-red-400 text-center mt-2">
                      The selected date is unavailable. Please choose another.
                    </p>
                  )}
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
          <div className="reveal relative bg-card border border-border overflow-hidden shadow-soft rounded-2xl">
            <img
              src={locationMapImg}
              alt="SAF Location Map"
              className="w-full h-auto object-cover"
            />

            <div className="absolute bottom-4 right-4 md:bottom-8 md:right-8">
              <a
                href="https://maps.google.com/?q=SAF+Convention+Centre"
                target="_blank"
                rel="noreferrer"
                className="glass-dark px-5 py-3 md:px-6 md:py-4 rounded-xl flex items-center gap-3 md:gap-4 hover:-translate-y-1 hover:shadow-glow transition-all duration-300 border border-gold/30 group"
              >
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gold/20 flex items-center justify-center shrink-0">
                  <Navigation className="w-4 h-4 md:w-5 md:h-5 text-gold group-hover:animate-pulse" />
                </div>
                <div>
                  <div className="text-[10px] md:text-xs tracking-widest uppercase text-gold/80 font-medium">
                    Navigate
                  </div>
                  <div className="text-white font-display text-base md:text-lg">Direction</div>
                </div>
              </a>
            </div>
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
  required = false,
  value,
  onChange,
}: {
  label: string;
  id: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
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
        name={id}
        type={type}
        placeholder={placeholder}
        required={required}
        value={value}
        onChange={onChange}
        className="mt-2 w-full border border-border bg-background/60 px-4 py-3 text-sm outline-none focus:border-gold transition-colors rounded-md"
      />
    </div>
  );
}
