"use client";

import { motion } from "framer-motion";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { Gamepad2, Trophy, Zap, Star } from "lucide-react";

export default function GamesPage() {
  const games = [
    { title: "Stellar Odyssey", category: "Adventure", badge: "Top Rated", icon: <Zap className="text-yellow-500" /> },
    { title: "Shadow Realm", category: "RPG", badge: "New", icon: <Star className="text-purple-500" /> },
    { title: "Turbo Dash", category: "Racing", badge: "Hot", icon: <Gamepad2 className="text-red-500" /> },
    { title: "Puzzle Master", category: "Puzzle", badge: "Free", icon: <Trophy className="text-cyan-500" /> },
    { title: "Galaxy Wars", category: "Strategy", badge: "Top Rated", icon: <Zap className="text-pink-500" /> },
    { title: "Jungle Run", category: "Action", badge: "New", icon: <Star className="text-green-500" /> },
    { title: "City Builder", category: "Simulation", badge: "Hot", icon: <Gamepad2 className="text-blue-500" /> },
    { title: "Word Quest", category: "Casual", badge: "Free", icon: <Trophy className="text-orange-500" /> },
  ];

  return (
    <div className="flex flex-col gap-20 pb-20 px-4 md:px-8">
      <section>
        <div className="relative h-[400px] w-full max-w-7xl mx-auto rounded-3xl overflow-hidden bg-linear-to-br from-primary to-primary-dim p-12 text-on-primary flex flex-col justify-end gap-6 shadow-2xl">
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 1.5 }} className="absolute top-0 right-0 w-[400px] h-[400px] bg-white/10 rounded-full blur-[100px] -mr-40 -mt-40" />
          <div className="relative z-10 max-w-2xl">
            <div className="flex items-center gap-2 mb-4 bg-white/10 w-fit px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-md border border-white/20">
              <Gamepad2 size={14} />
              <span>Games</span>
            </div>
            <h1 className="text-5xl font-bold tracking-tight mb-4">Play Without Limits.</h1>
            <p className="text-lg text-on-primary/80">Discover the best games across every genre.</p>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-3 mb-8">
          <Trophy className="text-primary" />
          <h2 className="text-3xl font-bold text-on-surface">Top Games</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {games.map((game, index) => (
            <motion.div key={index} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + index * 0.08 }}>
              <GlassCard className="flex flex-col gap-4 h-full">
                <div className="w-14 h-14 rounded-2xl bg-surface-low flex items-center justify-center text-2xl shadow-inner">
                  {game.icon}
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-1">{game.title}</h3>
                  <p className="text-sm text-on-surface-variant">{game.category}</p>
                </div>
                <div className="flex items-center justify-between mt-auto">
                  <span className="text-xs font-semibold bg-primary/10 text-primary px-2 py-0.5 rounded">{game.badge}</span>
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