"use client";

import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from "react";

export interface MiniTrack {
  id: string | number;
  title: string;
  artist: string;
  audioUrl: string;
  coverUrl?: string;
  color?: string;
  downloadUrl?: string;
  duration?: number;
}

interface MusicContextValue {
  track: MiniTrack | null;
  queue: MiniTrack[];
  queueIdx: number;
  isPlaying: boolean;
  progress: number;
  duration: number;
  play: (queue: MiniTrack[], idx: number) => void;
  togglePlay: () => void;
  skipNext: () => void;
  skipPrev: () => void;
  seek: (t: number) => void;
  stop: () => void;
  volume: number;
  setVolume: (v: number) => void;
}

const MusicContext = createContext<MusicContextValue | null>(null);

export function MusicProvider({ children }: { children: React.ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [track, setTrack] = useState<MiniTrack | null>(null);
  const [queue, setQueue] = useState<MiniTrack[]>([]);
  const [queueIdx, setQueueIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(0.8);

  const skipNextRef = useRef<() => void>(() => {});

  // Sync volume with audio element
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const setVolume = useCallback((v: number) => {
    setVolumeState(Math.max(0, Math.min(1, v)));
  }, []);

  // Init audio element once
  useEffect(() => {
    const audio = new Audio();
    audio.volume = 0.85;
    audioRef.current = audio;

    const onTime = () => setProgress(audio.currentTime);
    const onDur = () => setDuration(audio.duration);
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onEnded = () => {
      if (skipNextRef.current) skipNextRef.current();
    };

    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("durationchange", onDur);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("ended", onEnded);

    return () => {
      audio.pause();
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("durationchange", onDur);
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("ended", onEnded);
    };
  }, []);

  // Load track when it changes
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !track?.audioUrl) return;
    setProgress(0);
    setDuration(0);
    audio.src = track.audioUrl;
    audio.load();
    audio.play().catch(() => {});
  }, [track]);

  const play = useCallback((newQueue: MiniTrack[], idx: number) => {
    setQueue(newQueue);
    setQueueIdx(idx);
    setTrack(newQueue[idx]);
  }, []);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) audio.pause();
    else audio.play().catch(() => {});
  }, [isPlaying]);

  const skipNext = useCallback(() => {
    setQueue(q => {
      setQueueIdx(idx => {
        const next = idx + 1;
        if (next < q.length) { 
          setTrack(q[next]); 
          return next; 
        }
        // Loop back to start if at the end
        if (q.length > 0) {
          setTrack(q[0]);
          return 0;
        }
        return idx;
      });
      return q;
    });
  }, []);

  const skipPrev = useCallback(() => {
    const audio = audioRef.current;
    if (audio && audio.currentTime > 3) { audio.currentTime = 0; return; }
    setQueue(q => {
      setQueueIdx(idx => {
        const prev = idx - 1;
        if (prev >= 0) { setTrack(q[prev]); return prev; }
        return idx;
      });
      return q;
    });
  }, []);

  const seek = useCallback((t: number) => {
    if (audioRef.current) audioRef.current.currentTime = t;
    setProgress(t);
  }, []);

  const stop = useCallback(() => {
    const audio = audioRef.current;
    if (audio) { audio.pause(); audio.src = ""; }
    setTrack(null);
    setIsPlaying(false);
    setProgress(0);
  }, []);

  // Sync skipNextRef
  useEffect(() => {
    skipNextRef.current = skipNext;
  }, [skipNext]);

  return (
    <MusicContext.Provider value={{ track, queue, queueIdx, isPlaying, progress, duration, play, togglePlay, skipNext, skipPrev, seek, stop, volume, setVolume }}>
      {children}
    </MusicContext.Provider>
  );
}

export function useMusicPlayer() {
  const ctx = useContext(MusicContext);
  if (!ctx) throw new Error("useMusicPlayer must be used within MusicProvider");
  return ctx;
}
