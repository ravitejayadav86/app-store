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
          className="relative h-[500px] md:h-[600px] w-full max-w-7xl mx-auto rounded-3xl overflow-hidden bg-linear-to-br from-primary to-primary-dim p-6 md:p-12 text-on-primary flex flex-col justify-end gap-4 md:gap-6 shadow-2xl"
        >
          {/* Decorative background elements */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="absolute top-0 right-0 w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-white/10 rounded-full blur-[80px] md:blur-[100px] -mr-20 md:-mr-40 -mt-20 md:-mt-40"
          />
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
            className="absolute bottom-0 left-0 w-[200px] md:w-[300px] h-[200px] md:h-[300px] bg-white/5 rounded-full blur-[60px] md:blur-[80px] -ml-10 md:-ml-20 -mb-10 md:-mb-20"
          />

          <div className="relative z-10 max-w-2xl">
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="flex items-center gap-2 mb-3 md:mb-4 bg-white/10 w-fit px-3 py-1 rounded-full text-[10px] md:text-xs font-semibold backdrop-blur-md border border-white/20"
            >
              <Star size={12} className="fill-current md:w-3.5 md:h-3.5" />
              <span>Editors&apos; Choice</span>
            </motion.div>
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold tracking-tight mb-3 md:mb-6">Create Without Boundaries.</h1>
            <p className="text-sm md:text-xl text-on-primary/80 mb-6 md:mb-8 leading-relaxed">
              Explore a curated selection of tools designed to elevate your professional workflow and creative potential.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
              <Button size="lg" className="bg-white text-primary w-full sm:w-auto">Get App of the Day</Button>
              <Button variant="secondary" size="lg" className="bg-white/10 text-white border-white/20 w-full sm:w-auto">Learn More</Button>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Chips */}
      <section className="px-4 md:px-8 overflow-x-auto no-scrollbar py-4">
        <div className="flex gap-4 max-w-7xl mx-auto">
          {categories.map((cat, i) => (
            <motion.button
              key={cat}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 + i * 0.05, type: "spring", damping: 20 }}
              className="px-8 py-3 liquid-glass text-sm font-bold hover:text-primary transition-all whitespace-nowrap"
            >
              {cat}
            </motion.button>
          ))}
        </div>
      </section>

      {/* Featured Collections */}
      <section className="px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-end mb-10">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-on-surface mb-2 flex items-center gap-3">
                <Sparkles className="text-primary" size={28} />
                Essential Toolkit
              </h2>
              <p className="text-on-surface-variant font-medium">Selected by our curators for your best work.</p>
            </div>
            <Link href="/categories" className="text-primary font-bold flex items-center gap-2 group">
              Browse All <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {apps.map((app, index) => (
              <motion.div
                key={app.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 + index * 0.1 }}
              >
                <Link href={`/apps/${app.id}`}>
                  <GlassCard className="flex flex-col gap-6 h-full transition-all group p-8">
                    <div className="w-20 h-20 rounded-[2rem] liquid-glass flex items-center justify-center text-3xl shadow-xl overflow-hidden text-primary">
                      {app.icon_url ? (
                        <img src={app.icon_url} alt={app.name} className="w-full h-full object-cover" />
                      ) : (
                        getFallbackIcon(app.category)
                      )}
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold mb-2 group-hover:text-primary transition-colors">{app.name}</h3>
                      <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider">{app.category}</span>
                    </div>
                    <div className="flex items-center justify-between mt-6">
                      <div className="flex items-center gap-1 text-xs font-bold text-primary">
                        <span className="bg-primary/10 px-2 py-0.5 rounded uppercase">Dynamic</span>
                      </div>
                      <Button size="sm" aria-label={`Get ${app.name}`}>Get</Button>
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
