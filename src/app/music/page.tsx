"use client";

import React, { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Music2, Headphones, Loader2, Play, Search,
  Flame, Radio, Heart, Disc3,
} from "lucide-react";
import { MusicPlayer, Track } from "@/components/ui/MusicPlayer";
import api from "@/lib/api";

/* ────────────────────────────────────────────────────────────────────────────
   JAMENDO free-streaming API  (no key needed for basic public endpoints)
   Docs: https://developer.jamendo.com/v3.0
   We use client_id = "b6747d04" (Jamendo's own demo id — fine for non-commercial)
──────────────────────────────────────────────────────────────────────────── */
const JAMENDO_CLIENT = "b6747d04";
const JAMENDO_BASE   = "https://api.jamendo.com/v3.0";

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
    id:          `j_${t.id}`,
    title:       t.name,
    artist:      t.artist_name,
    duration:    t.duration,
    audioUrl:    t.audio,              // direct MP3 stream
    coverUrl:    t.album_image || t.image,
    downloadUrl: t.audiodownload,     // downloadable MP3
    color:       undefined,
  };
}

/* Convert our own backend app (with file_path as audio URL) */
function appToTrack(a: any): Track {
  return {
    id:          a.id,
    title:       a.name,
    artist:      a.developer,
    audioUrl:    a.file_path,
    coverUrl:    a.icon_url || undefined,
    downloadUrl: `${process.env.NEXT_PUBLIC_API_URL || "https://pandas-store-api.onrender.com"}/apps/${a.id}/download`,
  };
}

/* ── Genre tabs ─────────────────────────────────────────────────────────── */
const GENRES = [
  { label: "Trending",  tag: "pop"          },
  { label: "Hip-Hop",   tag: "hiphop"       },
  { label: "Electronic",tag: "electronic"   },
  { label: "Rock",      tag: "rock"         },
  { label: "Chill",     tag: "chillout"     },
  { label: "Jazz",      tag: "jazz"         },
  { label: "Classical", tag: "classical"    },
];

const SPRING  = { type: "spring", stiffness: 500, damping: 38, mass: 0.5 } as const;
const FADE_UP = (i: number) => ({ initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 }, transition: { delay: i * 0.04, ...SPRING } });

const ACCENT_COLORS = [
  "#e91e63","#9c27b0","#3f51b5","#0058bb",
  "#00bcd4","#009688","#ff5722","#ff9800",
  "#4caf50","#f44336","#673ab7","#2196f3",
];

function trackColor(t: Track, i: number) {
  return t.color ?? ACCENT_COLORS[i % ACCENT_COLORS.length];
}

