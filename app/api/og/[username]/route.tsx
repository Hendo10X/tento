import { ImageResponse } from "next/og";
import { getProfileOG } from "@/lib/og-data";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const runtime = "nodejs";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ username: string }> }
) {
  const { username } = await params;
  const data = await getProfileOG(username);
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
        {/* Header - @username in Adelia, rest in Inter */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginBottom: 24,
          }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 8,
              background: "#7d6ba0",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontSize: 20,
              fontWeight: 700,
              fontFamily: adeliaData ? "Adelia" : "Inter, system-ui",
            }}
          >
            {data.name.charAt(0).toUpperCase()}
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span
              style={{
                fontFamily: adeliaData ? "Adelia" : "Inter, system-ui",
                fontSize: 28,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: 2,
                color: "#1a1a1a",
              }}
            >
              @{username}
            </span>
            {data.bio && (
              <span
                style={{
                  fontSize: 16,
                  color: "#6b7280",
                  marginTop: 4,
                  maxWidth: 500,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {data.bio}
              </span>
            )}
          </div>
        </div>

        {/* Top 3 lists preview - Inter */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 12,
            flex: 1,
          }}
        >
          {data.lists.map((list, i) => (
            <div
              key={list.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 16,
                padding: "12px 16px",
                background: "#f4f4f4",
                borderRadius: 8,
                borderLeft: "4px solid #7d6ba0",
              }}
            >
              <span
                style={{
                  fontSize: 18,
                  fontWeight: 600,
                  color: "#7d6ba0",
                  minWidth: 28,
                }}
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <span
                style={{
                  fontSize: 16,
                  color: "#1a1a1a",
                  fontWeight: 500,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  flex: 1,
                }}
              >
                {list.name}
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
          }}
        >
          <span style={{ fontWeight: 600, color: "#1a1a1a" }}>tento</span>
          <span>·</span>
          <span>Your favorite things in a list of ten</span>
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
