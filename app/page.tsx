import Image from "next/image";
import Link from "next/link";

const topTenCards = [
  {
    text: "Top Ten Songs That Defined the 90s",
    left: -1,
    bottom: 18,
    rotate: 10,
  },
  { text: "Top Ten things to Do Before 30", left: 3, bottom: 42, rotate: -5 },
  { text: "Top Ten Hidden Gems in Greece", left: 9, bottom: 2, rotate: -2 },
  { text: "Top Ten Memories from My 20s", left: 2, bottom: -14, rotate: -7 },
  { text: "Top Ten things in the summer", left: 18, bottom: 24, rotate: 4 },
  {
    text: "Top Ten Movies to Watch When Bored",
    left: 26,
    bottom: -4,
    rotate: 7,
  },
  {
    text: "Top Ten Food I Enjoyed in the City",
    left: 23,
    bottom: -20,
    rotate: -4,
  },
  {
    text: "Top Ten things I Love About Mornings",
    left: 38,
    bottom: 10,
    rotate: 2,
  },
  {
    text: "Top Ten Apps I Deleted to Reclaim My Time",
    left: 44,
    bottom: -10,
    rotate: -3,
  },
  {
    text: "Top Ten Lovely Must-Haves for Beginners",
    left: 60,
    bottom: 4,
    rotate: -6,
  },
  {
    text: "Top Ten things I'd Do with a Teleporter",
    left: 72,
    bottom: 20,
    rotate: 5,
  },
  {
    text: "Top Ten Underrated Cities to Visit",
    left: 58,
    bottom: -8,
    rotate: -8,
  },
  {
    text: "Top Ten Books That Changed My Life",
    left: 82,
    bottom: 12,
    rotate: 6,
  },
  {
    text: "Top Ten Comfort Foods for Rainy Days",
    left: 90,
    bottom: -12,
    rotate: -4,
  },
  {
    text: "Top Ten Places to Watch the Sunset",
    left: 14,
    bottom: -22,
    rotate: 3,
  },
  {
    text: "Top Ten Guilty Pleasure TV Shows",
    left: 34,
    bottom: 38,
    rotate: -8,
  },
  { text: "Top Ten Hiking Trails in Europe", left: 50, bottom: -18, rotate: 5 },
  {
    text: "Top Ten Podcasts for Long Drives",
    left: 68,
    bottom: 36,
    rotate: -3,
  },
  {
    text: "Top Ten Coffee Shops Around the World",
    left: 78,
    bottom: -20,
    rotate: 8,
  },
  {
    text: "Top Ten Skills I Learned This Year",
    left: -3,
    bottom: -6,
    rotate: -11,
  },
  {
    text: "Top Ten Albums That Shaped My Taste",
    left: 42,
    bottom: 28,
    rotate: 6,
  },
  {
    text: "Top Ten Weird Facts I Can't Forget",
    left: 88,
    bottom: 32,
    rotate: -5,
  },
  {
    text: "Top Ten Things to Do on a Rainy Day",
    left: 12,
    bottom: 50,
    rotate: 7,
  },
  {
    text: "Top Ten Street Foods Worth Trying",
    left: 54,
    bottom: 44,
    rotate: -4,
  },
  {
    text: "Top Ten Life Lessons from My Parents",
    left: 30,
    bottom: -16,
    rotate: 9,
  },
  {
    text: "Top Ten Unpopular Opinions I Stand By",
    left: 66,
    bottom: -14,
    rotate: -7,
  },
  {
    text: "Top Ten Dream Travel Destinations",
    left: 46,
    bottom: 52,
    rotate: 3,
  },
  {
    text: "Top Ten Childhood Snacks I Still Love",
    left: 80,
    bottom: 48,
    rotate: -9,
  },
];

export default function Home() {
  return (
    <div className="relative h-screen w-full overflow-hidden bg-background">
      <div className="flex h-full flex-col items-center justify-center gap-3 px-6 sm:gap-5">
        <Image
          src="/images/tentologo.svg"
          alt="Tento"
          width={48}
          height={47}
          priority
          className="animate-fade-up h-9 w-9 sm:h-12 sm:w-12"
          style={{ animationDelay: "0ms" }}
        />

        <h1
          className="animate-fade-up max-w-[200px] text-center font-heading text-xl uppercase leading-tight tracking-wide text-foreground sm:max-w-xs sm:text-3xl"
          style={{ animationDelay: "80ms" }}>
          Your favorite things
          <br />
          in a list of ten
        </h1>

        <p
          className="animate-fade-up max-w-[220px] text-center text-sm leading-relaxed text-muted sm:max-w-[280px] sm:text-base"
          style={{ animationDelay: "160ms" }}>
          Share the rituals you love, the habits you hate, and the quirks that
          make you, you. What's on your list?
        </p>

        <Link
          href="/sign-in"
          className="animate-fade-up mt-1 inline-flex cursor-pointer items-center justify-center rounded-lg bg-tento-lavender px-10 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-tento-lavender-hover sm:px-16 sm:py-3 sm:text-sm"
          style={{ animationDelay: "240ms" }}>
          Log in
        </Link>
      </div>

      <div className="pointer-events-none absolute inset-0">
        {topTenCards.map((card, i) => (
          <button
            key={card.text}
            className="topic-card pointer-events-auto"
            style={
              {
                left: `${card.left}%`,
                bottom: `${card.bottom}px`,
                "--rotate": `${card.rotate}deg`,
                "--hover-rotate": `${-card.rotate * 1.5}deg`,
                "--active-rotate": `${card.rotate * 2}deg`,
                "--delay": `${300 + i * 60}ms`,
              } as React.CSSProperties
            }>
            {card.text}
          </button>
        ))}
      </div>
    </div>
  );
}
