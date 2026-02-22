"use client";

import Link from "next/link";
import { motion } from "motion/react";

const spring = { type: "spring" as const, stiffness: 400, damping: 28 };

const TAG_COLORS: Record<string, string> = {
  Sports: "bg-red-400 text-white",
  Lifestyle: "bg-sky-300 text-white",
  Travel: "bg-amber-400 text-white",
  Food: "bg-orange-400 text-white",
  Music: "bg-violet-400 text-white",
  Movies: "bg-rose-400 text-white",
  Books: "bg-emerald-400 text-white",
  Tech: "bg-blue-500 text-white",
  Fashion: "bg-pink-400 text-white",
  Fitness: "bg-green-500 text-white",
  Gaming: "bg-indigo-400 text-white",
  Art: "bg-fuchsia-400 text-white",
};

function tagClass(tag: string): string {
  return TAG_COLORS[tag] ?? "bg-neutral-300 text-neutral-700";
}

type List = {
  id: string;
  slug: string;
  name: string;
  createdAt: Date;
  tags: string[];
};

export function ProfileListCards({
  lists,
  username,
}: {
  lists: List[];
  username: string;
}) {
  return (
    <div
      className="grid grid-cols-1 gap-4 sm:grid-cols-2"
      style={{ perspective: "600px" }}
    >
      {lists.map((l) => (
        <Link key={l.id} href={`/u/${username}/${l.slug}`}>
          <motion.div
            whileTap={{ scale: 0.98, rotateX: 0, rotateY: 0 }}
            whileHover={{
              scale: 1.03,
              rotateX: 4,
              rotateY: -4,
              y: -6,
              transition: { ...spring, stiffness: 320, damping: 22 },
            }}
            transition={spring}
            style={{ transformStyle: "preserve-3d" }}
            className="block rounded-lg border border-neutral-200 bg-neutral-50/50 p-4 transition-colors hover:border-tento-lavender hover:bg-neutral-50"
          >
            <h3 className="text-sm font-semibold uppercase leading-snug text-foreground whitespace-nowrap overflow-hidden text-ellipsis">
              {l.name}
            </h3>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              {l.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className={`rounded px-2 py-0.5 text-xs font-medium ${tagClass(tag)}`}
                >
                  {tag}
                </span>
              ))}
            </div>
            <p className="mt-2 text-xs text-neutral-400">
              {new Date(l.createdAt).toLocaleDateString(undefined, {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </p>
          </motion.div>
        </Link>
      ))}
    </div>
  );
}
