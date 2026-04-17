"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { Gamepad2, Trophy, Zap, Star, Loader2, Code2 } from "lucide-react";
import api from "@/lib/api";
import Link from "next/link";

interface Game {
  id: number;
  name: string;
  category: string;
  developer: string;
  price: number;
  version: string;
}

export default function GamesPage() {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const res = await api.get("/apps/");
        // Filter for games category
        const filtered = res.data.filter((app: Game) => 
          app.category.toLowerCase() === "games" || 
          app.category.toLowerCase() === "game"
        );
        setGames(filtered);
      } catch (error) {
        console.error("Failed to fetch games:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchGames();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-surface">
        <Loader2 className="animate-spin text-primary mb-4" size={48} />
        <p className="text-on-surface-variant">Loading Games...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-20 pb-20 px-4 md:px-8">
      <section>
        <div className="relative h-[400px] w-full max-w-7xl mx-auto rounded-3xl overflow-hidden bg-linear-to-br from-primary to-primary-dim p-12 text-on-primary flex flex-col justify-end gap-6 shadow-2xl">
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 1.5 }} className="absolute top-0 right-0 w-[400px] h-[400px] bg-white/10 rounded-full blur-[100px] -mr-40 -mt-40" />
          <div className="relative z-10 max-w-2xl">
            <div className="flex items-center gap-2 mb-4 bg-white/10 w-fit px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-md border border-white/20">
              <Gamepad2 size={14} />
              <span>Premium Collection</span>
            </div>
            <h1 className="text-5xl font-bold tracking-tight mb-4">Play Without Limits.</h1>
            <p className="text-lg text-on-primary/80">Discover the best community-developed games.</p>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-3 mb-8">
          <Trophy className="text-primary" />
          <h2 className="text-3xl font-bold text-on-surface">Available Games</h2>
        </div>
        
        {games.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {games.map((game, index) => (
              <motion.div key={game.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + index * 0.08 }}>
                <Link href={`/apps/${game.id}`}>
                  <GlassCard className="flex flex-col gap-4 h-full hover:bg-surface-low transition-colors group">
                    <div className="w-14 h-14 rounded-2xl bg-surface-low flex items-center justify-center text-2xl shadow-inner group-hover:scale-110 transition-transform">
                      <Gamepad2 className="text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold mb-1 truncate group-hover:text-primary transition-colors">{game.name}</h3>
                      <p className="text-sm text-on-surface-variant">{game.developer}</p>
                    </div>
                    <div className="flex items-center justify-between mt-auto">
                      <span className="text-xs font-semibold bg-primary/10 text-primary px-2 py-0.5 rounded uppercase">
                        {game.price === 0 ? "Free" : `$${game.price}`}
                      </span>
                      <Button size="sm">Details</Button>
                    </div>
                  </GlassCard>
                </Link>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="py-20 text-center bg-surface-low rounded-3xl border border-dashed border-outline-variant">
             <p className="text-on-surface-variant text-lg">No games have been submitted yet.</p>
             <Link href="/publisher/upload">
               <Button variant="secondary" className="mt-4">Submit a Game</Button>
             </Link>
          </div>
        )}
      </section>
    </div>
  );
}
