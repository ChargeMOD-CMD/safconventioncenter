import { createFileRoute, redirect } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase, Profile } from "@/lib/supabase";
import { Shield, ShieldAlert, Trash2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/admin/users")({
  component: UsersManagement,
});

function UsersManagement() {
  const { isOwner, profile: currentUserProfile } = useAuth();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOwner) {
      fetchProfiles();
    }
  }, [isOwner]);

  const fetchProfiles = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setProfiles(data as Profile[]);
    }
    setLoading(false);
  };

  const handleRoleChange = async (id: string, newRole: "owner" | "manager") => {
    if (id === currentUserProfile?.id) {
      alert("You cannot change your own role.");
      return;
    }

    const { error } = await supabase.from("profiles").update({ role: newRole }).eq("id", id);

    if (error) {
      alert("Failed to update role.");
    } else {
      setProfiles((prev) => prev.map((p) => (p.id === id ? { ...p, role: newRole } : p)));
    }
  };

  const handleDelete = async (id: string) => {
    if (id === currentUserProfile?.id) {
      alert("You cannot delete your own profile.");
      return;
    }

    if (
      !confirm(
        "Are you sure you want to remove this user? They will lose access to the admin portal.",
      )
    )
      return;

    // Note: This only deletes the profile. To delete the auth user fully,
    // it requires the Supabase Service Role key (backend only).
    // Deleting the profile is often enough to remove access if RLS relies on it.
    const { error } = await supabase.from("profiles").delete().eq("id", id);

    if (error) {
      alert("Failed to delete profile.");
    } else {
      setProfiles((prev) => prev.filter((p) => p.id !== id));
    }
  };

  if (!isOwner) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center">
        <ShieldAlert className="w-16 h-16 text-red-500 mb-4 opacity-50" />
        <h2 className="text-xl font-display text-white mb-2">Access Denied</h2>
        <p className="text-muted-foreground text-sm max-w-md">
          Only Owners have permission to view and manage users. If you need access, please contact
          the system administrator.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="font-display text-3xl">User Management</h1>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-soft">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-background/50 border-b border-border">
              <tr>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Joined</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-8 text-center text-muted-foreground animate-pulse"
                  >
                    Loading users...
                  </td>
                </tr>
              ) : profiles.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-muted-foreground">
                    No users found.
                  </td>
                </tr>
              ) : (
                profiles.map((profile) => (
                  <tr
                    key={profile.id}
                    className="border-b border-border hover:bg-white/5 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="font-medium text-white flex items-center gap-2">
                        {profile.email}
                        {profile.id === currentUserProfile?.id && (
                          <span className="text-[10px] bg-gold/20 text-gold px-2 py-0.5 rounded-full uppercase tracking-wider">
                            You
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={profile.role}
                        onChange={(e) =>
                          handleRoleChange(profile.id, e.target.value as "owner" | "manager")
                        }
                        disabled={profile.id === currentUserProfile?.id}
                        className="bg-background border border-border text-white text-xs rounded-md focus:ring-gold focus:border-gold block p-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <option value="manager">Manager</option>
                        <option value="owner">Owner</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {new Date(profile.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDelete(profile.id)}
                        disabled={profile.id === currentUserProfile?.id}
                        className="p-2 text-red-400 hover:bg-red-500/20 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Remove User"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
        <p className="text-sm text-blue-200">
          <strong>Note:</strong> To add new users, have them sign up via the Supabase Auth endpoint
          or create them in the Supabase Dashboard. They will automatically appear here as 'Manager'
          until you change their role.
        </p>
      </div>
    </div>
  );
}
