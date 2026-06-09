import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase, Profile } from "@/lib/supabase";
import { Shield, ShieldAlert, Trash2, UserPlus, X, Mail, Check, Copy, Save, AlertCircle } from "lucide-react";
import { useAuth, type Permission, DEFAULT_PERMISSIONS } from "@/hooks/useAuth";

export const Route = createFileRoute("/admin/users")({
  component: UsersManagement,
});

type ExtendedProfile = Profile & {
  permissions?: Permission;
  _saving?: boolean;
  _savedAt?: number;
};

function UsersManagement() {
  const { isOwner, profile: currentUserProfile } = useAuth();
  const [profiles, setProfiles] = useState<ExtendedProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInvite, setShowInvite] = useState(false);
  const [expandedUser, setExpandedUser] = useState<string | null>(null);

  useEffect(() => {
    if (isOwner) fetchProfiles();
  }, [isOwner]);

  const fetchProfiles = async () => {
    setLoading(true);
    const { data, error } = await (supabase as any)
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      const withPerms = (data as (Profile & { permissions?: Permission })[]).map((p) => ({
        ...p,
        // Use stored permissions if present, else fall back to role defaults
        permissions:
          p.permissions && typeof p.permissions === "object"
            ? (p.permissions as Permission)
            : DEFAULT_PERMISSIONS[p.role] ?? DEFAULT_PERMISSIONS.manager,
      }));
      setProfiles(withPerms as ExtendedProfile[]);
    }
    setLoading(false);
  };

  const handleRoleChange = async (id: string, newRole: "owner" | "manager") => {
    if (id === currentUserProfile?.id) {
      alert("You cannot change your own role.");
      return;
    }

    // When role changes, reset permissions to role defaults
    const resetPerms = DEFAULT_PERMISSIONS[newRole];

    const { error } = await (supabase as any)
      .from("profiles")
      .update({ role: newRole, permissions: resetPerms })
      .eq("id", id);

    if (error) {
      alert("Failed to update role.");
    } else {
      setProfiles((prev) =>
        prev.map((p) =>
          p.id === id
            ? { ...p, role: newRole, permissions: resetPerms }
            : p
        )
      );
    }
  };

  const handleDelete = async (id: string) => {
    if (id === currentUserProfile?.id) {
      alert("You cannot delete your own profile.");
      return;
    }
    if (!confirm("Are you sure you want to remove this user? They will lose admin access.")) return;

    const { error } = await (supabase as any).from("profiles").delete().eq("id", id);

    if (error) {
      alert("Failed to delete profile.");
    } else {
      setProfiles((prev) => prev.filter((p) => p.id !== id));
    }
  };

  const handlePermissionToggle = async (userId: string, perm: keyof Permission) => {
    // Optimistic local update
    const targetProfile = profiles.find((p) => p.id === userId);
    if (!targetProfile) return;

    const newPerms: Permission = {
      ...targetProfile.permissions!,
      [perm]: !targetProfile.permissions![perm],
    };

    // Mark as saving
    setProfiles((prev) =>
      prev.map((p) => (p.id === userId ? { ...p, permissions: newPerms, _saving: true } : p))
    );

    // Persist to Supabase — stores permissions as a JSONB column on profiles
    const { error } = await (supabase as any)
      .from("profiles")
      .update({ permissions: newPerms })
      .eq("id", userId);

    if (error) {
      // Roll back on failure
      setProfiles((prev) =>
        prev.map((p) =>
          p.id === userId
            ? { ...p, permissions: targetProfile.permissions, _saving: false }
            : p
        )
      );
      alert("Failed to save permission. Please try again.");
    } else {
      setProfiles((prev) =>
        prev.map((p) =>
          p.id === userId ? { ...p, _saving: false, _savedAt: Date.now() } : p
        )
      );
      // Clear the saved indicator after 2s
      setTimeout(() => {
        setProfiles((prev) =>
          prev.map((p) => (p.id === userId ? { ...p, _savedAt: undefined } : p))
        );
      }, 2000);
    }
  };

  if (!isOwner) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-4">
          <ShieldAlert className="w-8 h-8 text-red-400" />
        </div>
        <h2 className="text-xl font-display text-white mb-2">Access Denied</h2>
        <p className="text-sm text-white/40 max-w-md">
          Only Owners can view and manage users. Contact your system administrator for access.
        </p>
      </div>
    );
  }

  const PERM_LABELS: Record<keyof Permission, { label: string; desc: string; key: string }> = {
    view_bookings:   { label: "View Bookings",      desc: "Can see all booking requests",              key: "📋" },
    manage_bookings: { label: "Manage Requests",    desc: "Can approve / decline booking status",      key: "✅" },
    edit_requests:   { label: "Edit Requests",      desc: "Can edit booking details (name, date, etc.)", key: "✏️" },
    delete_requests: { label: "Delete Requests",    desc: "Can permanently delete bookings",           key: "🗑️" },
    view_calendar:   { label: "View Calendar",      desc: "Can see the availability calendar",         key: "📅" },
    manage_calendar: { label: "Manage Calendar",    desc: "Can set dates as booked / available",       key: "🗓️" },
    manage_users:    { label: "Manage Users",       desc: "Can invite and remove team members",        key: "👥" },
  };

  return (
    <div className="max-w-5xl space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl text-white">User Management</h1>
          <p className="text-xs text-white/30 mt-1">
            Add users one by one and set their individual permissions
          </p>
        </div>
        <button
          onClick={() => setShowInvite((v) => !v)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-gold text-black rounded-lg text-sm font-medium hover:bg-gold/90 transition-colors"
        >
          <UserPlus className="w-4 h-4" />
          Invite User
        </button>
      </div>

      {/* Invite Panel */}
      {showInvite && (
        <InvitePanel
          onClose={() => setShowInvite(false)}
          onInvited={fetchProfiles}
        />
      )}

      {/* User Cards */}
      <div className="space-y-3">
        {loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-20 rounded-xl border border-white/8 animate-pulse bg-white/3" />
            ))}
          </div>
        ) : profiles.length === 0 ? (
          <div className="rounded-xl border border-white/8 p-12 text-center"
            style={{ background: "oklch(0.15 0.018 240)" }}>
            <UserPlus className="w-10 h-10 text-white/15 mx-auto mb-3" />
            <p className="text-sm text-white/30">No users yet. Invite your first team member.</p>
          </div>
        ) : (
          profiles.map((profile) => {
            const isExpanded = expandedUser === profile.id;
            const isSelf = profile.id === currentUserProfile?.id;

            return (
              <div
                key={profile.id}
                className="rounded-xl border border-white/8 overflow-hidden transition-all"
                style={{ background: "oklch(0.15 0.018 240)" }}
              >
                {/* User Row */}
                <div className="flex items-center gap-4 p-4">
                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gold/25 to-gold/10 border border-gold/25 flex items-center justify-center shrink-0">
                    <span className="text-gold text-sm font-bold uppercase">
                      {(profile.email || "U")[0]}
                    </span>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium text-white/90 truncate">
                        {profile.email}
                      </span>
                      {isSelf && (
                        <span className="text-[10px] bg-gold/15 text-gold border border-gold/25 px-1.5 py-0.5 rounded-full tracking-wider uppercase">
                          You
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-white/35">
                        Joined {new Date(profile.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {/* Role Select */}
                  <select
                    value={profile.role}
                    onChange={(e) =>
                      handleRoleChange(profile.id, e.target.value as "owner" | "manager")
                    }
                    disabled={isSelf}
                    className="text-xs bg-white/5 border border-white/15 text-white/70 rounded-lg px-3 py-2 focus:border-gold outline-none disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <option value="manager">Manager</option>
                    <option value="owner">Owner</option>
                  </select>

                  {/* Role badge */}
                  <span
                    className={`hidden sm:inline-flex text-[11px] px-2.5 py-1 rounded-full border font-medium capitalize ${
                      profile.role === "owner"
                        ? "bg-gold/10 text-gold border-gold/25"
                        : "bg-white/5 text-white/50 border-white/10"
                    }`}
                  >
                    {profile.role}
                  </span>

                  {/* Expand permissions */}
                  <button
                    onClick={() => setExpandedUser(isExpanded ? null : profile.id)}
                    className="p-2 rounded-lg text-white/30 hover:text-white hover:bg-white/8 transition-colors text-xs flex items-center gap-1"
                    title="Edit Permissions"
                  >
                    <Shield className="w-4 h-4" />
                    <span className="hidden sm:inline text-[11px]">Permissions</span>
                  </button>

                  {/* Delete */}
                  {!isSelf && (
                    <button
                      onClick={() => handleDelete(profile.id)}
                      className="p-2 rounded-lg text-red-400/50 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                      title="Remove User"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Permissions Panel */}
                {isExpanded && (
                  <div className="border-t border-white/8 px-4 py-5"
                    style={{ background: "oklch(0.12 0.015 240)" }}>
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-[10px] text-white/30 uppercase tracking-widest">
                        Permissions — {profile.email}
                      </p>
                      {profile._saving && (
                        <span className="text-[10px] text-white/30 flex items-center gap-1 animate-pulse">
                          <Save className="w-3 h-3" /> Saving…
                        </span>
                      )}
                      {!profile._saving && profile._savedAt && (
                        <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                          <Check className="w-3 h-3" /> Saved
                        </span>
                      )}
                    </div>

                    {isSelf && (
                      <div className="mb-4 flex items-start gap-2 p-3 rounded-lg bg-gold/8 border border-gold/20">
                        <AlertCircle className="w-4 h-4 text-gold shrink-0 mt-0.5" />
                        <p className="text-[11px] text-gold/80">
                          Your own permissions cannot be edited here. As an Owner, you have full access.
                        </p>
                      </div>
                    )}

                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {(Object.keys(PERM_LABELS) as (keyof Permission)[]).map((perm) => {
                        const active = profile.permissions?.[perm] ?? false;
                        const { label, desc, key } = PERM_LABELS[perm];
                        const isOwnerPerm = profile.role === "owner";
                        const disabled = isSelf || isOwnerPerm || !!profile._saving;
                        return (
                          <button
                            key={perm}
                            onClick={() => !disabled && handlePermissionToggle(profile.id, perm)}
                            disabled={disabled}
                            className={`flex items-start gap-3 p-3 rounded-lg border text-left transition-all duration-200 ${
                              active
                                ? "border-gold/30 bg-gold/10"
                                : "border-white/8 bg-white/3"
                            } ${
                              disabled
                                ? "opacity-50 cursor-not-allowed"
                                : "cursor-pointer hover:border-white/20"
                            }`}
                          >
                            {/* Checkbox */}
                            <div
                              className={`mt-0.5 w-4 h-4 rounded flex items-center justify-center shrink-0 border transition-colors ${
                                active
                                  ? "bg-gold border-gold"
                                  : "bg-transparent border-white/25"
                              }`}
                            >
                              {active && <Check className="w-2.5 h-2.5 text-black" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className={`text-xs font-medium ${ active ? "text-gold" : "text-white/60" }`}>
                                {label}
                              </div>
                              <div className="text-[10px] text-white/30 mt-0.5 leading-relaxed">{desc}</div>
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    {!isSelf && profile.role !== "owner" && (
                      <p className="text-[10px] text-white/25 mt-4 flex items-center gap-1.5">
                        <Save className="w-3 h-3" />
                        Changes are saved automatically to the database.
                      </p>
                    )}
                    {profile.role === "owner" && !isSelf && (
                      <p className="text-[10px] text-white/30 mt-4 flex items-center gap-1.5">
                        <AlertCircle className="w-3 h-3 text-gold/50" />
                        Owners always have full permissions. Change their role to Manager to restrict access.
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

function InvitePanel({
  onClose,
  onInvited,
}: {
  onClose: () => void;
  onInvited: () => void;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"manager" | "owner">("manager");
  const [permissions, setPermissions] = useState<Permission>(DEFAULT_PERMISSIONS.manager);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const generatePassword = () => {
    const generatedPass = Math.random().toString(36).slice(-8) + "SAF@" + Math.floor(Math.random() * 90 + 10);
    setPassword(generatedPass);
  };

  const handlePermissionToggle = (perm: keyof Permission) => {
    setPermissions((prev) => ({ ...prev, [perm]: !prev[perm] }));
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      setResult({ type: "error", message: "Please enter or generate a password." });
      return;
    }
    
    setLoading(true);
    setResult(null);

    try {
      // Sign up the user via Supabase auth
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { role },
        },
      });

      if (error) throw error;

      if (data.user) {
        // Insert into profiles table with permissions
        await (supabase as any).from("profiles").upsert({
          id: data.user.id,
          email,
          role,
          permissions: role === "owner" ? DEFAULT_PERMISSIONS.owner : permissions,
          created_at: new Date().toISOString(),
        });

        setResult({
          type: "success",
          message: `User ${email} created successfully as ${role}.`,
        });
        setEmail("");
        setPassword("");
        onInvited();
      }
    } catch (err: any) {
      setResult({ type: "error", message: err.message || "Failed to create user." });
    } finally {
      setLoading(false);
    }
  };

  const PERM_LABELS: Record<keyof Permission, { label: string; desc: string }> = {
    view_bookings:   { label: "View Bookings",      desc: "Can see all requests" },
    manage_bookings: { label: "Manage Requests",    desc: "Approve / decline status" },
    edit_requests:   { label: "Edit Requests",      desc: "Edit booking details" },
    delete_requests: { label: "Delete Requests",    desc: "Permanently delete" },
    view_calendar:   { label: "View Calendar",      desc: "See the calendar" },
    manage_calendar: { label: "Manage Calendar",    desc: "Mark dates booked/available" },
    manage_users:    { label: "Manage Users",       desc: "Invite/remove members" },
  };

  return (
    <div className="rounded-xl border border-gold/20 p-6 relative"
      style={{ background: "oklch(0.15 0.018 240)" }}>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-base font-medium text-white">Create New User</h2>
          <p className="text-xs text-white/35 mt-0.5">Add a team member and specify permissions</p>
        </div>
        <button onClick={onClose} className="p-1 rounded text-white/30 hover:text-white transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>

      {result && (
        <div
          className={`mb-4 p-3 rounded-lg text-sm border ${
            result.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
              : "bg-red-500/10 border-red-500/20 text-red-400"
          }`}
        >
          {result.message}
        </div>
      )}

      <form onSubmit={handleInvite} className="space-y-6">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="text-[10px] uppercase tracking-widest text-white/35 font-medium block mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25 pointer-events-none" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="colleague@example.com"
                className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white/80 placeholder:text-white/25 outline-none focus:border-gold transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] uppercase tracking-widest text-white/35 font-medium block mb-2">
              Password
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Enter or generate password"
                className="flex-1 px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white/80 placeholder:text-white/25 outline-none focus:border-gold transition-colors"
              />
              <button
                type="button"
                onClick={generatePassword}
                className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs font-medium text-white/70 transition-colors whitespace-nowrap"
              >
                Generate
              </button>
            </div>
          </div>
        </div>

        <div>
          <label className="text-[10px] uppercase tracking-widest text-white/35 font-medium block mb-2">
            Role
          </label>
          <div className="grid grid-cols-2 gap-3">
            {(["manager", "owner"] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRole(r)}
                className={`p-3 rounded-lg border text-sm transition-all text-left ${
                  role === r
                    ? "border-gold/30 bg-gold/10 text-gold"
                    : "border-white/10 bg-white/3 text-white/50 hover:border-white/20"
                }`}
              >
                <div className="font-medium capitalize">{r}</div>
                <div className="text-[10px] mt-0.5 opacity-70">
                  {r === "owner"
                    ? "Full access including users"
                    : "Customizable permissions below"}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Permissions Selection */}
        {role === "manager" && (
          <div>
            <label className="text-[10px] uppercase tracking-widest text-white/35 font-medium block mb-3">
              Specify Permissions
            </label>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {(Object.keys(PERM_LABELS) as (keyof Permission)[]).map((perm) => {
                const active = permissions[perm];
                const { label, desc } = PERM_LABELS[perm];
                return (
                  <button
                    key={perm}
                    type="button"
                    onClick={() => handlePermissionToggle(perm)}
                    className={`flex items-start gap-3 p-3 rounded-lg border text-left transition-all duration-200 cursor-pointer ${
                      active
                        ? "border-gold/30 bg-gold/10"
                        : "border-white/8 bg-white/3 hover:border-white/20"
                    }`}
                  >
                    <div
                      className={`mt-0.5 w-4 h-4 rounded flex items-center justify-center shrink-0 border transition-colors ${
                        active ? "bg-gold border-gold" : "bg-transparent border-white/25"
                      }`}
                    >
                      {active && <Check className="w-2.5 h-2.5 text-black" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className={`text-xs font-medium ${active ? "text-gold" : "text-white/60"}`}>
                        {label}
                      </div>
                      <div className="text-[10px] text-white/30 mt-0.5 leading-relaxed">{desc}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 py-3 bg-gold text-black rounded-lg text-sm font-medium hover:bg-gold/90 disabled:opacity-50 transition-colors"
        >
          <UserPlus className="w-4 h-4" />
          {loading ? "Creating User…" : "Create User"}
        </button>
      </form>
    </div>
  );
}
