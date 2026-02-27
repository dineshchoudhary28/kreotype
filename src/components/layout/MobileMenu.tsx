"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useThemeStore } from "@/store/themeStore";
import { themes } from "@/data/themes";
import { useState } from "react";
import { Palette, Check, ChevronDown } from "lucide-react";
import { motion } from "framer-motion";
import { MAINTENANCE_MODE } from "@/lib/maintenance";

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

interface MobileMenuProps {
  onClose: () => void;
  topOffset: number;
}

export function MobileMenu({ onClose, topOffset }: MobileMenuProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const currentTheme = useThemeStore((s) => s.currentTheme);
  const setTheme = useThemeStore((s) => s.setTheme);
  const [isThemeOpen, setIsThemeOpen] = useState(false);

  return (
    <>
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="md:hidden fixed inset-0 bg-background/50 z-40"
      onClick={onClose}
      style={{ top: topOffset }}
    />
    <motion.div
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      data-mobile-menu
      className="md:hidden fixed right-0 w-full max-w-sm bg-background z-50 p-4 flex flex-col overflow-y-auto pb-8"
      style={{ top: topOffset, height: `calc(100% - ${topOffset}px)` }}
    >
      <nav className="flex flex-col gap-4 mt-2">
        {navLinks.map((link) => {
          const isActive = pathname === link.href;

          if (link.external) {
            return (
              <a
                key={link.href}
                href={link.href}
                target="_blank"
                rel="noreferrer noopener"
                className="flex items-center gap-4 text-lg font-bold text-secondary hover:text-text transition-colors p-3 rounded-lg hover:bg-surface"
                onClick={onClose}
              >
                {link.icon}
                <span>{link.label}</span>
              </a>
            );
          }

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-4 text-lg font-bold p-3 rounded-lg hover:bg-surface transition-colors ${
                isActive ? "text-primary bg-surface" : "text-secondary hover:text-text"
              }`}
              onClick={onClose}
            >
              {link.icon}
              <span>{link.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Theme Changer */}
      <div className="relative">
        <button
          className={`hover:text-text transition-all cursor-pointer flex items-center justify-between w-full p-3 rounded-lg hover:bg-surface ${isThemeOpen ? 'text-text bg-surface' : ''}`}
          onClick={() => setIsThemeOpen(!isThemeOpen)}
        >
          <div className="flex items-center gap-4 text-lg font-bold text-secondary">
            <Palette size={26} />
            <span>Theme</span>
          </div>
          <ChevronDown size={20} className={`transition-transform duration-200 ${isThemeOpen ? 'rotate-180' : ''}`} />
        </button>

        {isThemeOpen && (
          <div className="absolute bottom-full left-0 w-full mb-2 max-h-[250px] overflow-y-auto bg-surface border border-surface rounded-xl shadow-2xl z-[100] animate-in fade-in zoom-in-95 duration-200 scrollbar-hide">
            <div className="p-2 grid grid-cols-1 gap-1">
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

      <div className="mt-4 flex flex-col gap-4">
        {/* Profile */}
        {session?.user ? (
          <div className="flex items-center justify-between gap-2 sm:gap-4 p-3 rounded-lg bg-surface">
            <Link
              href="/account"
              className="flex items-center gap-3"
              onClick={onClose}
            >
              <div
                className="w-10 h-10 rounded-full bg-background border border-surface flex items-center justify-center cursor-pointer overflow-hidden"
              >
                <span className="text-sm font-medium text-secondary">
                  {(session.user.name || session.user.email || "U").charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-text">{session.user.name || session.user.email}</span>
                <span className="text-xs text-secondary">Account</span>
              </div>
            </Link>
            <button
              onClick={() => {
                signOut({ callbackUrl: "/" });
                onClose();
              }}
              className="hover:text-text transition-colors cursor-pointer text-secondary"
              title="Sign out"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </button>
          </div>
        ) : !MAINTENANCE_MODE ? (
          <Link
            href="/login"
            className="w-full bg-primary text-background font-bold py-4 px-6 rounded-xl text-center hover:opacity-90 transition-opacity"
            onClick={onClose}
          >
            Sign In
          </Link>
        ) : null}
      </div>
    </motion.div>
    </>
  );
}
