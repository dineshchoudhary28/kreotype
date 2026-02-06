"use client";

import { useThemeStore } from "@/store/themeStore";
import { themes } from "@/data/themes";

export default function SettingsPage() {
  const currentTheme = useThemeStore((s) => s.currentTheme.name);
  const setTheme = useThemeStore((s) => s.setTheme);

  return (
    <div className="w-full max-w-[1500px] mx-auto px-8 py-10 flex flex-col gap-8">
      {/* Header Section */}
      <div className="border-b border-surface pb-8">
        <h1 className="text-3xl font-bold text-text mb-2 flex items-center gap-3">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
            <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
          Settings
        </h1>
        <p className="text-secondary text-sm font-medium tracking-wide uppercase">
          Customize your Kreotype experience
        </p>
      </div>

      <div className="flex flex-col gap-10">
        {/* Theme Section */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-text mb-1">Theme</h2>
              <p className="text-xs text-secondary">Select a color palette for the interface</p>
            </div>
            <div className="px-3 py-1 bg-surface rounded-lg border border-surface text-[10px] font-bold text-primary uppercase tracking-widest">
              {themes.length} Themes Available
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {themes.map((theme) => {
              const isActive = currentTheme === theme.name;
              return (
                <button
                  key={theme.name}
                  onClick={() => setTheme(theme.name)}
                  className={`group relative flex flex-col gap-3 p-4 rounded-2xl border transition-all duration-300 cursor-pointer overflow-hidden ${
                    isActive
                      ? "border-primary bg-primary/5 shadow-lg shadow-primary/10"
                      : "border-surface bg-surface hover:border-primary/30 hover:bg-surface/50"
                  }`}
                >
                  <div className="flex justify-between items-center relative z-10">
                    <span
                      className={`text-xs font-bold transition-colors ${
                        isActive ? "text-text" : "text-secondary group-hover:text-text/80"
                      }`}
                    >
                      {theme.label}
                    </span>
                    {isActive && (
                      <div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_rgba(var(--primary-color),0.8)]" />
                    )}
                  </div>

                  <div className="flex gap-2 relative z-10">
                    {(["primary", "secondary", "accent"] as const).map((c) => (
                      <div
                        key={c}
                        className="w-4 h-4 rounded-full border border-black/20"
                        style={{ backgroundColor: theme.colors[c] }}
                        title={c}
                      />
                    ))}
                    <div 
                       className="w-4 h-4 rounded-full border border-black/20 ml-auto"
                       style={{ backgroundColor: theme.colors.background }}
                       title="background"
                    />
                  </div>
                  
                  {/* Subtle Background Accent */}
                  <div 
                    className="absolute bottom-0 right-0 w-16 h-16 opacity-10 group-hover:opacity-20 transition-opacity"
                    style={{ 
                      background: `radial-gradient(circle at bottom right, ${theme.colors.primary}, transparent)` 
                    }}
                  />
                </button>
              );
            })}
          </div>
        </section>
        
        {/* Placeholder for future settings */}
        <div className="mt-10 p-10 border border-dashed border-surface rounded-3xl flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 bg-surface rounded-2xl flex items-center justify-center mb-4 border border-surface">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-secondary/20"><path d="M12 20h.01"/><path d="M12 16h.01"/><path d="M12 12h.01"/><path d="M12 8h.01"/><path d="M12 4h.01"/><path d="M8 20h.01"/><path d="M8 16h.01"/><path d="M8 12h.01"/><path d="M8 8h.01"/><path d="M8 4h.01"/><path d="M16 20h.01"/><path d="M16 16h.01"/><path d="M16 12h.01"/><path d="M16 8h.01"/><path d="M16 4h.01"/><path d="M20 20h.01"/><path d="M20 16h.01"/><path d="M20 12h.01"/><path d="M20 8h.01"/><path d="M20 4h.01"/><path d="M4 20h.01"/><path d="M4 16h.01"/><path d="M4 12h.01"/><path d="M4 8h.01"/><path d="M4 4h.01"/></svg>
            </div>
            <h3 className="text-secondary font-bold text-sm uppercase tracking-widest mb-2">More Settings Coming Soon</h3>
            <p className="text-secondary/60 text-xs max-w-xs leading-relaxed">
                We&apos;re working on bringing you more customization options for your typing experience.
            </p>
        </div>
      </div>
    </div>
  );
}
