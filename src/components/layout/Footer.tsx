"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useFocusModeStore } from "@/store/useFocusModeStore";

export function Footer() {
  const pathname = usePathname();
  const isFocused = useFocusModeStore((s) => s.isFocused);

  if (pathname === "/" && isFocused) return null;

  return (
    <footer className="bg-background border-t border-surface w-full py-2.5 z-50">
      <div className="max-w-[1500px] mx-auto px-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          {/* Left: Footer Links */}
          <div className="flex flex-wrap justify-center gap-4 text-secondary text-[11px] font-medium">
            <a href="mailto:contact@kreotype.com" className="flex items-center gap-1.5 hover:text-text transition-colors group">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m22 2-7 20-4-9-9-4Z" />
                <path d="M22 2 11 13" />
              </svg>
              Contact
            </a>
            <a href="/support" className="flex items-center gap-1.5 hover:text-text transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
              </svg>
              Support
            </a>
            <a href="https://github.com" target="_blank" rel="noreferrer noopener" className="flex items-center gap-1.5 hover:text-text transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1s5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
              </svg>
              GitHub
            </a>
            <a href="https://discord.gg" target="_blank" rel="noreferrer noopener" className="flex items-center gap-1.5 hover:text-text transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <circle cx="12" cy="12" r="2" />
              </svg>
              Discord
            </a>
            <a href="https://twitter.com" target="_blank" rel="noreferrer noopener" className="flex items-center gap-1.5 hover:text-text transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
              </svg>
              Twitter
            </a>
            <div className="w-px h-3 bg-surface hidden md:block self-center" />
            <Link href="/terms" className="hover:text-text transition-colors">Terms</Link>
            <Link href="/privacy" className="hover:text-text transition-colors">Privacy</Link>
          </div>

          {/* Right: Version */}
          <div className="text-secondary opacity-40 text-[9px] font-bold tracking-widest uppercase">
            v1.0.0
          </div>
        </div>
      </div>
    </footer>
  );
}