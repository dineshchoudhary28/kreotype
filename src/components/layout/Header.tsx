"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useFocusModeStore } from "@/store/useFocusModeStore";
import { useThemeStore } from "@/store/themeStore";
import { themes } from "@/data/themes";
import { useState, useRef, useEffect } from "react";
import { Palette, Check, ChevronDown, Menu, User, Settings, LogOut, X } from "lucide-react";
import { MobileMenu } from "./MobileMenu";
import { AnimatePresence, motion } from "framer-motion";
import { useUserData } from "@/hooks/use-user-data";
import { StreakCounter } from "@/components/features/StreakCounter";
import { MAINTENANCE_MODE } from "@/lib/maintenance";

const ANNOUNCEMENT_STORAGE_KEY = "kreotype_announcement_dismissed";

const navLinks = [
  {
    href: "/",
    label: "Typing Test",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    ),
  },
];

export function Header() {
  const pathname = usePathname();
  const { data: session, status: sessionStatus } = useSession();
  const { user, isLoading } = useUserData();
  const isFocused = useFocusModeStore((s) => s.isFocused);
  const showUITemporarily = useFocusModeStore((s) => s.showUITemporarily);
  
  const currentTheme = useThemeStore((s) => s.currentTheme);
  const setTheme = useThemeStore((s) => s.setTheme);
  
  const [mounted, setMounted] = useState(false);
  const [isThemeOpen, setIsThemeOpen] = useState(false);
  const [isUserOpen, setIsUserOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isBannerVisible, setIsBannerVisible] = useState(false);

  const headerRef = useRef<HTMLElement>(null);
  const themeDropdownRef = useRef<HTMLDivElement>(null);
  const userDropdownRef = useRef<HTMLDivElement>(null);
  const [headerHeight, setHeaderHeight] = useState(0);

  // Close everything on route change
  /* eslint-disable react-hooks/set-state-in-effect -- legitimate route-change and hydration sync */
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsNotificationOpen(false);
    setIsUserOpen(false);
    setIsThemeOpen(false);
  }, [pathname]);

  useEffect(() => setMounted(true), []);
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    function measure() {
      if (headerRef.current) {
        setHeaderHeight(headerRef.current.getBoundingClientRect().bottom);
      }
    }
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [isBannerVisible]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isDismissed = localStorage.getItem(ANNOUNCEMENT_STORAGE_KEY);
      if (!isDismissed) {
        setTimeout(() => setIsBannerVisible(true), 0);
      }
    }
  }, []);

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

  // Prevent body scroll when mobile menu or notification panel is open
  useEffect(() => {
    if (isMobileMenuOpen || isNotificationOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen, isNotificationOpen]);

  // In focus mode on home page — hide nav/actions but keep header height stable
  const isFocusedHome = pathname === "/" && isFocused;
  const showFullHeader = !isFocusedHome || showUITemporarily;

    return (
    <>
      <header ref={headerRef} className="bg-background border-b border-surface py-2.5 md:py-3.5 px-4 md:px-6 w-full z-40 relative">
        <div className="max-w-[1500px] mx-auto flex justify-between items-center font-['Inter']">
          {/* Left: Logo */}
          <div className="flex items-center">
            <Link href="/" className="text-2xl md:text-3xl font-bold text-primary tracking-tighter cursor-pointer" style={{ fontFamily: "'DM Sans', sans-serif" }}>
              KREOTYPE
            </Link>
          </div>

          {/* Center: Main Navigation Icons */}
          <nav
            className="hidden md:flex items-center justify-center gap-3 md:gap-5 lg:gap-8 text-secondary absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transition-opacity duration-200"
            style={{
              opacity: showFullHeader ? 1 : 0,
              visibility: showFullHeader ? "visible" : "hidden",
              pointerEvents: showFullHeader ? "auto" : "none",
            }}
          >
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              if (link.external) {
                return (
                  <a key={link.href} href={link.href} target="_blank" rel="noreferrer noopener" className="hover:text-text transition-colors cursor-pointer p-1" title={link.label}>
                    {link.icon}
                  </a>
                );
              }
              return (
                <Link key={link.href} href={link.href} className={`hover:text-text transition-colors cursor-pointer p-1 ${mounted && isActive ? "text-primary" : ""}`} title={link.label}>
                  {link.icon}
                </Link>
              );
            })}
          </nav>

          {/* Right: Actions and Profile */}
          <div
            className="flex justify-end items-center gap-2 md:gap-3 lg:gap-5 text-secondary transition-opacity duration-200"
            style={{
              opacity: showFullHeader ? 1 : 0,
              visibility: showFullHeader ? "visible" : "hidden",
              pointerEvents: showFullHeader ? "auto" : "none",
            }}
          >
            {/* Theme Changer Dropdown */}
            <div className="hidden md:block relative" ref={themeDropdownRef}>
              <button 
                className={`hover:text-text transition-all cursor-pointer flex items-center gap-1.5 px-2 py-1 rounded-lg hover:bg-surface ${isThemeOpen ? 'text-text bg-surface' : ''}`}
                title="Change Theme"
                onClick={() => setIsThemeOpen(!isThemeOpen)}
              >
                <Palette size={18} />
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

            {/* Streak Counter — only once session and user data are resolved */}
            {mounted && sessionStatus !== "loading" && session?.user && !isLoading && (user?.streak ?? 0) > 0 && (
              <StreakCounter streak={user!.streak!} />
            )}

            {/* Notifications */}
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                setIsUserOpen(false);
                setIsThemeOpen(false);
                setIsNotificationOpen((prev) => !prev);
              }}
              className={`hover:text-text transition-colors cursor-pointer relative ${isNotificationOpen ? "text-primary" : ""}`}
              title="Notifications"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
              {!isNotificationOpen && <span className="absolute -top-1 -right-1 bg-primary w-2 h-2 rounded-full border-2 border-background" />}
            </button>

            {/* Profile — skeleton while session resolves, then real content */}
            {!mounted || sessionStatus === "loading" ? (
              <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-surface animate-pulse" />
            ) : session?.user ? (
              <div className="relative" ref={userDropdownRef}>
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setIsNotificationOpen(false);
                    setIsThemeOpen(false);
                    setIsUserOpen((prev) => !prev);
                  }}
                  className={`flex items-center gap-1.5 md:gap-2 px-1.5 py-1 rounded-xl transition-all cursor-pointer hover:bg-surface/50 group ${isUserOpen ? 'bg-surface/50 text-text' : 'text-secondary hover:text-text'}`}
                  title="Account"
                >
                  <div className={`w-7 h-7 md:w-8 md:h-8 rounded-full bg-background border flex items-center justify-center overflow-hidden transition-colors ${isUserOpen ? 'border-primary/50' : 'border-surface group-hover:border-secondary'}`}>
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
            ) : !MAINTENANCE_MODE ? (
              <Link
                href="/login"
                className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-surface border border-surface flex items-center justify-center cursor-pointer overflow-hidden hover:border-secondary transition-colors"
                title="Sign in"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-secondary w-5 h-5">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </Link>
            ) : null}
            
            {/* Mobile Menu Button — transitions between hamburger and X */}
            <button
              onClick={() => {
                setIsNotificationOpen(false);
                setIsUserOpen(false);
                setIsThemeOpen(false);
                setIsMobileMenuOpen((prev) => !prev);
              }}
              className="md:hidden text-secondary hover:text-text ml-2 transition-colors"
            >
              <AnimatePresence mode="wait" initial={false}>
                {isMobileMenuOpen ? (
                  <motion.div
                    key="close"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    <X size={24} />
                  </motion.div>
                ) : (
                  <motion.div
                    key="menu"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    <Menu size={24} />
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <MobileMenu
            onClose={() => setIsMobileMenuOpen(false)}
            topOffset={headerHeight}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isNotificationOpen && (
          <NotificationPanel
            onClose={() => setIsNotificationOpen(false)}
            topOffset={headerHeight}
          />
        )}
      </AnimatePresence>
    </>
  );
}

