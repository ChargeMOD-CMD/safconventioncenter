import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase, Booking } from "@/lib/supabase";
import { useAdminTheme } from "@/routes/admin";
import { format, subDays, eachDayOfInterval, isSameDay, parseISO } from "date-fns";
import {
  TrendingUp,
  CalendarCheck,
  Clock,
  ArrowRight,
  Inbox,
  Star,
  BarChart3,
} from "lucide-react";

export const Route = createFileRoute("/admin/")({
  component: Dashboard,
});

function Dashboard() {
  const { theme } = useAdminTheme();
  const isDark = theme === "dark";
  const cardBg     = isDark ? "oklch(0.15 0.018 240)" : "#ffffff";
  const cardBorder = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)";
  const textColor  = isDark ? "rgba(255,255,255,0.80)" : "rgba(0,0,0,0.80)";
  const mutedColor = isDark ? "rgba(255,255,255,0.30)" : "rgba(0,0,0,0.35)";
  const barEmpty   = isDark ? "oklch(0.25 0.02 240)" : "oklch(0.88 0.01 240)";

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  // ─── Global Filters ──────────────────────────────────────
  const [yearFilter, setYearFilter] = useState<string>("all");
  const [monthFilter, setMonthFilter] = useState<string>("all");
  const [venueFilter, setVenueFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  useEffect(() => {
    const fetchBookings = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("bookings")
        .select("*")
        .order("created_at", { ascending: false });
      if (!error && data) setBookings(data as Booking[]);
      setLoading(false);
    };
    fetchBookings();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 rounded-xl bg-white/5 border border-white/8" />
          ))}
        </div>
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-72 rounded-xl bg-white/5 border border-white/8" />
          <div className="h-72 rounded-xl bg-white/5 border border-white/8" />
        </div>
      </div>
    );
  }

  // Extract unique years and event types for dropdowns
  const availableYears = Array.from(new Set(bookings.map((b) => new Date(b.event_date).getFullYear().toString()))).sort();
  const availableTypes = Array.from(new Set(bookings.map((b) => {
    const withoutAc = (b.event_type || "Other").replace(/ \((AC|Non-AC)\)$/, "");
    const match = withoutAc.match(/ - (.+)$/);
    return match ? withoutAc.replace(/ - (.+)$/, "").trim() : withoutAc.trim();
  }))).filter(Boolean).sort();

  const filteredBookings = bookings.filter(b => {
    const d = new Date(b.event_date);
    if (yearFilter !== "all" && d.getFullYear().toString() !== yearFilter) return false;
    if (monthFilter !== "all" && (d.getMonth() + 1).toString() !== monthFilter) return false;
    
    const withoutAc = (b.event_type || "Other").replace(/ \((AC|Non-AC)\)$/, "");
    const match = withoutAc.match(/ - (.+)$/);
    const bVenue = match ? match[1].trim() : "Any Venue";
    const bType = match ? withoutAc.replace(/ - (.+)$/, "").trim() : withoutAc.trim();

    if (venueFilter !== "all" && bVenue !== venueFilter) return false;
    if (typeFilter !== "all" && bType !== typeFilter) return false;
    
    return true;
  });

  // ─── Stats ───────────────────────────────────────────────
  const total = filteredBookings.length;
  const approved = filteredBookings.filter((b) => b.status === "approved").length;
  const pending = filteredBookings.filter((b) => b.status === "pending").length;
  const declined = filteredBookings.filter((b) => b.status === "declined").length;

  // Revenue estimate (rough: avg ₹2.5L per approved booking)
  const revenueEst = approved * 250000;

  // ─── Last 14 days trend ──────────────────────────────────
  const last14 = eachDayOfInterval({ start: subDays(new Date(), 13), end: new Date() });
  const dailyCounts = last14.map((day) => ({
    label: format(day, "dd"),
    fullLabel: format(day, "MMM d"),
    count: filteredBookings.filter((b) => isSameDay(parseISO(b.created_at), day)).length,
  }));
  const maxCount = Math.max(...dailyCounts.map((d) => d.count), 1);

  // ─── Event type breakdown ────────────────────────────────
  const typeCounts = filteredBookings.reduce<Record<string, number>>((acc, b) => {
    const withoutAc = (b.event_type || "Other").replace(/ \((AC|Non-AC)\)$/, "");
    const match = withoutAc.match(/ - (.+)$/);
    const type = match ? withoutAc.replace(/ - (.+)$/, "").trim() : withoutAc.trim();
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {});
  const typeEntries = Object.entries(typeCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);

  // ─── Slot breakdown ──────────────────────────────────────
  const slotCounts = {
    Morning: filteredBookings.filter((b) => b.event_time_slot === "morning").length,
    Afternoon: filteredBookings.filter((b) => b.event_time_slot === "afternoon").length,
    Evening: filteredBookings.filter((b) => b.event_time_slot === "evening").length,
    "Full Day": filteredBookings.filter((b) => b.event_time_slot === "full_day").length,
  };

  // ─── Recent bookings ─────────────────────────────────────
  const recent = filteredBookings.slice(0, 5);

  const statusColors: Record<string, string> = {
    approved: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    pending: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20",
    declined: "text-red-400 bg-red-500/10 border-red-500/20",
  };

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Welcome Banner */}
      <div className="rounded-2xl border border-gold/20 p-6 relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, oklch(0.16 0.04 60 / 0.8), oklch(0.13 0.02 240))" }}>
        <div className="absolute inset-0 opacity-20"
          style={{ backgroundImage: "radial-gradient(circle at 80% 50%, oklch(0.72 0.14 70 / 0.4), transparent 60%)" }} />
        <div className="relative">
          <p className="text-xs tracking-[0.3em] uppercase text-gold/70 mb-1">Welcome back</p>
          <h1 className="font-display text-2xl md:text-3xl text-white">
            SAF Convention Center
          </h1>
          <p className="text-sm text-white/40 mt-1">
            {format(new Date(), "EEEE, MMMM d, yyyy")}
          </p>
        </div>
      </div>

      {/* Global Filters */}
      <div className="flex flex-wrap items-center gap-3 bg-white/5 border border-white/10 p-4 rounded-xl">
        <span className="text-xs text-white/50 font-medium uppercase tracking-wider mr-2 hidden sm:inline-block">Filters:</span>
        <select value={monthFilter} onChange={e => setMonthFilter(e.target.value)} className="bg-[#1c1c28] border border-white/10 text-xs rounded-md px-3 py-2 outline-none text-white/80 cursor-pointer">
          <option value="all">All Months</option>
          {Array.from({length: 12}, (_, i) => (
            <option key={i+1} value={(i+1).toString()}>{new Date(2000, i).toLocaleString('default', {month: 'long'})}</option>
          ))}
        </select>
        <select value={yearFilter} onChange={e => setYearFilter(e.target.value)} className="bg-[#1c1c28] border border-white/10 text-xs rounded-md px-3 py-2 outline-none text-white/80 cursor-pointer">
          <option value="all">All Years</option>
          {availableYears.map(y => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
        <select value={venueFilter} onChange={e => setVenueFilter(e.target.value)} className="bg-[#1c1c28] border border-white/10 text-xs rounded-md px-3 py-2 outline-none text-white/80 cursor-pointer">
          <option value="all">All Venues</option>
          <option value="SAF Grand">SAF Grand</option>
          <option value="SAF Aura">SAF Aura</option>
          <option value="SAF Crown">SAF Crown</option>
        </select>
        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="bg-[#1c1c28] border border-white/10 text-xs rounded-md px-3 py-2 outline-none text-white/80 cursor-pointer max-w-[150px] sm:max-w-none">
          <option value="all">All Event Types</option>
          {availableTypes.map(t => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <KpiCard
          label="Total Bookings"
          value={total}
          icon={<BarChart3 className="w-5 h-5" />}
          color="text-blue-400"
          bg="bg-blue-500/10 border-blue-500/20"
          suffix=""
        />
        <KpiCard
          label="Approved"
          value={approved}
          icon={<CalendarCheck className="w-5 h-5" />}
          color="text-emerald-400"
          bg="bg-emerald-500/10 border-emerald-500/20"
          suffix=""
        />
        <KpiCard
          label="Pending"
          value={pending}
          icon={<Clock className="w-5 h-5" />}
          color="text-yellow-400"
          bg="bg-yellow-500/10 border-yellow-500/20"
          suffix=""
          pulse={pending > 0}
        />
      </div>

      {/* Second Row */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Booking Trend Chart */}
        <div className="lg:col-span-2 rounded-xl border p-6"
          style={{ background: cardBg, borderColor: cardBorder }}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-sm font-medium" style={{ color: textColor }}>Booking Trend</h2>
              <p className="text-xs mt-0.5" style={{ color: mutedColor }}>Last 14 days</p>
            </div>
            <div className="flex items-center gap-1.5 text-xs" style={{ color: mutedColor }}>
              <TrendingUp className="w-3.5 h-3.5" />
              Daily requests
            </div>
          </div>
          {/* Bar Chart */}
          <div className="flex items-end gap-1.5 h-40">
            {dailyCounts.map((d, i) => {
              const pct = maxCount > 0 ? (d.count / maxCount) * 100 : 0;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
                  {/* Tooltip */}
                  <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-black/90 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                    {d.fullLabel}: {d.count} booking{d.count !== 1 ? "s" : ""}
                  </div>
                  <div
                    className="w-full rounded-t-md transition-all duration-500 min-h-[3px]"
                    style={{
                      height: `${Math.max(pct, 2)}%`,
                      background:
                        d.count > 0
                          ? "linear-gradient(180deg, oklch(0.72 0.14 70), oklch(0.58 0.14 68))"
                          : barEmpty,
                    }}
                  />
                  <span className="text-[9px]" style={{ color: mutedColor }}>{d.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Status Ring / Event Types */}
        <div className="rounded-xl border p-6 flex flex-col"
          style={{ background: cardBg, borderColor: cardBorder }}>
          <div className="mb-6">
            <h2 className="text-sm font-medium" style={{ color: textColor }}>Booking Status</h2>
            <p className="text-xs mt-0.5" style={{ color: mutedColor }}>All time</p>
          </div>
          {/* Status bars */}
          <div className="space-y-3 flex-1">
            {[
              { label: "Approved", count: approved, color: "#34d399", bg: "bg-emerald-500" },
              { label: "Pending", count: pending, color: "#facc15", bg: "bg-yellow-400" },
              { label: "Declined", count: declined, color: "#f87171", bg: "bg-red-400" },
            ].map((s) => {
              const pct = total > 0 ? Math.round((s.count / total) * 100) : 0;
              return (
                <div key={s.label}>
                  <div className="flex justify-between text-xs mb-1">
                    <span style={{ color: mutedColor }}>{s.label}</span>
                    <span style={{ color: s.color }}>{s.count} ({pct}%)</span>
                  </div>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${pct}%`, background: s.color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick stats */}
          <div className="mt-4 pt-4 border-t border-white/8 grid grid-cols-2 gap-3">
            <div className="text-center">
              <div className="text-lg font-bold text-white">
                {total > 0 ? Math.round((approved / total) * 100) : 0}%
              </div>
              <div className="text-[10px] uppercase tracking-wider" style={{ color: mutedColor }}>Approval Rate</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-white">{pending}</div>
              <div className="text-[10px] uppercase tracking-wider" style={{ color: mutedColor }}>Awaiting Review</div>
            </div>
          </div>
        </div>
      </div>

      {/* Third Row */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Event Types */}
        <div className="rounded-xl border p-6"
          style={{ background: cardBg, borderColor: cardBorder }}>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-sm font-medium text-white/80">Event Types</h2>
              <p className="text-xs text-white/30 mt-0.5">Top categories</p>
            </div>
            <Star className="w-4 h-4 text-gold/50" />
          </div>
          {typeEntries.length === 0 ? (
            <p className="text-white/30 text-xs">No bookings yet.</p>
          ) : (
            <div className="space-y-3">
              {typeEntries.map(([type, count], i) => {
                const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                const hue = 60 + i * 30;
                return (
                  <div key={type}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-white/60 capitalize">{type}</span>
                      <span className="text-white/40">{count}</span>
                    </div>
                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${pct}%`, background: `oklch(0.65 0.15 ${hue})` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="rounded-xl border p-6"
          style={{ background: cardBg, borderColor: cardBorder }}>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-sm font-medium text-white/80">Recent Activity</h2>
              <p className="text-xs text-white/30 mt-0.5">Latest 5 bookings</p>
            </div>
            <Link
              to="/admin/requests"
              className="text-[10px] text-gold/70 hover:text-gold flex items-center gap-1 transition-colors"
            >
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          {recent.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Inbox className="w-8 h-8 text-white/20 mb-2" />
              <p className="text-xs text-white/30">No bookings yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recent.map((b) => (
                <div key={b.id} className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                    <span className="text-[10px] text-white/60 font-medium uppercase">
                      {b.first_name?.[0] || "?"}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-white/70 font-medium truncate">
                      {b.first_name} {b.last_name}
                    </div>
                    <div className="text-[10px] text-white/30 truncate capitalize">{b.event_type}</div>
                  </div>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full border capitalize ${statusColors[b.status]}`}>
                    {b.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Fourth Row - Reports */}
      <div className="grid lg:grid-cols-2 gap-6">
        <ACReport bookings={filteredBookings} />
      </div>

      {/* Quick Actions */}
      {pending > 0 && (
        <div className="rounded-xl border border-yellow-500/20 p-5 flex items-center justify-between"
          style={{ background: "oklch(0.16 0.04 80 / 0.4)" }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-yellow-500/20 flex items-center justify-center">
              <Clock className="w-4 h-4 text-yellow-400" />
            </div>
            <div>
              <div className="text-sm font-medium text-yellow-400">
                {pending} booking{pending > 1 ? "s" : ""} awaiting approval
              </div>
              <div className="text-xs text-white/30 mt-0.5">Review and respond to client requests</div>
            </div>
          </div>
          <Link
            to="/admin/requests"
            className="flex items-center gap-2 px-4 py-2 bg-yellow-500/20 hover:bg-yellow-500/30 border border-yellow-500/30 text-yellow-300 text-xs font-medium rounded-lg transition-colors"
          >
            Review <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}
    </div>
  );
}

function ACReport({ bookings }: { bookings: Booking[] }) {
  const filtered = bookings.filter(b => b.status === "approved");

  const acCount = filtered.filter(b => (b.event_type || "").includes("(AC)")).length;
  const nonAcCount = filtered.filter(b => (b.event_type || "").includes("(Non-AC)")).length;
  const otherCount = filtered.length - acCount - nonAcCount;

  return (
    <div className="rounded-xl border p-6" style={{ background: "oklch(0.15 0.018 240)", borderColor: "rgba(255,255,255,0.08)" }}>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-sm font-medium text-white/80">AC vs Non-AC Bookings</h2>
          <p className="text-xs text-white/30 mt-0.5">Approved bookings report</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-lg bg-cyan-500/10 border border-cyan-500/20 p-4 text-center">
          <div className="text-2xl font-bold text-cyan-400">{acCount}</div>
          <div className="text-[10px] text-cyan-400/60 mt-1 uppercase tracking-wider font-medium">AC Hall</div>
        </div>
        <div className="rounded-lg bg-orange-500/10 border border-orange-500/20 p-4 text-center">
          <div className="text-2xl font-bold text-orange-400">{nonAcCount}</div>
          <div className="text-[10px] text-orange-400/60 mt-1 uppercase tracking-wider font-medium">Non-AC Hall</div>
        </div>
      </div>
      {otherCount > 0 && (
         <div className="text-center text-[10px] text-white/30 mt-4 uppercase tracking-wider">
           + {otherCount} unspecified bookings
         </div>
      )}
    </div>
  );
}

function KpiCard({
  label,
  value,
  icon,
  color,
  bg,
  prefix = "",
  suffix = "",
  isCurrency = false,
  pulse = false,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  bg: string;
  prefix?: string;
  suffix?: string;
  isCurrency?: boolean;
  pulse?: boolean;
}) {
  const displayValue = isCurrency
    ? value >= 100000
      ? `${(value / 100000).toFixed(1)}L`
      : value.toLocaleString("en-IN")
    : value.toString();

  return (
    <div
      className={`rounded-xl border p-5 relative overflow-hidden ${bg}`}
      style={{ background: "oklch(0.15 0.018 240)" }}
    >
      <div className={`flex items-center justify-between mb-3`}>
        <p className="text-xs text-white/40 uppercase tracking-wider">{label}</p>
        <div className={`${color} opacity-60 ${pulse ? "animate-pulse" : ""}`}>{icon}</div>
      </div>
      <div className={`text-2xl font-bold ${color}`}>
        {prefix}{displayValue}{suffix}
      </div>
    </div>
  );
}
