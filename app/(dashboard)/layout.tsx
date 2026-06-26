"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { UserButton, useUser } from "@clerk/nextjs";
import { Toaster } from "@/components/ui/sonner";
import ReminderNotifier from "@/components/reminder-notifier";
import {
  LayoutDashboard,
  Brain,
  Tags,
  Calendar,
  Bot,
  Lightbulb,
  Menu,
  X,
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Memories", href: "/memories", icon: Brain },
  { name: "Categories", href: "/categories", icon: Tags },
  { name: "Reminders", href: "/reminders", icon: Calendar },
  { name: "AI Assistant", href: "/ai-assistant", icon: Bot },
  { name: "Storage Advisor", href: "/storage-advisor", icon: Lightbulb },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user } = useUser();

  // Helper to get formatted page title
  const getPageTitle = () => {
    const segment = pathname.split("/").pop() || "";
    if (segment === "dashboard") return "Dashboard Overview";
    if (segment === "memories") return "My Saved Memories";
    if (segment === "categories") return "Manage Categories";
    if (segment === "reminders") return "My Reminders";
    if (segment === "ai-assistant") return "AI Memory Assistant";
    if (segment === "storage-advisor") return "Storage & Preservation Advisor";
    return "MemoryVault";
  };

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden">
      <Toaster theme="dark" position="top-right" closeButton />

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex md:w-64 md:flex-col bg-slate-900 border-r border-slate-800">
        <div className="flex items-center h-16 px-6 border-b border-slate-800 gap-2">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-600 font-bold text-white shadow-lg shadow-indigo-500/35">
            M
          </div>
          <span className="text-lg font-bold tracking-tight bg-gradient-to-r from-white via-slate-200 to-indigo-400 bg-clip-text text-transparent">
            MemoryVault
          </span>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                  isActive
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20"
                    : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-200 hover:translate-x-1"
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* User Info footer in sidebar */}
        <div className="p-4 border-t border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3 overflow-hidden">
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "h-9 w-9 rounded-xl border border-slate-700",
                },
              }}
            />
            <div className="flex flex-col text-left overflow-hidden">
              <span className="text-sm font-medium truncate text-slate-200">
                {user?.fullName || "User"}
              </span>
              <span className="text-xs text-slate-500 truncate">
                {user?.primaryEmailAddress?.emailAddress || ""}
              </span>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Drawer (Slide-out menu) */}
      <div
        className={`fixed inset-0 z-50 md:hidden transition-opacity duration-300 ${
          mobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={() => setMobileMenuOpen(false)}
        />

        {/* Drawer Content */}
        <div
          className={`absolute inset-y-0 left-0 w-64 bg-slate-900 border-r border-slate-800 flex flex-col transition-transform duration-300 ease-in-out ${
            mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between h-16 px-6 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-600 font-bold text-white shadow-lg">
                M
              </div>
              <span className="text-lg font-bold tracking-tight text-white">
                MemoryVault
              </span>
            </div>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                    isActive
                      ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20"
                      : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-200 hover:translate-x-1"
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t border-slate-800 flex items-center gap-3">
            <UserButton />
            <div className="flex flex-col text-left overflow-hidden">
              <span className="text-sm font-medium truncate text-slate-200">
                {user?.fullName || "User"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="flex items-center justify-between h-16 px-6 border-b border-slate-800 bg-slate-900/60 backdrop-blur-md z-10">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 -ml-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 md:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>
            <h1 className="text-lg md:text-xl font-semibold tracking-tight text-white">
              {getPageTitle()}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <ReminderNotifier />
            {/* User button in header on mobile */}
            <div className="md:hidden">
              <UserButton />
            </div>
          </div>
        </header>

        {/* Content Wrapper */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-slate-950">
          {children}
        </main>
      </div>
    </div>
  );
}
