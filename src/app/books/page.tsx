"use client";

import React from "react";
import { motion } from "framer-motion";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { BookOpen, Star, Bookmark, Headphones, Sparkles, TrendingUp, Search } from "lucide-react";

export default function BooksPage() {
  const books = [
    { title: "Quantum Architecture", author: "Dr. Elena Vance", category: "Technical", rating: "4.9", color: "bg-blue-600" },
    { title: "The Fluid UI", author: "Marcus Thorne", category: "Design", rating: "4.8", color: "bg-pink-600" },
    { title: "Deep Trace: Volume 1", author: "Sarah Jenkins", category: "Technology", rating: "4.7", color: "bg-purple-600" },
    { title: "Creative Synthesis", author: "Julian Vane", category: "Art", rating: "5.0", color: "bg-orange-600" },
    { title: "Network Pulse", author: "Kevin Wu", category: "Networking", rating: "4.6", color: "bg-cyan-600" },
    { title: "Logic & Flow", author: "Aries Graham", category: "Mathematics", rating: "4.9", color: "bg-emerald-600" },
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
              <BookOpen size={14} />
              <span>Editorial Collection</span>
            </motion.div>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-4">Read & Evolve.</h1>
            <p className="text-lg md:text-xl text-on-primary/80 mb-2">The world's most influential technical publications and design journals, curated for the modern creator.</p>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 md:px-8 w-full">
        <div className="flex flex-col md:flex-row justify-between items-end gap-8 mb-12">
           <div className="flex items-center gap-3">
              <Sparkles className="text-primary" />
              <h2 className="text-3xl font-bold text-on-surface">Curated Spotlights</h2>
           </div>
           <div className="relative w-full md:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant" size={16} />
              <input 
                type="text" 
                placeholder="Find a publication..."
                className="w-full pl-10 pr-4 py-3 rounded-2xl glass border border-outline-variant focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm font-medium"
              />
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {books.map((book, index) => (
            <motion.div 
              key={index} 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: 0.3 + index * 0.1 }}
            >
              <GlassCard className="flex gap-6 h-full group cursor-pointer hover:bg-surface-low transition-all">
                <div className={`w-32 h-44 rounded-xl ${book.color} flex-shrink-0 shadow-2xl relative overflow-hidden flex flex-col justify-end p-3 transform group-hover:-translate-y-2 group-hover:rotate-2 transition-all duration-500`}>
                   <div className="absolute top-0 right-0 p-2 opacity-20">
                      <BookOpen size={40} />
                   </div>
                   <div className="w-full h-1 bg-white/20 mb-2 rounded-full" />
                   <p className="text-[10px] font-bold text-white uppercase tracking-tighter opacity-70">PandaStore Edition</p>
                </div>
                
                <div className="flex flex-col justify-between py-1">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-primary mb-2 block">{book.category}</span>
                    <h3 className="text-xl font-bold text-on-surface leading-tight mb-1">{book.title}</h3>
                    <p className="text-sm text-on-surface-variant font-medium">{book.author}</p>
                  </div>
                  
                  <div className="flex items-center justify-between mt-auto">
                    <div className="flex items-center gap-1.5">
                       <Star size={14} className="text-yellow-500 fill-current" />
                       <span className="text-xs font-bold">{book.rating}</span>
                    </div>
                    <Button size="sm" variant="tertiary">Read</Button>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 md:px-8 w-full">
         <div className="p-12 rounded-[3rem] bg-surface-lowest border border-outline-variant relative overflow-hidden flex flex-col md:flex-row items-center gap-12">
            <div className="absolute top-0 inset-x-0 h-1 bg-linear-to-r from-transparent via-primary to-transparent" />
            <div className="w-full md:w-1/2 space-y-6">
               <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-widest">
                  <Headphones size={16} /> Now in Audio
               </div>
               <h2 className="text-4xl font-bold">Listen to your collection.</h2>
               <p className="text-on-surface-variant text-lg leading-relaxed">
                 Experience our entire technical library in high-fidelity spatial audio. Perfect for deep focus sessions and on-the-go learning.
               </p>
               <Button size="lg" className="px-10">Start Listening</Button>
            </div>
            <div className="w-full md:w-1/2 grid grid-cols-2 gap-4">
               <div className="h-40 rounded-3xl bg-surface-low border border-outline-variant animate-pulse" />
               <div className="h-40 rounded-3xl bg-surface-low border border-outline-variant animate-pulse delay-75" />
               <div className="h-40 rounded-3xl bg-surface-low border border-outline-variant animate-pulse delay-150" />
               <div className="h-40 rounded-3xl bg-surface-low border border-outline-variant animate-pulse delay-300" />
            </div>
         </div>
      </section>
    </div>
  );
}
