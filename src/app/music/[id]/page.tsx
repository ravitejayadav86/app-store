"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Play, Pause, SkipBack, SkipForward,
  Download, Heart, Shuffle, Repeat, Volume2, VolumeX,
  Music2, List, Loader2, Share2,
} from "lucide-react";
import { Track } from "@/components/ui/MusicPlayer";

const SPRING = { type: "spring", stiffness: 480, damping: 36 } as const;

const ACCENT_COLORS = [
  "#e91e63", "#9c27b0", "#3f51b5", "#0058bb",
  "#00bcd4", "#009688", "#ff5722", "#ff9800",
];

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

  const [track, setTrack] = useState<Track | null>(null);
  const [queue, setQueue] = useState<Track[]>([]);
  const [queueIdx, setQueueIdx] = useState(0);

  // Audio state
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(0.8);
  const [muted, setMuted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [repeat, setRepeat] = useState<"off" | "one" | "all">("off");
  const [shuffleOn, setShuffleOn] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [showQueue, setShowQueue] = useState(false);
  const [audioRef] = useState<{ current: HTMLAudioElement | null }>({ current: null });

  // Load track from sessionStorage
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("pandas_song_page");
      if (raw) {
        const data = JSON.parse(raw);
        setTrack(data.track);
        setQueue(data.queue || [data.track]);
        setQueueIdx(data.queueIdx ?? 0);
      }
    } catch (e) {
      console.error("Failed to load track from session", e);
    }

    // Restore liked tracks
    try {
      const liked = JSON.parse(localStorage.getItem("pandas_liked_tracks") || "[]");
      const raw = sessionStorage.getItem("pandas_song_page");
      if (raw) {
        const data = JSON.parse(raw);
        setIsLiked(liked.includes(String(data.track?.id)));
      }
    } catch { }
  }, []);

  // Init audio
  useEffect(() => {
    const audio = new Audio();
    audio.volume = 0.8;
    audioRef.current = audio;
    return () => { audio.pause(); audio.src = ""; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load track audio
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !track?.audioUrl) return;
    setLoading(true);
    setProgress(0);
    setDuration(0);
    audio.src = track.audioUrl;
    audio.load();
    audio.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [track]);

  // Wire audio events
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onTime = () => setProgress(audio.currentTime);
    const onDur = () => { setDuration(audio.duration); setLoading(false); };
    const onWait = () => setLoading(true);
    const onPlay = () => { setLoading(false); setIsPlaying(true); };
    const onPause = () => setIsPlaying(false);
    const onEnded = () => {
      if (repeat === "one") { audio.currentTime = 0; audio.play(); return; }
      const next = queueIdx + 1;
      if (next < queue.length) {
        setQueueIdx(next);
        setTrack(queue[next]);
      } else if (repeat === "all") {
        setQueueIdx(0);
        setTrack(queue[0]);
      } else {
        setIsPlaying(false);
      }
    };
    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("durationchange", onDur);
    audio.addEventListener("loadedmetadata", onDur);
    audio.addEventListener("waiting", onWait);
    audio.addEventListener("playing", onPlay);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("ended", onEnded);
    return () => {
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("durationchange", onDur);
      audio.removeEventListener("loadedmetadata", onDur);
      audio.removeEventListener("waiting", onWait);
      audio.removeEventListener("playing", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("ended", onEnded);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [track, repeat, queueIdx, queue]);

  // Volume sync
  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = muted ? 0 : volume;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [volume, muted]);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) audio.pause();
    else audio.play().catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPlaying]);

  const skipNext = useCallback(() => {
    const nextIdx = shuffleOn
      ? Math.floor(Math.random() * queue.length)
      : queueIdx + 1;
    if (nextIdx < queue.length) {
      setQueueIdx(nextIdx);
      setTrack(queue[nextIdx]);
    }
  }, [queueIdx, queue, shuffleOn]);

  const skipPrev = useCallback(() => {
    const audio = audioRef.current;
    if (audio && audio.currentTime > 3) { audio.currentTime = 0; return; }
    const prevIdx = queueIdx - 1;
    if (prevIdx >= 0) {
      setQueueIdx(prevIdx);
      setTrack(queue[prevIdx]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queueIdx, queue]);

  const seek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const t = Number(e.target.value);
    if (audioRef.current) audioRef.current.currentTime = t;
    setProgress(t);
  };

  const toggleLike = () => {
    setIsLiked((prev) => {
      const next = !prev;
      try {
        const liked: string[] = JSON.parse(localStorage.getItem("pandas_liked_tracks") || "[]");
        const id = String(track?.id);
        if (next) { if (!liked.includes(id)) liked.push(id); }
        else { const i = liked.indexOf(id); if (i > -1) liked.splice(i, 1); }
        localStorage.setItem("pandas_liked_tracks", JSON.stringify(liked));
      } catch { }
      return next;
    });
  };

  const handleBack = () => {
    const audio = audioRef.current;
    if (audio) { audio.pause(); audio.src = ""; }
    router.back();
  };

  const pct = duration > 0 ? (progress / duration) * 100 : 0;
  const color = track?.color ?? ACCENT_COLORS[queueIdx % ACCENT_COLORS.length];

  if (!track) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4"
        style={{ background: "rgba(8,8,18,0.97)" }}>
        <Loader2 size={36} className="animate-spin text-white/30" />
        <p className="text-white/40 text-sm">Loading song…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden"
      style={{ background: "rgba(8,8,18,0.97)" }}>

      {/* Ambient glow */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        animate={{ opacity: [0.3, 0.55, 0.3] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        style={{ background: `radial-gradient(ellipse 80% 55% at 50% -10%, ${color}55, transparent 70%)` }}
      />
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-64 pointer-events-none"
        style={{ background: `linear-gradient(to top, ${color}18, transparent)` }}
      />

      {/* Top bar */}
      <div className="relative z-10 flex items-center justify-between px-5 pt-12 pb-3">
        <button onClick={handleBack}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-white/8 text-white/60 hover:text-white hover:bg-white/15 transition-all active:scale-90">
          <ArrowLeft size={20} />
        </button>
        <div className="text-center">
          <p className="text-[10px] font-black uppercase tracking-widest text-white/30">Now Playing</p>
        </div>
        <button onClick={() => setShowQueue(q => !q)}
          className={`w-10 h-10 flex items-center justify-center rounded-full transition-all ${showQueue ? "bg-white/20 text-white" : "bg-white/8 text-white/40 hover:text-white hover:bg-white/15"}`}>
          <List size={18} />
        </button>
      </div>

      {/* Main body */}
      <div className="relative z-10 flex-1 flex flex-col px-6 pb-10 overflow-y-auto">
        <AnimatePresence mode="wait">
          {showQueue ? (
            /* ── Queue panel ── */
            <motion.div key="queue"
              initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 40 }} className="flex-1 pt-2">
              <h3 className="text-white font-black text-sm uppercase tracking-widest mb-4">
                Queue · {queue.length} songs
              </h3>
              <div className="flex flex-col gap-1 pb-8">
                {queue.map((t, i) => (
                  <button key={`${t.id}-${i}`}
                    onClick={() => { setQueueIdx(i); setTrack(t); setShowQueue(false); }}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all ${i === queueIdx ? "bg-white/15" : "hover:bg-white/5"}`}>
                    <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0 bg-white/10 flex items-center justify-center">
                      {t.coverUrl
                        ? <img src={t.coverUrl} alt={t.title} className="w-full h-full object-cover" />
                        : <Music2 size={18} className="text-white/30" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs font-bold truncate ${i === queueIdx ? "text-white" : "text-white/70"}`}>{t.title}</p>
                      <p className="text-[10px] text-white/30 truncate">{t.artist}</p>
                    </div>
                    {i === queueIdx && <EqualizerBars color={color} playing={isPlaying} />}
                  </button>
                ))}
              </div>
            </motion.div>
          ) : (
            /* ── Player view ── */
            <motion.div key="player"
              initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex flex-col items-center gap-6 pt-4 pb-4 flex-1">

              {/* Album art */}
              <motion.div
                key={String(track.id)}
                initial={{ scale: 0.82, opacity: 0 }}
                animate={{ scale: isPlaying ? 1 : 0.88, opacity: 1 }}
                transition={SPRING}
                className="w-64 h-64 md:w-80 md:h-80 rounded-3xl overflow-hidden shadow-2xl flex-shrink-0"
                style={{ boxShadow: `0 48px 96px -24px ${color}77` }}>
                {track.coverUrl ? (
                  <img src={track.coverUrl} alt={track.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center"
                    style={{ background: `linear-gradient(135deg, ${color}44, ${color}99)` }}>
                    <Music2 size={80} className="text-white/30" />
                  </div>
                )}
              </motion.div>

              {/* Track info + like */}
              <AnimatePresence mode="wait">
                <motion.div key={String(track.id) + "-info"}
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="w-full flex items-center justify-between">
                  <div className="min-w-0">
                    <p className="text-xl font-black text-white truncate">{track.title}</p>
                    <p className="text-sm text-white/50 font-medium mt-0.5 truncate">{track.artist}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                    <button onClick={toggleLike}
                      className="p-2 rounded-full transition-all hover:scale-110 active:scale-90">
                      <Heart size={22}
                        fill={isLiked ? "#ef4444" : "none"}
                        className={isLiked ? "text-red-500" : "text-white/30"} />
                    </button>
                    <button onClick={() => {
                      if (navigator.share) {
                        navigator.share({ title: track.title, text: `Listen to ${track.title} by ${track.artist}`, url: window.location.href }).catch(() => {});
                      }
                    }} className="p-2 rounded-full text-white/30 hover:text-white/70 transition-all">
                      <Share2 size={18} />
                    </button>
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Seek bar */}
              <div className="w-full">
                <div className="relative h-1.5 rounded-full bg-white/10 mb-2 cursor-pointer">
                  <div className="absolute top-0 left-0 h-full rounded-full transition-all"
                    style={{ width: `${pct}%`, background: color }} />
                  <div className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full shadow-lg border-2 border-white transition-all"
                    style={{ left: `calc(${pct}% - 8px)`, background: color }} />
                  <input type="range" min={0} max={duration || 100} step={0.1} value={progress}
                    onChange={seek} aria-label="Seek"
                    className="absolute inset-0 w-full opacity-0 cursor-pointer h-full" />
                </div>
                <div className="flex justify-between text-[10px] text-white/30 font-mono">
                  <span>{fmt(progress)}</span>
                  <span>{fmt(duration)}</span>
                </div>
              </div>

              {/* Transport controls */}
              <div className="flex items-center gap-5 w-full justify-center">
                <button onClick={() => setShuffleOn(s => !s)} aria-label="Shuffle"
                  className="p-2 rounded-full transition-all"
                  style={shuffleOn ? { color } : { color: "rgba(255,255,255,0.25)" }}>
                  <Shuffle size={20} />
                </button>

                <button onClick={skipPrev} aria-label="Previous"
                  className="p-3 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-all active:scale-90">
                  <SkipBack size={28} fill="currentColor" />
                </button>

                <button onClick={togglePlay} aria-label={isPlaying ? "Pause" : "Play"}
                  className="w-18 h-18 rounded-full flex items-center justify-center text-white transition-all hover:scale-105 active:scale-95"
                  style={{ background: color, boxShadow: `0 16px 48px -12px ${color}`, width: 72, height: 72 }}>
                  {loading ? (
                    <svg className="animate-spin" width="28" height="28" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="3" />
                      <path d="M12 2a10 10 0 0 1 10 10" stroke="white" strokeWidth="3" strokeLinecap="round" />
                    </svg>
                  ) : isPlaying ? (
                    <Pause size={30} fill="white" />
                  ) : (
                    <Play size={30} fill="white" className="ml-1" />
                  )}
                </button>

                <button onClick={skipNext} aria-label="Next"
                  className="p-3 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-all active:scale-90">
                  <SkipForward size={28} fill="currentColor" />
                </button>

                <button onClick={() => setRepeat(r => r === "off" ? "all" : r === "all" ? "one" : "off")}
                  aria-label={`Repeat: ${repeat}`}
                  className="p-2 rounded-full transition-all relative"
                  style={repeat !== "off" ? { color } : { color: "rgba(255,255,255,0.25)" }}>
                  <Repeat size={20} />
                  {repeat === "one" && (
                    <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-[7px] font-black" style={{ color }}>1</span>
                  )}
                </button>
              </div>

              {/* Volume + download */}
              <div className="flex items-center gap-4 w-full">
                <button onClick={() => setMuted(m => !m)} aria-label={muted ? "Unmute" : "Mute"}
                  className="text-white/40 hover:text-white/80 transition-colors flex-shrink-0">
                  {muted || volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
                </button>
                <div className="relative flex-1 h-1 rounded-full bg-white/10 cursor-pointer">
                  <div className="h-full rounded-full" style={{ width: `${(muted ? 0 : volume) * 100}%`, background: color }} />
                  <input type="range" min={0} max={1} step={0.01} value={muted ? 0 : volume}
                    onChange={(e) => { setVolumeState(Number(e.target.value)); setMuted(false); }}
                    aria-label="Volume" className="absolute inset-0 w-full opacity-0 cursor-pointer h-full" />
                </div>
                {track.downloadUrl && (
                  <a href={track.downloadUrl} download target="_blank" rel="noopener noreferrer"
                    aria-label="Download" className="text-white/40 hover:text-white/80 transition-colors flex-shrink-0">
                    <Download size={18} />
                  </a>
                )}
              </div>

              {/* Up next */}
              {queue[queueIdx + 1] && (
                <div className="w-full rounded-2xl p-3 mt-1"
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
                  <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-2">Up Next</p>
                  <button onClick={skipNext}
                    className="flex items-center gap-3 w-full text-left hover:opacity-80 transition-opacity">
                    <div className="w-9 h-9 rounded-lg overflow-hidden flex-shrink-0 bg-white/10 flex items-center justify-center">
                      {queue[queueIdx + 1].coverUrl
                        ? <img src={queue[queueIdx + 1].coverUrl} alt={queue[queueIdx + 1].title} className="w-full h-full object-cover" />
                        : <Music2 size={16} className="text-white/30" />}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-white/80 truncate">{queue[queueIdx + 1].title}</p>
                      <p className="text-[10px] text-white/40 truncate">{queue[queueIdx + 1].artist}</p>
                    </div>
                    <SkipForward size={16} className="text-white/20 flex-shrink-0 ml-auto" />
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
