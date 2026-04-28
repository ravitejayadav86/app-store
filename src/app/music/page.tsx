"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Music2, Loader2, Play, Search,
  Flame, Radio, Heart, Disc3, Shuffle,
} from "lucide-react";
import { Track } from "@/components/ui/MusicPlayer";
import { TELUGU_MOVIES } from "@/data/teluguMovies";
import { AddMusicModal } from "@/components/ui/AddMusicModal";
import { fuzzySearch } from "@/lib/search";
import api from "@/lib/api";

/* ────────────────────────────────────────────────────────────────────────────
   JAMENDO free-streaming API  (no key needed for basic public endpoints)
   Docs: https://developer.jamendo.com/v3.0
   We use client_id = "b6747d04" (Jamendo's own demo id — fine for non-commercial)
──────────────────────────────────────────────────────────────────────────── */
const JAMENDO_CLIENT = "b6747d04";
const JAMENDO_BASE = "https://api.jamendo.com/v3.0";

async function fetchJamendo(endpoint: string, params: Record<string, string> = {}): Promise<any[]> {
  const qs = new URLSearchParams({ client_id: JAMENDO_CLIENT, format: "json", limit: "20", ...params });
  try {
    const res = await fetch(`${JAMENDO_BASE}${endpoint}?${qs}`);
    if (!res.ok) return [];
    const json = await res.json();
    return json.results ?? [];
  } catch {
    return [];
  }
}

function jamendoToTrack(t: any): Track {
  return {
    id: `j_${t.id}`,
    title: t.name,
    artist: t.artist_name,
    duration: t.duration,
    audioUrl: t.audio,              // direct MP3 stream
    coverUrl: t.album_image || t.image,
    downloadUrl: t.audiodownload,     // downloadable MP3
    color: undefined,
  };
}

/* Convert our own backend app (with file_path as audio URL) */
function appToTrack(a: any): Track {
  return {
    id: a.id,
    title: a.name,
    artist: a.developer,
    audioUrl: a.file_path,
    coverUrl: a.icon_url || undefined,
    downloadUrl: `${process.env.NEXT_PUBLIC_API_URL || "https://pandas-store-api.onrender.com"}/apps/${a.id}/download`,
  };
}

/* ── Genre tabs ─────────────────────────────────────────────────────────── */
const GENRES = [
  { label: "Trending", tag: "pop" },
  { label: "Hip-Hop", tag: "hiphop" },
  { label: "Electronic", tag: "electronic" },
  { label: "Rock", tag: "rock" },
  { label: "Chill", tag: "chillout" },
  { label: "Jazz", tag: "jazz" },
  { label: "Classical", tag: "classical" },
];

const SPRING = { type: "spring", stiffness: 500, damping: 38, mass: 0.5 } as const;
const FADE_UP = (i: number) => ({ initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 }, transition: { delay: i * 0.04, ...SPRING } });

const ACCENT_COLORS = [
  "#e91e63", "#9c27b0", "#3f51b5", "#0058bb",
  "#00bcd4", "#009688", "#ff5722", "#ff9800",
  "#4caf50", "#f44336", "#673ab7", "#2196f3",
];

function trackColor(t: Track, i: number) {
  return t.color ?? ACCENT_COLORS[i % ACCENT_COLORS.length];
}

