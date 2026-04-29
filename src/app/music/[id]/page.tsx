"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useRouter, useParams } from "next/navigation";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import {
  ArrowLeft, Play, Pause, SkipBack, SkipForward,
  Download, Heart, Shuffle, Repeat, Volume2, VolumeX,
  Music2, List, Loader2, Share2, Plus, MoreHorizontal,
  Mic2, Info, Disc, Users, Star
} from "lucide-react";
import { useMusicPlayer, MiniTrack } from "@/lib/MusicContext";

const SPRING = { type: "spring", stiffness: 480, damping: 36 } as const;

function fmt(s: number) {
  if (!isFinite(s) || s < 0) return "0:00";
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

function EqualizerBars({ color, playing }: { color: string; playing: boolean }) {
  return (
    <div className="flex items-end gap-0.5 h-5">
      {[1, 2, 3, 4].map((b) => (
        <motion.div
          key={b}
          className="w-1 rounded-full"
          style={{ background: color }}
          animate={playing ? { height: ["4px", "18px", "8px", "14px", "4px"] } : { height: "4px" }}
          transition={{ duration: 0.7 + b * 0.15, repeat: Infinity, ease: "easeInOut", delay: b * 0.1 }}
        />
      ))}
    </div>
  );
}

export default function SongDetailPage() {
  const router = useRouter();
  const params = useParams();
  const songId = params.id as string;
  const { track: currentTrack, queue, queueIdx, isPlaying, progress, duration, togglePlay, skipNext, skipPrev, seek, play } = useMusicPlayer();

  const [localTrack, setLocalTrack] = useState<MiniTrack | null>(null);
  const [loading, setLoading] = useState(false);
  const [lyrics, setLyrics] = useState<string | null>(null);
  const [lyricsLoading, setLyricsLoading] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [showQueue, setShowQueue] = useState(false);
  const [activeTab, setActiveTab] = useState<"player" | "lyrics" | "info">("player");
  const [aiInsight, setAiInsight] = useState<any | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [shuffleOn, setShuffleOn] = useState(false);
  const [repeat, setRepeat] = useState<"off" | "one" | "all">("off");
  const [volume, setVolumeState] = useState(0.8);
  const [muted, setMuted] = useState(false);

  // Sync with current playing track if it matches the URL ID
  const displayTrack = useMemo(() => {
    if (currentTrack && String(currentTrack.id) === songId) return currentTrack;
    return localTrack;
  }, [currentTrack, songId, localTrack]);

  // Reset AI when song changes
  useEffect(() => {
    setAiInsight(null);
    setAiLoading(false);
  }, [displayTrack?.id]);

  // Fetch track if not in context
  useEffect(() => {
    if (currentTrack && String(currentTrack.id) === songId) return;

    const fetchTrack = async () => {
      setLoading(true);
      try {
        const saavnId = songId.startsWith("saavn_") ? songId.replace("saavn_", "") : songId;
        const res = await fetch(`/api/saavn?type=song&id=${saavnId}`);
        const data = await res.json();
        if (data?.success && data.data?.[0]) {
          const s = data.data[0];
          const url320 = s.downloadUrl?.find((d: any) => d.quality === "320kbps")?.url;
          const url160 = s.downloadUrl?.find((d: any) => d.quality === "160kbps")?.url;
          const audioUrl = url320 || url160 || s.downloadUrl?.[0]?.url || "";
          const coverUrl = s.image?.find((i: any) => i.quality === "500x500")?.url;
          const artist = s.artists?.primary?.map((a: any) => a.name).join(", ") || s.primaryArtists || "";
          
          setLocalTrack({
            id: songId,
            title: s.name,
            artist,
            audioUrl,
            coverUrl,
            duration: s.duration,
            color: "#0058bb" // Default color, can be enhanced
          });
        }
      } catch (err) {
        console.error("Failed to fetch track", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTrack();
  }, [songId, currentTrack]);

  // Fetch lyrics
  useEffect(() => {
    if (!songId.startsWith("saavn_")) return;
    const fetchLyrics = async () => {
      setLyricsLoading(true);
      try {
        const saavnId = songId.replace("saavn_", "");
        const res = await fetch(`/api/saavn?type=lyrics&id=${saavnId}`);
        const data = await res.json();
        if (data?.success && data.data?.lyrics) {
          setLyrics(data.data.lyrics);
        } else {
          setLyrics("Lyrics not available for this song.");
        }
      } catch {
        setLyrics("Failed to load lyrics.");
      } finally {
        setLyricsLoading(false);
      }
    };
    fetchLyrics();
  }, [songId]);

  useEffect(() => {
    try {
      const liked = JSON.parse(localStorage.getItem("pandas_liked_tracks") || "[]");
      if (displayTrack) {
        setIsLiked(liked.includes(String(displayTrack.id)));
      }
    } catch { }
  }, [displayTrack]);

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    seek(Number(e.target.value));
  };

  const toggleLike = () => {
    setIsLiked((prev) => {
      const next = !prev;
      try {
        const liked: string[] = JSON.parse(localStorage.getItem("pandas_liked_tracks") || "[]");
        const id = displayTrack ? String(displayTrack.id) : "";
        if (!id) return prev;
        if (next) { if (!liked.includes(id)) liked.push(id); }
        else { const i = liked.indexOf(id); if (i > -1) liked.splice(i, 1); }
        localStorage.setItem("pandas_liked_tracks", JSON.stringify(liked));
      } catch { }
      return next;
    });
  };

  const analyzeLyrics = async () => {
    const track = displayTrack;
    if (!lyrics || aiLoading || !track) return;
    setAiLoading(true);
    try {
      const res = await fetch("/api/lyrics-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lyrics, title: track.title, artist: track.artist })
      });
      const data = await res.json();
      if (data.success) {
        setAiInsight(data.data);
      }
    } catch (err) {
      console.error("AI Analysis failed", err);
    } finally {
      setAiLoading(false);
    }
  };

  const handlePlayNow = () => {
    if (localTrack) {
      play([localTrack], 0);
    }
  };

  if (loading && !displayTrack) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-[#0a0a0a]">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
          <Loader2 size={40} className="text-white/20" />
        </motion.div>
        <p className="text-white/40 text-sm font-medium tracking-wide">Tuning in…</p>
      </div>
    );
  }

  if (!displayTrack) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 bg-[#0a0a0a] px-6 text-center">
        <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center">
          <Music2 size={40} className="text-white/20" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white mb-2">Song not found</h2>
          <p className="text-white/40 text-sm">We couldn't find the song you're looking for.</p>
        </div>
        <button onClick={() => router.push("/music")} className="px-8 py-3 bg-white text-black rounded-full font-bold text-sm hover:scale-105 transition-all">
          Browse Music
        </button>
      </div>
    );
  }

  const pct = duration > 0 ? (progress / duration) * 100 : 0;
  const color = displayTrack.color ?? "#0058bb";
  const isCurrentlyPlaying = currentTrack && String(currentTrack.id) === String(displayTrack.id);

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-[#0a0a0a]">
      {/* ── Background Layer ── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          className="absolute inset-0"
          animate={{ 
            opacity: [0.4, 0.6, 0.4],
            scale: [1, 1.05, 1],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          style={{ 
            background: `radial-gradient(circle at 50% 30%, ${color}aa, transparent 70%), 
                         radial-gradient(circle at 80% 80%, ${color}44, transparent 50%),
                         linear-gradient(to bottom, transparent, #0a0a0a 90%)` 
          }}
        />
        <div className="absolute inset-0 backdrop-blur-[100px]" />
      </div>

      {/* ── Top Navigation ── */}
      <header className="relative z-50 flex items-center justify-between px-6 pt-12 pb-4">
        <button onClick={() => router.back()} className="w-10 h-10 flex items-center justify-center rounded-full bg-black/20 text-white/80 hover:text-white hover:bg-black/40 transition-all active:scale-90">
          <ArrowLeft size={24} />
        </button>
        <div className="flex flex-col items-center">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Now Playing</p>
          <p className="text-xs font-bold text-white/90 truncate max-w-[150px]">{displayTrack.title}</p>
        </div>
        <button onClick={() => setShowQueue(v => !v)} className={`w-10 h-10 flex items-center justify-center rounded-full transition-all ${showQueue ? "bg-white text-black" : "bg-black/20 text-white/80 hover:text-white"}`}>
          <List size={20} />
        </button>
      </header>

      {/* ── Main Content ── */}
      <main className="relative z-10 flex-1 flex flex-col px-6 pb-8 overflow-y-auto no-scrollbar">
        <AnimatePresence mode="wait">
          {showQueue ? (
            /* ── Queue View ── */
            <motion.div key="queue" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="flex-1 pt-4">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-black text-white">Queue</h2>
                <button onClick={() => setShowQueue(false)} className="text-white/40 text-sm font-bold hover:text-white">Done</button>
              </div>
              <div className="space-y-1">
                {queue.map((t, i) => (
                  <button key={`${t.id}-${i}`} onClick={() => { play(queue, i); setShowQueue(false); }}
                    className={`flex items-center gap-4 w-full p-2 rounded-xl transition-all ${i === queueIdx ? "bg-white/10" : "hover:bg-white/5"}`}>
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-white/5 flex-shrink-0">
                      <img src={t.coverUrl} alt={t.title} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 text-left min-w-0">
                      <p className={`text-sm font-bold truncate ${i === queueIdx ? "text-white" : "text-white/80"}`}>{t.title}</p>
                      <p className="text-xs text-white/40 truncate">{t.artist}</p>
                    </div>
                    {i === queueIdx && <EqualizerBars color={color} playing={isPlaying} />}
                  </button>
                ))}
              </div>
            </motion.div>
          ) : (
            /* ── Player / Lyrics / Info View ── */
            <div className="flex-1 flex flex-col">
              {/* Tabs */}
              <div className="flex items-center justify-center gap-8 mb-8 mt-2">
                {[
                  { id: "player", icon: Disc, label: "Canvas" },
                  { id: "lyrics", icon: Mic2, label: "Lyrics" },
                  { id: "info", icon: Info, label: "About" }
                ].map(tab => (
                  <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`flex flex-col items-center gap-1 transition-all ${activeTab === tab.id ? "text-white scale-110" : "text-white/30 hover:text-white/60"}`}>
                    <tab.icon size={20} strokeWidth={activeTab === tab.id ? 2.5 : 2} />
                    <span className="text-[9px] font-black uppercase tracking-widest">{tab.label}</span>
                  </button>
                ))}
              </div>

              <div className="flex-1 flex flex-col">
                {activeTab === "player" && (
                  <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex-1 flex flex-col items-center gap-10">
                    {/* Big Artwork */}
                    <motion.div 
                      layoutId={`artwork-${displayTrack.id}`}
                      className="w-full aspect-square max-w-[340px] rounded-[2rem] overflow-hidden shadow-[0_40px_100px_-20px_rgba(0,0,0,0.5)] relative group"
                      animate={{ scale: isCurrentlyPlaying && isPlaying ? 1 : 0.94 }}
                      transition={SPRING}
                    >
                      <img src={displayTrack.coverUrl} alt={displayTrack.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                      {!isCurrentlyPlaying && (
                        <button onClick={handlePlayNow} className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-[2px]">
                          <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center text-black shadow-2xl scale-90 group-hover:scale-100 transition-transform">
                            <Play size={32} fill="black" className="ml-1" />
                          </div>
                        </button>
                      )}
                    </motion.div>

                    {/* Metadata */}
                    <div className="w-full flex items-end justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <motion.h1 initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="text-3xl font-black text-white leading-tight tracking-tight truncate">
                          {displayTrack.title}
                        </motion.h1>
                        <motion.p initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="text-lg text-white/50 font-bold mt-1 truncate">
                          {displayTrack.artist}
                        </motion.p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={toggleLike} className="w-12 h-12 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 active:scale-90 transition-all">
                          <Heart size={26} fill={isLiked ? "#ef4444" : "none"} className={isLiked ? "text-red-500" : "text-white/40"} />
                        </button>
                        <button className="w-12 h-12 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 active:scale-90 transition-all">
                          <Plus size={26} className="text-white/40" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeTab === "lyrics" && (
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex-1 flex flex-col gap-6">
                    {/* AI Insight Box */}
                    <div className="relative group">
                      <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200" />
                      <div className="relative flex flex-col gap-4 p-5 rounded-3xl bg-black/40 border border-white/10 backdrop-blur-xl">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                              <Sparkles size={16} className="text-white" />
                            </div>
                            <div>
                              <p className="text-[10px] font-black uppercase tracking-widest text-white/40">Panda AI</p>
                              <h3 className="text-sm font-black text-white">Lyrics Intelligence</h3>
                            </div>
                          </div>
                          {!aiInsight && !aiLoading && (
                            <button onClick={analyzeLyrics} className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest text-white hover:bg-white/10 transition-all active:scale-95">
                              Analyze
                            </button>
                          )}
                        </div>

                        {aiLoading ? (
                          <div className="flex items-center gap-3 py-2">
                            <div className="flex gap-1">
                              {[1, 2, 3].map(i => (
                                <motion.div key={i} className="w-1.5 h-1.5 rounded-full bg-blue-500"
                                  animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }}
                                  transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.2 }} />
                              ))}
                            </div>
                            <p className="text-[11px] font-bold text-white/40 tracking-wider">AI is decoding the vibes...</p>
                          </div>
                        ) : aiInsight ? (
                          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                            <p className="text-xs leading-relaxed text-white/70 italic">"{aiInsight.analysis}"</p>
                            <div className="grid grid-cols-2 gap-3 pt-2">
                              {aiInsight.sections.slice(0, 2).map((s: any, i: number) => (
                                <div key={i} className="p-3 rounded-2xl bg-white/5 border border-white/5">
                                  <p className="text-[9px] font-black uppercase tracking-widest text-white/30 mb-1">{s.title}</p>
                                  <p className="text-[10px] font-bold text-white/80 line-clamp-2">{s.content}</p>
                                </div>
                              ))}
                            </div>
                          </motion.div>
                        ) : (
                          <p className="text-[11px] text-white/40 font-medium leading-relaxed">
                            Panda AI can analyze the mood, themes, and cultural context of these lyrics. Click analyze to start.
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="rounded-3xl bg-white/5 p-8 flex-1 overflow-y-auto no-scrollbar border border-white/10">
                      {lyricsLoading ? (
                        <div className="h-full flex flex-col items-center justify-center gap-4">
                          <Loader2 size={32} className="text-white/20 animate-spin" />
                          <p className="text-white/30 text-sm font-bold uppercase tracking-widest">Loading Lyrics</p>
                        </div>
                      ) : (
                        <div className="space-y-6">
                          {lyrics?.split("\n").map((line, i) => (
                            <p key={i} className={`text-2xl font-black transition-all duration-500 ${i === 0 ? "text-white" : "text-white/20 hover:text-white/40"}`}>
                              {line || "• • •"}
                            </p>
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}

                {activeTab === "info" && (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex-1 space-y-6">
                    {/* Artist Card */}
                    <div className="rounded-[2rem] bg-white/5 p-6 border border-white/10 overflow-hidden relative group">
                      <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full blur-3xl -mr-20 -mt-20 group-hover:bg-white/10 transition-all" />
                      <div className="flex items-center gap-4 mb-6 relative z-10">
                        <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center overflow-hidden border-2 border-white/20">
                          <Users size={32} className="text-white/40" />
                        </div>
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-1">Artist</p>
                          <h3 className="text-xl font-black text-white">{displayTrack.artist}</h3>
                        </div>
                        <button className="ml-auto px-4 py-2 rounded-full border border-white/20 text-xs font-bold hover:bg-white hover:text-black transition-all">Follow</button>
                      </div>
                      <p className="text-sm text-white/50 leading-relaxed relative z-10">
                        {displayTrack.artist} is a featured artist on PandaStore Music. Explore their top hits and latest releases in our curated Telugu music collection.
                      </p>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white/5 p-5 rounded-3xl border border-white/5 flex flex-col gap-2">
                        <div className="flex items-center gap-2 text-white/30">
                          <Star size={14} />
                          <span className="text-[10px] font-black uppercase tracking-widest">Popularity</span>
                        </div>
                        <p className="text-xl font-black text-white">#12 Trending</p>
                      </div>
                      <div className="bg-white/5 p-5 rounded-3xl border border-white/5 flex flex-col gap-2">
                        <div className="flex items-center gap-2 text-white/30">
                          <Disc size={14} />
                          <span className="text-[10px] font-black uppercase tracking-widest">Format</span>
                        </div>
                        <p className="text-xl font-black text-white">Lossless HQ</p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          )}
        </AnimatePresence>
      </main>

      {/* ── Player Controls (Sticky at bottom) ── */}
      <footer className="relative z-50 px-6 pb-12 pt-4 bg-gradient-to-t from-[#0a0a0a] to-transparent">
        {/* Progress Section */}
        <div className="mb-8">
          <div className="group relative h-1.5 rounded-full bg-white/10 mb-3 cursor-pointer">
            <motion.div 
              className="absolute top-0 left-0 h-full rounded-full transition-all duration-100"
              style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${color}, #fff)` }} 
            />
            <motion.div 
              className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white shadow-xl scale-0 group-hover:scale-100 transition-transform"
              style={{ left: `calc(${pct}% - 8px)` }}
            />
            <input type="range" min={0} max={duration || 100} step={0.1} value={progress}
              onChange={handleSeek} aria-label="Seek"
              className="absolute inset-0 w-full opacity-0 cursor-pointer h-full" />
          </div>
          <div className="flex justify-between text-[10px] font-black text-white/30 tracking-widest font-mono">
            <span>{fmt(progress)}</span>
            <span>{fmt(duration)}</span>
          </div>
        </div>

        {/* Controls Grid */}
        <div className="flex items-center justify-between">
          <button onClick={() => setShuffleOn(s => !s)} className={`p-2 transition-all ${shuffleOn ? "text-white" : "text-white/20"}`}>
            <Shuffle size={20} />
          </button>
          
          <div className="flex items-center gap-8">
            <button onClick={skipPrev} className="text-white/80 hover:text-white transition-all active:scale-75">
              <SkipBack size={32} fill="currentColor" />
            </button>
            
            <button onClick={togglePlay} className="w-20 h-20 rounded-full bg-white text-black flex items-center justify-center shadow-[0_15px_40px_-10px_rgba(255,255,255,0.3)] hover:scale-105 active:scale-90 transition-all">
              {isPlaying ? <Pause size={36} fill="black" /> : <Play size={36} fill="black" className="ml-1" />}
            </button>
            
            <button onClick={skipNext} className="text-white/80 hover:text-white transition-all active:scale-75">
              <SkipForward size={32} fill="currentColor" />
            </button>
          </div>

          <button onClick={() => setRepeat(r => r === "off" ? "all" : r === "all" ? "one" : "off")} className={`p-2 transition-all relative ${repeat !== "off" ? "text-white" : "text-white/20"}`}>
            <Repeat size={20} />
            {repeat === "one" && <span className="absolute top-0 right-0 text-[8px] font-black">1</span>}
          </button>
        </div>

        {/* Bottom Actions */}
        <div className="flex items-center justify-between mt-10 px-2">
          <button className="text-white/30 hover:text-white transition-all">
            <Share2 size={20} />
          </button>
          
          <div className="flex items-center gap-4 bg-white/5 px-4 py-2 rounded-full border border-white/5">
            <button onClick={() => setMuted(m => !m)} className="text-white/40">
              {muted || volume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />}
            </button>
            <div className="w-20 h-1 bg-white/10 rounded-full relative overflow-hidden">
              <div className="absolute top-0 left-0 h-full bg-white/40" style={{ width: `${(muted ? 0 : volume) * 100}%` }} />
              <input type="range" min={0} max={1} step={0.01} value={muted ? 0 : volume}
                onChange={(e) => { setVolumeState(Number(e.target.value)); setMuted(false); }}
                className="absolute inset-0 w-full opacity-0 cursor-pointer" />
            </div>
          </div>

          <button className="text-white/30 hover:text-white transition-all">
            <MoreHorizontal size={20} />
          </button>
        </div>
      </footer>
    </div>
  );
}
