"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { Search, Download, Package, Loader2, Clock, Activity, Layout, Database, Cloud, Sparkles, Music, BookOpen, Gamepad2, Briefcase, ChevronRight, CheckCircle2, AlertCircle } from "lucide-react";
import api from "@/lib/api";
import Link from "next/link";

interface PurchasedApp {
  id: number;
  name: string;
  category: string;
  developer: string;
  price: number;
  version: string;
  file_path?: string | null;
}

interface Purchase {
  id: number;
  app_id: number;
  purchased_at: string;
  app: PurchasedApp;
}

export default function LibraryPage() {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("All");

  useEffect(() => {
    api.get("/users/me/purchases")
      .then((res) => setPurchases(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const categories = ["All", ...Array.from(new Set(purchases.map((p) => p.app?.category).filter(Boolean)))];

  const filtered = purchases.filter((p) => {
    const app = p.app;
    if (!app) return false;
    const matchesSearch = !search ||
      app.name.toLowerCase().includes(search.toLowerCase()) ||
      app.developer.toLowerCase().includes(search.toLowerCase());
    const matchesTab = activeTab === "All" || app.category?.toLowerCase() === activeTab.toLowerCase();
    return matchesSearch && matchesTab;
  });

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case "productivity": return <Briefcase size={28} />;
      case "development": return <Database size={28} />;
      case "utilities": return <Cloud size={28} />;
      case "graphics": return <Sparkles size={28} />;
      case "music": return <Music size={28} />;
      case "books": return <BookOpen size={28} />;
      case "games": return <Gamepad2 size={28} />;
      default: return <Package size={28} />;
    }
  };

  const COLORS: Record<string, string> = {
    music: "bg-pink-500",
    books: "bg-purple-500",
    games: "bg-emerald-500",
    development: "bg-yellow-500",
    productivity: "bg-blue-600",
    graphics: "bg-orange-500",
    utilities: "bg-cyan-500",
  };

  return (
    <div className="flex flex-col gap-10 pb-20">
      <section className="px-4 md:px-8">
        <div className="relative h-[250px] md:h-[400px] w-full max-w-7xl mx-auto rounded-[2.5rem] overflow-hidden bg-black p-8 md:p-12 text-white flex flex-col justify-end gap-3 shadow-2xl">
          <div className="absolute inset-0 bg-linear-to-tr from-black via-black/80 to-primary/10" />
          
          <div className="relative z-10 max-w-2xl">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 mb-2 bg-white/10 w-fit px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest backdrop-blur-md border border-white/10"
            >
              <Package size={12} />
              <span>Asset Vault</span>
            </motion.div>
            <h1 className="text-3xl md:text-5xl font-black tracking-tighter leading-none mb-1">Your Collection.</h1>
            <p className="text-[11px] md:text-base text-gray-400 font-medium max-w-xs">Everything you&apos;ve curated, ready for your next project.</p>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 md:px-8 w-full">
        <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-10">
          <div className="flex gap-2 p-1.5 bg-surface-low/50 backdrop-blur-sm rounded-2xl w-full lg:w-fit border border-outline-variant overflow-x-auto no-scrollbar">
            {categories.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                  activeTab === tab
                    ? "bg-black text-white shadow-lg"
                    : "text-on-surface-variant hover:text-on-surface hover:bg-white/5"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
          <div className="w-full lg:w-auto flex flex-col sm:flex-row items-center gap-3">
            <div className="w-full sm:w-64 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant" size={14} />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Filter library..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-outline-variant/30 focus:outline-none focus:ring-4 focus:ring-primary/5 placeholder:text-gray-400 transition-all font-semibold text-[12px]"
              />
            </div>
            <Link href="/library/updates" className="w-full sm:w-auto">
              <Button variant="secondary" className="w-full flex items-center justify-center gap-2 px-6 h-10 rounded-xl group text-[11px] font-black uppercase tracking-widest">
                <Activity size={14} className="text-primary group-hover:animate-pulse" />
                <span>Signals</span>
              </Button>
            </Link>
          </div>
        </header>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="animate-spin text-primary" size={32} />
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center bg-surface-low rounded-[2.5rem] border border-dashed border-outline-variant/20">
            <Package size={32} className="mx-auto mb-3 text-on-surface-variant opacity-20" />
            <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">
              {search ? `No matches for "${search}"` : "Vault Empty"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((purchase, index) => {
              const app = purchase.app;
              const color = COLORS[app?.category?.toLowerCase()] || "bg-black";
              return (
                <motion.div
                  key={purchase.id}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <div className="bg-white border border-outline-variant/10 rounded-[2rem] p-4 group hover:shadow-xl hover:border-primary/20 transition-all flex flex-col gap-4">
                    <div className="flex items-center gap-4">
                      <div className={`w-14 h-14 rounded-[1.25rem] ${color} flex items-center justify-center text-white shadow-lg group-hover:scale-105 transition-transform duration-500 shrink-0`}>
                        {getCategoryIcon(app?.category)}
                      </div>
                      <div className="flex-grow min-w-0">
                        <h3 className="text-sm font-black text-on-surface truncate group-hover:text-primary transition-colors tracking-tight">{app?.name}</h3>
                        <p className="text-[9px] text-gray-400 uppercase font-black tracking-widest mt-0.5">
                          {app?.category} • v{app?.version}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                       <span className="flex items-center gap-1 text-[8px] font-black text-green-600 bg-green-500/5 px-2 py-0.5 rounded-full uppercase tracking-wider border border-green-500/10">
                         <CheckCircle2 size={8} /> Authorized
                       </span>
                       {!app?.file_path && (
                         <span className="flex items-center gap-1 text-[8px] font-black text-orange-500 bg-orange-500/5 px-2 py-0.5 rounded-full uppercase tracking-wider border border-orange-500/10">
                           <Clock size={8} /> Pending Sync
                         </span>
                       )}
                    </div>

                    <div className="flex items-center gap-2 mt-2">
                      <Link href={`/apps/${app.id}`} className="flex-1">
                        <Button variant="secondary" size="sm" className="w-full h-9 rounded-lg text-[10px] font-black uppercase tracking-widest">
                          Info
                        </Button>
                      </Link>
                      <Button 
                        size="sm" 
                        variant={app?.file_path ? "primary" : "secondary"} 
                        disabled={!app?.file_path}
                        className="flex-1 h-9 rounded-lg text-[10px] font-black uppercase tracking-widest"
                      >
                        {app?.file_path ? "Initialize" : "Waiting"}
                      </Button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </section>

      <style dangerouslySetInnerHTML={{ __html: `.no-scrollbar::-webkit-scrollbar{display:none}.no-scrollbar{-ms-overflow-style:none;scrollbar-width:none}` }} />
    </div>
  );
}