/* ════════════════════════════════════════════════════════════════════════════
   Page
════════════════════════════════════════════════════════════════════════════ */
export default function MusicPage() {
  const router = useRouter();
  const [genre, setGenre] = useState(GENRES[0].tag);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [featured, setFeatured] = useState<Track[]>([]);
  const [ownTracks, setOwnTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [featLoad, setFeatLoad] = useState(true);
  const [search, setSearch] = useState("");
  const [searchRes, setSearchRes] = useState<Track[]>([]);
  const [searching, setSearching] = useState(false);
  const [liked, setLiked] = useState<Set<number | string>>(new Set());
  const [isAddMusicOpen, setIsAddMusicOpen] = useState(false);

  /* ── Persistence for Likes ────────────────────────────────────── */
  useEffect(() => {
    const saved = localStorage.getItem("pandas_liked_tracks");
    if (saved) {
      try { setLiked(new Set(JSON.parse(saved))); } catch (e) { console.error(e); }
    }
  }, []);

  const toggleLike = useCallback((id: number | string) => {
    setLiked(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      localStorage.setItem("pandas_liked_tracks", JSON.stringify(Array.from(next)));
      return next;
    });
  }, []);

  /* ── Featured (popular tracks) ────────────────────────────────── */
  useEffect(() => {
    setFeatLoad(true);
    fetchJamendo("/tracks", { order: "popularity_total", limit: "6", include: "musicinfo" })
      .then(r => setFeatured(r.map(jamendoToTrack)))
      .finally(() => setFeatLoad(false));
  }, []);

  /* ── Own published music tracks ───────────────────────────────── */
  useEffect(() => {
    api.get("/apps/").then(res => {
      const music = res.data.filter((a: any) =>
        a.category?.toLowerCase() === "music" && a.file_path?.startsWith("http")
      );
      setOwnTracks(music.map(appToTrack));
    }).catch(() => { });
  }, []);

  /* ── Genre tracks ─────────────────────────────────────────────── */
  useEffect(() => {
    setLoading(true);
    setTracks([]);
    fetchJamendo("/tracks", { tags: genre, order: "popularity_week", limit: "20" })
      .then(r => setTracks(r.map(jamendoToTrack)))
      .finally(() => setLoading(false));
  }, [genre]);

  /* ── Search ───────────────────────────────────────────── */
  useEffect(() => {
    const q = search.trim();
    if (!q) {
      setSearchRes([]);
      setSearching(false);
      return;
    }

    // 1) Build local corpus with album mapped to movie title
    const allLocalTracks: any[] = [
      ...TELUGU_MOVIES.flatMap(m => m.tracks.map(t => ({
        ...t,
        artist: t.artist || m.title,
        album: m.title
      }))),
      ...ownTracks,
    ];

    // 2) Instant local search
    const localHits = fuzzySearch(
      allLocalTracks.map(t => ({ ...t, name: t.title, artist_name: t.artist })),
      q,
      12
    ).map(t => ({ ...t, title: t.name ?? t.title } as Track));

    // Show local hits immediately so it feels snappy
    setSearchRes(localHits);
    setSearching(true);

    // 3) Debounce the slow Jamendo API fetch by 300ms
    const t = setTimeout(async () => {
      try {
        const [jamendoByName, jamendoByTag] = await Promise.all([
          fetchJamendo("/tracks", { namesearch: q, limit: "10" }),
          fetchJamendo("/tracks", { search: q, limit: "10", order: "popularity_week" }),
        ]);

        const seen = new Set<string>();
        const jamendoTracks: Track[] = [];
        for (const t of [...jamendoByName, ...jamendoByTag]) {
          if (!seen.has(t.id)) {
            seen.add(t.id);
            jamendoTracks.push(jamendoToTrack(t));
          }
        }

        // Merge: local results first, then Jamendo
        const allResults: Track[] = [
          ...localHits,
          ...jamendoTracks.filter(jt => !localHits.some(lh => lh.id === jt.id)),
        ].slice(0, 20);

        setSearchRes(allResults);
      } catch (e) {
        console.error("Jamendo search failed", e);
      } finally {
        setSearching(false);
      }
    }, 300);

    return () => clearTimeout(t);
  }, [search, ownTracks]);


  /* ── Navigate to song detail page ────────────────────────────── */
  const navigateToSong = (list: Track[], index: number) => {
    try {
      sessionStorage.setItem(
        "pandas_song_page",
        JSON.stringify({ track: list[index], queue: list, queueIdx: index })
      );
    } catch (e) {
      console.error("sessionStorage error", e);
    }
    router.push(`/music/${encodeURIComponent(String(list[index].id))}`);
  };

  const displayTracks = search.trim() ? searchRes : tracks;

  return (
    <div className="min-h-screen pb-40 bg-surface">

      {/* ── HERO ──────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden px-3 md:px-8 pt-4 md:pt-6 pb-6 md:pb-10">
        <div className="max-w-7xl mx-auto">
          <div className="relative rounded-[2rem] md:rounded-[2.5rem] overflow-hidden min-h-[280px] md:min-h-[420px] flex flex-col justify-end p-6 md:p-12 shadow-xl shadow-primary/5 border border-outline-variant/30"
            style={{ background: "var(--hero-gradient, linear-gradient(135deg, #f0f4ff 0%, #ffffff 100%))" }}>
            {/* animated blobs */}
            {[["#6c9fff", "top-[-80px] left-[-80px]"], ["#3f51b5", "bottom-[-60px] right-[-60px]"], ["#9c27b0", "top-[40%] left-[40%]"]].map(([c, pos], i) => (
              <motion.div key={i} className={`absolute w-72 h-72 rounded-full blur-[90px] opacity-10 ${pos}`}
                style={{ background: c }}
                animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
                transition={{ duration: 6 + i * 2, repeat: Infinity, ease: "easeInOut" }} />
            ))}
            
            {/* ── ADD MUSIC BUTTON ── */}
            <div className="absolute top-6 right-6 z-20">
              <button 
                onClick={() => setIsAddMusicOpen(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-sky-500/20 backdrop-blur-xl border border-sky-400/40 rounded-2xl text-sky-50 font-bold text-xs md:text-sm hover:bg-sky-400/30 transition-all hover:scale-105 active:scale-95 shadow-[0_0_15px_rgba(14,165,233,0.3)] hover:shadow-[0_0_25px_rgba(14,165,233,0.5)]"
              >
                <Music2 size={16} className="text-sky-300" /> + Add Music
              </button>
            </div>

            <div className="relative z-10">
              <motion.div {...FADE_UP(0)} className="inline-flex items-center gap-2 mb-3 md:mb-4 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest text-primary border border-primary/20 bg-primary/5 backdrop-blur-md">
                <Radio size={11} /> PandaStore Music
              </motion.div>
              <motion.h1 {...FADE_UP(1)} className="text-3xl md:text-7xl font-black tracking-tight text-on-surface mb-2 md:mb-3 leading-none">
                Your Music,<br />Your World.
              </motion.h1>
              <motion.p {...FADE_UP(2)} className="text-on-surface-variant md:text-lg mb-5 md:mb-8 max-w-md">
                Stream millions of tracks free. Play, skip, repeat — download anytime.
              </motion.p>
              <div className="flex flex-wrap gap-3 md:gap-4">
                <motion.button {...FADE_UP(3)}
                  onClick={() => featured.length > 0 && navigateToSong(featured, 0)}
                  className="flex items-center gap-2 md:gap-3 px-5 md:px-6 py-3 md:py-3.5 rounded-2xl text-xs md:text-sm font-bold text-white transition-all hover:scale-105 active:scale-95 shadow-lg shadow-primary/25"
                  style={{ background: "linear-gradient(120deg,#0058bb,#3f51b5)" }}>
                  <Play size={16} fill="white" /> Play Top Tracks
                </motion.button>
                <motion.button {...FADE_UP(4)}
                  onClick={() => {
                    const src = displayTracks.length > 0 ? displayTracks : featured;
                    if (src.length === 0) return;
                    const shuffled = [...src].sort(() => Math.random() - 0.5);
                    navigateToSong(shuffled, 0);
                  }}
                  className="flex items-center gap-2 md:gap-3 px-5 md:px-6 py-3 md:py-3.5 rounded-2xl text-xs md:text-sm font-bold text-primary bg-primary/10 border border-primary/10 transition-all hover:bg-primary/20 active:scale-95">
                  <Shuffle size={16} /> Shuffle All
                </motion.button>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* ── SEARCH ────────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 mb-6 md:mb-8">
        <div className="relative group">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/40 group-focus-within:text-primary transition-colors" />
          <input
            type="search"
            placeholder="Search songs, artists…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 md:py-3.5 rounded-2xl text-sm text-on-surface placeholder-on-surface-variant/40 outline-none transition-all"
            style={{ background: "var(--surface-container-low)", border: "1.5px solid var(--outline-variant)" }}
          />
          {searching && <Loader2 size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-primary animate-spin" />}
        </div>
      </section>

      {/* ── FEATURED ──────────────────────────────────────────────────── */}
      {!search.trim() && (
        <section className="max-w-7xl mx-auto px-4 md:px-8 mb-8 md:mb-10">
          <div className="flex items-center gap-2 mb-4 md:mb-5">
            <Flame size={18} className="text-orange-500" />
            <h2 className="text-lg font-black text-on-surface">Featured</h2>
          </div>
          {featLoad ? (
            <div className="flex gap-4 overflow-hidden">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex-shrink-0 w-40 md:w-48 h-40 md:h-48 rounded-2xl animate-pulse bg-surface-container-low" />
              ))}
            </div>
          ) : (
            <div className="flex gap-3 md:gap-4 overflow-x-auto no-scrollbar pb-2 px-1 -mx-1">
              {featured.map((t, i) => (
                <FeaturedCard key={`feat-${t.id}-${i}`} track={t} index={i} onClick={() => navigateToSong(featured, i)} />
              ))}
            </div>
          )}
        </section>
      )}

      {/* ── TELUGU MOVIES ───────────────────────────────────────────────── */}
      {!search.trim() && TELUGU_MOVIES.map((movie) => (
        <section key={movie.id} className="max-w-7xl mx-auto px-4 md:px-8 mb-8 md:mb-10">
          <div className="flex items-center gap-2 mb-4 md:mb-5">
            <Radio size={18} className="text-purple-500" />
            <h2 className="text-lg font-black text-on-surface">{movie.title}</h2>
          </div>
          <div className="flex gap-3 md:gap-4 overflow-x-auto no-scrollbar pb-2 px-1 -mx-1">
            {movie.tracks.map((t, i) => (
              <FeaturedCard key={`telugu-${movie.id}-${t.id}`} track={t} index={i} onClick={() => navigateToSong(movie.tracks, i)} />
            ))}
          </div>
        </section>
      ))}

      {/* ── OWN TRACKS ────────────────────────────────────────────────── */}
      {!search.trim() && ownTracks.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 md:px-8 mb-8 md:mb-10">
          <div className="flex items-center gap-2 mb-4 md:mb-5">
            <Disc3 size={18} className="text-primary" />
            <h2 className="text-lg font-black text-on-surface">PandaStore Originals</h2>
          </div>
          <div className="flex gap-3 md:gap-4 overflow-x-auto no-scrollbar pb-2 px-1 -mx-1">
            {ownTracks.map((t, i) => (
              <FeaturedCard key={`own-${t.id}-${i}`} track={t} index={i} onClick={() => navigateToSong(ownTracks, i)} />
            ))}
          </div>
        </section>
      )}

      {/* ── GENRE TABS ────────────────────────────────────────────────── */}
      {!search.trim() && (
        <section className="max-w-7xl mx-auto px-4 md:px-8 mb-5 md:mb-6">
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            {GENRES.map(g => (
              <button key={g.tag} onClick={() => setGenre(g.tag)}
                className="flex-shrink-0 px-4 md:px-5 py-2 rounded-full text-xs font-bold transition-all active:scale-95"
                style={genre === g.tag
                  ? { background: "var(--primary)", color: "#fff" }
                  : { background: "var(--surface-container-low)", color: "var(--on-surface-variant)" }}>
                {g.label}
              </button>
            ))}
          </div>
        </section>
      )}

      {/* ── TRACK LIST ────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-2 md:px-8">
        {search.trim() && (
          <div className="flex items-center gap-2 mb-4 md:mb-5 px-2">
            <Search size={16} className="text-on-surface-variant/40" />
            <h2 className="text-sm md:text-base font-bold text-on-surface-variant">
              Results for "<span className="text-on-surface">{search}</span>"
            </h2>
          </div>
        )}

        {loading && !search.trim() ? (
          <div className="flex items-center justify-center py-20 md:py-24">
            <Loader2 size={36} className="animate-spin text-primary/30" />
          </div>
        ) : displayTracks.length > 0 ? (
          <div className="flex flex-col gap-0.5 md:gap-1">
            {displayTracks.map((t, i) => (
              <TrackRow key={`track-${t.id}-${i}`} track={t} index={i}
                onClick={() => navigateToSong(displayTracks, i)}
                isPlaying={false}
                isLiked={liked.has(t.id)}
                onToggleLike={() => toggleLike(t.id)} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 md:py-24 text-center">
            <Music2 size={48} className="mb-4 text-on-surface-variant/20" />
            <p className="text-on-surface-variant/50 text-base md:text-lg font-semibold">
              {search.trim() ? "No results found." : "No tracks available."}
            </p>
          </div>
        )}
      </section>

      {/* ── PLAYER ────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {playerOpen && queue.length > 0 && (
          <MusicPlayer queue={queue} initialIndex={queueIdx} onClose={() => setPlayerOpen(false)} />
        )}
      </AnimatePresence>

      {/* ── ADD MUSIC MODAL ───────────────────────────────────────────── */}
      <AddMusicModal 
        isOpen={isAddMusicOpen} 
        onClose={() => setIsAddMusicOpen(false)} 
        onSuccess={() => window.location.reload()} 
      />
    </div>
  );
}

