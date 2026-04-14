"use client";

import { motion } from "framer-motion";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { Layout, Database, Cloud, Sparkles } from "lucide-react";

export default function AppsPage() {
  const apps = [
    { title: "Horizon Docs", category: "Productivity", icon: <Layout className="text-blue-500" />, price: "FREE" },
    { title: "Quantum Code", category: "Development", icon: <Database className="text-purple-500" />, price: "FREE" },
    { title: "Nebula Sync", category: "Utilities", icon: <Cloud className="text-cyan-500" />, price: "$2.99" },
    { title: "Lumina Edit", category: "Graphics", icon: <Sparkles className="text-pink-500" />, price: "FREE" },
    { title: "Horizon Docs Pro", category: "Productivity", icon: <Layout className="text-blue-500" />, price: "$4.99" },
    { title: "Quantum Code Pro", category: "Development", icon: <Database className="text-purple-500" />, price: "FREE" },
    { title: "Nebula Sync Pro", category: "Utilities", icon: <Cloud className="text-cyan-500" />, price: "FREE" },
    { title: "Lumina Edit Pro", category: "Graphics", icon: <Sparkles className="text-pink-500" />, price: "$1.99" },
  ];

  return (
    <div className="flex flex-col gap-20 pb-20 px-4 md:px-8">
      <section>
        <div className="relative h-[400px] w-full max-w-7xl mx-auto rounded-3xl overflow-hidden bg-linear-to-br from-primary to-primary-dim p-12 text-on-primary flex flex-col justify-end gap-6 shadow-2xl">
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 1.5 }} className="absolute top-0 right-0 w-[400px] h-[400px] bg-white/10 rounded-full blur-[100px] -mr-40 -mt-40" />
          <div className="relative z-10 max-w-2xl">
            <div className="flex items-center gap-2 mb-4 bg-white/10 w-fit px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-md border border-white/20">
              <Layout size={14} />
              <span>Apps</span>
            </div>
            <h1 className="text-5xl font-bold tracking-tight mb-4">Apps for Every Workflow.</h1>
            <p className="text-lg text-on-primary/80">Powerful tools to boost your productivity and creativity.</p>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto w-full">
        <h2 className="text-3xl font-bold text-on-surface mb-8">All Apps</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {apps.map((app, index) => (
            <motion.div key={index} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + index * 0.08 }}>
              <GlassCard className="flex flex-col gap-4 h-full">
                <div className="w-14 h-14 rounded-2xl bg-surface-low flex items-center justify-center text-2xl shadow-inner">
                  {app.icon}
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-1">{app.title}</h3>
                  <p className="text-sm text-on-surface-variant">{app.category}</p>
                </div>
                <div className="flex items-center justify-between mt-auto">
                  <span className="text-xs font-semibold bg-primary/10 text-primary px-2 py-0.5 rounded">{app.price}</span>
                  <Button size="sm">Get</Button>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}