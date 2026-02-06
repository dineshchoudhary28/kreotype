"use client";

import { useState, useEffect } from "react";

const STORAGE_KEY = "kreotype_announcement_dismissed";

export function AnnouncementBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const isDismissed = localStorage.getItem(STORAGE_KEY);
    if (!isDismissed) {
      setIsVisible(true);
    }
  }, []);

  if (!isVisible) return null;

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem(STORAGE_KEY, "true");
  };

  return (
    <div className="bg-primary text-background py-1.5 px-4 flex justify-between items-center relative z-50">
      <div className="flex-1 text-center font-bold text-[13px] tracking-wide uppercase">
        Welcome to Kreotype! The ultimate typing experience is here.
      </div>
      <button
        onClick={handleDismiss}
        className="ml-4 hover:bg-black/10 rounded-full p-1 transition-colors"
        aria-label="Dismiss announcement"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>
  );
}