"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import { Search, X, Clock, TrendingUp, ChevronRight, ArrowLeft, Music, Grid, Gamepad2, BookOpen, Mic2, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/lib/api";
import { fuzzySearch, highlightSegments } from "@/lib/search";

/* ── Animation presets (120 Hz-ready) ─────────────────────────────────── */
const SPRING_EXPAND = { type: "spring", stiffness: 480, damping: 36, mass: 0.5 } as const;
const FADE_FAST     = { duration: 0.14, ease: [0.16, 1, 0.3, 1] as const };

const TRENDING = [
  { label: "New Games",      icon: <Gamepad2 size={14} />, href: "/games" },
  { label: "Music Beats",    icon: <Music size={14} />,    href: "/music" },
  { label: "Top Apps",       icon: <Grid size={14} />,     href: "/discover" },
  { label: "Books",          icon: <BookOpen size={14} />, href: "/books" },
  { label: "Dev Tools",      icon: <Sparkles size={14} />, href: "/discover?category=Development" },
];

const HISTORY_KEY = "pandas_search_history";
const MAX_HISTORY = 6;

function loadHistory(): string[] {
  try { return JSON.parse(localStorage.getItem(HISTORY_KEY) ?? "[]"); } catch { return []; }
}
function saveHistory(query: string) {
  const prev = loadHistory().filter(h => h !== query);
  localStorage.setItem(HISTORY_KEY, JSON.stringify([query, ...prev].slice(0, MAX_HISTORY)));
}
function clearHistory() {
  localStorage.removeItem(HISTORY_KEY);
}

interface MobileSearchProps {
  onClose?: () => void;
}

const TYPE_CONFIG: Record<string, { icon: React.ReactNode; bg: string; label: string }> = {
  app:    { icon: <Grid size={14} />,     bg: "bg-primary/10 text-primary",       label: "App"   },
  music:  { icon: <Music size={14} />,    bg: "bg-indigo-500/10 text-indigo-500", label: "Music" },
  game:   { icon: <Gamepad2 size={14} />, bg: "bg-orange-500/10 text-orange-500", label: "Game"  },
  book:   { icon: <BookOpen size={14} />, bg: "bg-red-500/10 text-red-500",       label: "Book"  },
};

