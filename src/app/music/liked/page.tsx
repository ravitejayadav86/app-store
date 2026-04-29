"use client";

import React, { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Heart, Loader2, Music2, ArrowLeft, Play } from "lucide-react";
import Link from "next/link";
import { useMusicPlayer } from "@/lib/MusicContext";
import { Track } from "@/components/ui/MusicPlayer";
import api from "@/lib/api";
import { useRouter } from "next/navigation";

const SPRING = { type: "spring", stiffness: 500, damping: 38, mass: 0.5 } as const;
const ACCENT_COLORS = ["#e91e63","#9c27b0","#3f51b5","#0058bb","#00bcd4","#009688","#ff5722","#ff9800","#4caf50","#f44336","#673ab7","#2196f3"];
function trackColor(t: Track, i: number) { return t.color ?? ACCENT_COLORS[i % ACCENT_COLORS.length]; }

function saavnToTrack(s: any): Track {
  const getUrl = (arr: any[], q: string) => { const f = arr?.find((x: any) => x.quality === q); return f?.url || f?.link; };
  const url320 = getUrl(s.downloadUrl, "320kbps");
  const url160 = getUrl(s.downloadUrl, "160kbps");
  const audioUrl = url320 || url160 || s.downloadUrl?.[0]?.url || s.downloadUrl?.[0]?.link || "";
  const coverUrl = getUrl(s.image, "500x500") || s.image?.[0]?.url || s.image?.[0]?.link || "";
  const artist = s.artists?.primary?.map((a: any) => a.name).join(", ") || s.primaryArtists || "";
  return {
    id: `saavn_${s.id}`, title: s.name, artist,
    audioUrl, coverUrl, duration: s.duration,
    downloadUrl: audioUrl, color: undefined,
  };
}

