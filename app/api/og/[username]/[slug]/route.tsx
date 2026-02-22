import { ImageResponse } from "next/og";
import { getListOG } from "@/lib/og-data";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const runtime = "nodejs";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ username: string; slug: string }> }
) {
  const { username, slug } = await params;
  const data = await getListOG(username, slug);
  if (!data) {
    return new Response("Not found", { status: 404 });
  }

  let adeliaData: Buffer | null = null;
  let interData: ArrayBuffer | null = null;
  try {
    adeliaData = await readFile(
      join(process.cwd(), "public/fonts/ADELIA.otf")
    );
  } catch {
    // Fallback if font missing
  }
  try {
    const interRes = await fetch(
      "https://cdn.jsdelivr.net/npm/@fontsource/inter@5.0.8/files/inter-latin-400-normal.woff"
    );
    interData = await interRes.arrayBuffer();
  } catch {
    // Fallback if fetch fails
  }

  const fonts = [];
  if (adeliaData) {
    fonts.push({
      name: "Adelia",
      data: adeliaData,
      style: "normal" as const,
      weight: 400,
    });
  }
  if (interData) {
    fonts.push({
      name: "Inter",
      data: interData,
      style: "normal" as const,
      weight: 400,
    });
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: "#fdfdfc",
          padding: 48,
          fontFamily: "Inter, system-ui",
        }}
      >
        {/* List title - Adelia only (header) */}
        <h1
          style={{
            fontFamily: adeliaData ? "Adelia" : "Inter, system-ui",
            fontSize: 42,
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: 2,
            color: "#1a1a1a",
            marginBottom: 8,
            lineHeight: 1.2,
          }}
        >
          {data.list.name}
        </h1>

        {/* by @username, tags - Inter */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginBottom: 32,
            fontSize: 14,
            color: "#6b7280",
          }}
        >
          <span>by @{username}</span>
          {data.tags.length > 0 && (
            <>
              <span>·</span>
              <span>
                {data.tags.slice(0, 3).map((t) => `#${t}`).join(" ")}
              </span>
            </>
          )}
        </div>

        {/* Top 5 items - Inter */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 12,
            flex: 1,
          }}
        >
          {data.items.map((item, i) => (
            <div
              key={item.id}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 24,
                padding: "14px 20px",
                background: i % 2 === 0 ? "#fff" : "#f8f8f8",
                borderRadius: 8,
                border: "1px solid #eee",
              }}
            >
              <span
                style={{
                  fontSize: 18,
                  color: "#1a1a1a",
                  fontWeight: 500,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  flex: 1,
                }}
              >
                {item.value}
              </span>
              <span
                style={{
                  fontSize: 18,
                  fontWeight: 600,
                  color: "#7d6ba0",
                  minWidth: 36,
                  textAlign: "right",
                }}
              >
                {String(i + 1).padStart(2, "0")}
              </span>
            </div>
          ))}
        </div>

        {/* Footer - Inter */}
        <div
          style={{
            marginTop: "auto",
            display: "flex",
            alignItems: "center",
            gap: 8,
            fontSize: 14,
            color: "#6b7280",
            paddingTop: 24,
          }}
        >
          <span style={{ fontWeight: 600, color: "#1a1a1a" }}>tento</span>
          <span>·</span>
          <span>tento.so/u/{username}</span>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: fonts.length > 0 ? fonts : undefined,
    }
  );
}
