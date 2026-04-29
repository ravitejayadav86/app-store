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

const CONTAINER_VARIANTS = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 }
  }
} as const;

const ITEM_VARIANTS = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { type: "spring", stiffness: 300, damping: 25 } as const
  }
} as const;

interface Props {
  initialApps?: App[];
}

export default function Home({ initialApps = [] }: Props) {
  const categories = ["Games", "Productivity", "Graphics", "Utilities", "Social", "Development"];
  const [apps, setApps] = useState<App[]>(initialApps);

  useEffect(() => {
    if (initialApps.length > 0) return;
    const fetchApps = async () => {
      try {
        const res = await api.get("/apps/");
        setApps(res.data.slice(0, 8)); // Fetch more apps for the redesign
      } catch (err) {
        console.error("Failed to fetch apps", err);
      }
    };
    fetchApps();
  }, [initialApps.length]);

  const getFallbackIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case "productivity": return <Layout className="text-blue-500" />;
      case "development": return <Database className="text-purple-500" />;
      case "utilities": return <Cloud className="text-cyan-500" />;
      case "graphics": return <Sparkles className="text-pink-500" />;
      default: return <Zap className="text-primary" />;
    }
  };

  const featuredApp = apps.length > 0 ? apps[0] : null;
  const topApps = apps.slice(1);

  return (
    <motion.div 
      initial="hidden" 
      animate="visible" 
      variants={CONTAINER_VARIANTS}
      className="flex flex-col gap-10 md:gap-14 pb-24 pt-2 md:pt-0"
    >
      {/* Premium Hero Section */}
      <motion.section variants={ITEM_VARIANTS} className="px-3 md:px-8">
        <div className="relative h-[400px] md:h-[500px] w-full max-w-7xl mx-auto rounded-[2rem] md:rounded-[3rem] overflow-hidden bg-gradient-to-br from-violet-600 via-fuchsia-600 to-orange-500 p-6 md:p-14 text-white flex flex-col justify-end gap-4 shadow-2xl shadow-fuchsia-500/20">
          
          {/* Abstract Floating Shapes for Premium Feel */}
          <motion.div animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }} transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }} className="absolute top-[-10%] right-[-5%] w-64 h-64 md:w-96 md:h-96 bg-white/20 rounded-full blur-[60px]" />
          <motion.div animate={{ x: [0, 30, 0], scale: [1, 1.1, 1] }} transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }} className="absolute bottom-[-20%] left-[-10%] w-72 h-72 bg-orange-400/30 rounded-full blur-[80px]" />
          
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent pointer-events-none" />

          <div className="relative z-10 max-w-2xl">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-1.5 mb-4 bg-white/20 w-fit px-3 py-1.5 rounded-full text-[10px] md:text-xs font-black uppercase tracking-widest backdrop-blur-xl border border-white/30 shadow-lg"
            >
              <Sparkles size={14} className="text-yellow-300" />
              <span className="text-white drop-shadow-md">PandaStore Exclusives</span>
            </motion.div>
            <h1 className="text-4xl md:text-7xl font-black tracking-tight mb-3 md:mb-4 text-white drop-shadow-lg leading-[1.1]">
              Redefining <br/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-orange-200">Discovery.</span>
            </h1>
            <p className="text-sm md:text-xl text-white/90 mb-6 md:mb-8 leading-relaxed max-w-sm md:max-w-md font-medium drop-shadow">
              Experience a meticulously curated world of high-fidelity applications, immersive games, and creative tools.
            </p>
            <div className="flex flex-row gap-3">
              <Link href="/explore">
                <Button size="lg" className="bg-white text-fuchsia-600 hover:bg-gray-100 px-6 md:px-8 rounded-2xl font-black shadow-xl active:scale-95 transition-all text-sm md:text-base">Start Exploring</Button>
              </Link>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Modern Glass Categories */}
      <motion.section variants={ITEM_VARIANTS} className="px-4 md:px-8 overflow-x-auto no-scrollbar">
        <div className="flex gap-3 max-w-7xl mx-auto pb-4">
          {categories.map((cat) => (
            <Link key={cat} href={`/discover?category=${cat.toLowerCase()}`}>
              <motion.div
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-3 bg-surface-low border border-outline-variant/30 rounded-2xl text-xs md:text-sm font-black text-on-surface hover:text-primary hover:border-primary/30 hover:shadow-lg transition-all whitespace-nowrap cursor-pointer shadow-sm"
              >
                {cat}
              </motion.div>
            </Link>
          ))}
        </div>
      </motion.section>

      <div className="px-4 md:px-8 max-w-7xl mx-auto w-full flex flex-col lg:flex-row gap-6 md:gap-8">
        {/* Massive App of the Day Highlight */}
        {featuredApp && (
          <motion.section variants={ITEM_VARIANTS} className="w-full lg:w-1/3 flex-shrink-0">
            <h2 className="text-xl md:text-2xl font-black text-on-surface mb-4 flex items-center gap-2">
              <Star className="text-yellow-500 fill-yellow-500" size={20} />
              App of the Day
            </h2>
            <Link href={`/apps/${featuredApp.id}`}>
              <div className="relative h-[300px] md:h-[400px] rounded-[2rem] overflow-hidden group cursor-pointer shadow-xl shadow-primary/10">
                {featuredApp.icon_url ? (
                  <Image src={featuredApp.icon_url} alt={featuredApp.name} fill className="object-cover group-hover:scale-110 transition-transform duration-700 ease-in-out" />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-primary to-purple-600" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                <div className="absolute bottom-0 left-0 p-6 w-full">
                  <span className="text-white/80 text-[10px] font-black uppercase tracking-widest mb-1 block">Featured</span>
                  <h3 className="text-2xl md:text-3xl font-black text-white mb-1 truncate">{featuredApp.name}</h3>
                  <p className="text-white/60 text-sm font-medium mb-4">{featuredApp.category}</p>
                  <Button className="w-full bg-white/20 backdrop-blur-md text-white hover:bg-white/30 border border-white/20 font-bold rounded-xl">Get Now</Button>
                </div>
              </div>
            </Link>
          </motion.section>
        )}

        {/* Sleek List of Top Apps */}
        <motion.section variants={ITEM_VARIANTS} className="w-full lg:w-2/3 flex flex-col">
          <div className="flex justify-between items-end mb-4">
            <h2 className="text-xl md:text-2xl font-black text-on-surface flex items-center gap-2">
              <Zap className="text-orange-500 fill-orange-500" size={20} />
              Trending Now
            </h2>
            <Link href="/categories" className="text-primary text-sm font-bold flex items-center gap-1 group">
              See All <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 flex-1">
            {topApps.map((app) => (
              <Link key={app.id} href={`/apps/${app.id}`}>
                <GlassCard className="flex items-center gap-4 h-full transition-all group p-3 md:p-4 hover:bg-surface-low border border-outline-variant/20 hover:border-primary/20 shadow-sm hover:shadow-md cursor-pointer rounded-2xl">
                  <div className="w-14 h-14 md:w-16 md:h-16 rounded-[1rem] bg-surface-low flex items-center justify-center text-xl shadow-sm overflow-hidden text-primary relative flex-shrink-0 group-hover:scale-105 transition-transform">
                    {app.icon_url ? (
                      <Image src={app.icon_url} alt={app.name} fill className="object-cover" sizes="64px" />
                    ) : (
                      getFallbackIcon(app.category)
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm md:text-base font-bold mb-0.5 group-hover:text-primary transition-colors truncate text-on-surface">{app.name}</h3>
                    <p className="text-xs text-on-surface-variant font-medium truncate">{app.category}</p>
                  </div>
                  <Button size="sm" variant="secondary" className="h-8 px-4 text-xs font-bold rounded-full bg-primary/10 text-primary hover:bg-primary/20 border-0">Get</Button>
                </GlassCard>
              </Link>
            ))}
          </div>
        </motion.section>
      </div>
    </motion.div>
  );
}
