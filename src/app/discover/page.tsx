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
    <div className="flex flex-col gap-20 pb-20">
      <section className="px-4 md:px-8">
        <div className="relative h-[600px] w-full max-w-7xl mx-auto rounded-3xl overflow-hidden bg-linear-to-br from-primary to-primary-dim p-12 text-on-primary flex flex-col justify-end gap-6 shadow-2xl">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }} 
            animate={{ scale: 1, opacity: 1 }} 
            transition={{ duration: 1.5, ease: "easeOut" }} 
            className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/10 rounded-full blur-[100px] -mr-40 -mt-40" 
          />
          <div className="relative z-10 max-w-2xl">
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="flex items-center gap-2 mb-4 bg-white/10 w-fit px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-md border border-white/20"
            >
              <Compass size={14} />
              <span>Real-time Discovery</span>
            </motion.div>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-4 text-white">Find Your Next Favorite.</h1>
            <p className="text-lg md:text-xl text-on-primary/80 mb-2">Authenticated apps trending right now across our developer community.</p>
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {trending.map((app, index) => (
                <motion.div 
                  key={app.id} 
                  initial={{ opacity: 0, y: 20 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  transition={{ delay: 0.3 + index * 0.08 }}
                >
                  <Link href={`/apps/${app.id}`}>
                    <GlassCard className="flex flex-col gap-6 h-full hover:bg-surface-low transition-colors group">
                      <div className={`w-16 h-16 rounded-2xl ${getCategoryColor(app.category)} flex items-center justify-center shadow-inner text-white group-hover:scale-110 transition-transform overflow-hidden`}>
                        {app.icon_url ? (
                          <img src={app.icon_url} alt={app.name} className="w-full h-full object-cover" />
                        ) : (
                          <Star size={28} />
                        )}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold mb-1 truncate group-hover:text-primary transition-colors">{app.name}</h3>
                        <p className="text-sm text-on-surface-variant">{app.category}</p>
                      </div>
                      <div className="flex items-center justify-between mt-auto">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-xs font-semibold bg-primary/10 text-primary px-2 py-0.5 rounded uppercase">
                            {app.price === 0 ? "Free" : `$${app.price}`}
                          </span>
                          {!app.file_path && (
                            <span className="text-[9px] font-bold text-on-surface-variant/40 uppercase tracking-tighter">Unavailable</span>
                          )}
                        </div>
                        <Button size="sm" variant={app.file_path ? "primary" : "secondary"}>
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
                <h2 className="text-3xl font-bold text-on-surface">Rising Stars</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {risingStars.map((app, index) => (
                  <motion.div 
                    key={app.id} 
                    initial={{ opacity: 0, y: 20 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    transition={{ delay: 0.5 + index * 0.08 }}
                  >
                    <Link href={`/apps/${app.id}`}>
                      <GlassCard className="flex flex-col gap-6 h-full hover:bg-surface-low transition-colors group">
                        <div className={`w-16 h-16 rounded-2xl ${getCategoryColor(app.category)} flex items-center justify-center shadow-inner text-white opacity-80 backdrop-grayscale-[0.5] group-hover:scale-110 transition-transform`}>
                          <TrendingUp size={28} />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold mb-1 truncate group-hover:text-primary transition-colors">{app.name}</h3>
                          <p className="text-sm text-on-surface-variant">{app.category}</p>
                        </div>
                        <div className="flex items-center justify-between mt-auto">
                          <div className="flex flex-col gap-0.5">
                             <span className="text-xs font-semibold bg-primary/10 text-primary px-2 py-0.5 rounded uppercase">NEW</span>
                             {!app.file_path && (
                               <span className="text-[9px] font-bold text-on-surface-variant/40 uppercase tracking-tighter">Unavailable</span>
                             )}
                          </div>
                          <Button size="sm" variant={app.file_path ? "primary" : "secondary"}>
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
