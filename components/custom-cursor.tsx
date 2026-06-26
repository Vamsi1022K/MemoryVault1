"use client";

import { useEffect, useRef, useState } from "react";

export default function CustomCursor() {
  const spotlightRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  
  const [isHovered, setIsHovered] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  const [isHidden, setIsHidden] = useState(true);

  const isHoveredRef = useRef(false);

  useEffect(() => {
    // Check if device supports hover (desktop)
    const hasHover = window.matchMedia("(hover: hover)").matches;
    if (!hasHover) return;

    setIsHidden(false);

    const onMouseMove = (e: MouseEvent) => {
      if (spotlightRef.current) {
        spotlightRef.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0) translate(-50%, -50%)`;
      }
      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0) translate(-50%, -50%)`;
      }
    };

    const onMouseDown = () => {
      setIsClicked(true);
    };
    
    const onMouseUp = () => {
      setIsClicked(false);
    };
    
    const onMouseLeave = () => setIsHidden(true);
    const onMouseEnter = () => setIsHidden(false);

    // Global listener to check if hovering over interactive elements
    const onMouseOver = (e: MouseEvent) => {
      let target = e.target as HTMLElement | null;
      let interactiveEl: HTMLElement | null = null;
      
      // Traverse up to find the closest interactive element
      while (target && target !== document.body) {
        if (
          target.tagName === "A" || 
          target.tagName === "BUTTON" || 
          target.closest("a") || 
          target.closest("button") || 
          target.classList.contains("cursor-pointer") ||
          target.closest(".cursor-pointer") ||
          target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT" ||
          target.hasAttribute("data-cursor")
        ) {
          interactiveEl = target;
          break;
        }
        target = target.parentElement;
      }
      
      if (interactiveEl) {
        isHoveredRef.current = true;
        setIsHovered(true);
      } else {
        isHoveredRef.current = false;
        setIsHovered(false);
      }
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mouseup", onMouseUp);
    document.addEventListener("mouseleave", onMouseLeave);
    document.addEventListener("mouseenter", onMouseEnter);
    document.addEventListener("mouseover", onMouseOver);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mouseup", onMouseUp);
      document.removeEventListener("mouseleave", onMouseLeave);
      document.removeEventListener("mouseenter", onMouseEnter);
      document.removeEventListener("mouseover", onMouseOver);
    };
  }, []);

  if (isHidden) return null;

  return (
    <>
      {/* 1. Background Spotlight (Lighting Effect) */}
      <div
        ref={spotlightRef}
        className={`fixed top-0 left-0 rounded-full pointer-events-none z-[9990] transition-all duration-500 ease-out will-change-transform ${
          isHovered 
            ? "w-[360px] h-[360px] opacity-100" 
            : "w-[240px] h-[240px] opacity-75"
        }`}
        style={{
          background: "radial-gradient(circle, rgba(6, 182, 212, 0.12) 0%, rgba(217, 70, 239, 0.04) 50%, transparent 70%)",
          mixBlendMode: "plus-lighter",
        }}
      />
      
      {/* 2. Trailing Pointer Ring (expands on hover, scales down on click) */}
      <div
        ref={ringRef}
        className={`fixed top-0 left-0 rounded-full pointer-events-none z-[9998] transition-all duration-300 ease-out will-change-transform ${
          isHovered
            ? "w-10 h-10 border-2 border-fuchsia-500/80 bg-fuchsia-500/5 shadow-[0_0_12px_rgba(217,70,239,0.35)]"
            : isClicked
            ? "w-4 h-4 border border-cyan-400 bg-cyan-400/25"
            : "w-6 h-6 border border-cyan-450/40 bg-transparent"
        }`}
      />
    </>
  );
}
