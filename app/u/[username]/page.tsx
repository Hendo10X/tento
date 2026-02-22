import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { getProfileByUsername } from "@/server/profile";
import { ProfileEdit } from "./profile-edit";

const TAG_COLORS: Record<string, string> = {
  Sports: "bg-red-400 text-white",
  Lifestyle: "bg-sky-300 text-white",
  Travel: "bg-amber-400 text-white",
  Food: "bg-orange-400 text-white",
  Music: "bg-violet-400 text-white",
  Movies: "bg-rose-400 text-white",
  Books: "bg-emerald-400 text-white",
  Tech: "bg-blue-500 text-white",
  Fashion: "bg-pink-400 text-white",
  Fitness: "bg-green-500 text-white",
  Gaming: "bg-indigo-400 text-white",
  Art: "bg-fuchsia-400 text-white",
};

function tagClass(tag: string): string {
  return TAG_COLORS[tag] ?? "bg-neutral-300 text-neutral-700";
}

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const profile = await getProfileByUsername(username);
  if (!profile) notFound();

  const session = await auth.api.getSession({ headers: await headers() });
  const isOwnProfile = session?.user?.id === profile.user.id;

  const displayName = (
    profile.user.name ||
    profile.user.username ||
    "User"
  ).toUpperCase();

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
          href={isOwnProfile ? "/dashboard" : "/"}
          className="flex cursor-pointer items-center gap-2 rounded-full border border-neutral-200 px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-neutral-50">
          <svg
            className="h-3.5 w-3.5 -translate-x-0.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back
        </Link>
      </header>

      <main className="mx-auto max-w-3xl px-2 sm:px-4 pt-4 pb-16">
        <div className="flex flex-col items-center">
          <div className="relative">
            {profile.user.image ? (
              profile.user.image.startsWith("data:") ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={profile.user.image}
                  alt={displayName}
                  width={64}
                  height={64}
                  className="h-16 w-16 rounded-full object-cover"
                />
              ) : (
                <Image
                  src={profile.user.image}
                  alt={displayName}
                  width={64}
                  height={64}
                  className="rounded-full object-cover"
                />
              )
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-tento-lavender text-lg font-semibold text-white">
                {displayName.charAt(0)}
              </div>
            )}
            {isOwnProfile && (
              <ProfileEdit
                initialBio={profile.bio ?? ""}
                initialImage={profile.user.image ?? ""}
                username={username}
              />
            )}
          </div>

          <h1 className="mt-2 font-heading text-lg font-bold uppercase tracking-wide text-foreground">
            {displayName}
          </h1>

          <p className="mt-0.5 text-xs text-neutral-500">
            {profile.bio?.trim() || "No bio"}
          </p>

          <section className="mt-6 w-full">
            <h2 className="sr-only">Lists</h2>
            {profile.lists.length === 0 ? (
              <p className="text-center text-xs text-neutral-400">
                No lists yet
              </p>
            ) : (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {profile.lists.map((l) => (
                  <Link
                    key={l.id}
                    href={`/u/${username}/${l.slug}`}
                    className="block rounded-lg border border-neutral-200 bg-neutral-50/50 p-3 transition-colors hover:border-tento-lavender hover:bg-neutral-50"
                  >
                    <h3 className="font-heading text-xs font-semibold uppercase leading-snug text-foreground whitespace-nowrap overflow-hidden text-ellipsis">
                      {l.name}
                    </h3>
                    <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                      {l.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className={`rounded px-1.5 py-0.5 text-[9px] font-medium ${tagClass(tag)}`}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <p className="mt-1.5 text-[9px] text-neutral-400">
                      {new Date(l.createdAt).toLocaleDateString(undefined, {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  </Link>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
