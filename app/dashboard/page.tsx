"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Plus,
  User,
  Settings,
  LogOut,
  X,
  Pencil,
  Trash2,
  Share2,
  LayoutList,
  LayoutGrid,
} from "lucide-react";
import { motion } from "motion/react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { createList, getLists, updateList, deleteList } from "@/server/list";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const SUGGESTED_TAGS = [
  "Sports",
  "Lifestyle",
  "Travel",
  "Food",
  "Music",
  "Movies",
  "Books",
  "Tech",
  "Fashion",
  "Fitness",
  "Gaming",
  "Art",
];

type ListWithDetails = {
  id: string;
  userId: string;
  slug: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  items: { value: string }[];
  tags: string[];
};

function ListFormModal({
  open,
  onOpenChange,
  onSuccess,
  mode,
  listId,
  initialData,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  mode: "create" | "edit";
  listId?: string;
  initialData?: { name: string; items: string[]; tags: string[] };
}) {
  const [listName, setListName] = useState(initialData?.name ?? "Top Ten ");
  const [items, setItems] = useState<string[]>(
    initialData?.items ?? Array(10).fill(""),
  );
  const [tags, setTags] = useState<string[]>(initialData?.tags ?? []);
  const [tagInput, setTagInput] = useState("");
  const [filledCount, setFilledCount] = useState(
    initialData?.items?.filter((v) => v.trim()).length ?? 0,
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setListName(initialData?.name ?? "Top Ten ");
      setItems(initialData?.items ?? Array(10).fill(""));
      setTags(initialData?.tags ?? []);
      setTagInput("");
      setFilledCount(
        (initialData?.items ?? []).filter((v) => v.trim()).length ?? 0,
      );
    }
  }, [open, initialData]);

  const updateItem = (index: number, value: string) => {
    const next = [...items];
    next[index] = value;
    setItems(next);
    setFilledCount(next.filter((v) => v.trim()).length);
  };

  const addTag = (tag: string) => {
    const trimmed = tag.trim();
    if (trimmed && !tags.includes(trimmed) && tags.length < 5) {
      setTags([...tags, trimmed]);
    }
    setTagInput("");
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(tagInput);
    }
    if (e.key === "Backspace" && !tagInput && tags.length > 0) {
      setTags(tags.slice(0, -1));
    }
  };

  const handleSubmit = async () => {
    if (!listName.trim() || listName.trim() === "Top Ten") {
      toast.error("Give your list a name");
      return;
    }
    if (filledCount === 0) {
      toast.error("Add at least one item to your list");
      return;
    }

    setLoading(true);
    try {
      if (mode === "create") {
        await createList({
          name: listName.trim(),
          items,
          tags,
        });
        toast.success("List created!");
      } else if (listId) {
        await updateList(listId, {
          name: listName.trim(),
          items,
          tags,
        });
        toast.success("List updated!");
      }
      onOpenChange(false);
      onSuccess();
      setListName("Top Ten ");
      setItems(Array(10).fill(""));
      setTags([]);
    } catch (e) {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handlePasteList = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const text = e.clipboardData.getData("text");
    if (!text.trim()) return;
    const lines = text
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean)
      .slice(0, 10);
    if (lines.length < 1) return;
    e.preventDefault();
    const next = [...items];
    lines.forEach((line, i) => {
      if (i < 10) next[i] = line;
    });
    setItems(next);
    setFilledCount(next.filter((v) => v.trim()).length);
  };

  const title = mode === "create" ? "Create your top ten" : "Edit your list";
  const buttonLabel = mode === "create" ? "Create list" : "Save changes";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto rounded-2xl p-5 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-heading text-xl uppercase tracking-wide">
            {title}
          </DialogTitle>
          <DialogDescription className="text-xs">
            Name your list, add your picks, and tag it.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-1 space-y-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-neutral-500">
              List name
            </label>
            <Input
              value={listName}
              onChange={(e) => setListName(e.target.value)}
              placeholder="Top Ten ..."
              className="h-8 border-neutral-200 text-sm focus-visible:ring-tento-lavender"
            />
          </div>

          <div>
            <div className="mb-1 flex items-center justify-between gap-2">
              <label className="text-xs font-medium text-neutral-500">
                Your picks
              </label>
              <span className="shrink-0 text-[10px] text-neutral-400">
                {filledCount}/10
              </span>
            </div>
            <div className="grid grid-cols-2 gap-x-3 gap-y-1">
              {items.map((item, i) => (
                <div key={i} className="flex items-center gap-1">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-[9px] font-semibold text-neutral-500">
                    {i + 1}
                  </span>
                  <Input
                    value={item}
                    onChange={(e) => updateItem(i, e.target.value)}
                    placeholder={`Item ${i + 1}`}
                    className="h-7 border-neutral-200 text-xs focus-visible:ring-tento-lavender"
                  />
                </div>
              ))}
            </div>
            <div className="mt-2">
              <textarea
                placeholder="Or paste your list (one item per line)"
                onPaste={handlePasteList}
                rows={2}
                className="w-full resize-none rounded-md border border-neutral-200 bg-neutral-50/50 px-3 py-2 text-xs text-neutral-600 placeholder:text-neutral-400 focus:border-tento-lavender focus:outline-none focus:ring-1 focus:ring-tento-lavender"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-neutral-500">
              Tags
            </label>
            <div className="flex flex-wrap items-center gap-1.5 rounded-md border border-neutral-200 px-2 py-2 focus-within:ring-1 focus-within:ring-tento-lavender">
              {tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="gap-1 bg-neutral-100 pr-1 text-xs font-normal text-neutral-700">
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="ml-0.5 rounded-full p-0.5 hover:bg-neutral-200">
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
              <input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
                placeholder={tags.length === 0 ? "Add tags..." : ""}
                className="min-w-[80px] flex-1 border-none bg-transparent py-0.5 text-sm outline-none placeholder:text-neutral-400"
              />
            </div>
            {tags.length < 5 && (
              <div className="mt-1.5 flex flex-wrap gap-1">
                {SUGGESTED_TAGS.filter((t) => !tags.includes(t))
                  .slice(0, 5)
                  .map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => addTag(tag)}
                      className="rounded-full border border-neutral-200 px-2.5 py-0.5 text-xs text-neutral-500 transition-colors hover:border-tento-lavender hover:text-tento-lavender">
                      {tag}
                    </button>
                  ))}
              </div>
            )}
          </div>

          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="h-9 w-full cursor-pointer bg-tento-lavender text-xs font-semibold text-white hover:bg-tento-lavender-hover disabled:opacity-60">
            {loading ? (
              <span className="loading-dots">
                <span></span>
                <span></span>
                <span></span>
              </span>
            ) : (
              buttonLabel
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

const AVATAR_UPDATED_KEY = "tento-avatar-updated";

export default function Dashboard() {
  const router = useRouter();
  const { data: session, refetch: refetchSession } = authClient.useSession();
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editList, setEditList] = useState<ListWithDetails | null>(null);
  const [deleteListId, setDeleteListId] = useState<string | null>(null);
  const [lists, setLists] = useState<ListWithDetails[]>([]);
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");

  const displayName = session?.user?.name || "User";
  const initial = displayName.charAt(0).toUpperCase();

  const refreshLists = async () => {
    const data = await getLists();
    setLists(data as ListWithDetails[]);
  };

  useEffect(() => {
    refreshLists();
  }, []);

  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      sessionStorage.getItem(AVATAR_UPDATED_KEY)
    ) {
      sessionStorage.removeItem(AVATAR_UPDATED_KEY);
      refetchSession?.();
    }
  }, [refetchSession]);

  const handleLogout = async () => {
    await authClient.signOut();
    toast.success("Signed out");
    router.push("/");
  };

  const handleEdit = (l: ListWithDetails) => {
    setEditList(l);
    setEditOpen(true);
  };

  const handleDeleteClick = (listId: string) => setDeleteListId(listId);

  const handleDeleteConfirm = async () => {
    const listId = deleteListId;
    if (!listId) return;
    setDeleteListId(null);
    try {
      await deleteList(listId);
      toast.success("List deleted");
      refreshLists();
    } catch {
      toast.error("Could not delete");
    }
  };

  const profileUsername =
    (session?.user as { username?: string })?.username ??
    (session?.user?.name || "user");

  const handleShare = async (list: ListWithDetails) => {
    const username = profileUsername.toString().toLowerCase();
    const url = `${window.location.origin}/u/${username}/${list.slug}`;
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied!");
    } catch {
      toast.error("Could not copy");
    }
  };

  const editInitialData:
    | { name: string; items: string[]; tags: string[] }
    | undefined = editList
    ? (() => {
        const itemValues = editList.items.map(
          (i: { value: string }) => i.value,
        );
        const padded: string[] = [
          ...itemValues,
          ...Array(10 - itemValues.length).fill(""),
        ].slice(0, 10);
        return {
          name: editList.name,
          items: padded,
          tags: editList.tags,
        };
      })()
    : undefined;

  return (
    <div className="min-h-screen bg-background">
      <header className="flex items-center justify-between px-6 py-5">
        <Image src="/images/tentologo.svg" alt="Tento" width={44} height={43} />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <motion.button
              whileTap={{ scale: 0.98 }}
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 400, damping: 28 }}
              className="flex cursor-pointer items-center gap-2 rounded-full py-1 pl-1 pr-3 transition-colors hover:bg-neutral-50">
              {session?.user?.image ? (
                session.user.image.startsWith("data:") ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={session.user.image}
                    alt={displayName}
                    className="h-8 w-8 rounded-full object-cover"
                  />
                ) : (
                  <Image
                    src={session.user.image}
                    alt={displayName}
                    width={32}
                    height={32}
                    className="rounded-full object-cover"
                  />
                )
              ) : (
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-200 text-sm font-semibold text-amber-800">
                  {initial}
                </div>
              )}
              <span className="text-sm font-medium text-foreground">
                {displayName}
              </span>
            </motion.button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuLabel className="font-normal">
              <span className="text-sm text-neutral-500">
                tento/{profileUsername}
              </span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link
                href={`/u/${profileUsername.toString().toLowerCase()}`}
                className="flex cursor-pointer items-center gap-2">
                <User className="h-4 w-4" />
                Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link
                href="/settings"
                className="flex cursor-pointer items-center gap-2">
                <Settings className="h-4 w-4" />
                Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="cursor-pointer gap-2 text-red-600 focus:text-red-600"
              onClick={handleLogout}>
              <LogOut className="h-4 w-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>

      <main className="px-6 pb-12 pt-4">
        <div className="mx-auto max-w-xl space-y-5">
          <div className="flex items-center justify-between gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCreateOpen(true)}
              className="cursor-pointer gap-2 border-neutral-200 text-sm font-medium text-foreground">
              Create a new list
              <Plus className="h-4 w-4" />
            </Button>
            {lists.length > 0 && (
              <div className="flex items-center rounded-lg border border-neutral-200 p-0.5">
                <button
                  onClick={() => setViewMode("list")}
                  className={`flex h-8 w-8 items-center justify-center rounded-md transition-colors ${
                    viewMode === "list"
                      ? "bg-neutral-100 text-foreground"
                      : "text-neutral-500 hover:bg-neutral-50 hover:text-foreground"
                  }`}
                  aria-label="List view">
                  <LayoutList className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode("grid")}
                  className={`flex h-8 w-8 items-center justify-center rounded-md transition-colors ${
                    viewMode === "grid"
                      ? "bg-neutral-100 text-foreground"
                      : "text-neutral-500 hover:bg-neutral-50 hover:text-foreground"
                  }`}
                  aria-label="Grid view">
                  <LayoutGrid className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>

          {lists.length === 0 ? (
            <p className="pt-8 text-center text-sm text-neutral-400">
              No lists yet. Create one above.
            </p>
          ) : (
            <motion.div
              layout
              transition={{ type: "spring", stiffness: 350, damping: 30 }}
              className={`group/cards ${
                viewMode === "list"
                  ? "flex flex-col gap-4"
                  : "grid grid-cols-1 gap-4 sm:grid-cols-2"
              }`}>
              {lists.map((l: ListWithDetails) => (
                <motion.div
                  key={l.id}
                  layout
                  transition={{ type: "spring", stiffness: 350, damping: 30 }}
                  className="flex items-center justify-between gap-3 rounded-xl border border-neutral-200 bg-background px-5 py-4 transition-[opacity,filter,border-color] duration-300 ease-out group-has-[:hover]/cards:opacity-50 group-has-[:hover]/cards:blur-[1px] hover:opacity-100! hover:blur-none! hover:border-tento-lavender/50">
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/u/${profileUsername.toString().toLowerCase()}/${l.slug}`}
                      className={`block text-sm font-medium text-foreground ${
                        viewMode === "grid"
                          ? "line-clamp-2 wrap-break-word"
                          : "truncate"
                      }`}>
                      {l.name}
                    </Link>
                    {(l.tags.length > 0 || l.createdAt) && (
                      <div className="mt-1.5 flex flex-wrap items-center gap-2">
                        {l.tags.map((tag: string) => (
                          <span
                            key={tag}
                            className="rounded-full border border-neutral-200 px-2.5 py-0.5 text-xs text-neutral-500">
                            {tag}
                          </span>
                        ))}
                        {l.createdAt && (
                          <span className="text-xs text-neutral-400">
                            {new Date(l.createdAt).toLocaleDateString(
                              undefined,
                              {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              },
                            )}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <button
                      onClick={() => handleEdit(l)}
                      className="flex h-8 w-8 items-center justify-center rounded-md text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-foreground"
                      aria-label="Edit">
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleShare(l)}
                      className="flex h-8 w-8 items-center justify-center rounded-md text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-foreground"
                      aria-label="Share">
                      <Share2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteClick(l.id)}
                      className="flex h-8 w-8 items-center justify-center rounded-md text-neutral-500 transition-colors hover:bg-red-50 hover:text-red-500"
                      aria-label="Delete">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </main>

      <ListFormModal
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSuccess={refreshLists}
        mode="create"
      />
      <ListFormModal
        open={editOpen}
        onOpenChange={(open) => {
          setEditOpen(open);
          if (!open) setEditList(null);
        }}
        onSuccess={refreshLists}
        mode="edit"
        listId={editList?.id}
        initialData={editInitialData}
      />
      <AlertDialog
        open={deleteListId !== null}
        onOpenChange={(open) => !open && setDeleteListId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this list?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The list and all its items will be
              permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-500 text-white hover:bg-red-500/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
