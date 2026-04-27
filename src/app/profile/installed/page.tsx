"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Download, Search, Package } from "lucide-react";
import api from "@/lib/api";
import { Button } from "@/components/ui/Button";

export default function InstalledAppsPage() {
  const router = useRouter();
  const [apps, setApps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchApps = async () => {
      try {
        const res = await api.get("/users/me/purchases");
        setApps(res.data);
      } catch (err) {
        console.error("Failed to fetch installed apps", err);
      } finally {
        setLoading(false);
      }
    };
    fetchApps();
  }, []);

  const filtered = apps.filter(purchase => 
    purchase.app?.name.toLowerCase().includes(search.toLowerCase()) ||
    purchase.app?.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-transparent">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-surface/80 backdrop-blur-xl border-b border-outline-variant px-4 py-3 flex items-center gap-4">
        <button onClick={() => router.back()} className="p-1 hover:bg-surface-lowest rounded-full transition-colors">
          <ChevronLeft size={22} className="text-on-surface" />
        </button>
        <h1 className="font-black text-base tracking-tight text-on-surface">Manage Apps</h1>
      </header>

      {/* Search */}
      <div className="px-4 py-3">
        <div className="relative group">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant opacity-50 group-focus-within:text-primary group-focus-within:opacity-100 transition-all" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search my apps"
            className="w-full bg-surface-lowest border border-outline-variant rounded-2xl pl-10 pr-4 py-2 text-xs font-medium outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary/30 transition-all"
          />
        </div>
      </div>

      {/* List */}
      <div className="px-4 space-y-2 pb-24">
        {loading ? (
          <div className="py-20 flex flex-col items-center gap-4">
            <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Scanning storage...</p>
          </div>
        ) : filtered.length > 0 ? (
          filtered.map((purchase) => {
            const app = purchase.app;
            if (!app) return null;
            return (
              <div 
                key={purchase.id} 
                className="flex items-center justify-between gap-3 p-2.5 rounded-2xl bg-surface-lowest border border-outline-variant hover:border-primary/20 transition-all active:scale-[0.98]" 
                onClick={() => router.push(`/apps/${app.id}`)}
              >
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-surface border border-outline-variant overflow-hidden flex items-center justify-center shrink-0">
                    {app.icon_url ? (
                      <img src={app.icon_url} className="w-full h-full object-cover" />
                    ) : (
                      <Package size={20} className="text-on-surface-variant opacity-30" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-[13px] text-on-surface truncate leading-tight">{app.name}</p>
                    <p className="text-[9px] text-primary font-black uppercase tracking-wider mt-0.5">{app.category}</p>
                  </div>
                </div>
                <Button size="xs" variant="secondary" className="h-7 px-4 text-[10px] font-black rounded-lg">Open</Button>
              </div>
            );
          })
        ) : (
          <div className="py-20 flex flex-col items-center text-center gap-4">
            <div className="w-16 h-16 rounded-3xl bg-surface-lowest flex items-center justify-center border border-outline-variant border-dashed">
               <Package size={32} className="text-on-surface-variant opacity-20" />
            </div>
            <p className="text-xs font-bold text-on-surface-variant opacity-60">
              No apps found on this device.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
