"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { Star, ArrowRight, Zap, Shield, Sparkles, Layout, Database, Cloud, Boxes, Plus } from "lucide-react";

import React, { useEffect, useState } from "react";
import api from "@/lib/api";

interface App {
  id: number;
  name: string;
  category: string;
  icon_url?: string | null;
}

export default function Home() {
  const categories = ["Games", "Apps", "Dev", "Utility", "Nexus"];
  const [apps, setApps] = useState<App[]>([]);

  useEffect(() => {
    const fetchApps = async () => {
      try {
        const res = await api.get("/apps/");
        setApps(res.data.slice(0, 8));
      } catch (err) {
        console.error("Failed to fetch apps", err);
      }
    };
    fetchApps();
  }, []);

  const getFallbackIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case "productivity": return <Layout size={20} className="text-blue-500" />;
      case "development": return <Database size={20} className="text-purple-500" />;
      case "utilities": return <Cloud size={20} className="text-cyan-500" />;
      case "graphics": return <Sparkles size={20} className="text-pink-500" />;
      default: return <Zap size={20} className="text-primary" />;
    }
  };

  return (
    <div className="flex flex-col gap-10 pb-20 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-[-5%] right-[-5%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Compressed Hero Section */}
      <section className="px-4 md:px-8">
        <div
          className="relative h-[280px] md:h-[350px] w-full max-w-7xl mx-auto rounded-[2.5rem] overflow-hidden bg-black p-8 md:p-12 text-white flex flex-col justify-end gap-3 shadow-2xl shadow-black/20"
        >
          <div className="absolute inset-0 bg-linear-to-tr from-black via-black/80 to-primary/20" />
          
          <div className="relative z-10 max-w-xl">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 mb-3 bg-white/10 w-fit px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest backdrop-blur-md border border-white/10"
            >
              <Zap size={12} fill="currentColor" />
              <span>Nexus Standard</span>
            </motion.div>
            <h1 className="text-3xl md:text-5xl font-black tracking-tighter leading-none mb-3">Sync Innovation.</h1>
            <p className="text-[11px] md:text-base text-gray-400 mb-6 font-medium max-w-sm">
              Discover the next generation of digital assets for your professional lattice.
            </p>
            <div className="flex flex-row gap-3">
              <Button size="sm" className="rounded-full px-8 py-6 font-black uppercase tracking-widest text-[10px] bg-primary hover:bg-primary-dim shadow-xl shadow-primary/20 transition-all active:scale-95">Discover</Button>
              <Button variant="secondary" size="sm" className="rounded-full px-8 py-6 font-black uppercase tracking-widest text-[10px] bg-white/5 border-white/10 hover:bg-white/10 transition-all active:scale-95">Library</Button>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Chips - Small & Clear */}
      <section className="px-4 md:px-8 overflow-x-auto no-scrollbar">
        <div className="flex gap-2 max-w-7xl mx-auto">
          {categories.map((cat, i) => (
            <motion.button
              key={cat}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 + i * 0.05 }}
              className="px-6 py-2.5 rounded-full bg-white border border-outline-variant/10 text-[10px] font-black uppercase tracking-[0.2em] hover:text-primary hover:border-primary/30 transition-all shadow-sm active:scale-90"
            >
              {cat}
            </motion.button>
          ))}
        </div>
      </section>

      {/* Featured Collections - Compressed Grid */}
      <section className="px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-6 px-2">
            <div>
              <h2 className="text-xl font-black text-on-surface tracking-tighter flex items-center gap-2">
                <Boxes className="text-primary" size={20} strokeWidth={3} />
                Neural Assets
              </h2>
            </div>
            <Link href="/categories" className="text-[10px] font-black uppercase tracking-widest text-primary hover:opacity-70 transition-all flex items-center gap-1">
              View All <ArrowRight size={14} strokeWidth={3} />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {apps.map((app, index) => (
              <motion.div
                key={app.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link href={`/apps/${app.id}`}>
                  <div className="group bg-white border border-outline-variant/10 rounded-[2rem] p-3 transition-all hover:shadow-xl hover:border-primary/20 hover:-translate-y-1">
                    <div className="aspect-square w-full rounded-[1.5rem] bg-surface-low flex items-center justify-center shadow-inner overflow-hidden mb-3 group-hover:scale-105 transition-transform duration-500">
                      {app.icon_url ? (
                        <img src={app.icon_url} alt={app.name} className="w-full h-full object-cover" />
                      ) : (
                        getFallbackIcon(app.category)
                      )}
                    </div>
                    <div className="px-1">
                      <h3 className="text-[13px] font-black tracking-tight text-on-surface truncate mb-0.5 group-hover:text-primary transition-colors">{app.name}</h3>
                      <div className="flex items-center justify-between">
                        <span className="text-[8px] font-black uppercase tracking-widest text-gray-400">{app.category}</span>
                        <div className="w-6 h-6 rounded-lg bg-primary/5 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                          <Plus size={12} strokeWidth={4} />
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Premium Banner - Smaller */}
      <section className="px-4 md:px-8 mb-10">
        <motion.div
          className="max-w-7xl mx-auto bg-black rounded-[2.5rem] p-10 relative overflow-hidden flex flex-col items-center text-center gap-4 shadow-2xl shadow-black/10"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-[80px] -mr-32 -mt-32" />
          <div className="relative z-10 space-y-4">
             <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-primary mx-auto">
                <Sparkles size={24} fill="currentColor" />
             </div>
             <h2 className="text-2xl md:text-4xl font-black text-white tracking-tighter leading-none">Upgrade Protocol.</h2>
             <p className="max-w-xs text-[11px] text-gray-400 font-medium uppercase tracking-[0.1em] mx-auto leading-relaxed">
               Unlock premium nodes, faster sync, and exclusive deployment access.
             </p>
             <Button size="sm" className="rounded-full px-10 py-6 font-black uppercase tracking-widest text-[10px] bg-white text-black hover:bg-gray-100 mt-4 transition-all active:scale-95">Upgrade</Button>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
