"use client";

import { settingGroups } from "@/core/settings-metadata";
import { cn } from "@/lib/utils";

export function SettingsQuickNav() {
  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const y = el.getBoundingClientRect().top + window.scrollY - 80; // Offset for sticky header
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  return (
    <nav className="flex flex-wrap gap-2 mb-8 sticky top-0 z-20 bg-background/80 backdrop-blur-md py-4 border-b border-secondary/10 -mx-4 px-4">
      {settingGroups.map((group) => (
        <button
          key={group.id}
          onClick={() => scrollTo(`settings-${group.id}`)}
          className={cn(
            "px-3 py-1 text-xs font-medium rounded-full transition-all duration-200",
            "text-secondary hover:text-text hover:bg-surface",
            "focus:outline-none focus:ring-1 focus:ring-primary/50"
          )}
        >
          {group.label}
        </button>
      ))}
    </nav>
  );
}
