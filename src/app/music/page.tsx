"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { Music, Headphones, Loader2 } from "lucide-react";
import api from "@/lib/api";
import Link from "next/link";

interface MusicApp {
  id: number;
  name: string;
  description: string;
  developer: string;
  price: number;
  version: string;
  category: string;
}

const COLORS = [
  "bg-pink-500", "bg-purple-500", "bg-blue-500",
  "bg-orange-500", "bg-cyan-500", "bg-emerald-500",
  "bg-yellow-500", "bg-red-500",
];

export default function MusicPage() {
  const [tracks, setTracks] = useState<MusicApp[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/apps/")
      .then((res) => {
        const filtered = res.data.filter((app: MusicApp) =>
          app.category?.toLowerCase() === "music"
        );
        setTracks(filtered);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex flex-col gap-12 md:gap-20 pb-20 pt-4 md:pt-0">
      <section className="px-4 md:px-8">
        <div className="relative h-[380px] md:h-[500px] w-full max-w-7xl mx-auto rounded-[2.5rem] overflow-hidden bg-gradient-to-br from-pink-900 to-purple-900 p-8 md:p-12 text-white flex flex-col justify-end gap-4 shadow-2xl">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="absolute top-0 right-0 w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-pink-500/20 rounded-full blur-[100px] -mr-20 -mt-20"
          />
          <div className="relative z-10 max-w-2xl">
            <div className="flex items-center gap-2 mb-3 bg-white/10 w-fit px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest backdrop-blur-md border border-white/20">
              <Music size={12} />
              <span>Music Ecosystem</span>
            </div>
            <h1 className="text-4xl md:text-7xl font-black tracking-tight mb-2">Feel the Rhythm.</h1>
            <p className="text-sm md:text-xl text-white/80 mb-2 font-medium max-w-sm">
              Discover community-published music tracks on PandaStore. All free.
            </p>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 md:px-8 w-full">
        <div className="flex items-center gap-3 mb-8">
          <Headphones className="text-primary" />
          <h2 className="text-3xl font-bold text-on-surface">Available Tracks</h2>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="animate-spin text-primary" size={40} />
          </div>
        ) : tracks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {tracks.map((track, index) => (
              <motion.div
                key={track.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + index * 0.08 }}
              >
                <Link href={`/apps/${track.id}`}>
                  <GlassCard className="flex flex-col gap-4 h-full hover:bg-surface-low transition-colors group cursor-pointer">
                    <div className={`w-16 h-16 rounded-2xl ${COLORS[index % COLORS.length]} flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform`}>
                      <Music size={28} className="text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold mb-1 truncate group-hover:text-primary transition-colors">{track.name}</h3>
                      <p className="text-sm text-on-surface-variant">{track.developer}</p>
                    </div>
                    <div className="flex items-center justify-between mt-auto">
                      <span className="text-xs font-semibold bg-primary/10 text-primary px-2 py-0.5 rounded uppercase">
                        {track.price === 0 ? "Free" : `$${track.price}`}
                      </span>
                      <Button size="sm">Listen</Button>
                    </div>
                  </GlassCard>
                </Link>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="py-20 text-center bg-surface-low rounded-3xl border border-dashed border-outline-variant">
            <Music size={48} className="mx-auto mb-4 text-on-surface-variant opacity-30" />
            <p className="text-on-surface-variant text-lg">No music published yet.</p>
            <Link href="/publisher/upload?category=Music&price=0">
              <Button variant="secondary" className="mt-4">Publish a Track</Button>
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}
