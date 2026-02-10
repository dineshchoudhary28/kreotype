"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useFocusModeStore } from "@/store/useFocusModeStore";
import { useThemeStore } from "@/store/themeStore";
import { themes } from "@/data/themes";
import { useState, useRef, useEffect } from "react";
import { Palette, Check, ChevronDown, Menu, User, Settings, LogOut } from "lucide-react";
import { MobileMenu } from "./MobileMenu";

const navLinks = [
  {
    href: "/",
    label: "Typing Test",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="5" width="20" height="14" rx="2" ry="2" />
        <line x1="6" y1="15" x2="6" y2="15" />
        <line x1="10" y1="15" x2="14" y2="15" />
        <line x1="18" y1="15" x2="18" y2="15" />
        <line x1="6" y1="10" x2="6" y2="10" />
        <line x1="10" y1="10" x2="10" y2="10" />
        <line x1="14" y1="10" x2="14" y2="10" />
        <line x1="18" y1="10" x2="18" y2="10" />
      </svg>
    ),
  },
  {
    href: "/leaderboards",
    label: "Leaderboard",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
        <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
        <path d="M4 22h16" />
        <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
        <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
        <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
      </svg>
    ),
  },
  {
    href: "https://kreo-tech.com",
    label: "Shop",
    external: true,
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="9" cy="21" r="1" />
        <circle cx="20" cy="21" r="1" />
        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
      </svg>
    ),
  },
  {
    href: "/settings",
    label: "Settings",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    ),
  },
];

