import type { Metadata } from "next";
import SongDetailClient from "./SongDetailClient";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const saavnId = id.startsWith("saavn_") ? id.replace("saavn_", "") : id;

  try {
    const res = await fetch(`https://jiosaavn-api-ts.vercel.app/api/songs?id=${saavnId}`);
    const data = await res.json();
    
    if (data?.success && data.data?.[0]) {
      const s = data.data[0];
      const title = s.name;
      const artist = s.artists?.primary?.map((a: any) => a.name).join(", ") || s.primaryArtists || "Unknown Artist";
      const image = s.image?.find((i: any) => i.quality === "500x500")?.url || s.image?.[0]?.url;

      return {
        title: `${title} by ${artist}`,
        description: `Listen to ${title} on PandaStore Music. Discover and stream millions of tracks for free.`,
        openGraph: {
          title: `${title} by ${artist}`,
          description: `Now playing on PandaStore Music.`,
          images: image ? [{ url: image }] : [],
          type: "music.song",
        },
        twitter: {
          card: "summary_large_image",
          title: `${title} by ${artist}`,
          description: `Listen for free on PandaStore.`,
          images: image ? [image] : [],
        }
      };
    }
  } catch (e) {
    console.error("Song metadata error:", e);
  }

  return { title: "Music Player | PandaStore" };
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <SongDetailClient />;
}
