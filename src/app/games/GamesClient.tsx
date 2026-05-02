"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { Gamepad2, Trophy } from "lucide-react";
import api from "@/lib/api";
import Link from "next/link";
import Image from "next/image";

interface Game {
  id: number;
  name: string;
  category: string;
  developer: string;
  price: number;
  version: string;
}

interface Props {
  initialGames?: Game[];
}

export default function GamesClient({ initialGames = [] }: Props) {
  const [games, setGames] = useState<Game[]>(initialGames);

  useEffect(() => {
    if (initialGames.length > 0) return;
    const fetchGames = async () => {
      try {
        const res = await api.get("/apps/");
        const filtered = res.data.filter((app: Game) => 
          app.category.toLowerCase() === "games" || 
          app.category.toLowerCase() === "game"
        );
        setGames(filtered);
      } catch (error) {
        console.error("Failed to fetch games:", error);
      }
    };
    fetchGames();
  }, [initialGames.length]);

  return (
    <div className="flex flex-col gap-20 pb-20 px-4 md:px-8">
      <section>
        <div className="relative h-[400px] md:h-[500px] w-full max-w-7xl mx-auto rounded-3xl overflow-hidden bg-linear-to-br from-primary to-primary-dim p-6 md:p-12 text-on-primary flex flex-col justify-end gap-4 md:gap-6 shadow-2xl">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="absolute top-0 right-0 w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-white/10 rounded-full blur-[80px] md:blur-[100px] -mr-20 md:-mr-40 -mt-20 md:-mt-40"
          />
          <div className="relative z-10 max-w-2xl">
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="flex items-center gap-2 mb-3 md:mb-4 bg-white/10 w-fit px-3 py-1 rounded-full text-[10px] md:text-xs font-semibold backdrop-blur-md border border-white/20"
            >
              <Gamepad2 size={12} className="md:w-3.5 md:h-3.5" />
              <span>Gaming Hub</span>
            </motion.div>
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold tracking-tight mb-3 md:mb-6">Play Anytime.</h1>
            <p className="text-sm md:text-xl text-on-primary/80 mb-6 md:mb-8 leading-relaxed">
              Immerse yourself in games built by top independent creators.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
              <Button size="lg" className="bg-white text-primary w-full sm:w-auto">Explore Games</Button>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-3 mb-8">
          <Trophy className="text-primary" />
          <h2 className="text-3xl font-bold text-on-surface">Available Games</h2>
        </div>
        
        {games.length > 0 ? (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 gap-x-4 gap-y-8">
            {games.map((game, index) => (
              <motion.div key={game.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + index * 0.05 }}>
                <Link href={`/apps/${game.id}`}>
                  <div className="flex flex-col gap-2 group cursor-pointer w-full">
                    <div className="w-full aspect-square rounded-[22%] bg-surface-low shadow-sm border border-outline-variant/10 relative overflow-hidden group-hover:shadow-md transition-all">
                      {game.icon_url ? (
                        <Image src={game.icon_url} alt={game.name} fill className="object-cover" sizes="(max-width: 768px) 110px, 130px" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-3xl font-bold bg-primary/10 text-primary">{game.name[0]}</div>
                      )}
                    </div>
                    <div className="mt-1 px-0.5">
                      <h3 className="text-[13px] md:text-sm font-medium text-on-surface line-clamp-2 leading-tight group-hover:text-primary transition-colors">{game.name}</h3>
                      <div className="flex items-center gap-1 mt-1 text-[11px] text-on-surface-variant">
                        <span className="font-semibold">{game.price === 0 ? "Free" : `$${game.price}`}</span>
                        <span>•</span>
                        <span className="truncate">{game.developer || "Unknown"}</span>
                      </div>
                    </div>
                  </div>
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
