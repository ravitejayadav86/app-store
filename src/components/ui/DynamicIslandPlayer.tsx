"use client";

import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, SkipForward, SkipBack, X, Music2 } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useMusicPlayer } from "@/lib/MusicContext";
const SPRING = { type: "spring", stiffness: 300, damping: 30, mass: 0.8 } as const;


function fmt(s: number) {
  if (!isFinite(s) || s < 0) return "0:00";
  return `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
}

export function DynamicIslandPlayer() {
  const pathname = usePathname();
  const router = useRouter();
  const holdTimer = useRef<NodeJS.Timeout | null>(null);
  const hasLongPressed = useRef(false);
  const { track, isPlaying, progress, duration, togglePlay, skipNext, skipPrev, seek, stop } = useMusicPlayer();
  const [expanded, setExpanded] = useState(false);
  const [isPressing, setIsPressing] = useState(false);
  const pct = duration > 0 ? (progress / duration) * 100 : 0;
  const color = track?.color ?? "#0058bb";

  const isSongPage = pathname?.startsWith("/music/") && pathname !== "/music";

  return (
    <AnimatePresence>
      {!isSongPage && track && (
        <motion.div
          key="dynamic-island"
          layout
          initial={{ opacity: 0, scale: 0.6, y: -8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.6, y: -8 }}
          transition={SPRING}
          style={{ willChange: "transform, opacity" }}
          className="relative z-[80]"
        >
          <motion.div
            layout
            transition={SPRING}
            onPointerDown={(e) => {
              // Ignore if clicking on buttons
              if ((e.target as HTMLElement).closest("button") || (e.target as HTMLElement).tagName === "INPUT") return;
              setIsPressing(true);
              hasLongPressed.current = false;
              holdTimer.current = setTimeout(() => {
                hasLongPressed.current = true;
                setIsPressing(false);
                router.push(`/music/${track.id}`);
              }, 400); // 400ms hold
            }}
            onPointerUp={(e) => {
              if (holdTimer.current) clearTimeout(holdTimer.current);
              setIsPressing(false);
              // Ignore if clicking on buttons
              if ((e.target as HTMLElement).closest("button") || (e.target as HTMLElement).tagName === "INPUT") return;
              
              if (!hasLongPressed.current) {
                setExpanded(e => !e);
              }
            }}
            onPointerLeave={() => {
              if (holdTimer.current) clearTimeout(holdTimer.current);
              setIsPressing(false);
            }}
            onPointerCancel={() => {
              if (holdTimer.current) clearTimeout(holdTimer.current);
              setIsPressing(false);
            }}
            onDoubleClick={(e) => {
              if ((e.target as HTMLElement).closest("button") || (e.target as HTMLElement).tagName === "INPUT") return;
              router.push(`/music/${track.id}`);
            }}
            animate={{ scale: isPressing ? 0.95 : 1 }}
            className="relative overflow-hidden cursor-pointer select-none transform-gpu"
            style={{
              background: "rgba(10,10,15,0.95)",
              backdropFilter: "blur(28px)",
              WebkitBackdropFilter: "blur(28px)",
              borderRadius: expanded ? "24px" : "9999px",
              border: "1px solid rgba(255,255,255,0.1)",
              boxShadow: `0 8px 32px -4px ${color}55, 0 2px 8px rgba(0,0,0,0.4)`,
              touchAction: "none",
            }}
          >
            {/* Ambient glow strip at top */}
            <motion.div
              layout
              className="absolute top-0 left-0 right-0 h-[2px] rounded-full"
              style={{ background: `linear-gradient(90deg, transparent, ${color}, transparent)` }}
              animate={{ opacity: isPlaying ? [0.6, 1, 0.6] : 0.4 }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />

            {/* ── COLLAPSED pill ── */}
            {!expanded && (
              <motion.div
                layout
                className="flex items-center gap-2 px-3 py-1.5"
                initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1, transition: { delay: 0.1, duration: 0.2 } }} exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.1 } }}
              >
                {/* Album art / equalizer */}
                <div className="relative w-6 h-6 rounded-full overflow-hidden flex-shrink-0">
                  {track.coverUrl
                    ? <img src={track.coverUrl} alt={track.title} className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center" style={{ background: color }}><Music2 size={10} className="text-white" /></div>}
                  {isPlaying && (
                    <div className="absolute inset-0 bg-black/40 flex items-end justify-center pb-0.5 gap-px">
                      {[1, 2, 3].map(b => (
                        <motion.div key={b} className="w-0.5 rounded-full bg-white"
                          animate={{ height: ["2px", "8px", "4px", "8px", "2px"] }}
                          transition={{ duration: 0.7 + b * 0.1, repeat: Infinity, ease: "easeInOut", delay: b * 0.1 }} />
                      ))}
                    </div>
                  )}
                </div>

                {/* Title */}
                <span className="text-white text-[11px] font-bold truncate max-w-[90px]">{track.title}</span>

                {/* Controls */}
                <div className="flex items-center gap-0.5 ml-1" onClick={e => e.stopPropagation()}>
                  <button onClick={skipPrev} className="p-1 text-white/50 hover:text-white transition-colors">
                    <SkipBack size={12} fill="currentColor" />
                  </button>
                  <button onClick={togglePlay}
                    className="w-6 h-6 rounded-full flex items-center justify-center text-white transition-all hover:scale-110 active:scale-90"
                    style={{ background: color }}>
                    {isPlaying ? <Pause size={10} fill="white" /> : <Play size={10} fill="white" className="ml-0.5" />}
                  </button>
                  <button onClick={skipNext} className="p-1 text-white/50 hover:text-white transition-colors">
                    <SkipForward size={12} fill="currentColor" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* ── EXPANDED card ── */}
            {expanded && (
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1, transition: { delay: 0.1, duration: 0.25 } }} exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.1 } }}
                style={{ willChange: "transform, opacity" }}
                className="p-4 w-[280px]"
              >
                {/* Close Button (Stops playback and hides island) */}
                <button 
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    stop(); 
                    setExpanded(false); 
                  }}
                  className="absolute top-3 right-3 p-1.5 rounded-full bg-white/10 text-white/60 hover:text-white hover:bg-white/20 transition-all z-[100] active:scale-90"
                >
                  <X size={14} />
                </button>

                <div className="flex items-center gap-3 mb-3">
                  {/* Art */}
                  <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 shadow-lg" style={{ boxShadow: `0 8px 24px -4px ${color}88` }}>
                    {track.coverUrl
                      ? <img src={track.coverUrl} alt={track.title} className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex items-center justify-center" style={{ background: `linear-gradient(135deg,${color}66,${color})` }}><Music2 size={24} className="text-white/60" /></div>}
                  </div>
                  {/* Info */}
                  <div className="min-w-0">
                    <p className="text-white text-sm font-bold truncate">{track.title}</p>
                    <p className="text-white/40 text-xs truncate">{track.artist}</p>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mb-3" onClick={e => e.stopPropagation()}>
                  <div className="relative h-1 rounded-full bg-white/10 mb-1 overflow-hidden transform-gpu">
                    <div className="absolute inset-y-0 left-0 w-full h-full rounded-full origin-left will-change-transform" 
                         style={{ transform: `scaleX(${pct / 100})`, background: color, transition: 'transform 0.1s linear' }} />
                    <input type="range" min={0} max={duration || 100} step={0.1} value={progress}
                      onChange={e => seek(Number(e.target.value))}
                      className="absolute inset-0 w-full opacity-0 cursor-pointer h-full" />
                  </div>
                  <div className="flex justify-between text-[9px] font-mono text-white/30">
                    <span>{fmt(progress)}</span><span>{fmt(duration)}</span>
                  </div>
                </div>

                {/* Controls */}
                <div className="flex items-center justify-center gap-4" onClick={e => e.stopPropagation()}>
                  <button onClick={skipPrev} className="p-2 text-white/40 hover:text-white transition-colors">
                    <SkipBack size={20} fill="currentColor" />
                  </button>
                  <button onClick={togglePlay}
                    className="w-11 h-11 rounded-full flex items-center justify-center text-white transition-all hover:scale-105 active:scale-95"
                    style={{ background: color, boxShadow: `0 8px 20px -4px ${color}` }}>
                    {isPlaying ? <Pause size={20} fill="white" /> : <Play size={20} fill="white" className="ml-0.5" />}
                  </button>
                  <button onClick={skipNext} className="p-2 text-white/40 hover:text-white transition-colors">
                    <SkipForward size={20} fill="currentColor" />
                  </button>
                </div>

                {/* Stop */}
                <button onClick={e => { e.stopPropagation(); stop(); setExpanded(false); }}
                  className="mt-3 w-full text-center text-[10px] text-white/20 hover:text-white/50 transition-colors">
                  Stop playback
                </button>
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
