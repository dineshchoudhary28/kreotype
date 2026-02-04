"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";
import { useFocusModeStore } from "@/store/useFocusModeStore";

export function AnnouncementBanner() {
  const [isVisible, setIsVisible] = useState(true);
  const pathname = usePathname();
  const isFocused = useFocusModeStore((s) => s.isFocused);

  // Hide during focus mode on homepage
  if (pathname === "/" && isFocused) return null;

  if (!isVisible) return null;

  return (
    <div className="w-full bg-surface text-secondary text-xs py-3 px-4 relative border-b border-secondary/10">
      <div className="max-w-7xl mx-auto flex items-center justify-center text-center">
        <p className="tracking-tight">
          <span className="font-bold text-primary mr-2">Level Up:</span>
          Precision meets performance. Experience the ultimate tactile feel with 
          <a href="https://kreo-tech.com" target="_blank" rel="noopener noreferrer" className="mx-1 text-text hover:text-primary underline decoration-primary/30 underline-offset-2 transition-colors">
            Kreo Mechanical Keyboards
          </a>
          — designed for elites.
        </p>
      </div>
      
      <button 
        onClick={() => setIsVisible(false)}
        className="absolute right-4 top-1/2 -translate-y-1/2 text-secondary hover:text-primary transition-colors p-1"
        aria-label="Dismiss announcement"
      >
        <X size={14} />
      </button>
    </div>
  );
}
