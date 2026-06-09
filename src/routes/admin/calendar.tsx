import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
import { supabase, CalendarDate, Booking, TIME_SLOTS } from "@/lib/supabase";
import { useAdminTheme } from "@/routes/admin";
import { useAuth } from "@/hooks/useAuth";
import { whatsappLink, smsLink } from "@/lib/notify";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  addMonths,
  subMonths,
  isSameMonth,
  isSameDay,
  isToday,
  parseISO,
} from "date-fns";
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Clock,
  XCircle,
  Circle,
  CalendarDays,
  RefreshCw,
  X,
  User,
  Mail,
  Phone,
  MessageCircle,
  Pencil,
  Trash2,
  AlertTriangle,
  Save,
  Filter,
  CalendarCheck,
  Users,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { sendBookingEmail } from "@/lib/email";
import { type TimeSlot } from "@/lib/supabase";
import { QuickBookPanel } from "@/components/admin/QuickBookPanel";

export const Route = createFileRoute("/admin/calendar")({
  component: AdminCalendar,
});

// ─── Status configuration ────────────────────────────────────────────────────
type StatusKey = "approved" | "pending" | "declined";
type FilterKey = "all" | "available" | StatusKey;

const STATUS_META: Record<StatusKey, {
  label: string; color: string; bg: string; border: string; dotClass: string; badgeClass: string;
}> = {
  approved: {
    label: "Booked",
    color: "#f87171",
    bg: "rgba(239,68,68,0.15)",
    border: "rgba(239,68,68,0.40)",
    dotClass: "bg-red-400",
    badgeClass: "bg-red-500/15 text-red-400 border-red-500/25",
  },
  pending: {
    label: "Pending",
    color: "#fbbf24",
    bg: "rgba(251,191,36,0.15)",
    border: "rgba(251,191,36,0.40)",
    dotClass: "bg-yellow-400",
    badgeClass: "bg-yellow-500/15 text-yellow-400 border-yellow-500/25",
  },
  declined: {
    label: "Blocked",
    color: "#94a3b8",
    bg: "rgba(148,163,184,0.12)",
    border: "rgba(148,163,184,0.25)",
    dotClass: "bg-slate-400",
    badgeClass: "bg-slate-500/15 text-slate-400 border-slate-500/25",
  },
};