/* ════════════════════════════════════════════════════════════════════════════
   Page
════════════════════════════════════════════════════════════════════════════ */
export default function MusicPage() {
  const [genre,      setGenre]      = useState(GENRES[0].tag);
  const [tracks,     setTracks]     = useState<Track[]>([]);
  const [featured,   setFeatured]   = useState<Track[]>([]);
  const [ownTracks,  setOwnTracks]  = useState<Track[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [featLoad,   setFeatLoad]   = useState(true);
  const [queue,      setQueue]      = useState<Track[]>([]);
  const [queueIdx,   setQueueIdx]   = useState(0);
  const [playerOpen, setPlayerOpen] = useState(false);
  const [search,     setSearch]     = useState("");
  const [searchRes,  setSearchRes]  = useState<Track[]>([]);
  const [searching,  setSearching]  = useState(false);

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
    }).catch(() => {});
  }, []);

  /* ── Genre tracks ─────────────────────────────────────────────── */
  useEffect(() => {
    setLoading(true);
    setTracks([]);
    fetchJamendo("/tracks", { tags: genre, order: "popularity_week", limit: "20" })
      .then(r => setTracks(r.map(jamendoToTrack)))
      .finally(() => setLoading(false));
  }, [genre]);

  /* ── Search ───────────────────────────────────────────────────── */
  const doSearch = useCallback(async (q: string) => {
    if (!q.trim()) { setSearchRes([]); return; }
    setSearching(true);
    const r = await fetchJamendo("/tracks", { namesearch: q.trim(), limit: "12" });
    setSearchRes(r.map(jamendoToTrack));
    setSearching(false);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => doSearch(search), 450);
    return () => clearTimeout(t);
  }, [search, doSearch]);

  /* ── Play helpers ─────────────────────────────────────────────── */
  const playFrom = (list: Track[], index: number) => {
    setQueue(list);
    setQueueIdx(index);
    setPlayerOpen(true);
  };

  const displayTracks = search.trim() ? searchRes : tracks;

  return (
    <div className="min-h-screen pb-40" style={{ background: "linear-gradient(180deg,#0d0d1a 0%,#0f0f23 100%)" }}>

      {/* ── HERO ──────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden px-4 md:px-8 pt-6 pb-10">
        <div className="max-w-7xl mx-auto">
          <div className="relative rounded-[2.5rem] overflow-hidden min-h-[320px] md:min-h-[420px] flex flex-col justify-end p-8 md:p-12"
            style={{ background: "linear-gradient(135deg, #1a0533 0%, #0b1a3e 50%, #0d1f3c 100%)" }}>
            {/* animated blobs */}
            {[["#e91e63","top-[-80px] left-[-80px]"],["#3f51b5","bottom-[-60px] right-[-60px]"],["#9c27b0","top-[40%] left-[40%]"]].map(([c,pos],i)=>(
              <motion.div key={i} className={`absolute w-72 h-72 rounded-full blur-[90px] opacity-30 ${pos}`}
                style={{ background: c }}
                animate={{ scale:[1,1.2,1], opacity:[0.25,0.45,0.25] }}
                transition={{ duration: 6+i*2, repeat:Infinity, ease:"easeInOut" }} />
            ))}
            <div className="relative z-10">
              <motion.div {...FADE_UP(0)} className="inline-flex items-center gap-2 mb-4 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest text-white/70 border border-white/15 bg-white/5 backdrop-blur-md">
                <Radio size={11} /> PandaStore Music
              </motion.div>
              <motion.h1 {...FADE_UP(1)} className="text-4xl md:text-7xl font-black tracking-tight text-white mb-3 leading-none">
                Your Music,<br/>Your World.
              </motion.h1>
              <motion.p {...FADE_UP(2)} className="text-white/50 md:text-lg mb-6 max-w-md">
                Stream millions of tracks free. Play, skip, repeat — download anytime.
              </motion.p>
              {/* featured quick-play */}
              {!featLoad && featured.length > 0 && (
                <motion.button {...FADE_UP(3)}
                  onClick={() => playFrom(featured, 0)}
                  className="flex items-center gap-3 px-6 py-3.5 rounded-2xl text-sm font-bold text-white transition-all hover:scale-105 active:scale-95"
                  style={{ background: "linear-gradient(120deg,#e91e63,#9c27b0)" }}>
                  <Play size={18} fill="white" /> Play Top Tracks
                </motion.button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── SEARCH ────────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 mb-8">
        <div className="relative">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            type="search"
            placeholder="Search songs, artists…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3.5 rounded-2xl text-sm text-white placeholder-white/30 outline-none"
            style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.10)" }}
          />
          {searching && <Loader2 size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 animate-spin" />}
        </div>
      </section>

      {/* ── FEATURED ──────────────────────────────────────────────────── */}
      {!search.trim() && (
        <section className="max-w-7xl mx-auto px-4 md:px-8 mb-10">
          <div className="flex items-center gap-2 mb-5">
            <Flame size={18} className="text-orange-400" />
            <h2 className="text-lg font-black text-white">Featured</h2>
          </div>
          {featLoad ? (
            <div className="flex gap-4 overflow-hidden">
              {[...Array(4)].map((_,i) => (
                <div key={i} className="flex-shrink-0 w-48 h-48 rounded-2xl animate-pulse" style={{ background:"rgba(255,255,255,0.06)" }} />
              ))}
            </div>
          ) : (
            <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
              {featured.map((t, i) => (
                <FeaturedCard key={t.id} track={t} index={i} onClick={() => playFrom(featured, i)} />
              ))}
            </div>
          )}
        </section>
      )}

      {/* ── OWN TRACKS ────────────────────────────────────────────────── */}
      {!search.trim() && ownTracks.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 md:px-8 mb-10">
          <div className="flex items-center gap-2 mb-5">
            <Disc3 size={18} className="text-primary" />
            <h2 className="text-lg font-black text-white">PandaStore Originals</h2>
          </div>
          <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
            {ownTracks.map((t, i) => (
              <FeaturedCard key={t.id} track={t} index={i} onClick={() => playFrom(ownTracks, i)} />
            ))}
          </div>
        </section>
      )}

      {/* ── GENRE TABS ────────────────────────────────────────────────── */}
      {!search.trim() && (
        <section className="max-w-7xl mx-auto px-4 md:px-8 mb-6">
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            {GENRES.map(g => (
              <button key={g.tag} onClick={() => setGenre(g.tag)}
                className="flex-shrink-0 px-5 py-2 rounded-full text-xs font-bold transition-all"
                style={genre === g.tag
                  ? { background: "#0058bb", color: "#fff" }
                  : { background: "rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.55)" }}>
                {g.label}
              </button>
            ))}
          </div>
        </section>
      )}

      {/* ── TRACK LIST ────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 md:px-8">
        {search.trim() && (
          <div className="flex items-center gap-2 mb-5">
            <Search size={16} className="text-white/40" />
            <h2 className="text-base font-bold text-white/60">
              Results for "<span className="text-white">{search}</span>"
            </h2>
          </div>
        )}

        {loading && !search.trim() ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 size={36} className="animate-spin text-white/30" />
          </div>
        ) : displayTracks.length > 0 ? (
          <div className="flex flex-col gap-1">
            {displayTracks.map((t, i) => (
              <TrackRow key={t.id} track={t} index={i}
                onClick={() => playFrom(displayTracks, i)}
                isPlaying={playerOpen && queue[queueIdx]?.id === t.id} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <Music2 size={48} className="mb-4 opacity-20 text-white" />
            <p className="text-white/40 text-lg font-semibold">
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
    </div>
  );
}

/* ── Featured card ──────────────────────────────────────────────────────── */
function FeaturedCard({ track, index, onClick }: { track: Track; index: number; onClick: () => void }) {
  const color = trackColor(track, index);
  return (
    <motion.button onClick={onClick} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
      className="flex-shrink-0 w-44 md:w-52 rounded-2xl overflow-hidden text-left relative group"
      style={{ background: `linear-gradient(145deg,${color}99,${color}33)`, border:"1px solid rgba(255,255,255,0.08)" }}>
      <div className="w-full aspect-square flex items-center justify-center overflow-hidden">
        {track.coverUrl
          ? <img src={track.coverUrl} alt={track.title} className="w-full h-full object-cover" />
          : <Music2 size={52} className="text-white/30" />}
      </div>
      {/* play overlay */}
      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ background:"rgba(0,0,0,0.45)" }}>
        <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: color }}>
          <Play size={22} fill="white" className="text-white ml-0.5" />
        </div>
      </div>
      <div className="p-3">
        <p className="text-sm font-bold text-white truncate">{track.title}</p>
        <p className="text-xs text-white/50 truncate">{track.artist}</p>
      </div>
    </motion.button>
  );
}

