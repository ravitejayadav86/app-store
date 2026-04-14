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
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
      <header className="mb-16">
        <h1 className="text-5xl font-bold tracking-tight text-on-surface mb-4">
          Browse Categories
        </h1>
        <p className="text-xl text-on-surface-variant max-w-2xl">
          Find exactly what you need with our meticulously organized application ecosystem.
        </p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {categories.map((cat, index) => (
          <motion.div
            key={cat.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + index * 0.05 }}
          >
            <GlassCard className="h-full flex flex-col items-start gap-6 cursor-pointer group">
              <div className={`p-4 rounded-2xl ${cat.color} group-hover:scale-110 transition-transform duration-300`}>
                {cat.icon}
              </div>
              <div>
                <h2 className="text-xl font-bold text-on-surface mb-1 group-hover:text-primary transition-colors">
                  {cat.name}
                </h2>
                <p className="text-sm text-on-surface-variant">{cat.count}</p>
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
