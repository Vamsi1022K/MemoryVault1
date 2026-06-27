import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import {
  Calendar,
  CheckCircle2,
  Clock,
  MapPin,
  HelpCircle,
  Circle,
  Loader2,
} from "lucide-react";
import { useApi } from "@/lib/api";

interface Memory {
  name: string;
  location: string;
}

interface Reminder {
  id: string;
  type: string;
  reminderDate: string;
  completed: boolean;
  memory: Memory;
}

export default function RemindersPage() {
  const apiFetch = useApi();
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"active" | "completed">("active");

  const fetchReminders = async () => {
    setLoading(true);
    try {
      const res = await apiFetch("/api/reminders");
      if (res.ok) {
        const data = await res.json();
        setReminders(data);
      } else {
        toast.error("Failed to load reminders");
      }
    } catch (error) {
      console.error("Error fetching reminders:", error);
      toast.error("Failed to load reminders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReminders();
  }, []);

  const toggleCompletion = async (id: string, currentStatus: boolean) => {
    try {
      const res = await apiFetch(`/api/reminders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: !currentStatus }),
      });

      if (res.ok) {
        toast.success(`Reminder marked as ${!currentStatus ? "completed" : "active"}`);
        // Optimistic UI update
        setReminders((prev) =>
          prev.map((r) => (r.id === id ? { ...r, completed: !currentStatus } : r))
        );
      } else {
        toast.error("Failed to update reminder");
      }
    } catch (error) {
      console.error("Error toggling reminder:", error);
      toast.error("Failed to update reminder");
    }
  };

  const filteredReminders = reminders.filter((r) =>
    activeTab === "active" ? !r.completed : r.completed
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      {/* Tabs Switcher */}
      <div className="flex border-b border-appBorder pb-px">
        <button
          onClick={() => setActiveTab("active")}
          className={`px-6 py-3.5 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === "active"
              ? "border-appPrimary text-appPrimary"
              : "border-transparent text-appTextSecondary hover:text-appTextPrimary"
          }`}
        >
          <Clock className="h-4 w-4" />
          Upcoming Reminders
          <span className="ml-1 text-[10px] px-1.5 py-0.5 rounded-full bg-appMuted text-appTextSecondary font-bold border border-appBorder/50">
            {reminders.filter((r) => !r.completed).length}
          </span>
        </button>
        <button
          onClick={() => setActiveTab("completed")}
          className={`px-6 py-3.5 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === "completed"
              ? "border-appPrimary text-appPrimary"
              : "border-transparent text-appTextSecondary hover:text-appTextPrimary"
          }`}
        >
          <CheckCircle2 className="h-4 w-4" />
          Completed History
          <span className="ml-1 text-[10px] px-1.5 py-0.5 rounded-full bg-appMuted text-appTextSecondary font-bold border border-appBorder/50">
            {reminders.filter((r) => r.completed).length}
          </span>
        </button>
      </div>

      {/* Main List */}
      <div className="bg-white border border-appBorder rounded-2xl shadow-soft">
        <div className="p-6 pb-3 border-b border-appBorder">
          <h3 className="text-base font-bold text-appTextPrimary">
            {activeTab === "active" ? "Pending Reminder Schedules" : "Completed History log"}
          </h3>
          <p className="text-xs text-appTextSecondary mt-1">
            {activeTab === "active"
              ? "Keep track of physical inventory renewals, warranties, and maintenance tasks."
              : "Historical record of reminders you have resolved."}
          </p>
        </div>
        
        <div>
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-appPrimary" />
            </div>
          ) : filteredReminders.length === 0 ? (
            <div className="text-center py-20 text-appTextSecondary bg-white rounded-b-2xl">
              <HelpCircle className="h-10 w-10 mx-auto mb-3 text-appTextSecondary/40" />
              <p className="text-sm font-semibold text-appTextSecondary">
                No {activeTab === "active" ? "active" : "completed"} reminders found
              </p>
              <p className="text-xs text-appTextSecondary/70 mt-1 max-w-xs mx-auto">
                {activeTab === "active"
                  ? "Set reminder dates when saving items to catalog them here."
                  : "Resolved reminders will appear in this history tab."}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-appBorder">
              {filteredReminders.map((reminder) => {
                const daysLeft = Math.ceil(
                  (new Date(reminder.reminderDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
                );

                return (
                  <div
                    key={reminder.id}
                    className="p-5 flex items-start gap-4 hover:bg-appMuted/15 transition-colors first:rounded-t-none last:rounded-b-2xl"
                  >
                    {/* Toggle Button */}
                    <button
                      onClick={() => toggleCompletion(reminder.id, reminder.completed)}
                      className="mt-1 flex-shrink-0 text-appTextSecondary hover:text-appPrimary transition-colors cursor-pointer"
                    >
                      {reminder.completed ? (
                        <CheckCircle2 className="h-5.5 w-5.5 text-appPrimary fill-appPrimary-light" />
                      ) : (
                        <Circle className="h-5.5 w-5.5 hover:scale-105 transition-transform" />
                      )}
                    </button>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <Link
                        to={`/memories?search=${encodeURIComponent(reminder.memory.name)}`}
                        className={`text-sm font-bold text-appTextPrimary hover:text-appPrimary hover:underline transition-colors block ${
                          reminder.completed ? "line-through text-appTextSecondary/60 font-semibold" : ""
                        }`}
                      >
                        {reminder.memory.name}
                      </Link>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-appTextSecondary">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5 text-appTextSecondary/50" />
                          {reminder.memory.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5 text-appTextSecondary/50" />
                          {new Date(reminder.reminderDate).toLocaleString([], { dateStyle: "short", timeStyle: "short" })}
                        </span>
                      </div>
                    </div>

                    {/* Days Left badge (Active tab only) */}
                    {!reminder.completed && (
                      <div className="flex-shrink-0 text-right">
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
                            daysLeft <= 7
                              ? "bg-red-50 text-red-600 border-red-100"
                              : daysLeft <= 30
                              ? "bg-amber-50 text-amber-750 border-amber-100"
                              : "bg-emerald-50 text-emerald-700 border-emerald-100"
                          }`}
                        >
                          {daysLeft < 0
                            ? "Overdue"
                            : daysLeft === 0
                            ? "Today"
                            : daysLeft === 1
                            ? "Tomorrow"
                            : `${daysLeft} days left`}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>

  );
}
