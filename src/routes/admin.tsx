import { createFileRoute, Outlet, useRouter, useRouterState } from "@tanstack/react-router";
import { useAuth } from "@/hooks/useAuth";
import {
  LogOut,
  Calendar,
  Users,
  LayoutDashboard,
  Inbox,
  Menu,
  X,
  Bell,
  Sun,
  Moon,
} from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useState, useEffect, createContext, useContext } from "react";
import { supabase } from "@/lib/supabase";

// ─── Theme Context ────────────────────────────────────────
export type AdminTheme = "dark" | "light";

const ThemeContext = createContext<{
  theme: AdminTheme;
  toggleTheme: () => void;
}>({ theme: "dark", toggleTheme: () => {} });

export function useAdminTheme() {
  return useContext(ThemeContext);
}

export const Route = createFileRoute("/admin")({
  component: AdminLayout,
});

function AdminLayout() {
  const { user, profile, loading, logout, isOwner } = useAuth();
  const router = useRouter();
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  // ── Theme state persisted in localStorage ──
  const [theme, setTheme] = useState<AdminTheme>(() => {
    const stored = localStorage.getItem("admin_theme");
    return (stored === "light" ? "light" : "dark") as AdminTheme;
  });

  const toggleTheme = () => {
    setTheme((prev) => {
      const next = prev === "dark" ? "light" : "dark";
      localStorage.setItem("admin_theme", next);
      return next;
    });
  };

  const isDark = theme === "dark";

  // Theme-aware colour tokens
  const colors = {
    bg:          isDark ? "oklch(0.10 0.015 240)"  : "oklch(0.97 0.008 240)",
    sidebar:     isDark ? "oklch(0.13 0.02 240)"   : "oklch(0.99 0.005 240)",
    header:      isDark ? "oklch(0.13 0.02 240)"   : "oklch(0.99 0.005 240)",
    border:      isDark ? "rgba(255,255,255,0.08)"  : "rgba(0,0,0,0.08)",
    textPrimary: isDark ? "rgba(255,255,255,0.85)"  : "rgba(0,0,0,0.85)",
    textMuted:   isDark ? "rgba(255,255,255,0.35)"  : "rgba(0,0,0,0.40)",
    navActive:   isDark ? "rgba(212,175,55,0.15)"   : "rgba(212,175,55,0.12)",
    navHover:    isDark ? "rgba(255,255,255,0.06)"  : "rgba(0,0,0,0.05)",
    navText:     isDark ? "rgba(255,255,255,0.50)"  : "rgba(0,0,0,0.50)",
  };

  useEffect(() => {
    const fetchPending = async () => {
      const { count } = await supabase
        .from("bookings")
        .select("*", { count: "exact", head: true })
        .eq("status", "pending");
      setPendingCount(count ?? 0);
    };
    if (user || localStorage.getItem("demo_admin") === "true") {
      fetchPending();
    }
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center"
        style={{ background: colors.bg }}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-gold border-t-transparent rounded-full animate-spin" />
          <p className="text-sm tracking-widest uppercase" style={{ color: colors.textMuted }}>
            Loading...
          </p>
        </div>
      </div>
    );
  }

  if (!user && router.state.location.pathname !== "/admin/login") {
    router.navigate({ to: "/admin/login" });
    return null;
  }

  if (router.state.location.pathname === "/admin/login") {
    return <Outlet />;
  }

  const isDashboard = currentPath === "/admin" || currentPath === "/admin/";
  const isRequests  = currentPath === "/admin/requests";
  const isCalendar  = currentPath === "/admin/calendar";
  const isUsers     = currentPath === "/admin/users";

  const navItems = [
    { to: "/admin",           label: "Dashboard", icon: LayoutDashboard, active: isDashboard, show: true },
    { to: "/admin/requests",  label: "Requests",  icon: Inbox,           active: isRequests,  badge: pendingCount > 0 ? pendingCount : null, show: true },
    { to: "/admin/calendar",  label: "Calendar",  icon: Calendar,        active: isCalendar,  show: true },
    { to: "/admin/users",     label: "Users",     icon: Users,           active: isUsers,     show: isOwner },
  ];

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className="h-16 flex items-center px-6 shrink-0"
        style={{ borderBottom: `1px solid ${colors.border}` }}>
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-md bg-gold/20 flex items-center justify-center">
            <span className="text-gold font-bold text-xs">S</span>
          </div>
          <span className="font-display text-lg gold-text tracking-[0.15em] uppercase">
            SAF Admin
          </span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        <p className="text-[10px] tracking-[0.3em] uppercase px-3 mb-3 mt-2"
          style={{ color: colors.textMuted }}>
          Navigation
        </p>
        {navItems.filter((item) => item.show).map((item) => (
          <Link
            key={item.to}
            to={item.to as any}
            onClick={() => setSidebarOpen(false)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 relative"
            style={{
              background:  item.active ? colors.navActive : "transparent",
              color:       item.active ? "var(--gold)" : colors.navText,
              border:      item.active ? "1px solid rgba(212,175,55,0.22)" : "1px solid transparent",
            }}
            onMouseEnter={(e) => {
              if (!item.active) (e.currentTarget as HTMLElement).style.background = colors.navHover;
            }}
            onMouseLeave={(e) => {
              if (!item.active) (e.currentTarget as HTMLElement).style.background = "transparent";
            }}
          >
            {item.active && (
              <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 bg-gold rounded-r-full" />
            )}
            <item.icon className="w-4 h-4 shrink-0" />
            <span className="font-medium">{item.label}</span>
            {item.badge && (
              <span className="ml-auto bg-gold text-black text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                {item.badge}
              </span>
            )}
          </Link>
        ))}
      </nav>

      {/* Theme Toggle + User */}
      <div className="p-4 shrink-0" style={{ borderTop: `1px solid ${colors.border}` }}>
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 mb-3"
          style={{
            background: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)",
            color: colors.textMuted,
            border: `1px solid ${colors.border}`,
          }}
        >
          {isDark ? (
            <><Sun className="w-4 h-4 text-gold" /><span>Switch to Day Mode</span></>
          ) : (
            <><Moon className="w-4 h-4 text-gold" /><span>Switch to Night Mode</span></>
          )}
        </button>

        {/* User info */}
        <div className="flex items-center gap-3 px-2 mb-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gold/30 to-gold/10 border border-gold/30 flex items-center justify-center shrink-0">
            <span className="text-gold text-xs font-bold uppercase">
              {(profile?.email || "A")[0]}
            </span>
          </div>
          <div className="min-w-0">
            <div className="text-xs font-medium truncate" style={{ color: colors.textPrimary }}>
              {profile?.email}
            </div>
            <div className="text-[10px] text-gold/70 capitalize tracking-wider">{profile?.role}</div>
          </div>
        </div>

        <button
          onClick={() => { logout(); router.navigate({ to: "/admin/login" }); }}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs transition-colors text-red-400/70 hover:text-red-400"
          style={{ border: `1px solid transparent` }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.background = "rgba(239,68,68,0.08)";
            (e.currentTarget as HTMLElement).style.borderColor = "rgba(239,68,68,0.2)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.background = "transparent";
            (e.currentTarget as HTMLElement).style.borderColor = "transparent";
          }}
        >
          <LogOut className="w-3.5 h-3.5" />
          Sign Out
        </button>
      </div>
    </>
  );

  const pageTitle =
    isDashboard ? "Dashboard" :
    isRequests  ? "Booking Requests" :
    isCalendar  ? "Calendar Management" :
    isUsers     ? "User Management" : "";

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <div className="min-h-screen flex" style={{ background: colors.bg, color: colors.textPrimary }}>

        {/* Desktop Sidebar */}
        <aside className="w-60 hidden md:flex md:flex-col fixed inset-y-0 left-0 z-30"
          style={{ background: colors.sidebar, borderRight: `1px solid ${colors.border}` }}>
          <SidebarContent />
        </aside>

        {/* Mobile Overlay */}
        {sidebarOpen && (
          <div className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)} />
        )}

        {/* Mobile Sidebar */}
        <aside
          className={`fixed inset-y-0 left-0 z-50 w-60 flex flex-col md:hidden transition-transform duration-300 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
          style={{ background: colors.sidebar, borderRight: `1px solid ${colors.border}` }}
        >
          <SidebarContent />
        </aside>

        {/* Main */}
        <main className="flex-1 flex flex-col min-h-screen md:ml-60">
          {/* Top Header */}
          <header
            className="h-16 flex items-center px-4 md:px-8 justify-between shrink-0 sticky top-0 z-20"
            style={{
              background: colors.header,
              borderBottom: `1px solid ${colors.border}`,
            }}
          >
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen((v) => !v)}
                className="md:hidden p-2 rounded-lg transition-colors"
                style={{ color: colors.textMuted }}
              >
                {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
              <h1 className="text-sm font-semibold" style={{ color: colors.textPrimary }}>
                {pageTitle}
              </h1>
            </div>

            <div className="flex items-center gap-3">
              {/* Header theme toggle (compact) */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg transition-all"
                title={isDark ? "Switch to Day Mode" : "Switch to Night Mode"}
                style={{
                  background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)",
                  border: `1px solid ${colors.border}`,
                  color: colors.textMuted,
                }}
              >
                {isDark ? <Sun className="w-4 h-4 text-gold" /> : <Moon className="w-4 h-4 text-gold" />}
              </button>

              {pendingCount > 0 && (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gold/10 border border-gold/20">
                  <Bell className="w-3.5 h-3.5 text-gold animate-pulse" />
                  <span className="text-xs text-gold font-medium">{pendingCount} pending</span>
                </div>
              )}
            </div>
          </header>

          {/* Page Content */}
          <div className="flex-1 overflow-auto p-5 md:p-8">
            <Outlet />
          </div>
        </main>
      </div>
    </ThemeContext.Provider>
  );
}
