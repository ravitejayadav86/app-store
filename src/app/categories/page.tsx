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
  Package,
  ChevronRight
} from "lucide-react";
import api from "@/lib/api";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface CategoryInfo {
  name: string;
  icon: React.ReactNode;
  count: number;
  color: string;
}

export default function CategoriesPage() {
  const router = useRouter();
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

  const handleCategoryClick = (name: string) => {
    const slug = name.toLowerCase();
    if (slug === "music") router.push("/music");
    else if (slug === "games") router.push("/games");
    else if (slug === "books") router.push("/books");
    else router.push(`/discover?category=${name}`);
  };

  if (loading) {
     return (
       <div className="min-h-screen flex flex-col items-center justify-center bg-surface">
         <Loader2 className="animate-spin text-primary mb-4" size={48} />
         <p className="text-on-surface-variant">Mapping Ecosystem...</p>
       </div>
     );
  }

  return (
    <div className="flex flex-col gap-12 md:gap-20 pb-20 pt-4 md:pt-0">
      <section className="px-3 md:px-8 mt-2 md:mt-0">
        <div className="relative h-[220px] md:h-[500px] w-full max-w-7xl mx-auto rounded-[1.5rem] md:rounded-[2.5rem] overflow-hidden bg-gradient-to-br from-primary to-primary-dim p-6 md:p-12 text-on-primary flex flex-col justify-end gap-2 md:gap-4 shadow-xl shadow-primary/20">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }} 
            animate={{ scale: 1, opacity: 1 }} 
            transition={{ duration: 1.5, ease: "easeOut" }} 
            className="absolute top-0 right-0 md:right-10 w-[150px] md:w-[500px] h-[150px] md:h-[500px] bg-white/10 rounded-full blur-[50px] md:blur-[100px] -mr-10 md:-mr-20 -mt-10 md:-mt-20" 
          />
          <div className="relative z-10 max-w-2xl">
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="flex items-center gap-1.5 md:gap-2 mb-2 md:mb-3 bg-white/10 w-fit px-2.5 py-1 md:px-3 md:py-1 rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-widest backdrop-blur-md border border-white/20"
            >
              <Zap size={10} className="md:w-3 md:h-3" />
              <span>Live Taxonomy</span>
            </motion.div>
            <h1 className="text-3xl sm:text-5xl md:text-7xl font-black tracking-tight mb-1 md:mb-2 text-on-primary leading-tight">Segment<br className="md:hidden" /> Your World.</h1>
            <p className="text-xs md:text-xl text-on-primary/80 font-medium max-w-[250px] md:max-w-sm leading-relaxed">Find exactly what you need instantly.</p>
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
                onClick={() => handleCategoryClick(cat.name)}
                className="cursor-pointer group"
              >
                  <div className="h-full flex flex-row md:flex-col items-center md:items-start gap-4 md:gap-8 bg-surface-low border border-outline-variant/30 rounded-2xl md:rounded-[2rem] hover:bg-surface-variant/30 hover:border-primary/20 transition-all p-3 md:p-6 shadow-sm hover:shadow-md">
                  <div className={`p-3 md:p-5 rounded-xl md:rounded-2xl flex-shrink-0 ${cat.color} group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-sm`}>
                    {React.cloneElement(cat.icon as React.ReactElement, { className: "w-5 h-5 md:w-8 md:h-8" })}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-base md:text-xl font-bold text-on-surface mb-0.5 md:mb-1 truncate group-hover:text-primary transition-colors">
                      {cat.name}
                    </h2>
                    <p className="text-[11px] md:text-sm text-on-surface-variant font-medium truncate">{cat.count} {cat.count === 1 ? 'App' : 'Apps'}</p>
                  </div>
                  <div className="md:hidden pr-2">
                    <ChevronRight size={18} className="text-on-surface-variant/40 group-hover:text-primary transition-colors group-hover:translate-x-1" />
                  </div>
                </div>
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
