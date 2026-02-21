"use server";
import { auth } from "@/lib/auth";

export const signIn = async (username: string, password: string) => {
  await auth.api.signInUsername({
    body: { username, password },
  });
};

export const signUp = async (
  username: string,
  password: string,
  email: string,
  name: string
) => {
  await auth.api.signUpEmail({
    body: { email, password, name, username },
  });
};
