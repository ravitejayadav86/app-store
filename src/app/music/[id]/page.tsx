"use client";

import React, { useEffect, useState, useMemo, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { motion, AnimatePresence, useSpring, useTransform, useMotionValue } from "framer-motion";
import {
  ArrowLeft, Play, Pause, SkipBack, SkipForward,
  Heart, Shuffle, Repeat, Volume2, VolumeX,
  Music2, List, Loader2, Share2, Plus, MoreHorizontal,
  Mic2, Info, Disc, Users, Star, Sparkles, Zap, BarChart2, Globe, FileText, RefreshCw, Languages
} from "lucide-react";
import { useMusicPlayer, MiniTrack } from "@/lib/MusicContext";

// Ultra-smooth spring presets
const SP_GENTLE  = { type: "spring", stiffness: 200, damping: 28, mass: 0.8 } as const;
const SP_SNAPPY  = { type: "spring", stiffness: 500, damping: 38, mass: 0.5 } as const;
const SP_ARTWORK = { type: "spring", stiffness: 280, damping: 32, mass: 1.0 } as const;
const EASE_OUT   = { duration: 0.45, ease: [0.16, 1, 0.3, 1] } as const;
const EASE_FAST  = { duration: 0.25, ease: [0.16, 1, 0.3, 1] } as const;

function fmt(s: number) {
  if (!isFinite(s) || s < 0) return "0:00";
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

function EqualizerBars({ color, playing }: { color: string; playing: boolean }) {
  return (
    <div className="flex items-end gap-[3px] h-5">
      {[1,2,3,4,5].map((b) => (
        <motion.div
          key={b}
          className="w-[3px] rounded-full"
          style={{ background: color, originY: 1 }}
          animate={playing
            ? { scaleY: [0.2, 1, 0.5, 0.9, 0.3], opacity: [0.6,1,0.8,1,0.6] }
            : { scaleY: 0.15, opacity: 0.3 }}
          transition={{ duration: 0.55 + b * 0.12, repeat: Infinity, ease: "easeInOut", delay: b * 0.08 }}
        />
      ))}
    </div>
  );
}

function PulseDot({ color }: { color: string }) {
  return (
    <span className="relative flex h-2.5 w-2.5">
      <motion.span className="absolute inline-flex h-full w-full rounded-full opacity-75"
        style={{ background: color }}
        animate={{ scale: [1, 2.2, 1], opacity: [0.7, 0, 0.7] }}
        transition={{ duration: 1.6, repeat: Infinity, ease: "easeOut" }} />
      <span className="relative inline-flex rounded-full h-2.5 w-2.5" style={{ background: color }} />
    </span>
  );
}

export default function SongDetailPage() {
  const router = useRouter();
  const params = useParams();
  const songId = params.id as string;
  const { 
    track: currentTrack, queue, queueIdx, isPlaying, progress, duration, 
    togglePlay, skipNext, skipPrev, seek, play,
    volume: globalVolume, setVolume: setGlobalVolume
  } = useMusicPlayer();

  const [localTrack, setLocalTrack] = useState<MiniTrack | null>(null);
  const [loading, setLoading] = useState(false);
  const [lyrics, setLyrics] = useState<string | null>(null);
  const [lyricsLoading, setLyricsLoading] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [showQueue, setShowQueue] = useState(false);
  const [activeTab, setActiveTab] = useState<"player" | "lyrics" | "info">("player");
  const [aiInsight, setAiInsight] = useState<any | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiStep, setAiStep] = useState(0);
  const [shuffleOn, setShuffleOn] = useState(false);
  const [repeat, setRepeat] = useState<"off" | "one" | "all">("off");
  const [muted, setMuted] = useState(false);
  
  const [lyricsMode, setLyricsMode] = useState<"native" | "english">("native");
  const [englishLyrics, setEnglishLyrics] = useState<string | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);

  const isCurrentlyPlaying = currentTrack && String(currentTrack.id) === songId;

  // ── Beat Simulation (Dances when playing) ──
  const [beatVal, setBeatVal] = useState(0);
  const beat = useMotionValue(0);
  useEffect(() => {
    if (!isPlaying || !isCurrentlyPlaying) {
      beat.set(0);
      setBeatVal(0);
      return;
    }
    const interval = setInterval(() => {
      const v = Math.random() * 0.5 + 0.5;
      beat.set(v);
      setBeatVal(v);
      setTimeout(() => {
        beat.set(0);
        setBeatVal(0);
      }, 100);
    }, 450);
    return () => clearInterval(interval);
  }, [isPlaying, isCurrentlyPlaying, beat]);

  const beatScale = useSpring(beat, { stiffness: 300, damping: 15 });

  const toggleLyricsMode = async () => {
    if (lyricsMode === "english") {
      setLyricsMode("native");
      return;
    }
    
    // Switch to english
    if (englishLyrics) {
      setLyricsMode("english");
      return;
    }

    if (!lyrics || lyrics.includes("Lyrics not available")) return;

    setIsTranslating(true);
    try {
      const res = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: lyrics, targetLang: "en" })
      });
      const data = await res.json();
      if (data.success && data.data?.transliterated) {
        setEnglishLyrics(data.data.transliterated);
        setLyricsMode("english");
      }
    } catch (err) {
      console.error("Translation failed", err);
    } finally {
      setIsTranslating(false);
    }
  };

  // Smooth spring progress for seek bar
  const rawProgress = useMotionValue(0);
  const springProgress = useSpring(rawProgress, { stiffness: 60, damping: 18, mass: 0.6 });

  // Sync with current playing track if it matches the URL ID
  const displayTrack = useMemo(() => {
    if (currentTrack && String(currentTrack.id) === songId) return currentTrack;
    return localTrack;
  }, [currentTrack, songId, localTrack]);

  const color = displayTrack?.color ?? "#0058bb";

  // Reset AI when song changes
  useEffect(() => {
    setAiInsight(null);
    setAiLoading(false);
    setAiStep(0);
  }, [displayTrack?.id]);

  // Sync spring progress with playback
  useEffect(() => {
    rawProgress.set(duration > 0 ? (progress / duration) * 100 : 0);
  }, [progress, duration, rawProgress]);

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
    if (!displayTrack) return;
    
    const fetchLyrics = async () => {
      setLyricsLoading(true);
      try {
        let saavnId = "";
        
        if (songId.startsWith("saavn_")) {
          saavnId = songId.replace("saavn_", "");
        } else if (displayTrack.title) {
          // For local uploaded tracks, try to find a matching song on Saavn to get its lyrics
          const query = encodeURIComponent(`${displayTrack.title} ${displayTrack.artist || ""}`);
          const searchRes = await fetch(`/api/saavn?type=search&q=${query}&limit=1`);
          const searchData = await searchRes.json();
          if (searchData?.success && searchData.data?.results?.length > 0) {
            saavnId = searchData.data.results[0].id;
          }
        }

        if (saavnId) {
          const res = await fetch(`/api/saavn?type=lyrics&id=${saavnId}`);
          const data = await res.json();
          if (data?.success && data.data?.lyrics) {
            // Found lyrics!
            setLyrics(data.data.lyrics.replace(/<br>/g, "\n"));
            setLyricsLoading(false);
            return;
          }
        }
        
        setLyrics("Lyrics not available for this song.\n\nTap Analyze ✦ to run a sonic & metadata analysis.");
      } catch {
        setLyrics("Failed to load lyrics.");
      } finally {
        setLyricsLoading(false);
      }
    };
    
    fetchLyrics();
  }, [songId, displayTrack]);

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
    if (aiLoading || !track) return;
    
    setAiLoading(true);
    setAiStep(0);
    try {
      const res = await fetch("/api/lyrics-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lyrics: lyrics || "", title: track.title, artist: track.artist })
      });
      const data = await res.json();
      if (data.success) {
        setAiInsight(data.data);
        // Stagger each section card reveal
        const total = data.data?.sections?.length ?? 0;
        for (let i = 1; i <= total; i++) {
          await new Promise(r => setTimeout(r, 180));
          setAiStep(i);
        }
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
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 bg-[#080808]">
        <div className="relative">
          <motion.div className="w-24 h-24 rounded-full border-2 border-white/10"
            animate={{ rotate: 360 }} transition={{ duration: 3, repeat: Infinity, ease: "linear" }} />
          <motion.div className="absolute inset-3 rounded-full border border-white/5"
            animate={{ rotate: -360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }} />
          <div className="absolute inset-0 flex items-center justify-center">
            <Music2 size={28} className="text-white/20" />
          </div>
        </div>
        <motion.p className="text-white/30 text-xs font-bold uppercase tracking-[0.3em]"
          animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 2, repeat: Infinity }}>
          Tuning in…
        </motion.p>
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

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-[#080808]">
      {/* ── Animated Background ── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Primary ambient orb — breathes with playback */}
        <motion.div className="absolute -top-1/4 -left-1/4 w-[150%] h-[150%] rounded-full"
          animate={{ scale: isPlaying ? [1, 1.06, 1] : 1, opacity: isPlaying ? [0.35, 0.5, 0.35] : 0.25 }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          style={{ background: `radial-gradient(circle at 40% 40%, ${color}66, transparent 65%)` }} />
        {/* Secondary orb — slow drift */}
        <motion.div className="absolute bottom-0 right-0 w-[80%] h-[80%]"
          animate={{ x: [0, 30, 0], y: [0, -20, 0], opacity: [0.2, 0.35, 0.2] }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
          style={{ background: `radial-gradient(circle at 60% 60%, ${color}44, transparent 70%)` }} />
        {/* Deep noise overlay */}
        <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(8,8,8,0) 0%, rgba(8,8,8,0.7) 60%, #080808 100%)" }} />
        <div className="absolute inset-0 backdrop-blur-[120px]" />
      </div>

      {/* ── Top Navigation ── */}
      <motion.header initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={EASE_OUT}
        className="relative z-50 flex items-center justify-between px-6 pt-12 pb-4">
        <motion.button onClick={() => router.back()} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.92 }}
          className="w-11 h-11 flex items-center justify-center rounded-full bg-white/8 backdrop-blur-xl border border-white/10 text-white/70 hover:text-white transition-colors">
          <ArrowLeft size={20} />
        </motion.button>
        <motion.div className="flex flex-col items-center"
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ ...EASE_OUT, delay: 0.1 }}>
          <div className="flex items-center gap-1.5 mb-0.5">
            {isCurrentlyPlaying && isPlaying && <PulseDot color={color} />}
            <p className="text-[9px] font-black uppercase tracking-[0.25em] text-white/30">
              {isCurrentlyPlaying ? "Now Playing" : "Preview"}
            </p>
          </div>
          <p className="text-xs font-bold text-white/80 truncate max-w-[160px]">{displayTrack.title}</p>
        </motion.div>
        <motion.button onClick={() => setShowQueue(v => !v)} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.92 }}
          className={`w-11 h-11 flex items-center justify-center rounded-full backdrop-blur-xl border transition-all ${
            showQueue ? "bg-white text-black border-white" : "bg-white/8 text-white/60 border-white/10 hover:text-white"
          }`}>
          <List size={20} />
        </motion.button>
      </motion.header>

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
              <div className="flex items-center justify-center mb-8 mt-2">
                <div className="flex items-center gap-1 p-1.5 rounded-2xl bg-white/5 border border-white/8 backdrop-blur-xl">
                  {[
                    { id: "player", icon: Disc, label: "Canvas" },
                    { id: "lyrics", icon: Mic2, label: "Lyrics" },
                    { id: "info", icon: Info, label: "About" }
                  ].map(tab => (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id as any)}
                      className="relative flex items-center gap-1.5 px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-wider transition-colors"
                      style={{ color: activeTab === tab.id ? "#fff" : "rgba(255,255,255,0.3)" }}>
                      {activeTab === tab.id && (
                        <motion.div layoutId="tab-pill"
                          className="absolute inset-0 rounded-xl bg-white/12 border border-white/15"
                          transition={SP_SNAPPY} />
                      )}
                      <tab.icon size={13} className="relative z-10" strokeWidth={activeTab === tab.id ? 2.5 : 2} />
                      <span className="relative z-10">{tab.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex-1 flex flex-col">
                {activeTab === "player" && (
                  <motion.div key="player-tab"
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    transition={EASE_OUT}
                    className="flex-1 flex flex-col items-center gap-10">
                    {/* Big Artwork */}
                    <motion.div
                      layoutId={`artwork-${displayTrack.id}`}
                      className="w-full aspect-square max-w-[280px] md:max-w-[340px] rounded-[2.5rem] overflow-hidden relative group"
                      animate={{ scale: isCurrentlyPlaying && isPlaying ? 1 : 0.94 }}
                      transition={SP_ARTWORK}
                      style={{ boxShadow: `0 30px 80px -15px ${color}60, 0 0 0 1px rgba(255,255,255,0.06)` }}>
                      <img src={displayTrack.coverUrl} alt={displayTrack.title} className="w-full h-full object-cover" />
                      {/* Vinyl shimmer overlay */}
                      <motion.div className="absolute inset-0 rounded-[2rem]"
                        animate={{ opacity: isCurrentlyPlaying && isPlaying ? [0, 0.06, 0] : 0 }}
                        transition={{ duration: 3, repeat: Infinity }}
                        style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.2) 0%, transparent 50%, rgba(255,255,255,0.1) 100%)" }} />
                    </motion.div>

                    {/* Metadata */}
                    <div className="w-full flex items-end justify-between gap-4 -mt-4 md:mt-0 px-2">
                      <div className="flex-1 min-w-0">
                        <motion.h1 
                          style={{ scale: useTransform(beatScale, [0, 1], [1, 1.02]) }}
                          className="text-2xl md:text-3xl font-black text-white leading-tight tracking-tight truncate">
                          {displayTrack.title}
                        </motion.h1>
                        <motion.p className="text-sm md:text-base text-white/45 font-bold mt-0.5 md:mt-1 truncate">
                          {displayTrack.artist}
                        </motion.p>
                      </div>
                      <div className="flex items-center gap-2">
                        <motion.button onClick={toggleLike} whileTap={{ scale: 0.85 }}
                          className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full bg-white/6 hover:bg-white/12 border border-white/8 transition-colors">
                          <Heart size={20} fill={isLiked ? "#ef4444" : "none"} className={isLiked ? "text-red-500" : "text-white/40"} />
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                )}

                         {activeTab === "lyrics" && (
                  <motion.div key="lyrics-tab" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={EASE_OUT} className="flex-1 flex flex-col gap-4">
                    {/* ── Panda AI Card ── */}
                    <div className="relative">
                      {/* Animated glow border */}
                      <motion.div className="absolute -inset-px rounded-3xl"
                        animate={{ opacity: aiLoading ? [0.4, 0.9, 0.4] : aiInsight ? 0.5 : 0.2 }}
                        transition={{ duration: 1.6, repeat: aiLoading ? Infinity : 0 }}
                        style={{ background: "linear-gradient(135deg, #3b82f6, #8b5cf6, #ec4899)", borderRadius: "inherit" }} />
                      <div className="relative flex flex-col gap-4 p-5 rounded-3xl bg-[#0d0d14]/90 border border-white/8 backdrop-blur-2xl overflow-hidden">
                        {/* Ambient glow inside card */}
                        <div className="absolute top-0 right-0 w-40 h-40 rounded-full blur-3xl opacity-20 -mr-10 -mt-10"
                          style={{ background: "radial-gradient(circle, #6366f1, transparent)" }} />

                        {/* Header */}
                        <div className="flex items-center justify-between relative z-10">
                          <div className="flex items-center gap-3">
                            <motion.div className="w-9 h-9 rounded-2xl flex items-center justify-center"
                              animate={aiLoading ? { scale: [1, 1.1, 1] } : {}}
                              transition={{ duration: 1, repeat: Infinity }}
                              style={{ background: "linear-gradient(135deg, #3b82f6, #8b5cf6)" }}>
                              <Sparkles size={16} className="text-white" />
                            </motion.div>
                            <div>
                              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/30">Panda AI</p>
                              <h3 className="text-sm font-black text-white leading-none mt-0.5">Lyrics Intelligence</h3>
                            </div>
                          </div>
                          <AnimatePresence mode="wait">
                            {!aiInsight && !aiLoading && (
                              <motion.button key="analyze-btn" onClick={analyzeLyrics}
                                initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
                                whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.95 }}
                                className="px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest text-white border border-white/15 bg-white/5 hover:bg-white/10 transition-colors">
                                Analyze ✦
                              </motion.button>
                            )}
                            {aiInsight && (
                              <motion.button key="redo-btn" onClick={() => { setAiInsight(null); setAiStep(0); }}
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                whileTap={{ scale: 0.9 }}
                                className="p-2 rounded-full text-white/30 hover:text-white/60 transition-colors">
                                <RefreshCw size={14} />
                              </motion.button>
                            )}
                          </AnimatePresence>
                        </div>

                        {/* Body */}
                        <AnimatePresence mode="wait">
                          {aiLoading ? (
                            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                              className="flex flex-col gap-3 py-1">
                              <div className="flex items-center gap-2.5">
                                <div className="flex gap-1">
                                  {[0,1,2,3,4].map(i => (
                                    <motion.div key={i} className="w-1 rounded-full bg-indigo-400"
                                      style={{ height: "14px", originY: 1 }}
                                      animate={{ scaleY: [0.2, 1, 0.2] }}
                                      transition={{ duration: 0.7, repeat: Infinity, delay: i * 0.1, ease: "easeInOut" }} />
                                  ))}
                                </div>
                                <motion.p className="text-[11px] font-bold text-white/40 tracking-wide"
                                  animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 1.5, repeat: Infinity }}>
                                  Decoding lyrical patterns…
                                </motion.p>
                              </div>
                              {/* Skeleton cards */}
                              <div className="grid grid-cols-2 gap-2">
                                {[1,2,3,4].map(i => (
                                  <motion.div key={i} className="h-14 rounded-2xl bg-white/4"
                                    animate={{ opacity: [0.3, 0.6, 0.3] }}
                                    transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.15 }} />
                                ))}
                              </div>
                            </motion.div>
                          ) : aiInsight ? (
                            <motion.div key="result" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                              {/* Signature line */}
                              {aiInsight.signatureLine && (
                                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                                  className="px-4 py-3 rounded-2xl border-l-2 border-indigo-500/60 bg-indigo-500/5">
                                  <p className="text-[11px] text-indigo-300/80 italic leading-relaxed">"{aiInsight.signatureLine}"</p>
                                </motion.div>
                              )}
                              {/* Summary */}
                              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
                                className="text-[11px] leading-relaxed text-white/55">
                                {aiInsight.analysis}
                              </motion.p>
                              {/* Mood tags */}
                              {aiInsight.moodTags && (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
                                  className="flex flex-wrap gap-1.5">
                                  {aiInsight.moodTags.map((tag: string, i: number) => (
                                    <span key={i} className="px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider bg-white/6 border border-white/10 text-white/60">
                                      {tag}
                                    </span>
                                  ))}
                                </motion.div>
                              )}
                              {/* Staggered section cards */}
                              <div className="grid grid-cols-2 gap-2">
                                {aiInsight.sections.map((s: any, i: number) => (
                                  <AnimatePresence key={i}>
                                    {i < aiStep && (
                                      <motion.div
                                        initial={{ opacity: 0, y: 12, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        transition={{ ...SP_GENTLE, delay: 0 }}
                                        className="p-3 rounded-2xl bg-white/5 border border-white/8 flex flex-col gap-1">
                                        <p className="text-[8px] font-black uppercase tracking-widest text-white/25">{s.title}</p>
                                        <p className="text-[10px] font-bold text-white/80 line-clamp-2">{s.value}</p>
                                        {s.detail && <p className="text-[9px] text-white/35 line-clamp-1">{s.detail}</p>}
                                      </motion.div>
                                    )}
                                  </AnimatePresence>
                                ))}
                              </div>
                            </motion.div>
                          ) : (
                            <motion.p key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                              className="text-[11px] text-white/35 font-medium leading-relaxed">
                              Panda AI analyzes mood, literary devices, cultural context and emotional arc. Tap <strong className="text-white/50">Analyze ✦</strong> to start.
                            </motion.p>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>

                    {/* ── Lyrics ── */}
                    <div className="rounded-3xl bg-white/4 px-6 py-6 flex-1 overflow-y-auto no-scrollbar border border-white/8 relative group">
                      
                      {/* English Translate Button */}
                      {lyrics && !lyrics.includes("Lyrics not available") && (
                        <div className="absolute top-4 right-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={toggleLyricsMode} disabled={isTranslating}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-colors backdrop-blur-md border ${lyricsMode === 'english' ? 'bg-primary/20 text-primary border-primary/30' : 'bg-white/10 text-white/50 border-white/10 hover:bg-white/20 hover:text-white'}`}>
                            {isTranslating ? <Loader2 size={12} className="animate-spin" /> : <Languages size={12} />}
                            {lyricsMode === 'english' ? 'Aa English' : 'Aa Translate'}
                          </button>
                        </div>
                      )}

                      {lyricsLoading ? (
                        <div className="flex flex-col items-center justify-center gap-3 py-10">
                          <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}>
                            <Loader2 size={24} className="text-white/20" />
                          </motion.div>
                          <p className="text-white/25 text-[10px] font-black uppercase tracking-widest">Loading Lyrics</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {(lyricsMode === 'english' && englishLyrics ? englishLyrics : lyrics)?.split("\n").filter(l => l.trim()).map((line, i) => (
                            <motion.p key={`${lyricsMode}-${i}`}
                              initial={{ opacity: 0, x: -8 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: i * 0.02, ...EASE_FAST }}
                              className="text-xl font-black leading-snug cursor-pointer transition-colors duration-300 hover:text-white text-white/25"
                              style={{ textShadow: "0 0 20px rgba(255,255,255,0)" }}
                              onMouseEnter={e => (e.currentTarget.style.textShadow = "0 0 20px rgba(255,255,255,0.15)")}
                              onMouseLeave={e => (e.currentTarget.style.textShadow = "0 0 20px rgba(255,255,255,0)")}>
                              {line}
                            </motion.p>
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
      <motion.footer initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ ...EASE_OUT, delay: 0.2 }}
        className="relative z-50 px-6 pb-12 pt-4" style={{ background: "linear-gradient(to top, #080808 60%, transparent)" }}>

        {/* ── Samsung One UI 8 "Air Flow" Liquid Seek Bar ── */}
        <div className="mb-8 relative group">
          <div className="relative h-12 flex items-center cursor-pointer overflow-visible">
            {/* Background Track */}
            <div className="absolute w-full h-1.5 rounded-full bg-white/5 overflow-hidden">
               <motion.div 
                className="absolute inset-0 bg-white/5"
                animate={{ opacity: [0.05, 0.15, 0.05] }}
                transition={{ duration: 4, repeat: Infinity }}
               />
            </div>
            
            {/* Liquid Progress Mask & Container */}
            <motion.div 
              className="absolute left-0 h-12 overflow-visible pointer-events-none"
              style={{ width: useTransform(springProgress, p => `${p}%`) }}
            >
              <div className="w-[100vw] h-full flex items-center relative overflow-visible">
                {/* ── Layer 1: The Deep Ambient Flow (Glow) ── */}
                <svg width="100%" height="48" viewBox="0 0 1000 48" preserveAspectRatio="none" className="absolute w-full opacity-20 blur-xl">
                  <motion.path
                    fill={color}
                    animate={{
                      d: isCurrentlyPlaying && isPlaying 
                        ? [
                            `M 0 24 Q 20 ${10 - (beatVal * 15)} 40 24 Q 60 ${38 + (beatVal * 15)} 80 24 T 160 24 T 240 24 T 320 24 T 400 24 T 480 24 T 560 24 T 640 24 T 720 24 T 800 24 T 880 24 T 960 24 T 1000 24 L 1000 48 L 0 48 Z`,
                            `M 0 24 Q 20 ${38 + (beatVal * 15)} 40 24 Q 60 ${10 - (beatVal * 15)} 80 24 T 160 24 T 240 24 T 320 24 T 400 24 T 480 24 T 560 24 T 640 24 T 720 24 T 800 24 T 880 24 T 960 24 T 1000 24 L 1000 48 L 0 48 Z`
                          ]
                        : "M 0 24 L 1000 24 L 1000 48 L 0 48 Z"
                    }}
                    transition={{ d: { duration: 2, repeat: Infinity, ease: "easeInOut" } }}
                  />
                </svg>

                {/* ── Layer 2: The Silk Wave (Mid-tone) ── */}
                <svg width="100%" height="48" viewBox="0 0 1000 48" preserveAspectRatio="none" className="absolute w-full opacity-40 blur-[2px]">
                  <motion.path
                    fill={color}
                    animate={{
                      d: isCurrentlyPlaying && isPlaying 
                        ? [
                            `M 0 24 Q 15 ${14 - (beatVal * 10)} 30 24 Q 45 ${34 + (beatVal * 10)} 60 24 T 120 24 T 180 24 T 240 24 T 300 24 T 360 24 T 420 24 T 480 24 T 540 24 T 600 24 T 660 24 T 720 24 T 780 24 T 840 24 T 900 24 T 960 24 T 1000 24 L 1000 48 L 0 48 Z`,
                            `M 0 24 Q 15 ${34 + (beatVal * 10)} 30 24 Q 45 ${14 - (beatVal * 10)} 60 24 T 120 24 T 180 24 T 240 24 T 300 24 T 360 24 T 420 24 T 480 24 T 540 24 T 600 24 T 660 24 T 720 24 T 780 24 T 840 24 T 900 24 T 960 24 T 1000 24 L 1000 48 L 0 48 Z`
                          ]
                        : "M 0 24 L 1000 24 L 1000 48 L 0 48 Z"
                    }}
                    transition={{ d: { duration: 1.5, repeat: Infinity, ease: "easeInOut" } }}
                  />
                </svg>

                {/* ── Layer 3: The Core Flow (Sharp) ── */}
                <svg width="100%" height="48" viewBox="0 0 1000 48" preserveAspectRatio="none" className="w-full relative z-10">
                  <defs>
                    <linearGradient id="liquid-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor={color} />
                      <stop offset="100%" stopColor="white" stopOpacity="0.4" />
                    </linearGradient>
                  </defs>
                  <motion.path
                    fill={color}
                    stroke="white"
                    strokeWidth="0.5"
                    strokeOpacity="0.3"
                    animate={{
                      d: isCurrentlyPlaying && isPlaying 
                        ? [
                            `M 0 24 Q 10 ${18 - (beatVal * 6)} 20 24 Q 30 ${30 + (beatVal * 6)} 40 24 Q 50 ${18 - (beatVal * 6)} 60 24 Q 70 ${30 + (beatVal * 6)} 80 24 T 200 24 T 400 24 T 600 24 T 800 24 T 1000 24 L 1000 48 L 0 48 Z`,
                            `M 0 24 Q 10 ${30 + (beatVal * 6)} 20 24 Q 30 ${18 - (beatVal * 6)} 40 24 Q 50 ${30 + (beatVal * 6)} 60 24 Q 70 ${18 - (beatVal * 6)} 80 24 T 200 24 T 400 24 T 600 24 T 800 24 T 1000 24 L 1000 48 L 0 48 Z`
                          ]
                        : "M 0 24 L 1000 24 L 1000 48 L 0 48 Z"
                    }}
                    transition={{
                      d: { duration: 0.8, repeat: Infinity, ease: "linear" },
                      default: { duration: 0.5, ease: "circOut" }
                    }}
                  />
                </svg>
              </div>
            </motion.div>

            {/* Premium "Liquid" Thumb */}
            <motion.div 
              className="absolute z-20 pointer-events-none flex items-center justify-center"
              style={{ 
                left: useTransform(springProgress, p => `calc(${p}% - 14px)`),
                scale: useTransform(beatScale, [0, 1], [1, 1.2])
              }}
            >
               <motion.div 
                className="w-7 h-7 rounded-full bg-white relative flex items-center justify-center shadow-2xl"
                style={{ 
                  boxShadow: `0 0 30px ${color}, 0 0 10px white`,
                  border: `2px solid ${color}44`
                }}
               >
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: color }} />
                  {/* Subtle inner pulse */}
                  <motion.div 
                    className="absolute inset-0 rounded-full border border-white/40"
                    animate={isCurrentlyPlaying && isPlaying ? { scale: [1, 1.4, 1], opacity: [0.5, 0, 0.5] } : {}}
                    transition={{ duration: 1, repeat: Infinity }}
                  />
               </motion.div>
            </motion.div>

            {/* Input Overlay */}
            <input type="range" min={0} max={duration || 100} step={0.1} value={progress}
              onChange={handleSeek} aria-label="Seek"
              className="absolute inset-0 w-full opacity-0 cursor-pointer h-full z-30" />
          </div>

          <div className="flex justify-between mt-3 text-[10px] font-black text-white/20 tracking-[0.2em] font-mono">
            <span>{fmt(progress)}</span>
            <span className="text-white/40">{fmt(duration)}</span>
          </div>
        </div>

        {/* ── Transport Controls ── */}
        <div className="flex items-center justify-between mb-8">
          <motion.button onClick={() => setShuffleOn(s => !s)} whileTap={{ scale: 0.88 }}
            className="p-2 transition-colors relative"
            style={{ color: shuffleOn ? "#fff" : "rgba(255,255,255,0.2)" }}>
            <Shuffle size={20} />
            {shuffleOn && <motion.div layoutId="control-dot" className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-white" />}
          </motion.button>

          <div className="flex items-center gap-7">
            <motion.button onClick={skipPrev} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.8 }}
              className="text-white/70 hover:text-white transition-colors">
              <SkipBack size={28} fill="currentColor" />
            </motion.button>

            <motion.button onClick={togglePlay}
              whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.88 }}
              transition={SP_SNAPPY}
              className="w-[72px] h-[72px] rounded-full bg-white text-black flex items-center justify-center relative"
              style={{ boxShadow: `0 12px 40px -8px ${color}88, 0 0 0 1px rgba(255,255,255,0.15)` }}>
              {/* Breathing ring when playing */}
              {isCurrentlyPlaying && isPlaying && (
                <motion.div className="absolute inset-0 rounded-full border-2 border-white/30"
                  animate={{ scale: [1, 1.18, 1], opacity: [0.6, 0, 0.6] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }} />
              )}
              <AnimatePresence mode="wait">
                {isPlaying
                  ? <motion.div key="pause" initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.7, opacity: 0 }} transition={SP_SNAPPY}><Pause size={32} fill="black" /></motion.div>
                  : <motion.div key="play" initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.7, opacity: 0 }} transition={SP_SNAPPY}><Play size={32} fill="black" className="ml-1" /></motion.div>
                }
              </AnimatePresence>
            </motion.button>

            <motion.button onClick={skipNext} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.8 }}
              className="text-white/70 hover:text-white transition-colors">
              <SkipForward size={28} fill="currentColor" />
            </motion.button>
          </div>

          <motion.button onClick={() => setRepeat(r => r === "off" ? "all" : r === "all" ? "one" : "off")}
            whileTap={{ scale: 0.88 }} className="p-2 transition-colors relative"
            style={{ color: repeat !== "off" ? "#fff" : "rgba(255,255,255,0.2)" }}>
            <Repeat size={20} />
            {repeat === "one" && <span className="absolute -top-0.5 -right-0.5 text-[7px] font-black bg-white text-black rounded-full w-3.5 h-3.5 flex items-center justify-center">1</span>}
            {repeat !== "off" && <motion.div layoutId="control-dot" className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-white" />}
          </motion.button>
        </div>

        {/* ── Secondary Bar ── */}
        <div className="flex items-center justify-between px-1">
          <motion.button whileTap={{ scale: 0.9 }} className="text-white/20 hover:text-white/50 transition-colors">
            <Share2 size={16} />
          </motion.button>

          <div className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-full border border-white/8 shadow-2xl">
            <motion.button onClick={() => setMuted(m => !m)} whileTap={{ scale: 0.9 }} className="text-white/40 hover:text-white transition-colors">
              {muted || globalVolume === 0 ? <VolumeX size={14} /> : <Volume2 size={14} />}
            </motion.button>
            <div className="w-24 h-1 rounded-full relative bg-white/10 overflow-hidden">
              <motion.div className="absolute top-0 left-0 h-full rounded-full bg-white/60" 
                style={{ width: `${(muted ? 0 : globalVolume) * 100}%` }} />
              <input type="range" min={0} max={1} step={0.01} value={muted ? 0 : globalVolume}
                onChange={(e) => { setGlobalVolume(Number(e.target.value)); setMuted(false); }}
                className="absolute inset-0 w-full opacity-0 cursor-pointer" />
            </div>
          </div>

          <motion.button whileTap={{ scale: 0.9 }} className="text-white/20 hover:text-white/50 transition-colors">
            <MoreHorizontal size={16} />
          </motion.button>
        </div>
      </motion.footer>
    </div>
  );
}
