"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useFocusModeStore } from "@/store/useFocusModeStore";

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

  // In focus mode on home page
  if (pathname === "/" && isFocused) {
    // If mouse moved, show full header
    if (showUITemporarily) {
      // Fall through to render full header
    } else {
      // Show only the logo in its normal position
      return (
        <header className="bg-background py-3.5 px-6 w-full z-50">
          <div className="max-w-[1500px] mx-auto flex justify-between items-center font-['Inter']">
            <Link href="/" className="text-3xl font-bold text-primary tracking-tighter cursor-pointer">
              KREOTYPE
            </Link>
            {/* Empty spacer to maintain layout */}
            <div />
          </div>
        </header>
      );
    }
  }

  return (
    <header className="bg-background border-b border-surface py-3.5 px-6 w-full z-50">
      <div className="max-w-[1500px] mx-auto flex justify-between items-center font-['Inter']">
        {/* Left: Logo */}
        <Link href="/" className="text-3xl font-bold text-primary tracking-tighter cursor-pointer">
          KREOTYPE
        </Link>

        {/* Center: Main Navigation Icons */}
        <nav className="flex items-center gap-10 text-secondary">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;

            if (link.external) {
              return (
                <a
                  key={link.href}
                  href={link.href}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="hover:text-text transition-colors cursor-pointer p-1"
                  title={link.label}
                >
                  {link.icon}
                </a>
              );
            }

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`hover:text-text transition-colors cursor-pointer p-1 ${
                  isActive ? "text-primary" : ""
                }`}
                title={link.label}
              >
                {link.icon}
              </Link>
            );
          })}
        </nav>

        {/* Right: Actions and Profile */}
        <div className="flex items-center gap-6 text-secondary">
          {/* Theme Toggle */}
          <button className="hover:text-text transition-colors cursor-pointer" title="Change Theme">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          </button>

          {/* Notifications */}
          <button className="hover:text-text transition-colors cursor-pointer relative" title="Notifications">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            <span className="absolute -top-1 -right-1 bg-primary w-2.5 h-2.5 rounded-full border-2 border-background" />
          </button>

          {/* Profile */}
          {session?.user ? (
            <div className="flex items-center gap-4">
              <Link
                href="/account"
                className="w-10 h-10 rounded-full bg-surface border border-gray-900 flex items-center justify-center cursor-pointer overflow-hidden hover:border-secondary transition-colors"
                title="Account"
              >
                <span className="text-sm font-medium text-secondary">
                  {(session.user.name || session.user.email || "U").charAt(0).toUpperCase()}
                </span>
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="hover:text-text transition-colors cursor-pointer"
                title="Sign out"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="w-10 h-10 rounded-full bg-surface border border-gray-900 flex items-center justify-center cursor-pointer overflow-hidden hover:border-secondary transition-colors"
              title="Sign in"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-secondary">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}