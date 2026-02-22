"use client";

import { useState } from "react";
import Link from "next/link";
import { Share2, Download, Check } from "lucide-react";
import { toast } from "sonner";
import { motion } from "motion/react";

type ListActionsProps = {
  username: string;
  slug: string;
  listName: string;
  items: { value: string }[];
};

export function ListActions({
  username,
  slug,
  listName,
  items,
}: ListActionsProps) {
  const [copied, setCopied] = useState(false);

  const url =
    typeof window !== "undefined"
      ? `${window.location.origin}/u/${username}/${slug}`
      : "";

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("Link copied!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Could not copy");
    }
  };

  const handleDownload = async () => {
    try {
      const ogUrl = `${window.location.origin}/api/og/${username}/${slug}`;
      const res = await fetch(ogUrl);
      const blob = await res.blob();
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `${listName.replace(/[^a-z0-9]/gi, "-").toLowerCase()}.png`;
      a.click();
      URL.revokeObjectURL(a.href);
      toast.success("Image downloaded!");
    } catch {
      toast.error("Could not download");
    }
  };

  return (
    <div className="flex items-center gap-2">
      <motion.button
        onClick={handleShare}
        whileTap={{ scale: 0.98 }}
        whileHover={{ scale: 1.02 }}
        className="flex items-center gap-2 rounded-lg border border-neutral-200 bg-white px-3.5 py-2 text-sm font-medium text-foreground transition-colors hover:bg-neutral-50"
      >
        {copied ? (
          <Check className="h-4 w-4 text-green-600" />
        ) : (
          <Share2 className="h-4 w-4" />
        )}
        {copied ? "Copied!" : "Share"}
      </motion.button>
      <motion.button
        onClick={handleDownload}
        whileTap={{ scale: 0.98 }}
        whileHover={{ scale: 1.02 }}
        className="flex items-center gap-2 rounded-lg border border-neutral-200 bg-white px-3.5 py-2 text-sm font-medium text-foreground transition-colors hover:bg-neutral-50"
      >
        <Download className="h-4 w-4" />
        Save image
      </motion.button>
    </div>
  );
}
