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
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Tabs Switcher */}
      <div className="flex border-b border-slate-900 pb-px">
        <button
          onClick={() => setActiveTab("active")}
          className={`px-6 py-3.5 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === "active"
              ? "border-indigo-500 text-indigo-400"
              : "border-transparent text-slate-500 hover:text-slate-300"
          }`}
        >
          <Clock className="h-4 w-4" />
          Upcoming Reminders
          <span className="ml-1 text-[10px] px-1.5 py-0.5 rounded-full bg-slate-900 text-slate-400 font-bold">
            {reminders.filter((r) => !r.completed).length}
          </span>
        </button>
        <button
          onClick={() => setActiveTab("completed")}
          className={`px-6 py-3.5 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === "completed"
              ? "border-indigo-500 text-indigo-400"
              : "border-transparent text-slate-500 hover:text-slate-300"
          }`}
        >
          <CheckCircle2 className="h-4 w-4" />
          Completed History
          <span className="ml-1 text-[10px] px-1.5 py-0.5 rounded-full bg-slate-900 text-slate-400 font-bold">
            {reminders.filter((r) => r.completed).length}
          </span>
        </button>
      </div>

      {/* Main List */}
      <div className="bg-slate-900/10 border border-slate-800 rounded-2xl">
        <div className="p-6 pb-3 border-b border-slate-900">
          <h3 className="text-base font-bold text-white">
            {activeTab === "active" ? "Pending Reminder Schedules" : "Completed History log"}
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            {activeTab === "active"
              ? "Keep track of physical inventory renewals, warranties, and maintenance tasks."
              : "Historical record of reminders you have resolved."}
          </p>
        </div>
        
        <div>
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
            </div>
          ) : filteredReminders.length === 0 ? (
            <div className="text-center py-20 text-slate-500">
              <HelpCircle className="h-10 w-10 mx-auto mb-3 text-slate-700" />
              <p className="text-sm font-semibold text-slate-400">
                No {activeTab === "active" ? "active" : "completed"} reminders found
              </p>
              <p className="text-xs text-slate-600 mt-1 max-w-xs mx-auto">
                {activeTab === "active"
                  ? "Set reminder dates when saving items to catalog them here."
                  : "Resolved reminders will appear in this history tab."}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-900">
              {filteredReminders.map((reminder) => {
                const daysLeft = Math.ceil(
                  (new Date(reminder.reminderDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
                );

                return (
                  <div
                    key={reminder.id}
                    className="p-5 flex items-start gap-4 hover:bg-slate-900/10 transition-colors"
                  >
                    {/* Toggle Button */}
                    <button
                      onClick={() => toggleCompletion(reminder.id, reminder.completed)}
                      className="mt-1 flex-shrink-0 text-slate-600 hover:text-indigo-400 transition-colors cursor-pointer"
                    >
                      {reminder.completed ? (
                        <CheckCircle2 className="h-5.5 w-5.5 text-indigo-500 fill-indigo-500/10" />
                      ) : (
                        <Circle className="h-5.5 w-5.5 hover:scale-105 transition-transform" />
                      )}
                    </button>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <Link
                        to={`/dashboard?search=${encodeURIComponent(reminder.memory.name)}`}
                        className={`text-sm font-bold text-slate-200 hover:text-indigo-400 hover:underline transition-colors block ${
                          reminder.completed ? "line-through text-slate-500" : ""
                        }`}
                      >
                        {reminder.memory.name}
                      </Link>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5 text-slate-600" />
                          {reminder.memory.location}
                        </span>
                        <span className="flex items-center gap-1 text-slate-500">
                          <Calendar className="h-3.5 w-3.5 text-slate-600" />
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
                              ? "bg-red-500/10 text-red-400 border-red-500/20"
                              : daysLeft <= 30
                              ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                              : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
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
