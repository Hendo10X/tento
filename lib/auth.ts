import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "../db/drizzle";
import { nextCookies } from "better-auth/next-js";
import { username } from "better-auth/plugins";
import * as schema from "../db/schema";

export const auth = betterAuth({
  user: {
    deleteUser: { enabled: true },
  },
  emailAndPassword: {
    enabled: true,
  },
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),
  plugins: [nextCookies(), username()],
});
