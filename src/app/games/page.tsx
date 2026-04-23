"use client";
import React, { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Gamepad2, Trophy, Zap, Star, Loader2, Search, Sparkles } from "lucide-react";
import api from "@/lib/api";
import Link from "next/link";
import debounce from "lodash/debounce";

interface Game {
  id: number;
  name: string;
  category: string;
  developer: string;
  price: number;
  version: string;
  icon_url?: string | null;
}

export default function GamesPage() {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchGames = useCallback(async (q: string) => {
    setLoading(true);
    try {
      const res = await api.get("/apps/", { 
        params: { category: "Games", q } 
      });
      setGames(res.data);
    } catch (error) {
      console.error("Failed to fetch games:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const debouncedFetch = useCallback(
    debounce((q: string) => fetchGames(q), 500),
    [fetchGames]
  );

  useEffect(() => {
    if (search) {
      debouncedFetch(search);
    } else {
      fetchGames("");
    }
    return () => debouncedFetch.cancel();
  }, [search, debouncedFetch, fetchGames]);

  return (
    <div className="flex flex-col gap-10 pb-32">
      <section className="px-4 pt-12">
        <div className="relative h-[250px] md:h-[350px] w-full max-w-7xl mx-auto rounded-[2.5rem] overflow-hidden bg-black p-8 md:p-12 text-white flex flex-col justify-end gap-3 shadow-2xl">
          <div className="absolute inset-0 bg-linear-to-tr from-black via-black/80 to-emerald-500/20" />
          
          <div className="relative z-10 max-w-xl">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 mb-2 bg-white/10 w-fit px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest backdrop-blur-md border border-white/10"
            >
              <Gamepad2 size={12} />
              <span>Arcade v2.0</span>
            </motion.div>
            <h1 className="text-3xl md:text-5xl font-black tracking-tighter leading-none mb-1">Panda Arcade.</h1>
            <p className="text-[11px] md:text-base text-gray-400 font-medium max-w-xs">High-fidelity worlds crafted by visionary indie developers.</p>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto w-full px-4">
        <div className="relative group w-full mb-8">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search titles..."
            className="w-full pl-10 pr-6 py-3 rounded-xl bg-white border border-outline-variant/20 outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/30 transition-all text-[12px] font-semibold"
          />
        </div>

        <div className="flex items-center justify-between mb-6 px-2">
          <div className="flex items-center gap-2">
            <Trophy size={16} className="text-emerald-500" />
            <h2 className="text-lg font-black text-on-surface tracking-tighter">Arena Registry</h2>
          </div>
          <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">
            {games.length} Nodes Online
          </span>
        </div>
        
        {loading && games.length === 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="aspect-square rounded-[1.5rem] bg-gray-50 animate-pulse" />
            ))}
          </div>
        ) : games.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {games.map((game, index) => (
              <motion.div 
                key={game.id} 
                initial={{ opacity: 0, scale: 0.95 }} 
                animate={{ opacity: 1, scale: 1 }} 
                transition={{ delay: index * 0.05 }}
              >
                <Link href={`/apps/${game.id}`}>
                  <div className="group bg-white border border-outline-variant/10 rounded-[2rem] p-3 transition-all hover:shadow-xl hover:border-emerald-500/20 hover:-translate-y-1">
                    <div className="aspect-square w-full rounded-[1.5rem] bg-emerald-50/50 flex items-center justify-center shadow-inner overflow-hidden mb-3 group-hover:scale-105 transition-transform duration-500">
                      {game.icon_url ? (
                        <img src={game.icon_url} className="w-full h-full object-cover" />
                      ) : (
                        <Gamepad2 size={24} className="text-emerald-500 opacity-20" />
                      )}
                    </div>
                    
                    <div className="px-1">
                      <h3 className="text-[13px] font-black tracking-tight text-on-surface truncate mb-0.5 group-hover:text-emerald-600 transition-colors">{game.name}</h3>
                      <div className="flex items-center justify-between">
                        <span className="text-[8px] font-black uppercase tracking-widest text-emerald-500/60">Arcade</span>
                        <div className="flex items-center gap-0.5">
                          <Star size={8} className="fill-yellow-400 text-yellow-400" />
                          <span className="text-[8px] font-black">4.9</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="py-20 text-center bg-surface-low rounded-[2.5rem] border border-dashed border-outline-variant/20">
             <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Arena Empty</p>
          </div>
        )}
      </section>
    </div>
  );
}
