import { useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { supabase, Profile } from "@/lib/supabase";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const isDemo = localStorage.getItem("demo_admin") === "true";

  useEffect(() => {
    if (isDemo) {
      setLoading(false);
      return;
    }
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single();

    if (!error && data) {
      setProfile(data as Profile);
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
    return {
      user: { id: "demo-user" } as any,
      profile: {
        id: "demo-user",
        email: "admin@example.com",
        role: "owner",
        created_at: new Date().toISOString(),
      },
      loading: false,
      logout,
      isOwner: true,
    };
  }

  return { user, profile, loading, logout, isOwner: profile?.role === "owner" };
}
