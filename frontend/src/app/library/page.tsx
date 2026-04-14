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
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-16">
        <div>
          <motion.h1 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-5xl font-bold tracking-tight text-on-surface mb-2"
          >
            My Library
          </motion.h1>
          <p className="text-on-surface-variant">Manage your collection across all your devices.</p>
        </div>

        <div className="w-full md:w-96 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant" size={18} />
          <input 
            type="text"
            placeholder="Search your library..."
            className="w-full pl-12 pr-4 py-3 rounded-2xl glass border border-outline-variant focus:outline-none focus:ring-2 focus:ring-primary/20 placeholder:text-on-surface-variant/50 transition-all"
          />
        </div>
      </header>

      {/* Tabs */}
      <div className="flex gap-2 mb-10 p-1 bg-surface-low rounded-2xl w-fit border border-outline-variant">
        {["All", "Installed", "Updates", "Recent"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-2 rounded-xl text-sm font-medium transition-all ${
              activeTab === tab 
              ? "bg-surface-lowest text-primary shadow-sm" 
              : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {myApps.map((app, index) => (
          <motion.div
            key={app.title}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
          >
            <GlassCard className="flex items-center gap-6 group">
              <div className={`w-20 h-20 rounded-2xl ${app.color} flex items-center justify-center text-4xl shadow-inner group-hover:scale-105 transition-transform duration-300`}>
                {app.icon}
              </div>
              <div className="flex-grow">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-bold text-on-surface">{app.title}</h3>
                    <p className="text-xs text-on-surface-variant uppercase tracking-widest font-semibold mt-1">
                      v{app.version}
                    </p>
                  </div>
                  <button className="p-1 text-on-surface-variant hover:text-primary transition-colors">
                    <MoreHorizontal size={20} />
                  </button>
                </div>
                
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {app.status === "Update Available" ? (
                      <span className="flex items-center gap-1.5 text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full animate-pulse">
                        <Clock size={12} />
                        Update
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 text-xs font-bold text-green-600 bg-green-500/10 px-2 py-0.5 rounded-full">
                        <Package size={12} />
                        Ready
                      </span>
                    )}
                  </div>
                  <Button size="sm" variant={app.status === "Update Available" ? "primary" : "secondary"}>
                    {app.status === "Update Available" ? "Update" : "Open"}
                  </Button>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
