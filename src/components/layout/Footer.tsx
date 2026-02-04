"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useFocusModeStore } from "@/store/useFocusModeStore";
import { useConfigStore } from "@/store/useConfigStore";
import { getPageWidthClass } from "@/lib/page-width";

export function Footer() {
  const pathname = usePathname();
  const isFocused = useFocusModeStore((s) => s.isFocused);
  const pageWidth = useConfigStore((s) => s.pageWidth);

  // Hide footer during focus mode on homepage
  if (pathname === "/" && isFocused) return null;

  return (
    <footer className={`w-full ${getPageWidthClass(pageWidth)} mx-auto px-6 py-8 text-sm text-secondary`}>
      <div className="flex flex-col gap-6">
        {/* Key Tips */}
        <div className="flex items-center justify-center gap-1 text-center opacity-70">
          <kbd className="bg-surface px-1.5 py-0.5 rounded text-text">tab</kbd>
          <span>+</span>
          <kbd className="bg-surface px-1.5 py-0.5 rounded text-text">enter</kbd>
          <span>- restart test</span>
          <span className="mx-2">|</span>
          <kbd className="bg-surface px-1.5 py-0.5 rounded text-text">esc</kbd>
          <span>- command line</span>
        </div>

        {/* Links & Info */}
        <div className="flex justify-between items-center w-full">
          {/* Left: Links */}
          <div className="flex items-center gap-4">
            <a
              href="mailto:contact@kreotype.com"
              className="hover:text-text transition-colors flex items-center gap-2"
            >
              <span className="opacity-50">@</span>contact
            </a>
            <a
              href="https://github.com"
              target="_blank"
              rel="noreferrer noopener"
              className="hover:text-text transition-colors flex items-center gap-2"
            >
              <span className="opacity-50">&lt;/&gt;</span>github
            </a>
            <Link href="/about" className="hover:text-text transition-colors flex items-center gap-2">
              <span className="opacity-50">?</span>about
            </Link>
          </div>

          {/* Right: Version */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 cursor-help hover:text-text transition-colors">
              <span className="opacity-50">v</span>1.0.0
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}