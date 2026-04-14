"use client";

import { motion } from "framer-motion";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { Music, Headphones, Radio, Mic } from "lucide-react";

export default function MusicPage() {
  const apps = [
    { title: "Beat Studio", category: "Music Production", badge: "Top Rated", icon: <Music />, color: "bg-pink-500" },
    { title: "Wave Player", category: "Music Player", badge: "Free", icon: <Headphones />, color: "bg-purple-500" },
    { title: "Radio Live", category: "Streaming", badge: "New", icon: <Radio />, color: "bg-blue-500" },
    { title: "Vocal Pro", category: "Recording", badge: "Hot", icon: <Mic />, color: "bg-orange-500" },
    { title: "Beat Studio X", category: "Performance", badge: "Free", icon: <Music />, color: "bg-cyan-500" },
    { title: "Lumina Beats", category: "Synthesis", badge: "New", icon: <Sparkles />, color: "bg-emerald-500" },
    { title: "Radio Pulse", category: "Charts", badge: "Hot", icon: <Radio />, color: "bg-yellow-500" },
    { title: "Sonic Draft", category: "Notation", badge: "Premium", icon: <Headphones />, color: "bg-red-500" },
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
              <Music size={14} />
              <span>Music Ecosystem</span>
            </motion.div>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-4">Feel the Rhythm.</h1>
            <p className="text-lg md:text-xl text-on-primary/80 mb-2">The most advanced digital audio workstations and playback tools for contemporary artists.</p>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 md:px-8 w-full">
        <div className="flex items-center gap-3 mb-8">
          <Headphones className="text-primary" />
          <h2 className="text-3xl font-bold text-on-surface">Precision Audio Tools</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {apps.map((app, index) => (
            <motion.div 
              key={index} 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: 0.3 + index * 0.08 }}
            >
              <GlassCard className="flex flex-col gap-6 h-full">
                <div className={`w-16 h-16 rounded-2xl ${app.color} flex items-center justify-center text-white text-3xl shadow-inner`}>
                  {app.icon}
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
    </div>
  );
}
import { Sparkles } from "lucide-react";
