"use client";

import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export default function Dashboard() {
  const router = useRouter();

  const handleLogout = async () => {
    await authClient.signOut();
    router.push("/");
  };

  return (
    <div className="relative min-h-screen bg-white">
      <button
        onClick={handleLogout}
        className="absolute top-6 right-6 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-500 transition-colors hover:border-tento-lavender hover:text-tento-lavender"
        aria-label="Log out"
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M18.36 6.64a9 9 0 1 1-12.73 0" />
          <line x1="12" y1="2" x2="12" y2="12" />
        </svg>
      </button>

      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted">Dashboard</p>
      </div>
    </div>
  );
}
