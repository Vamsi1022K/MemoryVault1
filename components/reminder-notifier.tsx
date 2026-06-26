"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { toast } from "sonner";
import { Bell, Volume2, MessageSquare, Check, Clock, ShieldAlert } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { playAlarm, stopAlarm } from "@/lib/audio";

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
  const [ringingReminder, setRingingReminder] = useState<Reminder | null>(null);
  const [pref, setPref] = useState<ReminderPref>("both");
  const activeTimeouts = useRef<NodeJS.Timeout[]>([]);

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
      const res = await fetch("/api/reminders");
      if (!res.ok) return;
      const data: Reminder[] = await res.json();

      const now = Date.now();
      
      // Filter for uncompleted future reminders
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
  }, [triggerReminder]);

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
      const res = await fetch(`/api/reminders/${ringingReminder.id}`, {
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
      <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs">
        <span className="text-slate-500 font-medium">Notification Style:</span>
        <button
          onClick={() => handlePrefChange("alarm")}
          className={`px-2 py-0.5 rounded-md font-semibold transition-all cursor-pointer ${
            pref === "alarm" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-slate-200"
          }`}
          title="Sound Alarm Only"
        >
          <Volume2 className="h-3.5 w-3.5 inline mr-1" />
          Alarm
        </button>
        <button
          onClick={() => handlePrefChange("notification")}
          className={`px-2 py-0.5 rounded-md font-semibold transition-all cursor-pointer ${
            pref === "notification" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-slate-200"
          }`}
          title="Desktop Notification Only"
        >
          <MessageSquare className="h-3.5 w-3.5 inline mr-1" />
          Push
        </button>
        <button
          onClick={() => handlePrefChange("both")}
          className={`px-2 py-0.5 rounded-md font-semibold transition-all cursor-pointer ${
            pref === "both" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-slate-200"
          }`}
          title="Both Alarm & Push"
        >
          <Bell className="h-3.5 w-3.5 inline mr-1" />
          Both
        </button>
      </div>

      {/* Ringing Alarm Dialog Alert */}
      <Dialog open={!!ringingReminder} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-[420px] bg-slate-950 border-red-500/25 border text-slate-100 rounded-2xl p-6 shadow-2xl shadow-red-500/5">
          <DialogHeader className="flex flex-col items-center justify-center text-center space-y-3 pb-3">
            <div className="w-14 h-14 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center animate-bounce">
              <Bell className="h-7 w-7 text-red-400" />
            </div>
            <DialogTitle className="text-xl font-bold text-red-400 flex items-center gap-2">
              Memory Reminder Active!
            </DialogTitle>
          </DialogHeader>

          {ringingReminder && (
            <div className="space-y-4 py-2 text-center">
              <div className="space-y-1">
                <span className="text-xs text-slate-500 uppercase tracking-wider font-bold">Item Name</span>
                <p className="text-lg font-extrabold text-white">{ringingReminder.memory.name}</p>
              </div>
              
              <div className="space-y-1">
                <span className="text-xs text-slate-500 uppercase tracking-wider font-bold">Storage Location</span>
                <p className="text-sm font-semibold text-slate-200">{ringingReminder.memory.location}</p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-850 text-xs text-slate-400 leading-relaxed mt-2">
                ⏰ Reminder time: <span className="font-semibold text-indigo-400">{new Date(ringingReminder.reminderDate).toLocaleString()}</span>
              </div>
            </div>
          )}

          <DialogFooter className="pt-4 gap-2 sm:gap-0 flex flex-col sm:flex-row w-full">
            <Button
              type="button"
              variant="ghost"
              className="flex-1 rounded-xl border border-slate-800 text-slate-400 hover:bg-slate-900 hover:text-white"
              onClick={handleSnooze}
            >
              <Clock className="h-4 w-4 mr-1.5" />
              Snooze (5m)
            </Button>
            <Button
              type="button"
              className="flex-1 rounded-xl bg-red-600 hover:bg-red-500 text-white font-medium shadow-md shadow-red-500/10"
              onClick={handleResolve}
            >
              <Check className="h-4 w-4 mr-1.5" />
              Mark Completed
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
