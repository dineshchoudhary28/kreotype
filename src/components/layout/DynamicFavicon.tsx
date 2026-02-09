"use client";

import { useEffect } from "react";

const FAVICON_SVG = `data:image/svg+xml,${encodeURIComponent(
  '<svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">' +
  '<text x="16" y="17" font-family="-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica,Arial,sans-serif" ' +
  'font-weight="900" font-size="26" fill="#685ACA" text-anchor="middle" dominant-baseline="central">K</text>' +
  '</svg>'
)}`;

export function DynamicFavicon() {
  useEffect(() => {
    let link: HTMLLinkElement | null = document.querySelector("link[rel='icon']");
    if (link) {
      link.href = FAVICON_SVG;
    } else {
      link = document.createElement("link");
      link.rel = "icon";
      link.href = FAVICON_SVG;
      document.head.appendChild(link);
    }
  }, []);

  return null;
}
