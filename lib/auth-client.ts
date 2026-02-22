import { createAuthClient } from "better-auth/react";
import { usernameClient } from "better-auth/client/plugins";

function getBaseURL() {
  if (typeof window !== "undefined") return window.location.origin;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
}

export const authClient = createAuthClient({
  baseURL: getBaseURL(),
  plugins: [usernameClient()],
});
