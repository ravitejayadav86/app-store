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
    <div className="flex flex-col gap-20 pb-20">
      {/* Hero Section */}
      <section className="px-4 md:px-8">
        <div
          className="relative h-[600px] w-full max-w-7xl mx-auto rounded-3xl overflow-hidden bg-linear-to-br from-primary to-primary-dim p-12 text-on-primary flex flex-col justify-end gap-6 shadow-2xl"
        >
          {/* Decorative background elements */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/10 rounded-full blur-[100px] -mr-40 -mt-40"
          />
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
            className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-white/5 rounded-full blur-[80px] -ml-20 -mb-20"
          />

          <div className="relative z-10 max-w-2xl">
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="flex items-center gap-2 mb-4 bg-white/10 w-fit px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-md border border-white/20"
            >
              <Star size={14} className="fill-current" />
              <span>Editors&apos; Choice</span>
            </motion.div>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">Create Without Boundaries.</h1>
            <p className="text-lg md:text-xl text-on-primary/80 mb-8 leading-relaxed">
              Explore a curated selection of tools designed to elevate your professional workflow and creative potential.
            </p>
            <div className="flex gap-4">
              <Button size="lg" className="bg-white text-primary">Get App of the Day</Button>
              <Button variant="secondary" size="lg" className="bg-white/10 text-white border-white/20">Learn More</Button>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Chips */}
      <section className="px-4 md:px-8 overflow-x-auto no-scrollbar">
        <div className="flex gap-4 max-w-7xl mx-auto">
          {categories.map((cat, i) => (
            <motion.button
              key={cat}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6 + i * 0.05 }}
              className="px-6 py-2 rounded-full glass border border-outline-variant text-sm font-medium hover:text-primary transition-all whitespace-nowrap"
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
              <h2 className="text-3xl font-bold text-on-surface mb-2">Essential Toolkit</h2>
              <p className="text-on-surface-variant">Selected by our curators for your best work.</p>
            </div>
            <Link href="/categories" className="text-primary font-medium flex items-center gap-2 hover:underline">
              Browse All <ArrowRight size={16} />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {apps.map((app, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 + index * 0.1 }}
              >
                <GlassCard className="flex flex-col gap-6 h-full">
                  <div className="w-16 h-16 rounded-2xl bg-surface-low flex items-center justify-center text-3xl shadow-inner">
                    {app.icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-1">{app.title}</h3>
                    <p className="text-sm text-on-surface-variant">{app.category}</p>
                  </div>
                  <div className="flex items-center justify-between mt-auto">
                    <div className="flex items-center gap-1 text-xs font-semibold text-primary">
                      <span className="bg-primary/10 px-2 py-0.5 rounded">FREE</span>
                    </div>
                    <Button size="sm" aria-label={`Get ${app.title}`}>Get</Button>
                  </div>
                </GlassCard>
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
