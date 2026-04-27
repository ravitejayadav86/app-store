"use client";

import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Download,
  X,
  Music2,
  Repeat,
  Shuffle,
  ChevronDown,
  List,
} from "lucide-react";

/* ─────────────────────────────────────────────────────────────
   Track interface — re-exported so pages can import from here
───────────────────────────────────────────────────────────── */
export interface Track {
  id: number | string;
  title: string;
  artist: string;
  audioUrl: string;
  coverUrl?: string;
  downloadUrl?: string;
  duration?: number;
  color?: string;
}

interface Props {
  queue: Track[];
  initialIndex?: number;
  onClose: () => void;
}

const ACCENT = "var(--primary, #0058bb)";
const SPRING = { type: "spring", stiffness: 480, damping: 36 } as const;

function fmt(s: number) {
  if (!isFinite(s)) return "0:00";
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

/* ─────────────────────────────────────────────────────────────
   Animated equalizer bars
───────────────────────────────────────────────────────────── */
function EqualizerBars({ color, playing }: { color: string; playing: boolean }) {
  return (
    <div className="flex items-end gap-0.5 h-4">
      {[1, 2, 3].map((b) => (
        <motion.div
          key={b}
          className="w-1 rounded-full"
          style={{ background: color }}
          animate={playing ? { height: ["4px", "14px", "6px", "12px", "4px"] } : { height: "4px" }}
          transition={{ duration: 0.7 + b * 0.2, repeat: Infinity, ease: "easeInOut", delay: b * 0.12 }}
        />
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   Helpers
───────────────────────────────────────────────────────────── */
function getNextIdx(
  current: number,
  total: number,
  shuffle: boolean,
  shuffledOrder: number[],
  repeat: "off" | "one" | "all"
): number | null {
  if (total === 0) return null;
  if (shuffle && shuffledOrder.length > 0) {
    const pos = shuffledOrder.indexOf(current);
    const next = pos + 1;
    if (next < shuffledOrder.length) return shuffledOrder[next];
    if (repeat === "all") return shuffledOrder[0];
    return null;
  }
  const next = current + 1;
  if (next < total) return next;
  if (repeat === "all") return 0;
  return null;
}

function getPrevIdx(
  current: number,
  total: number,
  shuffle: boolean,
  shuffledOrder: number[]
): number | null {
  if (total === 0) return null;
  if (shuffle && shuffledOrder.length > 0) {
    const pos = shuffledOrder.indexOf(current);
    const prev = pos - 1;
    if (prev >= 0) return shuffledOrder[prev];
    return null;
  }
  const prev = current - 1;
  return prev >= 0 ? prev : null;
}

/* ─────────────────────────────────────────────────────────────
   MusicPlayer
───────────────────────────────────────────────────────────── */
export function MusicPlayer({ queue, initialIndex = 0, onClose }: Props) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [idx, setIdx] = useState(initialIndex);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(0.8);
  const [muted, setMuted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [repeat, setRepeat] = useState<"off" | "one" | "all">("off");
  const [shuffleOn, setShuffleOn] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [showQueue, setShowQueue] = useState(false);
  const [shuffledOrder, setShuffledOrder] = useState<number[]>([]);

  const track = queue[idx];
  const color = track?.color ?? ACCENT;
  const pct = duration > 0 ? (progress / duration) * 100 : 0;

  /* ── Build shuffle order ─────────────────────────────────── */
  const buildShuffle = useCallback(() => {
    const order = queue.map((_, i) => i).filter((i) => i !== idx);
    for (let i = order.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [order[i], order[j]] = [order[j], order[i]];
    }
    setShuffledOrder([idx, ...order]);
  }, [queue, idx]);

  /* ── Init audio element once ─────────────────────────────── */
  useEffect(() => {
    const audio = new Audio();
    audio.volume = 0.8;
    // Removed crossOrigin to prevent CORS playback blocks on external URLs
    audioRef.current = audio;
    return () => {
      audio.pause();
      audio.src = "";
    };
  }, []);

  /* ── Load track on idx change ────────────────────────────── */
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !track?.audioUrl) return;
    setLoading(true);
    setProgress(0);
    setDuration(0);
    audio.src = track.audioUrl;
    audio.load();
    audio.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
  }, [idx]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── Wire audio events ───────────────────────────────────── */
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
      const nextIdx = getNextIdx(idx, queue.length, shuffleOn, shuffledOrder, repeat);
      if (nextIdx !== null) setIdx(nextIdx);
      else setIsPlaying(false);
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
  }, [idx, repeat, shuffleOn, shuffledOrder, queue.length]);

  /* ── Volume / mute sync ──────────────────────────────────── */
  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = muted ? 0 : volume;
  }, [volume, muted]);

  /* ── Rebuild shuffle when toggled ────────────────────────── */
  useEffect(() => { if (shuffleOn) buildShuffle(); }, [shuffleOn, buildShuffle]);

  /* ── Controls ────────────────────────────────────────────── */
  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) audio.pause();
    else audio.play().catch(() => {});
  }, [isPlaying]);

  const skipNext = useCallback(() => {
    const next = getNextIdx(idx, queue.length, shuffleOn, shuffledOrder, "all");
    if (next !== null) setIdx(next);
  }, [idx, queue.length, shuffleOn, shuffledOrder]);

  const skipPrev = useCallback(() => {
    const audio = audioRef.current;
    if (audio && audio.currentTime > 3) { audio.currentTime = 0; return; }
    const prev = getPrevIdx(idx, queue.length, shuffleOn, shuffledOrder);
    if (prev !== null) setIdx(prev);
  }, [idx, queue.length, shuffleOn, shuffledOrder]);

  const seek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const t = Number(e.target.value);
    if (audioRef.current) audioRef.current.currentTime = t;
    setProgress(t);
  };

  const cycleRepeat = () =>
    setRepeat((r) => (r === "off" ? "all" : r === "all" ? "one" : "off"));

  /* ─────────────────────────────────────────────────────────── */
  return (
    <AnimatePresence mode="wait">
      {expanded ? (
        /* ══════════════ FULL-SCREEN EXPANDED VIEW ══════════════ */
        <motion.div
          key="full"
          initial={{ y: "100%", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: "100%", opacity: 0 }}
          transition={SPRING}
          className="fixed inset-0 z-[60] flex flex-col"
          style={{
            background: "rgba(8,8,18,0.97)",
            backdropFilter: "blur(40px)",
            WebkitBackdropFilter: "blur(40px)",
          }}
        >
          {/* Ambient colour glow behind album art */}
          <motion.div
            className="absolute inset-0 pointer-events-none"
            animate={{ opacity: [0.25, 0.5, 0.25] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            style={{
              background: `radial-gradient(ellipse 70% 50% at 50% 0%, ${color}55, transparent)`,
            }}
          />

          {/* Top bar */}
          <div className="relative z-10 flex items-center justify-between px-5 pt-12 pb-4">
            <button
              onClick={() => setExpanded(false)}
              aria-label="Collapse player"
              className="p-2 rounded-full bg-white/5 text-white/60 hover:text-white hover:bg-white/10 transition-all"
            >
              <ChevronDown size={20} />
            </button>
            <p className="text-xs font-bold uppercase tracking-widest text-white/40">
              Now Playing
            </p>
            <button
              onClick={() => setShowQueue((q) => !q)}
              aria-label="Toggle queue"
              className={`p-2 rounded-full transition-all ${
                showQueue
                  ? "bg-white/20 text-white"
                  : "bg-white/5 text-white/40 hover:text-white hover:bg-white/10"
              }`}
            >
              <List size={18} />
            </button>
          </div>

          {/* Body */}
          <div className="relative z-10 flex-1 overflow-y-auto px-6 flex flex-col">
            <AnimatePresence mode="wait">
              {showQueue ? (
                /* ── Queue list ── */
                <motion.div
                  key="queue-view"
                  initial={{ opacity: 0, x: 40 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 40 }}
                  className="flex-1"
                >
                  <h3 className="text-white font-bold mb-4 text-sm uppercase tracking-widest">
                    Queue
                  </h3>
                  <div className="flex flex-col gap-1 pb-8">
                    {queue.map((t, i) => (
                      <button
                        key={`${t.id}-${i}`}
                        onClick={() => { setIdx(i); setShowQueue(false); }}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all ${
                          i === idx ? "bg-white/15" : "hover:bg-white/5"
                        }`}
                      >
                        <div className="w-9 h-9 rounded-lg overflow-hidden flex-shrink-0 bg-white/10 flex items-center justify-center">
                          {t.coverUrl
                            ? <img src={t.coverUrl} alt={t.title} className="w-full h-full object-cover" />
                            : <Music2 size={16} className="text-white/30" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-xs font-bold truncate ${i === idx ? "text-white" : "text-white/70"}`}>
                            {t.title}
                          </p>
                          <p className="text-[10px] text-white/30 truncate">{t.artist}</p>
                        </div>
                        {i === idx && <EqualizerBars color={color} playing={isPlaying} />}
                      </button>
                    ))}
                  </div>
                </motion.div>
              ) : (
                /* ── Player view ── */
                <motion.div
                  key="player-view"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="flex flex-col items-center gap-6 pt-2 pb-8"
                >
                  {/* Album art */}
                  <motion.div
                    key={String(track?.id)}
                    initial={{ scale: 0.85, opacity: 0 }}
                    animate={{ scale: isPlaying ? 1 : 0.88, opacity: 1 }}
                    transition={SPRING}
                    className="w-64 h-64 md:w-80 md:h-80 rounded-3xl overflow-hidden shadow-2xl flex-shrink-0"
                    style={{ boxShadow: `0 40px 80px -20px ${color}66` }}
                  >
                    {track?.coverUrl ? (
                      <img
                        src={track.coverUrl}
                        alt={track.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div
                        className="w-full h-full flex items-center justify-center"
                        style={{ background: `linear-gradient(135deg, ${color}44, ${color}88)` }}
                      >
                        <Music2 size={72} className="text-white/30" />
                      </div>
                    )}
                  </motion.div>

                  {/* Track info */}
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={String(track?.id) + "-info"}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="text-center w-full"
                    >
                      <p className="text-xl font-black text-white truncate px-4">
                        {track?.title}
                      </p>
                      <p className="text-sm text-white/50 font-medium mt-1">
                        {track?.artist}
                      </p>
                    </motion.div>
                  </AnimatePresence>

                  {/* Seek bar */}
                  <div className="w-full">
                    <div className="relative h-1 rounded-full bg-white/10 mb-1.5 cursor-pointer">
                      <div
                        className="absolute top-0 left-0 h-full rounded-full"
                        style={{ width: `${pct}%`, background: color }}
                      />
                      <div
                        className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full shadow-lg border-2 border-white"
                        style={{ left: `calc(${pct}% - 7px)`, background: color }}
                      />
                      <input
                        type="range"
                        min={0}
                        max={duration || 100}
                        step={0.1}
                        value={progress}
                        onChange={seek}
                        aria-label="Seek"
                        className="absolute inset-0 w-full opacity-0 cursor-pointer h-full"
                      />
                    </div>
                    <div className="flex justify-between text-[10px] text-white/30 font-mono">
                      <span>{fmt(progress)}</span>
                      <span>{fmt(duration)}</span>
                    </div>
                  </div>

                  {/* Main transport controls */}
                  <div className="flex items-center gap-6">
                    {/* Shuffle */}
                    <button
                      onClick={() => setShuffleOn((s) => !s)}
                      aria-label="Shuffle"
                      className="p-2 rounded-full transition-all"
                      style={shuffleOn ? { color } : { color: "rgba(255,255,255,0.25)" }}
                    >
                      <Shuffle size={20} />
                    </button>

                    {/* Prev */}
                    <button
                      onClick={skipPrev}
                      aria-label="Previous track"
                      className="p-3 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-all active:scale-90"
                    >
                      <SkipBack size={26} fill="currentColor" />
                    </button>

                    {/* Play / Pause */}
                    <button
                      onClick={togglePlay}
                      aria-label={isPlaying ? "Pause" : "Play"}
                      className="w-16 h-16 rounded-full flex items-center justify-center text-white transition-all hover:scale-105 active:scale-95"
                      style={{ background: color, boxShadow: `0 12px 36px -8px ${color}` }}
                    >
                      {loading ? (
                        <svg className="animate-spin" width="26" height="26" viewBox="0 0 24 24" fill="none">
                          <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="3" />
                          <path d="M12 2a10 10 0 0 1 10 10" stroke="white" strokeWidth="3" strokeLinecap="round" />
                        </svg>
                      ) : isPlaying ? (
                        <Pause size={26} fill="white" />
                      ) : (
                        <Play size={26} fill="white" className="ml-1" />
                      )}
                    </button>

                    {/* Next */}
                    <button
                      onClick={skipNext}
                      aria-label="Next track"
                      className="p-3 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-all active:scale-90"
                    >
                      <SkipForward size={26} fill="currentColor" />
                    </button>

                    {/* Repeat */}
                    <button
                      onClick={cycleRepeat}
                      aria-label={`Repeat mode: ${repeat}`}
                      className="p-2 rounded-full transition-all relative"
                      style={repeat !== "off" ? { color } : { color: "rgba(255,255,255,0.25)" }}
                    >
                      <Repeat size={20} />
                      {repeat === "one" && (
                        <span
                          className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 text-[7px] font-black"
                          style={{ color }}
                        >
                          1
                        </span>
                      )}
                    </button>
                  </div>

                  {/* Volume + download */}
                  <div className="flex items-center gap-4 w-full">
                    <button
                      onClick={() => setMuted((m) => !m)}
                      aria-label={muted ? "Unmute" : "Mute"}
                      className="text-white/40 hover:text-white/80 transition-colors flex-shrink-0"
                    >
                      {muted || volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
                    </button>

                    <div className="relative flex-1 h-1 rounded-full bg-white/10 cursor-pointer">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${(muted ? 0 : volume) * 100}%`, background: color }}
                      />
                      <input
                        type="range"
                        min={0}
                        max={1}
                        step={0.01}
                        value={muted ? 0 : volume}
                        onChange={(e) => {
                          setVolumeState(Number(e.target.value));
                          setMuted(false);
                        }}
                        aria-label="Volume"
                        className="absolute inset-0 w-full opacity-0 cursor-pointer h-full"
                      />
                    </div>

                    {track?.downloadUrl && (
                      <a
                        href={track.downloadUrl}
                        download
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Download track"
                        className="text-white/40 hover:text-white/80 transition-colors flex-shrink-0"
                      >
                        <Download size={18} />
                      </a>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      ) : (
        /* ══════════════ MINI BAR (bottom of screen) ══════════════ */
        <motion.div
          key="mini"
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={SPRING}
          className="fixed bottom-[68px] md:bottom-5 left-0 right-0 z-50 px-3 md:px-8"
        >
          <div
            className="max-w-2xl mx-auto rounded-2xl overflow-hidden shadow-2xl border border-white/10"
            style={{
              background: "rgba(10,10,20,0.88)",
              backdropFilter: "blur(24px)",
              WebkitBackdropFilter: "blur(24px)",
            }}
          >
            {/* Thin progress strip at very top */}
            <div className="w-full h-0.5 bg-white/10">
              <div
                className="h-full transition-all duration-300"
                style={{ width: `${pct}%`, background: color }}
              />
            </div>

            <div className="flex items-center gap-3 px-3 py-2.5">
              {/* Cover — click to expand */}
              <button
                onClick={() => setExpanded(true)}
                aria-label="Expand player"
                className="flex-shrink-0"
              >
                <div className="w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center bg-white/5">
                  {track?.coverUrl ? (
                    <img src={track.coverUrl} alt={track.title} className="w-full h-full object-cover" />
                  ) : (
                    <Music2 size={18} className="text-white/40" />
                  )}
                </div>
              </button>

              {/* Track info — click to expand */}
              <button
                onClick={() => setExpanded(true)}
                className="flex-1 min-w-0 text-left"
              >
                <p className="text-xs font-bold text-white truncate">{track?.title}</p>
                <p className="text-[10px] text-white/50 truncate">{track?.artist}</p>
              </button>

              {/* Transport controls */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={skipPrev}
                  aria-label="Previous track"
                  className="p-2 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-all"
                >
                  <SkipBack size={16} fill="currentColor" />
                </button>

                <button
                  onClick={togglePlay}
                  aria-label={isPlaying ? "Pause" : "Play"}
                  className="w-9 h-9 rounded-full flex items-center justify-center text-white transition-all hover:scale-110 active:scale-95"
                  style={{ background: color }}
                >
                  {loading ? (
                    <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="3" />
                      <path d="M12 2a10 10 0 0 1 10 10" stroke="white" strokeWidth="3" strokeLinecap="round" />
                    </svg>
                  ) : isPlaying ? (
                    <Pause size={16} fill="white" />
                  ) : (
                    <Play size={16} fill="white" className="ml-0.5" />
                  )}
                </button>

                <button
                  onClick={skipNext}
                  aria-label="Next track"
                  className="p-2 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-all"
                >
                  <SkipForward size={16} fill="currentColor" />
                </button>
              </div>

              {/* Close */}
              <button
                onClick={onClose}
                aria-label="Close player"
                className="p-1.5 rounded-full text-white/40 hover:text-white hover:bg-white/10 transition-all ml-1"
              >
                <X size={14} />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
