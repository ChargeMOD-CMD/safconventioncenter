import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Lock } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import heroVideoMp4 from "@/assets/hero-video.mp4";

export const Route = createFileRoute("/admin/login")({
  component: Login,
});

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const { user } = useAuth();

  // Redirect if already logged in
  if (user) {
    router.navigate({ to: "/admin" });
    return null;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Demo bypass
    if (email === "admin@safconventiongroup.com" && password === "wny3a64@dxu76#") {
      localStorage.setItem("demo_admin", "true");
      router.navigate({ to: "/admin" });
      // Force reload to apply demo state across hooks
      setTimeout(() => window.location.reload(), 100);
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.navigate({ to: "/admin" });
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 relative overflow-hidden">
      {/* Background Video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
      >
        <source src={heroVideoMp4} type="video/mp4" />
      </video>

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50" />

      {/* Background flare */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gold/20 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-md bg-card/60 backdrop-blur-xl border border-white/10 p-8 rounded-xl shadow-royal">
        <div className="flex justify-center mb-6">
          <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center">
            <Lock className="w-5 h-5 text-gold" />
          </div>
        </div>

        <h1 className="font-display text-3xl text-center mb-8 tracking-widest uppercase text-white/90">
          Admin Portal
        </h1>

        <form onSubmit={handleLogin} className="space-y-6">
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-md text-red-400 text-sm text-center">
              {error}
            </div>
          )}

          <div>
            <label className="text-[11px] uppercase tracking-widest text-muted-foreground font-medium">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-2 w-full border border-border bg-background/60 px-4 py-3 text-sm outline-none focus:border-gold transition-colors rounded-md"
            />
          </div>

          <div>
            <label className="text-[11px] uppercase tracking-widest text-muted-foreground font-medium">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-2 w-full border border-border bg-background/60 px-4 py-3 text-sm outline-none focus:border-gold transition-colors rounded-md"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary justify-center mt-2"
          >
            {loading ? "Authenticating..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
