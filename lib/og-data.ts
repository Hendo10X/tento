import { db } from "@/db/drizzle";
import { user, list, listItem, listTag } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";

export async function getProfileOG(username: string) {
  const [u] = await db
    .select()
    .from(user)
    .where(eq(user.username, username.toLowerCase()));
  if (!u) return null;
  const lists = await db
    .select()
    .from(list)
    .where(eq(list.userId, u.id))
    .orderBy(desc(list.updatedAt))
    .limit(10);

  const latestDate = lists[0]?.updatedAt ?? new Date();

  return {
    name: u.name || u.username || "User",
    lists,
    date: latestDate,
  };
}

export async function getListOG(username: string, slug: string) {
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
    db
      .select()
      .from(listItem)
      .where(eq(listItem.listId, l.id))
      .orderBy(listItem.rank)
      .limit(5),
    db.select().from(listTag).where(eq(listTag.listId, l.id)),
  ]);

  return {
    list: l,
    user: { name: u.name, username: u.username },
    items,
    tags: tags.map((t) => t.tag),
  };
}
