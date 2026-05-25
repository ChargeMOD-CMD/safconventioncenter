import { createFileRoute, Outlet, redirect, useRouter } from "@tanstack/react-router";
import { useAuth } from "@/hooks/useAuth";
import { LogOut, Calendar, Users, LayoutDashboard } from "lucide-react";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/admin")({
  component: AdminLayout,
});

function AdminLayout() {
  const { user, profile, loading, logout, isOwner } = useAuth();
  const router = useRouter();

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // If not logged in and not currently on the login page, redirect
  if (!user && router.state.location.pathname !== "/admin/login") {
    router.navigate({ to: "/admin/login" });
    return null;
  }

  // If on login page, don't show the dashboard shell
  if (router.state.location.pathname === "/admin/login") {
    return <Outlet />;
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border bg-card flex flex-col hidden md:flex">
        <div className="h-16 flex items-center px-6 border-b border-border">
          <span className="font-display text-xl gold-text tracking-widest uppercase">Admin</span>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <Link
            to="/admin"
            className="flex items-center gap-3 px-4 py-3 rounded-md text-sm text-muted-foreground hover:text-white hover:bg-white/5 transition-colors [&.active]:bg-gold/10 [&.active]:text-gold"
          >
            <LayoutDashboard className="w-4 h-4" />
            Dashboard
          </Link>

          <Link
            to="/admin/calendar"
            className="flex items-center gap-3 px-4 py-3 rounded-md text-sm text-muted-foreground hover:text-white hover:bg-white/5 transition-colors [&.active]:bg-gold/10 [&.active]:text-gold"
          >
            <Calendar className="w-4 h-4" />
            Calendar
          </Link>

          {isOwner && (
            <Link
              to="/admin/users"
              className="flex items-center gap-3 px-4 py-3 rounded-md text-sm text-muted-foreground hover:text-white hover:bg-white/5 transition-colors [&.active]:bg-gold/10 [&.active]:text-gold"
            >
              <Users className="w-4 h-4" />
              Users
            </Link>
          )}
        </nav>

        <div className="p-4 border-t border-border">
          <div className="mb-4 px-2">
            <div className="text-sm font-medium">{profile?.email}</div>
            <div className="text-xs text-muted-foreground capitalize">{profile?.role}</div>
          </div>
          <button
            onClick={() => {
              logout();
              router.navigate({ to: "/admin/login" });
            }}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-border rounded-md text-sm hover:bg-white/5 transition-colors text-red-400 hover:text-red-300"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Header */}
        <header className="h-16 border-b border-border bg-card flex items-center px-6 md:hidden justify-between">
          <span className="font-display text-lg gold-text tracking-widest uppercase">Admin</span>
          <button onClick={logout} className="p-2 text-red-400">
            <LogOut className="w-5 h-5" />
          </button>
        </header>

        <div className="flex-1 overflow-auto p-6 md:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
