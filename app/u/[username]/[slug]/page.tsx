import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { AnimatedLink } from "@/components/animated-link";
import { notFound } from "next/navigation";
import { getListByUsernameAndSlug } from "@/server/profile";
import { getBaseURL } from "@/lib/url";
import { ListActions } from "./list-actions";
import { ListProfileSection } from "./list-profile-section";
export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string; slug: string }>;
}): Promise<Metadata> {
  const { username, slug } = await params;
  const data = await getListByUsernameAndSlug(username, slug);
  if (!data) return {};

  const base = getBaseURL();

  return {
    title: `${data.list.name} by @${username} | Tento`,
    description: data.items
      .slice(0, 3)
      .map((i) => i.value)
      .join(", ") + (data.items.length > 3 ? "…" : ""),
    openGraph: {
      title: data.list.name,
      description: `A top ten list by @${username}`,
      images: [`${base}/api/og/${username}/${slug}`],
    },
    twitter: {
      card: "summary_large_image",
      title: data.list.name,
      description: `A top ten list by @${username}`,
      images: [`${base}/api/og/${username}/${slug}`],
    },
  };
}

export default async function ListPage({
  params,
}: {
  params: Promise<{ username: string; slug: string }>;
}) {
  const { username, slug } = await params;
  const data = await getListByUsernameAndSlug(username, slug);
  if (!data) notFound();

  const { list, user, items, tags, otherLists } = data;

  return (
    <div className="min-h-screen bg-background">
      <header className="flex items-center justify-between px-6 py-5">
        <Link href="/" className="shrink-0">
          <Image
            src="/images/tentologo.svg"
            alt="Tento"
            width={44}
            height={43}
          />
        </Link>

        <AnimatedLink
          href={`/u/${username}`}
          className="flex cursor-pointer items-center gap-2 rounded-full border border-neutral-200 px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-neutral-50"
        >
          <svg
            className="h-3.5 w-3.5 -translate-x-0.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back to {user.name || user.username}&rsquo;s profile
        </AnimatedLink>
      </header>

      <main className="mx-auto max-w-2xl px-6 pb-16 pt-4">
        <header className="mb-10">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <h1 className="font-heading text-2xl font-bold uppercase leading-tight tracking-wide text-foreground">
              {list.name}
            </h1>
            <ListActions
              username={username}
              slug={slug}
              listName={list.name}
              items={items}
            />
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-neutral-500">
            {tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-neutral-200 px-2.5 py-0.5 text-xs text-neutral-600"
              >
                {tag}
              </span>
            ))}
            <span className="tabular-nums">
              {new Date(list.createdAt).toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              })}
            </span>
          </div>
        </header>

        <ol className="w-full divide-y divide-neutral-200">
          {items.map((item, i) => (
            <li
              key={item.id}
              className="flex items-center justify-between gap-4 py-3 first:pt-0"
            >
              <span className="flex min-w-0 flex-1 text-sm text-foreground">
                {item.value}
              </span>
              <span className="shrink-0 text-sm text-neutral-400 tabular-nums">
                {String(i + 1).padStart(2, "0")}
              </span>
            </li>
          ))}
        </ol>

        <ListProfileSection
          username={username}
          otherLists={otherLists}
        />
      </main>
    </div>
  );
}
