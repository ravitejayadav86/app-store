"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { Star, ArrowRight, Zap, Shield, Sparkles, Layout, Database, Cloud } from "lucide-react";

import React, { useEffect, useState } from "react";
import api from "@/lib/api";

interface App {
  id: number;
  name: string;
  category: string;
  icon_url?: string | null;
}

export default function Home() {
  const categories = ["Games", "Productivity", "Graphics", "Utilities", "Social", "Development"];
  const [apps, setApps] = useState<App[]>([]);

  useEffect(() => {
    const fetchApps = async () => {
      try {
        const res = await api.get("/apps/");
        setApps(res.data.slice(0, 4));
      } catch (err) {
        console.error("Failed to fetch apps", err);
      }
    };
    fetchApps();
  }, []);

  const getFallbackIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case "productivity": return <Layout className="text-blue-500" />;
      case "development": return <Database className="text-purple-500" />;
      case "utilities": return <Cloud className="text-cyan-500" />;
      case "graphics": return <Sparkles className="text-pink-500" />;
      default: return <Zap className="text-primary" />;
    }
  };

  return (
    <div className="flex flex-col gap-12 pb-24">
      {/* Hero Section */}
      <section className="px-4 md:px-8">
        <div
          className="relative h-[380px] md:h-[450px] w-full max-w-7xl mx-auto rounded-[2.5rem] overflow-hidden bg-linear-to-br from-[#0058bb] via-[#0070f3] to-[#4f46e5] p-8 md:p-12 text-on-primary flex flex-col justify-end gap-4 shadow-2xl shadow-primary/20"
        >
          {/* Decorative background elements */}
          <motion.div
            animate={{ 
              scale: [1, 1.1, 1],
              rotate: [0, 10, 0],
            }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            className="hidden md:block absolute top-0 right-0 w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-white/20 rounded-full blur-[90px] -mr-24 -mt-24"
          />
          <div className="absolute inset-0 bg-linear-to-t from-black/40 via-transparent to-transparent pointer-events-none" />

          <div className="relative z-10 max-w-2xl">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 mb-3 bg-white/20 w-fit px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest backdrop-blur-xl border border-white/30"
            >
              <Sparkles size={12} />
              <span>New Release</span>
            </motion.div>
            <h1 className="hero-text font-black tracking-tight mb-3 text-white drop-shadow-sm">
              The Future of <br/> Discovery.
            </h1>
            <p className="text-sm md:text-lg text-white/90 mb-6 leading-relaxed max-w-sm font-medium">
              Explore a curated world of premium apps, games, and creative tools.
            </p>
            <div className="flex flex-row gap-3">
              <Button size="lg" className="bg-white text-primary px-8 rounded-2xl font-bold shadow-lg active:scale-95 transition-all">Get Started</Button>
              <Button variant="secondary" size="lg" className="bg-white/10 text-white border-white/30 backdrop-blur-md px-8 rounded-2xl font-bold active:scale-95 transition-all">Explore</Button>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Chips */}
      <section className="px-4 md:px-8 overflow-x-auto no-scrollbar py-2">
        <div className="flex gap-2.5 max-w-7xl mx-auto">
          {categories.map((cat, i) => (
            <motion.button
              key={cat}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 + i * 0.05, type: "spring", damping: 20 }}
              className="px-6 py-2 liquid-glass text-xs font-bold hover:text-primary transition-all whitespace-nowrap"
            >
              {cat}
            </motion.button>
          ))}
        </div>
      </section>

      {/* Featured Collections */}
      <section className="px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-end mb-6">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-on-surface mb-1 flex items-center gap-2">
                <Sparkles className="text-primary" size={24} />
                Essential Toolkit
              </h2>
              <p className="text-on-surface-variant text-sm font-medium">Selected by our curators.</p>
            </div>
            <Link href="/categories" className="text-primary text-sm font-bold flex items-center gap-1 group">
              Browse All <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {apps.map((app, index) => (
              <motion.div
                key={app.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 + index * 0.1 }}
              >
                <Link href={`/apps/${app.id}`}>
                  <GlassCard className="flex flex-col gap-4 h-full transition-all group p-4 md:p-6 transform-gpu will-change-transform border-white/60">
                    <div className="w-12 h-12 md:w-16 md:h-16 rounded-2xl liquid-glass flex items-center justify-center text-xl shadow-md overflow-hidden text-primary relative">
                      {app.icon_url ? (
                        <Image 
                          src={app.icon_url} 
                          alt={app.name} 
                          fill 
                          className="object-cover"
                          sizes="(max-width: 768px) 48px, 64px"
                        />
                      ) : (
                        getFallbackIcon(app.category)
                      )}
                    </div>
                    <div>
                      <h3 className="text-sm md:text-lg font-bold mb-1 group-hover:text-primary transition-colors truncate">{app.name}</h3>
                      <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[8px] md:text-[10px] font-bold uppercase tracking-wider">{app.category}</span>
                    </div>
                    <div className="flex items-center justify-between mt-auto pt-2">
                      <div className="flex items-center gap-1 text-[8px] font-bold text-primary">
                        <span className="bg-primary/10 px-1.5 py-0.5 rounded uppercase">Live</span>
                      </div>
                      <Button size="xs" className="h-7 px-4 text-[10px]" aria-label={`Get ${app.name}`}>Get</Button>
                    </div>
                  </GlassCard>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
