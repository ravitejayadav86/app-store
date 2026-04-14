"use client";

import React from "react";
import { motion } from "framer-motion";
import { GlassCard } from "@/components/ui/GlassCard";
import { 
  Gamepad2, 
  Briefcase, 
  Palette, 
  Zap, 
  MessageCircle, 
  Code2, 
  Music, 
  BookOpen,
  Camera,
  HeartPulse
} from "lucide-react";

const categories = [
  { name: "Games", icon: <Gamepad2 size={32} />, count: "12,403 Apps", color: "bg-orange-500/10 text-orange-500" },
  { name: "Productivity", icon: <Briefcase size={32} />, count: "8,210 Apps", color: "bg-blue-500/10 text-blue-500" },
  { name: "Graphics & Design", icon: <Palette size={32} />, count: "3,150 Apps", color: "bg-pink-500/10 text-pink-500" },
  { name: "Utilities", icon: <Zap size={32} />, count: "5,600 Apps", color: "bg-yellow-500/10 text-yellow-500" },
  { name: "Social Networking", icon: <MessageCircle size={32} />, count: "2,900 Apps", color: "bg-green-500/10 text-green-500" },
  { name: "Developer Tools", icon: <Code2 size={32} />, count: "1,500 Apps", color: "bg-purple-500/10 text-purple-500" },
  { name: "Music", icon: <Music size={32} />, count: "4,200 Apps", color: "bg-indigo-500/10 text-indigo-500" },
  { name: "Books", icon: <BookOpen size={32} />, count: "7,800 Apps", color: "bg-red-500/10 text-red-500" },
  { name: "Photo & Video", icon: <Camera size={32} />, count: "6,100 Apps", color: "bg-cyan-500/10 text-cyan-500" },
  { name: "Health & Fitness", icon: <HeartPulse size={32} />, count: "3,300 Apps", color: "bg-emerald-500/10 text-emerald-500" },
];

export default function CategoriesPage() {
  return (
    <div className="flex flex-col gap-20 pb-20">
      <section className="px-4 md:px-8">
        <div className="relative h-[600px] w-full max-w-7xl mx-auto rounded-3xl overflow-hidden bg-linear-to-br from-primary to-primary-dim p-12 text-on-primary flex flex-col justify-end gap-6 shadow-2xl shadow-primary/20">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }} 
            animate={{ scale: 1, opacity: 1 }} 
            transition={{ duration: 1.5, ease: "easeOut" }} 
            className="absolute top-0 right-10 w-[500px] h-[500px] bg-white/10 rounded-full blur-[100px] -mr-40 -mt-40" 
          />
          <div className="relative z-10 max-w-2xl">
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="flex items-center gap-2 mb-4 bg-white/10 w-fit px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-md border border-white/20"
            >
              <Zap size={14} />
              <span>Global Index</span>
            </motion.div>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-4 text-on-primary">Segment Your World.</h1>
            <p className="text-lg md:text-xl text-on-primary/80 mb-2">Find exactly what you need with our meticulously organized application ecosystem.</p>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 md:px-8 w-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {categories.map((cat, index) => (
            <motion.div
              key={cat.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.05 }}
            >
              <GlassCard className="h-full flex flex-col items-start gap-8 cursor-pointer group hover:bg-surface-low transition-all">
                <div className={`p-5 rounded-2xl ${cat.color} group-hover:scale-110 transition-transform duration-500 shadow-sm`}>
                  {cat.icon}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-on-surface mb-1 group-hover:text-primary transition-colors">
                    {cat.name}
                  </h2>
                  <p className="text-sm text-on-surface-variant font-medium">{cat.count}</p>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
