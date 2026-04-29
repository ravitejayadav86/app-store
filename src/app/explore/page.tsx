"use client";

import React from "react";
import { motion } from "framer-motion";
import { Sparkles, Gamepad2, Music, AppWindow, ArrowRight, BookOpen, Layers } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

const CONTAINER_VARIANTS = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 }
  }
} as const;

const ITEM_VARIANTS = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { type: "spring", stiffness: 300, damping: 25 }
  }
} as const;

export default function ExplorePage() {
  const segments = [
    {
      title: "The Apps Ecosystem",
      icon: <AppWindow size={32} className="text-blue-500" />,
      color: "from-blue-500/20 to-cyan-500/10",
      border: "border-blue-500/20",
      desc: "A meticulously curated hub for high-performance productivity tools, creative utilities, and social platforms. Every application is instantly accessible, verified for security, and organized through a zero-lag Server-Side Rendered architecture."
    },
    {
      title: "Dynamic Music Engine",
      icon: <Music size={32} className="text-fuchsia-500" />,
      color: "from-fuchsia-500/20 to-pink-500/10",
      border: "border-fuchsia-500/20",
      desc: "Our custom-built Spotify and JioSaavn integration features millions of free, high-fidelity tracks. It includes an iOS-style 'Dynamic Island' persistent global player, dedicated Liked Songs curation, and seamless playback while you browse the rest of the store."
    },
    {
      title: "Immersive Games",
      icon: <Gamepad2 size={32} className="text-orange-500" />,
      color: "from-orange-500/20 to-red-500/10",
      border: "border-orange-500/20",
      desc: "Dive into a vast collection of high-performance, embedded HTML5 browser games. Featuring responsive native UI interfaces, full-screen capabilities, and zero-loading states for an uninterrupted gaming experience."
    },
    {
      title: "Live Taxonomy & Categories",
      icon: <Layers size={32} className="text-purple-500" />,
      color: "from-purple-500/20 to-indigo-500/10",
      border: "border-purple-500/20",
      desc: "Navigate our platform effortlessly with an advanced, auto-generating taxonomy system. Categories dynamically adapt to mobile environments, compressing into sleek horizontal lists or expanding into beautiful native tiles on desktop."
    }
  ];

  return (
    <motion.div 
      initial="hidden" 
      animate="visible" 
      variants={CONTAINER_VARIANTS}
      className="flex flex-col gap-12 pb-24 pt-4 md:pt-0"
    >
      {/* Hero Header */}
      <motion.section variants={ITEM_VARIANTS} className="px-4 md:px-8">
        <div className="relative h-[250px] md:h-[350px] w-full max-w-7xl mx-auto rounded-[2rem] md:rounded-[3rem] overflow-hidden bg-surface flex flex-col justify-center items-center text-center p-6 md:p-12 border border-outline-variant/30 shadow-xl shadow-primary/5">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 mb-4 bg-primary/10 w-fit px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest text-primary"
          >
            <Sparkles size={16} />
            <span>Discover PandaStore</span>
          </motion.div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-4 text-on-surface">
            Everything in One Place.
          </h1>
          <p className="text-sm md:text-lg text-on-surface-variant max-w-2xl font-medium">
            PandaStore is a revolutionary digital marketplace that seamlessly unifies applications, high-fidelity music streaming, and gaming into a single, lightning-fast platform.
          </p>
        </div>
      </motion.section>

      {/* Video Demonstration */}
      <motion.section variants={ITEM_VARIANTS} className="px-4 md:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="rounded-[2rem] overflow-hidden shadow-2xl border border-outline-variant/20 bg-black relative aspect-[16/10] md:aspect-video group">
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-10 pointer-events-none" />
            <img 
              src="/pandastore_walkthrough.webp" 
              alt="PandaStore Platform Walkthrough" 
              className="w-full h-full object-contain md:object-cover opacity-90 group-hover:opacity-100 transition-opacity duration-500"
            />
            <div className="absolute bottom-6 left-6 md:bottom-8 md:left-8 z-20">
              <span className="text-white/80 text-[10px] md:text-xs font-black uppercase tracking-widest mb-1 block">Live Demonstration</span>
              <h3 className="text-xl md:text-3xl font-black text-white drop-shadow-md">The Native Experience</h3>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Segments Breakdown */}
      <motion.section variants={ITEM_VARIANTS} className="px-4 md:px-8 mt-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl md:text-4xl font-black text-on-surface mb-8 text-center">
            Explore Our Core Segments
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            {segments.map((seg, idx) => (
              <motion.div key={idx} variants={ITEM_VARIANTS} className={`p-6 md:p-8 rounded-[2rem] bg-gradient-to-br ${seg.color} border ${seg.border} flex flex-col gap-4 transition-transform hover:-translate-y-1`}>
                <div className="w-16 h-16 rounded-2xl bg-white/50 dark:bg-black/20 flex items-center justify-center shadow-sm backdrop-blur-md">
                  {seg.icon}
                </div>
                <h3 className="text-xl md:text-2xl font-black text-on-surface">{seg.title}</h3>
                <p className="text-sm md:text-base text-on-surface-variant font-medium leading-relaxed">
                  {seg.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Call to Action */}
      <motion.section variants={ITEM_VARIANTS} className="px-4 md:px-8 mt-8">
        <div className="max-w-3xl mx-auto text-center flex flex-col items-center">
          <h2 className="text-2xl md:text-3xl font-black text-on-surface mb-6">Ready to dive in?</h2>
          <div className="flex gap-4">
            <Link href="/">
              <Button size="lg" className="px-8 rounded-2xl font-bold shadow-lg text-sm md:text-base">
                Go to Homepage
              </Button>
            </Link>
            <Link href="/music">
              <Button variant="secondary" size="lg" className="px-8 rounded-2xl font-bold text-sm md:text-base">
                Launch Music Player
              </Button>
            </Link>
          </div>
        </div>
      </motion.section>
    </motion.div>
  );
}
