import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase, CalendarDate } from "@/lib/supabase";
import { format } from "date-fns";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";

export const Route = createFileRoute("/admin/calendar")({
  component: AdminCalendar,
});

function AdminCalendar() {
  const [dates, setDates] = useState<CalendarDate[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDates();
  }, []);

  const fetchDates = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("calendar_dates").select("*");

    if (!error && data) {
      setDates(data as CalendarDate[]);
    }
    setLoading(false);
  };

  const selectedDateStr = selectedDate ? format(selectedDate, "yyyy-MM-dd") : "";
  const existingRecord = dates.find((d) => d.date === selectedDateStr);

  const handleUpdateStatus = async (status: "pending" | "approved" | "declined") => {
    if (!selectedDateStr) return;

    // Supabase handles 'insert or update' if we use upsert
    const { error } = await supabase.from("calendar_dates").upsert({
      date: selectedDateStr,
      status: status,
    });

    if (error) {
      alert("Failed to update calendar date.");
    } else {
      setDates((prev) => {
        const filtered = prev.filter((d) => d.date !== selectedDateStr);
        return [
          ...filtered,
          {
            date: selectedDateStr,
            status,
            note: null,
            updated_by: null,
            updated_at: new Date().toISOString(),
          },
        ];
      });
    }
  };

  const handleDeleteStatus = async () => {
    if (!selectedDateStr || !existingRecord) return;

    const { error } = await supabase.from("calendar_dates").delete().eq("date", selectedDateStr);

    if (error) {
      alert("Failed to clear calendar date.");
    } else {
      setDates((prev) => prev.filter((d) => d.date !== selectedDateStr));
    }
  };

  // Custom styling for DayPicker
  const modifiers = {
    booked: dates.filter((d) => d.status === "approved").map((d) => new Date(d.date)),
    pending: dates.filter((d) => d.status === "pending").map((d) => new Date(d.date)),
    unavailable: dates.filter((d) => d.status === "declined").map((d) => new Date(d.date)),
  };

  const modifiersStyles = {
    booked: {
      backgroundColor: "rgba(239, 68, 68, 0.2)",
      color: "#f87171",
      border: "1px solid rgba(239, 68, 68, 0.5)",
    }, // Red
    pending: {
      backgroundColor: "rgba(234, 179, 8, 0.2)",
      color: "#facc15",
      border: "1px solid rgba(234, 179, 8, 0.5)",
    }, // Yellow
    unavailable: { backgroundColor: "#333", color: "#999", textDecoration: "line-through" },
  };

  return (
    <div>
      <h1 className="font-display text-3xl mb-8">Calendar Management</h1>

      <div className="grid md:grid-cols-2 gap-8 items-start">
        {/* Calendar View */}
        <div className="bg-card border border-border p-6 rounded-xl shadow-soft flex justify-center">
          <style>{`
            .rdp { --rdp-cell-size: 45px; --rdp-accent-color: #D4AF37; --rdp-background-color: rgba(212, 175, 55, 0.1); margin: 0; }
            .rdp-day_selected { font-weight: bold; background-color: rgba(212, 175, 55, 0.2); border: 1px solid #D4AF37; }
            .rdp-day:hover:not(.rdp-day_outside) { background-color: rgba(255,255,255,0.1); }
          `}</style>
          {loading ? (
            <div className="h-[350px] flex items-center justify-center text-muted-foreground animate-pulse">
              Loading calendar...
            </div>
          ) : (
            <DayPicker
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              modifiers={modifiers}
              modifiersStyles={modifiersStyles}
              className="font-sans text-white/90"
            />
          )}
        </div>

        {/* Date Details & Actions */}
        <div className="bg-card border border-border p-6 rounded-xl shadow-soft">
          <h2 className="font-display text-xl mb-6">
            {selectedDate ? format(selectedDate, "MMMM do, yyyy") : "Select a date"}
          </h2>

          {selectedDate ? (
            <div className="space-y-6">
              <div>
                <p className="text-sm text-muted-foreground mb-2">Current Status:</p>
                <div className="inline-flex items-center gap-2">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${
                      !existingRecord
                        ? "bg-green-500/10 text-green-400"
                        : existingRecord.status === "approved"
                          ? "bg-red-500/10 text-red-400"
                          : existingRecord.status === "pending"
                            ? "bg-yellow-500/10 text-yellow-400"
                            : "bg-zinc-500/10 text-zinc-400"
                    }`}
                  >
                    {!existingRecord
                      ? "Available"
                      : existingRecord.status === "approved"
                        ? "Booked"
                        : existingRecord.status}
                  </span>
                </div>
              </div>

              <div className="pt-4 border-t border-border">
                <p className="text-sm text-muted-foreground mb-4">Change Status:</p>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => handleUpdateStatus("approved")}
                    className="p-3 bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 rounded-md transition-colors text-sm font-medium"
                  >
                    Mark Booked (Red)
                  </button>
                  <button
                    onClick={() => handleUpdateStatus("pending")}
                    className="p-3 bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 hover:bg-yellow-500/20 rounded-md transition-colors text-sm font-medium"
                  >
                    Mark Pending (Yellow)
                  </button>
                  <button
                    onClick={() => handleDeleteStatus()}
                    disabled={!existingRecord}
                    className="p-3 bg-green-500/10 text-green-400 border border-green-500/20 hover:bg-green-500/20 rounded-md transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed col-span-2"
                  >
                    Clear Status / Mark Available (Green)
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">
              Please select a date from the calendar to view or manage its availability status.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
