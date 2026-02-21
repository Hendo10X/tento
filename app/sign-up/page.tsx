"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";

const signUpSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(20, "Username must be at most 20 characters")
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "Only letters, numbers, and underscores allowed"
    ),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

async function checkUsernameAvailability(username: string) {
  const res = await fetch("/api/auth/is-username-available", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username }),
  });
  if (!res.ok) throw new Error("Failed to check");
  const data = await res.json();
  return data.available as boolean;
}

function Spinner() {
  return (
    <svg
      className="h-4 w-4 animate-spin text-neutral-400"
      viewBox="0 0 24 24"
      fill="none"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="3"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}

export default function SignUp() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [debouncedUsername, setDebouncedUsername] = useState("");
  const timerRef = useRef<ReturnType<typeof setTimeout>>(null);

  const trimmed = username.trim().toLowerCase();
  const isValidUsername = signUpSchema.shape.username.safeParse(trimmed).success;
  const isDebouncedValid =
    signUpSchema.shape.username.safeParse(debouncedUsername).success &&
    debouncedUsername.length >= 3;

  const { data: isAvailable, isFetching } = useQuery({
    queryKey: ["username-availability", debouncedUsername],
    queryFn: () => checkUsernameAvailability(debouncedUsername),
    enabled: isDebouncedValid,
    retry: false,
    staleTime: 10_000,
  });

  const isChecking =
    isFetching ||
    (isValidUsername && trimmed.length >= 3 && trimmed !== debouncedUsername);

  const usernameStatus =
    !isValidUsername || trimmed.length < 3
      ? "idle"
      : isChecking
        ? "checking"
        : isAvailable === true
          ? "available"
          : isAvailable === false
            ? "taken"
            : "idle";

  const canSubmit =
    !loading && usernameStatus !== "taken" && usernameStatus !== "checking";

  const handleUsernameChange = useCallback(
    (value: string) => {
      setUsername(value);
      setErrors((prev) => ({ ...prev, username: "" }));

      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        setDebouncedUsername(value.trim().toLowerCase());
      }, 500);
    },
    []
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const result = signUpSchema.safeParse({ username: trimmed, password });

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        const key = issue.path[0] as string;
        if (!fieldErrors[key]) fieldErrors[key] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }

    if (usernameStatus === "taken") {
      setErrors({ username: "This username is already taken" });
      return;
    }

    setErrors({});
    setLoading(true);

    const { error } = await authClient.signUp.email(
      {
        email: `${trimmed}@tento.app`,
        password,
        name: trimmed,
        username: trimmed,
      },
      {
        onSuccess: () => {
          toast.success("Account created successfully!");
          router.push("/dashboard");
        },
        onError: (ctx) => {
          toast.error(ctx.error.message);
          setErrors({ form: ctx.error.message });
        },
      }
    );

    if (error) {
      toast.error(error.message);
      setErrors({ form: error.message });
    }

    setLoading(false);
  };

  const usernameBorderColor = () => {
    if (errors.username) return "border-red-400";
    if (usernameStatus === "available") return "border-green-400";
    if (usernameStatus === "taken") return "border-red-400";
    return "border-neutral-200 focus-within:border-tento-lavender";
  };

  return (
    <div className="flex h-screen w-full items-center justify-center bg-white px-6">
      <div className="w-full max-w-sm">
        <Image
          src="/images/tentologo.svg"
          alt="Tento"
          width={40}
          height={39}
          priority
          className="mb-4"
        />

        <h1 className="mb-2 max-w-[260px] font-heading text-2xl uppercase leading-tight tracking-wide text-foreground">
          Sign up to get started
        </h1>

        <p className="mb-8 max-w-[280px] text-sm leading-relaxed text-muted">
          Create a simple username and a great password to get started
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div>
            <div
              className={`flex h-11 items-center rounded-lg border bg-white transition-colors ${usernameBorderColor()}`}
            >
              <span className="pl-4 text-sm text-neutral-400">tento/</span>
              <input
                type="text"
                placeholder="username"
                value={username}
                onChange={(e) => handleUsernameChange(e.target.value)}
                className="h-full flex-1 bg-transparent pr-4 text-sm text-foreground outline-none placeholder:text-neutral-400"
              />
              {usernameStatus === "checking" && (
                <span className="pr-3">
                  <Spinner />
                </span>
              )}
              {usernameStatus === "available" && (
                <span className="pr-3 text-xs font-medium text-green-500">
                  available
                </span>
              )}
              {usernameStatus === "taken" && (
                <span className="pr-3 text-xs font-medium text-red-500">
                  taken
                </span>
              )}
            </div>
            {errors.username && (
              <p className="mt-1 text-xs text-red-500">{errors.username}</p>
            )}
          </div>

          <div>
            <input
              type="password"
              placeholder="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setErrors((prev) => ({ ...prev, password: "" }));
              }}
              className={`h-11 w-full rounded-lg border bg-white px-4 text-sm text-foreground outline-none transition-colors placeholder:text-neutral-400 focus:border-tento-lavender ${errors.password ? "border-red-400" : "border-neutral-200"}`}
            />
            {errors.password && (
              <p className="mt-1 text-xs text-red-500">{errors.password}</p>
            )}
          </div>

          {errors.form && (
            <p className="text-xs text-red-500">{errors.form}</p>
          )}

          <button
            type="submit"
            disabled={!canSubmit}
            className="mt-1 h-11 w-full cursor-pointer rounded-lg bg-tento-lavender text-sm font-semibold text-white transition-colors hover:bg-tento-lavender-hover disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              <span className="loading-dots">
                <span></span>
                <span></span>
                <span></span>
              </span>
            ) : (
              "Sign up"
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-muted">
          Already have an account?{" "}
          <Link
            href="/sign-in"
            className="font-medium text-foreground underline-offset-2 hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
