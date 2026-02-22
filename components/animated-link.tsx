"use client";

import Link from "next/link";
import { motion } from "motion/react";

const spring = { type: "spring" as const, stiffness: 400, damping: 28 };

export function AnimatedLink({
  href,
  className,
  children,
  ...props
}: React.ComponentProps<typeof Link>) {
  return (
    <Link href={href} className={className} {...props}>
      <motion.span
        className="flex items-center gap-2"
        whileTap={{ scale: 0.98 }}
        whileHover={{ scale: 1.015 }}
        transition={spring}
      >
        {children}
      </motion.span>
    </Link>
  );
}
