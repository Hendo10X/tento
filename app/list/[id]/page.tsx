import { redirect } from "next/navigation";
import { db } from "@/db/drizzle";
import { list, user } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";

export default async function ListPageLegacy({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [l] = await db.select().from(list).where(eq(list.id, id));
  if (!l) notFound();

  const [u] = await db.select({ username: user.username }).from(user).where(eq(user.id, l.userId));
  const username = u?.username;
  if (!username) notFound();

  redirect(`/u/${username}/${l.slug}`);
}
