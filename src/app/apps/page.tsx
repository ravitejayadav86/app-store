"use client";
import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Loader2, Search, Star, Music, BookOpen, Gamepad2, Code2, Layout, Database, Cloud, Sparkles, Briefcase } from "lucide-react";
import api from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import debounce from "lodash/debounce";

interface App {
  id: number;
  name: string;
  description: string;
  category: string;
  developer: string;
  price: number;
  version: string;
  icon_url?: string | null;
}

function getCategoryIcon(category: string, size: number = 24) {
  switch (category?.toLowerCase()) {
    case "games": return <Gamepad2 size={size} />;
    case "music": return <Music size={size} />;
    case "books": return <BookOpen size={size} />;
    case "productivity": return <Briefcase size={size} />;
    case "development": return <Database size={size} />;
    case "utilities": return <Cloud size={size} />;
    case "graphics": return <Sparkles size={size} />;
    default: return <Layout size={size} />;
  }
}

function getCategoryColor(category: string) {
  switch (category?.toLowerCase()) {
    case "productivity": return "text-blue-500 bg-blue-500/10";
    case "graphics": return "text-orange-500 bg-orange-500/10";
    case "development": return "text-yellow-600 bg-yellow-500/10";
    case "utilities": return "text-gray-400 bg-gray-500/10";
    case "music": return "text-pink-500 bg-pink-500/10";
    case "books": return "text-purple-500 bg-purple-500/10";
    case "games": return "text-emerald-500 bg-emerald-500/10";
    default: return "text-primary bg-primary/10";
  }
}

const ALL_CATEGORIES = ["All", "Games", "Music", "Books", "Productivity", "Development", "Utilities", "Graphics"];

export default function AppsPage() {
  const [apps, setApps] = useState<App[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const fetchApps = useCallback(async (cat: string, q: string) => {
    setLoading(true);
    try {
      const params: any = {};
      if (cat !== "All") params.category = cat;
      if (q) params.q = q;
      
      const res = await api.get("/apps/", { params });
      setApps(res.data);
    } catch (err) {
      console.error("Failed to fetch apps", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounced search
  const debouncedFetch = useCallback(
    debounce((cat: string, q: string) => {
      fetchApps(cat, q);
    }, 500),
    [fetchApps]
  );

  useEffect(() => {
    if (search) {
      debouncedFetch(activeCategory, search);
    } else {
      fetchApps(activeCategory, "");
    }
    return () => debouncedFetch.cancel();
  }, [activeCategory, search, debouncedFetch, fetchApps]);

  return (
    <div className="max-w-7xl mx-auto px-4 pt-28 pb-20 selection:bg-primary/10">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-4xl font-black tracking-tight text-on-surface mb-2">Panda Store</h1>
        <p className="text-on-surface-variant text-sm font-medium">Explore the next generation of panda-powered innovation.</p>
      </motion.div>

      {/* Premium Search */}
      <div className="relative mb-8 group">
        <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none text-on-surface-variant group-focus-within:text-primary transition-colors">
          <Search size={20} />
        </div>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search for apps, creators, or tools..."
          className="w-full pl-14 pr-6 py-4 rounded-2xl bg-white border border-outline-variant/30 outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/30 transition-all text-sm font-semibold shadow-xs"
        />
        <AnimatePresence>
          {loading && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute right-5 top-1/2 -translate-y-1/2"
            >
              <Loader2 className="animate-spin text-primary" size={20} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Category Chips */}
      <div className="flex gap-2.5 overflow-x-auto no-scrollbar pb-4 mb-8">
        {ALL_CATEGORIES.map((cat, i) => (
          <motion.button
            key={cat}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            onClick={() => setActiveCategory(cat)}
            className={`px-6 py-2.5 rounded-full text-xs font-black whitespace-nowrap transition-all border ${
              activeCategory === cat
                ? "bg-primary text-on-primary border-primary shadow-lg shadow-primary/20 scale-105"
                : "bg-white text-on-surface-variant hover:text-on-surface border-outline-variant/30 hover:border-primary/30"
            }`}
          >
            {cat}
          </motion.button>
        ))}
      </div>

      {loading && apps.length === 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="aspect-square rounded-[2rem] bg-gray-100 animate-pulse" />
          ))}
        </div>
      ) : apps.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="py-32 text-center"
        >
          <div className="w-20 h-20 rounded-[2.5rem] bg-surface-low flex items-center justify-center mx-auto mb-6">
            <Search size={40} className="text-gray-300" />
          </div>
          <h3 className="text-xl font-black text-on-surface mb-2">No results found</h3>
          <p className="text-on-surface-variant text-sm max-w-xs mx-auto">Try adjusting your search or category filters to find what you're looking for.</p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {apps.map((app, index) => (
            <motion.div
              key={app.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Link href={`/apps/${app.id}`} className="group block h-full">
                <div className="bg-white border border-outline-variant/10 rounded-[2rem] p-5 hover:border-primary/20 transition-all hover:-translate-y-2 hover:shadow-2xl hover:shadow-primary/5 flex flex-col gap-4 h-full relative overflow-hidden">
                  <div className={`w-14 h-14 rounded-2xl ${getCategoryColor(app.category)} flex items-center justify-center shadow-inner shrink-0 group-hover:scale-110 transition-transform`}>
                    {app.icon_url ? (
                      <img src={app.icon_url} alt={app.name} className="w-full h-full object-cover rounded-2xl" />
                    ) : (
                      getCategoryIcon(app.category, 28)
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="font-black text-[17px] text-on-surface group-hover:text-primary transition-colors truncate tracking-tight">{app.name}</h3>
                    <p className="text-[11px] font-bold text-on-surface-variant opacity-60 mt-0.5 truncate uppercase tracking-widest">{app.category}</p>
                    <p className="text-[10px] text-on-surface-variant mt-1 truncate font-medium">by {app.developer}</p>
                  </div>

                  <div className="flex items-center justify-between pt-3 mt-auto border-t border-outline-variant/5">
                    <div className="flex items-center gap-1 text-[11px] font-black text-on-surface">
                      <Star size={12} className="fill-yellow-400 text-yellow-400" />
                      <span>4.8</span>
                    </div>
                    <span className={`text-[11px] font-black px-3 py-1 rounded-full ${app.price === 0 ? "bg-green-500/10 text-green-500" : "bg-primary/10 text-primary"}`}>
                      {app.price === 0 ? "FREE" : `$${app.price}`}
                    </span>
                  </div>
                  
                  {/* Decorative faint glow */}
                  <div className="absolute top-0 right-0 w-20 h-20 bg-primary/5 rounded-full -mr-10 -mt-10 blur-2xl group-hover:bg-primary/10 transition-colors" />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