const WEEK_DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// ─── Edit Booking Modal ───────────────────────────────────────────────────────
function EditBookingModal({
  booking, onClose, onSaved, tok,
}: { booking: Booking; onClose: () => void; onSaved: (updated: Booking) => void; tok: Record<string, string> }) {
  const [form, setForm] = useState({
    full_name: [booking.first_name, booking.last_name].filter(Boolean).join(" "),
    email: booking.email,
    phone: booking.phone,
    event_type: booking.event_type,
    event_date: booking.event_date,
    event_time_slot: booking.event_time_slot as TimeSlot,
    expected_guests: booking.expected_guests?.toString() ?? "",
    message: booking.message ?? "",
    status: booking.status,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    const [first_name, ...lastNames] = form.full_name.trim().split(" ");
    const payload = {
      first_name: first_name || "",
      last_name: lastNames.join(" "),
      email: form.email.trim(),
      phone: form.phone.trim(),
      event_type: form.event_type.trim(),
      event_date: form.event_date,
      event_time_slot: form.event_time_slot,
      expected_guests: form.expected_guests ? parseInt(form.expected_guests) : null,
      message: form.message.trim() || null,
      status: form.status,
    };
    const { data, error: err } = await supabase
      .from("bookings").update(payload).eq("id", booking.id).select().single();
    if (err || !data) { setError(err?.message ?? "Failed to save."); setSaving(false); return; }

    // Sync calendar date with new status
    await (supabase as any)
      .from("calendar_dates")
      .upsert({ date: form.event_date, status: form.status, booking_id: booking.id }, { onConflict: "date" });

    onSaved(data as Booking);
  };

  const inputCls = "w-full px-3 py-2.5 rounded-lg text-sm outline-none transition-colors";
  const inputStyle = { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.80)" };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.70)", backdropFilter: "blur(6px)" }}>
      <div className="w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl"
        style={{ background: "oklch(0.13 0.02 240)", border: "1px solid rgba(255,255,255,0.10)" }}>
        <div className="flex items-center justify-between px-6 py-4"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
          <div>
            <h2 className="font-display text-lg text-white">Edit Booking</h2>
            <p className="text-xs text-white/35 mt-0.5">#{booking.id.slice(-6).toUpperCase()}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg text-white/30 hover:text-white hover:bg-white/8 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="px-6 py-5 max-h-[70vh] overflow-y-auto space-y-4">
            {error && (
              <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-red-400"
                style={{ background: "rgba(239,68,68,0.10)", border: "1px solid rgba(239,68,68,0.20)" }}>
                <AlertTriangle className="w-4 h-4 shrink-0" />{error}
              </div>
            )}
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-white/35 font-medium mb-1.5">Full Name</label>
              <input className={inputCls} style={inputStyle} value={form.full_name}
                onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))} required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-white/35 font-medium mb-1.5">Email</label>
                <input type="email" className={inputCls} style={inputStyle} value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-white/35 font-medium mb-1.5">Phone</label>
                <input type="tel" className={inputCls} style={inputStyle} value={form.phone}
                  onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} required />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-white/35 font-medium mb-1.5">Event Type</label>
                <input className={inputCls} style={inputStyle} value={form.event_type}
                  onChange={e => setForm(f => ({ ...f, event_type: e.target.value }))} required />
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-white/35 font-medium mb-1.5">Event Date</label>
                <input type="date" className={inputCls} style={inputStyle} value={form.event_date}
                  onChange={e => setForm(f => ({ ...f, event_date: e.target.value }))} required />
              </div>
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-white/35 font-medium mb-1.5">Status</label>
              <div className="grid grid-cols-3 gap-2">
                {(["pending", "approved", "declined"] as const).map(s => {
                  const c = { pending: { active: "rgba(251,191,36,0.20)", border: "rgba(251,191,36,0.50)", text: "#fbbf24" }, approved: { active: "rgba(52,211,153,0.20)", border: "rgba(52,211,153,0.50)", text: "#34d399" }, declined: { active: "rgba(248,113,113,0.20)", border: "rgba(248,113,113,0.50)", text: "#f87171" } }[s];
                  const isActive = form.status === s;
                  return (
                    <button key={s} type="button" onClick={() => setForm(f => ({ ...f, status: s }))}
                      className="py-2.5 rounded-lg text-sm font-medium capitalize transition-all"
                      style={{ background: isActive ? c.active : "rgba(255,255,255,0.03)", border: `1px solid ${isActive ? c.border : "rgba(255,255,255,0.10)"}`, color: isActive ? c.text : "rgba(255,255,255,0.40)" }}>
                      {s}
                    </button>
                  );
                })}
              </div>
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-white/35 font-medium mb-1.5">Message / Notes</label>
              <textarea value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                rows={3} className="w-full px-3 py-2.5 rounded-lg text-sm outline-none resize-none transition-colors"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.80)" }} />
            </div>
          </div>
          <div className="flex items-center justify-end gap-3 px-6 py-4"
            style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
            <button type="button" onClick={onClose}
              className="px-4 py-2 rounded-lg text-sm text-white/50 hover:text-white hover:bg-white/8 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={saving}
              className="flex items-center gap-2 px-5 py-2 bg-gold text-black rounded-lg text-sm font-medium hover:bg-gold/90 disabled:opacity-50 transition-colors">
              <Save className="w-4 h-4" />{saving ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Delete Confirm Dialog ────────────────────────────────────────────────────
function DeleteConfirmDialog({
  booking, onClose, onDeleted,
}: { booking: Booking; onClose: () => void; onDeleted: (id: string) => void }) {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  const handleDelete = async () => {
    setDeleting(true);
    setError("");
    const { error: err } = await supabase.from("bookings").delete().eq("id", booking.id);
    if (err) { setError(err.message ?? "Failed to delete."); setDeleting(false); return; }
    await (supabase as any).from("calendar_dates").delete().eq("booking_id", booking.id);
    onDeleted(booking.id);
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.70)", backdropFilter: "blur(6px)" }}>
      <div className="w-full max-w-md rounded-2xl overflow-hidden shadow-2xl"
        style={{ background: "oklch(0.13 0.02 240)", border: "1px solid rgba(239,68,68,0.25)" }}>
        <div className="p-6">
          <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.30)" }}>
            <Trash2 className="w-6 h-6 text-red-400" />
          </div>
          <h2 className="text-lg font-display text-white text-center mb-1">Delete Booking?</h2>
          <p className="text-sm text-white/45 text-center mb-4">
            This will <span className="text-red-400 font-medium">permanently remove</span> this booking and its calendar entry.
          </p>
          <div className="rounded-xl p-3 mb-5" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-red-500/15 border border-red-500/25 flex items-center justify-center shrink-0">
                <span className="text-red-400 text-sm font-bold uppercase">{booking.first_name[0]}</span>
              </div>
              <div>
                <div className="text-sm font-medium text-white/85">{booking.first_name} {booking.last_name}</div>
                <div className="text-xs text-white/35">{booking.event_type} · {format(new Date(booking.event_date), "MMM d, yyyy")}</div>
              </div>
            </div>
          </div>
          {error && (
            <div className="mb-4 flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-red-400"
              style={{ background: "rgba(239,68,68,0.10)", border: "1px solid rgba(239,68,68,0.20)" }}>
              <AlertTriangle className="w-4 h-4 shrink-0" />{error}
            </div>
          )}
          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 py-2.5 rounded-xl text-sm font-medium text-white/60 hover:text-white transition-colors"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.10)" }}>
              Cancel
            </button>
            <button onClick={handleDelete} disabled={deleting}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-colors disabled:opacity-50"
              style={{ background: "rgba(239,68,68,0.20)", border: "1px solid rgba(239,68,68,0.40)", color: "#f87171" }}>
              <Trash2 className="w-4 h-4" />{deleting ? "Deleting…" : "Yes, Delete"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Single Booking Card (in panel list) ─────────────────────────────────────
function BookingCard({
  booking,
  tok,
  saving,
  onEdit,
  onDelete,
  canEdit,
  canDelete,
}: {
  booking: Booking;
  tok: Record<string, string>;
  saving: boolean;
  onEdit: (b: Booking) => void;
  onDelete: (b: Booking) => void;
  canEdit: boolean;
  canDelete: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const meta = STATUS_META[booking.status as StatusKey] ?? null;

  return (
    <div className="rounded-xl overflow-hidden"
      style={{ background: meta ? `${meta.bg}` : "rgba(255,255,255,0.03)", border: `1px solid ${meta ? meta.border : "rgba(255,255,255,0.08)"}` }}>
      {/* Card header — always visible */}
      <button
        onClick={() => setExpanded(v => !v)}
        className="w-full flex items-center gap-3 px-4 py-3 text-left"
      >
        <div className="w-8 h-8 rounded-full bg-gold/15 border border-gold/25 flex items-center justify-center text-gold font-bold uppercase shrink-0 text-xs">
          {booking.first_name?.[0]}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium truncate" style={{ color: tok.text }}>
            {booking.first_name} {booking.last_name}
          </div>
          <div className="text-[10px] capitalize" style={{ color: tok.textMuted }}>{booking.event_type}</div>
        </div>
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border capitalize shrink-0 ${meta?.badgeClass ?? "bg-green-500/15 text-green-400 border-green-500/25"}`}>
          {booking.status === "approved" && <XCircle className="w-2.5 h-2.5" />}
          {booking.status === "pending"  && <Clock className="w-2.5 h-2.5" />}
          {booking.status === "declined" && <Circle className="w-2.5 h-2.5" />}
          {meta?.label ?? booking.status}
        </span>
        {expanded ? <ChevronUp className="w-3.5 h-3.5 shrink-0" style={{ color: tok.textMuted }} /> : <ChevronDown className="w-3.5 h-3.5 shrink-0" style={{ color: tok.textMuted }} />}
      </button>

      {/* Expanded details */}
      {expanded && (
        <div className="px-4 pb-4 space-y-3" style={{ borderTop: `1px solid ${tok.divider}` }}>
          <div className="space-y-2 text-xs pt-3">
            <div className="flex items-center gap-2">
              <Mail className="w-3.5 h-3.5 shrink-0" style={{ color: tok.textMuted }} />
              <span style={{ color: tok.text }}>{booking.email}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-3.5 h-3.5 shrink-0" style={{ color: tok.textMuted }} />
              <span style={{ color: tok.text }}>{booking.phone}</span>
            </div>
            <div className="flex items-center gap-2">
              <CalendarCheck className="w-3.5 h-3.5 shrink-0" style={{ color: tok.textMuted }} />
              <span className="capitalize" style={{ color: tok.text }}>{booking.event_type}</span>
            </div>
            <div className="flex items-center gap-2">
              <User className="w-3.5 h-3.5 shrink-0" style={{ color: tok.textMuted }} />
              <span style={{ color: tok.text }}>{booking.expected_guests || "N/A"} guests</span>
            </div>
            {booking.event_time_slot && (
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 shrink-0" style={{ color: tok.textMuted }} />
                <span className="capitalize" style={{ color: tok.text }}>
                  {TIME_SLOTS.find(s => s.value === booking.event_time_slot)?.label || booking.event_time_slot}
                </span>
              </div>
            )}
            {booking.message && (
              <div className="pt-2" style={{ borderTop: `1px solid ${tok.divider}` }}>
                <p className="text-[10px] uppercase tracking-widest mb-1" style={{ color: tok.textMuted }}>Notes</p>
                <p style={{ color: tok.text }} className="leading-relaxed">{booking.message}</p>
              </div>
            )}
          </div>

          {/* Contact + Actions */}
          <div className="flex gap-2">
            <button onClick={(e) => { e.stopPropagation(); window.open(whatsappLink(booking, booking.status === "approved" ? "approved" : booking.status === "declined" ? "declined" : "pending"), '_blank'); }}
              className="flex-1 flex items-center justify-center gap-1 py-2 rounded-lg text-[11px] font-medium transition-colors"
              style={{ background: "rgba(52,211,153,0.10)", border: "1px solid rgba(52,211,153,0.20)", color: "#34d399" }}>
              <MessageCircle className="w-3 h-3" /> WhatsApp
            </button>
            <button onClick={(e) => { e.stopPropagation(); window.open(smsLink(booking, booking.status === "approved" ? "approved" : booking.status === "declined" ? "declined" : "pending"), '_self'); }}
              className="flex-1 flex items-center justify-center gap-1 py-2 rounded-lg text-[11px] font-medium transition-colors"
              style={{ background: "rgba(96,165,250,0.10)", border: "1px solid rgba(96,165,250,0.20)", color: "#60a5fa" }}>
              <Phone className="w-3 h-3" /> Call
            </button>
          </div>
          <div className="flex gap-2">
            {canEdit && (
              <button onClick={(e) => { e.stopPropagation(); onEdit(booking); }} disabled={saving}
                className="flex-1 flex items-center justify-center gap-1 py-2 rounded-lg text-[11px] font-medium transition-colors disabled:opacity-50"
                style={{ background: "rgba(212,175,55,0.12)", border: "1px solid rgba(212,175,55,0.25)", color: "#D4AF37" }}>
                <Pencil className="w-3 h-3" /> Edit
              </button>
            )}
            {canDelete && (
              <button onClick={(e) => { e.stopPropagation(); onDelete(booking); }} disabled={saving}
                className="flex-1 flex items-center justify-center gap-1 py-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 rounded-lg text-[11px] font-medium transition-colors disabled:opacity-50">
                <Trash2 className="w-3 h-3" /> Delete
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Calendar Component ──────────────────────────────────────────────────
function AdminCalendar() {
  const { theme } = useAdminTheme();
  const { can } = useAuth();
  const isDark = theme === "dark";
  const canEdit   = can("edit_requests");
  const canDelete = can("delete_requests");

  const [dates, setDates]       = useState<CalendarDate[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [viewMonth, setViewMonth] = useState<Date>(new Date());
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [filterStatus, setFilterStatus] = useState<FilterKey>("all");
  const [editingBooking, setEditingBooking]   = useState<Booking | null>(null);
  const [deletingBooking, setDeletingBooking] = useState<Booking | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const [showQuickBook, setShowQuickBook] = useState(false);

  // Theme tokens
  const tok: Record<string, string> = {
    card:          isDark ? "oklch(0.15 0.018 240)" : "#ffffff",
    cardBorder:    isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)",
    text:          isDark ? "rgba(255,255,255,0.90)" : "rgba(0,0,0,0.85)",
    textMuted:     isDark ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.40)",
    cellBg:        isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)",
    cellHover:     isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.05)",
    selectedBg:    isDark ? "rgba(212,175,55,0.20)" : "rgba(212,175,55,0.15)",
    selectedBorder:"rgba(212,175,55,0.60)",
    outsideText:   isDark ? "rgba(255,255,255,0.20)" : "rgba(0,0,0,0.20)",
    divider:       isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)",
  };

  // ── Data fetching ──────────────────────────────────────────────────────────
  const fetchAll = useCallback(async () => {
    setLoading(true);
    const [{ data: calDates }, { data: bks }] = await Promise.all([
      (supabase as any).from("calendar_dates").select("*"),
      supabase.from("bookings").select("*").order("created_at", { ascending: false }),
    ]);
    if (calDates) setDates(calDates as CalendarDate[]);
    if (bks) setBookings(bks as Booking[]);
    setLoading(false);
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // ── Real-time subscription ─────────────────────────────────────────────────
  useEffect(() => {
    const channel = supabase
      .channel("calendar-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "bookings" }, () => fetchAll())
      .on("postgres_changes", { event: "*", schema: "public", table: "calendar_dates" }, () => fetchAll())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [fetchAll]);

  // ALL bookings for a date (multiple time slots / multiple requests)
  const getBookingsForDate = (dateStr: string): Booking[] =>
    bookings.filter(b => b.event_date === dateStr);

  const getDateStatus = (dateStr: string): StatusKey | null => {
    const dayBookings = getBookingsForDate(dateStr);
    // Priority 1: Derived from actual bookings (approved beats pending)
    if (dayBookings.length > 0) {
      if (dayBookings.some(b => b.status === "approved")) return "approved";
      if (dayBookings.some(b => b.status === "pending")) return "pending";
      // If all are declined, we consider the date free UNLESS there's a manual calendar_dates override below.
    }
    
    // Priority 2: Manual override from calendar_dates table
    const manualEntry = dates.find(r => r.date === dateStr);
    if (manualEntry) return manualEntry.status as StatusKey;

    return null;
  };

  const selectedStr     = format(selectedDate, "yyyy-MM-dd");
  const selectedStatus  = getDateStatus(selectedStr);
  const selectedBookings = getBookingsForDate(selectedStr);

  // ── Calendar status actions ────────────────────────────────────────────────
  const handleSetStatus = async (status: StatusKey) => {
    setSaving(true);
    await (supabase as any)
      .from("calendar_dates")
      .upsert({ date: selectedStr, status, booking_id: selectedBookings[0]?.id ?? null });
    setDates(prev => {
      const filtered = prev.filter(d => d.date !== selectedStr);
      return [...filtered, { date: selectedStr, status, note: null, booking_id: selectedBookings[0]?.id ?? null, updated_by: null, updated_at: new Date().toISOString() }];
    });
    setSaving(false);
  };

  const handleClearStatus = async () => {
    setSaving(true);
    await (supabase as any).from("calendar_dates").delete().eq("date", selectedStr);
    setDates(prev => prev.filter(d => d.date !== selectedStr));
    setSaving(false);
  };

  // ── Calendar grid ──────────────────────────────────────────────────────────
  const monthStart = startOfMonth(viewMonth);
  const monthEnd   = endOfMonth(viewMonth);
  const gridStart  = startOfWeek(monthStart);
  const gridEnd    = endOfWeek(monthEnd);

  const calendarDays: Date[] = [];
  let cur = gridStart;
  while (cur <= gridEnd) { calendarDays.push(cur); cur = addDays(cur, 1); }

  const isDateVisible = (d: Date): boolean => {
    if (filterStatus === "all") return true;
    const st = getDateStatus(format(d, "yyyy-MM-dd"));
    if (filterStatus === "available") return !st;
    return st === filterStatus;
  };

  // ── Month stats ────────────────────────────────────────────────────────────
  // Calculate stats by iterating through all days in the currently viewed month
  const monthStats = { booked: 0, pending: 0, blocked: 0 };
  let dCursor = new Date(monthStart);
  while (dCursor <= monthEnd) {
    const st = getDateStatus(format(dCursor, "yyyy-MM-dd"));
    if (st === "approved") monthStats.booked++;
    if (st === "pending") monthStats.pending++;
    if (st === "declined") monthStats.blocked++;
    dCursor = addDays(dCursor, 1);
  }

  return (
    <>
      {editingBooking && (
        <EditBookingModal
          tok={tok}
          booking={editingBooking}
          onClose={() => setEditingBooking(null)}
          onSaved={updated => {
            setBookings(prev => prev.map(b => b.id === updated.id ? updated : b));
            setDates(prev => prev.map(d => d.date === updated.event_date ? { ...d, status: updated.status } : d));
            setEditingBooking(null);
          }}
        />
      )}
      {deletingBooking && (
        <DeleteConfirmDialog
          booking={deletingBooking}
          onClose={() => setDeletingBooking(null)}
          onDeleted={id => {
            setBookings(prev => prev.filter(b => b.id !== id));
            setDates(prev => prev.filter(d => d.booking_id !== id));
            setDeletingBooking(null);
          }}
        />
      )}

      <div className="max-w-7xl space-y-5">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl" style={{ color: tok.text }}>Calendar Management</h1>
            <p className="text-xs mt-1" style={{ color: tok.textMuted }}>
              Updates automatically when admin approves/declines requests · Click any date to see details
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full"
              style={{ background: "rgba(34,197,94,0.10)", border: "1px solid rgba(34,197,94,0.20)" }}>
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              <span className="text-[10px] text-green-400 font-medium uppercase tracking-wider">Live</span>
            </div>
            <button onClick={fetchAll}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition-colors"
              style={{ background: tok.cellBg, border: `1px solid ${tok.cardBorder}`, color: tok.textMuted }}>
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />Refresh
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Booked",  value: monthStats.booked,  color: "#f87171", bg: "rgba(239,68,68,0.10)",   border: "rgba(239,68,68,0.20)" },
            { label: "Pending", value: monthStats.pending, color: "#fbbf24", bg: "rgba(251,191,36,0.10)",  border: "rgba(251,191,36,0.20)" },
            { label: "Blocked", value: monthStats.blocked, color: "#94a3b8", bg: "rgba(148,163,184,0.10)", border: "rgba(148,163,184,0.20)" },
          ].map(s => (
            <div key={s.label} className="rounded-xl p-4"
              style={{ background: s.bg, border: `1px solid ${s.border}` }}>
              <div className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</div>
              <div className="text-[10px] uppercase tracking-widest mt-1" style={{ color: s.color, opacity: 0.7 }}>
                {s.label} in {format(viewMonth, "MMM")}
              </div>
            </div>
          ))}
        </div>

        {/* Filter */}
        <div className="flex flex-wrap items-center gap-2">
          <Filter className="w-3.5 h-3.5 shrink-0" style={{ color: tok.textMuted }} />
          <span className="text-[11px] uppercase tracking-widest mr-1" style={{ color: tok.textMuted }}>Filter:</span>
          {([
            { key: "all",      label: "All",       dot: null },
            { key: "available", label: "Available", dot: "bg-green-400" },
            { key: "pending",  label: "Pending",    dot: "bg-yellow-400" },
            { key: "approved", label: "Booked",     dot: "bg-red-400" },
            { key: "declined", label: "Blocked",    dot: "bg-slate-400" },
          ] as { key: FilterKey; label: string; dot: string | null }[]).map(f => (
            <button key={f.key} onClick={() => setFilterStatus(f.key)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all"
              style={{
                background: filterStatus === f.key ? "rgba(212,175,55,0.20)" : tok.cellBg,
                border: `1px solid ${filterStatus === f.key ? "rgba(212,175,55,0.50)" : tok.cardBorder}`,
                color: filterStatus === f.key ? "#D4AF37" : tok.textMuted,
              }}>
              {f.dot && <span className={`w-2 h-2 rounded-full ${f.dot}`} />}
              {f.label}
            </button>
          ))}
        </div>

        {/* Main grid */}
        <div className="grid lg:grid-cols-3 gap-5 items-start">
          {/* ── Calendar ── */}
          <div className="lg:col-span-2 rounded-2xl overflow-hidden"
            style={{ background: tok.card, border: `1px solid ${tok.cardBorder}` }}>
            <div className="flex items-center justify-between px-6 py-4"
              style={{ borderBottom: `1px solid ${tok.divider}` }}>
              <button onClick={() => setViewMonth(m => subMonths(m, 1))} className="p-2 rounded-lg transition-colors"
                style={{ color: tok.textMuted, background: tok.cellBg }}>
                <ChevronLeft className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-4">
                <div className="relative group flex items-center">
                  <select
                    value={viewMonth.getMonth()}
                    onChange={(e) => {
                      const d = new Date(viewMonth);
                      d.setMonth(parseInt(e.target.value));
                      setViewMonth(d);
                    }}
                    className="font-display text-lg font-semibold bg-transparent outline-none cursor-pointer appearance-none pr-5 relative z-10"
                    style={{ color: tok.text }}
                  >
                    {Array.from({ length: 12 }, (_, i) => (
                      <option key={i} value={i} className="text-black">
                        {format(new Date(2000, i, 1), "MMMM")}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none opacity-40 group-hover:opacity-100 transition-opacity" style={{ color: tok.text }} />
                </div>

                <div className="relative group flex items-center">
                  <select
                    value={viewMonth.getFullYear()}
                    onChange={(e) => {
                      const d = new Date(viewMonth);
                      d.setFullYear(parseInt(e.target.value));
                      setViewMonth(d);
                    }}
                    className="font-display text-lg font-semibold bg-transparent outline-none cursor-pointer appearance-none pr-5 relative z-10"
                    style={{ color: tok.text }}
                  >
                    {Array.from({ length: 10 }, (_, i) => {
                      const y = new Date().getFullYear() - 4 + i; // from 4 years ago to 5 years ahead
                      return (
                        <option key={y} value={y} className="text-black">
                          {y}
                        </option>
                      );
                    })}
                  </select>
                  <ChevronDown className="w-4 h-4 absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none opacity-40 group-hover:opacity-100 transition-opacity" style={{ color: tok.text }} />
                </div>
              </div>
              <button onClick={() => setViewMonth(m => addMonths(m, 1))} className="p-2 rounded-lg transition-colors"
                style={{ color: tok.textMuted, background: tok.cellBg }}>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {loading ? (
              <div className="h-72 flex items-center justify-center" style={{ color: tok.textMuted }}>
                <div className="flex flex-col items-center gap-3">
                  <div className="w-6 h-6 border-2 border-gold border-t-transparent rounded-full animate-spin" />
                  <span className="text-sm">Loading calendar…</span>
                </div>
              </div>
            ) : (
              <div className="p-4">
                <div className="grid grid-cols-7 mb-2">
                  {WEEK_DAYS.map(d => (
                    <div key={d} className="text-center text-[11px] font-semibold uppercase tracking-wider py-2"
                      style={{ color: tok.textMuted }}>{d}</div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {calendarDays.map((day, i) => {
                    const inMonth    = isSameMonth(day, viewMonth);
                    const isSelected = isSameDay(day, selectedDate);
                    const todayDay   = isToday(day);
                    const dayStr     = format(day, "yyyy-MM-dd");
                    const status     = getDateStatus(dayStr);
                    const meta       = status ? STATUS_META[status] : null;
                    const bookingCount = getBookingsForDate(dayStr).length;
                    const visible    = isDateVisible(day);
                    const dimmed     = !visible && inMonth;

                    return (
                      <button key={i}
                        onClick={() => { setSelectedDate(day); if (inMonth) setPanelOpen(true); }}
                        className="relative flex flex-col items-center justify-center rounded-xl transition-all duration-150 aspect-square focus:outline-none"
                        style={{
                          background: isSelected ? tok.selectedBg : meta && !dimmed ? meta.bg : tok.cellBg,
                          border: isSelected ? `2px solid ${tok.selectedBorder}` : meta && !dimmed ? `1px solid ${meta.border}` : "1px solid transparent",
                          color: isSelected ? "#D4AF37" : meta && !dimmed ? meta.color : inMonth ? tok.text : tok.outsideText,
                          opacity: inMonth ? (dimmed ? 0.25 : 1) : 0.35,
                          cursor: "pointer",
                        }}
                        onMouseEnter={e => { if (!isSelected) (e.currentTarget as HTMLElement).style.background = tok.cellHover; }}
                        onMouseLeave={e => { if (!isSelected) (e.currentTarget as HTMLElement).style.background = meta && !dimmed ? meta.bg : tok.cellBg; }}>
                        {todayDay && <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-gold" />}
                        {/* Multiple bookings badge */}
                        {bookingCount > 1 && (
                          <span className="absolute top-0.5 left-1 text-[8px] font-bold"
                            style={{ color: meta ? meta.color : tok.textMuted }}>
                            {bookingCount}×
                          </span>
                        )}
                        <span className="text-sm leading-none font-medium">{format(day, "d")}</span>
                        {meta && !isSelected && !dimmed && (
                          <span className={`mt-0.5 w-1 h-1 rounded-full ${meta.dotClass}`} />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Legend */}
                <div className="flex flex-wrap items-center gap-4 mt-5 pt-4"
                  style={{ borderTop: `1px solid ${tok.divider}` }}>
                  {Object.entries(STATUS_META).map(([key, m]) => (
                    <div key={key} className="flex items-center gap-1.5">
                      <span className={`w-2.5 h-2.5 rounded-full ${m.dotClass}`} />
                      <span className="text-[11px]" style={{ color: tok.textMuted }}>{m.label}</span>
                    </div>
                  ))}
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-green-400" />
                    <span className="text-[11px]" style={{ color: tok.textMuted }}>Available</span>
                  </div>
                  <div className="flex items-center gap-1.5 ml-auto">
                    <span className="text-[10px] font-bold" style={{ color: tok.textMuted }}>N×</span>
                    <span className="text-[11px]" style={{ color: tok.textMuted }}>= multiple bookings</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ── Side Panel ── */}
          <div className="rounded-2xl overflow-hidden"
            style={{ background: tok.card, border: `1px solid ${tok.cardBorder}` }}>

            {/* Date header */}
            <div className="px-5 py-4" style={{ borderBottom: `1px solid ${tok.divider}` }}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <CalendarDays className="w-4 h-4 text-gold" />
                  <span className="text-[10px] uppercase tracking-widest" style={{ color: tok.textMuted }}>
                    Selected Date
                  </span>
                </div>
                {panelOpen && (
                  <button onClick={() => { setPanelOpen(false); setShowQuickBook(false); }} className="p-1 rounded text-white/30 hover:text-white transition-colors">
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              <div className="font-display text-xl font-semibold" style={{ color: tok.text }}>
                {format(selectedDate, "MMMM d, yyyy")}
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs" style={{ color: tok.textMuted }}>{format(selectedDate, "EEEE")}</span>
                {isToday(selectedDate) && (
                  <span className="text-gold text-[10px] font-medium uppercase tracking-wider">· Today</span>
                )}
              </div>

              {/* Overall date status badge */}
              <div className="mt-3">
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                  selectedStatus ? STATUS_META[selectedStatus].badgeClass : "bg-green-500/15 text-green-400 border-green-500/25"
                }`}>
                  {selectedStatus === "approved" && <XCircle className="w-3 h-3" />}
                  {selectedStatus === "pending"  && <Clock className="w-3 h-3" />}
                  {selectedStatus === "declined" && <Circle className="w-3 h-3" />}
                  {!selectedStatus               && <CheckCircle2 className="w-3 h-3" />}
                  {selectedStatus ? STATUS_META[selectedStatus].label : "Available"}
                </span>
                {selectedBookings.length > 0 && (
                  <span className="ml-2 inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full"
                    style={{ background: "rgba(212,175,55,0.12)", color: "#D4AF37", border: "1px solid rgba(212,175,55,0.20)" }}>
                    <Users className="w-2.5 h-2.5" />
                    {selectedBookings.length} booking{selectedBookings.length > 1 ? "s" : ""}
                  </span>
                )}
              </div>
            </div>

            {/* ── Bookings list for this date ── */}
            {selectedBookings.length > 0 ? (
              <div>
                <div className="px-5 pt-4 pb-2">
                  <p className="text-[10px] uppercase tracking-widest" style={{ color: tok.textMuted }}>
                    {selectedBookings.length > 1
                      ? `${selectedBookings.length} Bookings on this date — click to expand`
                      : "Booking Details — click to expand"}
                  </p>
                </div>
                <div className="px-3 pb-3 space-y-2 max-h-[420px] overflow-y-auto">
                  {selectedBookings.map(bk => (
                    <BookingCard
                      key={bk.id}
                      booking={bk}
                      tok={tok}
                      saving={saving}
                      onEdit={setEditingBooking}
                      onDelete={setDeletingBooking}
                      canEdit={canEdit}
                      canDelete={canDelete}
                    />
                  ))}
                </div>

                {/* Date status controls */}
                <div className="px-5 py-4 space-y-2" style={{ borderTop: `1px solid ${tok.divider}` }}>
                  <p className="text-[10px] uppercase tracking-widest mb-3" style={{ color: tok.textMuted }}>
                    Set Date Status
                  </p>
                  <button onClick={() => handleSetStatus("approved")}
                    disabled={saving || selectedStatus === "approved"}
                    className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                    style={{
                      background: selectedStatus === "approved" ? "rgba(239,68,68,0.22)" : "rgba(239,68,68,0.10)",
                      border: `1px solid ${selectedStatus === "approved" ? "rgba(239,68,68,0.55)" : "rgba(239,68,68,0.25)"}`,
                      color: "#f87171",
                    }}>
                    <XCircle className="w-4 h-4 shrink-0" />Mark as Booked
                    {selectedStatus === "approved" && <span className="ml-auto text-[10px] opacity-60">● Active</span>}
                  </button>
                  <button onClick={() => handleSetStatus("pending")}
                    disabled={saving || selectedStatus === "pending"}
                    className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                    style={{
                      background: selectedStatus === "pending" ? "rgba(251,191,36,0.22)" : "rgba(251,191,36,0.10)",
                      border: `1px solid ${selectedStatus === "pending" ? "rgba(251,191,36,0.55)" : "rgba(251,191,36,0.25)"}`,
                      color: "#fbbf24",
                    }}>
                    <Clock className="w-4 h-4 shrink-0" />Mark as Pending
                    {selectedStatus === "pending" && <span className="ml-auto text-[10px] opacity-60">● Active</span>}
                  </button>
                  <button onClick={handleClearStatus}
                    disabled={saving || !selectedStatus}
                    className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                    style={{ background: "rgba(34,197,94,0.10)", border: "1px solid rgba(34,197,94,0.25)", color: "#4ade80" }}>
                    <CheckCircle2 className="w-4 h-4 shrink-0" />Mark as Available
                    {!selectedStatus && <span className="ml-auto text-[10px] opacity-60">● Active</span>}
                  </button>
                  {saving && <p className="text-[11px] text-center animate-pulse" style={{ color: tok.textMuted }}>Saving…</p>}
                </div>
              </div>
            ) : (
              /* No bookings — manual status panel */
              <div className="px-5 py-4">
                <div className="flex items-center gap-2 p-3 rounded-xl mb-4"
                  style={{
                    background: selectedStatus ? STATUS_META[selectedStatus].bg : "rgba(34,197,94,0.10)",
                    border: `1px solid ${selectedStatus ? STATUS_META[selectedStatus].border : "rgba(34,197,94,0.30)"}`,
                  }}>
                  {selectedStatus === "approved" && <XCircle className="w-5 h-5 text-red-400 shrink-0" />}
                  {selectedStatus === "pending"  && <Clock className="w-5 h-5 text-yellow-400 shrink-0" />}
                  {selectedStatus === "declined" && <Circle className="w-5 h-5 text-slate-400 shrink-0" />}
                  {!selectedStatus               && <CheckCircle2 className="w-5 h-5 text-green-400 shrink-0" />}
                  <div>
                    <div className="text-sm font-semibold" style={{ color: selectedStatus ? STATUS_META[selectedStatus].color : "#4ade80" }}>
                      {selectedStatus ? STATUS_META[selectedStatus].label : "Available"}
                    </div>
                    <div className="text-[10px]" style={{ color: tok.textMuted }}>
                      {selectedStatus === "approved" && "Confirmed booking on this date"}
                      {selectedStatus === "pending"  && "Request pending admin review"}
                      {selectedStatus === "declined" && "Date is blocked / unavailable"}
                      {!selectedStatus               && "No bookings — open for requests"}
                    </div>
                  </div>
                </div>

                <p className="text-[10px] uppercase tracking-widest mb-3" style={{ color: tok.textMuted }}>Set Status Manually</p>
                <div className="space-y-2">
                  <button onClick={() => handleSetStatus("approved")} disabled={saving || selectedStatus === "approved"}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                    style={{ background: selectedStatus === "approved" ? "rgba(239,68,68,0.22)" : "rgba(239,68,68,0.10)", border: `1px solid ${selectedStatus === "approved" ? "rgba(239,68,68,0.55)" : "rgba(239,68,68,0.25)"}`, color: "#f87171" }}>
                    <XCircle className="w-4 h-4 shrink-0" />Mark as Booked
                    {selectedStatus === "approved" && <span className="ml-auto text-[10px] opacity-60">● Active</span>}
                  </button>
                  <button onClick={() => handleSetStatus("pending")} disabled={saving || selectedStatus === "pending"}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                    style={{ background: selectedStatus === "pending" ? "rgba(251,191,36,0.22)" : "rgba(251,191,36,0.10)", border: `1px solid ${selectedStatus === "pending" ? "rgba(251,191,36,0.55)" : "rgba(251,191,36,0.25)"}`, color: "#fbbf24" }}>
                    <Clock className="w-4 h-4 shrink-0" />Mark as Pending
                    {selectedStatus === "pending" && <span className="ml-auto text-[10px] opacity-60">● Active</span>}
                  </button>
                  {selectedStatus && (
                    <button onClick={handleClearStatus} disabled={saving}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                      style={{ background: "rgba(34,197,94,0.10)", border: "1px solid rgba(34,197,94,0.25)", color: "#4ade80" }}>
                      <CheckCircle2 className="w-4 h-4 shrink-0" />Clear — Mark as Available
                    </button>
                  )}
                  {saving && <p className="text-[11px] text-center animate-pulse" style={{ color: tok.textMuted }}>Saving…</p>}
                </div>
                
                {!showQuickBook && !selectedStatus && (
                  <div className="mt-6 pt-4 border-t border-white/10">
                    <button
                      onClick={() => setShowQuickBook(true)}
                      className="w-full py-3 bg-gold text-black rounded-xl text-sm font-bold shadow-glow hover:bg-gold/90 transition-colors"
                    >
                      Book Now
                    </button>
                  </div>
                )}
                
                {showQuickBook && (
                  <div className="mt-6 pt-6 border-t border-white/10">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-white font-medium text-sm">New Booking</h3>
                      <button onClick={() => setShowQuickBook(false)} className="text-white/40 hover:text-white transition-colors">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <QuickBookPanel
                      defaultDate={format(selectedDate, "yyyy-MM-dd")}
                      onCreated={(b) => {
                        setBookings((prev) => [b, ...prev]);
                        setShowQuickBook(false);
                        fetchAll(); // Refresh the grid so the booking appears
                      }}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
