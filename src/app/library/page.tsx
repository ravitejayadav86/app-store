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
    <div className="flex flex-col gap-12 md:gap-20 pb-20">
      <section className="px-4 md:px-8">
        <div className="relative h-[300px] md:h-[450px] w-full max-w-7xl mx-auto rounded-3xl overflow-hidden bg-linear-to-br from-primary to-indigo-950 p-8 md:p-16 text-white flex flex-col justify-end gap-6 shadow-2xl">
          {/* Decorative background elements */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 2, ease: "easeOut" }}
            className="absolute top-0 right-0 w-[600px] h-[600px] bg-white/10 rounded-full blur-[120px] -mr-40 -mt-40"
          />
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 2, ease: "easeOut", delay: 0.3 }}
            className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-primary-dim/20 rounded-full blur-[100px] -ml-20 -mb-20"
          />
          
          <div className="relative z-10 max-w-2xl">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex items-center gap-2 mb-4 bg-white/10 w-fit px-3 py-1 rounded-full text-xs font-bold backdrop-blur-md border border-white/20"
            >
              <Package size={14} />
              <span className="uppercase tracking-widest text-[10px]">Your Workspace</span>
            </motion.div>
            <h1 className="text-4xl md:text-7xl font-bold tracking-tight mb-4 leading-none">Your Owned Collection.</h1>
            <p className="text-lg md:text-xl text-white/70 max-w-lg">Everything you&apos;ve curated, ready for your next project.</p>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 md:px-8 w-full">
        <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 mb-12">
          <div className="flex gap-2 p-1.5 bg-surface-low/50 backdrop-blur-sm rounded-2xl w-full lg:w-fit border border-outline-variant overflow-x-auto no-scrollbar">
            {categories.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-2.5 rounded-xl text-sm font-bold tracking-tight transition-all whitespace-nowrap ${
                  activeTab === tab
                    ? "bg-surface-lowest text-primary shadow-sm ring-1 ring-black/5"
                    : "text-on-surface-variant hover:text-on-surface hover:bg-white/5"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
          <div className="w-full lg:w-auto flex flex-col sm:flex-row items-center gap-4">
            <div className="w-full sm:w-80 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant" size={18} />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Find in your library..."
                className="w-full pl-12 pr-4 py-3 rounded-2xl glass border border-outline-variant focus:outline-none focus:ring-2 focus:ring-primary/20 placeholder:text-on-surface-variant/40 transition-all font-medium text-sm"
              />
            </div>
            <Link href="/library/updates" className="w-full sm:w-auto">
              <Button variant="secondary" className="w-full flex items-center justify-center gap-2 px-6 h-[46px] rounded-2xl group">
                <Activity size={18} className="text-primary group-hover:animate-pulse" />
                <span>Updates</span>
                <ChevronRight size={14} className="opacity-0 group-hover:opacity-50 group-hover:translate-x-1 transition-all" />
              </Button>
            </Link>
          </div>
        </header>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="animate-spin text-primary" size={40} />
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center bg-surface-low rounded-3xl border border-dashed border-outline-variant">
            <Package size={48} className="mx-auto mb-4 text-on-surface-variant opacity-30" />
            <p className="text-on-surface-variant text-lg font-medium">
              {search ? `No results for "${search}"` : "Your library is empty."}
            </p>
            {!search && (
              <Link href="/apps">
                <Button className="mt-4">Browse the Store</Button>
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8">
            {filtered.map((purchase, index) => {
              const app = purchase.app;
              const color = COLORS[app?.category?.toLowerCase()] || "bg-primary";
              return (
                <motion.div
                  key={purchase.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + index * 0.05 }}
                >
                  <GlassCard className="p-0 overflow-hidden group hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500 h-full border-outline-variant/50 hover:border-primary/30">
                    <div className="p-6">
                      <div className="flex items-start gap-5">
                        <div className={`w-16 h-16 md:w-20 md:h-20 rounded-2xl ${color} flex items-center justify-center text-white shadow-xl shadow-inner group-hover:scale-105 transition-transform duration-500 shrink-0`}>
                          {getCategoryIcon(app?.category)}
                        </div>
                        <div className="flex-grow min-w-0">
                          <h3 className="text-xl font-bold text-on-surface truncate group-hover:text-primary transition-colors">{app?.name}</h3>
                          <p className="text-[10px] text-on-surface-variant uppercase tracking-widest font-bold mt-1 opacity-60">
                            {app?.category} • v{app?.version}
                          </p>
                          
                          <div className="flex items-center gap-3 mt-4">
                            <span className="flex items-center gap-1.5 text-[10px] font-bold text-green-600 bg-green-500/10 px-2.5 py-1 rounded-full uppercase tracking-wider">
                              <CheckCircle2 size={12} /> Owned
                            </span>
                            {!app?.file_path && (
                              <span className="flex items-center gap-1.2 text-[10px] font-bold text-orange-500 bg-orange-500/5 px-2.5 py-1 rounded-full uppercase tracking-wider">
                                <Clock size={12} /> Awaiting Upload
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="px-6 py-4 bg-surface-low/30 border-t border-outline-variant/30 flex items-center justify-between">
                      <Link href={`/apps/${app.id}`}>
                        <Button variant="tertiary" size="sm" className="text-xs font-bold hover:gap-3 transition-all">
                          Details <ChevronRight size={14} />
                        </Button>
                      </Link>
                      <Button 
                        size="sm" 
                        variant={app?.file_path ? "primary" : "secondary"} 
                        disabled={!app?.file_path}
                        className="rounded-xl px-6 font-bold"
                      >
                        {app?.file_path ? "Open App" : "N/A"}
                      </Button>
                    </div>
                  </GlassCard>
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
