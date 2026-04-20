"use client";

import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { Download, Activity, Clock, Package, CheckCircle, ArrowLeft, RefreshCw } from "lucide-react";
import api from "@/lib/api";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface LiveDownload {
  id: string;
  app_name: string;
  username: string;
  timestamp: number;
}

interface DownloadedApp {
  id: number;
  name: string;
  category: string;
  version: string;
  last_downloaded?: string;
}

const WS_BASE = process.env.NEXT_PUBLIC_WS_URL || "wss://pandas-store-api.onrender.com";

export default function UpdatesPage() {
  const router = useRouter();
  const [liveDownloads, setLiveDownloads] = useState<LiveDownload[]>([]);
  const [downloadedApps, setDownloadedApps] = useState<DownloadedApp[]>([]);
  const [loading, setLoading] = useState(true);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    // Fetch "Downloaded" apps (using purchases as proxy)
    api.get("/users/me/purchases")
      .then((res) => {
        setDownloadedApps(res.data.map((p: any) => ({
          id: p.app.id,
          name: p.app.name,
          category: p.app.category,
          version: p.app.version,
          last_downloaded: p.purchased_at
        })));
      })
      .catch(() => {})
      .finally(() => setLoading(false));

    // Connect to telemetry WebSocket
    const connectWS = () => {
      const ws = new WebSocket(`${WS_BASE}/telemetry/downloads`);
      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === "DOWNLOAD_START") {
          const newEvent = {
            id: Math.random().toString(36).substr(2, 9),
            app_name: data.app_name,
            username: data.username,
            timestamp: Date.now()
          };
          setLiveDownloads(prev => [newEvent, ...prev].slice(0, 5));
        }
      };
      ws.onclose = () => {
        setTimeout(connectWS, 3000); // Reconnect
      };
      wsRef.current = ws;
    };

    connectWS();
    return () => wsRef.current?.close();
  }, []);

  return (
    <div className="flex flex-col gap-12 pb-20">
      <header className="px-4 md:px-8 mt-8">
        <div className="max-w-7xl mx-auto flex items-center gap-6">
          <Button variant="tertiary" size="sm" onClick={() => router.back()} className="rounded-full w-12 h-12 p-0 bg-surface-low border-outline-variant hover:border-primary/50 transition-all shadow-sm">
            <ArrowLeft size={20} />
          </Button>
          <div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-on-surface">Downloads & Updates</h1>
            <p className="text-on-surface-variant mt-1 text-lg font-medium opacity-70">Manage your collection and see live store pulse.</p>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Live Activity Section */}
        <div className="lg:col-span-4 space-y-6">
          <div className="flex items-center gap-2 px-2 text-primary">
            <Activity size={18} />
            <h2 className="font-bold uppercase tracking-widest text-xs">Live Store Activity</h2>
          </div>
          
          <GlassCard className="p-6 space-y-4 min-h-[500px] border-outline-variant/50 bg-surface-lowest/50 backdrop-blur-xl shadow-2xl shadow-primary/5">
            <AnimatePresence mode="popLayout">
              {liveDownloads.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center py-20">
                  <div className="p-4 rounded-3xl bg-primary/5 text-primary mb-6 animate-pulse">
                    <RefreshCw size={32} />
                  </div>
                  <p className="text-sm font-bold text-on-surface-variant uppercase tracking-widest opacity-40">Listening for activity...</p>
                </div>
              ) : (
                liveDownloads.map((dl) => (
                  <motion.div
                    key={dl.id}
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, filter: "blur(4px)" }}
                    className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-outline-variant/30 hover:border-primary/20 transition-colors shadow-sm"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-linear-to-br from-primary to-primary-dim flex items-center justify-center text-white font-bold text-lg shadow-lg">
                      {dl.username[0].toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold truncate text-on-surface">
                        <span className="text-primary">{dl.username}</span>
                      </p>
                      <p className="text-[11px] text-on-surface-variant truncate font-bold uppercase tracking-tight opacity-60">Downloaded {dl.app_name}</p>
                    </div>
                    <div className="text-[10px] font-bold text-primary/40 bg-primary/5 px-2 py-1 rounded-full whitespace-nowrap">JUST NOW</div>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </GlassCard>
        </div>

        {/* Downloaded Apps Section */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex items-center gap-2 px-2 text-on-surface">
            <Clock size={18} />
            <h2 className="font-bold uppercase tracking-widest text-xs">Downloaded Apps</h2>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {downloadedApps.map((app, index) => (
              <motion.div
                key={app.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <GlassCard className="p-5 flex items-center justify-between group hover:bg-surface-low transition-all duration-500 border-outline-variant/40 hover:border-primary/30 shadow-sm">
                  <div className="flex items-center gap-5">
                    <div className="w-16 h-16 rounded-2xl bg-surface-low flex items-center justify-center text-on-surface-variant group-hover:bg-primary/10 group-hover:text-primary transition-all duration-500 shadow-inner group-hover:scale-105">
                      <Package size={28} />
                    </div>
                    <div>
                      <h3 className="font-bold text-xl text-on-surface group-hover:text-primary transition-colors">{app.name}</h3>
                      <p className="text-xs text-on-surface-variant font-bold uppercase tracking-widest opacity-60 mt-1">
                        v{app.version} • {new Date(app.last_downloaded!).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="hidden md:flex flex-col items-end mr-2">
                      <span className="flex items-center gap-1.5 text-[10px] font-bold text-green-600 bg-green-500/10 px-3 py-1 rounded-full uppercase tracking-widest">
                        <CheckCircle size={10} /> Up to date
                      </span>
                    </div>
                    <Button variant="secondary" size="sm" className="rounded-xl px-6 font-bold h-10">Open</Button>
                    <Button variant="tertiary" size="sm" className="w-10 h-10 p-0 rounded-xl border border-outline-variant hover:bg-primary/5 hover:text-primary transition-all">
                      <Download size={18} />
                    </Button>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
            
            {!loading && downloadedApps.length === 0 && (
              <div className="py-20 text-center opacity-50">
                <p>No downloads yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
