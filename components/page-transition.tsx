"use client";

import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";

const smoothEase = [0.25, 0.1, 0.25, 1] as const;

export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial={{
          opacity: 0,
          filter: "blur(10px)",
        }}
        animate={{
          opacity: 1,
          filter: "blur(0px)",
          transition: { duration: 0.4, ease: smoothEase },
        }}
        exit={{
          opacity: 0,
          filter: "blur(6px)",
          transition: { duration: 0.25, ease: smoothEase },
        }}
        className="min-h-screen"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
