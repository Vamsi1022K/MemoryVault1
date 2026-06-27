import React, { useState, useEffect } from "react";
import { 
  Brain, 
  Search, 
  Calendar, 
  Clock, 
  Shield, 
  Sparkles,
  Bot
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
          return (
            <button
              key={feature.id}
              onClick={() => setActiveTab(feature.id)}
              className={`w-full p-5 rounded-2xl text-left transition-all duration-500 ease-out cursor-pointer relative group flex gap-4 items-start ${
                isActive
                  ? "bg-white border border-appBorder shadow-soft translate-x-2"
                  : "border border-transparent bg-white/20 hover:border-appBorder/40 hover:bg-appMuted/15"
              }`}
            >
              {/* Sidebar Active Indicator Line */}
              <div className={`absolute left-0 top-6 bottom-6 w-[3px] transition-all duration-500 rounded-r-full ${
                isActive ? "bg-appPrimary opacity-100 h-10" : "bg-transparent opacity-0 h-0"
              }`} />

              <span className={`text-xs font-mono font-bold shrink-0 mt-0.5 tracking-wider transition-colors ${
                isActive ? "text-appPrimary" : "text-appTextSecondary group-hover:text-appTextPrimary"
              }`}>
                {feature.index}
              </span>

              <div className="space-y-1.5 min-w-0 flex-1 relative z-10">
                <div className="flex items-center gap-2">
                  <h3 className={`text-base font-extrabold transition-all duration-300 ${
                    isActive 
                      ? "text-appTextPrimary" 
                      : "text-appTextSecondary group-hover:text-appTextPrimary"
                  }`}>
                    {feature.title}
                  </h3>
                  {isActive && (
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-appPrimary animate-ping" />
                  )}
                </div>
                
                {/* Expandable descriptive paragraph */}
                <div className={`overflow-hidden transition-all duration-500 ease-in-out ${
                  isActive ? "max-h-24 opacity-100 mt-2" : "max-h-0 opacity-0 pointer-events-none"
                }`}>
                  <p className="text-xs text-appTextSecondary leading-relaxed">
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
        <div className="absolute inset-0 bg-radial-gradient from-appPrimary/5 via-purple-500/5 to-transparent blur-[60px] pointer-events-none rounded-3xl" />

        {/* 1. Catalog Tab View Mockup */}
        <div
          className={`absolute inset-0 w-full h-full transition-all duration-350 ease-[cubic-bezier(0.16,1,0.3,1)] flex items-center ${getTabClasses("catalog")}`}
        >
          <div className="w-full bg-white border border-appBorder p-6 md:p-8 flex flex-col justify-between shadow-2xl rounded-3xl relative overflow-hidden h-full">
            <div className="space-y-4 relative z-10 text-left">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-appPrimary/20 bg-appPrimary-light text-appPrimary text-[10px] font-bold uppercase tracking-wider">
                <Shield className="h-3 w-3" /> Secure Cataloging
              </div>
              <h3 className="text-2xl font-black text-appTextPrimary leading-tight">
                Store with complete peace of mind.
              </h3>
              <p className="text-appTextSecondary text-xs leading-relaxed max-w-md">
                Catalog precious items, folders, and heirlooms with high-fidelity base64 photo attachment, specific location fields, and user category tagging.
              </p>
            </div>
            
            <div className="border border-appBorder bg-appBg/50 rounded-2xl p-4 shadow-soft space-y-3 relative z-10 mt-4 text-left">
              <div className="flex justify-between items-center pb-2 border-b border-appBorder">
                <span className="text-[10px] font-mono text-appTextSecondary">Asset #MV-298</span>
                <span className="text-[9px] px-2 py-0.5 rounded-full font-bold bg-appPrimary-light text-appPrimary border border-appPrimary/15">
                  Documents
                </span>
              </div>
              
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-appTextPrimary">Property Sale Agreement</h4>
                <div className="grid grid-cols-2 gap-2 text-[10px]">
                  <div className="p-2 rounded-xl bg-white border border-appBorder shadow-soft">
                    <span className="text-[9px] text-appTextSecondary block">Storage</span>
                    <span className="font-semibold text-appTextPrimary truncate block">Cabinet 3, Drawer A</span>
                  </div>
                  <div className="p-2 rounded-xl bg-white border border-appBorder shadow-soft">
                    <span className="text-[9px] text-appTextSecondary block">Alert set</span>
                    <span className="font-semibold text-appTextPrimary truncate block">10/24/2026</span>
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
          <div className="w-full bg-white border border-appBorder p-6 md:p-8 flex flex-col justify-between shadow-2xl rounded-3xl relative overflow-hidden h-full">
            <div className="space-y-4 relative z-10 text-left">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-appPrimary/20 bg-appPrimary-light text-appPrimary text-[10px] font-bold uppercase tracking-wider">
                <Sparkles className="h-3 w-3" /> Conversational Retrieval
              </div>
              <h3 className="text-2xl font-black text-appTextPrimary leading-tight">
                Ask naturally. Find immediately.
              </h3>
              <p className="text-appTextSecondary text-xs leading-relaxed max-w-md">
                Search via keyword constraints or ask in plain English: "Where is my contract?" The RAG model reviews database records to give exact coordinates.
              </p>
            </div>
            
            <div className="border border-appBorder bg-appBg/50 rounded-2xl overflow-hidden shadow-soft flex flex-col h-40 relative z-10 mt-4 text-left">
              <div className="px-3.5 py-2 bg-white border-b border-appBorder flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-appPrimary animate-pulse" />
                <span className="text-[10px] font-bold text-appTextPrimary">Vault Assistant</span>
              </div>
              
              <div className="flex-1 p-3 space-y-2 overflow-y-auto text-[10px]">
                <div className="flex gap-2 justify-end">
                  <div className="p-2 rounded-xl bg-appPrimary text-white rounded-tr-none">
                    Where did I put the spare keys?
                  </div>
                </div>
                <div className="flex gap-2">
                  <div className="p-1 rounded-lg bg-appPrimary-light border border-appPrimary/15 h-5 w-5 flex items-center justify-center text-appPrimary shrink-0">
                    <Bot className="h-3 w-3" />
                  </div>
                  <div className="p-2 rounded-xl bg-white border border-appBorder text-appTextPrimary rounded-tl-none leading-relaxed shadow-soft">
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
          <div className="w-full bg-white border border-appBorder p-6 md:p-8 flex flex-col justify-between shadow-2xl rounded-3xl relative overflow-hidden h-full">
            <div className="space-y-4 relative z-10 text-left">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-appPrimary/20 bg-appPrimary-light text-appPrimary text-[10px] font-bold uppercase tracking-wider">
                <Clock className="h-3 w-3" /> Expiries & Schedules
              </div>
              <h3 className="text-2xl font-black text-appTextPrimary leading-tight">
                Be alerted before it's too late.
              </h3>
              <p className="text-appTextSecondary text-xs leading-relaxed max-w-md">
                Set expiration reminders for official paper works, warranties, or items. Enable browser alarm alerts, push notices, or both.
              </p>
            </div>
            
            <div className="border border-appBorder bg-appBg/50 rounded-2xl p-4 shadow-soft relative z-10 mt-4 text-left space-y-2">
              <div className="p-2.5 rounded-xl bg-white border border-appBorder flex items-center justify-between text-[10px] shadow-soft">
                <div className="min-w-0">
                  <span className="font-bold text-appTextPrimary block truncate">Passport Renewal</span>
                  <span className="text-[9px] text-appTextSecondary block">Expires in 30 Days</span>
                </div>
                <span className="text-[9px] px-2 py-0.5 rounded-full font-bold bg-amber-50 text-amber-700 border border-amber-100">
                  Active
                </span>
              </div>
              
              <div className="p-2.5 rounded-xl bg-white border border-appBorder flex items-center justify-between text-[10px] shadow-soft">
                <div className="min-w-0">
                  <span className="font-bold text-appTextPrimary block truncate">Home Insurance Policy</span>
                  <span className="text-[9px] text-appTextSecondary block">Expires in 5 Days</span>
                </div>
                <span className="text-[9px] px-2 py-0.5 rounded-full font-bold bg-red-50 text-red-650 border border-red-100 animate-pulse">
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
