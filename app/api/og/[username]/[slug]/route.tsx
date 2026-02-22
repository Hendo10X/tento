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

  const fonts: { name: string; data: ArrayBuffer; style: "normal"; weight: 400 }[] = [];
  if (adeliaData) {
    const ab = new ArrayBuffer(adeliaData.length);
    new Uint8Array(ab).set(adeliaData);
    fonts.push({
      name: "Adelia",
      data: ab,
      style: "normal",
      weight: 400,
    });
  }
  if (interData) {
    fonts.push({
      name: "Inter",
      data: interData,
      style: "normal",
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

        {/* Top 5 items - Inter, divide lines like UI */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
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
                padding: "12px 0",
                borderBottom: i < data.items.length - 1 ? "1px solid #e5e5e5" : "none",
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
                  fontSize: 14,
                  fontWeight: 500,
                  color: "#a3a3a3",
                  minWidth: 24,
                  textAlign: "right",
                }}
              >
                {String(i + 1).padStart(2, "0")}
              </span>
            </div>
          ))}
        </div>

        {/* Footer: username badge, tento, link, date */}
        <div
          style={{
            marginTop: "auto",
            paddingTop: 24,
            borderTop: "1px solid #e5e5e5",
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            gap: 12,
            fontSize: 14,
            color: "#6b7280",
          }}
        >
          <span
            style={{
              display: "flex",
              alignItems: "center",
              padding: "4px 10px",
              borderRadius: 6,
              border: "1px solid #e5e5e5",
              fontSize: 13,
              fontWeight: 600,
              color: "#1a1a1a",
            }}
          >
            @{username}
          </span>
          <span style={{ color: "#d4d4d4" }}>·</span>
          <span style={{ fontWeight: 600, color: "#1a1a1a" }}>tento</span>
          <span style={{ color: "#d4d4d4" }}>·</span>
          <span>tento.so/u/{username}</span>
          <span style={{ color: "#d4d4d4" }}>·</span>
          <span>
            {new Date(data.list.updatedAt).toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            })}
          </span>
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
