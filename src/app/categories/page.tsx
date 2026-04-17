"use client";

import React, { useEffect, useState } from "react";
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
  HeartPulse,
  Loader2,
  Package
} from "lucide-react";
import api from "@/lib/api";
import Link from "next/link";

interface CategoryInfo {
  name: string;
  icon: React.ReactNode;
  count: number;
  color: string;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<CategoryInfo[]>([]);
  const [loading, setLoading] = useState(true);

  const getCategoryTheme = (name: string) => {
    switch (name.toLowerCase()) {
      case "games": return { icon: <Gamepad2 size={32} />, color: "bg-orange-500/10 text-orange-500" };
      case "productivity": return { icon: <Briefcase size={32} />, color: "bg-blue-500/10 text-blue-500" };
      case "graphics": return { icon: <Palette size={32} />, color: "bg-pink-500/10 text-pink-500" };
      case "utilities": return { icon: <Zap size={32} />, color: "bg-yellow-500/10 text-yellow-500" };
      case "social": return { icon: <MessageCircle size={32} />, color: "bg-green-500/10 text-green-500" };
      case "development": return { icon: <Code2 size={32} />, color: "bg-purple-500/10 text-purple-500" };
      case "music": return { icon: <Music size={32} />, color: "bg-indigo-500/10 text-indigo-500" };
      case "books": return { icon: <BookOpen size={32} />, color: "bg-red-500/10 text-red-500" };
      default: return { icon: <Package size={32} />, color: "bg-emerald-500/10 text-emerald-500" };
    }
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get("/apps/");
        const apps = res.data;
        
        // Count apps per category
        const counts: Record<string, number> = {};
        apps.forEach((app: any) => {
          counts[app.category] = (counts[app.category] || 0) + 1;
        });

        // Map to CategoryInfo objects
        const derivedCategories = Object.keys(counts).map(name => {
          const theme = getCategoryTheme(name);
          return {
            name,
            icon: theme.icon,
            count: counts[name],
            color: theme.color,
          };
        });

        setCategories(derivedCategories);
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  if (loading) {
     return (
       <div className="min-h-screen flex flex-col items-center justify-center bg-surface">
         <Loader2 className="animate-spin text-primary mb-4" size={48} />
         <p className="text-on-surface-variant">Mapping Ecosystem...</p>
       </div>
     );
  }

  return (
    <div className="flex flex-col gap-20 pb-20">
      <section className="px-4 md:px-8">
        <div className="relative h-[600px] w-full max-w-7xl mx-auto rounded-3xl overflow-hidden bg-linear-to-br from-primary to-primary-dim p-12 text-on-primary flex flex-col justify-end gap-6 shadow-2xl shadow-primary/20">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }} 
            animate={{ scale: 1, opacity: 1 }} 
            transition={{ duration: 1.5, ease: "easeOut" }} 
            className="absolute top-0 right-10 w-[500px] h-[500px] bg-white/10 rounded-full blur-[100px] -mr-40 -mt-40" 
          />
          <div className="relative z-10 max-w-2xl">
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="flex items-center gap-2 mb-4 bg-white/10 w-fit px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-md border border-white/20"
            >
              <Zap size={14} />
              <span>Live Taxonomy</span>
            </motion.div>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-4 text-on-primary">Segment Your World.</h1>
            <p className="text-lg md:text-xl text-on-primary/80 mb-2">Find exactly what you need with our real-time application organization.</p>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 md:px-8 w-full">
        {categories.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {categories.map((cat, index) => (
              <motion.div
                key={cat.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.05 }}
              >
                <GlassCard className="h-full flex flex-col items-start gap-8 cursor-pointer group hover:bg-surface-low transition-all">
                  <div className={`p-5 rounded-2xl ${cat.color} group-hover:scale-110 transition-transform duration-500 shadow-sm`}>
                    {cat.icon}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-on-surface mb-1 group-hover:text-primary transition-colors">
                      {cat.name}
                    </h2>
                    <p className="text-sm text-on-surface-variant font-medium">{cat.count} {cat.count === 1 ? 'App' : 'Apps'}</p>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="py-20 text-center bg-surface-low rounded-3xl border border-dashed border-outline-variant">
             <p className="text-on-surface-variant text-lg font-medium">No categories found in the database.</p>
             <p className="text-on-surface-variant/60">Upload some apps to generate categories.</p>
          </div>
        )}
      </section>
    </div>
  );
}
