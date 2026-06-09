import { useState } from "react";
import { supabase, Booking, type TimeSlot } from "@/lib/supabase";

export function AdminField({ name, label, type = "text", required, placeholder }: any) {
  return (
    <div>
      <label className="text-[10px] uppercase tracking-widest text-white/35 font-medium">
        {label} {required && <span className="text-gold">*</span>}
      </label>
      <input
        type={type}
        name={name}
        required={required}
        placeholder={placeholder}
        className="mt-2 w-full border border-white/10 bg-white/5 px-3 py-2.5 text-sm rounded-lg outline-none focus:border-gold transition-colors text-white/80 placeholder:text-white/20"
      />
    </div>
  );
}

export function QuickBookPanel({ onCreated, defaultDate }: { onCreated: (b: Booking) => void, defaultDate?: string }) {
  const [slot, setSlot] = useState<TimeSlot>("full_day");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    const fd = new FormData(e.currentTarget);
    const fullName = fd.get("full_name") as string;
    const [first_name, ...lastNames] = fullName.trim().split(" ");

    const type = fd.get("event_type") as string;
    const acPref = fd.get("ac_pref") as string;
    const venue = fd.get("venue") as string;

    const eventTypeFormatted = venue && venue !== "Any Venue"
      ? `${type.trim()} - ${venue} (${acPref})`
      : `${type.trim()} (${acPref})`;

    const payload = {
      first_name:      first_name || "",
      last_name:       lastNames.join(" "),
      email:           (fd.get("email") as string) || "admin@safcc.local",
      phone:           fd.get("phone") as string,
      event_type:      eventTypeFormatted,
      event_date:      fd.get("event_date") as string,
      event_time_slot: slot,
      expected_guests: parseInt(fd.get("guests") as string) || null,
      message:         (fd.get("message") as string) || "Created by admin",
      status:          "approved" as const,
    };

    const { data, error: err } = await supabase.from("bookings").insert([payload]).select().single();
    if (err || !data) {
      setError(err?.message || "Failed to create booking.");
      setSubmitting(false);
      return;
    }
    // Sync calendar so the new approved date appears as Booked immediately
    await (supabase as any)
      .from("calendar_dates")
      .upsert({ date: payload.event_date, status: "approved", booking_id: (data as any).id }, { onConflict: "date" });
    onCreated(data as Booking);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border border-gold/20 p-6"
      style={{ background: "oklch(0.15 0.018 240)" }}
    >
      <h2 className="font-display text-lg mb-5 text-gold">New Booking</h2>
      {error && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-lg">{error}</div>
      )}
      <div className="grid md:grid-cols-3 gap-4">
        <AdminField name="full_name" label="Full Name" required />
        <AdminField name="phone"      label="Phone" required placeholder="+91…" />
        <AdminField name="event_type" label="Event Type" required placeholder="Wedding, Gala…" />
        <div>
          <label className="text-[10px] uppercase tracking-widest text-white/35 font-medium">Venue</label>
          <select
            name="venue"
            className="mt-2 w-full border border-white/10 bg-white/5 px-3 py-2.5 text-sm rounded-lg outline-none focus:border-gold transition-colors text-white/80"
          >
            <option value="Any Venue" className="bg-[#1c1c28]">Any Venue</option>
            <option value="SAF Grand" className="bg-[#1c1c28]">SAF Grand</option>
            <option value="SAF Aura" className="bg-[#1c1c28]">SAF Aura</option>
            <option value="SAF Crown" className="bg-[#1c1c28]">SAF Crown</option>
          </select>
        </div>
        <div>
          <label className="text-[10px] uppercase tracking-widest text-white/35 font-medium">AC / Non-AC</label>
          <select
            name="ac_pref"
            className="mt-2 w-full border border-white/10 bg-white/5 px-3 py-2.5 text-sm rounded-lg outline-none focus:border-gold transition-colors text-white/80"
          >
            <option value="AC" className="bg-[#1c1c28]">AC</option>
            <option value="Non-AC" className="bg-[#1c1c28]">Non-AC</option>
          </select>
        </div>
        
        <div>
          <label className="text-[10px] uppercase tracking-widest text-white/35 font-medium">
            Event Date <span className="text-gold">*</span>
          </label>
          <input
            type="date"
            name="event_date"
            required
            defaultValue={defaultDate}
            className="mt-2 w-full border border-white/10 bg-white/5 px-3 py-2.5 text-sm rounded-lg outline-none focus:border-gold transition-colors text-white/80 placeholder:text-white/20"
          />
        </div>

        <AdminField name="guests"     label="Guests" type="number" />

        <div className="md:col-span-1">
          <label className="text-[10px] uppercase tracking-widest text-white/35 font-medium">Notes</label>
          <textarea
            name="message"
            rows={1}
            placeholder="Optional notes…"
            className="mt-2 w-full border border-white/10 bg-white/5 px-3 py-2.5 text-sm rounded-lg outline-none focus:border-gold transition-colors text-white/80 placeholder:text-white/20 resize-none"
          />
        </div>
      </div>
      <div className="mt-5 flex justify-end">
        <button
          type="submit"
          disabled={submitting}
          className="px-6 py-2.5 bg-gold text-black rounded-lg text-sm font-semibold hover:bg-gold/90 transition-colors disabled:opacity-50"
        >
          {submitting ? "Saving…" : "Create Booking"}
        </button>
      </div>
    </form>
  );
}
