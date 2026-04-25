"use client";
import { useSession, signIn } from "next-auth/react";
import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import axios from "axios";
import {
  BarChart3, Upload, Settings, TrendingUp, Code2, Globe,
  Plus, UserPlus, CheckCircle2, Lock, Music, BookOpen, Gamepad2, Camera
} from "lucide-react";
import api from "@/lib/api";
import { toast } from "sonner";

interface AppItem {
  id: number;
  name: string;
  price: number;
  version: string;
  category: string;
  file_path: string | null;
  icon_url: string | null;
}

interface ApiError {
  response?: { data?: { detail?: string } };
}

async function ensureToken(email: string, name: string): Promise<string | null> {
  let token = localStorage.getItem("token");
  if (token) return token;
  try {
    const res = await api.post("/auth/oauth-login", { email, name });
    token = res.data.access_token;
    localStorage.setItem("token", token!);
    return token;
  } catch {
    return null;
  }
}

export default function PublisherPage() {
  const { data: session, status } = useSession();
  const [apps, setApps] = useState<AppItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [grantingAppId, setGrantingAppId] = useState<number | null>(null);
  const [targetUsername, setTargetUsername] = useState("");
  const [analytics, setAnalytics] = useState({ total_apps: 0, approved: 0, pending: 0, total_downloads: 0 });
  const [authError, setAuthError] = useState(false);
  const [activeTab, setActiveTab] = useState<"Apps" | "Music" | "Books">("Apps");

  const stats = [
    { label: "Total Downloads", value: analytics.total_downloads.toString(), change: "+live", icon: <TrendingUp size={20} className="text-green-500" /> },
    { label: "Published Apps", value: analytics.approved.toString(), change: `${analytics.pending} pending`, icon: <CheckCircle2 size={20} className="text-primary" /> },
    { label: "Total Submitted", value: analytics.total_apps.toString(), change: "all-time", icon: <BarChart3 size={20} className="text-blue-500" /> },
  ];

  const fetchData = useCallback(async () => {
    try {
      const [appsRes, analyticsRes] = await Promise.all([
        api.get("/apps/me"),
        api.get("/apps/analytics"),
      ]);
      setApps(appsRes.data);
      setAnalytics(analyticsRes.data);
    } catch (err) {
      toast.error("Failed to fetch publisher data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status === "loading") return;

    const init = async () => {
      // Case 1: already has token
      const existingToken = localStorage.getItem("token");
      if (existingToken) {
        fetchData();
        return;
      }

      // Case 2: logged in via OAuth
      if (session?.user?.email) {
        const token = await ensureToken(
          session.user.email,
          session.user.name || ""
        );
        if (token) {
          fetchData();
          return;
        }
      }

      // Case 3: not logged in at all
      if (!session) {
        setAuthError(true);
        setLoading(false);
        return;
      }

      setLoading(false);
      toast.error("Could not authenticate. Please sign in again.");
    };

    init();
  }, [status, session?.user?.email, fetchData]);

  const handleGrantAccess = async (appId: number) => {
    if (!targetUsername.trim()) return toast.error("Please enter a username.");
    try {
      const res = await api.post(`/apps/${appId}/grant`, { username: targetUsername });
      toast.success(res.data.message || "Access granted!");
      setTargetUsername("");
      setGrantingAppId(null);
    } catch (err: unknown) {
      const error = err as ApiError;
      toast.error(error.response?.data?.detail || "Failed to grant access.");
    }
  };

  const handleInlineIconUpload = async (appId: number, file: File) => {
    const loadingToast = toast.loading("Uploading icon...");
    try {
      const timestamp = Math.round(new Date().getTime() / 1000);
      const sigRes = await api.post("/apps/generate-signature", { timestamp, folder: "pandastore/icons" });
      const { signature, api_key, cloud_name } = sigRes.data;

      const fd = new FormData();
      fd.append("file", file);
      fd.append("api_key", api_key);
      fd.append("timestamp", timestamp.toString());
      fd.append("signature", signature);
      fd.append("folder", "pandastore/icons");

      const cloudRes = await axios.post(`https://api.cloudinary.com/v1_1/${cloud_name}/auto/upload`, fd);
      const iconUrl = cloudRes.data.secure_url;

      await api.post(`/apps/${appId}/upload`, { icon_url: iconUrl });
      toast.success("Icon updated!", { id: loadingToast });
      fetchData();
    } catch (err) {
      console.error(err);
      toast.error("Failed to upload icon.", { id: loadingToast });
    }
  };

  const filteredApps = apps.filter(app => {
    const category = app.category.toLowerCase();
    if (activeTab === "Music") return category === "music";
    if (activeTab === "Books") return category === "books";
    // Everything else (Games, Development, Productivity, etc.) goes to "Apps"
    return category !== "music" && category !== "books";
  });

  const colors = ["bg-blue-500", "bg-cyan-500", "bg-pink-500", "bg-purple-500", "bg-amber-500"];

  if (authError) {
    return (
      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center flex-col gap-6">
        <h2 className="text-3xl font-bold text-on-surface">Sign in to access Publisher Hub</h2>
        <p className="text-on-surface-variant">You need to be signed in to publish apps.</p>
        <button
          onClick={() => signIn()}
          className="px-8 py-4 bg-primary text-on-primary rounded-2xl font-bold"
        >
          Sign In
        </button>
      </div>
    );
  }

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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <motion.div key={i} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.1 }}>
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

      <section className="space-y-6">
        <h2 className="text-2xl font-bold text-on-surface">Quick Publish Content</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link href="/publisher/upload?category=Games&price=0" className="group">
            <GlassCard className="flex items-center gap-6 p-8 hover:bg-surface-low transition-all cursor-pointer border-2 border-transparent hover:border-primary/20">
              <div className="w-16 h-16 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
                <Gamepad2 size={32} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-on-surface uppercase">Free Game</h3>
                <p className="text-sm text-on-surface-variant">Publish your game for the community.</p>
              </div>
            </GlassCard>
          </Link>
          <Link href="/publisher/upload?category=Music&price=0" className="group">
            <GlassCard className="flex items-center gap-6 p-8 hover:bg-surface-low transition-all cursor-pointer border-2 border-transparent hover:border-primary/20">
              <div className="w-16 h-16 rounded-2xl bg-pink-500/10 flex items-center justify-center text-pink-500 group-hover:scale-110 transition-transform">
                <Music size={32} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-on-surface uppercase">Free Music</h3>
                <p className="text-sm text-on-surface-variant">Share your tracks for free.</p>
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
                <p className="text-sm text-on-surface-variant">Release your latest writing.</p>
              </div>
            </GlassCard>
          </Link>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-12 mt-8">
        <div className="lg:col-span-3 space-y-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-outline-variant/30 pb-4">
            <div className="flex items-center gap-3">
              <Code2 className="text-primary" />
              <h2 className="text-2xl font-bold text-on-surface">Your Applications</h2>
            </div>
            
            <div className="flex bg-surface-low p-1 rounded-2xl gap-1">
              {(["Apps", "Music", "Books"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`relative px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
                    activeTab === tab ? "text-primary" : "text-on-surface-variant hover:text-on-surface"
                  }`}
                >
                  {tab === "Apps" ? "Games & Apps" : tab}
                  {activeTab === tab && (
                    <motion.div
                      layoutId="publisher-tab"
                      className="absolute inset-0 bg-white shadow-sm rounded-xl -z-10"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="text-center py-20 text-on-surface-variant animate-pulse flex flex-col items-center gap-4">
              <div className="w-10 h-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
              Fetching your portfolio...
            </div>
          ) : filteredApps.length === 0 ? (
            <GlassCard className="p-16 text-center flex flex-col items-center justify-center gap-6 border-dashed">
              <div className="w-20 h-20 rounded-full bg-surface-low flex items-center justify-center text-on-surface-variant">
                {activeTab === "Apps" ? <Gamepad2 size={32} /> : 
                 activeTab === "Music" ? <Music size={32} /> : 
                 <BookOpen size={32} />}
              </div>
              <div className="space-y-2">
                <p className="font-bold text-xl text-on-surface">No {activeTab === "Apps" ? "Apps or Games" : activeTab} Published</p>
                <p className="text-sm text-on-surface-variant max-w-sm">Start your journey in this category by uploading your first creation.</p>
              </div>
              <Link href={`/publisher/upload?category=${activeTab === "Apps" ? "Games" : activeTab}`}>
                <Button variant="secondary">Upload now</Button>
              </Link>
            </GlassCard>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {filteredApps.map((app, i) => (
                <motion.div key={app.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                  <GlassCard className="flex flex-col transition-all overflow-hidden relative group">
                    <div className="flex justify-between items-center z-10 relative">
                      <div className="flex items-center gap-6">
                        <div className={`w-14 h-14 rounded-2xl ${colors[i % colors.length]} flex items-center justify-center text-2xl shadow-inner text-white font-bold group-hover:scale-105 transition-transform overflow-hidden bg-surface-low`}>
                          {app.icon_url ? (
                            <img src={app.icon_url} alt={app.name} className="w-full h-full object-cover" />
                          ) : (
                            app.name[0]
                          )}
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-on-surface flex items-center gap-2">
                            {app.name}
                            {!app.file_path && (
                              <span className="px-2 py-0.5 bg-orange-500/10 text-orange-600 text-[10px] font-bold uppercase tracking-widest rounded-full border border-orange-500/20">
                                Missing File
                              </span>
                            )}
                            {!app.icon_url && (
                              <span className="px-2 py-0.5 bg-blue-500/10 text-blue-600 text-[10px] font-bold uppercase tracking-widest rounded-full border border-blue-500/20">
                                Missing Icon
                              </span>
                            )}
                          </h3>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-xs text-on-surface-variant font-medium uppercase tracking-widest">${app.price.toFixed(2)}</span>
                            <span className="w-1 h-1 rounded-full bg-outline-variant" />
                            <span className="text-xs text-on-surface-variant font-medium uppercase tracking-widest">v{app.version}</span>
                          </div>
                        </div>
                      </div>
                        <div className="flex items-center gap-4">
                          {!app.icon_url && (
                            <div className="relative group/upload">
                              <input 
                                type="file" 
                                accept="image/*" 
                                className="hidden" 
                                id={`icon-upload-${app.id}`}
                                onChange={(e) => {
                                  const f = e.target.files?.[0];
                                  if (f) handleInlineIconUpload(app.id, f);
                                }}
                              />
                              <button
                                onClick={() => document.getElementById(`icon-upload-${app.id}`)?.click()}
                                className="px-4 py-2 bg-primary/10 text-primary rounded-xl text-xs font-bold uppercase tracking-widest flex items-center gap-2 hover:bg-primary/20 transition-all border border-primary/20"
                              >
                                <Camera size={14} /> Add Icon
                              </button>
                            </div>
                          )}
                          {!app.file_path && (
                            <Link href={`/publisher/upload?id=${app.id}&name=${encodeURIComponent(app.name)}`}>
                              <button className="px-4 py-2 bg-orange-500 text-white rounded-xl text-xs font-bold uppercase tracking-widest flex items-center gap-2 hover:bg-orange-600 transition-colors shadow-lg shadow-orange-500/20">
                                <Upload size={14} /> Finish Upload
                              </button>
                            </Link>
                          )}
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
                            <UserPlus size={16} className="text-primary" /> Provide a user complimentary access to {app.name}.
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
                              className="px-6 py-3 bg-primary text-on-primary rounded-xl font-bold flex items-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
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
              <Link href={`/publisher/upload?category=${activeTab === "Apps" ? "Games" : activeTab}`}>
                <button className="w-full h-24 mt-4 border-2 border-dashed border-outline-variant rounded-3xl flex items-center justify-center gap-3 text-on-surface-variant hover:border-primary/50 hover:text-primary transition-all group">
                  <Plus className="group-hover:rotate-90 transition-transform" />
                  <span className="font-bold">Add Another {activeTab === "Apps" ? "Product" : activeTab}</span>
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
            <p className="text-sm text-on-primary/80 mb-6">Learn how to optimize your storefront and increase conversion by 40% with our new discovery engine.</p>
            <button className="text-xs font-bold uppercase tracking-widest flex items-center gap-2 group">
              Read the Guide <TrendingUp size={14} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}