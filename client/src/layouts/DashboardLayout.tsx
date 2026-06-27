import { Outlet, NavLink, useLocation } from "react-router-dom";
import { useState } from "react";
import { UserButton, useUser } from "@clerk/clerk-react";
import { Toaster } from "sonner";
import ReminderNotifier from "@/components/ReminderNotifier";
import {
  LayoutDashboard, Archive, FolderTree, Bell, Sparkles, ShieldCheck, Menu, X,
} from "lucide-react";

const navigation = [
  { name: "Dashboard", to: "/dashboard", icon: LayoutDashboard },
  { name: "Memories", to: "/memories", icon: Archive },
  { name: "Categories", to: "/categories", icon: FolderTree },
  { name: "Reminders", to: "/reminders", icon: Bell },
  { name: "Vault Assistant", to: "/ai-assistant", icon: Sparkles },
  { name: "Storage Advisor", to: "/storage-advisor", icon: ShieldCheck },
];

function getPageTitle(pathname: string) {
  const segment = pathname.split("/").pop() || "";
  if (segment === "dashboard") return "My Personal Vault";
  if (segment === "memories") return "My Saved Memories";
  if (segment === "categories") return "Manage Categories";
  if (segment === "reminders") return "My Reminders";
  if (segment === "ai-assistant") return "Vault Assistant";
  if (segment === "storage-advisor") return "Storage Advisor";
  return "MemoryVault";
}

export default function DashboardLayout() {
  const { user } = useUser();
  const { pathname } = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
      isActive
        ? "bg-appPrimary-light text-appPrimary font-semibold shadow-soft"
        : "text-appTextSecondary hover:bg-stone-200/40 hover:text-appTextPrimary hover:translate-x-0.5"
    }`;

  return (
    <div className="flex h-screen bg-appBg text-appTextPrimary overflow-hidden font-sans">
      <Toaster theme="light" position="top-right" closeButton />

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex md:w-64 md:flex-col bg-appSidebar border-r border-appBorder">
        <div className="flex items-center h-16 px-6 border-b border-appBorder gap-2">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-appPrimary font-bold text-white shadow-md shadow-appPrimary/25">
            M
          </div>
          <span className="text-lg font-bold tracking-tight text-appTextPrimary">
            MemoryVault
          </span>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {navigation.map((item) => (
            <NavLink key={item.name} to={item.to} className={navLinkClass}>
              <item.icon className="h-[18px] w-[18px] shrink-0" />
              {item.name}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-appBorder flex items-center gap-3 overflow-hidden">
          <UserButton
            appearance={{ elements: { avatarBox: "h-9 w-9 rounded-xl border border-appBorder" } }}
          />
          <div className="flex flex-col text-left overflow-hidden">
            <span className="text-sm font-medium truncate text-appTextPrimary">
              {user?.fullName || "User"}
            </span>
            <span className="text-xs text-appTextSecondary truncate">
              {user?.primaryEmailAddress?.emailAddress || ""}
            </span>
          </div>
        </div>
      </aside>

      {/* Mobile Drawer */}
      <div
        className={`fixed inset-0 z-50 md:hidden transition-opacity duration-300 ${
          mobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      >
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
        <div
          className={`absolute inset-y-0 left-0 w-64 bg-appSidebar border-r border-appBorder flex flex-col transition-transform duration-300 ease-in-out ${
            mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between h-16 px-6 border-b border-appBorder">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-appPrimary font-bold text-white">M</div>
              <span className="text-lg font-bold text-appTextPrimary">MemoryVault</span>
            </div>
            <button onClick={() => setMobileMenuOpen(false)} className="p-1 rounded-lg hover:bg-stone-200/50 text-appTextSecondary">
              <X className="h-5 w-5" />
            </button>
          </div>
          <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
            {navigation.map((item) => (
              <NavLink key={item.name} to={item.to} className={navLinkClass} onClick={() => setMobileMenuOpen(false)}>
                <item.icon className="h-[18px] w-[18px] shrink-0" />
                {item.name}
              </NavLink>
            ))}
          </nav>
          <div className="p-4 border-t border-appBorder flex items-center gap-3">
            <UserButton />
            <span className="text-sm font-medium truncate text-appTextPrimary">{user?.fullName || "User"}</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="flex items-center justify-between h-16 px-6 border-b border-appBorder bg-white/75 backdrop-blur-md z-10">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 -ml-2 rounded-lg hover:bg-stone-200/40 text-appTextSecondary hover:text-appTextPrimary md:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>
            <h1 className="text-lg md:text-xl font-bold tracking-tight text-appTextPrimary animate-fade-in">
              {getPageTitle(pathname)}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <ReminderNotifier />
            <div className="md:hidden">
              <UserButton />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-appBg">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

