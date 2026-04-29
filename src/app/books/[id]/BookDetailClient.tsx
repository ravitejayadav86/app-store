"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ANIME_BOOKS } from "@/data/animeBooks";
import { ArrowLeft, BookOpen, Star, Share2, Heart, ExternalLink, Zap, Clock, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui/GlassCard";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function BookDetailClient({ id }: { id: string }) {
  const router = useRouter();
  const [liked, setLiked] = useState(false);
  const book = ANIME_BOOKS.find((b) => b.id === id);

  if (!book) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 bg-surface">
        <div className="p-6 bg-surface-container-high rounded-full">
          <BookOpen size={64} className="text-on-surface-variant opacity-20" />
        </div>
        <h2 className="text-3xl font-black text-on-surface">Book Not Found</h2>
        <Button onClick={() => router.push("/books")} variant="secondary" className="rounded-2xl px-8">
          Back to Library
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface pb-20">
      {/* IMMERSIVE HEADER */}
      <div className="relative h-[50vh] md:h-[60vh] w-full overflow-hidden">
        {/* Background Blur */}
        <div 
          className="absolute inset-0 scale-110 blur-[60px] opacity-40 transition-all duration-1000"
          style={{ backgroundImage: `url(${book.coverUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/40 to-transparent" />
        
        {/* Top Navigation */}
        <div className="absolute top-0 left-0 right-0 p-4 md:p-8 flex justify-between items-center z-50">
          <button 
            onClick={() => router.back()}
            className="p-3 bg-black/20 backdrop-blur-md rounded-full text-white hover:bg-black/40 transition-all active:scale-90"
          >
            <ArrowLeft size={24} />
          </button>
          <div className="flex gap-3">
            <button className="p-3 bg-black/20 backdrop-blur-md rounded-full text-white hover:bg-black/40 transition-all">
              <Share2 size={20} />
            </button>
            <button 
              onClick={() => setLiked(!liked)}
              className={`p-3 backdrop-blur-md rounded-full transition-all ${liked ? 'bg-pink-500 text-white shadow-lg shadow-pink-500/30' : 'bg-black/20 text-white hover:bg-black/40'}`}
            >
              <Heart size={20} fill={liked ? "currentColor" : "none"} />
            </button>
          </div>
        </div>

        {/* Hero Content */}
        <div className="absolute inset-0 flex items-end justify-center px-4 md:px-8 pb-12 md:pb-20">
          <div className="max-w-7xl w-full flex flex-col md:flex-row gap-8 md:gap-12 items-center md:items-end">
            <motion.div 
              initial={{ y: 60, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="relative w-48 md:w-64 aspect-[2/3] rounded-2xl shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] overflow-hidden ring-1 ring-white/20"
            >
              <img src={book.coverUrl} alt={book.title} className="w-full h-full object-cover" />
            </motion.div>

            <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left gap-4">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="flex items-center gap-3"
              >
                <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest border border-primary/20">
                  {book.type || "Manga"}
                </span>
                <span className="px-3 py-1 rounded-full bg-surface-container-high text-on-surface-variant text-[10px] font-black uppercase tracking-widest">
                  {book.category}
                </span>
              </motion.div>
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-4xl md:text-6xl lg:text-7xl font-black text-on-surface tracking-tight leading-tight"
              >
                {book.title}
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-lg md:text-xl text-on-surface-variant font-bold opacity-80"
              >
                by {book.author}
              </motion.p>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT GRID */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 mt-12 md:mt-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* LEFT COLUMN: ABOUT */}
          <div className="lg:col-span-8 flex flex-col gap-12">
            <div>
              <h2 className="text-2xl font-black text-on-surface mb-6 flex items-center gap-3">
                <BookOpen size={24} className="text-primary" />
                Synopsis
              </h2>
              <p className="text-lg text-on-surface-variant leading-relaxed font-medium">
                {book.description}
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
              <StatItem icon={<Star className="text-yellow-500" />} label="Rating" value="4.9/5" />
              <StatItem icon={<Clock className="text-blue-500" />} label="Status" value={book.status} />
              <StatItem icon={<Zap className="text-purple-500" />} label="Popularity" value="High" />
              <StatItem icon={<ShieldCheck className="text-green-500" />} label="Official" value="Yes" />
            </div>
          </div>

          {/* RIGHT COLUMN: ACTIONS */}
          <div className="lg:col-span-4">
            <GlassCard className="sticky top-24 p-8 flex flex-col gap-6 bg-surface-low border-outline-variant shadow-2xl">
              <div className="flex flex-col gap-2">
                <span className="text-xs font-black uppercase tracking-widest text-on-surface-variant/60">Availability</span>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-lg font-black text-green-500">Free to Read</span>
                </div>
              </div>

              <div className="h-px bg-outline-variant/30" />

              <div className="flex flex-col gap-4">
                <Button 
                  onClick={() => window.open(book.readUrl, "_blank")}
                  className="w-full h-16 rounded-2xl bg-primary text-on-primary text-lg font-black shadow-xl shadow-primary/20 flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all"
                >
                  <BookOpen size={24} />
                  Start Reading
                </Button>
                <Button 
                  variant="secondary" 
                  className="w-full h-14 rounded-2xl text-base font-bold flex items-center justify-center gap-3"
                >
                  <ExternalLink size={20} />
                  Official Page
                </Button>
              </div>

              <p className="text-center text-[10px] text-on-surface-variant/60 font-medium px-4">
                You are viewing the official English edition. Copyright belongs to the respective owners.
              </p>
            </GlassCard>
          </div>
        </div>
      </section>
    </div>
  );
}

function StatItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="p-4 bg-surface-container-low rounded-2xl border border-outline-variant flex flex-col gap-1 items-center text-center">
      <div className="p-2 bg-surface rounded-xl mb-1 shadow-sm">
        {icon}
      </div>
      <span className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant/40">{label}</span>
      <span className="text-sm font-black text-on-surface">{value}</span>
    </div>
  );
}
