import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase, Booking, TIME_SLOTS, type TimeSlot } from "@/lib/supabase";
import { sendBookingEmail } from "@/lib/email";
import { whatsappLink, smsLink, slotLabel } from "@/lib/notify";
import { format } from "date-fns";
import { useAuth } from "@/hooks/useAuth";
import {
  Check,
  X,
  MessageCircle,
  Phone,
  Plus,
  Search,
  Inbox,
  RefreshCw,
  Eye,
  Lock,
  Pencil,
  Trash2,
  AlertTriangle,
  Save,
} from "lucide-react";

export const Route = createFileRoute("/admin/requests")({
  component: RequestsPage,
});

type FilterStatus = "all" | "pending" | "approved" | "declined";

// ─── Edit Modal ─────────────────────────────────────────────────────────────
function EditBookingModal({
  booking,
  onClose,
  onSaved,
}: {
  booking: Booking;
  onClose: () => void;
  onSaved: (updated: Booking) => void;
}) {
  const existingAcPref = booking.event_type.match(/\((AC|Non-AC)\)$/)?.[1] || "AC";
  const withoutAc = booking.event_type.replace(/ \((AC|Non-AC)\)$/, "");
  const hasVenueMatch = withoutAc.match(/ - (.+)$/);
  const existingVenue = hasVenueMatch ? hasVenueMatch[1] : "Any Venue";
  const existingEventType = hasVenueMatch ? withoutAc.replace(/ - (.+)$/, "") : withoutAc;

  const [form, setForm] = useState({
    full_name:      [booking.first_name, booking.last_name].filter(Boolean).join(" "),
    email:          booking.email,
    phone:          booking.phone,
    event_type:     existingEventType,
    venue:          existingVenue,
    ac_pref:        existingAcPref,
    event_date:     booking.event_date,
    event_time_slot: booking.event_time_slot as TimeSlot,
    expected_guests: booking.expected_guests?.toString() ?? "",
    message:        booking.message ?? "",
    status:         booking.status,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    const [first_name, ...lastNames] = form.full_name.trim().split(" ");

    const eventTypeFormatted = form.venue && form.venue !== "Any Venue"
      ? `${form.event_type.trim()} - ${form.venue} (${form.ac_pref})`
      : `${form.event_type.trim()} (${form.ac_pref})`;

    const payload = {
      first_name:      first_name || "",
      last_name:       lastNames.join(" "),
      email:           form.email.trim(),
      phone:           form.phone.trim(),
      event_type:      eventTypeFormatted,
      event_date:      form.event_date,
      event_time_slot: form.event_time_slot,
      expected_guests: form.expected_guests ? parseInt(form.expected_guests) : null,
      message:         form.message.trim() || null,
      status:          form.status,
    };

    const { data, error: err } = await supabase
      .from("bookings")
      .update(payload)
      .eq("id", booking.id)
      .select()
      .single();

    if (err || !data) {
      setError(err?.message ?? "Failed to save changes.");
      setSaving(false);
      return;
    }

    onSaved(data as Booking);
  };

  const field = (
    key: keyof typeof form,
    label: string,
    type = "text",
    required = false
  ) => (
    <div>
      <label className="block text-[10px] uppercase tracking-widest text-white/35 font-medium mb-1.5">
        {label}
      </label>
      <input
        type={type}
        value={form[key] as string}
        onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
        required={required}
        className="w-full px-3 py-2.5 rounded-lg text-sm text-white/80 placeholder:text-white/25 outline-none transition-colors"
        style={{
          background: "rgba(255,255,255,0.05)",
          border: "1px solid rgba(255,255,255,0.12)",
        }}
        onFocus={(e) => (e.currentTarget.style.borderColor = "#D4AF37")}
        onBlur={(e)  => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)")}
      />
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(4px)" }}>
      <div
        className="w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl"
        style={{ background: "oklch(0.13 0.02 240)", border: "1px solid rgba(255,255,255,0.10)" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
          <div>
            <h2 className="font-display text-lg text-white">Edit Booking</h2>
            <p className="text-xs text-white/35 mt-0.5">
              {booking.first_name} {booking.last_name} — #{booking.id.slice(-6).toUpperCase()}
            </p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg text-white/30 hover:text-white hover:bg-white/8 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="px-6 py-5 max-h-[70vh] overflow-y-auto space-y-4">
            {error && (
              <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-red-400"
                style={{ background: "rgba(239,68,68,0.10)", border: "1px solid rgba(239,68,68,0.20)" }}>
                <AlertTriangle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 gap-4">
              {field("full_name", "Full Name", "text", true)}
            </div>
            <div className="grid grid-cols-1 gap-4">
              {field("phone", "Phone", "tel",   true)}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {field("event_type", "Event Type", "text", true)}
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-white/35 font-medium mb-1.5">
                  Venue
                </label>
                <select
                  value={form.venue}
                  onChange={(e) => setForm((f) => ({ ...f, venue: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-lg text-sm text-white/80 outline-none transition-colors cursor-pointer"
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.12)",
                  }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = "#D4AF37")}
                  onBlur={(e)  => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)")}
                >
                  <option value="Any Venue" className="bg-[#1c1c28]">Any Venue</option>
                  <option value="SAF Grand" className="bg-[#1c1c28]">SAF Grand</option>
                  <option value="SAF Aura" className="bg-[#1c1c28]">SAF Aura</option>
                  <option value="SAF Crown" className="bg-[#1c1c28]">SAF Crown</option>
                  {/* <option value="Gulf Heights" className="bg-[#1c1c28]">Gulf Heights</option>
                  <option value="Wexco Lagon Vista" className="bg-[#1c1c28]">Wexco Lagon Vista</option> */}
                </select>
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-white/35 font-medium mb-1.5">
                  AC / Non-AC
                </label>
                <select
                  value={form.ac_pref}
                  onChange={(e) => setForm((f) => ({ ...f, ac_pref: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-lg text-sm text-white/80 outline-none transition-colors cursor-pointer"
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.12)",
                  }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = "#D4AF37")}
                  onBlur={(e)  => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)")}
                >
                  <option value="AC" className="bg-[#1c1c28]">AC</option>
                  <option value="Non-AC" className="bg-[#1c1c28]">Non-AC</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {field("event_date", "Event Date", "date", true)}
              {field("expected_guests", "Expected Guests", "number")}
            </div>

            {/* Status */}
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-white/35 font-medium mb-1.5">
                Status
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(["pending", "approved", "declined"] as const).map((s) => {
                  const colors = {
                    pending:  { active: "rgba(251,191,36,0.20)",  border: "rgba(251,191,36,0.50)",  text: "#fbbf24" },
                    approved: { active: "rgba(52,211,153,0.20)",  border: "rgba(52,211,153,0.50)",  text: "#34d399" },
                    declined: { active: "rgba(248,113,113,0.20)", border: "rgba(248,113,113,0.50)", text: "#f87171" },
                  };
                  const c = colors[s];
                  const isActive = form.status === s;
                  return (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, status: s }))}
                      className="py-2.5 rounded-lg text-sm font-medium capitalize transition-all"
                      style={{
                        background: isActive ? c.active : "rgba(255,255,255,0.03)",
                        border: `1px solid ${isActive ? c.border : "rgba(255,255,255,0.10)"}`,
                        color: isActive ? c.text : "rgba(255,255,255,0.40)",
                      }}
                    >
                      {s}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Message */}
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-white/35 font-medium mb-1.5">
                Message / Notes
              </label>
              <textarea
                value={form.message}
                onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2.5 rounded-lg text-sm text-white/80 placeholder:text-white/25 outline-none resize-none transition-colors"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.12)",
                }}
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 px-6 py-4"
            style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-sm text-white/50 hover:text-white hover:bg-white/8 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2 bg-gold text-black rounded-lg text-sm font-medium hover:bg-gold/90 disabled:opacity-50 transition-colors"
            >
              <Save className="w-4 h-4" />
              {saving ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Delete Confirm Dialog ───────────────────────────────────────────────────
function DeleteConfirmDialog({
  booking,
  onClose,
  onDeleted,
}: {
  booking: Booking;
  onClose: () => void;
  onDeleted: (id: string) => void;
}) {
  const [deleting, setDeleting] = useState(false);
  const [error, setError]       = useState("");

  const handleDelete = async () => {
    setDeleting(true);
    setError("");
    const { error: err } = await supabase
      .from("bookings")
      .delete()
      .eq("id", booking.id);

    if (err) {
      setError(err.message ?? "Failed to delete booking.");
      setDeleting(false);
      return;
    }
    onDeleted(booking.id);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.70)", backdropFilter: "blur(4px)" }}>
      <div
        className="w-full max-w-md rounded-2xl overflow-hidden shadow-2xl"
        style={{ background: "oklch(0.13 0.02 240)", border: "1px solid rgba(239,68,68,0.25)" }}
      >
        <div className="p-6">
          {/* Icon */}
          <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.30)" }}>
            <Trash2 className="w-6 h-6 text-red-400" />
          </div>

          <h2 className="text-lg font-display text-white text-center mb-1">Delete Booking?</h2>
          <p className="text-sm text-white/45 text-center mb-2">
            This will <span className="text-red-400 font-medium">permanently remove</span> the booking from the database.
            This action cannot be undone.
          </p>

          {/* Booking info */}
          <div className="rounded-xl p-3 mt-4 mb-5"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-red-500/15 border border-red-500/25 flex items-center justify-center shrink-0">
                <span className="text-red-400 text-sm font-bold uppercase">{booking.first_name[0]}</span>
              </div>
              <div>
                <div className="text-sm font-medium text-white/85">
                  {booking.first_name} {booking.last_name}
                </div>
                <div className="text-xs text-white/35">
                  {booking.event_type} · {format(new Date(booking.event_date), "MMM d, yyyy")}
                </div>
              </div>
            </div>
          </div>

          {error && (
            <div className="mb-4 flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-red-400"
              style={{ background: "rgba(239,68,68,0.10)", border: "1px solid rgba(239,68,68,0.20)" }}>
              <AlertTriangle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl text-sm font-medium text-white/60 hover:text-white transition-colors"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.10)" }}
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-colors disabled:opacity-50"
              style={{ background: "rgba(239,68,68,0.20)", border: "1px solid rgba(239,68,68,0.40)", color: "#f87171" }}
            >
              <Trash2 className="w-4 h-4" />
              {deleting ? "Deleting…" : "Yes, Delete"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────
function RequestsPage() {
  const { can } = useAuth();
  const canManage = can("manage_bookings");
  const canEdit   = can("edit_requests");
  const canDelete = can("delete_requests");

  const [bookings, setBookings]             = useState<Booking[]>([]);
  const [loading, setLoading]               = useState(true);
  const [showQuickBook, setShowQuickBook]   = useState(false);
  const [filterStatus, setFilterStatus]     = useState<FilterStatus>("all");
  const [searchQuery, setSearchQuery]       = useState("");
  const [filterMonth, setFilterMonth]       = useState("all");
  const [filterYear, setFilterYear]         = useState("all");
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [deletingBooking, setDeletingBooking] = useState<Booking | null>(null);

  useEffect(() => { fetchBookings(); }, []);

  const fetchBookings = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("bookings")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error && data) setBookings(data as Booking[]);
    setLoading(false);
  };

  const handleUpdateStatus = async (id: string, newStatus: "approved" | "declined") => {
    const { error } = await supabase
      .from("bookings")
      .update({ status: newStatus })
      .eq("id", id);
    if (error) { alert("Failed to update booking status."); return; }

    const updatedBookings = bookings.map((b) => (b.id === id ? { ...b, status: newStatus } : b));
    setBookings(updatedBookings);
    if (selectedBooking?.id === id)
      setSelectedBooking((prev) => (prev ? { ...prev, status: newStatus } : prev));

    const booking = bookings.find((b) => b.id === id);
    if (booking) {
      // Recalculate calendar status from ALL bookings on this date
      // Priority: approved > pending > declined → clear if all declined
      const sameDateBookings = updatedBookings.filter(b => b.event_date === booking.event_date);
      const hasApproved  = sameDateBookings.some(b => b.status === "approved");
      const hasPending   = sameDateBookings.some(b => b.status === "pending");
      const allDeclined  = sameDateBookings.every(b => b.status === "declined");

      if (allDeclined) {
        // Remove calendar entry — date is fully free
        await (supabase as any).from("calendar_dates").delete().eq("date", booking.event_date);
      } else {
        const calStatus = hasApproved ? "approved" : hasPending ? "pending" : "declined";
        await (supabase as any)
          .from("calendar_dates")
          .upsert({ date: booking.event_date, status: calStatus, booking_id: id }, { onConflict: "date" });
      }

      await sendBookingEmail(booking.email, booking.first_name, newStatus, booking.event_date);
      window.open(whatsappLink(booking, newStatus), "_blank");
    }
  };

  // Filtered + searched bookings
  const filtered = bookings.filter((b) => {
    const matchesStatus = filterStatus === "all" || b.status === filterStatus;
    const date = new Date(b.event_date);
    const matchesMonth = filterMonth === "all" || (date.getMonth() + 1).toString() === filterMonth;
    const matchesYear = filterYear === "all" || date.getFullYear().toString() === filterYear;

    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      `${b.first_name} ${b.last_name}`.toLowerCase().includes(q) ||
      b.email.toLowerCase().includes(q) ||
      b.phone.toLowerCase().includes(q) ||
      (b.event_type || "").toLowerCase().includes(q);
      
    return matchesStatus && matchesMonth && matchesYear && matchesSearch;
  });

  const statusColors: Record<string, string> = {
    approved: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    pending:  "text-yellow-400 bg-yellow-500/10 border-yellow-500/20",
    declined: "text-red-400 bg-red-500/10 border-red-500/20",
  };

  const counts = {
    all:      bookings.length,
    pending:  bookings.filter((b) => b.status === "pending").length,
    approved: bookings.filter((b) => b.status === "approved").length,
    declined: bookings.filter((b) => b.status === "declined").length,
  };

  return (
    <>
      {/* ── Edit Modal ── */}
      {editingBooking && (
        <EditBookingModal
          booking={editingBooking}
          onClose={() => setEditingBooking(null)}
          onSaved={(updated) => {
            setBookings((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
            if (selectedBooking?.id === updated.id) setSelectedBooking(updated);
            setEditingBooking(null);
          }}
        />
      )}

      {/* ── Delete Dialog ── */}
      {deletingBooking && (
        <DeleteConfirmDialog
          booking={deletingBooking}
          onClose={() => setDeletingBooking(null)}
          onDeleted={(id) => {
            setBookings((prev) => prev.filter((b) => b.id !== id));
            if (selectedBooking?.id === id) setSelectedBooking(null);
            setDeletingBooking(null);
          }}
        />
      )}

      <div className="max-w-7xl space-y-5">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl text-white">Booking Requests</h1>
            <p className="text-xs text-white/30 mt-1">
              Manage all enquiries submitted via the contact form
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchBookings}
              className="p-2 rounded-lg border border-white/10 text-white/40 hover:text-white hover:bg-white/5 transition-colors"
              title="Refresh"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            {canManage && (
              <button
                onClick={() => setShowQuickBook((v) => !v)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gold text-black rounded-lg text-sm font-medium hover:bg-gold/90 transition-colors"
              >
                <Plus className="w-4 h-4" />
                {showQuickBook ? "Close" : "New Booking"}
              </button>
            )}
          </div>
        </div>

        {/* Permission notice */}
        {!canManage && !canEdit && !canDelete && (
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-white/10 bg-white/3">
            <Lock className="w-4 h-4 text-white/30 shrink-0" />
            <p className="text-xs text-white/40">
              You have <span className="text-white/60">view-only</span> access. Contact the Owner to enable manage, edit, or delete permissions.
            </p>
          </div>
        )}

        {/* Quick Book Panel */}
        {showQuickBook && (
          <QuickBookPanel
            onCreated={(b) => {
              setBookings((prev) => [b, ...prev]);
              setShowQuickBook(false);
            }}
          />
        )}

        {/* Filters Row */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, email, phone..."
              className="w-full pl-9 pr-4 py-2.5 text-sm bg-white/5 border border-white/10 rounded-lg text-white/80 placeholder:text-white/25 outline-none focus:border-gold/40 transition-colors"
            />
          </div>

          <select
            value={filterMonth}
            onChange={(e) => setFilterMonth(e.target.value)}
            className="px-3 py-2.5 text-sm bg-white/5 border border-white/10 rounded-lg text-white/80 outline-none focus:border-gold/40 transition-colors"
          >
            <option value="all" className="bg-[#1c1c28]">All Months</option>
            {Array.from({ length: 12 }, (_, i) => {
              const d = new Date();
              d.setMonth(i);
              return (
                <option key={i + 1} value={(i + 1).toString()} className="bg-[#1c1c28]">
                  {d.toLocaleString('default', { month: 'long' })}
                </option>
              );
            })}
          </select>

          <select
            value={filterYear}
            onChange={(e) => setFilterYear(e.target.value)}
            className="px-3 py-2.5 text-sm bg-white/5 border border-white/10 rounded-lg text-white/80 outline-none focus:border-gold/40 transition-colors"
          >
            <option value="all" className="bg-[#1c1c28]">All Years</option>
            {Array.from(new Set(bookings.map(b => new Date(b.event_date).getFullYear().toString()))).sort().map(year => (
              <option key={year} value={year} className="bg-[#1c1c28]">{year}</option>
            ))}
          </select>
          <div className="flex gap-1 p-1 rounded-lg border border-white/10" style={{ background: "oklch(0.15 0.018 240)" }}>
            {(["all", "pending", "approved", "declined"] as FilterStatus[]).map((s) => (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium capitalize transition-all ${
                  filterStatus === s
                    ? "bg-gold/20 text-gold border border-gold/30"
                    : "text-white/40 hover:text-white/70"
                }`}
              >
                {s}
                <span className="ml-1.5 text-[10px] opacity-60">{counts[s]}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Main Layout */}
        <div className="flex gap-5 items-start">
          {/* Table */}
          <div className="flex-1 rounded-xl border border-white/8 overflow-hidden"
            style={{ background: "oklch(0.15 0.018 240)" }}>
            {loading ? (
              <div className="p-8 text-center text-white/30 text-sm animate-pulse">Loading requests...</div>
            ) : filtered.length === 0 ? (
              <div className="p-12 flex flex-col items-center text-center">
                <Inbox className="w-10 h-10 text-white/15 mb-3" />
                <p className="text-sm text-white/30">No requests found.</p>
                <p className="text-xs text-white/20 mt-1">
                  {searchQuery || filterStatus !== "all"
                    ? "Try adjusting your search or filter."
                    : "Enquiries from the contact form will appear here."}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/8">
                      <th className="px-5 py-3.5 text-left text-[10px] font-medium uppercase tracking-wider text-white/30">Client</th>
                      <th className="px-5 py-3.5 text-left text-[10px] font-medium uppercase tracking-wider text-white/30">Event</th>
                      <th className="px-5 py-3.5 text-left text-[10px] font-medium uppercase tracking-wider text-white/30 hidden md:table-cell">Date</th>
                      <th className="px-5 py-3.5 text-left text-[10px] font-medium uppercase tracking-wider text-white/30 hidden lg:table-cell">Guests</th>
                      <th className="px-5 py-3.5 text-left text-[10px] font-medium uppercase tracking-wider text-white/30">Status</th>
                      <th className="px-5 py-3.5 text-right text-[10px] font-medium uppercase tracking-wider text-white/30">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((booking) => (
                      <tr
                        key={booking.id}
                        onClick={() => setSelectedBooking(booking)}
                        className={`border-b border-white/5 hover:bg-white/4 transition-colors cursor-pointer ${
                          selectedBooking?.id === booking.id ? "bg-gold/5 border-l-2 border-l-gold" : ""
                        }`}
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-7 h-7 rounded-full bg-white/8 flex items-center justify-center shrink-0 text-[10px] text-white/60 font-medium uppercase">
                              {booking.first_name?.[0]}
                            </div>
                            <div>
                              <div className="text-sm font-medium text-white/90">{booking.first_name} {booking.last_name}</div>
                              <div className="text-xs text-white/35 truncate max-w-[140px]">{booking.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <span className="text-white/70 capitalize text-sm">{booking.event_type}</span>
                        </td>
                        <td className="px-5 py-4 hidden md:table-cell">
                          <div className="text-sm text-white/70">{format(new Date(booking.event_date), "MMM dd, yyyy")}</div>
                        </td>
                        <td className="px-5 py-4 hidden lg:table-cell">
                          <span className="text-white/50 text-sm">{booking.expected_guests || "N/A"}</span>
                        </td>
                        <td className="px-5 py-4">
                          <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium capitalize border ${statusColors[booking.status]}`}>
                            {booking.status}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                            {/* Approve / Decline */}
                            {canManage && booking.status === "pending" && (
                              <>
                                <button
                                  onClick={() => handleUpdateStatus(booking.id, "approved")}
                                  className="p-1.5 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/25 rounded-md transition-colors"
                                  title="Approve"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleUpdateStatus(booking.id, "declined")}
                                  className="p-1.5 bg-red-500/10 text-red-400 hover:bg-red-500/25 rounded-md transition-colors"
                                  title="Decline"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </>
                            )}

                            {/* WhatsApp */}
                            <a
                              href={whatsappLink(booking, booking.status === "declined" ? "declined" : booking.status === "approved" ? "approved" : "pending")}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1.5 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/25 rounded-md transition-colors"
                              title="WhatsApp"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                            </a>

                            {/* SMS */}
                            <a
                              href={smsLink(booking, booking.status === "declined" ? "declined" : booking.status === "approved" ? "approved" : "pending")}
                              className="p-1.5 bg-blue-500/10 text-blue-400 hover:bg-blue-500/25 rounded-md transition-colors"
                              title="SMS / Call"
                            >
                              <Phone className="w-3.5 h-3.5" />
                            </a>

                            {/* Edit */}
                            {canEdit && (
                              <button
                                onClick={() => setEditingBooking(booking)}
                                className="p-1.5 bg-gold/10 text-gold hover:bg-gold/25 rounded-md transition-colors"
                                title="Edit Booking"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                            )}

                            {/* Delete */}
                            {canDelete && (
                              <button
                                onClick={() => setDeletingBooking(booking)}
                                className="p-1.5 bg-red-500/10 text-red-400/70 hover:text-red-400 hover:bg-red-500/25 rounded-md transition-colors"
                                title="Delete Booking"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}

                            {/* View */}
                            <button
                              onClick={() => setSelectedBooking(booking)}
                              className="p-1.5 bg-white/5 text-white/40 hover:text-white hover:bg-white/10 rounded-md transition-colors"
                              title="View Details"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Detail Panel */}
          {selectedBooking && (
            <div
              className="w-72 shrink-0 rounded-xl border border-white/8 p-5 space-y-4 sticky top-20"
              style={{ background: "oklch(0.15 0.018 240)" }}
            >
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-white/80">Request Detail</h3>
                <button
                  onClick={() => setSelectedBooking(null)}
                  className="p-1 rounded text-white/30 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Avatar */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gold/15 border border-gold/25 flex items-center justify-center text-gold font-bold uppercase">
                  {selectedBooking.first_name?.[0]}
                </div>
                <div>
                  <div className="font-medium text-white text-sm">
                    {selectedBooking.first_name} {selectedBooking.last_name}
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full border capitalize ${statusColors[selectedBooking.status]}`}>
                    {selectedBooking.status}
                  </span>
                </div>
              </div>

              <div className="space-y-3 text-xs">
                <DetailRow label="Email"      value={selectedBooking.email} />
                <DetailRow label="Phone"      value={selectedBooking.phone} />
                <DetailRow label="Event Type" value={selectedBooking.event_type} capitalize />
                <DetailRow label="Date"       value={format(new Date(selectedBooking.event_date), "MMMM d, yyyy")} />

                <DetailRow label="Guests"     value={String(selectedBooking.expected_guests || "N/A")} />
                {selectedBooking.message && (
                  <div className="pt-2 border-t border-white/8">
                    <p className="text-white/30 mb-1 uppercase tracking-wider">Message</p>
                    <p className="text-white/60 leading-relaxed">{selectedBooking.message}</p>
                  </div>
                )}
                <div className="pt-2 border-t border-white/8">
                  <p className="text-white/30 mb-1 uppercase tracking-wider">Submitted</p>
                  <p className="text-white/60">{format(new Date(selectedBooking.created_at), "MMM d, yyyy 'at' h:mm a")}</p>
                </div>
              </div>

              {/* Approve / Decline */}
              {canManage && selectedBooking.status === "pending" && (
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => handleUpdateStatus(selectedBooking.id, "approved")}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 border border-emerald-500/25 rounded-lg text-xs font-medium transition-colors"
                  >
                    <Check className="w-3.5 h-3.5" /> Approve
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(selectedBooking.id, "declined")}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-red-500/15 text-red-400 hover:bg-red-500/25 border border-red-500/25 rounded-lg text-xs font-medium transition-colors"
                  >
                    <X className="w-3.5 h-3.5" /> Decline
                  </button>
                </div>
              )}

              {/* Lock notice for read-only */}
              {!canManage && selectedBooking.status === "pending" && (
                <div className="flex items-center gap-2 p-3 rounded-lg border border-white/10 bg-white/3">
                  <Lock className="w-3.5 h-3.5 text-white/30 shrink-0" />
                  <p className="text-[11px] text-white/40">
                    Ask the Owner to grant you <span className="text-gold/70">Manage Requests</span> permission.
                  </p>
                </div>
              )}

              {/* Edit + Delete panel actions */}
              <div className="flex gap-2">
                {canEdit && (
                  <button
                    onClick={() => setEditingBooking(selectedBooking)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-colors"
                    style={{
                      background: "rgba(212,175,55,0.12)",
                      border: "1px solid rgba(212,175,55,0.25)",
                      color: "#D4AF37",
                    }}
                  >
                    <Pencil className="w-3.5 h-3.5" /> Edit
                  </button>
                )}
                {canDelete && (
                  <button
                    onClick={() => setDeletingBooking(selectedBooking)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 rounded-lg text-xs font-medium transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Delete
                  </button>
                )}
              </div>

              {/* WhatsApp + SMS */}
              <div className="flex gap-2">
                <a
                  href={whatsappLink(selectedBooking, selectedBooking.status === "declined" ? "declined" : selectedBooking.status === "approved" ? "approved" : "pending")}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-emerald-900/30 text-emerald-400 hover:bg-emerald-900/50 border border-emerald-700/30 rounded-lg text-xs font-medium transition-colors"
                >
                  <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
                </a>
                <a
                  href={smsLink(selectedBooking, selectedBooking.status === "declined" ? "declined" : selectedBooking.status === "approved" ? "approved" : "pending")}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-blue-900/30 text-blue-400 hover:bg-blue-900/50 border border-blue-700/30 rounded-lg text-xs font-medium transition-colors"
                >
                  <Phone className="w-3.5 h-3.5" /> Call / SMS
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function DetailRow({ label, value, capitalize = false }: { label: string; value: string; capitalize?: boolean }) {
  return (
    <div>
      <p className="text-white/30 uppercase tracking-wider">{label}</p>
      <p className={`text-white/70 mt-0.5 ${capitalize ? "capitalize" : ""}`}>{value}</p>
    </div>
  );
}

function QuickBookPanel({ onCreated }: { onCreated: (b: Booking) => void }) {
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
      <h2 className="font-display text-lg mb-5 text-gold">Quick Booking (Auto-Approved)</h2>
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
            {/* <option value="Gulf Heights" className="bg-[#1c1c28]">Gulf Heights</option>
            <option value="Wexco Lagon Vista" className="bg-[#1c1c28]">Wexco Lagon Vista</option> */}
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
        <AdminField name="event_date" label="Event Date" type="date" required />
        <AdminField name="guests"     label="Guests" type="number" />

        <div className="md:col-span-1">
          <label className="text-[10px] uppercase tracking-widest text-white/35 font-medium">Notes</label>
          <textarea
            name="message"
            rows={1}
            className="mt-2 w-full border border-white/10 bg-white/5 px-3 py-2.5 text-sm rounded-lg outline-none focus:border-gold resize-none text-white/80"
          />
        </div>
      </div>
      <button
        type="submit"
        disabled={submitting}
        className="mt-5 px-6 py-2.5 bg-gold text-black rounded-lg text-sm font-medium hover:bg-gold/90 disabled:opacity-50 transition-colors"
      >
        {submitting ? "Saving…" : "Create & Approve"}
      </button>
    </form>
  );
}

function AdminField({
  name, label, type = "text", required, placeholder,
}: {
  name: string; label: string; type?: string; required?: boolean; placeholder?: string;
}) {
  return (
    <div>
      <label className="text-[10px] uppercase tracking-widest text-white/35 font-medium">{label}</label>
      <input
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        className="mt-2 w-full border border-white/10 bg-white/5 px-3 py-2.5 text-sm rounded-lg outline-none focus:border-gold transition-colors text-white/80 placeholder:text-white/25"
      />
    </div>
  );
}
