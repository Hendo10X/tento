import Image from "next/image";
import Link from "next/link";
import { AnimatedLink } from "@/components/animated-link";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { getProfileByUsername } from "@/server/profile";
import { ProfileEdit } from "./profile-edit";
import { ProfileListCards } from "./profile-list-cards";

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
          href={isOwnProfile ? "/dashboard" : "/"}
          className="flex cursor-pointer items-center gap-2 rounded-full border border-neutral-200 px-3.5 py-2 text-sm font-medium text-foreground transition-colors hover:bg-neutral-50">
          <svg
            className="h-4 w-4 -translate-x-0.5"
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
        </AnimatedLink>
      </header>

      <main className="mx-auto max-w-3xl px-4 sm:px-6 pt-6 pb-20">
        <div className="flex flex-col items-center">
          <div className="relative">
            {profile.user.image ? (
              profile.user.image.startsWith("data:") ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={profile.user.image}
                  alt={displayName}
                  width={96}
                  height={96}
                  className="h-24 w-24 rounded-full object-cover"
                />
              ) : (
                <Image
                  src={profile.user.image}
                  alt={displayName}
                  width={96}
                  height={96}
                  className="rounded-full object-cover"
                />
              )
            ) : (
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-tento-lavender text-xl font-semibold text-white">
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

          <h1 className="mt-3 font-heading text-xl font-bold uppercase tracking-wide text-foreground">
            {displayName}
          </h1>

          <p className="mt-1 text-sm text-neutral-500">
            {profile.bio?.trim() || "No bio"}
          </p>

          <section className="mt-8 w-full">
            <h2 className="sr-only">Lists</h2>
            {profile.lists.length === 0 ? (
              <p className="text-center text-sm text-neutral-400">
                No lists yet
              </p>
            ) : (
              <ProfileListCards lists={profile.lists} username={username} />
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
