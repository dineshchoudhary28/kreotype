"use client";

import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";

const STORAGE_KEY = "kreotype_announcement_dismissed";

const swarm65Images = [
  "https://cdn.shopify.com/s/files/1/0619/4325/1121/files/Frame1000006038.png?v=1764739426&width=1080",
  "https://cdn.shopify.com/s/files/1/0619/4325/1121/files/Swarm_65_Material.bip.622.png?v=1764825408&width=1080",
  "https://cdn.shopify.com/s/files/1/0619/4325/1121/files/Swarm_65_Material.bip.623.png?v=1764825408&width=1080",
  "https://cdn.shopify.com/s/files/1/0619/4325/1121/files/Swarm_65_Material.bip.626.png?v=1764825408&width=1080",
  "https://cdn.shopify.com/s/files/1/0619/4325/1121/files/Swarm_65_Material.bip.624.png?v=1764825408&width=1080",
  "https://cdn.shopify.com/s/files/1/0619/4325/1121/files/Swarm_65_Material.bip.620.png?v=1764825408&width=1080"
];

export function AnnouncementBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const isDismissed = localStorage.getItem(STORAGE_KEY);
    if (!isDismissed) {
      setTimeout(() => setIsVisible(true), 0);
    }
  }, []);

  useEffect(() => {
    if (!isVisible) return;
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % swarm65Images.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [isVisible]);

  if (!isVisible) return null;

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem(STORAGE_KEY, "true");
  };

  return (
    <div className="bg-primary text-background h-8 md:h-10 flex justify-between items-center relative z-50 overflow-hidden border-b border-white/5 px-4">
      {/* Background Decorative Pattern (Dots) */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--color-background)_1px,_transparent_1px)] bg-[size:10px_10px]" />
      {/* Background Decorative Gradient */}
      <div className="absolute inset-0 opacity-20 bg-gradient-to-r from-black/20 via-transparent to-black/20" />
      
      <div className="flex-1 flex items-center justify-center gap-4 relative z-10 h-full">
        {/* Large Clipped Image Container with Slideshow */}
        <div className="hidden sm:block relative h-full w-24 md:w-32">
          <AnimatePresence mode="wait">
            <motion.img 
              key={swarm65Images[currentImageIndex]}
              src={swarm65Images[currentImageIndex]} 
              alt="Swarm65" 
              initial={{ opacity: 0, scale: 0.8, rotate: -20 }}
              animate={{ opacity: 1, scale: 1, rotate: -12 }}
              exit={{ opacity: 0, scale: 1.2, rotate: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[45%] h-20 md:h-28 w-auto max-w-none brightness-110 drop-shadow-[0_0_20px_rgba(0,0,0,0.4)] pointer-events-none"
            />
          </AnimatePresence>
        </div>

        <div className="flex items-center gap-3">
          <p className="font-black text-xs md:text-sm tracking-tight uppercase italic leading-none">
            <span className="text-background/50 not-italic mr-2">Featured:</span>
            Swarm65 Black Purple Elite
          </p>
          
          <a 
            href="https://kreo-tech.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="bg-background text-primary px-3 py-0.5 md:py-1 rounded-full text-[10px] md:text-xs font-black uppercase tracking-tighter hover:bg-white transition-all hover:scale-105 active:scale-95 shadow-lg whitespace-nowrap"
          >
            Shop Now
          </a>
        </div>
      </div>

      <button
        onClick={handleDismiss}
        className="ml-2 opacity-40 hover:opacity-100 hover:bg-black/10 rounded-full p-1 transition-all relative z-10"
        aria-label="Dismiss announcement"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>
  );
}