"use client";
import React, { createContext, useContext, useState, useRef, useEffect, useCallback } from "react";

export interface Track {
  id: number;
  name: string;
  developer: string;
  file_path: string;
  icon_url?: string;
  price: number;
}

interface MusicPlayerContextType {
  currentTrack: Track | null;
  queue: Track[];
  isPlaying: boolean;
  progress: number;
  duration: number;
  volume: number;
  playTrack: (track: Track, queue?: Track[]) => void;
  togglePlay: () => void;
  next: () => void;
  prev: () => void;
  seek: (time: number) => void;
  setVolume: (vol: number) => void;
  addToQueue: (track: Track) => void;
}

const MusicPlayerContext = createContext<MusicPlayerContextType | null>(null);

export function MusicPlayerProvider({ children }: { children: React.ReactNode }) {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [queue, setQueue] = useState<Track[]>([]);
  const [queueIndex, setQueueIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(0.8);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = new Audio();
    audio.volume = 0.8;
    audioRef.current = audio;

    audio.ontimeupdate = () => setProgress(audio.currentTime);
    audio.ondurationchange = () => setDuration(audio.duration);
    audio.onended = () => {
      setQueueIndex(prev => {
        const next = prev + 1;
        if (next < queue.length) {
          setCurrentTrack(queue[next]);
          audio.src = queue[next].file_path;
          audio.play();
          return next;
        }
        setIsPlaying(false);
        return prev;
      });
    };

    return () => { audio.pause(); audio.src = ""; };
  }, []);

  useEffect(() => {
    if (!audioRef.current || !currentTrack?.file_path) return;
    audioRef.current.src = currentTrack.file_path;
    audioRef.current.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
  }, [currentTrack]);

  const playTrack = useCallback((track: Track, newQueue?: Track[]) => {
    if (newQueue) { setQueue(newQueue); setQueueIndex(newQueue.findIndex(t => t.id === track.id) || 0); }
    setCurrentTrack(track);
  }, []);

  const togglePlay = useCallback(() => {
    if (!audioRef.current) return;
    if (isPlaying) { audioRef.current.pause(); setIsPlaying(false); }
    else { audioRef.current.play(); setIsPlaying(true); }
  }, [isPlaying]);

  const next = useCallback(() => {
    const nextIdx = queueIndex + 1;
    if (nextIdx < queue.length) { setQueueIndex(nextIdx); setCurrentTrack(queue[nextIdx]); }
  }, [queue, queueIndex]);

  const prev = useCallback(() => {
    if (audioRef.current && audioRef.current.currentTime > 3) { audioRef.current.currentTime = 0; return; }
    const prevIdx = queueIndex - 1;
    if (prevIdx >= 0) { setQueueIndex(prevIdx); setCurrentTrack(queue[prevIdx]); }
  }, [queue, queueIndex]);

  const seek = useCallback((time: number) => {
    if (audioRef.current) { audioRef.current.currentTime = time; setProgress(time); }
  }, []);

  const setVolume = useCallback((vol: number) => {
    if (audioRef.current) audioRef.current.volume = vol;
    setVolumeState(vol);
  }, []);

  const addToQueue = useCallback((track: Track) => {
    setQueue(prev => [...prev, track]);
  }, []);

  return (
    <MusicPlayerContext.Provider value={{ currentTrack, queue, isPlaying, progress, duration, volume, playTrack, togglePlay, next, prev, seek, setVolume, addToQueue }}>
      {children}
    </MusicPlayerContext.Provider>
  );
}

export function useMusicPlayer() {
  const ctx = useContext(MusicPlayerContext);
  if (!ctx) throw new Error("useMusicPlayer must be used within MusicPlayerProvider");
  return ctx;
}
