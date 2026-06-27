import React from "react";

interface GlowCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

export default function GlowCard({ children, className = "", ...props }: GlowCardProps) {
  return (
    <div
      className={`bg-appSurface border border-appBorder rounded-2xl shadow-soft hover:shadow-card hover:-translate-y-0.5 transition-all duration-300 relative group overflow-hidden ${className}`}
      {...props}
    >
      <div className="relative z-10 h-full w-full">{children}</div>
    </div>
  );
}