/* ── Track row ──────────────────────────────────────────────────────────── */
function TrackRow({ track, index, onClick, isPlaying }: {
  track: Track; index: number; onClick: () => void; isPlaying: boolean;
}) {
  const color = trackColor(track, index);
  const [liked, setLiked] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.025, ...SPRING }}
      className="flex items-center gap-4 px-4 py-3 rounded-xl group transition-colors cursor-pointer"
      style={isPlaying ? { background:"rgba(255,255,255,0.06)" } : {}}
      onClick={onClick}
      whileHover={{ backgroundColor: "rgba(255,255,255,0.05)" }}
    >
      {/* index / equalizer */}
      <div className="w-8 text-center flex-shrink-0">
        {isPlaying
          ? <div className="flex items-end justify-center gap-0.5 h-4">
              {[1,2,3].map(b=>(
                <motion.div key={b} className="w-1 rounded-full"
                  style={{ background: color }}
                  animate={{ height:["4px","14px","6px","12px","4px"] }}
                  transition={{ duration:0.8+b*0.2, repeat:Infinity, ease:"easeInOut", delay:b*0.15 }} />
              ))}
            </div>
          : <span className="text-xs text-white/25 font-mono">{index + 1}</span>}
      </div>

      {/* thumbnail */}
      <div className="w-11 h-11 rounded-xl flex-shrink-0 overflow-hidden flex items-center justify-center"
        style={{ background:`${color}44` }}>
        {track.coverUrl
          ? <img src={track.coverUrl} alt={track.title} className="w-full h-full object-cover" />
          : <Music2 size={20} className="text-white/50" />}
      </div>

      {/* info */}
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-semibold truncate ${isPlaying ? "text-white" : "text-white/85"}`}>{track.title}</p>
        <p className="text-xs text-white/40 truncate">{track.artist}</p>
      </div>

      {/* actions */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={e => { e.stopPropagation(); setLiked(l=>!l); }}
          className="p-2 rounded-full hover:bg-white/10 transition-colors">
          <Heart size={15} fill={liked?"#e91e63":"none"} className={liked?"text-pink-500":"text-white/30"} />
        </button>
      </div>

      {/* duration */}
      {track.duration && (
        <span className="text-xs text-white/25 font-mono flex-shrink-0 ml-1">
          {Math.floor(track.duration/60)}:{String(track.duration%60).padStart(2,"0")}
        </span>
      )}
    </motion.div>
  );
}
