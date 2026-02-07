"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

// Define colors for different pages. We'll use CSS variables from our theme.
const pathColorMap: Record<string, string> = {
  "/": "var(--primary-color)",
  "/profile": "var(--accent-color)", // Example: use accent color for profile
  "/account": "var(--secondary-color)", // Example: use secondary for account
  "/login": "var(--secondary-color)",
  "/register": "var(--secondary-color)",
};
const defaultColor = "var(--primary-color)";

const generateSvgDataUrl = (lineColor: string): string => {
  const svg = `
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <style>
        .text {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          font-weight: 800;
          font-size: 19px;
          fill: white;
          text-align: center;
          dominant-baseline: central;
          text-anchor: middle;
        }
      </style>
      <text x="16" y="16" class="text">kt</text>
      <line x1="0" y1="30" x2="32" y2="30" stroke="${lineColor}" stroke-width="3" />
    </svg>
  `;

  // Encode the SVG string for use in a data URL
  const encodedSvg = encodeURIComponent(svg.replace(/\s+/g, " "));
  return `data:image/svg+xml,${encodedSvg}`;
};

export function DynamicFavicon() {
  const pathname = usePathname();

  useEffect(() => {
    // Get the actual color value from the computed style of the root element
    const rootStyle = getComputedStyle(document.documentElement);
    const colorValue = rootStyle.getPropertyValue(pathColorMap[pathname] || defaultColor).trim();
    
    const faviconUrl = generateSvgDataUrl(colorValue || "#685ACA"); // Fallback color

    let link: HTMLLinkElement | null = document.querySelector("link[rel='icon']");

    if (link) {
      link.href = faviconUrl;
    } else {
      link = document.createElement("link");
      link.rel = "icon";
      link.href = faviconUrl;
      document.head.appendChild(link);
    }
  }, [pathname]);

  return null; // This component does not render anything
}
