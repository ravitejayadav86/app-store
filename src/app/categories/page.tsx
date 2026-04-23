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
      case "games": return { icon: <Gamepad2 size={24} />, color: "bg-orange-500/10 text-orange-500" };
      case "productivity": return { icon: <Briefcase size={24} />, color: "bg-blue-500/10 text-blue-500" };
      case "graphics": return { icon: <Palette size={24} />, color: "bg-pink-500/10 text-pink-500" };
      case "utilities": return { icon: <Zap size={24} />, color: "bg-yellow-500/10 text-yellow-500" };
      case "social": return { icon: <MessageCircle size={24} />, color: "bg-green-500/10 text-green-500" };
      case "development": return { icon: <Code2 size={24} />, color: "bg-purple-500/10 text-purple-500" };
      case "music": return { icon: <Music size={24} />, color: "bg-indigo-500/10 text-indigo-500" };
      case "books": return { icon: <BookOpen size={24} />, color: "bg-red-500/10 text-red-500" };
      default: return { icon: <Package size={24} />, color: "bg-emerald-500/10 text-emerald-500" };
    }
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get("/apps/");
        const apps = res.data;
        const counts: Record<string, number> = {};
        apps.forEach((app: any) => {
          counts[app.category] = (counts[app.category] || 0) + 1;
        });

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
         <Loader2 className="animate-spin text-primary mb-4" size={40} />
         <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Mapping Ecosystem...</p>
       </div>
     );
  }

  return (
    <div className="flex flex-col gap-10 pb-20">
      <section className="px-4 md:px-8">
        <div className="relative h-[250px] md:h-[400px] w-full max-w-7xl mx-auto rounded-[2.5rem] overflow-hidden bg-black p-8 md:p-12 text-white flex flex-col justify-end gap-4 shadow-2xl">
          <div className="absolute inset-0 bg-linear-to-tr from-black via-black/80 to-primary/20" />
          <div className="relative z-10 max-w-2xl">
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 mb-2 bg-white/10 w-fit px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest backdrop-blur-md border border-white/10"
            >
              <Zap size={12} fill="currentColor" />
              <span>Taxonomy v4.0</span>
            </motion.div>
            <h1 className="text-3xl md:text-5xl font-black tracking-tighter leading-none mb-2">Segmented Flow.</h1>
            <p className="text-[11px] md:text-base text-gray-400 font-medium max-w-sm">Find exactly what you need with our real-time application organization.</p>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 md:px-8 w-full">
        {categories.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {categories.map((cat, index) => (
              <motion.div
                key={cat.name}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
              >
                <div className="group bg-white border border-outline-variant/10 rounded-[2rem] p-4 transition-all hover:shadow-xl hover:border-primary/20 hover:-translate-y-1 cursor-pointer">
                  <div className={`w-12 h-12 rounded-xl ${cat.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-500`}>
                    {cat.icon}
                  </div>
                  <div>
                    <h2 className="text-sm font-black text-on-surface tracking-tight group-hover:text-primary transition-colors truncate">
                      {cat.name}
                    </h2>
                    <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mt-1">{cat.count} {cat.count === 1 ? 'Node' : 'Nodes'}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="py-20 text-center bg-surface-low rounded-[2.5rem] border border-dashed border-outline-variant/20">
             <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Empty Registry</p>
          </div>
        )}
      </section>
    </div>
  );
}
