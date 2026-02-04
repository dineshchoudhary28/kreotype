"use client";

import Link from "next/link";

export function MinimalHeader() {
  return (
    <div className="fixed top-6 left-6 z-10">
      <Link href="/" className="flex items-center gap-2 group">
        <img src="/logo.svg" alt="Kreotype" className="w-7 h-7 opacity-50 group-hover:opacity-100 transition-opacity" />
        <h1 className="text-xl font-bold text-primary/50 group-hover:text-primary tracking-wider transition-colors">
          kreotype
        </h1>
      </Link>
    </div>
  );
}
