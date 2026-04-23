"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, User, Search, UserPlus, ShieldCheck, Zap } from "lucide-react";
import api from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { motion, AnimatePresence } from "framer-motion";

export default function FollowersPage() {
  const router = useRouter();
  const [followers, setFollowers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchFollowers = async () => {
      try {
        const res = await api.get("/social/me/followers");
        setFollowers(res.data);
      } catch (err) {
        console.error("Failed to fetch followers", err);
      } finally {
        setLoading(false);
      }
    };
    fetchFollowers();
  }, []);

  const filtered = followers.filter(f => 
    f.username.toLowerCase().includes(search.toLowerCase()) ||
    (f.full_name && f.full_name.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-surface selection:bg-primary/10 relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Premium Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-2xl border-b border-outline-variant/10 px-6 py-6 flex items-center gap-5">
        <motion.button 
          whileTap={{ scale: 0.9 }}
          onClick={() => router.back()} 
          className="p-3 rounded-2xl bg-white border border-outline-variant/10 shadow-sm hover:shadow-md transition-all active:scale-90"
        >
          <ChevronLeft size={24} strokeWidth={3} />
        </motion.button>
        <div>
          <h1 className="font-black text-2xl tracking-tighter leading-none">Nodes</h1>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary mt-1 opacity-60">
            {followers.length} Neural Connections
          </p>
        </div>
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
            placeholder="Scan node registry..."
            className="w-full bg-white border border-outline-variant/20 rounded-[2rem] pl-14 pr-6 py-5 text-sm font-bold outline-none focus:ring-[12px] focus:ring-primary/5 focus:border-primary/20 transition-all shadow-xl shadow-black/[0.02]"
          />
        </div>

        {/* Followers List */}
        <div className="space-y-4 pb-32">
          {loading ? (
            <div className="py-32 flex flex-col items-center gap-6">
              <div className="w-14 h-14 border-[6px] border-primary/10 border-t-primary rounded-full animate-spin" />
              <p className="text-[11px] font-black uppercase tracking-[0.3em] text-gray-400 animate-pulse">Syncing Lattice...</p>
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              {filtered.length > 0 ? (
                filtered.map((user, index) => (
                  <motion.div
                    key={user.id}
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ delay: index * 0.05, type: "spring", stiffness: 100 }}
                    className="flex items-center justify-between gap-4 p-5 rounded-[2.5rem] bg-white border border-outline-variant/10 shadow-lg shadow-black/[0.01] hover:shadow-2xl hover:shadow-primary/5 hover:border-primary/20 transition-all group cursor-pointer"
                  >
                    <div className="flex items-center gap-5">
                      <div className="relative">
                        <div className="w-16 h-16 rounded-[1.5rem] bg-surface-low overflow-hidden flex items-center justify-center border-[3px] border-white shadow-xl group-hover:scale-105 transition-transform duration-500">
                          {user.avatar_url ? (
                            <img src={user.avatar_url} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-2xl font-black text-gray-300">
                              {user.username[0].toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-primary flex items-center justify-center text-white border-[3px] border-white shadow-lg">
                          <Zap size={10} fill="currentColor" />
                        </div>
                      </div>
                      <div>
                        <p className="font-black text-[17px] tracking-tight group-hover:text-primary transition-colors">@{user.username}</p>
                        <p className="text-[11px] font-black uppercase tracking-widest text-gray-400 mt-0.5">{user.full_name || "Nexus Explorer"}</p>
                      </div>
                    </div>
                    <Button size="sm" variant="secondary" className="px-6 rounded-full font-black text-[10px] uppercase tracking-widest bg-primary/5 hover:bg-primary hover:text-white border-transparent transition-all">
                      Follow Back
                    </Button>
                  </motion.div>
                ))
              ) : (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="py-32 text-center space-y-6"
                >
                  <div className="w-24 h-24 rounded-[2rem] bg-surface-low border border-outline-variant/10 flex items-center justify-center mx-auto shadow-inner">
                     <User size={40} className="text-gray-300" strokeWidth={1.5} />
                  </div>
                  <div className="space-y-1">
                    <p className="text-lg font-black tracking-tight text-gray-400">Zero Node Matches</p>
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-300">Registry scan yielded no results</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </div>
      </div>
    </div>
  );
}
