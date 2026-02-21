"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";

const signInSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

export default function SignIn() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmed = username.trim().toLowerCase();
    const result = signInSchema.safeParse({ username: trimmed, password });

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        const key = issue.path[0] as string;
        if (!fieldErrors[key]) fieldErrors[key] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    setLoading(true);

    const { error } = await authClient.signIn.username(
      {
        username: trimmed,
        password,
      },
      {
        onSuccess: () => {
          toast.success("Welcome back!");
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
          Welcome back
        </h1>

        <p className="mb-8 max-w-[280px] text-sm leading-relaxed text-muted">
          Enter your username and password to continue
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div>
            <div
              className={`flex h-11 items-center rounded-lg border bg-white transition-colors ${errors.username ? "border-red-400" : "border-neutral-200 focus-within:border-tento-lavender"}`}
            >
              <span className="pl-4 text-sm text-neutral-400">tento/</span>
              <input
                type="text"
                placeholder="username"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setErrors((prev) => ({ ...prev, username: "" }));
                }}
                className="h-full flex-1 bg-transparent pr-4 text-sm text-foreground outline-none placeholder:text-neutral-400"
              />
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
            disabled={loading}
            className="mt-1 h-11 w-full cursor-pointer rounded-lg bg-tento-lavender text-sm font-semibold text-white transition-colors hover:bg-tento-lavender-hover disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              <span className="loading-dots">
                <span></span><span></span><span></span>
              </span>
            ) : "Sign in"}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-muted">
          Don&apos;t have an account?{" "}
          <Link
            href="/sign-up"
            className="font-medium text-foreground underline-offset-2 hover:underline"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
