import { NextRequest, NextResponse } from "next/server";

const SAAVN_BASES = [
  "https://saavn.dev/api",
  "https://jiosaavn-api-ts.vercel.app/api",
];

async function saavnFetch(path: string): Promise<any> {
  for (const base of SAAVN_BASES) {
    try {
      const res = await fetch(`${base}${path}`, {
        headers: { Accept: "application/json" },
        next: { revalidate: 3600 },
      });
      if (!res.ok) continue;
      const json = await res.json();
      if (json?.success) return json;
    } catch {
      continue;
    }
  }
  return null;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type");
  const q = searchParams.get("q") ?? "";
  const limit = searchParams.get("limit") ?? "20";

  let path = "";
  if (type === "search") {
    path = `/search/songs?query=${encodeURIComponent(q)}&limit=${limit}&page=1`;
  } else {
    return NextResponse.json({ success: false, error: "Invalid type" }, { status: 400 });
  }

  const data = await saavnFetch(path);
  if (!data) {
    return NextResponse.json({ success: false, error: "Saavn unavailable" }, { status: 503 });
  }

  return NextResponse.json(data, {
    headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" },
  });
}
