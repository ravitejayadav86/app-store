"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { Search, Download, Package, Loader2, Clock, Activity } from "lucide-react";
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

  const COLORS: Record<string, string> = {
    music: "bg-pink-500", books: "bg-purple-500", games: "bg-emerald-500",
    development: "bg-yellow-500", productivity: "bg-blue-500", graphics: "bg-orange-500",
  };

  return (
    <div className="flex flex-col gap-20 pb-20">
      <section className="px-4 md:px-8">
        <div className="relative h-[400px] w-full max-w-7xl mx-auto rounded-3xl overflow-hidden bg-gradient-to-br from-primary to-indigo-900 p-12 text-white flex flex-col justify-end gap-6 shadow-2xl">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="absolute top-0 right-10 w-[500px] h-[500px] bg-white/10 rounded-full blur-[100px] -mr-40 -mt-40"
          />
          <div className="relative z-10 max-w-2xl">
            <div className="flex items-center gap-2 mb-4 bg-white/10 w-fit px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-md border border-white/20">
              <Package size={14} />
              <span>Your Library</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-4">Your Collection.</h1>
            <p className="text-lg md:text-xl text-white/80 mb-2">All apps, music, and books you&apos;ve downloaded — in one place.</p>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 md:px-8 w-full">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-12">
          <div className="flex gap-2 p-1 bg-surface-low rounded-2xl w-fit border border-outline-variant overflow-x-auto no-scrollbar">
            {categories.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-2 rounded-xl text-sm font-bold tracking-tight transition-all whitespace-nowrap ${
                  activeTab === tab
                    ? "bg-surface-lowest text-primary shadow-sm"
                    : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
          <div className="w-full md:w-auto flex items-center gap-4">
            <Link href="/library/updates">
              <Button variant="secondary" className="flex items-center gap-2 px-6">
                <Activity size={18} className="text-primary" />
                <span>Downloads & Updates</span>
              </Button>
            </Link>
            <div className="flex-1 md:w-96 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant" size={18} />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search your library..."
                className="w-full pl-12 pr-4 py-3 rounded-2xl glass border border-outline-variant focus:outline-none focus:ring-2 focus:ring-primary/20 placeholder:text-on-surface-variant/50 transition-all font-medium"
              />
            </div>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
                  <Link href={`/apps/${app.id}`}>
                    <GlassCard className="flex items-center gap-6 group hover:bg-surface-low transition-all cursor-pointer">
                      <div className={`w-20 h-20 rounded-2xl ${color} flex items-center justify-center text-white shadow-inner group-hover:scale-110 transition-transform duration-500`}>
                        <Package size={28} />
                      </div>
                      <div className="flex-grow">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-xl font-bold text-on-surface group-hover:text-primary transition-colors">{app?.name}</h3>
                            <p className="text-[10px] text-on-surface-variant uppercase tracking-widest font-bold mt-1 opacity-70">
                              {app?.category} • v{app?.version}
                            </p>
                          </div>
                        </div>
                          <div className="flex items-center gap-4">
                            <span className="flex items-center gap-1.5 text-[10px] font-bold text-green-600 bg-green-500/10 px-2.5 py-1 rounded-full uppercase tracking-wider">
                              <Download size={12} /> Owned
                            </span>
                            {!app?.file_path && (
                              <span className="text-[10px] font-bold text-red-500 uppercase tracking-tighter">File Removed</span>
                            )}
                          </div>
                          <Button size="sm" variant="tertiary" disabled={!app?.file_path}>
                            {app?.file_path ? "Open" : "N/A"}
                          </Button>
                        </div>
                      </div>
                    </GlassCard>
                  </Link>
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
