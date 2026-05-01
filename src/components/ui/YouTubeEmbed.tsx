"use client";

import React, { useState } from "react";
import { Play, X, ExternalLink } from "lucide-react";

/* ── YouTube URL parser ───────────────────────────────────────────────── */
export function extractYouTubeId(url: string): string | null {
  try {
    const u = new URL(url);
    // youtu.be/VIDEO_ID
    if (u.hostname === "youtu.be") {
      const id = u.pathname.slice(1).split("?")[0];
      return id.length === 11 ? id : null;
    }
    // youtube.com/watch?v=VIDEO_ID
    if (u.hostname.includes("youtube.com")) {
      // /shorts/VIDEO_ID
      const shortsMatch = u.pathname.match(/\/shorts\/([a-zA-Z0-9_-]{11})/);
      if (shortsMatch) return shortsMatch[1];
      // /embed/VIDEO_ID
      const embedMatch = u.pathname.match(/\/embed\/([a-zA-Z0-9_-]{11})/);
      if (embedMatch) return embedMatch[1];
      // ?v=VIDEO_ID
      const v = u.searchParams.get("v");
      return v && v.length === 11 ? v : null;
    }
  } catch {}
  return null;
}

/* Splits text into segments: plain text or youtube-url objects */
export interface TextSegment {
  type: "text" | "youtube";
  value: string;
  videoId?: string;
}

const URL_REGEX = /https?:\/\/[^\s<>"]+/g;

export function parseContentWithYouTube(text: string): TextSegment[] {
  const segments: TextSegment[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  URL_REGEX.lastIndex = 0;
  while ((match = URL_REGEX.exec(text)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ type: "text", value: text.slice(lastIndex, match.index) });
    }
    const url = match[0];
    const videoId = extractYouTubeId(url);
    if (videoId) {
      segments.push({ type: "youtube", value: url, videoId });
    } else {
      segments.push({ type: "text", value: url });
    }
    lastIndex = match.index + url.length;
  }
  if (lastIndex < text.length) {
    segments.push({ type: "text", value: text.slice(lastIndex) });
  }
  return segments;
}

/* ── YouTube Embed Card ───────────────────────────────────────────────── */
interface YouTubeEmbedProps {
  videoId: string;
  url: string;
  compact?: boolean; // compact = chat bubble size
}

export function YouTubeEmbedCard({ videoId, url, compact = false }: YouTubeEmbedProps) {
  const [active, setActive] = useState(false);
  const thumb = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-outline-variant/30 bg-black ${
        compact ? "w-full max-w-[280px]" : "w-full max-w-[560px]"
      }`}
    >
      {active ? (
        <div className="relative w-full aspect-video">
          <iframe
            src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`}
            title="YouTube video"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full border-0"
          />
          <button
            onClick={() => setActive(false)}
            className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 flex items-center justify-center text-white hover:bg-black/80 transition-colors z-10"
          >
            <X size={14} />
          </button>
        </div>
      ) : (
        <div
          className="relative w-full aspect-video cursor-pointer group"
          onClick={() => setActive(true)}
        >
          {/* Thumbnail */}
          <img
            src={thumb}
            alt="YouTube thumbnail"
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
            }}
          />
          {/* Dark overlay */}
          <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-colors" />
          {/* Play button */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-14 h-14 rounded-full bg-red-600 flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform">
              <Play size={24} fill="white" className="text-white ml-1" />
            </div>
          </div>
          {/* YouTube logo pill */}
          <div className="absolute bottom-2 left-2 flex items-center gap-1.5 bg-black/70 backdrop-blur-sm rounded-full px-2.5 py-1">
            <svg viewBox="0 0 24 24" className="w-3 h-3 fill-red-500">
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
            </svg>
            <span className="text-[10px] text-white font-bold">YouTube</span>
          </div>
          {/* External link */}
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 flex items-center justify-center text-white hover:bg-black/80 transition-colors"
          >
            <ExternalLink size={12} />
          </a>
        </div>
      )}
    </div>
  );
}

/* ── Rich Text Renderer ───────────────────────────────────────────────── */
interface RichContentProps {
  text: string;
  className?: string;
  compact?: boolean;
}

export function RichContent({ text, className = "", compact = false }: RichContentProps) {
  const segments = parseContentWithYouTube(text);
  const hasYouTube = segments.some((s) => s.type === "youtube");

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Text portion */}
      <p className="leading-relaxed whitespace-pre-wrap break-words">
        {segments.map((seg, i) => {
          if (seg.type === "youtube") {
            // show just the URL text inline if we'll also embed it
            return (
              <a
                key={i}
                href={seg.value}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline text-xs break-all"
              >
                {seg.value}
              </a>
            );
          }
          return <span key={i}>{seg.value}</span>;
        })}
      </p>
      {/* YouTube embeds */}
      {segments
        .filter((s) => s.type === "youtube")
        .map((s, i) => (
          <YouTubeEmbedCard key={i} videoId={s.videoId!} url={s.value} compact={compact} />
        ))}
    </div>
  );
}
