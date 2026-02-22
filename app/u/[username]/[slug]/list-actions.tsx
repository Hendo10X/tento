"use client";

import { useState } from "react";
import { Share2, Download, Check, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type ListActionsProps = {
  username: string;
  slug: string;
  listName: string;
};

export function ListActions({
  username,
  slug,
  listName,
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
    <DropdownMenu>
      <DropdownMenuTrigger className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-neutral-200 bg-white px-2.5 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-neutral-50">
        <Share2 className="h-3.5 w-3.5" />
        Share
        <ChevronDown className="h-3 w-3 opacity-60" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={handleShare}
          className="cursor-pointer gap-2"
        >
          {copied ? (
            <Check className="h-4 w-4 text-green-600" />
          ) : (
            <Share2 className="h-4 w-4" />
          )}
          {copied ? "Copied!" : "Copy link"}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={handleDownload}
          className="cursor-pointer gap-2"
        >
          <Download className="h-4 w-4" />
          Save image
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