const swarm65Images = [
  "https://cdn.shopify.com/s/files/1/0619/4325/1121/files/Frame1000006038.png?v=1764739426&width=1080",
  "https://cdn.shopify.com/s/files/1/0619/4325/1121/files/Swarm_65_Material.bip.622.png?v=1764825408&width=1080",
  "https://cdn.shopify.com/s/files/1/0619/4325/1121/files/Swarm_65_Material.bip.623.png?v=1764825408&width=1080",
  "https://cdn.shopify.com/s/files/1/0619/4325/1121/files/Swarm_65_Material.bip.626.png?v=1764825408&width=1080",
  "https://cdn.shopify.com/s/files/1/0619/4325/1121/files/Swarm_65_Material.bip.624.png?v=1764825408&width=1080",
  "https://cdn.shopify.com/s/files/1/0619/4325/1121/files/Swarm_65_Material.bip.620.png?v=1764825408&width=1080",
];

const swarmWhiteImages = [
  "https://cdn.shopify.com/s/files/1/0619/4325/1121/files/swarm_pass_through_material_file.bip.489.png?v=1763559972&width=1080",
  "https://cdn.shopify.com/s/files/1/0619/4325/1121/files/swarm_pass_through_material_file.bip.491.png?v=1763559972&width=1080",
  "https://cdn.shopify.com/s/files/1/0619/4325/1121/files/swarm_pass_through_material_file.bip.490.png?v=1763559972&width=1080",
  "https://cdn.shopify.com/s/files/1/0619/4325/1121/files/swarm_pass_through_material_file.bip.427_ded55aee-2e01-4dcc-bc87-79d332dbbaed.png?v=1763559972&width=1080",
  "https://cdn.shopify.com/s/files/1/0619/4325/1121/files/swarm_pass_through_material_file.bip.493.png?v=1763559972&width=1080",
  "https://cdn.shopify.com/s/files/1/0619/4325/1121/files/swarm_pass_through_material_file.bip.494.png?v=1763559972&width=1080",
  "https://cdn.shopify.com/s/files/1/0619/4325/1121/files/swarm_pass_through_material_file.bip.429.png?v=1763559972&width=1080",
];

