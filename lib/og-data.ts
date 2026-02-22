import { db } from "@/db/drizzle";
import { user, profile, list, listItem, listTag } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";

export async function getProfileOG(username: string) {
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
    .orderBy(desc(list.updatedAt))
    .limit(3);

  const listsWithItems = await Promise.all(
    lists.map(async (l) => {
      const items = await db
        .select()
        .from(listItem)
        .where(eq(listItem.listId, l.id))
        .orderBy(listItem.rank);
      return { ...l, items: items.slice(0, 3) };
    })
  );

  return {
    name: u.name || u.username || "User",
    bio: p?.bio?.trim() || null,
    lists: listsWithItems,
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
