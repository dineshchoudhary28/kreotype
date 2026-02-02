"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { Keyboard, Crown, ShoppingBag, Settings, Bell, User, LogOut } from "lucide-react";
import { ThemeSelector } from "@/components/ThemeSelector";

const navLinks = [
  { href: "/", icon: Keyboard, label: "test" },
  { href: "/leaderboards", icon: Crown, label: "leaderboards" },
  { href: "https://kreo-tech.com", icon: ShoppingBag, label: "buy", external: true },
  { href: "/settings", icon: Settings, label: "settings" },
];

export function Header() {
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <header className="flex items-center justify-between w-full max-w-7xl mx-auto px-6 py-6 relative">
      {/* LEFT: Logo */}
      <div className="flex items-center">
        <Link href="/" className="flex items-center gap-2 group">
          <img src="/logo.svg" alt="Kreotype" className="w-7 h-7" />
          <h1 className="text-2xl font-bold text-primary tracking-wider">
            kreotype
          </h1>
        </Link>
      </div>

      {/* CENTER: Navigation Icons */}
      <nav className="absolute left-1/2 transform -translate-x-1/2 flex items-center gap-6">
        {navLinks.map((link) => {
          const isActive = pathname === link.href;
          const Icon = link.icon;

          if (link.external) {
            return (
               <a
                key={link.href}
                href={link.href}
                target="_blank"
                rel="noreferrer noopener"
                className="text-secondary hover:text-text transition-colors p-2 rounded hover:bg-surface group relative"
                title={link.label}
              >
                <Icon size={20} />
              </a>
            );
          }

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`p-2 rounded transition-colors group relative ${
                isActive
                  ? "text-primary"
                  : "text-secondary hover:text-text hover:bg-surface"
              }`}
              title={link.label}
            >
              <Icon size={20} />
            </Link>
          );
        })}
      </nav>

      {/* RIGHT: Actions */}
      <div className="flex items-center gap-2">
        {/* Theme Changer */}
        <ThemeSelector />

        {/* Notifications */}
        <button
          className="text-secondary hover:text-text transition-colors p-2 rounded hover:bg-surface w-8 h-8 flex items-center justify-center"
          title="Notifications"
        >
          <Bell size={16} />
        </button>

        {session?.user ? (
          <>
            <Link
              href="/account"
              className="text-secondary hover:text-text transition-colors px-2 py-1 rounded hover:bg-surface text-sm"
              title="Account"
            >
              {session.user.name || session.user.email}
            </Link>
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="text-secondary hover:text-text transition-colors p-2 rounded hover:bg-surface w-8 h-8 flex items-center justify-center"
              title="Sign out"
            >
              <LogOut size={16} />
            </button>
          </>
        ) : (
          <Link
            href="/login"
            className="text-secondary hover:text-text transition-colors p-2 rounded hover:bg-surface w-8 h-8 flex items-center justify-center"
            title="Sign in"
          >
            <User size={16} />
          </Link>
        )}
      </div>
    </header>
  );
}
