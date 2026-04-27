"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import { Search, X, Clock, TrendingUp, ChevronRight, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/lib/api";

/* ── Animation presets (120 Hz-ready) ─────────────────────────────────── */
const SPRING_EXPAND = { type: "spring", stiffness: 480, damping: 36, mass: 0.5 } as const;
const SPRING_ITEM   = { type: "spring", stiffness: 600, damping: 42, mass: 0.45 } as const;
const FADE_FAST     = { duration: 0.14, ease: [0.16, 1, 0.3, 1] as const };

const RECENT_SEARCHES = ["Minecraft", "Spotify clone", "Photo editor", "Puzzle game"];
const TRENDING        = ["PandaStore originals", "New arrivals", "Top rated books", "Racing games", "Music beats"];

interface MobileSearchProps {
  /** Called when the user closes the search overlay */
  onClose?: () => void;
}

export const MobileSearch = ({ onClose }: MobileSearchProps) => {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(false);

  // Live Search Logic
  useEffect(() => {
    const fetchResults = async () => {
      if (query.trim().length < 2) {
        setResults([]);
        return;
      }
      setLoading(true);
      try {
        const [appsRes, musicRes] = await Promise.all([
          api.get("/apps/"),
          api.get("/music/")
        ]);
        
        const q = query.toLowerCase();
        const apps = appsRes.data
          .filter((a: any) => a.name.toLowerCase().includes(q))
          .map((a: any) => ({ ...a, type: "app", url: `/apps/${a.id}` }));
          
        const music = musicRes.data
          .filter((m: any) => m.title.toLowerCase().includes(q))
          .map((m: any) => ({ ...m, name: m.title, type: "music", url: "/music" }));
          
        setResults([...apps, ...music].slice(0, 8));
      } catch (err) {
        console.error("Search failed", err);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(fetchResults, 250);
    return () => clearTimeout(timer);
  }, [query]);

  const submit = useCallback(
    (value: string) => {
      const trimmed = value.trim();
      if (!trimmed) return;
      router.push(`/categories?search=${encodeURIComponent(trimmed)}`);
      onClose?.();
    },
    [router, onClose]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (results.length > 0) {
      router.push(results[0].url);
      onClose?.();
    } else {
      submit(query);
    }
  };

  const handleResultClick = (url: string) => {
    router.push(url);
    onClose?.();
  };

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
        <form onSubmit={handleSubmit} className="mobile-search-pill" role="search">
          <button type="button" onClick={onClose} className="mobile-search-icon-btn">
            <ArrowLeft size={20} />
          </button>

          <input
            ref={inputRef}
            autoFocus
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setFocused(true)}
            placeholder="Search apps or music..."
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

        <AnimatePresence>
          {(query.length >= 2 || focused) && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={SPRING_EXPAND}
              className="mobile-search-panel"
            >
              <section className="mobile-search-section">
                <h3 className="mobile-search-section-title">
                  {query.length < 2 ? "Recent" : loading ? "Searching..." : results.length > 0 ? "Results" : "No results found"}
                </h3>
                <ul>
                  {query.length < 2 ? (
                    RECENT_SEARCHES.map((item, i) => (
                      <li key={item}>
                        <button onClick={() => setQuery(item)} className="mobile-search-row">
                          <Clock size={15} className="text-on-surface-variant opacity-50" />
                          <span className="mobile-search-row-label">{item}</span>
                          <ChevronRight size={15} className="ml-auto opacity-30" />
                        </button>
                      </li>
                    ))
                  ) : (
                    results.map((item, i) => (
                      <motion.li
                        key={item.id + item.type}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.03 }}
                      >
                        <button
                          onClick={() => handleResultClick(item.url)}
                          className="mobile-search-row"
                        >
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${item.type === 'music' ? 'bg-indigo-500/10 text-indigo-500' : 'bg-primary/10 text-primary'}`}>
                            {item.type === 'music' ? <TrendingUp size={14} /> : <Search size={14} />}
                          </div>
                          <div className="flex-1 text-left">
                            <p className="text-sm font-bold truncate">{highlightMatch(item.name, query)}</p>
                            <p className="text-[10px] text-on-surface-variant uppercase tracking-wider">{item.category || item.type}</p>
                          </div>
                          <ChevronRight size={15} className="text-on-surface-variant opacity-30 ml-auto shrink-0" />
                        </button>
                      </motion.li>
                    ))
                  )}
                </ul>
              </section>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
};

/* ── Highlight matching text ───────────────────────────────────────────── */
function highlightMatch(text: string, query: string): React.ReactNode {
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="mobile-search-highlight">{text.slice(idx, idx + query.length)}</mark>
      {text.slice(idx + query.length)}
    </>
  );
}
