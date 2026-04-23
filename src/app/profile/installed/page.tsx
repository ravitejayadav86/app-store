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
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-4">
        <button onClick={() => router.back()} className="p-1">
          <ChevronLeft size={24} />
        </button>
        <h1 className="font-bold text-lg">Installed Apps</h1>
      </header>

      {/* Search */}
      <div className="px-4 py-4">
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search installed apps"
            className="w-full bg-gray-100 border-none rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all"
          />
        </div>
      </div>

      {/* List */}
      <div className="px-4 space-y-4 pb-24">
        {loading ? (
          <div className="py-20 flex justify-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length > 0 ? (
          filtered.map((purchase) => {
            const app = purchase.app;
            if (!app) return null;
            return (
              <div key={purchase.id} className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-gray-50 border border-gray-100" onClick={() => router.push(`/apps/${app.id}`)}>
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-white overflow-hidden flex items-center justify-center border border-gray-200">
                    {app.icon_url ? (
                      <img src={app.icon_url} className="w-full h-full object-cover" />
                    ) : (
                      <Package size={24} className="text-gray-300" />
                    )}
                  </div>
                  <div>
                    <p className="font-bold text-sm">{app.name}</p>
                    <p className="text-[10px] text-primary font-bold uppercase tracking-widest">{app.category}</p>
                  </div>
                </div>
                <Button size="xs" variant="secondary" className="px-4">Open</Button>
              </div>
            );
          })
        ) : (
          <div className="py-20 text-center text-gray-400 text-sm">
            You haven't installed any apps yet.
          </div>
        )}
      </div>
    </div>
  );
}
