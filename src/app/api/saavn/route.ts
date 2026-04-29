import { NextRequest, NextResponse } from "next/server";

const SAAVN_BASES = [
  "https://saavn.dev/api",
  "https://jiosaavn-api-ts.vercel.app/api",
  "https://jiosaavn-api-privatecvc2.vercel.app",
];

async function saavnFetch(path: string): Promise<any> {
  const fetchWithTimeout = async (base: string) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4500); // 4.5s timeout for fast failover

    try {
      let finalPath = path;
      if (base.includes("saavn.dev") && path.startsWith("/lyrics?id=")) {
        const id = new URLSearchParams(path.split("?")[1]).get("id");
        finalPath = `/songs/${id}/lyrics`;
      }
      
      const res = await fetch(`${base}${finalPath}`, {
        headers: { Accept: "application/json" },
        next: { revalidate: 3600 },
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      if (!res.ok) throw new Error("Not OK");
      
      const json = await res.json();
      if (json?.success || json?.status === "SUCCESS") {
        json.success = true;
        return json;
      }
      throw new Error("Invalid response");
    } catch (err) {
      clearTimeout(timeoutId);
      throw err;
    }
  };

  // Race all bases in parallel for the "Strongest" and fastest connection
  try {
    return await Promise.any(SAAVN_BASES.map(base => fetchWithTimeout(base)));
  } catch (err) {
    console.error("All Saavn mirrors failed", err);
    return null;
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type");
  const q = searchParams.get("q") ?? "";
  const limit = searchParams.get("limit") ?? "20";

  let path = "";
  if (type === "search_movie") {
    // 1. Search for the movie/album
    const albumSearch = await saavnFetch(`/search/albums?query=${encodeURIComponent(q)}&limit=1&page=1`);
    if (albumSearch?.success && albumSearch?.data?.results?.length > 0) {
      const albumId = albumSearch.data.results[0].id;
      // 2. Fetch all songs for this exact album
      const albumDetails = await saavnFetch(`/albums?id=${albumId}`);
      if (albumDetails?.success && albumDetails?.data?.songs) {
        return NextResponse.json({
          success: true,
          data: { results: albumDetails.data.songs }
        }, { headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" } });
      }
    }
    // Fallback if album not found
    path = `/search/songs?query=${encodeURIComponent(q)}&limit=${limit}&page=1`;
  } else if (type === "search") {
    path = `/search/songs?query=${encodeURIComponent(q)}&limit=${limit}&page=1`;
  } else if (type === "song") {
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ success: false, error: "ID required" }, { status: 400 });
    path = `/songs?id=${id}`;
  } else if (type === "lyrics") {
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ success: false, error: "ID required" }, { status: 400 });
    path = `/lyrics?id=${id}`;
  } else {
    return NextResponse.json({ success: false, error: "Invalid type" }, { status: 400 });
  }

  // Need to also handle /songs vs /songs?id=
  // Let's modify the saavnFetch to replace /lyrics?id=x with /songs/x/lyrics if saavn.dev
  const data = await saavnFetch(path);
  if (!data) {
    return NextResponse.json({ success: false, error: "Saavn unavailable" }, { status: 503 });
  }

  return NextResponse.json(data, {
    headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" },
  });
}
