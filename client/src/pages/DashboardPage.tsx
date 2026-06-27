import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import { Brain, Calendar, Clock, ArrowRight, MapPin, Tag, FolderPlus, BellRing, ShieldCheck } from "lucide-react";
import MemoryDialog from "@/components/MemoryDialog";
import { useApi } from "@/lib/api";

interface Category { id: string; name: string; }
interface Memory {
  id: string; name: string; location: string;
  category: { id: string; name: string }; createdAt: string;
}
interface Reminder {
  id: string; reminderDate: string; completed: boolean;
  memory: { name: string; location: string };
}

export default function DashboardPage() {
  const { user } = useUser();
  const apiFetch = useApi();
  const [stats, setStats] = useState({ totalMemories: 0, upcomingReminders: 0, customCategories: 0 });
  const [recentMemories, setRecentMemories] = useState<Memory[]>([]);
  const [upcomingReminders, setUpcomingReminders] = useState<Reminder[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const [memoriesRes, remindersRes, categoriesRes] = await Promise.all([
          apiFetch("/api/memories"),
          apiFetch("/api/reminders"),
          apiFetch("/api/categories"),
        ]);

        const memories: Memory[] = memoriesRes.ok ? await memoriesRes.json() : [];
        const reminders: Reminder[] = remindersRes.ok ? await remindersRes.json() : [];
        const cats: Category[] = categoriesRes.ok ? await categoriesRes.json() : [];

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const upcoming = reminders.filter(
          (r) => !r.completed && new Date(r.reminderDate) >= today
        ).slice(0, 5);

        const customCats = cats.filter((c: any) => c.isCustom);

        setStats({
          totalMemories: memories.length,
          upcomingReminders: upcoming.length,
          customCategories: customCats.length,
        });
        setRecentMemories(memories.slice(0, 5));
        setUpcomingReminders(upcoming);
        setCategories(cats);
      } catch (err) {
        console.error("Dashboard load error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, [apiFetch]);

  return (
    <div className="space-y-8 animate-fade-in text-appTextPrimary font-sans">
      
      {/* Top Welcome Panel */}
      <div className="bg-white border border-appBorder rounded-xl p-6 shadow-soft flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-appTextPrimary">
            Welcome, {user?.firstName || "Vault Keeper"}
          </h2>
          <p className="text-xs text-appTextSecondary mt-1">
            Keep track of physical belongings, important documents, and expiry alerts in your personal vault.
          </p>
        </div>
        <button
          onClick={() => setDialogOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-appPrimary hover:bg-appPrimary-hover text-white text-xs font-semibold rounded-xl shadow-soft transition-all"
        >
          <Brain className="h-4 w-4" /> Add New Memory
        </button>
      </div>

      {/* Main Grid: Vault Info & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Vault Storage Health */}
        <div className="bg-white border border-appBorder rounded-xl p-5 shadow-soft space-y-4 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-appTextPrimary flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-appSuccess" /> Storage & Vault Health
            </h3>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-50 text-appSuccess border border-emerald-100">
              Optimal Condition
            </span>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-medium">
              <span className="text-appTextSecondary">Vault Space Used</span>
              <span className="text-appTextPrimary font-semibold">{stats.totalMemories} / 100 items</span>
            </div>
            <div className="w-full bg-stone-100 rounded-full h-2">
              <div
                className="bg-appPrimary h-2 rounded-full transition-all duration-500"
                style={{ width: `${Math.min((stats.totalMemories / 100) * 100, 100)}%` }}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-[11px] text-appTextSecondary">
            <div className="p-3 bg-stone-50 rounded-lg border border-appBorder">
              <span className="block font-semibold text-appTextPrimary">{stats.totalMemories}</span>
                  Belongings cataloged
            </div>
            <div className="p-3 bg-stone-50 rounded-lg border border-appBorder">
              <span className="block font-semibold text-appTextPrimary">{stats.upcomingReminders}</span>
                  Active expiry alerts
            </div>
            <div className="p-3 bg-stone-50 rounded-lg border border-appBorder">
              <span className="block font-semibold text-appTextPrimary">{stats.customCategories}</span>
                  Custom classifications
            </div>
          </div>
        </div>

        {/* Quick Actions Panel */}
        <div className="bg-white border border-appBorder rounded-xl p-5 shadow-soft flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-appTextPrimary flex items-center gap-2">
              <FolderPlus className="h-4 w-4 text-appPrimary" /> Quick Actions
            </h3>
            <p className="text-[11px] text-appTextSecondary mt-1">Common tasks inside your vault.</p>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-4">
            <button
              onClick={() => setDialogOpen(true)}
              className="py-2.5 px-3 rounded-lg border border-appBorder bg-white text-appTextPrimary hover:bg-stone-50 transition-colors text-xs font-semibold flex flex-col items-center justify-center gap-1.5"
            >
              <Brain className="h-4 w-4 text-appPrimary" />
              <span>Add Memory</span>
            </button>
            <Link
              to="/categories"
              className="py-2.5 px-3 rounded-lg border border-appBorder bg-white text-appTextPrimary hover:bg-stone-50 transition-colors text-xs font-semibold flex flex-col items-center justify-center gap-1.5"
            >
              <FolderPlus className="h-4 w-4 text-appPrimary" />
              <span>New Category</span>
            </Link>
            <Link
              to="/ai-assistant"
              className="py-2.5 px-3 rounded-lg border border-appBorder bg-white text-appTextPrimary hover:bg-stone-50 transition-colors text-xs font-semibold flex flex-col items-center justify-center gap-1.5"
            >
              <Brain className="h-4 w-4 text-appPrimary" />
              <span>Ask Assistant</span>
            </Link>
            <Link
              to="/storage-advisor"
              className="py-2.5 px-3 rounded-lg border border-appBorder bg-white text-appTextPrimary hover:bg-stone-50 transition-colors text-xs font-semibold flex flex-col items-center justify-center gap-1.5"
            >
              <ShieldCheck className="h-4 w-4 text-appPrimary" />
              <span>Consult Advisor</span>
            </Link>
          </div>
        </div>

      </div>

      {/* Grid: Recent Items & Upcoming Expiries */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Recently Saved */}
        <div className="bg-white border border-appBorder rounded-xl shadow-soft flex flex-col">
          <div className="flex items-center justify-between border-b border-appBorder p-5 pb-4">
            <div>
              <h3 className="text-sm font-bold text-appTextPrimary flex items-center gap-2">
                <Clock className="h-4 w-4 text-appPrimary" /> Recently Saved Items
              </h3>
              <p className="text-[11px] text-appTextSecondary mt-0.5">Quick access to your latest additions</p>
            </div>
            {stats.totalMemories > 0 && (
              <Link to="/memories" className="text-xs font-semibold text-appPrimary hover:text-appPrimary-hover flex items-center gap-1 transition-colors">
                View All <ArrowRight className="h-3 w-3" />
              </Link>
            )}
          </div>
          <div className="flex-1 p-5">
            {loading ? (
              <div className="flex justify-center py-8"><div className="w-5 h-5 border-2 border-appPrimary border-t-transparent rounded-full animate-spin" /></div>
            ) : recentMemories.length === 0 ? (
              <div className="flex flex-col items-center py-8 text-center">
                <Brain className="h-8 w-8 text-appTextSecondary/30 mb-2" />
                <p className="text-xs font-semibold text-appTextSecondary">No memories stored yet</p>
              </div>
            ) : (
              <div className="divide-y divide-appBorder">
                {recentMemories.map((memory) => (
                  <div key={memory.id} className="py-3 flex items-center justify-between first:pt-0 last:pb-0">
                    <div className="flex flex-col min-w-0 pr-4">
                      <Link to={`/memories?search=${encodeURIComponent(memory.name)}`} className="text-xs font-bold text-appTextPrimary hover:text-appPrimary hover:underline transition-colors truncate">
                        {memory.name}
                      </Link>
                      <div className="flex items-center gap-3 mt-1 text-[10px] text-appTextSecondary">
                        <span className="flex items-center gap-1"><MapPin className="h-3 w-3 text-appTextSecondary/60" />{memory.location}</span>
                        <span className="flex items-center gap-1"><Tag className="h-3 w-3 text-appTextSecondary/60" />{memory.category?.name}</span>
                      </div>
                    </div>
                    <span className="text-[10px] text-appTextSecondary whitespace-nowrap">{new Date(memory.createdAt).toLocaleDateString()}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Upcoming Alerts */}
        <div className="bg-white border border-appBorder rounded-xl shadow-soft flex flex-col">
          <div className="flex items-center justify-between border-b border-appBorder p-5 pb-4">
            <div>
              <h3 className="text-sm font-bold text-appTextPrimary flex items-center gap-2">
                <Calendar className="h-4 w-4 text-appPrimary" /> Upcoming Expiry Alerts
              </h3>
              <p className="text-[11px] text-appTextSecondary mt-0.5">Schedules requiring your attention soon</p>
            </div>
            {upcomingReminders.length > 0 && (
              <Link to="/reminders" className="text-xs font-semibold text-appPrimary hover:text-appPrimary-hover flex items-center gap-1 transition-colors">
                View All <ArrowRight className="h-3 w-3" />
              </Link>
            )}
          </div>
          <div className="flex-1 p-5">
            {loading ? (
              <div className="flex justify-center py-8"><div className="w-5 h-5 border-2 border-appPrimary border-t-transparent rounded-full animate-spin" /></div>
            ) : upcomingReminders.length === 0 ? (
              <div className="flex flex-col items-center py-8 text-center">
                <Calendar className="h-8 w-8 text-appTextSecondary/30 mb-2" />
                <p className="text-xs font-semibold text-appTextSecondary">No upcoming alerts</p>
              </div>
            ) : (
              <div className="divide-y divide-appBorder">
                {upcomingReminders.map((reminder) => {
                  const daysLeft = Math.ceil((new Date(reminder.reminderDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                  return (
                    <div key={reminder.id} className="py-3 flex items-center justify-between first:pt-0 last:pb-0">
                      <div className="flex flex-col min-w-0 pr-4">
                        <Link to={`/memories?search=${encodeURIComponent(reminder.memory.name)}`} className="text-xs font-bold text-appTextPrimary hover:text-appPrimary hover:underline transition-colors truncate">
                          {reminder.memory.name}
                        </Link>
                        <span className="text-[10px] text-appTextSecondary mt-1 flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-appTextSecondary/60" /> {reminder.memory.location}
                        </span>
                      </div>
                      <div className="flex flex-col items-end whitespace-nowrap">
                        <span className="text-[10px] font-semibold text-appTextPrimary">{new Date(reminder.reminderDate).toLocaleString([], { dateStyle: "short", timeStyle: "short" })}</span>
                        <span className={`text-[9px] px-1.5 py-0.5 rounded font-semibold mt-1 border ${daysLeft <= 7 ? "bg-red-50 text-appDanger border-red-100" : daysLeft <= 30 ? "bg-amber-50 text-appWarning border-amber-100" : "bg-emerald-50 text-appSuccess border-emerald-100"}`}>
                          {daysLeft < 0 ? "Overdue" : daysLeft === 0 ? "Today" : daysLeft === 1 ? "Tomorrow" : `${daysLeft}d left`}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Add Memory Dialog */}
      <MemoryDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        memoryToEdit={null}
        categories={categories}
        onSuccess={() => window.location.reload()}
      />
    </div>
  );
}
