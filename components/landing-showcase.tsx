"use client";

import { useState, useEffect } from "react";
import { 
  Brain, 
  Search, 
  Calendar, 
  MapPin, 
  Clock, 
  Shield, 
  Sparkles,
  Bot,
  Database,
  ShieldCheck,
  Box
} from "lucide-react";

type TabId = "catalog" | "chat" | "reminders";

interface FeatureDetail {
  id: TabId;
  index: string;
  title: string;
  badge: string;
  shortDesc: string;
  icon: any;
  color: string;
  gradientText: string;
}

export default function LandingShowcase() {
  const [activeTab, setActiveTab] = useState<TabId>("catalog");

  const features: FeatureDetail[] = [
    {
      id: "catalog",
      index: "01",
      title: "Store & Catalog",
      badge: "Base64 Asset Uploads",
      shortDesc: "Catalog any physical item in seconds with direct base64 image uploads, category tagging, and detailed storage descriptions.",
      icon: Search,
      color: "from-cyan-500 to-blue-600",
      gradientText: "from-cyan-400 via-teal-300 to-cyan-500",
    },
    {
      id: "chat",
      index: "02",
      title: "Talk to Your Vault",
      badge: "Gemini 2.5 RAG Chat",
      shortDesc: "Ask your vault questions in plain English. Our AI retrieves matching database records to answer you in real-time.",
      icon: Brain,
      color: "from-fuchsia-500 to-purple-600",
      gradientText: "from-fuchsia-400 via-pink-300 to-purple-500",
    },
    {
      id: "reminders",
      index: "03",
      title: "Never Forget Expiries",
      badge: "Smart Alarm & Alerts",
      shortDesc: "Enforce future-only reminder dates. Receive live audio alarms and notifications directly in your browser on target dates.",
      icon: Calendar,
      color: "from-pink-500 to-rose-600",
      gradientText: "from-pink-400 via-orange-300 to-rose-500",
    },
  ];

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement | HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    e.currentTarget.style.setProperty("--mouse-x", `${x}px`);
    e.currentTarget.style.setProperty("--mouse-y", `${y}px`);
  };

  const getTabClasses = (tabId: TabId) => {
    const order: TabId[] = ["catalog", "chat", "reminders"];
    const activeIndex = order.indexOf(activeTab);
    const tabIndex = order.indexOf(tabId);
    
    if (activeIndex === tabIndex) {
      return "z-30 opacity-100 translate-x-0 scale-100 pointer-events-auto";
    }
    if (tabIndex > activeIndex) {
      return "z-10 opacity-0 translate-x-48 scale-95 pointer-events-none";
    }
    return "z-10 opacity-0 -translate-x-48 scale-95 pointer-events-none";
  };

  // Auto rotate tabs every 8 seconds if user is idle
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTab((prev) => {
        if (prev === "catalog") return "chat";
        if (prev === "chat") return "reminders";
        return "catalog";
      });
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center max-w-5xl mx-auto text-left relative">
      
      {/* Left side: Feature selector with slide transitions */}
      <div className="lg:col-span-5 space-y-4">
        {features.map((feature) => {
          const isActive = activeTab === feature.id;
          const Icon = feature.icon;
          return (
            <button
              key={feature.id}
              onClick={() => setActiveTab(feature.id)}
              onMouseMove={handleMouseMove}
              className={`w-full p-5 rounded-2xl text-left transition-all duration-500 ease-out cursor-pointer relative group flex gap-4 items-start card-glow-container ${
                isActive
                  ? "glass-card border-cyan-500/20 bg-slate-900/40 shadow-[0_0_30px_rgba(6,182,212,0.05)] translate-x-2"
                  : "border border-slate-950 bg-slate-950/20 hover:border-slate-850 hover:bg-slate-900/10"
              }`}
            >
              <div className="card-glow-border" />
              <div className="card-glow-bg" />

              {/* Sidebar Active Indicator Line */}
              <div className={`absolute left-0 top-6 bottom-6 w-[2px] transition-all duration-500 ${
                isActive ? "bg-gradient-to-b from-cyan-400 to-fuchsia-500 opacity-100 h-10" : "bg-transparent opacity-0 h-0"
              }`} />

              <span className={`text-xs font-mono font-bold shrink-0 mt-0.5 tracking-wider transition-colors ${
                isActive ? "text-cyan-400" : "text-slate-600 group-hover:text-slate-400"
              }`}>
                {feature.index}
              </span>

              <div className="space-y-1.5 min-w-0 flex-1 relative z-10">
                <div className="flex items-center gap-2">
                  <h3 className={`text-base font-extrabold transition-all duration-300 ${
                    isActive 
                      ? "text-white" 
                      : "text-slate-400 group-hover:text-slate-200"
                  }`}>
                    {feature.title}
                  </h3>
                  {isActive && (
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                  )}
                </div>
                
                {/* Expandable descriptive paragraph that transitions nicely */}
                <div className={`overflow-hidden transition-all duration-500 ease-in-out ${
                  isActive ? "max-h-24 opacity-100 mt-2" : "max-h-0 opacity-0 pointer-events-none"
                }`}>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {feature.shortDesc}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Right side: Stacking visual card with dynamic Z-Index layering */}
      <div className="lg:col-span-7 h-[380px] relative w-full flex items-center justify-center">
        {/* Ambient background glow behind active mockup */}
        <div className="absolute inset-0 bg-radial-gradient from-cyan-500/5 via-fuchsia-500/5 to-transparent blur-[60px] pointer-events-none rounded-3xl" />

        {/* 1. Catalog Tab View Mockup */}
        <div
          className={`absolute inset-0 w-full h-full transition-all duration-350 ease-[cubic-bezier(0.16,1,0.3,1)] flex items-center ${getTabClasses("catalog")}`}
        >
          <div className="w-full glass-card rounded-3xl border border-slate-850 bg-slate-900/10 p-6 md:p-8 flex flex-col justify-between shadow-2xl relative overflow-hidden card-glow-container h-full">
            <div className="card-glow-border" />
            <div className="card-glow-bg" />

            <div className="space-y-4 relative z-10 text-left">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-cyan-500/25 bg-cyan-500/10 text-cyan-400 text-[10px] font-bold uppercase tracking-wider">
                <Shield className="h-3 w-3" /> Secure Cataloging
              </div>
              <h3 className="text-2xl font-black text-white leading-tight bg-gradient-to-r from-white via-slate-100 to-cyan-300 bg-clip-text text-transparent">
                Store with complete peace of mind.
              </h3>
              <p className="text-slate-400 text-xs leading-relaxed max-w-md">
                Catalog precious items, folders, and heirlooms with high-fidelity base64 photo attachment, specific location fields, and user category tagging.
              </p>
            </div>
            
            <div className="border border-slate-800/80 bg-slate-950/90 rounded-2xl p-4 shadow-xl space-y-3 relative z-10 mt-4 text-left">
              <div className="flex justify-between items-center pb-2 border-b border-slate-900">
                <span className="text-[10px] font-mono text-slate-500">Asset #MV-298</span>
                <span className="text-[9px] px-2 py-0.5 rounded-full font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  Documents
                </span>
              </div>
              
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-white">Property Sale Agreement</h4>
                <div className="grid grid-cols-2 gap-2 text-[10px]">
                  <div className="p-2 rounded-xl bg-slate-900/40 border border-slate-900">
                    <span className="text-[9px] text-slate-500 block">Storage</span>
                    <span className="font-semibold text-slate-300 truncate block">Cabinet 3, Drawer A</span>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-900/40 border border-slate-900">
                    <span className="text-[9px] text-slate-500 block">Alert set</span>
                    <span className="font-semibold text-slate-300 truncate block">10/24/2026</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 2. AI Chat Tab View Mockup */}
        <div
          className={`absolute inset-0 w-full h-full transition-all duration-350 ease-[cubic-bezier(0.16,1,0.3,1)] flex items-center ${getTabClasses("chat")}`}
        >
          <div className="w-full glass-card rounded-3xl border border-slate-850 bg-slate-900/10 p-6 md:p-8 flex flex-col justify-between shadow-2xl relative overflow-hidden card-glow-container h-full">
            <div className="card-glow-border" />
            <div className="card-glow-bg" />

            <div className="space-y-4 relative z-10 text-left">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-fuchsia-500/25 bg-fuchsia-500/10 text-fuchsia-400 text-[10px] font-bold uppercase tracking-wider">
                <Sparkles className="h-3 w-3" /> Conversational Retrieval
              </div>
              <h3 className="text-2xl font-black text-white leading-tight bg-gradient-to-r from-white via-slate-100 to-fuchsia-300 bg-clip-text text-transparent">
                Ask naturally. Find immediately.
              </h3>
              <p className="text-slate-400 text-xs leading-relaxed max-w-md">
                Search via keyword constraints or ask in plain English: "Where is my contract?" The RAG model reviews database records to give exact coordinates.
              </p>
            </div>
            
            <div className="border border-slate-800/80 bg-slate-950/90 rounded-2xl overflow-hidden shadow-xl flex flex-col h-40 relative z-10 mt-4 text-left">
              <div className="px-3.5 py-2 bg-slate-900/80 border-b border-slate-850 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                <span className="text-[10px] font-bold text-slate-400">Vault Assistant</span>
              </div>
              
              <div className="flex-1 p-3 space-y-2 overflow-y-auto text-[10px]">
                <div className="flex gap-2 justify-end">
                  <div className="p-2 rounded-xl bg-fuchsia-600 text-white rounded-tr-none">
                    Where did I put the spare keys?
                  </div>
                </div>
                <div className="flex gap-2">
                  <div className="p-1 rounded-lg bg-slate-900 border border-slate-850 h-5 w-5 flex items-center justify-center text-cyan-400 shrink-0">
                    <Bot className="h-3 w-3" />
                  </div>
                  <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-850 text-slate-350 rounded-tl-none leading-relaxed">
                    You kept the spare keys in the **Blue box on the entry closet shelf**.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Reminders Tab View Mockup */}
        <div
          className={`absolute inset-0 w-full h-full transition-all duration-350 ease-[cubic-bezier(0.16,1,0.3,1)] flex items-center ${getTabClasses("reminders")}`}
        >
          <div className="w-full glass-card rounded-3xl border border-slate-850 bg-slate-900/10 p-6 md:p-8 flex flex-col justify-between shadow-2xl relative overflow-hidden card-glow-container h-full">
            <div className="card-glow-border" />
            <div className="card-glow-bg" />

            <div className="space-y-4 relative z-10 text-left">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-pink-500/25 bg-pink-500/10 text-pink-400 text-[10px] font-bold uppercase tracking-wider">
                <Clock className="h-3 w-3" /> Expiries & Schedules
              </div>
              <h3 className="text-2xl font-black text-white leading-tight bg-gradient-to-r from-white via-slate-100 to-pink-300 bg-clip-text text-transparent">
                Be alerted before it's too late.
              </h3>
              <p className="text-slate-400 text-xs leading-relaxed max-w-md">
                Set expiration reminders for official paper works, warranties, or items. Enable browser alarm alerts, push notices, or both.
              </p>
            </div>
            
            <div className="border border-slate-800/80 bg-slate-950/90 rounded-2xl p-4 shadow-xl relative z-10 mt-4 text-left space-y-2">
              <div className="p-2.5 rounded-xl bg-slate-900/40 border border-slate-900 flex items-center justify-between text-[10px]">
                <div className="min-w-0">
                  <span className="font-bold text-slate-200 block truncate">Passport Renewal</span>
                  <span className="text-[9px] text-slate-500 block">Expires in 30 Days</span>
                </div>
                <span className="text-[9px] px-2 py-0.5 rounded-full font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  Active
                </span>
              </div>
              
              <div className="p-2.5 rounded-xl bg-slate-900/40 border border-slate-900 flex items-center justify-between text-[10px]">
                <div className="min-w-0">
                  <span className="font-bold text-slate-200 block truncate">Home Insurance Policy</span>
                  <span className="text-[9px] text-slate-500 block">Expires in 5 Days</span>
                </div>
                <span className="text-[9px] px-2 py-0.5 rounded-full font-bold bg-red-500/10 text-red-400 border border-red-500/20 animate-pulse">
                  Urgent
                </span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
