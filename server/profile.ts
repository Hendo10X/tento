"use server";

import { auth } from "@/lib/auth";
import { db } from "@/db/drizzle";
import { user, profile, list, listItem, listTag } from "@/db/schema";
import { headers } from "next/headers";
import { eq, and, ne, desc } from "drizzle-orm";

function id() {
  return crypto.randomUUID();
}

export async function getProfileByUsername(username: string) {
  const [u] = await db
    .select()
    .from(user)
    .where(eq(user.username, username.toLowerCase()));
  if (!u) return null;

  const [p] = await db.select().from(profile).where(eq(profile.userId, u.id));

  const lists = await db
    .select()
    .from(list)
    .where(eq(list.userId, u.id))
    .orderBy(desc(list.updatedAt));

  const listsWithDetails = await Promise.all(
    lists.map(async (l) => {
      const [items, tags] = await Promise.all([
        db.select().from(listItem).where(eq(listItem.listId, l.id)),
        db.select().from(listTag).where(eq(listTag.listId, l.id)),
      ]);
      return {
        ...l,
        items: items.sort((a, b) => Number(a.rank) - Number(b.rank)),
        tags: tags.map((t) => t.tag),
      };
    })
  );

  return {
    user: { id: u.id, name: u.name, image: u.image, username: u.username },
    bio: p?.bio ?? null,
    lists: listsWithDetails,
  };
}

export async function getListByUsernameAndSlug(username: string, slug: string) {
  const [u] = await db
    .select()
    .from(user)
    .where(eq(user.username, username.toLowerCase()));
  if (!u) return null;

  const [l] = await db
    .select()
    .from(list)
    .where(and(eq(list.userId, u.id), eq(list.slug, slug)));
  if (!l) return null;

  const [items, tags] = await Promise.all([
    db.select().from(listItem).where(eq(listItem.listId, l.id)),
    db.select().from(listTag).where(eq(listTag.listId, l.id)),
  ]);

  const otherLists = await db
    .select({ id: list.id, name: list.name, slug: list.slug })
    .from(list)
    .where(and(eq(list.userId, u.id), ne(list.id, l.id)))
    .orderBy(desc(list.updatedAt))
    .limit(3);

  return {
    list: l,
    user: { username: u.username, name: u.name },
    items: items.sort((a, b) => Number(a.rank) - Number(b.rank)),
    tags: tags.map((t) => t.tag),
    otherLists,
  };
}

export async function updateProfile(data: { image?: string; bio?: string }) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) throw new Error("Unauthorized");

  const [existing] = await db
    .select()
    .from(profile)
    .where(eq(profile.userId, session.user.id));

  if (data.bio !== undefined) {
    if (existing) {
      await db
        .update(profile)
        .set({ bio: data.bio.trim() || null })
        .where(eq(profile.userId, session.user.id));
    } else {
      await db.insert(profile).values({
        id: id(),
        userId: session.user.id,
        bio: data.bio.trim() || null,
      });
    }
  }

  if (data.image !== undefined) {
    await db
      .update(user)
      .set({ image: data.image.trim() || null })
      .where(eq(user.id, session.user.id));
  }
}

export async function getMyUsername(): Promise<string | null> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) return null;
  const un = (session.user as { username?: string }).username ?? session.user.name;
  if (un) return String(un).toLowerCase();
  const [u] = await db.select({ username: user.username }).from(user).where(eq(user.id, session.user.id));
  return u?.username ?? null;
}
