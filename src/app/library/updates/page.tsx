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
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-12 flex flex-col gap-12">
      <header className="flex items-center gap-6">
        <Button variant="tertiary" size="sm" onClick={() => router.back()} className="rounded-full w-10 h-10 p-0">
          <ArrowLeft size={20} />
        </Button>
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-on-surface">Downloads & Updates</h1>
          <p className="text-on-surface-variant mt-1">Manage your downloads and see live store activity.</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Live Activity Section */}
        <div className="lg:col-span-4 space-y-6">
          <div className="flex items-center gap-2 px-2 text-primary">
            <Activity size={18} />
            <h2 className="font-bold uppercase tracking-widest text-xs">Live Store Activity</h2>
          </div>
          
          <GlassCard className="p-6 space-y-4 min-h-[400px]">
            <AnimatePresence mode="popLayout">
              {liveDownloads.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-40 py-20">
                  <RefreshCw className="animate-spin mb-4" size={24} />
                  <p className="text-sm font-medium">Waiting for activity...</p>
                </div>
              ) : (
                liveDownloads.map((dl) => (
                  <motion.div
                    key={dl.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="flex items-center gap-4 p-3 rounded-2xl bg-surface-lowest border border-outline-variant/30"
                  >
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                      {dl.username[0].toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold truncate">
                        <span className="text-primary">{dl.username}</span> is downloading
                      </p>
                      <p className="text-xs text-on-surface-variant truncate font-medium">{dl.app_name}</p>
                    </div>
                    <div className="text-[10px] font-bold text-on-surface-variant/40 italic">Just now</div>
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
                <GlassCard className="p-6 flex items-center justify-between group hover:bg-surface-low transition-colors">
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 rounded-2xl bg-surface-low flex items-center justify-center text-on-surface-variant group-hover:bg-primary/20 group-hover:text-primary transition-colors">
                      <Package size={24} />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">{app.name}</h3>
                      <p className="text-xs text-on-surface-variant font-medium">
                        v{app.version} • Downloaded {new Date(app.last_downloaded!).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="hidden md:flex flex-col items-end mr-4">
                      <span className="flex items-center gap-1.5 text-[10px] font-bold text-green-600 bg-green-500/10 px-2 py-0.5 rounded-full uppercase tracking-wider">
                        <CheckCircle size={10} /> Up to date
                      </span>
                    </div>
                    <Button variant="secondary" size="sm">Open</Button>
                    <Button variant="tertiary" size="sm" className="w-10 h-10 p-0 rounded-full">
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