export default function LikedSongsPage() {
  const { play } = useMusicPlayer();
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState<Set<number | string>>(new Set());

  useEffect(() => {
    const saved = localStorage.getItem("pandas_liked_tracks");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setLiked(new Set(parsed));
      } catch { }
    }
  }, []);

  const toggleLike = useCallback((id: number | string) => {
    setLiked(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      localStorage.setItem("pandas_liked_tracks", JSON.stringify(Array.from(next)));
      return next;
    });
    setTracks(prev => prev.filter(t => t.id !== id));
  }, []);

  useEffect(() => {
    const fetchLikedTracks = async () => {
      const saved = localStorage.getItem("pandas_liked_tracks");
      if (!saved) {
        setLoading(false);
        return;
      }

      try {
        const ids = JSON.parse(saved) as (string | number)[];
        if (ids.length === 0) {
          setLoading(false);
          return;
        }

        const saavnIds = ids
          .filter(id => typeof id === "string" && id.startsWith("saavn_"))
          .map(id => (id as string).replace("saavn_", ""));
        
        const myTracks: Track[] = [];

        // Fetch Saavn songs
        if (saavnIds.length > 0) {
          // JioSaavn allows comma-separated IDs
          const res = await fetch(`/api/saavn?type=song&id=${saavnIds.join(",")}`);
          const data = await res.json();
          if (data?.success && data.data) {
             const results = Array.isArray(data.data) ? data.data : data.data.results || [data.data];
             myTracks.push(...results.map((s: any) => saavnToTrack(s)));
          }
        }

        // Fetch local DB apps if they are liked (non saavn IDs)
        const localIds = ids.filter(id => typeof id === "number" || !String(id).startsWith("saavn_"));
        if (localIds.length > 0) {
           const res = await api.get("/apps/");
           const musicApps = res.data.filter((a: any) => a.category?.toLowerCase() === "music" && localIds.includes(a.id));
           myTracks.push(...musicApps.map((a: any) => ({
              id: a.id, title: a.name, artist: a.developer,
              audioUrl: a.file_path, coverUrl: a.icon_url || undefined,
              downloadUrl: `${process.env.NEXT_PUBLIC_API_URL || "https://pandas-store-api.onrender.com"}/apps/${a.id}/download`,
           })));
        }

        setTracks(myTracks);
      } catch (err) {
        console.error("Failed to load liked tracks", err);
      } finally {
        setLoading(false);
      }
    };

    fetchLikedTracks();
  }, []);

  const router = useRouter();

  const startPlay = useCallback((list: Track[], index: number) => {
    play(list as any, index);
    router.push(`/music/${list[index].id}`);
  }, [play, router]);

  return (
    <div className="min-h-screen pb-40 bg-surface">
      <section className="relative overflow-hidden px-4 md:px-8 pt-6 pb-8">
        <div className="max-w-7xl mx-auto flex items-center gap-4">
          <Link href="/music" className="p-3 bg-surface-low rounded-full hover:bg-surface-variant transition-colors">
            <ArrowLeft size={20} className="text-on-surface" />
          </Link>
          <div className="w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center shadow-lg shadow-red-500/20">
            <Heart size={24} fill="white" className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl md:text-4xl font-black text-on-surface">Liked Songs</h1>
            <p className="text-on-surface-variant text-sm md:text-base font-medium">{tracks.length} tracks</p>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-2 md:px-8">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={36} className="animate-spin text-primary/30" />
          </div>
        ) : tracks.length > 0 ? (
          <div className="flex flex-col gap-1">
            {tracks.map((t, i) => (
              <TrackRow 
                key={`liked-${t.id}-${i}`} 
                track={t} 
                index={i}
                onClick={() => startPlay(tracks, i)}
                isPlaying={false} 
                isLiked={liked.has(t.id)}
                onToggleLike={() => toggleLike(t.id)} 
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Heart size={48} className="mb-4 text-on-surface-variant/20" />
            <p className="text-on-surface-variant/50 text-base md:text-lg font-semibold">
              You haven't liked any songs yet.
            </p>
            <Link href="/music">
              <button className="mt-6 px-6 py-2.5 bg-primary/10 text-primary rounded-xl font-bold hover:bg-primary/20 transition-colors">
                Discover Music
              </button>
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}

function TrackRow({ track, index, onClick, isPlaying, isLiked, onToggleLike }: {
  track: Track; index: number; onClick: () => void; isPlaying: boolean;
  isLiked: boolean; onToggleLike: () => void;
}) {
  const color = trackColor(track, index);
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.015, 0.2), ...SPRING }}
      className="flex items-center gap-3 md:gap-4 px-3 md:px-4 py-2 md:py-3 rounded-xl group transition-all cursor-pointer relative transform-gpu"
      onClick={onClick} whileHover={{ backgroundColor: "rgba(0, 88, 187, 0.04)" }}>
      {isPlaying && <motion.div layoutId="active-track-pill" className="absolute left-0 w-1 h-2/3 rounded-r-full" style={{ background: color }} />}
      <div className="w-6 md:w-8 text-center flex-shrink-0">
        <span className="text-[10px] md:text-xs text-on-surface-variant/40 font-mono">{index + 1}</span>
      </div>
      <div className="w-10 h-10 md:w-11 md:h-11 rounded-lg md:rounded-xl flex-shrink-0 overflow-hidden flex items-center justify-center shadow-sm" style={{ background: `${color}15` }}>
        {track.coverUrl ? <img src={track.coverUrl} alt={track.title} className="w-full h-full object-cover will-change-transform" loading="lazy" /> : <Music2 size={20} className="text-on-surface-variant/30" />}
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-xs md:text-sm font-bold truncate ${isPlaying ? "text-primary" : "text-on-surface"}`}>{track.title}</p>
        <p className="text-[10px] md:text-xs text-on-surface-variant/60 font-medium truncate">{track.artist}</p>
      </div>
      <div className="flex items-center gap-1 opacity-100 transition-opacity">
        <button onClick={e => { e.stopPropagation(); onToggleLike(); }} className="p-1.5 md:p-2 rounded-full hover:bg-black/5 transition-colors">
          <Heart size={15} fill={isLiked ? "#ef4444" : "none"} className={isLiked ? "text-red-500" : "text-on-surface-variant/30"} />
        </button>
      </div>
    </motion.div>
  );
}
