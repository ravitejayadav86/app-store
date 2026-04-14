"use client";

import React from "react";
import { motion } from "framer-motion";
import { GlassCard } from "@/components/ui/GlassCard";
import { Users, MessageSquare, TrendingUp, Zap, Sparkles, Trophy } from "lucide-react";

export default function CommunityPage() {
  const hubs = [
    { name: "Creative Studio", members: "12.4k", active: "1.2k", icon: <Sparkles className="text-pink-500" /> },
    { name: "Dev Lounge", members: "8.1k", active: "450", icon: <Zap className="text-yellow-500" /> },
    { name: "Gaming Hub", members: "25k", active: "5.4k", icon: <Trophy className="text-orange-500" /> },
    { name: "Productivity Pulse", members: "5.2k", active: "200", icon: <TrendingUp className="text-blue-500" /> },
  ];

  const posts = [
    { 
      user: "HorizonDesigner", 
      time: "2h ago", 
      content: "Just dropped a new template for the Horizon Docs ecosystem. Let me know what you think!", 
      likes: 142, 
      comments: 24 
    },
    { 
      user: "QuantumCoder", 
      time: "5h ago", 
      content: "Anyone else experiencing issues with the latest Nebula Sync update on ARM architecture?", 
      likes: 89, 
      comments: 52 
    },
    { 
      user: "GameMaster99", 
      time: "8h ago", 
      content: "The Circuit Breaker tournament registration is officially open! Who's joining?", 
      likes: 560, 
      comments: 110 
    },
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
              <Users size={14} />
              <span>Connect</span>
            </motion.div>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-4">The Hub.</h1>
            <p className="text-lg md:text-xl text-on-primary/80 mb-2">Connect with millions of users, share your workflows, and discover new tools.</p>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 md:px-8 w-full grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-12">
          <section>
            <div className="flex items-center gap-3 mb-8">
              <MessageSquare className="text-primary" />
              <h2 className="text-3xl font-bold text-on-surface">Live Activity</h2>
            </div>
            <div className="space-y-6">
              {posts.map((post, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                >
                  <GlassCard className="flex flex-col gap-4">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-surface-low border border-outline-variant" />
                        <div>
                          <p className="font-bold text-on-surface">{post.user}</p>
                          <p className="text-xs text-on-surface-variant font-medium">{post.time}</p>
                        </div>
                      </div>
                    </div>
                    <p className="text-on-surface-variant leading-relaxed">
                      {post.content}
                    </p>
                    <div className="flex gap-6 mt-2">
                       <button className="flex items-center gap-2 text-xs font-bold text-on-surface-variant hover:text-primary transition-colors">
                         <TrendingUp size={14} /> {post.likes}
                       </button>
                       <button className="flex items-center gap-2 text-xs font-bold text-on-surface-variant hover:text-primary transition-colors">
                         <MessageSquare size={14} /> {post.comments}
                       </button>
                    </div>
                  </GlassCard>
                </motion.div>
              ))}
            </div>
          </section>
        </div>

        <aside className="space-y-12">
          <section>
            <h2 className="text-xs font-bold uppercase tracking-widest text-primary mb-6">Trending Hubs</h2>
            <div className="space-y-4">
              {hubs.map((hub, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + i * 0.1 }}
                >
                  <GlassCard className="flex items-center gap-4 py-4 group cursor-pointer hover:bg-surface-low transition-all">
                    <div className="w-12 h-12 rounded-2xl bg-surface-low flex items-center justify-center text-xl shadow-inner group-hover:scale-110 transition-transform">
                      {hub.icon}
                    </div>
                    <div>
                      <h3 className="font-bold text-on-surface">{hub.name}</h3>
                      <p className="text-xs text-on-surface-variant">{hub.members} members • {hub.active} active</p>
                    </div>
                  </GlassCard>
                </motion.div>
              ))}
            </div>
          </section>

          <section className="p-8 bg-surface-lowest rounded-3xl border border-outline-variant relative overflow-hidden">
             <div className="absolute top-0 right-0 p-4 opacity-10">
                <Users size={80} />
             </div>
             <h3 className="text-xl font-bold mb-4">Start a Conversation</h3>
             <p className="text-sm text-on-surface-variant mb-6">
               Have a question or want to share something? Join over 1M+ active community members.
             </p>
             <button className="w-full py-3 bg-primary text-on-primary rounded-xl font-bold text-sm hover:scale-[1.02] transition-transform">
               Join the Discord
             </button>
          </section>
        </aside>
      </div>
    </div>
  );
}
