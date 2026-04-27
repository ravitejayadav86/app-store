"use client";

import React, { useState, useRef, useCallback } from "react";
import { Search, X, Clock, TrendingUp, ChevronRight, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

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
  const [focused, setFocused] = useState(false);

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
    submit(query);
  };

  const handleSuggestion = (text: string) => {
    setQuery(text);
    submit(text);
  };

  const showPanel = focused || query.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={FADE_FAST}
      className="mobile-search-overlay"
      style={{ willChange: "opacity" }}
    >
      {/* ── Backdrop ─────────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.18 }}
        className="mobile-search-backdrop"
        onClick={onClose}
      />

      {/* ── Main card ────────────────────────────────────────────────────── */}
      <motion.div
        initial={{ y: -24, opacity: 0, scale: 0.97 }}
        animate={{ y: 0,   opacity: 1, scale: 1    }}
        exit={{   y: -16,  opacity: 0, scale: 0.97 }}
        transition={SPRING_EXPAND}
        className="mobile-search-card"
        style={{ willChange: "transform, opacity" }}
      >
        {/* ── Search pill ──────────────────────────────────────────────── */}
        <form onSubmit={handleSubmit} className="mobile-search-pill" role="search">
          {/* Back / close */}
          <button
            type="button"
            onClick={onClose}
            className="mobile-search-icon-btn"
            aria-label="Close search"
          >
            <ArrowLeft size={20} />
          </button>

          {/* Input */}
          <label htmlFor="mobile-search-input" className="sr-only">
            Search PandaStore
          </label>
          <input
            ref={inputRef}
            id="mobile-search-input"
            autoFocus
            type="search"
            inputMode="search"
            enterKeyHint="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder="Search apps, games, music…"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
            className="mobile-search-input"
            aria-label="Search PandaStore"
          />

          {/* Clear */}
          <AnimatePresence>
            {query.length > 0 && (
              <motion.button
                key="clear"
                type="button"
                onClick={() => { setQuery(""); inputRef.current?.focus(); }}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{   scale: 0, opacity: 0 }}
                transition={SPRING_ITEM}
                className="mobile-search-clear-btn"
                aria-label="Clear search"
                style={{ willChange: "transform, opacity" }}
              >
                <X size={14} />
              </motion.button>
            )}
          </AnimatePresence>

          {/* Submit */}
          <button
            type="submit"
            className="mobile-search-submit-btn"
            aria-label="Search"
          >
            <Search size={18} />
          </button>
        </form>

        {/* ── Suggestions panel ────────────────────────────────────────── */}
        <AnimatePresence>
          {showPanel && (
            <motion.div
              key="panel"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{   opacity: 0, height: 0 }}
              transition={SPRING_EXPAND}
              className="mobile-search-panel"
              style={{ willChange: "height, opacity", overflow: "hidden" }}
            >
              {/* Recent */}
              {query.length === 0 && RECENT_SEARCHES.length > 0 && (
                <section className="mobile-search-section">
                  <h3 className="mobile-search-section-title">
                    <Clock size={13} className="inline-block mr-1.5 opacity-60" />
                    Recent
                  </h3>
                  <ul>
                    {RECENT_SEARCHES.map((item, i) => (
                      <motion.li
                        key={item}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0  }}
                        transition={{ ...SPRING_ITEM, delay: i * 0.035 }}
                        style={{ willChange: "transform, opacity" }}
                      >
                        <button
                          type="button"
                          onClick={() => handleSuggestion(item)}
                          className="mobile-search-row"
                        >
                          <Clock size={15} className="text-on-surface-variant opacity-50 shrink-0" />
                          <span className="mobile-search-row-label">{item}</span>
                          <ChevronRight size={15} className="text-on-surface-variant opacity-30 ml-auto shrink-0" />
                        </button>
                      </motion.li>
                    ))}
                  </ul>
                </section>
              )}

              {/* Trending / filtered */}
              <section className="mobile-search-section">
                <h3 className="mobile-search-section-title">
                  <TrendingUp size={13} className="inline-block mr-1.5 opacity-60" />
                  {query.length > 0 ? "Suggestions" : "Trending"}
                </h3>
                <ul>
                  {TRENDING
                    .filter((t) =>
                      query.length === 0
                        ? true
                        : t.toLowerCase().includes(query.toLowerCase())
                    )
                    .map((item, i) => (
                      <motion.li
                        key={item}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0  }}
                        transition={{ ...SPRING_ITEM, delay: i * 0.03 }}
                        style={{ willChange: "transform, opacity" }}
                      >
                        <button
                          type="button"
                          onClick={() => handleSuggestion(item)}
                          className="mobile-search-row"
                        >
                          <TrendingUp size={15} className="text-primary opacity-60 shrink-0" />
                          <span className="mobile-search-row-label">
                            {query.length > 0
                              ? highlightMatch(item, query)
                              : item}
                          </span>
                          <ChevronRight size={15} className="text-on-surface-variant opacity-30 ml-auto shrink-0" />
                        </button>
                      </motion.li>
                    ))}
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
