"use client";

import Link from "next/link";
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
    <div className="flex flex-col gap-20 pb-20">
      {/* Hero Section */}
      <section className="px-4 md:px-8">
        <div
          className="relative h-[350px] md:h-[400px] w-full max-w-7xl mx-auto rounded-3xl overflow-hidden bg-linear-to-br from-primary to-primary-dim p-6 md:p-10 text-on-primary flex flex-col justify-end gap-3 md:gap-4 shadow-xl"
        >
          {/* Decorative background elements */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="absolute top-0 right-0 w-[250px] md:w-[400px] h-[250px] md:h-[400px] bg-white/10 rounded-full blur-[80px] md:blur-[100px] -mr-20 md:-mr-40 -mt-20 md:-mt-40"
          />
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
            className="absolute bottom-0 left-0 w-[150px] md:w-[250px] h-[150px] md:h-[250px] bg-white/5 rounded-full blur-[60px] md:blur-[80px] -ml-10 md:-ml-20 -mb-10 md:-mb-20"
          />

          <div className="relative z-10 max-w-2xl">
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="flex items-center gap-2 mb-2 md:mb-3 bg-white/10 w-fit px-2.5 py-1 rounded-full text-[10px] md:text-xs font-semibold backdrop-blur-md border border-white/20"
            >
              <Star size={12} className="fill-current" />
              <span>Editors&apos; Choice</span>
            </motion.div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-2 md:mb-4">Create Without Boundaries.</h1>
            <p className="text-xs md:text-lg text-on-primary/80 mb-4 md:mb-6 leading-snug">
              Explore a curated selection of tools designed to elevate your professional workflow.
            </p>
            <div className="flex flex-row gap-2 md:gap-3">
              <Button size="sm" className="bg-white text-primary px-6">Get App</Button>
              <Button variant="secondary" size="sm" className="bg-white/10 text-white border-white/20 px-6">Learn More</Button>
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
                  <GlassCard className="flex flex-col gap-4 h-full transition-all group p-4 md:p-6">
                    <div className="w-12 h-12 md:w-16 md:h-16 rounded-2xl liquid-glass flex items-center justify-center text-xl shadow-md overflow-hidden text-primary">
                      {app.icon_url ? (
                        <img src={app.icon_url} alt={app.name} className="w-full h-full object-cover" />
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

      {/* Premium Banner */}
      <section className="px-4 md:px-8">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="max-w-7xl mx-auto bg-surface-lowest border border-outline-variant rounded-3xl p-12 relative overflow-hidden flex flex-col items-center text-center gap-6 shadow-sm"
        >
          <div className="absolute top-0 inset-x-0 h-1 mb-px bg-linear-to-r from-transparent via-primary/50 to-transparent" />
          <div className="p-4 rounded-2xl bg-primary/5 text-primary mb-4">
            <Zap size={32} />
          </div>
          <h2 className="text-4xl font-bold">Experience the Premium Store.</h2>
          <p className="max-w-xl text-on-surface-variant text-lg">
            Unlock exclusive early access, ad-free browsing, and premium support across all your devices.
          </p>
          <Button size="lg" className="mt-4">Join Curator Premium</Button>
        </motion.div>
      </section>
    </div>
  );
}
