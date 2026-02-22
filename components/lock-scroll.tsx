"use client";

import { useEffect } from "react";

export function LockScroll() {
  useEffect(() => {
    const isMobile = window.matchMedia("(max-width: 767px)").matches;
    if (!isMobile) return;
    document.documentElement.style.overflow = "hidden";
    document.documentElement.style.height = "100dvh";
    document.body.style.overflow = "hidden";
    document.body.style.height = "100dvh";
    return () => {
      document.documentElement.style.overflow = "";
      document.documentElement.style.height = "";
      document.body.style.overflow = "";
      document.body.style.height = "";
    };
  }, []);
  return null;
}
