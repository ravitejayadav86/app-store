"use client";
import React, { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { Compass, TrendingUp, Star, Flame, Loader2, Search, ArrowRight, Sparkles, Globe, Zap } from "lucide-react";
import api from "@/lib/api";
import Link from "next/link";
import debounce from "lodash/debounce";

interface App {
  id: number;
  name: string;
  category: string;
  developer: string;
  price: number;
  created_at: string;
  file_path?: string | null;
  icon_url?: string | null;
}

export default function DiscoverPage() {
  const [apps, setApps] = useState<App[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchApps = useCallback(async (q: string) => {
    setLoading(true);
    try {
      const res = await api.get("/apps/", { params: { q } });
      setApps(res.data);
    } catch (error) {
      console.error("Failed to fetch apps:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const debouncedFetch = useCallback(
    debounce((q: string) => fetchApps(q), 500),
    [fetchApps]
  );

  useEffect(() => {
    if (search) {
      debouncedFetch(search);
    } else {
      fetchApps("");
    }
    return () => debouncedFetch.cancel();
  }, [search, debouncedFetch, fetchApps]);

  // Sort apps for trending/rising stars
  const trending = [...apps].sort((a, b) => b.id - a.id).slice(0, 4);
  const risingStars = [...apps].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(4, 8);

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case "games": return "bg-orange-500/10 text-orange-500";
      case "productivity": return "bg-blue-500/10 text-blue-500";
      case "graphics": return "bg-pink-500/10 text-pink-500";
      case "development": return "bg-purple-500/10 text-purple-500";
      case "music": return "bg-rose-500/10 text-rose-500";
      case "books": return "bg-indigo-500/10 text-indigo-500";
      default: return "bg-emerald-500/10 text-emerald-500";
    }
  };

  return (
    <div className="flex flex-col gap-12 pb-32 selection:bg-primary/10">
      {/* Immersive Discover Hero */}
      <section className="px-4 pt-24">
        <div className="relative h-[400px] md:h-[500px] w-full max-w-7xl mx-auto rounded-[3rem] overflow-hidden bg-linear-to-br from-gray-900 via-gray-800 to-black p-8 md:p-16 text-white flex flex-col justify-end gap-6 shadow-2xl">
          {/* Dynamic Background */}
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20" />
          <motion.div
            animate={{ 
              scale: [1, 1.1, 1],
              opacity: [0.3, 0.5, 0.3] 
            }}
            transition={{ duration: 10, repeat: Infinity }}
            className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] -mr-40 -mt-40"
          />
          
          <div className="relative z-10 max-w-2xl">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2 mb-6 bg-white/10 w-fit px-4 py-1.5 rounded-full text-xs font-black backdrop-blur-xl border border-white/20"
            >
              <Globe size={14} className="text-primary" />
              <span className="uppercase tracking-[0.2em]">Global Discovery</span>
            </motion.div>
            <h1 className="text-5xl md:text-8xl font-black tracking-tighter mb-6 leading-[0.85]">Find Your Nexus.</h1>
            <p className="text-sm md:text-xl text-gray-400 mb-10 leading-relaxed font-medium max-w-lg">
              The world's first decentralized panda-powered app ecosystem. Built by creators, for the community.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button size="lg" className="rounded-full px-10 font-black shadow-xl shadow-primary/20">
                Explore All
              </Button>
              <Button size="lg" variant="secondary" className="rounded-full px-10 font-black bg-white/5 border-white/10 hover:bg-white/10 text-white backdrop-blur-md">
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Global Search */}
      <section className="max-w-7xl mx-auto w-full px-4">
        <div className="relative group w-full">
          <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-primary transition-colors">
            <Search size={22} />
          </div>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search the entire PandaStore ecosystem..."
            className="w-full pl-16 pr-6 py-5 rounded-[2rem] bg-white border border-outline-variant/30 outline-none focus:ring-8 focus:ring-primary/5 focus:border-primary/30 transition-all text-base font-bold shadow-xs"
          />
          {loading && (
             <div className="absolute right-6 top-1/2 -translate-y-1/2">
                <Loader2 className="animate-spin text-primary" size={24} />
             </div>
          )}
        </div>
      </section>

      {apps.length > 0 ? (
        <>
          {/* Trending Section */}
          <section className="max-w-7xl mx-auto px-4 w-full">
            <div className="flex items-center justify-between mb-8 px-2">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-[1.25rem] bg-linear-to-br from-orange-400 to-red-500 flex items-center justify-center text-white shadow-lg shadow-orange-500/20">
                  <Flame size={24} />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-on-surface tracking-tight leading-none">Trending Now</h2>
                  <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant opacity-40 mt-1">Most popular this week</p>
                </div>
              </div>
              <button className="text-xs font-black text-primary flex items-center gap-1 hover:gap-2 transition-all">
                VIEW ALL <ArrowRight size={14} />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {trending.map((app, index) => (
                <motion.div 
                  key={app.id} 
                  initial={{ opacity: 0, y: 20 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  transition={{ delay: index * 0.05 }}
                >
                  <Link href={`/apps/${app.id}`}>
                    <div className="group bg-white border border-outline-variant/10 rounded-[2.5rem] p-6 hover:border-primary/20 transition-all hover:-translate-y-2 hover:shadow-2xl hover:shadow-primary/5 flex flex-col gap-6 h-full relative overflow-hidden">
                      <div className={`w-20 h-20 rounded-[1.5rem] ${getCategoryColor(app.category)} flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform overflow-hidden relative`}>
                        {app.icon_url ? (
                          <img src={app.icon_url} alt={app.name} className="w-full h-full object-cover" />
                        ) : (
                          <Star size={32} />
                        )}
                        <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      
                      <div>
                        <h3 className="text-xl font-black mb-1 truncate group-hover:text-primary transition-colors tracking-tight">{app.name}</h3>
                        <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant opacity-60">{app.category}</p>
                      </div>

                      <div className="flex items-center justify-between mt-auto pt-4 border-t border-outline-variant/5">
                        <div className="flex flex-col gap-0.5">
                          <span className={`text-[10px] font-black px-3 py-1 rounded-full ${app.price === 0 ? "bg-green-500/10 text-green-500" : "bg-primary/10 text-primary"}`}>
                            {app.price === 0 ? "FREE" : `$${app.price}`}
                          </span>
                        </div>
                        <Button size="xs" variant="secondary" className="rounded-full px-5 font-black text-[10px] uppercase">
                          GET
                        </Button>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </section>

          {/* Rising Stars Section */}
          {risingStars.length > 0 && (
            <section className="max-w-7xl mx-auto px-4 w-full">
              <div className="flex items-center justify-between mb-8 px-2">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-[1.25rem] bg-linear-to-br from-blue-400 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
                    <TrendingUp size={24} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-on-surface tracking-tight leading-none">Rising Stars</h2>
                    <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant opacity-40 mt-1">Gaining traction fast</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {risingStars.map((app, index) => (
                  <motion.div 
                    key={app.id} 
                    initial={{ opacity: 0, y: 20 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    transition={{ delay: 0.2 + index * 0.05 }}
                  >
                    <Link href={`/apps/${app.id}`}>
                      <div className="group bg-surface-low/30 border border-outline-variant/10 rounded-[2.5rem] p-6 hover:border-primary/20 transition-all hover:-translate-y-2 hover:shadow-2xl hover:shadow-primary/5 flex flex-col gap-6 h-full relative overflow-hidden backdrop-blur-sm">
                        <div className={`w-20 h-20 rounded-[1.5rem] ${getCategoryColor(app.category)} flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform overflow-hidden`}>
                           {app.icon_url ? (
                             <img src={app.icon_url} className="w-full h-full object-cover" />
                           ) : (
                             <TrendingUp size={32} />
                           )}
                        </div>
                        <div>
                          <h3 className="text-xl font-black mb-1 truncate group-hover:text-primary transition-colors tracking-tight">{app.name}</h3>
                          <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant opacity-60">{app.category}</p>
                        </div>
                        <div className="flex items-center justify-between mt-auto">
                          <div className="flex items-center gap-1">
                             <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                             <span className="text-[10px] font-black text-blue-500 uppercase">EXPLOSIVE</span>
                          </div>
                          <Button size="xs" variant="tertiary" className="rounded-full px-5 font-black text-[10px] uppercase border-none bg-white">
                            Details
                          </Button>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </section>
          )}
        </>
      ) : (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="max-w-7xl mx-auto px-4 w-full py-32 text-center"
        >
           <div className="w-24 h-24 rounded-[3rem] bg-surface-low flex items-center justify-center mx-auto mb-8 shadow-inner">
              <Zap size={40} className="text-gray-300" />
           </div>
           <h3 className="text-2xl font-black text-on-surface mb-4">A Quiet Galaxy</h3>
           <p className="text-on-surface-variant text-base max-w-sm mx-auto mb-10 leading-relaxed font-medium">Our community is still growing. Be the pioneer who launches the next big thing in the PandaStore ecosystem.</p>
           <Link href="/publisher/upload">
             <Button size="lg" className="rounded-full px-12 font-black shadow-2xl shadow-primary/30">Start Publishing</Button>
           </Link>
        </motion.div>
      )}
    </div>
  );
}
