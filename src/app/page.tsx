"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { Star, ArrowRight, Zap, Shield, Sparkles, Layout, Database, Cloud } from "lucide-react";

export default function Home() {
  const categories = ["Games", "Productivity", "Graphics", "Utilities", "Social", "Development"];

  const apps = [
    { title: "Horizon Docs", category: "Productivity", icon: <Layout className="text-blue-500" /> },
    { title: "Quantum Code", category: "Development", icon: <Database className="text-purple-500" /> },
    { title: "Nebula Sync", category: "Utilities", icon: <Cloud className="text-cyan-500" /> },
    { title: "Lumina Edit", category: "Graphics", icon: <Sparkles className="text-pink-500" /> },
  ];

  return (
    <div className="flex flex-col gap-24 pb-24">
      {/* Immersive Hero Section */}
      <section className="px-4 md:px-8">
        <div
          className="relative min-h-[700px] w-full max-w-7xl mx-auto rounded-[3rem] overflow-hidden bg-surface-low p-12 md:p-24 text-on-surface flex flex-col justify-end gap-8 shadow-inner group"
        >
          {/* Luminous depth layers */}
          <div className="absolute inset-0 bg-linear-to-tr from-primary/10 via-transparent to-secondary/5 z-0" />
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 2, ease: "easeOut" }}
            className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px] -mr-40 -mt-40 group-hover:bg-primary/30 transition-colors duration-1000"
          />
          
          <div className="relative z-10 max-w-3xl space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 bg-on-surface/5 w-fit px-4 py-1.5 rounded-full text-xs font-bold backdrop-blur-xl border border-on-surface/5"
            >
              <Sparkles size={14} className="text-primary" />
              <span className="tracking-widest uppercase">The Editorial Choice • 2026</span>
            </motion.div>
            
            <h1 className="text-6xl md:text-9xl font-bold tracking-tighter leading-[0.9] text-balance">
              Panda<span className="text-primary">Store.</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-on-surface-variant max-w-xl font-medium leading-relaxed opacity-80">
              Beyond a marketplace. Explore a legacy of tools refined for absolute performance and creative depth.
            </p>
            
            <div className="flex flex-wrap gap-4 pt-4">
              <Button size="lg" className="px-10 py-8 text-xl rounded-2xl shadow-2xl shadow-primary/30 group">
                Explore Game of the Year <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button variant="tertiary" size="lg" className="px-10 py-8 text-xl font-bold">
                View Collections
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Rhythmic Category Chips */}
      <section className="px-4 md:px-8">
        <div className="flex flex-wrap gap-3 max-w-7xl mx-auto">
          {categories.map((cat, i) => (
            <motion.button
              key={cat}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 + i * 0.05 }}
              className={`px-8 py-3 rounded-full text-sm font-bold tracking-tight transition-all duration-300 ${
                i === 0 ? "bg-primary text-on-primary shadow-lg shadow-primary/20" : "bg-surface-lowest text-on-surface-variant hover:bg-surface-low"
              }`}
            >
              {cat}
            </motion.button>
          ))}
        </div>
      </section>

      {/* Featured Collections with Tonal Stacking */}
      <section className="px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-end mb-16 px-2">
            <div>
              <div className="w-12 h-1 bg-primary mb-6 rounded-full" />
              <h2 className="text-5xl font-bold text-on-surface tracking-tight">Essential Toolkit</h2>
              <p className="text-on-surface-variant text-lg mt-2 font-medium opacity-60">Hand-selected for peak professional performance.</p>
            </div>
            <Link href="/categories" className="group flex items-center gap-3 text-primary font-bold uppercase tracking-widest text-xs hover:gap-4 transition-all">
              See the Entire Library <ArrowRight size={16} />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {apps.map((app, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.8 }}
              >
                <Link href={`/game/${app.title.toLowerCase().replace(' ', '-')}`}>
                  <div className="bg-surface-lowest rounded-[2.5rem] p-10 flex flex-col gap-8 h-full group hover:bg-surface-low transition-all duration-500 cursor-pointer shadow-sm hover:shadow-2xl hover:shadow-primary/5 active:scale-95 border border-transparent hover:border-outline-variant/20">
                    <div className="w-20 h-20 rounded-3xl bg-surface-low flex items-center justify-center text-4xl shadow-inner group-hover:scale-110 transition-transform duration-500 group-hover:bg-white">
                      {app.icon}
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary opacity-60">{app.category}</p>
                      <h3 className="text-2xl font-bold text-on-surface">{app.title}</h3>
                    </div>
                    <div className="flex items-center justify-between mt-auto">
                      <span className="text-lg font-bold text-on-surface group-hover:text-primary transition-colors">FREE</span>
                      <div className="w-10 h-10 rounded-full bg-primary/5 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-on-primary transition-all">
                        <ArrowRight size={20} />
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Global Vision Banner */}
      <section className="px-4 md:px-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="max-w-7xl mx-auto rounded-[4rem] bg-linear-to-br from-surface-lowest to-surface-low p-16 md:p-32 relative overflow-hidden flex flex-col items-center text-center gap-10"
        >
          <div className="absolute top-0 right-0 p-12 opacity-5">
             <Layout size={300} />
          </div>
          <div className="w-20 h-20 rounded-full bg-primary/10 text-primary flex items-center justify-center">
            <Zap size={40} />
          </div>
          <div className="space-y-4 max-w-2xl">
            <h2 className="text-5xl md:text-7xl font-bold tracking-tighter">Experience Premium Curation.</h2>
            <p className="text-xl text-on-surface-variant font-medium opacity-70">
              Join a collective of creators who demand more from their tools. Zero ads, priority updates, and the full Fluid legacy.
            </p>
          </div>
          <Button size="lg" className="px-16 py-8 text-xl rounded-2xl shadow-2xl shadow-primary/30">Activate PandaStore Premium</Button>
        </motion.div>
      </section>
    </div>
  );
}
