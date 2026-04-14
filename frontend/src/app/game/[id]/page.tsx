"use client";

import React from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { Star, Download, Share2, Shield, Zap, Sparkles, Layout, Database, ArrowLeft, Terminal, Cpu } from "lucide-react";
import Link from "next/link";

export default function GameDetailPage({ params }: { params: { id: string } }) {
  // Mock data for the specific game
  const game = {
    title: "Quantum Code Pro",
    publisher: "Neon Labs",
    rating: 4.9,
    reviews: "12,403",
    tagline: "The next generation of creative development is here.",
    description: "Experience absolute fluidity in your development workflow. Quantum Code combines high-performance synthesis with an intuitive nodal interface, allowing you to build complex systems with the speed of thought. Whether you're an architect, designer, or engineer, Curator's choice for 2026 is designed to elevate your craft.",
    category: "Development",
    price: "$29.99",
    stats: [
      { label: "Stability", value: "99.9%", icon: <Shield size={16} /> },
      { label: "Performance", value: "8k / 120fps", icon: <Zap size={16} /> },
      { label: "Magic", value: "Inf", icon: <Sparkles size={16} /> },
    ],
    requirements: [
      { label: "Operating System", value: "macOS 14.0 or later" },
      { label: "Processor", value: "M1 Pro or Intel i9" },
      { label: "Memory", value: "32 GB RAM recommended" },
      { label: "Storage", value: "4 GB SSD Space" },
    ],
    userReviews: [
      { user: "Alex R.", rating: 5, comment: "Transformative. The nodal interface changed how I think about systems logic." },
      { user: "Sarah J.", rating: 4, comment: "Exceptional speed, though the 8k output requires serious hardware." },
    ]
  };

  return (
    <div className="flex flex-col pb-20">
      {/* Immersive Hero Header */}
      <section className="relative h-[80vh] min-h-[600px] w-full overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-b from-primary/20 via-surface to-surface z-0" />
        <motion.div 
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="absolute inset-0 z-[-1]"
        >
          <div className="w-full h-full bg-linear-to-br from-primary to-primary-dim opacity-40 blur-[100px] scale-150 rotate-12" />
        </motion.div>

        <div className="max-w-7xl mx-auto px-4 md:px-8 h-full flex flex-col justify-end pb-16 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col md:flex-row items-end gap-12"
          >
            <div className="w-48 h-48 rounded-[2.5rem] bg-surface-lowest shadow-2xl overflow-hidden flex items-center justify-center text-8xl shadow-primary/20 border border-white/10 group">
               <Database className="w-24 h-24 text-primary group-hover:scale-110 transition-transform duration-500" />
            </div>
            
            <div className="flex-grow space-y-4">
              <div className="flex items-center gap-2 bg-primary/10 w-fit px-3 py-1 rounded-full text-xs font-bold text-primary border border-primary/20">
                <Sparkles size={14} />
                <span>Curator's Choice</span>
              </div>
              <h1 className="text-6xl md:text-8xl font-bold tracking-tighter text-on-surface">{game.title}</h1>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                   <div className="flex text-yellow-500"><Star size={16} className="fill-current" /></div>
                   <span className="font-bold text-on-surface">{game.rating}</span>
                   <span className="text-sm text-on-surface-variant">({game.reviews})</span>
                </div>
                <div className="w-px h-4 bg-outline-variant" />
                <button className="text-sm font-bold text-primary hover:underline underline-offset-4">{game.publisher}</button>
              </div>
            </div>

            <div className="flex flex-col gap-4 w-full md:w-auto">
              <Link href="/checkout">
                <Button size="lg" className="w-full md:px-12 py-6 text-xl shadow-2xl shadow-primary/30">
                  Get it for {game.price}
                </Button>
              </Link>
              <div className="flex gap-4">
                 <button className="flex-grow flex items-center justify-center gap-2 py-3 rounded-2xl glass border border-outline-variant hover:bg-surface-low transition-all font-bold text-sm">
                    <Share2 size={16} /> Share
                 </button>
                 <button className="px-5 py-3 rounded-2xl glass border border-outline-variant hover:bg-surface-low transition-all text-on-surface-variant hover:text-primary">
                    <Star size={20} />
                 </button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Content Grid */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 w-full mt-20 grid grid-cols-1 lg:grid-cols-3 gap-16">
        <div className="lg:col-span-2 space-y-24">
           <div className="space-y-6">
              <h2 className="text-4xl font-bold">About the Application</h2>
              <p className="text-2xl text-on-surface-variant leading-relaxed font-medium transition-colors">
                {game.description}
              </p>
           </div>

           <div className="space-y-10">
              <h2 className="text-3xl font-bold">Performance & Metrics</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {game.stats.map((stat, i) => (
                  <GlassCard key={i} className="flex flex-col gap-4 items-center text-center p-8">
                    <div className="w-12 h-12 rounded-xl bg-primary/5 flex items-center justify-center text-primary">
                      {stat.icon}
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-on-surface">{stat.value}</p>
                      <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">{stat.label}</p>
                    </div>
                  </GlassCard>
                ))}
              </div>
           </div>

           <div className="space-y-10">
              <h2 className="text-3xl font-bold">Reader Reviews</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 {game.userReviews.map((rev, i) => (
                   <GlassCard key={i} className="p-8 space-y-4">
                      <div className="flex justify-between items-center">
                         <span className="font-bold">{rev.user}</span>
                         <div className="flex text-yellow-500 gap-0.5">
                            {[...Array(rev.rating)].map((_, i) => <Star key={i} size={12} className="fill-current" />)}
                         </div>
                      </div>
                      <p className="text-on-surface-variant text-sm italic">{rev.comment}</p>
                   </GlassCard>
                 ))}
              </div>
           </div>

           <div className="space-y-10">
              <h2 className="text-3xl font-bold">Editorial Screenshots</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="h-80 rounded-[2.5rem] bg-surface-low border border-outline-variant relative overflow-hidden group">
                    <div className="absolute inset-0 bg-linear-to-br from-primary/10 to-transparent group-hover:scale-110 transition-transform duration-700" />
                 </div>
                 <div className="h-80 rounded-[2.5rem] bg-surface-low border border-outline-variant relative overflow-hidden group">
                    <div className="absolute inset-0 bg-linear-to-tl from-secondary/10 to-transparent group-hover:scale-110 transition-transform duration-700" />
                 </div>
              </div>
           </div>
        </div>

        <aside className="space-y-16">
           <div className="space-y-8">
              <h2 className="text-xs font-bold uppercase tracking-widest text-primary">Technical Parameters</h2>
              <div className="space-y-6">
                 {game.requirements.map((req, i) => (
                    <div key={i} className="flex flex-col gap-1 py-1 border-b border-outline-variant/30">
                       <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">{req.label}</span>
                       <span className="font-bold text-on-surface">{req.value}</span>
                    </div>
                 ))}
              </div>
           </div>

           <div className="space-y-6">
              <h2 className="text-xs font-bold uppercase tracking-widest text-primary">Global Distribution</h2>
              <div className="space-y-4">
                 <div className="flex justify-between py-3 border-b border-outline-variant/30">
                    <span className="text-on-surface-variant font-medium">Provider</span>
                    <span className="font-bold text-on-surface">{game.publisher}</span>
                 </div>
                 <div className="flex justify-between py-3 border-b border-outline-variant/30">
                    <span className="text-on-surface-variant font-medium">Binary Size</span>
                    <span className="font-bold text-on-surface">1.2 GB</span>
                 </div>
                 <div className="flex justify-between py-3">
                    <span className="text-on-surface-variant font-medium">Languages</span>
                    <span className="font-bold text-on-surface">English + 12</span>
                 </div>
              </div>
           </div>

           <div className="p-10 bg-surface-lowest border border-outline-variant rounded-[3rem] relative overflow-hidden group cursor-pointer">
              <div className="absolute top-0 inset-x-0 h-1 bg-linear-to-r from-transparent via-primary/50 to-transparent" />
              <h3 className="text-2xl font-bold mb-4">Privacy & Safety</h3>
              <p className="text-sm text-on-surface-variant mb-6 leading-relaxed">
                The developer has provided details about its encrypted storage practices. Reference the <span className="text-primary hover:underline">Full Disclosure</span> for deep analysis.
              </p>
              <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-widest text-primary">
                View Analysis <ArrowLeft className="rotate-180" size={14} />
              </div>
           </div>
        </aside>
      </section>
    </div>
  );
}
