"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play, Pause, SkipBack, SkipForward, Volume2, VolumeX,
  Download, ChevronDown, Music2, Repeat, Shuffle, Heart,
} from "lucide-react";

export interface Track {
  id: number | string;
  title: string;
  artist: string;
  duration?: number; // seconds
  audioUrl: string;
  coverUrl?: string;
  downloadUrl?: string;
  color?: string;
}

interface MusicPlayerProps {
  queue: Track[];
  initialIndex?: number;
  onClose?: () => void;
}

const SPRING = { type: "spring", stiffness: 500, damping: 38, mass: 0.5 } as const;
const COLORS = [
  "#e91e63","#9c27b0","#3f51b5","#0058bb",
  "#00bcd4","#009688","#ff5722","#ff9800",
];

function fmt(s: number) {
  if (!isFinite(s)) return "0:00";
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

export const MusicPlayer: React.FC<MusicPlayerProps> = ({ queue, initialIndex = 0, onClose }) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [idx, setIdx]         = useState(initialIndex);
  const [playing, setPlaying] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume]   = useState(0.8);
  const [muted, setMuted]     = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat]   = useState(false);
  const [liked, setLiked]     = useState<Set<number | string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const track = queue[idx];

  /* ── Keyboard shortcuts ────────────────────────────────────── */
  useEffect(() => {
    const handleKeys = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;
      switch (e.code) {
        case "Space":      e.preventDefault(); togglePlay(); break;
        case "ArrowRight": nextTrack(); break;
        case "ArrowLeft":  prevTrack(); break;
      }
    };
    window.addEventListener("keydown", handleKeys);
    return () => window.removeEventListener("keydown", handleKeys);
  }, [togglePlay, nextTrack, prevTrack]);

  /* ── Sync with prop changes ─────────────────────────────────── */
  useEffect(() => {
    setIdx(initialIndex);
  }, [initialIndex]);

  /* ── Persistence ────────────────────────────────────────────── */
  useEffect(() => {
    const saved = localStorage.getItem("pandas_liked_tracks");
    if (saved) {
      try { setLiked(new Set(JSON.parse(saved))); } catch (e) { console.error(e); }
    }
  }, []);

  useEffect(() => {
    if (liked.size > 0 || localStorage.getItem("pandas_liked_tracks")) {
      localStorage.setItem("pandas_liked_tracks", JSON.stringify(Array.from(liked)));
    }
  }, [liked]);

  /* ── audio wiring ────────────────────────────────────────────── */
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !track) return;
    audio.src = track.audioUrl;
    audio.volume = volume;
    audio.muted  = muted;
    setLoading(true);
    setCurrent(0);
    audio.load();
    audio.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx, track?.audioUrl]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onTime  = () => setCurrent(audio.currentTime);
    const onMeta  = () => { setDuration(audio.duration); setLoading(false); };
    const onEnded = () => { repeat ? audio.play() : nextTrack(); };
    const onWait  = () => setLoading(true);
    const onPlay2 = () => setLoading(false);
    audio.addEventListener("timeupdate",     onTime);
    audio.addEventListener("loadedmetadata", onMeta);
    audio.addEventListener("ended",          onEnded);
    audio.addEventListener("waiting",        onWait);
    audio.addEventListener("canplay",        onPlay2);
    return () => {
      audio.removeEventListener("timeupdate",     onTime);
      audio.removeEventListener("loadedmetadata", onMeta);
      audio.removeEventListener("ended",          onEnded);
      audio.removeEventListener("waiting",        onWait);
      audio.removeEventListener("canplay",        onPlay2);
    };
  }, [repeat, nextTrack]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
  }, [volume]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.muted = muted;
  }, [muted]);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) { audio.pause(); setPlaying(false); }
    else { audio.play(); setPlaying(true); }
  }, [playing]);

  const nextTrack = useCallback(() => {
    if (shuffle) setIdx(Math.floor(Math.random() * queue.length));
    else setIdx(i => (i + 1) % queue.length);
  }, [queue.length, shuffle]);

  const prevTrack = useCallback(() => {
    const audio = audioRef.current;
    if (audio && current > 3) { audio.currentTime = 0; return; }
    setIdx(i => (i - 1 + queue.length) % queue.length);
  }, [queue.length, current]);

  const seek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    if (audioRef.current) audioRef.current.currentTime = val;
    setCurrent(val);
  };

  const handleDownload = async () => {
    if (downloading) return;
    setDownloading(true);
    try {
      const url = track.downloadUrl || track.audioUrl;
      const a = document.createElement("a");
      a.href = url;
      a.download = `${track.title} - ${track.artist}.mp3`;
      a.target = "_blank";
      a.click();
      // Reset after a short delay
      setTimeout(() => setDownloading(false), 2000);
    } catch {
      setDownloading(false);
    }
  };

  const accent = track?.color || COLORS[Number(track?.id ?? 0) % COLORS.length];
  const pct    = duration > 0 ? (current / duration) * 100 : 0;

  if (!track) return null;

  return (
    <>
      <audio ref={audioRef} preload="auto" crossOrigin="anonymous" />

      {/* ── Expanded full-screen view (mobile) ─────────────────── */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={SPRING}
            className="fixed inset-0 z-[300] flex flex-col"
            style={{
              background: `linear-gradient(160deg, ${accent}22 0%, #0a0a0f 55%, #0a0a0f 100%)`,
              willChange: "transform",
            }}
          >
            {/* top bar */}
            <div className="flex items-center justify-between px-6 pt-14 pb-4">
              <button onClick={() => setExpanded(false)}
                className="p-2 rounded-full text-white/60 hover:text-white hover:bg-white/10 transition-colors">
                <ChevronDown size={24} />
              </button>
              <p className="text-xs font-bold uppercase tracking-widest text-white/50">Now Playing</p>
              <div className="w-10" />
            </div>

            {/* album art */}
            <div className="flex-1 flex items-center justify-center px-10">
              <motion.div
                animate={{ scale: playing ? 1 : 0.88, rotate: playing ? 360 : 0 }}
                transition={{ scale: { duration: 0.4 }, rotate: { duration: 20, repeat: Infinity, ease: "linear" } }}
                className="w-64 h-64 md:w-72 md:h-72 rounded-full shadow-2xl overflow-hidden border-4 border-white/10 flex items-center justify-center"
                style={{ background: `radial-gradient(circle at 35% 35%, ${accent}cc, ${accent}44)` }}
              >
                {track.coverUrl
                  ? <img src={track.coverUrl} alt={track.title} className="w-full h-full object-cover" />
                  : <Music2 size={80} className="text-white/60" />
                }
              </motion.div>
            </div>

            {/* info + like */}
            <div className="px-8 pb-4 flex items-start justify-between">
              <div className="flex-1 min-w-0 mr-4">
                <h2 className="text-2xl font-black text-white truncate">{track.title}</h2>
                <p className="text-white/55 font-medium truncate">{track.artist}</p>
              </div>
              <button onClick={() => setLiked(s => { const n = new Set(s); n.has(track.id) ? n.delete(track.id) : n.add(track.id); return n; })}
                className="p-2 rounded-full transition-colors">
                <Heart size={24} fill={liked.has(track.id) ? "#e91e63" : "none"}
                  className={liked.has(track.id) ? "text-pink-500" : "text-white/40"} />
              </button>
            </div>

            {/* seek bar */}
            <div className="px-8 pb-2">
              <div className="relative h-1.5 rounded-full bg-white/15 mb-1">
                <div className="absolute left-0 top-0 h-full rounded-full transition-all"
                  style={{ width: `${pct}%`, background: accent }} />
                <input type="range" min={0} max={duration || 1} step={0.1} value={current}
                  onChange={seek}
                  className="absolute inset-0 w-full opacity-0 cursor-pointer h-full" />
              </div>
              <div className="flex justify-between text-xs text-white/40 font-mono">
                <span>{fmt(current)}</span><span>{fmt(duration)}</span>
              </div>
            </div>

            {/* controls */}
            <div className="px-8 pb-6 flex items-center justify-between">
              <button onClick={() => setShuffle(s => !s)}
                className={`p-2 rounded-full transition-colors ${shuffle ? "text-white" : "text-white/30"}`}>
                <Shuffle size={20} />
              </button>
              <button onClick={prevTrack} className="p-3 rounded-full text-white hover:bg-white/10 transition-colors">
                <SkipBack size={28} fill="white" />
              </button>
              <button onClick={togglePlay}
                className="w-16 h-16 rounded-full flex items-center justify-center shadow-xl transition-transform active:scale-95"
                style={{ background: accent }}>
                {loading
                  ? <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  : playing ? <Pause size={28} fill="white" className="text-white" />
                            : <Play  size={28} fill="white" className="text-white ml-1" />}
              </button>
              <button onClick={nextTrack} className="p-3 rounded-full text-white hover:bg-white/10 transition-colors">
                <SkipForward size={28} fill="white" />
              </button>
              <button onClick={() => setRepeat(r => !r)}
                className={`p-2 rounded-full transition-colors ${repeat ? "text-white" : "text-white/30"}`}>
                <Repeat size={20} />
              </button>
            </div>

            {/* volume + download */}
            <div className="px-8 pb-8 flex items-center gap-4">
              <button onClick={() => setMuted(m => !m)} className="text-white/40 hover:text-white transition-colors">
                {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
              </button>
              <input type="range" min={0} max={1} step={0.01} value={muted ? 0 : volume}
                onChange={e => { setVolume(Number(e.target.value)); setMuted(false); }}
                className="flex-1 h-1 accent-white cursor-pointer" />
              <button onClick={handleDownload}
                className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold text-white bg-white/10 hover:bg-white/20 transition-colors disabled:opacity-50"
                disabled={downloading}>
                {downloading ? <div className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin" /> : <Download size={14} />}
                {downloading ? "Saving..." : "Download"}
              </button>
            </div>

            {/* Up Next / Queue */}
            <div className="flex-1 px-8 overflow-y-auto no-scrollbar pb-10">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-bold uppercase tracking-widest text-white/30">Up Next</h3>
                <span className="text-[10px] text-white/20 font-mono">{queue.length - idx - 1} tracks left</span>
              </div>
              <div className="flex flex-col gap-2">
                {queue.slice(idx + 1, idx + 6).map((t, i) => (
                  <button key={t.id} onClick={() => setIdx(idx + i + 1)}
                    className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition-colors text-left group">
                    <div className="w-10 h-10 rounded-lg overflow-hidden bg-white/10 flex-shrink-0">
                      {t.coverUrl ? <img src={t.coverUrl} alt={t.title} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" /> : <Music2 size={16} className="m-auto text-white/20" />}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-white/60 group-hover:text-white transition-colors truncate">{t.title}</p>
                      <p className="text-xs text-white/30 truncate">{t.artist}</p>
                    </div>
                  </button>
                ))}
                {queue.length <= idx + 1 && (
                  <p className="text-xs text-white/20 italic py-4">End of queue</p>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Mini bar (always visible at bottom) ───────────────────── */}
      {!expanded && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={SPRING}
          className="fixed bottom-[72px] md:bottom-4 left-2 right-2 md:left-auto md:right-4 md:w-[380px] z-[150]"
          style={{ willChange: "transform" }}
        >
          <div className="rounded-2xl overflow-hidden shadow-2xl border border-white/20"
            style={{ background: `linear-gradient(120deg, ${accent}dd, ${accent}99)`, backdropFilter: "blur(20px)" }}>
            {/* progress strip */}
            <div className="h-0.5 bg-white/20">
              <div className="h-full bg-white/80 transition-all" style={{ width: `${pct}%` }} />
            </div>
            <div className="flex items-center gap-3 px-4 py-3">
              {/* thumb */}
              <button onClick={() => setExpanded(true)} className="flex-1 flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden bg-white/20">
                  {track.coverUrl
                    ? <img src={track.coverUrl} alt={track.title} className="w-full h-full object-cover" />
                    : <Music2 size={18} className="text-white" />}
                </div>
                <div className="min-w-0 text-left">
                  <p className="text-sm font-bold text-white truncate">{track.title}</p>
                  <p className="text-xs text-white/60 truncate">{track.artist}</p>
                </div>
              </button>
              {/* controls */}
              <button onClick={prevTrack} className="p-1.5 text-white/70 hover:text-white">
                <SkipBack size={18} />
              </button>
              <button onClick={togglePlay}
                className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors">
                {loading
                  ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  : playing ? <Pause size={16} className="text-white" fill="white" />
                            : <Play  size={16} className="text-white ml-0.5" fill="white" />}
              </button>
              <button onClick={nextTrack} className="p-1.5 text-white/70 hover:text-white">
                <SkipForward size={18} />
              </button>
              <button onClick={handleDownload} className="p-1.5 text-white/70 hover:text-white disabled:opacity-50" disabled={downloading}>
                {downloading ? <div className="w-4 h-4 border border-white/30 border-t-white rounded-full animate-spin" /> : <Download size={16} />}
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </>
  );
};
