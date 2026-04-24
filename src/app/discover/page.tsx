"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { Compass, TrendingUp, Star, Flame, Loader2 } from "lucide-react";
import api from "@/lib/api";
import Link from "next/link";

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

  useEffect(() => {
    const fetchApps = async () => {
      try {
        const res = await api.get("/apps/");
        setApps(res.data);
      } catch (error) {
        console.error("Failed to fetch apps:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchApps();
  }, []);

  // Sort apps for trending/rising stars
  const trending = [...apps].sort((a, b) => b.id - a.id).slice(0, 4);
  const risingStars = [...apps].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(4, 8);

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case "games": return "bg-orange-500";
      case "productivity": return "bg-blue-500";
      case "graphics": return "bg-pink-500";
      case "development": return "bg-purple-500";
      default: return "bg-emerald-500";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-surface">
        <Loader2 className="animate-spin text-primary mb-4" size={48} />
        <p className="text-on-surface-variant">Exploring Nexus...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-12 pb-24">
      <section className="px-4 md:px-8">
        <div className="relative h-[400px] md:h-[600px] w-full max-w-7xl mx-auto rounded-[2.5rem] overflow-hidden bg-linear-to-br from-[#1a1c1e] via-[#2d2e33] to-[#1a1c1e] p-8 md:p-12 text-on-primary flex flex-col justify-end gap-4 shadow-2xl">
          {/* Animated background pulse */}
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 8, repeat: Infinity }}
            className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/20 rounded-full blur-[100px] -mr-32 -mt-32"
          />
          <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

          <div className="relative z-10 max-w-2xl">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 mb-3 bg-white/10 w-fit px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest backdrop-blur-xl border border-white/20"
            >
              <Compass size={12} />
              <span>Explore Nexus</span>
            </motion.div>
            <h1 className="hero-text font-black tracking-tight mb-3 text-white">Find Your <br/> Next App.</h1>
            <p className="text-sm md:text-xl text-white/80 mb-6 leading-relaxed max-w-sm font-medium">
              Explore thousands of apps built by our community of developers.
            </p>
            <div className="flex flex-row gap-3">
              <Button size="lg" className="bg-primary text-on-primary px-8 rounded-2xl font-bold shadow-lg shadow-primary/20">All Categories</Button>
            </div>
          </div>
        </div>
      </section>

      {apps.length > 0 ? (
        <>
          <section className="max-w-7xl mx-auto px-4 md:px-8 w-full">
            <div className="flex items-center gap-3 mb-8">
              <Flame className="text-primary" />
              <h2 className="text-3xl font-bold text-on-surface">Trending Now</h2>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {trending.map((app, index) => (
                <motion.div 
                  key={app.id} 
                  initial={{ opacity: 0, y: 20 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  transition={{ delay: 0.3 + index * 0.08 }}
                >
                  <Link href={`/apps/${app.id}`}>
                    <GlassCard className="flex flex-col gap-4 md:gap-6 h-full hover:bg-surface-low transition-colors group p-4 md:p-6">
                      <div className={`w-12 h-12 md:w-16 md:h-16 rounded-2xl ${getCategoryColor(app.category)} flex items-center justify-center shadow-inner text-white group-hover:scale-110 transition-transform overflow-hidden`}>
                        {app.icon_url ? (
                          <img src={app.icon_url} alt={app.name} className="w-full h-full object-cover" />
                        ) : (
                          <Star size={24} className="md:w-7 md:h-7" />
                        )}
                      </div>
                      <div>
                        <h3 className="text-sm md:text-xl font-bold mb-1 truncate group-hover:text-primary transition-colors">{app.name}</h3>
                        <p className="text-[10px] md:text-sm text-on-surface-variant">{app.category}</p>
                      </div>
                      <div className="flex flex-col md:flex-row md:items-center justify-between mt-auto gap-2">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-[8px] md:text-xs font-semibold bg-primary/10 text-primary px-2 py-0.5 rounded uppercase w-fit">
                            {app.price === 0 ? "Free" : `$${app.price}`}
                          </span>
                        </div>
                        <Button size="xs" variant={app.file_path ? "primary" : "secondary"} className="w-full md:w-auto h-7">
                          {app.file_path ? "Get" : "View"}
                        </Button>
                      </div>
                    </GlassCard>
                  </Link>
                </motion.div>
              ))}
            </div>
          </section>

          {risingStars.length > 0 && (
            <section className="max-w-7xl mx-auto px-4 md:px-8 w-full">
              <div className="flex items-center gap-3 mb-8">
                <TrendingUp className="text-primary" />
                <h2 className="text-2xl md:text-3xl font-bold text-on-surface">Rising Stars</h2>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                {risingStars.map((app, index) => (
                  <motion.div 
                    key={app.id} 
                    initial={{ opacity: 0, y: 20 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    transition={{ delay: 0.5 + index * 0.08 }}
                  >
                    <Link href={`/apps/${app.id}`}>
                      <GlassCard className="flex flex-col gap-4 md:gap-6 h-full hover:bg-surface-low transition-colors group p-4 md:p-6">
                        <div className={`w-12 h-12 md:w-16 md:h-16 rounded-2xl ${getCategoryColor(app.category)} flex items-center justify-center shadow-inner text-white opacity-80 backdrop-grayscale-[0.5] group-hover:scale-110 transition-transform`}>
                          <TrendingUp size={24} className="md:w-7 md:h-7" />
                        </div>
                        <div>
                          <h3 className="text-sm md:text-xl font-bold mb-1 truncate group-hover:text-primary transition-colors">{app.name}</h3>
                          <p className="text-[10px] md:text-sm text-on-surface-variant">{app.category}</p>
                        </div>
                        <div className="flex flex-col md:flex-row md:items-center justify-between mt-auto gap-2">
                          <div className="flex flex-col gap-0.5">
                             <span className="text-[8px] md:text-xs font-semibold bg-primary/10 text-primary px-2 py-0.5 rounded uppercase w-fit">NEW</span>
                          </div>
                          <Button size="xs" variant={app.file_path ? "primary" : "secondary"} className="w-full md:w-auto h-7">
                            {app.file_path ? "Get" : "View"}
                          </Button>
                        </div>
                      </GlassCard>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </section>
          )}
        </>
      ) : (
        <div className="max-w-7xl mx-auto px-8 w-full py-20 text-center bg-surface-low rounded-3xl border border-dashed border-outline-variant">
           <p className="text-on-surface-variant text-lg">Our community is still growing. Be the first to publish an app!</p>
           <Link href="/publisher/upload">
             <Button className="mt-6" size="lg">Publish App</Button>
           </Link>
        </div>
      )}
    </div>
  );
}
