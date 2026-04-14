"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { Search, Download, Clock, Package, MoreHorizontal } from "lucide-react";

const myApps = [
  { title: "Horizon Docs", version: "2.4.1", status: "Update Available", icon: "📄", color: "bg-blue-500" },
  { title: "Nebula Sync", version: "1.0.8", status: "Installed", icon: "☁️", color: "bg-cyan-500" },
  { title: "Quantum Code", version: "0.9.2", status: "Installed", icon: "💻", color: "bg-purple-500" },
  { title: "Lumina Edit", version: "3.2.0", status: "Installed", icon: "🎨", color: "bg-pink-500" },
  { title: "Grid Builder", version: "1.5.0", status: "Installed", icon: "📐", color: "bg-orange-500" },
  { title: "Deep Trace", version: "2.1.3", status: "Installed", icon: "🔍", color: "bg-green-500" },
];

export default function LibraryPage() {
  const [activeTab, setActiveTab] = useState("All");

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
              <Package size={14} />
              <span>Personal Vault</span>
            </motion.div>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-4 text-on-primary">Your Collection.</h1>
            <p className="text-lg md:text-xl text-on-primary/80 mb-2">Manage your ecosystem across all authorized devices from one centralized command center.</p>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 md:px-8 w-full">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-12">
          <div className="flex gap-2 p-1 bg-surface-low rounded-2xl w-fit border border-outline-variant">
            {["All", "Installed", "Books", "Updates"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-2 rounded-xl text-sm font-bold tracking-tight transition-all ${
                  activeTab === tab 
                  ? "bg-surface-lowest text-primary shadow-sm" 
                  : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="w-full md:w-96 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant" size={18} />
            <input 
              type="text"
              placeholder="Search your library..."
              className="w-full pl-12 pr-4 py-3 rounded-2xl glass border border-outline-variant focus:outline-none focus:ring-2 focus:ring-primary/20 placeholder:text-on-surface-variant/50 transition-all font-medium"
            />
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {myApps.map((app, index) => (
            <motion.div
              key={app.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.05 }}
            >
              <GlassCard className="flex items-center gap-6 group hover:bg-surface-low transition-all">
                <div className={`w-20 h-20 rounded-2xl ${app.color} flex items-center justify-center text-4xl shadow-inner group-hover:scale-110 transition-transform duration-500`}>
                  {app.icon}
                </div>
                <div className="flex-grow">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-bold text-on-surface">{app.title}</h3>
                      <p className="text-[10px] text-on-surface-variant uppercase tracking-widest font-bold mt-1 opacity-70">
                        Version {app.version}
                      </p>
                    </div>
                  </div>
                  
                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {app.status === "Update Available" ? (
                        <span className="flex items-center gap-1.5 text-[10px] font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-full animate-pulse uppercase tracking-wider">
                          <Clock size={12} />
                          Update
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 text-[10px] font-bold text-green-600 bg-green-500/10 px-2.5 py-1 rounded-full uppercase tracking-wider">
                          <Package size={12} />
                          Ready
                        </span>
                      )}
                    </div>
                    <Button size="sm" variant={app.status === "Update Available" ? "primary" : "tertiary"}>
                      {app.status === "Update Available" ? "Update" : "Launch"}
                    </Button>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
