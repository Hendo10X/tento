import Link from "next/link";

type OtherList = { id: string; name: string; slug: string };

type ListProfileSectionProps = {
  username: string;
  otherLists: OtherList[];
};

export function ListProfileSection({
  username,
  otherLists,
}: ListProfileSectionProps) {
  return (
    <section className="mt-16 border-t border-neutral-200 pt-10">
      <p className="text-sm text-neutral-500">
        This list by{" "}
        <Link
          href={`/u/${username}`}
          className="font-medium text-foreground underline-offset-2 hover:underline"
        >
          @{username}
        </Link>
        {" "}—{" "}
        <Link
          href={`/u/${username}`}
          className="font-medium text-foreground underline-offset-2 hover:underline"
        >
          see all their lists →
        </Link>
      </p>
      {otherLists.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {otherLists.map((l) => (
            <Link
              key={l.id}
              href={`/u/${username}/${l.slug}`}
              className="rounded-lg border border-neutral-200 bg-neutral-50/50 px-3 py-2 text-sm text-foreground transition-colors hover:border-tento-lavender hover:bg-neutral-50"
            >
              {l.name}
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
