"use client";
import React, { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Music, Headphones, Search, Play, Volume2, Star } from "lucide-react";
import api from "@/lib/api";
import Link from "next/link";
import debounce from "lodash/debounce";

interface MusicApp {
  id: number;
  name: string;
  description: string;
  developer: string;
  price: number;
  version: string;
  category: string;
  icon_url?: string | null;
}

const COLORS = [
  "from-pink-500 to-rose-600",
  "from-purple-500 to-indigo-600",
  "from-blue-500 to-cyan-600",
  "from-emerald-500 to-teal-600",
];

export default function MusicPage() {
  const [tracks, setTracks] = useState<MusicApp[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchMusic = useCallback(async (q: string) => {
    setLoading(true);
    try {
      const res = await api.get("/apps/", { 
        params: { category: "Music", q } 
      });
      setTracks(res.data);
    } catch (error) {
      console.error("Failed to fetch music:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const debouncedFetch = useCallback(
    debounce((q: string) => fetchMusic(q), 500),
    [fetchMusic]
  );

  useEffect(() => {
    if (search) {
      debouncedFetch(search);
    } else {
      fetchMusic("");
    }
    return () => debouncedFetch.cancel();
  }, [search, debouncedFetch, fetchMusic]);

  return (
    <div className="flex flex-col gap-10 pb-32">
      <section className="px-4 pt-12">
        <div className="relative h-[250px] md:h-[350px] w-full max-w-7xl mx-auto rounded-[2.5rem] overflow-hidden bg-black p-8 md:p-12 text-white flex flex-col justify-end gap-3 shadow-2xl">
          <div className="absolute inset-0 bg-linear-to-tr from-black via-black/80 to-pink-500/20" />
          
          <div className="relative z-10 max-w-xl">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 mb-2 bg-white/10 w-fit px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest backdrop-blur-md border border-white/10"
            >
              <Volume2 size={12} />
              <span>Studio v1.2</span>
            </motion.div>
            <h1 className="text-3xl md:text-5xl font-black tracking-tighter leading-none mb-1">Sonic Soul.</h1>
            <p className="text-[11px] md:text-base text-gray-400 font-medium max-w-xs">Curated universe of lo-fi panda beats and experimental synth.</p>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto w-full px-4">
        <div className="relative group w-full mb-8">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search frequencies..."
            className="w-full pl-10 pr-6 py-3 rounded-xl bg-white border border-outline-variant/20 outline-none focus:ring-4 focus:ring-pink-500/5 focus:border-pink-500/30 transition-all text-[12px] font-semibold"
          />
        </div>

        <div className="flex items-center justify-between mb-6 px-2">
          <div className="flex items-center gap-2">
            <Headphones size={16} className="text-pink-500" />
            <h2 className="text-lg font-black text-on-surface tracking-tighter">Sonic Registry</h2>
          </div>
          <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">
            {tracks.length} Waves Live
          </span>
        </div>

        {loading && tracks.length === 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="aspect-square rounded-[1.5rem] bg-gray-50 animate-pulse" />
            ))}
          </div>
        ) : tracks.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {tracks.map((track, index) => (
              <motion.div
                key={track.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link href={`/apps/${track.id}`}>
                  <div className="group bg-white border border-outline-variant/10 rounded-[2rem] p-3 transition-all hover:shadow-xl hover:border-pink-500/20 hover:-translate-y-1">
                    <div className={`w-full aspect-square rounded-[1.5rem] bg-linear-to-br ${COLORS[index % COLORS.length]} flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform overflow-hidden relative`}>
                      {track.icon_url ? (
                        <img src={track.icon_url} className="w-full h-full object-cover" />
                      ) : (
                        <Music size={24} className="text-white/30" />
                      )}
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Play size={24} className="text-white fill-current" />
                      </div>
                    </div>
                    
                    <div className="px-1">
                      <h3 className="text-[13px] font-black tracking-tight text-on-surface truncate mb-0.5 group-hover:text-pink-600 transition-colors">{track.name}</h3>
                      <div className="flex items-center justify-between">
                        <span className="text-[8px] font-black uppercase tracking-widest text-pink-500/60">Audio</span>
                        <div className="flex items-center gap-0.5">
                          <Star size={8} className="fill-yellow-400 text-yellow-400" />
                          <span className="text-[8px] font-black">5.0</span>
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
             <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Studio Quiet</p>
          </div>
        )}
      </section>
    </div>
  );
}
