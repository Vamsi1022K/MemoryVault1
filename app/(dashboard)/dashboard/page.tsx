import { getOrCreateUser } from "@/lib/auth-db";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Brain,
  Calendar,
  Clock,
  Plus,
  ArrowRight,
  MapPin,
  Tag,
  FolderPlus,
  BellRing,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import AddMemoryDashboardButton from "./add-memory-button";

export const revalidate = 0; // Disable caching so dashboard shows up-to-date data on load

export default async function DashboardPage() {
  const user = await getOrCreateUser();
  if (!user) {
    redirect("/sign-in");
  }

  // Fetch categories for the add memory dialog
  const categories = await prisma.category.findMany({
    where: {
      OR: [
        { userId: user.id },
        { userId: null },
      ],
    },
    orderBy: {
      name: "asc",
    },
  });

  // 1. Fetch total memories count
  const totalMemories = await prisma.memory.count({
    where: { userId: user.id },
  });

  // 2. Fetch custom categories count
  const customCategoriesCount = await prisma.category.count({
    where: { userId: user.id },
  });

  // 3. Fetch upcoming reminders (uncompleted, date >= today)
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Start of today

  const upcomingReminders = await prisma.reminder.findMany({
    where: {
      userId: user.id,
      completed: false,
      reminderDate: {
        gte: today,
      },
    },
    include: {
      memory: true,
    },
    orderBy: {
      reminderDate: "asc",
    },
    take: 5,
  });

  // 4. Fetch recently added memories
  const recentMemories = await prisma.memory.findMany({
    where: { userId: user.id },
    include: {
      category: true,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 5,
  });

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-6 rounded-2xl border border-slate-800 bg-slate-900/40 backdrop-blur-md gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-white">
            Welcome back, {user.name?.split(" ")[0] || "Vault Keeper"}!
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Here is a quick overview of your vault and upcoming reminders.
          </p>
        </div>
        <AddMemoryDashboardButton categories={categories} />
      </div>

      {/* Summary Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Card className="bg-slate-900/35 border-slate-850 hover:border-indigo-500/30 hover:-translate-y-1 transition-all duration-300 rounded-2xl overflow-hidden shadow-md hover:shadow-lg hover:shadow-indigo-500/5">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Total Memories
            </CardTitle>
            <Brain className="h-5 w-5 text-indigo-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{totalMemories}</div>
            <p className="text-xs text-slate-500 mt-1">Stored physical items & files</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/35 border-slate-850 hover:border-emerald-500/30 hover:-translate-y-1 transition-all duration-300 rounded-2xl overflow-hidden shadow-md hover:shadow-lg hover:shadow-emerald-500/5">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Active Reminders
            </CardTitle>
            <BellRing className="h-5 w-5 text-emerald-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{upcomingReminders.length}</div>
            <p className="text-xs text-slate-500 mt-1">Upcoming schedules & expiries</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/35 border-slate-850 hover:border-purple-500/30 hover:-translate-y-1 transition-all duration-300 rounded-2xl overflow-hidden shadow-md hover:shadow-lg hover:shadow-purple-500/5">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Custom Categories
            </CardTitle>
            <FolderPlus className="h-5 w-5 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{customCategoriesCount}</div>
            <p className="text-xs text-slate-500 mt-1">Tailored organization groups</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Split Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recently Added Memories */}
        <Card className="bg-slate-900/20 border-slate-800 rounded-2xl flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between border-b border-slate-900 pb-4">
            <div>
              <CardTitle className="text-base font-bold text-white flex items-center gap-2">
                <Clock className="h-4 w-4 text-indigo-400" />
                Recently Saved Items
              </CardTitle>
              <CardDescription className="text-xs text-slate-500 mt-0.5">
                Quick access to your latest additions
              </CardDescription>
            </div>
            {totalMemories > 0 && (
              <Link href="/memories" className="text-xs font-medium text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors">
                View All <ArrowRight className="h-3 w-3" />
              </Link>
            )}
          </CardHeader>
          <CardContent className="flex-1 py-4">
            {recentMemories.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <Brain className="h-10 w-10 text-slate-700 mb-3" />
                <p className="text-sm font-medium text-slate-400">No memories stored yet</p>
                <p className="text-xs text-slate-600 mt-1 max-w-[240px]">
                  Keep track of physical belongings, docs, and reminders by adding your first memory.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-900">
                {recentMemories.map((memory) => (
                  <div key={memory.id} className="py-3.5 flex items-center justify-between first:pt-0 last:pb-0">
                    <div className="flex flex-col min-w-0 pr-4">
                      <Link
                        href={`/memories?search=${encodeURIComponent(memory.name)}`}
                        className="text-sm font-semibold text-slate-200 hover:text-indigo-400 hover:underline transition-colors truncate"
                      >
                        {memory.name}
                      </Link>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-slate-600" />
                          {memory.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Tag className="h-3 w-3 text-slate-600" />
                          {memory.category.name}
                        </span>
                      </div>
                    </div>
                    <span className="text-xs text-slate-600 whitespace-nowrap">
                      {new Date(memory.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upcoming Reminders */}
        <Card className="bg-slate-900/20 border-slate-800 rounded-2xl flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between border-b border-slate-900 pb-4">
            <div>
              <CardTitle className="text-base font-bold text-white flex items-center gap-2">
                <Calendar className="h-4 w-4 text-emerald-400" />
                Upcoming Reminders & Expiries
              </CardTitle>
              <CardDescription className="text-xs text-slate-500 mt-0.5">
                Items requiring your attention soon
              </CardDescription>
            </div>
            {upcomingReminders.length > 0 && (
              <Link href="/reminders" className="text-xs font-medium text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors">
                View All <ArrowRight className="h-3 w-3" />
              </Link>
            )}
          </CardHeader>
          <CardContent className="flex-1 py-4">
            {upcomingReminders.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <Calendar className="h-10 w-10 text-slate-700 mb-3" />
                <p className="text-sm font-medium text-slate-400">No upcoming reminders</p>
                <p className="text-xs text-slate-600 mt-1 max-w-[240px]">
                  When adding a memory, set a reminder date to have it show up here.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-900">
                {upcomingReminders.map((reminder) => {
                  const daysLeft = Math.ceil(
                    (new Date(reminder.reminderDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
                  );
                  return (
                    <div key={reminder.id} className="py-3.5 flex items-center justify-between first:pt-0 last:pb-0">
                      <div className="flex flex-col min-w-0 pr-4">
                        <Link
                          href={`/memories?search=${encodeURIComponent(reminder.memory.name)}`}
                          className="text-sm font-semibold text-slate-200 hover:text-indigo-400 hover:underline transition-colors truncate"
                        >
                          {reminder.memory.name}
                        </Link>
                        <span className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-slate-600" />
                          Location: {reminder.memory.location}
                        </span>
                      </div>
                      <div className="flex flex-col items-end whitespace-nowrap">
                        <span className="text-xs font-medium text-slate-300">
                          {new Date(reminder.reminderDate).toLocaleString([], { dateStyle: "short", timeStyle: "short" })}
                        </span>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-semibold mt-1.5 ${
                            daysLeft <= 7
                              ? "bg-red-500/10 text-red-400 border border-red-500/20"
                              : daysLeft <= 30
                              ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                              : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
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
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
