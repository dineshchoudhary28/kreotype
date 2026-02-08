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
          {/* Left & Center: Footer Links */}
          <div className="flex flex-wrap justify-center items-center gap-4 text-secondary text-[11px] font-medium">
            {/* Social Links */}
            <a href="https://instagram.com/kreotype" target="_blank" rel="noopener noreferrer" className="hover:text-text transition-colors" aria-label="Instagram">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
            </a>
            <a href="https://twitter.com/kreotype" target="_blank" rel="noopener noreferrer" className="hover:text-text transition-colors" aria-label="Twitter">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path></svg>
            </a>
            <a href="https://linkedin.com/company/kreotype" target="_blank" rel="noopener noreferrer" className="hover:text-text transition-colors" aria-label="LinkedIn">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
            </a>
            <a href="https://reddit.com/r/kreotype" target="_blank" rel="noopener noreferrer" className="hover:text-text transition-colors" aria-label="Reddit">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20.9c-6.2-1.3-9.5-6-9.5-9.5 0-5.3 4.3-9.5 9.5-9.5s9.5 4.3 9.5 9.5c0 3.5-3.3 8.2-9.5 9.5zM12 15c-2.2 0-4-1.8-4-4s1.8-4 4-4 4 1.8 4 4-1.8 4-4 4zM12 21c-2.2 0-4-1.8-4-4h8c0 2.2-1.8 4-4 4z"></path><path d="m16.5 11.5-.5-2.5"></path><path d="m7.5 11.5.5-2.5"></path></svg>
            </a>
            <a href="mailto:kreotype@gmail.com" className="hover:text-text transition-colors" aria-label="Email">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
            </a>
            
            {/* Divider */}
            <div className="w-px h-3 bg-surface hidden md:block self-center" />

            {/* Page Links */}
            <Link href="/about" className="hover:text-text transition-colors">About</Link>
          </div>

          {/* Right: Copyright */}
          <div className="text-secondary opacity-60 text-[10px] font-medium">
            © {new Date().getFullYear()} Kreotype. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}