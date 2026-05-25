import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase, Booking } from "@/lib/supabase";
import { sendBookingEmail } from "@/lib/email";
import { format } from "date-fns";
import { Check, X } from "lucide-react";

export const Route = createFileRoute("/admin/")({
  component: Dashboard,
});

function Dashboard() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("bookings")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setBookings(data as Booking[]);
    }
    setLoading(false);
  };

  const handleUpdateStatus = async (id: string, newStatus: "approved" | "declined") => {
    // 1. Update in Supabase
    const { error } = await supabase.from("bookings").update({ status: newStatus }).eq("id", id);

    if (error) {
      alert("Failed to update booking status.");
      return;
    }

    // 2. Update local state
    setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, status: newStatus } : b)));

    // 3. Send Email
    const booking = bookings.find((b) => b.id === id);
    if (booking) {
      await sendBookingEmail(booking.email, booking.first_name, newStatus, booking.event_date);
    }
  };

  if (loading) {
    return <div className="text-white/50 animate-pulse">Loading bookings...</div>;
  }

  return (
    <div>
      <h1 className="font-display text-3xl mb-8">Booking Requests</h1>

      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-soft">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-background/50 border-b border-border">
              <tr>
                <th className="px-6 py-4">Client</th>
                <th className="px-6 py-4">Event Type</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Guests</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {bookings.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
                    No bookings found.
                  </td>
                </tr>
              ) : (
                bookings.map((booking) => (
                  <tr
                    key={booking.id}
                    className="border-b border-border hover:bg-white/5 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="font-medium text-white">
                        {booking.first_name} {booking.last_name}
                      </div>
                      <div className="text-xs text-muted-foreground">{booking.email}</div>
                      <div className="text-xs text-muted-foreground">{booking.phone}</div>
                    </td>
                    <td className="px-6 py-4 capitalize">{booking.event_type}</td>
                    <td className="px-6 py-4 font-medium">
                      {format(new Date(booking.event_date), "MMM dd, yyyy")}
                    </td>
                    <td className="px-6 py-4">{booking.expected_guests || "N/A"}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${
                          booking.status === "approved"
                            ? "bg-green-500/10 text-green-400"
                            : booking.status === "declined"
                              ? "bg-red-500/10 text-red-400"
                              : "bg-yellow-500/10 text-yellow-400"
                        }`}
                      >
                        {booking.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {booking.status === "pending" && (
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleUpdateStatus(booking.id, "approved")}
                            className="p-2 bg-green-500/10 text-green-400 hover:bg-green-500/20 rounded-md transition-colors"
                            title="Approve"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(booking.id, "declined")}
                            className="p-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-md transition-colors"
                            title="Decline"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