/* ── Featured card ──────────────────────────────────────────────────────── */
function FeaturedCard({ track, index, onClick }: { track: Track; index: number; onClick: () => void }) {
  const color = trackColor(track, index);
  return (
    <motion.button onClick={onClick} whileHover={{ y: -4 }} whileTap={{ scale: 0.97 }}
      className="flex-shrink-0 w-40 md:w-52 rounded-2xl md:rounded-[1.5rem] overflow-hidden text-left relative group bg-surface-lowest shadow-sm hover:shadow-md transition-all border border-outline-variant/20"
      style={{ isolation: "isolate" }}>
      <div className="w-full aspect-square flex items-center justify-center overflow-hidden bg-surface-low relative">
        {track.coverUrl
          ? <img src={track.coverUrl} alt={track.title} className="w-full h-full object-cover" />
          : <div className="w-full h-full flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${color}22, ${color}44)` }}>
            <Music2 size={48} className="text-white/80" />
          </div>
        }
        {/* play overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/10 backdrop-blur-[2px]">
          <div className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-transform" style={{ background: color }}>
            <Play size={22} fill="white" className="text-white ml-0.5" />
          </div>
        </div>
      </div>
      <div className="p-3 md:p-4 bg-surface-lowest">
        <p className="text-xs md:text-sm font-bold text-on-surface truncate">{track.title}</p>
        <p className="text-[10px] md:text-xs text-on-surface-variant font-medium truncate">{track.artist}</p>
      </div>
    </motion.button>
  );
}

/* ── Track row ──────────────────────────────────────────────────────────── */
function TrackRow({ track, index, onClick, isPlaying, isLiked, onToggleLike }: {
  track: Track; index: number; onClick: () => void; isPlaying: boolean;
  isLiked: boolean; onToggleLike: () => void;
}) {
  const color = trackColor(track, index);
  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.02, ...SPRING }}
      className="flex items-center gap-3 md:gap-4 px-3 md:px-4 py-2 md:py-3 rounded-xl group transition-all cursor-pointer relative"
      onClick={onClick}
      whileHover={{ backgroundColor: "rgba(0, 88, 187, 0.04)" }}
    >
      {/* active indicator */}
      {isPlaying && (
        <motion.div layoutId="active-track-pill" className="absolute left-0 w-1 h-2/3 rounded-r-full" style={{ background: color }} />
      )}

      {/* index / equalizer */}
      <div className="w-6 md:w-8 text-center flex-shrink-0">
        {isPlaying
          ? <div className="flex items-end justify-center gap-0.5 h-3 md:h-4">
            {[1, 2, 3].map(b => (
              <motion.div key={b} className="w-1 rounded-full"
                style={{ background: color }}
                animate={{ height: ["4px", "14px", "6px", "12px", "4px"] }}
                transition={{ duration: 0.8 + b * 0.2, repeat: Infinity, ease: "easeInOut", delay: b * 0.15 }} />
            ))}
          </div>
          : <span className="text-[10px] md:text-xs text-on-surface-variant/40 font-mono">{index + 1}</span>}
      </div>

      {/* thumbnail */}
      <div className="w-10 h-10 md:w-11 md:h-11 rounded-lg md:rounded-xl flex-shrink-0 overflow-hidden flex items-center justify-center shadow-sm"
        style={{ background: `${color}15` }}>
        {track.coverUrl
          ? <img src={track.coverUrl} alt={track.title} className="w-full h-full object-cover" />
          : <Music2 size={20} className="text-on-surface-variant/30" />}
      </div>

      {/* info */}
      <div className="flex-1 min-w-0">
        <p className={`text-xs md:text-sm font-bold truncate ${isPlaying ? "text-primary" : "text-on-surface"}`}>{track.title}</p>
        <p className="text-[10px] md:text-xs text-on-surface-variant/60 font-medium truncate">{track.artist}</p>
      </div>

      {/* actions */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={e => { e.stopPropagation(); onToggleLike(); }}
          className="p-1.5 md:p-2 rounded-full hover:bg-black/5 transition-colors">
          <Heart size={15} fill={isLiked ? "#ef4444" : "none"} className={isLiked ? "text-red-500" : "text-on-surface-variant/30"} />
        </button>
      </div>

      {/* duration */}
      {track.duration && (
        <span className="text-[10px] md:text-xs text-on-surface-variant/30 font-mono flex-shrink-0 ml-1">
          {Math.floor(track.duration / 60)}:{String(track.duration % 60).padStart(2, "0")}
        </span>
      )}
    </motion.div>
  );
}
