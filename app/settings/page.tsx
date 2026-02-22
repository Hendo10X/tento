"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { AnimatedLink } from "@/components/animated-link";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
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

export default function SettingsPage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const [displayName, setDisplayName] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [deletePassword, setDeletePassword] = useState("");
  const [nameLoading, setNameLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  useEffect(() => {
    if (!session?.user) return;
    if (session.user.name) setDisplayName(session.user.name);
    else if ((session.user as { username?: string }).username)
      setDisplayName((session.user as { username?: string }).username ?? "");
  }, [session]);

  useEffect(() => {
    if (!isPending && !session) router.replace("/sign-in");
  }, [session, isPending, router]);

  const handleUpdateName = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = displayName.trim();
    if (!trimmed) {
      toast.error("Display name is required");
      return;
    }
    setNameLoading(true);
    try {
      const { error } = await authClient.updateUser({ name: trimmed });
      if (error) throw new Error(error.message);
      toast.success("Display name updated");
    } catch {
      toast.error("Could not update");
    } finally {
      setNameLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    setPasswordLoading(true);
    try {
      const { error } = await authClient.changePassword({
        currentPassword,
        newPassword,
      });
      if (error) throw new Error(error.message);
      toast.success("Password updated");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch {
      toast.error("Could not update password");
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!deletePassword) {
      toast.error("Enter your password to confirm");
      return;
    }
    setDeleteLoading(true);
    try {
      const { error } = await authClient.deleteUser({ password: deletePassword });
      if (error) throw new Error(error.message);
      toast.success("Account deleted");
      setDeleteOpen(false);
      router.replace("/");
    } catch {
      toast.error("Could not delete account");
    } finally {
      setDeleteLoading(false);
    }
  };

  if (isPending || !session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <span className="loading-dots">
          <span></span><span></span><span></span>
        </span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="flex items-center justify-between px-4 py-4">
        <Image src="/images/tentologo.svg" alt="Tento" width={36} height={35} />
        <AnimatedLink
          href="/dashboard"
          className="flex cursor-pointer items-center gap-2 rounded-full border border-neutral-200 px-3.5 py-2 text-sm font-medium text-foreground transition-colors hover:bg-neutral-50">
          <svg
            className="h-4 w-4 -translate-x-0.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back
        </AnimatedLink>
      </header>

      <main className="mx-auto max-w-md px-6 py-8">
        <h1 className="mb-8 font-heading text-xl uppercase tracking-wide text-foreground">
          Settings
        </h1>

        <div className="space-y-8">
          {/* 1. Display name */}
          <section>
            <h2 className="mb-2 text-sm font-medium text-neutral-600">
              Display name
            </h2>
            <p className="mb-3 text-xs text-neutral-500">
              This is how you appear on your profile and lists
            </p>
            <form onSubmit={handleUpdateName} className="flex gap-2">
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Your name"
                className="h-9 flex-1 rounded-lg border border-neutral-200 bg-white px-3 text-sm text-foreground placeholder:text-neutral-400 focus:border-tento-lavender focus:outline-none focus:ring-1 focus:ring-tento-lavender"
              />
              <Button
                type="submit"
                disabled={nameLoading}
                className="h-9 cursor-pointer bg-tento-lavender px-4 text-sm font-medium text-white hover:bg-tento-lavender-hover disabled:opacity-60">
                {nameLoading ? "…" : "Save"}
              </Button>
            </form>
          </section>

          {/* 2. Change password */}
          <section>
            <h2 className="mb-2 text-sm font-medium text-neutral-600">
              Change password
            </h2>
            <p className="mb-3 text-xs text-neutral-500">
              Update your password to keep your account secure
            </p>
            <form onSubmit={handleChangePassword} className="space-y-3">
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Current password"
                required
                className="h-9 w-full rounded-lg border border-neutral-200 bg-white px-3 text-sm text-foreground placeholder:text-neutral-400 focus:border-tento-lavender focus:outline-none focus:ring-1 focus:ring-tento-lavender"
              />
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="New password"
                required
                minLength={8}
                className="h-9 w-full rounded-lg border border-neutral-200 bg-white px-3 text-sm text-foreground placeholder:text-neutral-400 focus:border-tento-lavender focus:outline-none focus:ring-1 focus:ring-tento-lavender"
              />
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                required
                className="h-9 w-full rounded-lg border border-neutral-200 bg-white px-3 text-sm text-foreground placeholder:text-neutral-400 focus:border-tento-lavender focus:outline-none focus:ring-1 focus:ring-tento-lavender"
              />
              <Button
                type="submit"
                disabled={passwordLoading}
                className="h-9 w-full cursor-pointer bg-tento-lavender text-sm font-medium text-white hover:bg-tento-lavender-hover disabled:opacity-60">
                {passwordLoading ? (
                  <span className="loading-dots">
                    <span></span><span></span><span></span>
                  </span>
                ) : (
                  "Update password"
                )}
              </Button>
            </form>
          </section>

          {/* 3. Delete account */}
          <section>
            <h2 className="mb-2 text-sm font-medium text-red-600">
              Delete account
            </h2>
            <p className="mb-3 text-xs text-neutral-500">
              Permanently delete your account and all your lists. This cannot be undone.
            </p>
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteOpen(true)}
              className="h-9 cursor-pointer border-red-200 text-sm font-medium text-red-600 hover:bg-red-50 hover:text-red-700">
              Delete my account
            </Button>
          </section>
        </div>
      </main>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete account?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete your account and all your lists. Enter your
              password to confirm.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-2">
            <input
              type="password"
              value={deletePassword}
              onChange={(e) => setDeletePassword(e.target.value)}
              placeholder="Your password"
              className="h-10 w-full rounded-lg border border-neutral-200 bg-white px-3 text-sm text-foreground placeholder:text-neutral-400 focus:border-tento-lavender focus:outline-none focus:ring-1 focus:ring-tento-lavender"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAccount}
              disabled={deleteLoading || !deletePassword}
              className="cursor-pointer bg-red-500 text-white hover:bg-red-600 disabled:opacity-50">
              {deleteLoading ? "Deleting…" : "Delete account"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
