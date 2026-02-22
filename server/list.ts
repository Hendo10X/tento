"use server";

import { auth } from "@/lib/auth";
import { db } from "@/db/drizzle";
import { list, listItem, listTag } from "@/db/schema";
import { headers } from "next/headers";
import { eq, desc, and } from "drizzle-orm";

function id() {
  return crypto.randomUUID();
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    || "list";
}

export async function getLists() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) return [];

  const lists = await db
    .select()
    .from(list)
    .where(eq(list.userId, session.user.id))
    .orderBy(desc(list.updatedAt));

  const result = await Promise.all(
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

  return result;
}

export async function createList(data: {
  name: string;
  items: string[];
  tags: string[];
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) throw new Error("Unauthorized");

  const listId = id();
  let slug = slugify(data.name.trim());
  const existing = await db
    .select()
    .from(list)
    .where(and(eq(list.userId, session.user.id), eq(list.slug, slug)));
  if (existing.length > 0) slug = `${slug}-${listId.slice(0, 8)}`;

  await db.insert(list).values({
    id: listId,
    userId: session.user.id,
    slug,
    name: data.name.trim(),
  });

  const itemValues = data.items
    .map((value, i) => ({ value: value.trim(), rank: i + 1 }))
    .filter((x) => x.value)
    .map(({ value, rank }) => ({
      id: id(),
      listId,
      rank: String(rank),
      value,
    }));
  if (itemValues.length > 0) {
    await db.insert(listItem).values(itemValues);
  }

  const tagValues = [...new Set(data.tags.map((t) => t.trim()).filter(Boolean))].map((tag) => ({
    id: id(),
    listId,
    tag,
  }));
  if (tagValues.length > 0) {
    await db.insert(listTag).values(tagValues);
  }

  return listId;
}

export async function updateList(
  listId: string,
  data: { name?: string; items?: string[]; tags?: string[] }
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) throw new Error("Unauthorized");

  const [existing] = await db.select().from(list).where(eq(list.id, listId));
  if (!existing || existing.userId !== session.user.id) throw new Error("Not found");

  if (data.name !== undefined) {
    const newName = data.name.trim();
    let newSlug = slugify(newName);
    const collision = await db
      .select()
      .from(list)
      .where(and(eq(list.userId, session.user.id), eq(list.slug, newSlug)));
    if (collision.length > 0 && collision[0].id !== listId) {
      newSlug = `${newSlug}-${listId.slice(0, 8)}`;
    }
    await db
      .update(list)
      .set({ name: newName, slug: newSlug })
      .where(eq(list.id, listId));
  }

  if (data.items !== undefined) {
    await db.delete(listItem).where(eq(listItem.listId, listId));
    const itemValues = data.items
      .map((value, i) => ({ value: value.trim(), rank: i + 1 }))
      .filter((x) => x.value)
      .map(({ value, rank }) => ({
        id: id(),
        listId,
        rank: String(rank),
        value,
      }));
    if (itemValues.length > 0) {
      await db.insert(listItem).values(itemValues);
    }
  }

  if (data.tags !== undefined) {
    await db.delete(listTag).where(eq(listTag.listId, listId));
    const tagValues = [...new Set(data.tags.map((t) => t.trim()).filter(Boolean))].map((tag) => ({
      id: id(),
      listId,
      tag,
    }));
    if (tagValues.length > 0) {
      await db.insert(listTag).values(tagValues);
    }
  }
}

export async function deleteList(listId: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) throw new Error("Unauthorized");

  const [existing] = await db.select().from(list).where(eq(list.id, listId));
  if (!existing || existing.userId !== session.user.id) throw new Error("Not found");

  await db.delete(list).where(eq(list.id, listId));
}
