import { useEffect, useState, useCallback, useRef } from "react";
import { toast } from "sonner";
import { Bell, Volume2, MessageSquare, Check, Clock } from "lucide-react";
import { playAlarm, stopAlarm } from "@/lib/audio";
import { useApi } from "@/lib/api";

interface Memory {
  name: string;
  location: string;
}

interface Reminder {
  id: string;
  reminderDate: string;
  completed: boolean;
  memory: Memory;
}

export type ReminderPref = "notification" | "alarm" | "both";

export default function ReminderNotifier() {
  const apiFetch = useApi();
  const [ringingReminder, setRingingReminder] = useState<Reminder | null>(null);
  const [pref, setPref] = useState<ReminderPref>("both");
  const activeTimeouts = useRef<any[]>([]);

  // Load notification settings preference from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedPref = localStorage.getItem("memoryvault-reminder-pref") as ReminderPref;
      if (savedPref) {
        setPref(savedPref);
      }
    }
  }, []);

  // Request browser notification permissions
  const requestNotificationPermission = async () => {
    if (typeof window !== "undefined" && "Notification" in window) {
      if (Notification.permission === "default") {
        const permission = await Notification.requestPermission();
        if (permission === "granted") {
          toast.success("Desktop notifications enabled successfully!");
        } else {
          toast.error("Notification permission denied.");
        }
      }
    }
  };

  // Change preference handler
  const handlePrefChange = async (newPref: ReminderPref) => {
    setPref(newPref);
    localStorage.setItem("memoryvault-reminder-pref", newPref);
    toast.success(`Reminder style set to: ${
      newPref === "both" ? "Alarm + Desktop Notification" : newPref === "alarm" ? "Sound Alarm Only" : "Desktop Notification Only"
    }`);

    if ((newPref === "notification" || newPref === "both") && typeof window !== "undefined" && "Notification" in window) {
      if (Notification.permission !== "granted") {
        await requestNotificationPermission();
      }
    }
  };

  // Trigger notification / Alarm when a reminder is due
  const triggerReminder = useCallback((reminder: Reminder) => {
    setRingingReminder(reminder);

    // 1. Send HTML5 Web Notification if enabled
    if ((pref === "notification" || pref === "both") && typeof window !== "undefined" && "Notification" in window) {
      if (Notification.permission === "granted") {
        new Notification(`MemoryVault: ${reminder.memory.name}`, {
          body: `Reminder: Check on this item stored at "${reminder.memory.location}".`,
          icon: "/favicon.ico",
          requireInteraction: true,
        });
      }
    }

    // 2. Play Alarm Sound if enabled
    if (pref === "alarm" || pref === "both") {
      playAlarm();
    }
  }, [pref]);

  // Fetch reminders and schedule timers
  const scheduleReminders = useCallback(async () => {
    // Clear any existing timeouts to avoid duplicate timers on re-fetch
    activeTimeouts.current.forEach((t) => clearTimeout(t));
    activeTimeouts.current = [];

    try {
      const res = await apiFetch("/api/reminders");
      if (!res.ok) return;
      const data: Reminder[] = await res.json();

      const now = Date.now();
      
      // Filter for uncompleted reminders
      const upcoming = data.filter((r) => {
        if (r.completed) return false;
        const rTime = new Date(r.reminderDate).getTime();
        // If it's within the past 1 minute or in the future, we schedule it
        return rTime > now - 60000;
      });

      upcoming.forEach((reminder) => {
        const reminderTime = new Date(reminder.reminderDate).getTime();
        const delay = reminderTime - now;

        if (delay <= 0) {
          // If it is due right now, trigger immediately
          triggerReminder(reminder);
        } else {
          // Otherwise, schedule it for the exact future timestamp
          const timeout = setTimeout(() => {
            triggerReminder(reminder);
          }, delay);
          activeTimeouts.current.push(timeout);
        }
      });
    } catch (error) {
      console.error("Failed to schedule reminders:", error);
    }
  }, [triggerReminder, apiFetch]);

  // Set up scanning logic on load, and listen to changes
  useEffect(() => {
    scheduleReminders();

    // Re-check reminders every 60 seconds just in case the browser was asleep
    const interval = setInterval(scheduleReminders, 60000);

    return () => {
      clearInterval(interval);
      activeTimeouts.current.forEach((t) => clearTimeout(t));
    };
  }, [scheduleReminders]);

  // Resolve reminder in the database
  const handleResolve = async () => {
    if (!ringingReminder) return;
    
    try {
      const res = await apiFetch(`/api/reminders/${ringingReminder.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: true }),
      });

      if (res.ok) {
        toast.success("Reminder marked as completed!");
        stopAlarm();
        setRingingReminder(null);
        // Reschedule other upcoming reminders
        scheduleReminders();
      } else {
        toast.error("Failed to update reminder status");
      }
    } catch (e) {
      console.error(e);
      toast.error("Failed to connect to database");
    }
  };

  // Snooze reminder for 5 minutes
  const handleSnooze = () => {
    if (!ringingReminder) return;
    
    stopAlarm();
    toast.success("Reminder snoozed for 5 minutes.");
    
    // Schedule a new local timeout for 5 minutes (300,000 ms)
    const snoozeTimeout = setTimeout(() => {
      triggerReminder(ringingReminder);
    }, 5 * 60 * 1000);
    
    activeTimeouts.current.push(snoozeTimeout);
    setRingingReminder(null);
  };

  return (
    <>
      {/* Global Preference Toggle rendered in header of Sidebar layout */}
      <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-300">
        <span className="text-slate-500 font-medium hidden sm:inline">Notification Style:</span>
        <button
          onClick={() => handlePrefChange("alarm")}
          className={`px-2 py-0.5 rounded-md font-semibold transition-all cursor-pointer flex items-center gap-1 ${
            pref === "alarm" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-slate-255"
          }`}
          title="Sound Alarm Only"
        >
          <Volume2 className="h-3.5 w-3.5" />
          Alarm
        </button>
        <button
          onClick={() => handlePrefChange("notification")}
          className={`px-2 py-0.5 rounded-md font-semibold transition-all cursor-pointer flex items-center gap-1 ${
            pref === "notification" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-slate-255"
          }`}
          title="Desktop Notification Only"
        >
          <MessageSquare className="h-3.5 w-3.5" />
          Push
        </button>
        <button
          onClick={() => handlePrefChange("both")}
          className={`px-2 py-0.5 rounded-md font-semibold transition-all cursor-pointer flex items-center gap-1 ${
            pref === "both" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-slate-255"
          }`}
          title="Both Alarm & Push"
        >
          <Bell className="h-3.5 w-3.5" />
          Both
        </button>
      </div>

      {/* Ringing Alarm Dialog Alert */}
      {ringingReminder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-[420px] bg-slate-950 border border-red-500/25 text-slate-100 rounded-2xl p-6 shadow-2xl shadow-red-500/5 text-center">
            <div className="flex flex-col items-center justify-center space-y-3 pb-3">
              <div className="w-14 h-14 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center animate-bounce">
                <Bell className="h-7 w-7 text-red-400" />
              </div>
              <h3 className="text-xl font-bold text-red-400 flex items-center justify-center gap-2">
                Memory Reminder Active!
              </h3>
            </div>

            <div className="space-y-4 py-2">
              <div className="space-y-1">
                <span className="text-xs text-slate-500 uppercase tracking-wider font-bold">Item Name</span>
                <p className="text-lg font-extrabold text-white">{ringingReminder.memory.name}</p>
              </div>
              
              <div className="space-y-1">
                <span className="text-xs text-slate-500 uppercase tracking-wider font-bold">Storage Location</span>
                <p className="text-sm font-semibold text-slate-200">{ringingReminder.memory.location}</p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-400 leading-relaxed mt-2">
                ⏰ Reminder time: <span className="font-semibold text-indigo-400">{new Date(ringingReminder.reminderDate).toLocaleString()}</span>
              </div>
            </div>

            <div className="pt-6 gap-2 flex flex-col sm:flex-row w-full mt-4 border-t border-slate-900">
              <button
                type="button"
                className="flex-1 px-4 py-2.5 text-sm font-semibold rounded-xl border border-slate-800 text-slate-400 hover:bg-slate-900 hover:text-white transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                onClick={handleSnooze}
              >
                <Clock className="h-4 w-4" />
                Snooze (5m)
              </button>
              <button
                type="button"
                className="flex-1 px-4 py-2.5 text-sm font-semibold rounded-xl bg-red-600 hover:bg-red-500 text-white font-medium shadow-md shadow-red-500/10 transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                onClick={handleResolve}
              >
                <Check className="h-4 w-4" />
                Mark Completed
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
