import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getListByUsernameAndSlug } from "@/server/profile";

export default async function ListPage({
  params,
}: {
  params: Promise<{ username: string; slug: string }>;
}) {
  const { username, slug } = await params;
  const data = await getListByUsernameAndSlug(username, slug);
  if (!data) notFound();

  const { list, user, items, tags } = data;

  return (
    <div className="min-h-screen bg-white">
      <header className="flex items-center justify-between px-6 py-5">
        <Link href="/" className="shrink-0">
          <Image
            src="/images/tentologo.svg"
            alt="Tento"
            width={44}
            height={43}
          />
        </Link>

        <Link
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
        </Link>
      </header>

      <main className="mx-auto max-w-xl px-6 pb-16 pt-4">
        <div className="flex flex-col items-center text-center">
          <h1 className="font-heading text-2xl font-bold uppercase leading-tight tracking-wide text-foreground">
            {list.name}
          </h1>

          {tags.length > 0 && (
            <div className="mt-3 flex flex-wrap justify-center gap-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-neutral-200 px-2.5 py-0.5 text-xs text-neutral-600"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          <ol className="mt-8 w-full max-w-sm space-y-3 text-left">
            {items.map((item, i) => (
              <li key={item.id} className="flex gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-xs font-semibold text-neutral-600">
                  {i + 1}
                </span>
                <span className="pt-0.5 text-sm leading-relaxed text-foreground">
                  {item.value}
                </span>
              </li>
            ))}
          </ol>
        </div>
      </main>
    </div>
  );
}
