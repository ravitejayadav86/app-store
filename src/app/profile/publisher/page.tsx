"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Package, Search, Plus, Sparkles, Layout, Globe, ArrowRight, Zap, Boxes } from "lucide-react";
import api from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { motion, AnimatePresence } from "framer-motion";

export default function PublisherAppsPage() {
  const router = useRouter();
  const [apps, setApps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchApps = async () => {
      try {
        const res = await api.get("/apps/me");
        setApps(res.data);
      } catch (err) {
        console.error("Failed to fetch apps", err);
      } finally {
        setLoading(false);
      }
    };
    fetchApps();
  }, []);

  const filtered = apps.filter(app => 
    app.name.toLowerCase().includes(search.toLowerCase()) ||
    app.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-surface selection:bg-primary/10 relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-amber-500/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Premium Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-2xl border-b border-outline-variant/10 px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-5">
          <motion.button 
            whileTap={{ scale: 0.9 }}
            onClick={() => router.back()} 
            className="p-3 rounded-2xl bg-white border border-outline-variant/10 shadow-sm hover:shadow-md transition-all active:scale-90"
          >
            <ChevronLeft size={24} strokeWidth={3} />
          </motion.button>
          <div>
            <h1 className="font-black text-2xl tracking-tighter leading-none">Nexus Hub</h1>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary mt-1 opacity-60">
              {apps.length} Active Deployments
            </p>
          </div>
        </div>
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => router.push("/publisher/upload")} 
          className="w-14 h-14 rounded-2xl bg-black text-white flex items-center justify-center shadow-2xl shadow-black/20 hover:bg-primary transition-all duration-300"
        >
          <Plus size={28} strokeWidth={3} />
        </motion.button>
      </header>

      <div className="max-w-2xl mx-auto px-6 py-8 space-y-8 relative z-10">
        {/* Search Section */}
        <div className="relative group">
          <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-primary transition-colors">
            <Search size={20} strokeWidth={3} />
          </div>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Scan deployment registry..."
            className="w-full bg-white border border-outline-variant/20 rounded-[2rem] pl-14 pr-6 py-5 text-sm font-bold outline-none focus:ring-[12px] focus:ring-primary/5 focus:border-primary/20 transition-all shadow-xl shadow-black/[0.02]"
          />
        </div>

        {/* Publications List */}
        <div className="space-y-4 pb-32">
          {loading ? (
            <div className="py-32 flex flex-col items-center gap-6">
              <div className="w-14 h-14 border-[6px] border-primary/10 border-t-primary rounded-full animate-spin" />
              <p className="text-[11px] font-black uppercase tracking-[0.3em] text-gray-400 animate-pulse">Retrieving Assets...</p>
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              {filtered.length > 0 ? (
                filtered.map((app, index) => (
                  <motion.div
                    key={app.id}
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ delay: index * 0.05, type: "spring", stiffness: 100 }}
                    onClick={() => router.push(`/apps/${app.id}`)}
                    className="group flex items-center justify-between gap-4 p-5 rounded-[2.5rem] bg-white border border-outline-variant/10 shadow-lg shadow-black/[0.01] hover:shadow-2xl hover:shadow-primary/5 hover:border-primary/20 transition-all cursor-pointer overflow-hidden relative"
                  >
                    <div className="flex items-center gap-5 relative z-10">
                      <div className="w-18 h-18 rounded-[1.75rem] bg-surface-low overflow-hidden flex items-center justify-center border-[3px] border-white shadow-xl group-hover:scale-105 transition-transform duration-500">
                        {app.icon_url ? (
                          <img src={app.icon_url} className="w-full h-full object-cover" />
                        ) : (
                          <Package size={32} strokeWidth={1.5} className="text-gray-300" />
                        )}
                      </div>
                      <div>
                        <p className="font-black text-xl tracking-tighter group-hover:text-primary transition-colors">{app.name}</p>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-[9px] font-black uppercase tracking-[0.2em] text-primary bg-primary/5 px-3 py-1 rounded-full border border-primary/10">{app.category}</span>
                          <span className="text-[9px] font-black uppercase tracking-widest text-gray-300">v{app.version}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 relative z-10">
                      <Button size="sm" variant="secondary" className="rounded-full px-6 font-black text-[10px] uppercase tracking-widest bg-gray-50 border-transparent hover:bg-black hover:text-white transition-all">
                        Edit
                      </Button>
                      <div className="w-10 h-10 rounded-full bg-surface-low flex items-center justify-center group-hover:bg-primary/10 group-hover:text-primary transition-all">
                        <ArrowRight size={18} strokeWidth={3} />
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="py-32 text-center space-y-8"
                >
                  <div className="w-24 h-24 rounded-[2.5rem] bg-surface-low border border-outline-variant/10 flex items-center justify-center mx-auto shadow-inner">
                     <Boxes size={40} className="text-gray-200" strokeWidth={1.5} />
                  </div>
                  <div className="space-y-2">
                    <p className="text-2xl font-black tracking-tighter text-gray-900">Zero Deployments</p>
                    <p className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-400 max-w-[240px] mx-auto leading-relaxed">The Nexus is empty. Synchronize your first innovation now.</p>
                  </div>
                  <Button onClick={() => router.push("/publisher/upload")} className="px-10 py-7 rounded-full font-black uppercase tracking-[0.2em] text-[11px] shadow-2xl shadow-primary/20">
                    Publish Now
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </div>
      </div>
    </div>
  );
}
