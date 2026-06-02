import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase, CalendarDate } from "@/lib/supabase";
import { useAdminTheme } from "@/routes/admin";
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
} from "lucide-react";

export const Route = createFileRoute("/admin/calendar")({
  component: AdminCalendar,
});

type StatusKey = "approved" | "pending" | "declined";

const STATUS_META: Record<StatusKey, { label: string; color: string; bg: string; border: string; dotClass: string }> = {
  approved: {
    label: "Booked",
    color: "#f87171",
    bg: "rgba(239,68,68,0.15)",
    border: "rgba(239,68,68,0.40)",
    dotClass: "bg-red-400",
  },
  pending: {
    label: "Pending",
    color: "#fbbf24",
    bg: "rgba(251,191,36,0.15)",
    border: "rgba(251,191,36,0.40)",
    dotClass: "bg-yellow-400",
  },
  declined: {
    label: "Blocked",
    color: "#94a3b8",
    bg: "rgba(148,163,184,0.12)",
    border: "rgba(148,163,184,0.25)",
    dotClass: "bg-slate-400",
  },
};

const WEEK_DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function AdminCalendar() {
  const { theme } = useAdminTheme();
  const isDark = theme === "dark";

  const [dates, setDates] = useState<CalendarDate[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [viewMonth, setViewMonth] = useState<Date>(new Date());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Theme tokens
  const tok = {
    card:        isDark ? "oklch(0.15 0.018 240)" : "#ffffff",
    cardBorder:  isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)",
    text:        isDark ? "rgba(255,255,255,0.90)" : "rgba(0,0,0,0.85)",
    textMuted:   isDark ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.40)",
    cellBg:      isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)",
    cellHover:   isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.05)",
    todayRing:   "#D4AF37",
    selectedBg:  isDark ? "rgba(212,175,55,0.20)" : "rgba(212,175,55,0.15)",
    selectedBorder: "rgba(212,175,55,0.60)",
    outsideText: isDark ? "rgba(255,255,255,0.20)" : "rgba(0,0,0,0.20)",
    divider:     isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)",
  };

  useEffect(() => { fetchDates(); }, []);

  const fetchDates = async () => {
    setLoading(true);
    const { data, error } = await (supabase as any).from("calendar_dates").select("*");
    if (!error && data) setDates(data as CalendarDate[]);
    setLoading(false);
  };

  const getStatusForDate = (d: Date): StatusKey | null => {
    const str = format(d, "yyyy-MM-dd");
    const rec = dates.find((r) => r.date === str);
    return rec ? (rec.status as StatusKey) : null;
  };

  const selectedStr = format(selectedDate, "yyyy-MM-dd");
  const selectedStatus = getStatusForDate(selectedDate);

  const handleSetStatus = async (status: StatusKey) => {
    setSaving(true);
    const { error } = await (supabase as any)
      .from("calendar_dates")
      .upsert({ date: selectedStr, status });

    if (error) {
      alert("Failed to update date.");
    } else {
      setDates((prev) => {
        const filtered = prev.filter((d) => d.date !== selectedStr);
        return [...filtered, { date: selectedStr, status, note: null, updated_by: null, updated_at: new Date().toISOString() }];
      });
    }
    setSaving(false);
  };

  const handleClearStatus = async () => {
    setSaving(true);
    const { error } = await (supabase as any)
      .from("calendar_dates")
      .delete()
      .eq("date", selectedStr);

    if (error) {
      alert("Failed to clear date.");
    } else {
      setDates((prev) => prev.filter((d) => d.date !== selectedStr));
    }
    setSaving(false);
  };

  // Build calendar grid
  const monthStart = startOfMonth(viewMonth);
  const monthEnd   = endOfMonth(viewMonth);
  const gridStart  = startOfWeek(monthStart);
  const gridEnd    = endOfWeek(monthEnd);

  const calendarDays: Date[] = [];
  let cur = gridStart;
  while (cur <= gridEnd) {
    calendarDays.push(cur);
    cur = addDays(cur, 1);
  }

  // Stats for this month
  const monthDates = dates.filter((d) => {
    const dt = parseISO(d.date);
    return isSameMonth(dt, viewMonth);
  });
  const monthStats = {
    booked:  monthDates.filter((d) => d.status === "approved").length,
    pending: monthDates.filter((d) => d.status === "pending").length,
    blocked: monthDates.filter((d) => d.status === "declined").length,
    total:   monthDates.length,
  };

  return (
    <div className="max-w-6xl space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl" style={{ color: tok.text }}>
            Calendar Management
          </h1>
          <p className="text-xs mt-1" style={{ color: tok.textMuted }}>
            Set dates as Booked, Pending or Blocked to manage availability
          </p>
        </div>
        <button
          onClick={fetchDates}
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition-colors"
          style={{ background: tok.cellBg, border: `1px solid ${tok.cardBorder}`, color: tok.textMuted }}
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Month stats strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Booked",  value: monthStats.booked,  color: "#f87171",  bg: "rgba(239,68,68,0.10)",   border: "rgba(239,68,68,0.20)" },
          { label: "Pending", value: monthStats.pending, color: "#fbbf24",  bg: "rgba(251,191,36,0.10)",  border: "rgba(251,191,36,0.20)" },
          { label: "Blocked", value: monthStats.blocked, color: "#94a3b8",  bg: "rgba(148,163,184,0.10)", border: "rgba(148,163,184,0.20)" },
          { label: "Marked",  value: monthStats.total,   color: "#D4AF37",  bg: "rgba(212,175,55,0.10)",  border: "rgba(212,175,55,0.20)" },
        ].map((s) => (
          <div key={s.label} className="rounded-xl p-4"
            style={{ background: s.bg, border: `1px solid ${s.border}` }}>
            <div className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</div>
            <div className="text-[10px] uppercase tracking-widest mt-1" style={{ color: s.color, opacity: 0.7 }}>
              {s.label} in {format(viewMonth, "MMM")}
            </div>
          </div>
        ))}
      </div>

      {/* Main Grid: Calendar + Side Panel */}
      <div className="grid lg:grid-cols-3 gap-5 items-start">
        {/* ── Calendar ─────────────────────────────── */}
        <div className="lg:col-span-2 rounded-2xl overflow-hidden"
          style={{ background: tok.card, border: `1px solid ${tok.cardBorder}` }}>

          {/* Month Navigation */}
          <div className="flex items-center justify-between px-6 py-4"
            style={{ borderBottom: `1px solid ${tok.divider}` }}>
            <button
              onClick={() => setViewMonth((m) => subMonths(m, 1))}
              className="p-2 rounded-lg transition-colors"
              style={{ color: tok.textMuted, background: tok.cellBg }}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="text-center">
              <div className="font-display text-lg font-semibold" style={{ color: tok.text }}>
                {format(viewMonth, "MMMM yyyy")}
              </div>
            </div>

            <button
              onClick={() => setViewMonth((m) => addMonths(m, 1))}
              className="p-2 rounded-lg transition-colors"
              style={{ color: tok.textMuted, background: tok.cellBg }}
            >
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
              {/* Week day headers */}
              <div className="grid grid-cols-7 mb-2">
                {WEEK_DAYS.map((d) => (
                  <div key={d} className="text-center text-[11px] font-semibold uppercase tracking-wider py-2"
                    style={{ color: tok.textMuted }}>
                    {d}
                  </div>
                ))}
              </div>

              {/* Day cells */}
              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((day, i) => {
                  const inMonth   = isSameMonth(day, viewMonth);
                  const isSelected = isSameDay(day, selectedDate);
                  const todayDay  = isToday(day);
                  const status    = getStatusForDate(day);
                  const meta      = status ? STATUS_META[status] : null;

                  return (
                    <button
                      key={i}
                      onClick={() => { setSelectedDate(day); }}
                      className="relative flex flex-col items-center justify-center rounded-xl transition-all duration-150 aspect-square text-sm font-medium focus:outline-none"
                      style={{
                        background: isSelected
                          ? tok.selectedBg
                          : meta
                            ? meta.bg
                            : tok.cellBg,
                        border: isSelected
                          ? `2px solid ${tok.selectedBorder}`
                          : meta
                            ? `1px solid ${meta.border}`
                            : `1px solid transparent`,
                        color: isSelected
                          ? "#D4AF37"
                          : meta
                            ? meta.color
                            : inMonth
                              ? tok.text
                              : tok.outsideText,
                        opacity: inMonth ? 1 : 0.4,
                        cursor: "pointer",
                      }}
                      onMouseEnter={(e) => {
                        if (!isSelected) (e.currentTarget as HTMLElement).style.background = tok.cellHover;
                      }}
                      onMouseLeave={(e) => {
                        if (!isSelected)
                          (e.currentTarget as HTMLElement).style.background = meta ? meta.bg : tok.cellBg;
                      }}
                    >
                      {/* Today ring */}
                      {todayDay && (
                        <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-gold" />
                      )}
                      <span className="text-sm leading-none">{format(day, "d")}</span>
                      {/* Status dot */}
                      {meta && !isSelected && (
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
                  <span className="w-2.5 h-2.5 rounded-full bg-gold" />
                  <span className="text-[11px]" style={{ color: tok.textMuted }}>Today</span>
                </div>
                <div className="flex items-center gap-1.5 ml-auto">
                  <span className="text-[11px]" style={{ color: tok.textMuted }}>
                    Click a date to manage its status
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── Side Panel ───────────────────────────── */}
        <div className="rounded-2xl overflow-hidden space-y-3"
          style={{ background: tok.card, border: `1px solid ${tok.cardBorder}` }}>

          {/* Selected date header */}
          <div className="px-5 py-4" style={{ borderBottom: `1px solid ${tok.divider}` }}>
            <div className="flex items-center gap-2 mb-1">
              <CalendarDays className="w-4 h-4 text-gold" />
              <span className="text-[10px] uppercase tracking-widest" style={{ color: tok.textMuted }}>
                Selected Date
              </span>
            </div>
            <div className="font-display text-xl font-semibold" style={{ color: tok.text }}>
              {format(selectedDate, "MMMM d, yyyy")}
            </div>
            <div className="text-xs mt-0.5" style={{ color: tok.textMuted }}>
              {format(selectedDate, "EEEE")}
              {isToday(selectedDate) && (
                <span className="ml-2 text-gold text-[10px] font-medium uppercase tracking-wider">· Today</span>
              )}
            </div>
          </div>

          {/* Current Status */}
          <div className="px-5 pt-2 pb-3">
            <p className="text-[10px] uppercase tracking-widest mb-3" style={{ color: tok.textMuted }}>
              Current Status
            </p>
            <div className="flex items-center gap-2 p-3 rounded-xl"
              style={{
                background: selectedStatus ? STATUS_META[selectedStatus].bg : "rgba(34,197,94,0.10)",
                border: `1px solid ${selectedStatus ? STATUS_META[selectedStatus].border : "rgba(34,197,94,0.30)"}`,
              }}>
              {selectedStatus === "approved" && <XCircle className="w-5 h-5 text-red-400 shrink-0" />}
              {selectedStatus === "pending"  && <Clock className="w-5 h-5 text-yellow-400 shrink-0" />}
              {selectedStatus === "declined" && <Circle className="w-5 h-5 text-slate-400 shrink-0" />}
              {!selectedStatus               && <CheckCircle2 className="w-5 h-5 text-green-400 shrink-0" />}
              <div>
                <div className="text-sm font-semibold"
                  style={{ color: selectedStatus ? STATUS_META[selectedStatus].color : "#4ade80" }}>
                  {selectedStatus ? STATUS_META[selectedStatus].label : "Available"}
                </div>
                <div className="text-[10px]" style={{ color: tok.textMuted }}>
                  {selectedStatus === "approved" && "This date is confirmed as booked"}
                  {selectedStatus === "pending"  && "Awaiting approval for this date"}
                  {selectedStatus === "declined" && "This date is blocked / unavailable"}
                  {!selectedStatus               && "Open for new bookings"}
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="px-5 pb-5 space-y-2">
            <p className="text-[10px] uppercase tracking-widest mb-3" style={{ color: tok.textMuted }}>
              Change Status
            </p>

            <button
              onClick={() => handleSetStatus("approved")}
              disabled={saving || selectedStatus === "approved"}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              style={{
                background: selectedStatus === "approved" ? "rgba(239,68,68,0.20)" : "rgba(239,68,68,0.10)",
                border: `1px solid ${selectedStatus === "approved" ? "rgba(239,68,68,0.50)" : "rgba(239,68,68,0.25)"}`,
                color: "#f87171",
              }}
            >
              <XCircle className="w-4 h-4 shrink-0" />
              Mark as Booked
              {selectedStatus === "approved" && <span className="ml-auto text-[10px] opacity-60">Active</span>}
            </button>

            <button
              onClick={() => handleSetStatus("pending")}
              disabled={saving || selectedStatus === "pending"}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              style={{
                background: selectedStatus === "pending" ? "rgba(251,191,36,0.20)" : "rgba(251,191,36,0.10)",
                border: `1px solid ${selectedStatus === "pending" ? "rgba(251,191,36,0.50)" : "rgba(251,191,36,0.25)"}`,
                color: "#fbbf24",
              }}
            >
              <Clock className="w-4 h-4 shrink-0" />
              Mark as Pending
              {selectedStatus === "pending" && <span className="ml-auto text-[10px] opacity-60">Active</span>}
            </button>

            <button
              onClick={() => handleSetStatus("declined")}
              disabled={saving || selectedStatus === "declined"}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              style={{
                background: selectedStatus === "declined" ? "rgba(148,163,184,0.20)" : "rgba(148,163,184,0.08)",
                border: `1px solid ${selectedStatus === "declined" ? "rgba(148,163,184,0.40)" : "rgba(148,163,184,0.18)"}`,
                color: "#94a3b8",
              }}
            >
              <Circle className="w-4 h-4 shrink-0" />
              Block / Make Unavailable
              {selectedStatus === "declined" && <span className="ml-auto text-[10px] opacity-60">Active</span>}
            </button>

            {selectedStatus && (
              <button
                onClick={handleClearStatus}
                disabled={saving}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                style={{
                  background: "rgba(34,197,94,0.10)",
                  border: "1px solid rgba(34,197,94,0.25)",
                  color: "#4ade80",
                }}
              >
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                Clear — Mark as Available
              </button>
            )}

            {saving && (
              <p className="text-[11px] text-center animate-pulse" style={{ color: tok.textMuted }}>
                Saving changes…
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
