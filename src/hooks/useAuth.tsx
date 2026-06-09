import { useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { supabase, Profile } from "@/lib/supabase";

export type Permission = {
  view_bookings: boolean;
  manage_bookings: boolean;   // Approve / Decline status
  edit_requests: boolean;     // Edit booking details (name, date, type, etc.)
  delete_requests: boolean;   // Permanently delete a booking
  view_calendar: boolean;
  manage_calendar: boolean;
  manage_users: boolean;
};

// Defaults applied when no explicit permissions object is stored
export const DEFAULT_PERMISSIONS: Record<"owner" | "manager", Permission> = {
  owner: {
    view_bookings:   true,
    manage_bookings: true,
    edit_requests:   true,   // Owners always have edit
    delete_requests: true,   // Owners always have delete
    view_calendar:   true,
    manage_calendar: true,
    manage_users:    true,
  },
  manager: {
    view_bookings:   true,
    manage_bookings: false,  // Must be granted by owner
    edit_requests:   false,  // Must be granted by owner
    delete_requests: false,  // Must be granted by owner
    view_calendar:   true,
    manage_calendar: false,
    manage_users:    false,
  },
};

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [permissions, setPermissions] = useState<Permission | null>(null);
  const [loading, setLoading] = useState(true);

  const isDemo = localStorage.getItem("demo_admin") === "true";

  useEffect(() => {
    if (isDemo) {
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setProfile(null);
        setPermissions(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    const { data, error } = await (supabase as any)
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (!error && data) {
      const p = data as Profile & { permissions?: Permission };
      setProfile(p);

      if (p.permissions && typeof p.permissions === "object") {
        // Merge stored permissions with role defaults so new keys are never undefined
        const defaults = DEFAULT_PERMISSIONS[p.role] ?? DEFAULT_PERMISSIONS.manager;
        setPermissions({ ...defaults, ...(p.permissions as Permission) });
      } else {
        setPermissions(DEFAULT_PERMISSIONS[p.role] ?? DEFAULT_PERMISSIONS.manager);
      }
    }
    setLoading(false);
  };

  const logout = async () => {
    if (isDemo) {
      localStorage.removeItem("demo_admin");
      return;
    }
    await supabase.auth.signOut();
  };

  if (isDemo) {
    const loggedInEmail = localStorage.getItem("demo_logged_in_email") || "admin@safconventiongroup.com";
    
    // Attempt to load from demo_profiles if it's a dynamically created user
    let role: "owner" | "manager" = "owner";
    let perms = DEFAULT_PERMISSIONS.owner;
    
    if (loggedInEmail !== "admin@safconventiongroup.com") {
      try {
        const local = JSON.parse(localStorage.getItem("demo_profiles") || "[]");
        const matched = local.find((p: any) => p.email === loggedInEmail);
        if (matched) {
          role = matched.role as "owner" | "manager";
          perms = matched.permissions || (role === "owner" ? DEFAULT_PERMISSIONS.owner : DEFAULT_PERMISSIONS.manager);
        }
      } catch(e) {}
    }

    return {
      user: { id: "demo-user-" + loggedInEmail } as any,
      profile: {
        id: "demo-user-" + loggedInEmail,
        email: loggedInEmail,
        role: role,
        created_at: new Date().toISOString(),
      },
      permissions: perms,
      loading: false,
      logout,
      isOwner: role === "owner",
      can: (perm: keyof Permission) => role === "owner" ? true : (perms?.[perm] ?? false),
    };
  }

  const isOwner = profile?.role === "owner";

  // Owners always pass every permission check; managers use their stored grants
  const can = (perm: keyof Permission): boolean => {
    if (isOwner) return true;
    return permissions?.[perm] ?? false;
  };

  return { user, profile, permissions, loading, logout, isOwner, can };
}