function NotificationPanel({ onClose, topOffset }: { onClose: () => void; topOffset: number }) {
  const [swarm65Index, setSwarm65Index] = useState(0);
  const [swarmWhiteIndex, setSwarmWhiteIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setSwarm65Index((prev) => (prev + 1) % swarm65Images.length);
      setSwarmWhiteIndex((prev) => (prev + 1) % swarmWhiteImages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 bg-black/40 z-50"
        style={{ top: topOffset }}
        onClick={onClose}
      />

      {/* Panel — slides from right */}
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="fixed right-0 w-full max-w-sm bg-background border-l border-surface z-50 flex flex-col shadow-2xl"
        style={{ top: topOffset, height: `calc(100% - ${topOffset}px)` }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-surface">
          <div className="flex items-center gap-2.5">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            <h2 className="text-sm font-bold text-text uppercase tracking-widest">Notifications</h2>
          </div>
          <button
            onClick={onClose}
            className="text-secondary hover:text-text transition-colors cursor-pointer p-1 rounded-lg hover:bg-surface"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
          {/* Swarm65 Black Purple Ad */}
          <a
            href="https://kreo-tech.com"
            target="_blank"
            rel="noopener noreferrer"
            className="block"
          >
            <div className="group relative overflow-hidden rounded-2xl bg-surface border border-surface cursor-pointer hover:border-primary/30 transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-transparent to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />

              <div className="relative aspect-[16/10] overflow-hidden">
                <AnimatePresence mode="wait">
                  <motion.img
                    key={swarm65Images[swarm65Index]}
                    src={swarm65Images[swarm65Index]}
                    alt="Swarm65 Black Purple"
                    initial={{ opacity: 0, scale: 1.1 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.8 }}
                    className="w-full h-full object-cover"
                  />
                </AnimatePresence>
                <div className="absolute top-3 left-3 bg-primary text-background text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest shadow-lg shadow-primary/30 z-10">
                  New Arrival
                </div>
              </div>

              <div className="relative p-4 flex flex-col gap-2">
                <span className="text-primary text-[10px] font-black uppercase tracking-widest">Swarm Series</span>
                <h4 className="text-lg font-black text-text uppercase tracking-tighter leading-tight">
                  Swarm65 <span className="text-primary italic">Black Purple</span>
                </h4>
                <p className="text-secondary text-xs font-medium opacity-80 leading-relaxed">
                  Wireless Mechanical Gaming Keyboard with premium switches and elite purple accents.
                </p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-primary/50 text-[10px] font-bold tracking-widest uppercase">kreo-tech.com</span>
                  <span className="text-primary text-xs font-bold">Shop Now &rarr;</span>
                </div>
              </div>
            </div>
          </a>

          {/* Swarm White Purple Ad */}
          <a
            href="https://kreo-tech.com"
            target="_blank"
            rel="noopener noreferrer"
            className="block"
          >
            <div className="group relative overflow-hidden rounded-2xl bg-surface border border-surface cursor-pointer hover:border-primary/30 transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

              <div className="relative aspect-square rounded-t-2xl overflow-hidden bg-background/40">
                <AnimatePresence mode="wait">
                  <motion.img
                    key={swarmWhiteImages[swarmWhiteIndex]}
                    src={swarmWhiteImages[swarmWhiteIndex]}
                    alt="Swarm White Purple"
                    initial={{ opacity: 0, scale: 1.1 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.8 }}
                    className="w-full h-full object-cover"
                  />
                </AnimatePresence>
                <div className="absolute top-3 left-3 bg-primary text-background text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest shadow-lg shadow-primary/20 z-10">
                  Wireless Elite
                </div>
              </div>

              <div className="relative p-4 flex flex-col gap-2">
                <span className="text-primary text-[10px] font-black uppercase tracking-widest">Swarm Series</span>
                <h4 className="text-lg font-black text-text uppercase tracking-tighter leading-tight">
                  Swarm <span className="text-primary italic">White</span> Purple
                </h4>
                <p className="text-secondary text-xs font-medium opacity-80 leading-relaxed">
                  Clean aesthetic meets mechanical precision. Tri-mode connectivity for seamless gaming.
                </p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-primary/50 text-[10px] font-bold tracking-widest uppercase">kreo-tech.com</span>
                  <span className="text-primary text-xs font-bold">Shop Now &rarr;</span>
                </div>

                <div className="flex items-center gap-3 mt-2 pt-3 border-t border-surface/50">
                  <div className="flex -space-x-2">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="w-5 h-5 rounded-full border-2 border-surface bg-surface" />
                    ))}
                  </div>
                  <span className="text-[9px] text-secondary font-bold uppercase tracking-widest opacity-60">+200 reviews</span>
                </div>
              </div>
            </div>
          </a>

          {/* Empty state */}
          <div className="text-center py-4">
            <p className="text-[10px] text-secondary/40 font-bold uppercase tracking-widest">No new notifications</p>
          </div>
        </div>
      </motion.div>
    </>
  );
}