export function Header() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const isFocused = useFocusModeStore((s) => s.isFocused);
  const showUITemporarily = useFocusModeStore((s) => s.showUITemporarily);
  
  const currentTheme = useThemeStore((s) => s.currentTheme);
  const setTheme = useThemeStore((s) => s.setTheme);
  
  const [mounted, setMounted] = useState(false);
  const [isThemeOpen, setIsThemeOpen] = useState(false);
  const [isUserOpen, setIsUserOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const themeDropdownRef = useRef<HTMLDivElement>(null);
  const userDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => setMounted(true), []);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (themeDropdownRef.current && !themeDropdownRef.current.contains(event.target as Node)) {
        setIsThemeOpen(false);
      }
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
        setIsUserOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    // Cleanup on component unmount
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  // In focus mode on home page
  if (pathname === "/" && isFocused) {
    // If mouse moved, show full header
    if (showUITemporarily) {
      // Fall through to render full header
    } else {
      // Show only the logo in its normal position
      return (
        <header className="bg-background py-3.5 px-6 w-full z-40">
          <div className="max-w-[1500px] mx-auto grid grid-cols-3 items-center font-['Inter']">
            <div className="flex justify-start">
              <Link href="/" className="text-2xl md:text-3xl font-bold text-primary tracking-tighter cursor-pointer">
                KREOTYPE
              </Link>
            </div>
            <div />
            <div />
          </div>
        </header>
      );
    }
  }

    return (
    <>
      <header className="bg-background border-b border-surface py-2.5 md:py-3.5 px-4 md:px-6 w-full z-40 relative">
        <div className="max-w-[1500px] mx-auto flex justify-between items-center font-['Inter']">
          {/* Left: Logo */}
          <div className="flex items-center">
            <Link href="/" className="text-2xl md:text-3xl font-bold text-primary tracking-tighter cursor-pointer" style={{ fontFamily: "'DM Sans', sans-serif" }}>
              KREOTYPE
            </Link>
          </div>

          {/* Center: Main Navigation Icons */}
          <nav className="hidden md:flex items-center justify-center gap-4 sm:gap-6 md:gap-10 text-secondary absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              if (link.external) {
                return (
                  <a key={link.href} href={link.href} target="_blank" rel="noreferrer noopener" className="hover:text-text transition-colors cursor-pointer p-1" title={link.label}>
                    <span className="scale-90 md:scale-100 block">{link.icon}</span>
                  </a>
                );
              }
              return (
                <Link key={link.href} href={link.href} className={`hover:text-text transition-colors cursor-pointer p-1 ${mounted && isActive ? "text-primary" : ""}`} title={link.label}>
                  <span className="scale-90 md:scale-100 block">{link.icon}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right: Actions and Profile */}
          <div className="flex justify-end items-center gap-3 sm:gap-6 text-secondary">
            {/* Theme Changer Dropdown */}
            <div className="hidden md:block relative" ref={themeDropdownRef}>
              <button 
                className={`hover:text-text transition-all cursor-pointer flex items-center gap-1.5 px-2 py-1 rounded-lg hover:bg-surface ${isThemeOpen ? 'text-text bg-surface' : ''}`}
                title="Change Theme"
                onClick={() => setIsThemeOpen(!isThemeOpen)}
              >
                <Palette size={20} />
                <span className="hidden lg:inline text-[11px] font-bold uppercase tracking-widest">{currentTheme.label}</span>
                <ChevronDown size={14} className={`transition-transform duration-200 ${isThemeOpen ? 'rotate-180' : ''}`} />
              </button>
              {isThemeOpen && (
                <div className="absolute right-0 mt-2 w-64 max-h-[400px] overflow-y-auto bg-surface border border-surface rounded-xl shadow-2xl z-[100] animate-in fade-in zoom-in-95 duration-200 scrollbar-hide">
                  <div className="p-2 grid grid-cols-1 gap-1">
                    <div className="px-3 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-secondary opacity-40">Select Theme</div>
                    {themes.map((theme) => {
                      const isActive = currentTheme.name === theme.name;
                      return (
                        <button
                          key={theme.name}
                          onClick={() => {
                            setTheme(theme.name);
                            setIsThemeOpen(false);
                          }}
                          className={`flex items-center justify-between w-full px-3 py-2.5 rounded-lg transition-all text-left group cursor-pointer ${
                            isActive ? 'bg-primary/10 text-primary' : 'hover:bg-background text-secondary hover:text-text'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div 
                              className="w-3 h-3 rounded-full border border-black/20"
                              style={{ backgroundColor: theme.colors.primary }}
                            />
                            <span className="text-xs font-bold">{theme.label}</span>
                          </div>
                          {isActive && <Check size={14} />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Notifications */}
            <button className="hover:text-text transition-colors cursor-pointer relative hidden sm:block" title="Notifications">
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
              <span className="absolute -top-1 -right-1 bg-primary w-2 h-2 rounded-full border-2 border-background" />
            </button>

            {/* Profile Dropdown */}
            {session?.user ? (
              <div className="relative" ref={userDropdownRef}>
                <button
                  onClick={() => setIsUserOpen(!isUserOpen)}
                  className={`flex items-center gap-1.5 md:gap-2 px-1.5 py-1 rounded-xl transition-all cursor-pointer hover:bg-surface/50 group ${isUserOpen ? 'bg-surface/50 text-text' : 'text-secondary hover:text-text'}`}
                  title="Account"
                >
                  <div className={`w-8 h-8 md:w-9 md:h-9 rounded-full bg-background border flex items-center justify-center overflow-hidden transition-colors ${isUserOpen ? 'border-primary/50' : 'border-surface group-hover:border-secondary'}`}>
                    <span className="text-xs md:text-sm font-bold">
                      {(session.user.name || session.user.email || "U").charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <ChevronDown size={14} className={`transition-transform duration-200 ${isUserOpen ? 'rotate-180' : ''} opacity-60`} />
                </button>
                {isUserOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-surface border border-surface rounded-xl shadow-2xl z-[100] animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
                    <div className="p-2">
                      <div className="px-3 py-2 mb-1">
                        <p className="text-sm font-bold text-text truncate">{session.user.name || "User"}</p>
                        <p className="text-xs text-secondary truncate">{session.user.email}</p>
                      </div>
                      <div className="h-px bg-white/5 my-1" />
                      <Link href="/account" onClick={() => setIsUserOpen(false)} className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg transition-all text-sm text-left group cursor-pointer text-secondary hover:bg-background hover:text-text">
                        <User size={16} />
                        <span>Account</span>
                      </Link>
                      <Link href="/account-settings" onClick={() => setIsUserOpen(false)} className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg transition-all text-sm text-left group cursor-pointer text-secondary hover:bg-background hover:text-text">
                        <Settings size={16} />
                        <span>Settings</span>
                      </Link>
                      <div className="h-px bg-white/5 my-1" />
                      <button
                        onClick={() => {
                          setIsUserOpen(false);
                          signOut({ callbackUrl: "/" });
                        }}
                        className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg transition-all text-sm text-left group cursor-pointer text-secondary hover:bg-background hover:text-error"
                      >
                        <LogOut size={16} />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-surface border border-surface flex items-center justify-center cursor-pointer overflow-hidden hover:border-secondary transition-colors"
                title="Sign in"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-secondary w-5 h-5 md:w-6 md:h-6">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </Link>
            )}
            
            {/* Mobile Menu Button */}
            <button onClick={() => setIsMobileMenuOpen(true)} className="md:hidden text-secondary hover:text-text ml-2">
              <Menu size={24} />
            </button>
          </div>
        </div>
      </header>

      <MobileMenu 
        isOpen={isMobileMenuOpen} 
        onClose={() => setIsMobileMenuOpen(false)} 
      />
    </>
  );
}