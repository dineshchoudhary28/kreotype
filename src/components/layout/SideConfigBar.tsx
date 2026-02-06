"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { useConfigStore } from "@/store/useConfigStore";
import { useFocusModeStore } from "@/store/useFocusModeStore";

const STORAGE_KEY = "kreotype_sidebar_expanded";

const patterns = [
  {
    id: "standard" as const,
    name: "standard",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="5" y1="12" x2="19" y2="12" />
      </svg>
    ),
  },
  {
    id: "wave" as const,
    name: "wave",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 6c.6.5 1.2 1 2.5 1C7 7 7 5 9.5 5c2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1" />
        <path d="M2 12c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1" />
        <path d="M2 18c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1" />
      </svg>
    ),
  },
  {
    id: "mountains" as const,
    name: "mountains",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="m8 3 4 8 5-5 5 15H2L8 3z" />
      </svg>
    ),
  },
];

function SidebarItem({
  icon,
  label,
  isExpanded,
  isActive,
  onClick,
}: {
  icon: ReactNode;
  label: string;
  isExpanded: boolean;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-4 transition-all p-2 rounded-lg hover:bg-surface group cursor-pointer overflow-hidden ${
        isActive ? "text-primary bg-primary/5" : "text-secondary hover:text-text"
      }`}
    >
      <div
        className={`flex-shrink-0 min-w-[20px] flex justify-center transition-colors ${
          isActive ? "text-primary" : "group-hover:text-primary"
        }`}
      >
        {icon}
      </div>
      <span
        className={`whitespace-nowrap text-sm font-medium transition-all duration-300 ${
          isExpanded ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"
        }`}
      >
        {label}
      </span>
    </button>
  );
}

export function SideConfigBar() {
  const pathname = usePathname();
  const isFocused = useFocusModeStore((s) => s.isFocused);
  const pattern = useConfigStore((s) => s.pattern);
  const lineMode = useConfigStore((s) => s.lineMode);
  const punctuation = useConfigStore((s) => s.punctuation);
  const numbers = useConfigStore((s) => s.numbers);
  const sidebarExpanded = useConfigStore((s) => s.sidebarExpanded);
  const setConfig = useConfigStore((s) => s.setConfig);

  useEffect(() => {
    const savedState = localStorage.getItem(STORAGE_KEY);
    if (savedState !== null) {
      setConfig("sidebarExpanded", savedState === "true");
    }
  }, [setConfig]);

  if (pathname !== "/" || isFocused) return null;

  const isExpanded = sidebarExpanded;

  const toggleSidebar = () => {
    const newState = !isExpanded;
    localStorage.setItem(STORAGE_KEY, String(newState));
    setConfig("sidebarExpanded", newState);
  };

  return (
    <aside
      className={`transition-all duration-300 ease-in-out z-40 flex flex-col bg-surface/50 border-r border-surface pt-6 h-full overflow-x-hidden select-none ${
        isExpanded ? "w-64" : "w-12"
      }`}
    >
      <div className="flex-1 overflow-y-auto overflow-x-hidden py-6 px-3 space-y-10 scrollbar-hide">
        {/* Toggle Button */}
        <div className={`flex transition-all duration-300 ${isExpanded ? "justify-end" : "justify-center"} mb-4`}>
          <button
            onClick={toggleSidebar}
            className="text-secondary hover:text-text bg-surface border border-surface transition-colors p-2 rounded-lg hover:border-secondary/30 cursor-pointer shadow-sm"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={`transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`}
            >
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>

        {/* Content Container - hidden entirely when collapsed */}
        <div
          className={`space-y-10 transition-all duration-300 ${
            isExpanded ? "opacity-100" : "opacity-0 pointer-events-none translate-x-[-20px]"
          }`}
        >
          {/* Patterns Section */}
          <div className="space-y-4">
            <div className="text-[10px] uppercase tracking-[0.2em] text-secondary font-bold px-2 opacity-40">
              Patterns
            </div>
            <div className="space-y-1">
              {patterns.map((p) => (
                <SidebarItem
                  key={p.id}
                  icon={p.icon}
                  label={p.name}
                  isExpanded={isExpanded}
                  isActive={pattern === p.id}
                  onClick={() => setConfig("pattern", p.id)}
                />
              ))}
            </div>
          </div>

          {/* Layout Section */}
          <div className="space-y-4">
            <div className="text-[10px] uppercase tracking-[0.2em] text-secondary font-bold px-2 opacity-40">
              Layout
            </div>
            <div className="space-y-1">
              <SidebarItem
                icon={
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                }
                label="Single Line"
                isExpanded={isExpanded}
                isActive={lineMode === "single"}
                onClick={() => setConfig("lineMode", "single")}
              />
              <SidebarItem
                icon={
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="7" x2="19" y2="7" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <line x1="5" y1="17" x2="19" y2="17" />
                  </svg>
                }
                label="Multi-line"
                isExpanded={isExpanded}
                isActive={lineMode === "multi"}
                onClick={() => setConfig("lineMode", "multi")}
              />
            </div>
          </div>

          {/* Toggles Section */}
          <div className="space-y-4">
            <div className="text-[10px] uppercase tracking-[0.2em] text-secondary font-bold px-2 opacity-40">
              Toggles
            </div>
            <div className="space-y-1">
              <SidebarItem
                icon={<span className="text-[14px] font-bold">@</span>}
                label="Punctuation"
                isExpanded={isExpanded}
                isActive={punctuation}
                onClick={() => setConfig("punctuation", !punctuation)}
              />
              <SidebarItem
                icon={<span className="text-[14px] font-bold">#</span>}
                label="Numbers"
                isExpanded={isExpanded}
                isActive={numbers}
                onClick={() => setConfig("numbers", !numbers)}
              />
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}