"use client";

import React from "react";
import { motion } from "framer-motion";
import { GlassCard } from "@/components/ui/GlassCard";
import { 
  BarChart3, 
  Upload, 
  Settings, 
  TrendingUp, 
  Code2, 
  Globe,
  Plus
} from "lucide-react";

export default function PublisherPage() {
  const stats = [
    { label: "Active Installs", value: "1.2M", change: "+12%", icon: <TrendingUp size={20} className="text-green-500" /> },
    { label: "Revenue (MTD)", value: "$42.5k", change: "+5%", icon: <TrendingUp size={20} className="text-primary" /> },
    { label: "Crash-Free Users", value: "99.9%", change: "0%", icon: <Settings size={20} className="text-blue-500" /> },
  ];

  const apps = [
    { title: "Horizon Docs", status: "Published", downloads: "840k", rating: "4.9", color: "bg-blue-500" },
    { title: "Nebula Sync", status: "Pending Update", downloads: "320k", rating: "4.7", color: "bg-cyan-500" },
    { title: "Lumina Edit", status: "Draft", downloads: "0", rating: "0.0", color: "bg-pink-500" },
  ];

  return (
    <div className="flex flex-col gap-12 pb-20 mt-12 px-4 md:px-8 max-w-7xl mx-auto">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
        <div>
          <h1 className="text-5xl font-bold tracking-tight text-on-surface mb-2">Publisher Hub.</h1>
          <p className="text-on-surface-variant max-w-lg">Manage your products, view deep analytics, and connect with your audience.</p>
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mt-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="flex items-center gap-3">
             <Code2 className="text-primary" />
             <h2 className="text-2xl font-bold text-on-surface">Your Applications</h2>
          </div>
          
          <div className="space-y-4">
            {apps.map((app, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
              >
                <GlassCard className="flex items-center justify-between group hover:bg-surface-low transition-all cursor-pointer">
                  <div className="flex items-center gap-6">
                    <div className={`w-14 h-14 rounded-2xl ${app.color} flex items-center justify-center text-2xl shadow-inner group-hover:scale-105 transition-transform`}>
                       {app.title[0]}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-on-surface">{app.title}</h3>
                      <p className="text-xs text-on-surface-variant font-medium uppercase tracking-widest mt-0.5">{app.status}</p>
                    </div>
                  </div>
                  <div className="hidden md:flex gap-12 text-right">
                    <div>
                      <p className="text-lg font-bold text-on-surface">{app.downloads}</p>
                      <p className="text-[10px] text-on-surface-variant uppercase font-bold tracking-widest">Downloads</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-on-surface">{app.rating}</p>
                      <p className="text-[10px] text-on-surface-variant uppercase font-bold tracking-widest">Rating</p>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
            
            <button className="w-full h-24 border-2 border-dashed border-outline-variant rounded-3xl flex items-center justify-center gap-3 text-on-surface-variant hover:border-primary/50 hover:text-primary transition-all group">
               <Plus className="group-hover:rotate-90 transition-transform" />
               <span className="font-bold">Add Another Product</span>
            </button>
          </div>
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