export const MobileSearch = ({ onClose }: MobileSearchProps) => {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const [allApps, setAllApps] = useState<any[]>([]);

  // Load history and pre-fetch all apps for instant local search
  useEffect(() => {
    setHistory(loadHistory());
    api.get("/apps/")
      .then(res => setAllApps(res.data))
      .catch(() => {});
  }, []);

  // Advanced fuzzy search — local-first, instant results
  useEffect(() => {
    if (query.trim().length < 1) {
      setResults([]);
      return;
    }

    // Instantly search local cache
    const localResults = fuzzySearch(
      allApps.map((a: any) => ({
        ...a,
        type: a.category?.toLowerCase() === "music" ? "music"
             : a.category?.toLowerCase() === "games" ? "game"
             : "app",
        url: `/apps/${a.id}`,
      })),
      query,
      8
    );
    setResults(localResults);

    // Then refetch from API in background for freshness (debounced)
    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const res = await api.get("/apps/");
        const fresh = fuzzySearch(
          res.data.map((a: any) => ({
            ...a,
            type: a.category?.toLowerCase() === "music" ? "music"
                 : a.category?.toLowerCase() === "games" ? "game"
                 : "app",
            url: `/apps/${a.id}`,
          })),
          query,
          8
        );
        setResults(fresh);
      } catch {}
      setLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [query, allApps]);

  const navigate = useCallback((url: string, label?: string) => {
    if (label) saveHistory(label);
    else if (query.trim()) saveHistory(query.trim());
    router.push(url);
    onClose?.();
  }, [router, onClose, query]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (results.length > 0) {
      navigate(results[0].url, results[0].name);
    } else if (query.trim()) {
      saveHistory(query.trim());
      router.push(`/discover?search=${encodeURIComponent(query.trim())}`);
      onClose?.();
    }
  };

  const removeHistory = (item: string) => {
    const next = history.filter(h => h !== item);
    setHistory(next);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
  };

  const typeConf = (type: string) => TYPE_CONFIG[type] ?? TYPE_CONFIG.app;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={FADE_FAST}
      className="mobile-search-overlay"
      style={{ willChange: "opacity" }}
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.18 }}
        className="mobile-search-backdrop"
        onClick={onClose}
      />

      <motion.div
        initial={{ y: -24, opacity: 0, scale: 0.97 }}
        animate={{ y: 0,   opacity: 1, scale: 1    }}
        exit={{   y: -16,  opacity: 0, scale: 0.97 }}
        transition={SPRING_EXPAND}
        className="mobile-search-card"
        style={{ willChange: "transform, opacity" }}
      >
        {/* ── Search Bar ── */}
        <form onSubmit={handleSubmit} className="mobile-search-pill" role="search">
          <button type="button" onClick={onClose} className="mobile-search-icon-btn">
            <ArrowLeft size={20} />
          </button>

          <input
            ref={inputRef}
            autoFocus
            type="search"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search apps, music, games..."
            className="mobile-search-input"
          />

          <AnimatePresence>
            {(query.length > 0 || loading) && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                className="flex items-center gap-2 mr-2"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                ) : (
                  <button type="button" onClick={() => setQuery("")} className="mobile-search-clear-btn">
                    <X size={14} />
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          <button type="submit" className="mobile-search-submit-btn">
            <Search size={18} />
          </button>
        </form>

        {/* ── Results / Empty state ── */}
        <AnimatePresence mode="wait">
          {query.length >= 1 ? (
            /* ── Live Results ── */
            <motion.div
              key="results"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={SPRING_EXPAND}
              className="mobile-search-panel"
            >
              <section className="mobile-search-section">
                <h3 className="mobile-search-section-title flex items-center gap-2">
                  {loading
                    ? <><div className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin" /> Searching...</>
                    : results.length > 0
                      ? <><Sparkles size={12} className="text-primary" /> {results.length} result{results.length !== 1 ? "s" : ""}</>
                      : "No results — try different keywords"}
                </h3>
                <ul className="space-y-0.5">
                  {results.map((item, i) => {
                    const conf = typeConf(item.type);
                    const segments = highlightSegments(item.name || item.title || "", query);
                    return (
                      <motion.li
                        key={`${item.id}-${item.type}`}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.025, type: "spring", stiffness: 600, damping: 42 }}
                        style={{ willChange: "transform, opacity" }}
                      >
                        <button
                          onClick={() => navigate(item.url, item.name)}
                          className="mobile-search-row"
                        >
                          {/* Icon */}
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 overflow-hidden ${conf.bg}`}>
                            {item.icon_url
                              ? <img src={item.icon_url} alt="" className="w-full h-full object-cover" />
                              : conf.icon}
                          </div>

                          {/* Text */}
                          <div className="flex-1 text-left min-w-0">
                            <p className="text-sm font-bold truncate">
                              {segments.map((seg, si) =>
                                seg.highlight
                                  ? <mark key={si} className="mobile-search-highlight">{seg.text}</mark>
                                  : <span key={si}>{seg.text}</span>
                              )}
                            </p>
                            <p className="text-[10px] text-on-surface-variant uppercase tracking-wider">
                              {item.category || conf.label}
                              {item.developer ? ` · ${item.developer}` : ""}
                            </p>
                          </div>

                          {/* Type badge */}
                          <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full shrink-0 ${conf.bg}`}>
                            {conf.label}
                          </span>
                          <ChevronRight size={14} className="text-on-surface-variant opacity-30 ml-1 shrink-0" />
                        </button>
                      </motion.li>
                    );
                  })}
                  {!loading && results.length === 0 && (
                    <li className="py-8 text-center text-on-surface-variant">
                      <Mic2 size={32} className="mx-auto mb-3 opacity-20" />
                      <p className="text-sm font-medium">No matches for "{query}"</p>
                      <p className="text-xs opacity-60 mt-1">Check spelling or try shorter keywords</p>
                    </li>
                  )}
                </ul>
              </section>
            </motion.div>
          ) : (
            /* ── Empty state: History + Trending ── */
            <motion.div
              key="idle"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={SPRING_EXPAND}
              className="mobile-search-panel"
            >
              {/* Recent searches */}
              {history.length > 0 && (
                <section className="mobile-search-section">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="mobile-search-section-title mb-0">Recent</h3>
                    <button
                      onClick={() => { clearHistory(); setHistory([]); }}
                      className="text-[10px] text-on-surface-variant/60 hover:text-primary transition-colors"
                    >
                      Clear all
                    </button>
                  </div>
                  <ul className="space-y-0.5">
                    {history.map(item => (
                      <li key={item} className="flex items-center">
                        <button onClick={() => setQuery(item)} className="mobile-search-row flex-1">
                          <Clock size={14} className="text-on-surface-variant opacity-40 shrink-0" />
                          <span className="mobile-search-row-label">{item}</span>
                          <ChevronRight size={14} className="ml-auto opacity-30" />
                        </button>
                        <button
                          onClick={() => removeHistory(item)}
                          className="p-2 text-on-surface-variant/30 hover:text-red-400 transition-colors"
                          aria-label="Remove"
                        >
                          <X size={12} />
                        </button>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {/* Trending shortcuts */}
              <section className="mobile-search-section">
                <h3 className="mobile-search-section-title flex items-center gap-2">
                  <TrendingUp size={12} className="text-primary" /> Trending
                </h3>
                <div className="flex flex-wrap gap-2 pt-1">
                  {TRENDING.map(item => (
                    <button
                      key={item.label}
                      onClick={() => navigate(item.href, item.label)}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-surface-low border border-outline-variant/20 text-xs font-bold hover:bg-primary/5 hover:text-primary hover:border-primary/20 transition-all active:scale-95"
                    >
                      <span className="text-primary">{item.icon}</span>
                      {item.label}
                    </button>
                  ))}
                </div>
              </section>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
};
