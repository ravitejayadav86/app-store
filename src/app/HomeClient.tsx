"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { Star, ArrowRight, Zap, Shield, Sparkles, Layout, Database, Cloud, TrendingUp, Compass, Download, Play, ChevronRight } from "lucide-react";
import React, { useEffect, useState, useRef } from "react";
import api from "@/lib/api";

interface App {
  id: number;
  name: string;
  category: string;
  icon_url?: string | null;
  developer_id?: number;
}

const CONTAINER_VARIANTS = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.05 }
  }
};

const ITEM_VARIANTS = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { type: "spring" as const, stiffness: 200, damping: 20 } 
  }
};

const BENTO_VARIANTS = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { 
    opacity: 1, 
    scale: 1, 
    transition: { type: "spring" as const, stiffness: 250, damping: 25 } 
  }
};

export default function Home({ initialApps = [] }: { initialApps?: App[] }) {
  const [apps, setApps] = useState<App[]>(initialApps);
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start start", "end start"] });
  const yBg = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);

  useEffect(() => {
    if (initialApps.length > 0) return;
    const fetchApps = async () => {
      try {
        const res = await api.get("/apps/");
        const filtered = res.data.filter((a: App) => a.category.toLowerCase() !== "music");
        setApps(filtered);
      } catch (err) {
        console.error("Failed to fetch apps", err);
      }
    };
    fetchApps();
  }, [initialApps.length]);

  const featuredApps = apps.slice(0, 3);
  const trendingApps = apps.slice(3, 9);
  const newReleases = apps.slice(9, 15);

  const categories = [
    { name: "Games", icon: <Compass size={18} />, color: "from-rose-500 to-orange-400" },
    { name: "Productivity", icon: <Layout size={18} />, color: "from-blue-500 to-cyan-400" },
    { name: "Development", icon: <Database size={18} />, color: "from-purple-500 to-indigo-400" },
    { name: "Utilities", icon: <Cloud size={18} />, color: "from-emerald-500 to-teal-400" },
  ];

  return (
    <div ref={containerRef} className="pb-32 overflow-hidden">
      
      {/* ── Immersive Hero Section ────────────────────────────────────────── */}
      <section className="relative min-h-[85vh] md:min-h-[80vh] flex items-center justify-center pt-20 pb-10 px-4 md:px-8">
        {/* Dynamic Background */}
        <motion.div style={{ y: yBg }} className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-primary/20 blur-[120px] mix-blend-screen animate-pulse" style={{ animationDuration: '8s' }} />
          <div className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-fuchsia-500/20 blur-[140px] mix-blend-screen animate-pulse" style={{ animationDuration: '12s' }} />
          <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20 mix-blend-overlay" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/50 to-background" />
        </motion.div>

        <motion.div 
          initial="hidden" 
          animate="visible" 
          variants={CONTAINER_VARIANTS}
          className="relative z-10 w-full max-w-7xl mx-auto flex flex-col items-center text-center gap-8"
        >
          <motion.div variants={ITEM_VARIANTS} className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-primary/20 shadow-[0_0_30px_rgba(0,88,187,0.15)] mb-4">
            <Sparkles size={16} className="text-fuchsia-500" />
            <span className="text-sm font-bold bg-gradient-to-r from-primary to-fuchsia-500 bg-clip-text text-transparent">Introducing PandaStore Next</span>
          </motion.div>

          <motion.h1 variants={ITEM_VARIANTS} className="text-6xl md:text-8xl font-black tracking-tighter leading-[1.05] max-w-5xl">
            Apps that push <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-br from-on-surface via-on-surface to-on-surface/50 dark:from-white dark:via-gray-200 dark:to-gray-600">boundaries.</span>
          </motion.h1>

          <motion.p variants={ITEM_VARIANTS} className="text-lg md:text-2xl text-on-surface-variant font-medium max-w-2xl mt-2 leading-relaxed">
            The premium open ecosystem for creators and visionaries. Download the tools of tomorrow, absolutely free.
          </motion.p>

          <motion.div variants={ITEM_VARIANTS} className="flex flex-wrap items-center justify-center gap-4 mt-4 w-full">
            <Link href="/discover">
              <Button size="lg" className="h-14 px-8 rounded-full text-lg font-bold shadow-2xl shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-1 transition-all">
                Explore Catalog <ArrowRight className="ml-2" size={20} />
              </Button>
            </Link>
            <Link href="/publisher">
              <Button variant="secondary" size="lg" className="h-14 px-8 rounded-full text-lg font-bold border border-outline-variant/30 hover:bg-surface-low transition-all">
                Publish an App
              </Button>
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* ── Category Pills ────────────────────────────────────────────────── */}
      <section className="px-4 md:px-8 max-w-7xl mx-auto mb-20">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          className="flex gap-3 overflow-x-auto no-scrollbar pb-4 -mx-4 px-4 md:mx-0 md:px-0"
        >
          {categories.map((cat, i) => (
            <Link key={i} href={`/discover?category=${cat.name.toLowerCase()}`}>
              <div className="flex items-center gap-2 px-6 py-4 glass rounded-2xl hover:bg-surface-low transition-all hover:scale-[1.02] active:scale-95 cursor-pointer flex-shrink-0 group">
                <div className={`p-2 rounded-xl bg-gradient-to-br ${cat.color} text-white shadow-lg`}>
                  {cat.icon}
                </div>
                <span className="font-bold text-on-surface">{cat.name}</span>
              </div>
            </Link>
          ))}
        </motion.div>
      </section>

      {/* ── Bento Box Layout (Featured) ────────────────────────────────────── */}
      {featuredApps.length >= 3 && (
        <section className="px-4 md:px-8 max-w-7xl mx-auto mb-24">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl md:text-4xl font-black flex items-center gap-3">
              <Star className="text-yellow-500 fill-yellow-500" size={32} /> Editors' Choice
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[300px]">
            {/* Main Bento Item */}
            <Link href={`/apps/${featuredApps[0].id}`} className="md:col-span-2 md:row-span-2 block group">
              <motion.div 
                variants={BENTO_VARIANTS} initial="hidden" whileInView="visible" viewport={{ once: true }}
                className="relative h-full w-full rounded-[2.5rem] overflow-hidden shadow-2xl shadow-primary/10 border border-outline-variant/10"
              >
                {featuredApps[0].icon_url ? (
                  <Image src={featuredApps[0].icon_url} alt={featuredApps[0].name} fill className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out" />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-600" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                <div className="absolute bottom-0 left-0 p-8 w-full flex flex-col items-start">
                  <div className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-white text-xs font-black uppercase tracking-widest mb-3">App of the Week</div>
                  <h3 className="text-4xl md:text-5xl font-black text-white mb-2">{featuredApps[0].name}</h3>
                  <p className="text-white/80 font-medium text-lg mb-6 max-w-md line-clamp-2">Experience the standard of next-generation application design and utility.</p>
                  <Button className="rounded-full bg-white text-black hover:bg-gray-100 px-8 h-12 font-bold">Download Now</Button>
                </div>
              </motion.div>
            </Link>

            {/* Smaller Bento Items */}
            {featuredApps.slice(1, 3).map((app, idx) => (
              <Link key={app.id} href={`/apps/${app.id}`} className="block group">
                <motion.div 
                  variants={BENTO_VARIANTS} initial="hidden" whileInView="visible" viewport={{ once: true }} transition={{ delay: idx * 0.1 }}
                  className="relative h-full w-full rounded-[2rem] overflow-hidden shadow-xl border border-outline-variant/10"
                >
                  {app.icon_url ? (
                    <Image src={app.icon_url} alt={app.name} fill className="object-cover group-hover:scale-110 transition-transform duration-700" />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 to-cyan-500" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                  <div className="absolute bottom-0 left-0 p-6 w-full">
                    <h3 className="text-2xl font-black text-white mb-1 truncate">{app.name}</h3>
                    <p className="text-white/70 font-medium text-sm">{app.category}</p>
                  </div>
                  <div className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <ArrowRight className="text-white" size={20} />
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ── Trending Strip (Horizontal Scroll) ─────────────────────────────── */}
      {trendingApps.length > 0 && (
        <section className="mb-24">
          <div className="px-4 md:px-8 max-w-7xl mx-auto flex items-end justify-between mb-8">
            <div>
              <h2 className="text-3xl font-black flex items-center gap-3">
                <TrendingUp className="text-orange-500" size={32} /> Trending
              </h2>
              <p className="text-on-surface-variant font-medium mt-1">What everyone is downloading right now</p>
            </div>
            <Link href="/discover" className="hidden md:flex items-center text-primary font-bold hover:underline">
              See All <ChevronRight size={20} />
            </Link>
          </div>

          <div className="flex overflow-x-auto gap-6 px-4 md:px-8 pb-8 no-scrollbar scroll-smooth snap-x">
            {/* Spacer for first item alignment to grid */}
            <div className="hidden md:block min-w-[calc((100vw-80rem)/2)] flex-shrink-0" />
            
            {trendingApps.map((app, i) => (
              <motion.div 
                key={app.id}
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: i * 0.05 }}
                className="w-[280px] md:w-[320px] flex-shrink-0 snap-start"
              >
                <Link href={`/apps/${app.id}`}>
                  <GlassCard className="p-5 flex flex-col h-full rounded-[2rem] hover:bg-surface-low transition-all border border-outline-variant/30 hover:border-primary/30 group shadow-lg hover:shadow-xl hover:-translate-y-1">
                    <div className="flex items-start justify-between mb-6">
                      <div className="w-20 h-20 rounded-[1.2rem] overflow-hidden bg-surface-low border border-outline-variant/20 relative shadow-inner group-hover:scale-105 transition-transform">
                        {app.icon_url ? (
                          <Image src={app.icon_url} alt={app.name} fill className="object-cover" sizes="80px" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-black text-2xl">{app.name[0]}</div>
                        )}
                      </div>
                      <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                        <Download size={18} />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold mb-1 truncate text-on-surface group-hover:text-primary transition-colors">{app.name}</h3>
                      <p className="text-sm text-on-surface-variant font-medium">{app.category}</p>
                    </div>
                  </GlassCard>
                </Link>
              </motion.div>
            ))}
            
            {/* Spacer for last item */}
            <div className="min-w-[4px] md:min-w-[calc((100vw-80rem)/2)] flex-shrink-0" />
          </div>
        </section>
      )}

      {/* ── Community Banner ──────────────────────────────────────────────── */}
      <section className="px-4 md:px-8 max-w-7xl mx-auto">
        <motion.div 
          initial="hidden" whileInView="visible" viewport={{ once: true }} variants={ITEM_VARIANTS}
          className="relative w-full rounded-[2.5rem] overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-600 p-8 md:p-16 text-center shadow-2xl flex flex-col items-center justify-center"
        >
          <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10 mix-blend-overlay" />
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
            <div className="absolute top-[-50%] left-[-10%] w-[500px] h-[500px] rounded-full bg-white/10 blur-[80px]" />
            <div className="absolute bottom-[-50%] right-[-10%] w-[400px] h-[400px] rounded-full bg-cyan-400/20 blur-[80px]" />
          </div>
          
          <div className="relative z-10 max-w-2xl mx-auto flex flex-col items-center">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-xl rounded-2xl flex items-center justify-center text-white mb-6 shadow-xl border border-white/20">
              <Compass size={32} />
            </div>
            <h2 className="text-3xl md:text-5xl font-black text-white mb-4 leading-tight">Join the Developer Ecosystem</h2>
            <p className="text-white/80 font-medium text-lg md:text-xl mb-8">
              Discuss architecture, share feedback, and connect with millions of indie creators worldwide.
            </p>
            <Link href="/community">
              <Button className="h-14 px-10 rounded-full bg-white text-indigo-600 hover:bg-gray-50 font-black text-lg shadow-xl hover:-translate-y-1 transition-all">
                Enter Community
              </Button>
            </Link>
          </div>
        </motion.div>
      </section>

    </div>
  );
}
