"use client";

import React from "react";

interface GlowCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

export default function GlowCard({ children, className = "", ...props }: GlowCardProps) {
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    e.currentTarget.style.setProperty("--mouse-x", `${x}px`);
    e.currentTarget.style.setProperty("--mouse-y", `${y}px`);
  };

  return (
    <div
      onMouseMove={handleMouseMove}
      className={`card-glow-container rounded-2xl relative group ${className}`}
      {...props}
    >
      <div className="card-glow-border" />
      <div className="card-glow-bg" />
      
      {/* High-Tech Geometric Corner Marks */}
      <div className="absolute top-3 left-3 text-[9px] font-mono text-slate-700/60 pointer-events-none select-none z-20 group-hover:text-cyan-500/50 transition-colors font-semibold">+</div>
      <div className="absolute top-3 right-3 text-[9px] font-mono text-slate-700/60 pointer-events-none select-none z-20 group-hover:text-fuchsia-500/50 transition-colors font-semibold">+</div>
      <div className="absolute bottom-3 left-3 text-[9px] font-mono text-slate-700/60 pointer-events-none select-none z-20 group-hover:text-cyan-500/50 transition-colors font-semibold">+</div>
      <div className="absolute bottom-3 right-3 text-[9px] font-mono text-slate-700/60 pointer-events-none select-none z-20 group-hover:text-fuchsia-500/50 transition-colors font-semibold">+</div>
      
      <div className="relative z-10 h-full w-full">{children}</div>
    </div>
  );
}
