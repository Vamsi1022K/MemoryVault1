import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import { Brain, Calendar, Clock, ArrowRight, MapPin, Tag, FolderPlus, BellRing } from "lucide-react";
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
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-6 rounded-2xl border border-slate-800 bg-slate-900/40 backdrop-blur-md gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-white">
            Welcome back, {user?.firstName || "Vault Keeper"}!
          </h2>
          <p className="text-sm text-slate-400 mt-1">Here is a quick overview of your vault and upcoming reminders.</p>
        </div>
        <button
          onClick={() => setDialogOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium shadow-md shadow-indigo-500/10 transition-all"
        >
          <Brain className="h-4 w-4" /> Add Memory
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {[
          { label: "Total Memories", value: stats.totalMemories, icon: Brain, color: "text-indigo-400", hover: "hover:border-indigo-500/30 hover:shadow-indigo-500/5" },
          { label: "Active Reminders", value: stats.upcomingReminders, icon: BellRing, color: "text-emerald-400", hover: "hover:border-emerald-500/30 hover:shadow-emerald-500/5" },
          { label: "Custom Categories", value: stats.customCategories, icon: FolderPlus, color: "text-purple-400", hover: "hover:border-purple-500/30 hover:shadow-purple-500/5" },
        ].map(({ label, value, icon: Icon, color, hover }) => (
          <div key={label} className={`bg-slate-900/35 border border-slate-800 ${hover} hover:-translate-y-1 transition-all duration-300 rounded-2xl overflow-hidden shadow-md hover:shadow-lg p-6`}>
            <div className="flex items-center justify-between pb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">{label}</span>
              <Icon className={`h-5 w-5 ${color}`} />
            </div>
            <div className="text-3xl font-bold text-white">{loading ? "—" : value}</div>
            <p className="text-xs text-slate-500 mt-1">Tracked in your vault</p>
          </div>
        ))}
      </div>

      {/* Recent + Upcoming */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recently Added */}
        <div className="bg-slate-900/20 border border-slate-800 rounded-2xl flex flex-col">
          <div className="flex items-center justify-between border-b border-slate-900 p-5 pb-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Clock className="h-4 w-4 text-indigo-400" /> Recently Saved Items
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Quick access to your latest additions</p>
            </div>
            {stats.totalMemories > 0 && (
              <Link to="/memories" className="text-xs font-medium text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors">
                View All <ArrowRight className="h-3 w-3" />
              </Link>
            )}
          </div>
          <div className="flex-1 p-5">
            {loading ? (
              <div className="flex justify-center py-10"><div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" /></div>
            ) : recentMemories.length === 0 ? (
              <div className="flex flex-col items-center py-10 text-center">
                <Brain className="h-10 w-10 text-slate-700 mb-3" />
                <p className="text-sm font-medium text-slate-400">No memories stored yet</p>
                <p className="text-xs text-slate-600 mt-1 max-w-[240px]">Keep track of physical belongings, docs, and reminders by adding your first memory.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-900">
                {recentMemories.map((memory) => (
                  <div key={memory.id} className="py-3.5 flex items-center justify-between first:pt-0 last:pb-0">
                    <div className="flex flex-col min-w-0 pr-4">
                      <Link to={`/memories?search=${encodeURIComponent(memory.name)}`} className="text-sm font-semibold text-slate-200 hover:text-indigo-400 hover:underline transition-colors truncate">
                        {memory.name}
                      </Link>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-slate-500">
                        <span className="flex items-center gap-1"><MapPin className="h-3 w-3 text-slate-600" />{memory.location}</span>
                        <span className="flex items-center gap-1"><Tag className="h-3 w-3 text-slate-600" />{memory.category?.name}</span>
                      </div>
                    </div>
                    <span className="text-xs text-slate-600 whitespace-nowrap">{new Date(memory.createdAt).toLocaleDateString()}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Upcoming Reminders */}
        <div className="bg-slate-900/20 border border-slate-800 rounded-2xl flex flex-col">
          <div className="flex items-center justify-between border-b border-slate-900 p-5 pb-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Calendar className="h-4 w-4 text-emerald-400" /> Upcoming Reminders & Expiries
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Items requiring your attention soon</p>
            </div>
            {upcomingReminders.length > 0 && (
              <Link to="/reminders" className="text-xs font-medium text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors">
                View All <ArrowRight className="h-3 w-3" />
              </Link>
            )}
          </div>
          <div className="flex-1 p-5">
            {loading ? (
              <div className="flex justify-center py-10"><div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" /></div>
            ) : upcomingReminders.length === 0 ? (
              <div className="flex flex-col items-center py-10 text-center">
                <Calendar className="h-10 w-10 text-slate-700 mb-3" />
                <p className="text-sm font-medium text-slate-400">No upcoming reminders</p>
                <p className="text-xs text-slate-600 mt-1 max-w-[240px]">When adding a memory, set a reminder date to have it show up here.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-900">
                {upcomingReminders.map((reminder) => {
                  const daysLeft = Math.ceil((new Date(reminder.reminderDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                  return (
                    <div key={reminder.id} className="py-3.5 flex items-center justify-between first:pt-0 last:pb-0">
                      <div className="flex flex-col min-w-0 pr-4">
                        <Link to={`/memories?search=${encodeURIComponent(reminder.memory.name)}`} className="text-sm font-semibold text-slate-200 hover:text-indigo-400 hover:underline transition-colors truncate">
                          {reminder.memory.name}
                        </Link>
                        <span className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-slate-600" /> {reminder.memory.location}
                        </span>
                      </div>
                      <div className="flex flex-col items-end whitespace-nowrap">
                        <span className="text-xs font-medium text-slate-300">{new Date(reminder.reminderDate).toLocaleString([], { dateStyle: "short", timeStyle: "short" })}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold mt-1.5 border ${daysLeft <= 7 ? "bg-red-500/10 text-red-400 border-red-500/20" : daysLeft <= 30 ? "bg-amber-500/10 text-amber-400 border-amber-500/20" : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"}`}>
                          {daysLeft < 0 ? "Overdue" : daysLeft === 0 ? "Today" : daysLeft === 1 ? "Tomorrow" : `${daysLeft} days left`}
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
