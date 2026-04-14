
"use client";

import { motion } from "framer-motion";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { Compass, TrendingUp, Star, Flame } from "lucide-react";

export default function DiscoverPage() {
  const trending = [
    { title: "Horizon Docs", category: "Productivity", badge: "Trending", color: "bg-blue-500" },
    { title: "Quantum Code", category: "Development", badge: "New", color: "bg-purple-500" },
    { title: "Nebula Sync", category: "Utilities", badge: "Hot", color: "bg-cyan-500" },
    { title: "Lumina Edit", category: "Graphics", badge: "Staff Pick", color: "bg-pink-500" },
  ];

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
              <span>Discover</span>
            </motion.div>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-4">Find Your Next Favorite.</h1>
            <p className="text-lg md:text-xl text-on-primary/80 mb-2">Handpicked apps trending right now across every category.</p>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 md:px-8 w-full">
        <div className="flex items-center gap-3 mb-8">
          <Flame className="text-primary" />
          <h2 className="text-3xl font-bold text-on-surface text-3xl font-bold text-on-surface">Trending Now</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {trending.map((app, index) => (
            <motion.div 
              key={index} 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: 0.3 + index * 0.08 }}
            >
              <GlassCard className="flex flex-col gap-6 h-full">
                <div className={`w-16 h-16 rounded-2xl ${app.color} flex items-center justify-center shadow-inner text-white`}>
                  <Star size={28} />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-1">{app.title}</h3>
                  <p className="text-sm text-on-surface-variant">{app.category}</p>
                </div>
                <div className="flex items-center justify-between mt-auto">
                  <span className="text-xs font-semibold bg-primary/10 text-primary px-2 py-0.5 rounded">{app.badge}</span>
                  <Button size="sm">Get</Button>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 md:px-8 w-full">
        <div className="flex items-center gap-3 mb-8">
          <TrendingUp className="text-primary" />
          <h2 className="text-3xl font-bold text-on-surface text-3xl font-bold text-on-surface">Rising Stars</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {trending.slice().reverse().map((app, index) => (
            <motion.div 
              key={index} 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: 0.5 + index * 0.08 }}
            >
              <GlassCard className="flex flex-col gap-6 h-full">
                <div className={`w-16 h-16 rounded-2xl ${app.color} flex items-center justify-center shadow-inner text-white opacity-80 backdrop-grayscale-[0.5]`}>
                  <TrendingUp size={28} />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-1">{app.title}</h3>
                  <p className="text-sm text-on-surface-variant">{app.category}</p>
                </div>
                <div className="flex items-center justify-between mt-auto">
                  <span className="text-xs font-semibold bg-primary/10 text-primary px-2 py-0.5 rounded">FREE</span>
                  <Button size="sm">Get</Button>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
