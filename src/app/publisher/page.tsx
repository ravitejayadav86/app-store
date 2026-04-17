"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GlassCard } from "@/components/ui/GlassCard";
import Link from "next/link";
import { 
  BarChart3, 
  Upload, 
  Settings, 
  TrendingUp, 
  Code2, 
  Globe,
  Plus,
  UserPlus,
  CheckCircle2,
  Lock,
  Music,
  BookOpen
} from "lucide-react";
import api from "@/lib/api";
import { toast } from "sonner";

export default function PublisherPage() {
  const [apps, setApps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [grantingAppId, setGrantingAppId] = useState<number | null>(null);
  const [targetUsername, setTargetUsername] = useState("");

  const stats = [
    { label: "Active Installs", value: "1.2M", change: "+12%", icon: <TrendingUp size={20} className="text-green-500" /> },
    { label: "Revenue (MTD)", value: "$42.5k", change: "+5%", icon: <TrendingUp size={20} className="text-primary" /> },
    { label: "Crash-Free Users", value: "99.9%", change: "0%", icon: <Settings size={20} className="text-blue-500" /> },
  ];

  useEffect(() => {
    const fetchApps = async () => {
      try {
        const res = await api.get("/apps/me");
        setApps(res.data);
      } catch (err) {
        toast.error("Failed to fetch applications.");
      } finally {
        setLoading(false);
      }
    };
    fetchApps();
  }, []);

  const handleGrantAccess = async (appId: number) => {
    if (!targetUsername.trim()) return toast.error("Please enter a username.");
    try {
      const res = await api.post(`/apps/${appId}/grant`, { username: targetUsername });
      if (res.data.status.includes("already")) {
        toast.info(res.data.status);
      } else {
        toast.success(res.data.status);
      }
      setTargetUsername("");
      setGrantingAppId(null);
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Failed to grant access.");
    }
  };

  const colors = ["bg-blue-500", "bg-cyan-500", "bg-pink-500", "bg-purple-500", "bg-amber-500"];

  return (
    <div className="flex flex-col gap-12 pb-20 mt-12 px-4 md:px-8 max-w-7xl mx-auto">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
        <div>
          <h1 className="text-5xl font-bold tracking-tight text-on-surface mb-2">Publisher Hub.</h1>
          <p className="text-on-surface-variant max-w-lg">Manage your products, grant manual accesses, and view deep analytics.</p>
        </div>
        <Link href="/publisher/upload">
          <button className="flex items-center gap-2 px-8 py-4 bg-primary text-on-primary rounded-2xl font-bold hover:scale-[1.02] transition-transform shadow-lg shadow-primary/20 group">
            <Upload size={20} className="group-hover:-translate-y-1 transition-transform" />
            Submit New App
          </button>
        </Link>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
          >
            <GlassCard className="flex flex-col gap-2">
              <div className="flex justify-between items-center text-on-surface-variant mb-4">
                <span className="text-xs font-bold uppercase tracking-widest">{stat.label}</span>
                {stat.icon}
              </div>
              <div className="flex items-baseline gap-2">
                <p className="text-3xl font-bold text-on-surface">{stat.value}</p>
                <span className="text-xs font-bold text-green-500">{stat.change}</span>
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      {/* Quick Publish Content */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold text-on-surface">Quick Publish Content</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link href="/publisher/upload?category=Music&price=0" className="group">
            <GlassCard className="flex items-center gap-6 p-8 hover:bg-surface-low transition-all cursor-pointer border-2 border-transparent hover:border-primary/20">
              <div className="w-16 h-16 rounded-2xl bg-pink-500/10 flex items-center justify-center text-pink-500 group-hover:scale-110 transition-transform">
                <Music size={32} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-on-surface uppercase">Free Music Track</h3>
                <p className="text-sm text-on-surface-variant">Share your tracks with the PandaStore community for free.</p>
              </div>
            </GlassCard>
          </Link>
          <Link href="/publisher/upload?category=Books&price=0" className="group">
            <GlassCard className="flex items-center gap-6 p-8 hover:bg-surface-low transition-all cursor-pointer border-2 border-transparent hover:border-primary/20">
              <div className="w-16 h-16 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-500 group-hover:scale-110 transition-transform">
                <BookOpen size={32} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-on-surface uppercase">Free E-Book</h3>
                <p className="text-sm text-on-surface-variant">Release your latest writing or documentation for free.</p>
              </div>
            </GlassCard>
          </Link>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mt-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="flex items-center gap-3">
             <Code2 className="text-primary" />
             <h2 className="text-2xl font-bold text-on-surface">Your Applications</h2>
          </div>
          
          {loading ? (
             <div className="text-center py-10 text-on-surface-variant animate-pulse">Loading amazing applications...</div>
          ) : apps.length === 0 ? (
             <GlassCard className="p-10 text-center flex flex-col items-center justify-center gap-4">
                <div className="w-16 h-16 rounded-full bg-surface-low flex items-center justify-center text-on-surface-variant">
                   <Code2 size={24} />
                </div>
                <p className="font-bold text-lg text-on-surface">No applications published yet</p>
                <p className="text-sm text-on-surface-variant max-w-sm">Publish your first app to unlock analytics, user management, and revenue insights.</p>
             </GlassCard>
          ) : (
            <div className="space-y-4">
              {apps.map((app, i) => (
                <motion.div
                  key={app.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                >
                  <GlassCard className="flex flex-col transition-all overflow-hidden relative">
                    <div className="flex justify-between items-center z-10 relative">
                        <div className="flex items-center gap-6">
                            <div className={`w-14 h-14 rounded-2xl ${colors[i % colors.length]} flex items-center justify-center text-2xl shadow-inner text-white font-bold`}>
                            {app.name[0]}
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-on-surface">{app.name}</h3>
                                <p className="text-xs text-on-surface-variant font-medium uppercase tracking-widest mt-0.5">${app.price.toFixed(2)} • {app.version}</p>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <button 
                               onClick={() => setGrantingAppId(grantingAppId === app.id ? null : app.id)}
                               className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest flex items-center gap-2 transition-all ${grantingAppId === app.id ? "bg-primary text-on-primary" : "bg-surface-low text-on-surface hover:text-primary"}`}
                            >
                                <Lock size={14} /> Grant Access
                            </button>
                        </div>
                    </div>

                    <AnimatePresence>
                        {grantingAppId === app.id && (
                            <motion.div 
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="pt-6 mt-4 border-t border-outline-variant/30 relative z-0 flex flex-col gap-4"
                            >
                                <p className="text-sm font-medium text-on-surface-variant flex items-center gap-2">
                                  <UserPlus size={16} className="text-primary"/> Provide a user complimentary access to {app.name}.
                                </p>
                                <div className="flex gap-3">
                                  <input 
                                     value={targetUsername}
                                     onChange={(e) => setTargetUsername(e.target.value)}
                                     placeholder="Enter exact username..."
                                     className="flex-grow px-4 py-3 rounded-xl glass border border-outline-variant focus:outline-none focus:border-primary/50 text-sm font-medium"
                                  />
                                  <button 
                                     onClick={() => handleGrantAccess(app.id)}
                                     disabled={!targetUsername}
                                     className="px-6 py-3 bg-primary text-on-primary rounded-xl font-bold flex items-center gap-2 hover:bg-primary-hover transition-colors disabled:opacity-50"
                                  >
                                      Grant <CheckCircle2 size={16} />
                                  </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                  </GlassCard>
                </motion.div>
              ))}
              
              <Link href="/publisher/upload">
                  <button className="w-full h-24 mt-4 border-2 border-dashed border-outline-variant rounded-3xl flex items-center justify-center gap-3 text-on-surface-variant hover:border-primary/50 hover:text-primary transition-all group">
                    <Plus className="group-hover:rotate-90 transition-transform" />
                    <span className="font-bold">Add Another Product</span>
                  </button>
              </Link>
            </div>
          )}
        </div>

        <aside className="space-y-8">
          <h2 className="text-xs font-bold uppercase tracking-widest text-primary">Publisher Resources</h2>
          <div className="space-y-4">
            <GlassCard className="flex items-center gap-4 py-4 hover:translate-x-1 transition-transform cursor-pointer">
              <div className="w-10 h-10 rounded-xl bg-surface-low flex items-center justify-center text-primary shadow-inner">
                <Globe size={18} />
              </div>
              <p className="font-bold text-sm text-on-surface">Documentation</p>
            </GlassCard>
            <GlassCard className="flex items-center gap-4 py-4 hover:translate-x-1 transition-transform cursor-pointer">
              <div className="w-10 h-10 rounded-xl bg-surface-low flex items-center justify-center text-primary shadow-inner">
                <BarChart3 size={18} />
              </div>
              <p className="font-bold text-sm text-on-surface">Analytics Export</p>
            </GlassCard>
            <GlassCard className="flex items-center gap-4 py-4 hover:translate-x-1 transition-transform cursor-pointer">
              <div className="w-10 h-10 rounded-xl bg-surface-low flex items-center justify-center text-primary shadow-inner">
                <Settings size={18} />
              </div>
              <p className="font-bold text-sm text-on-surface">API Credentials</p>
            </GlassCard>
          </div>

          <div className="p-8 bg-linear-to-br from-primary to-primary-dim rounded-3xl text-on-primary relative overflow-hidden group cursor-pointer shadow-xl shadow-primary/10">
             <div className="absolute top-0 right-0 p-4 rotate-12 opacity-10 group-hover:scale-125 transition-transform duration-700">
                <TrendingUp size={100} />
             </div>
             <h3 className="text-xl font-bold mb-2">Reach Global Markets</h3>
             <p className="text-sm text-on-primary/80 mb-6">
               Learn how to optimize your storefront and increase conversion by 40% with our new discovery engine.
             </p>
             <button className="text-xs font-bold uppercase tracking-widest flex items-center gap-2 group">
               Read the Guide <TrendingUp size={14} className="group-hover:translate-x-1 transition-transform" />
             </button>
          </div>
        </aside>
      </div>
    </div>
  );
}
