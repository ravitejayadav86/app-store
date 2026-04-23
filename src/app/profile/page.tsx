"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { 
  User, Users, Mail, Calendar, Edit3, Save, X, Package, 
  Download, Star, Shield, LogOut, Camera, ExternalLink, 
  GitFork, Trash2, Code, Sparkles, Plus, Menu, ChevronDown,
  Grid as GridIcon, Bookmark, UserSquare2, AtSign, Zap,
  Activity, ArrowUpRight, Share2, Settings as SettingsIcon, Info
} from "lucide-react";
import api from "@/lib/api";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";

interface UserProfile {
  id: number;
  username: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  bio?: string;
  is_private?: boolean;
  is_active: boolean;
  is_publisher: boolean;
  created_at: string;
}

interface Repo {
  id: number;
  name: string;
  description: string | null;
  html_url: string;
  stargazers_count: number;
  forks_count: number;
  language: string | null;
  updated_at: string;
}

interface LiveStats {
  installs: number;
  reviews: number;
  published: number;
  followers: number;
  following: number;
}

export default function ProfilePage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({ full_name: "", email: "", bio: "", is_private: false });
  const [liveStats, setLiveStats] = useState<LiveStats>({ installs: 0, reviews: 0, published: 0, followers: 0, following: 0 });
  const [repos, setRepos] = useState<Repo[]>([]);
  const [reposLoading, setReposLoading] = useState(false);
  const [myApps, setMyApps] = useState<any[]>([]);
  const [myAppsLoading, setMyAppsLoading] = useState(false);
  const [purchasedApps, setPurchasedApps] = useState<any[]>([]);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const fetchProfile = useCallback(async () => {
    try {
      const profileRes = await api.get("/users/me");
      setProfile(profileRes.data);
      setFormData({ 
        full_name: profileRes.data.full_name || "", 
        email: profileRes.data.email || "",
        bio: profileRes.data.bio || "",
        is_private: profileRes.data.is_private || false
      });

      const statsRes = await api.get("/users/me/stats");
      setLiveStats(statsRes.data);

      const purchasesRes = await api.get("/users/me/purchases");
      setPurchasedApps(purchasesRes.data);
      
      const appsRes = await api.get("/apps/me");
      setMyApps(appsRes.data);
    } catch (err) {
      console.error("Failed to fetch profile", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      fetchProfile();
    }
    const handleSync = () => fetchProfile();
    window.addEventListener("auth-synced", handleSync);
    return () => window.removeEventListener("auth-synced", handleSync);
  }, [fetchProfile]);

  useEffect(() => {
    const githubLogin = (session as any)?.login;
    if (githubLogin) {
      fetchGithubRepos(githubLogin);
    }
  }, [(session as any)?.login]);

  const fetchGithubRepos = async (username: string) => {
    setReposLoading(true);
    try {
      const res = await fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=6`);
      const data = await res.json();
      if (Array.isArray(data)) setRepos(data);
    } catch {
      console.error("Failed to fetch repos");
    } finally {
      setReposLoading(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await api.post("/users/me/avatar", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      toast.success("Avatar updated!");
      setProfile(prev => prev ? { ...prev, avatar_url: res.data.avatar_url } : prev);
    } catch {
      toast.error("Failed to upload avatar.");
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await api.put("/users/me", formData);
      setProfile(res.data);
      setEditing(false);
      toast.success("Profile updated!");
    } catch { 
      toast.error("Failed to update profile."); 
    } finally { 
      setSaving(false); 
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    signOut({ callbackUrl: "/" });
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-surface selection:bg-primary/10">
      <div className="w-12 h-12 border-[6px] border-primary/10 border-t-primary rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-white pb-32 sm:pb-0 selection:bg-primary/10">
      
      {/* 📱 MOBILE UI */}
      <div className="sm:hidden flex flex-col min-h-screen">
        <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-2xl border-b border-gray-100 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative w-8 h-8 bg-black rounded-lg flex items-center justify-center text-white shadow-lg active:scale-95 transition-transform">
              <Zap size={16} fill="currentColor" />
            </div>
            <h1 className="font-black text-xl tracking-tighter flex items-center gap-1.5">
              {profile?.username} <ChevronDown size={14} strokeWidth={3} className="text-gray-400" />
            </h1>
          </div>
          <div className="flex items-center gap-6">
            <button className="p-1 active:scale-90 transition-transform"><Plus size={26} strokeWidth={2.5} /></button>
            <button className="p-1 active:scale-90 transition-transform" onClick={() => router.push("/settings")}><Menu size={26} strokeWidth={2.5} /></button>
          </div>
        </header>

        <div className="px-6 pt-6 pb-8 space-y-6">
          <div className="flex items-center justify-between gap-6">
            <div className="relative group">
              <div className="w-24 h-24 rounded-[2.25rem] border-[4px] border-gray-50 p-1 overflow-hidden shadow-2xl shadow-black/5 active:scale-95 transition-transform">
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} className="w-full h-full rounded-[1.75rem] object-cover" />
                ) : (
                  <div className="w-full h-full rounded-[1.75rem] bg-linear-to-br from-gray-50 to-gray-100 flex items-center justify-center text-gray-400 font-black text-3xl">
                    {profile?.username[0].toUpperCase()}
                  </div>
                )}
              </div>
              <label className="absolute bottom-0 right-0 w-8 h-8 bg-black text-white rounded-full flex items-center justify-center border-[3px] border-white shadow-xl cursor-pointer active:scale-90 transition-transform">
                <Camera size={14} strokeWidth={3} />
                <input type="file" className="hidden" onChange={handleAvatarUpload} />
              </label>
            </div>
            
            <div className="flex-1 flex justify-around text-center px-2">
              <Link href="/profile/publisher" className="flex flex-col items-center gap-0.5 group active:scale-95 transition-all">
                <p className="font-black text-lg tracking-tight">{liveStats.published}</p>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 group-hover:text-primary">Creator</p>
              </Link>
              <Link href="/profile/followers" className="flex flex-col items-center gap-0.5 group active:scale-95 transition-all">
                <p className="font-black text-lg tracking-tight">{liveStats.followers}</p>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 group-hover:text-primary">Nodes</p>
              </Link>
              <Link href="/profile/following" className="flex flex-col items-center gap-0.5 group active:scale-95 transition-all">
                <p className="font-black text-lg tracking-tight">{liveStats.following}</p>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 group-hover:text-primary">Signals</p>
              </Link>
            </div>
          </div>

          <div className="space-y-1">
            <p className="font-black text-base tracking-tight">{profile?.full_name || profile?.username}</p>
            <p className="text-sm font-medium text-gray-500 leading-relaxed mt-2 pr-4">
              {profile?.bio || "Initializing neural pathways for future innovations."}
            </p>
          </div>

          <div className="flex gap-3">
            <button 
              onClick={() => setEditing(true)}
              className="flex-1 py-4 bg-gray-50 hover:bg-gray-100 active:scale-[0.98] rounded-2xl text-xs font-black uppercase tracking-widest transition-all"
            >
              Update ID
            </button>
            <button className="flex-1 py-4 bg-gray-50 hover:bg-gray-100 active:scale-[0.98] rounded-2xl text-xs font-black uppercase tracking-widest transition-all">
              Broadcast
            </button>
            <button className="px-5 py-4 bg-gray-50 hover:bg-gray-100 active:scale-[0.98] rounded-2xl transition-all">
              <Share2 size={18} strokeWidth={2.5} />
            </button>
          </div>
        </div>

        <div className="flex border-t border-gray-100 bg-white sticky top-[68px] z-40">
          <button 
            onClick={() => setViewMode("grid")}
            className={`flex-1 flex justify-center py-4 border-b-[3px] transition-all ${viewMode === "grid" ? "border-black text-black" : "border-transparent text-gray-300"}`}
          >
            <GridIcon size={24} strokeWidth={viewMode === "grid" ? 3 : 2} />
          </button>
          <button 
            onClick={() => setViewMode("list")}
            className={`flex-1 flex justify-center py-4 border-b-[3px] transition-all ${viewMode === "list" ? "border-black text-black" : "border-transparent text-gray-300"}`}
          >
            <Activity size={24} strokeWidth={viewMode === "list" ? 3 : 2} />
          </button>
          <button className="flex-1 flex justify-center py-4 border-b-[3px] border-transparent text-gray-300">
            <Bookmark size={24} strokeWidth={2} />
          </button>
        </div>

        <div className="grid grid-cols-3 gap-0.5 bg-gray-100 pb-24">
          {myApps.length > 0 ? myApps.map((app) => (
            <div key={app.id} className="aspect-square bg-white relative group active:scale-95 transition-transform cursor-pointer overflow-hidden" onClick={() => router.push(`/apps/${app.id}`)}>
              {app.icon_url ? (
                <img src={app.icon_url} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-200 font-black text-4xl bg-gray-50">
                  {app.name[0]}
                </div>
              )}
              {app.is_private && <div className="absolute top-2 right-2 p-1.5 bg-black/50 backdrop-blur-md rounded-full"><Shield size={10} className="text-white" /></div>}
            </div>
          )) : (
            <div className="col-span-3 py-32 text-center bg-white">
               <div className="w-16 h-16 rounded-[1.5rem] bg-gray-50 flex items-center justify-center text-gray-300 mx-auto mb-4">
                  <Package size={32} />
               </div>
               <p className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-400">Zero Deployments</p>
            </div>
          )}
        </div>
      </div>

      {/* 🖥️ DESKTOP UI */}
      <div className="hidden sm:block min-h-screen px-4 py-20 relative overflow-hidden bg-surface">
        <div className="absolute top-[-20%] left-[-10%] w-[80%] h-[80%] bg-primary/5 rounded-full blur-[180px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-blue-500/5 rounded-full blur-[150px] pointer-events-none" />

        <div className="max-w-5xl mx-auto relative z-10 space-y-10">
          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }}>
            <div className="bg-white border border-outline-variant/10 rounded-[3.5rem] p-12 shadow-2xl shadow-primary/5 flex gap-12 items-start">
              <div className="relative group">
                <div className="w-40 h-40 rounded-[3.5rem] bg-white flex items-center justify-center text-primary text-6xl font-black shadow-2xl overflow-hidden border-[6px] border-white active:scale-95 transition-transform duration-500">
                  {profile?.avatar_url ? (
                    <img src={profile.avatar_url} alt="avatar" className="w-full h-full object-cover" />
                  ) : (
                    profile?.username[0].toUpperCase()
                  )}
                </div>
                <label className="absolute -bottom-2 -right-2 w-14 h-14 bg-black text-white rounded-full flex items-center justify-center shadow-2xl border-[6px] border-white cursor-pointer hover:scale-110 active:scale-90 transition-all duration-300">
                  <Camera size={24} strokeWidth={2.5} />
                  <input type="file" className="hidden" onChange={handleAvatarUpload} />
                </label>
              </div>

              <div className="flex-1 space-y-8">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <h1 className="text-6xl font-black text-on-surface tracking-tighter leading-none">{profile?.full_name || profile?.username}</h1>
                    <div className="flex items-center gap-3">
                       <span className="text-lg font-black text-primary tracking-tight opacity-80">@{profile?.username}</span>
                       <span className="w-1.5 h-1.5 rounded-full bg-outline-variant" />
                       <span className="text-[11px] font-black uppercase tracking-widest text-on-surface-variant/40">Nexus Core v4.0</span>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <Button onClick={() => setEditing(true)} className="rounded-full px-8 py-7 font-black uppercase tracking-widest text-[11px] border border-outline-variant/20 hover:border-primary/30 shadow-xl shadow-primary/5">
                      <Edit3 size={16} className="mr-3" strokeWidth={3} /> Update Profile
                    </Button>
                    <button onClick={handleLogout} className="w-14 h-14 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all shadow-xl shadow-rose-500/5 active:scale-90">
                      <LogOut size={24} strokeWidth={2.5} />
                    </button>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <div className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-surface-low border border-outline-variant/10 shadow-sm">
                    <Calendar size={14} strokeWidth={3} className="text-primary" />
                    <span className="text-[11px] font-black uppercase tracking-widest opacity-60">Established {profile?.created_at && new Date(profile.created_at).getFullYear()}</span>
                  </div>
                  {profile?.is_publisher && (
                    <div className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary/10 border border-primary/20 shadow-sm">
                      <Zap size={14} fill="currentColor" className="text-primary" />
                      <span className="text-[11px] font-black uppercase tracking-widest text-primary">Verified Nexus Creator</span>
                    </div>
                  )}
                </div>

                <p className="text-xl font-medium text-on-surface/50 leading-relaxed max-w-2xl">{profile?.bio || "A panda of few words, but infinite innovations in the digital nexus."}</p>
              </div>
            </div>
          </motion.div>

          <div className="grid grid-cols-5 gap-6">
            {[
              { label: "Nodes", value: liveStats.followers, icon: Users, color: "from-blue-500 to-indigo-600", href: "/profile/followers" },
              { label: "Signals", value: liveStats.following, icon: AtSign, color: "from-purple-500 to-pink-600", href: "/profile/following" },
              { label: "Syncs", value: liveStats.installs, icon: Download, color: "from-emerald-500 to-teal-600", href: "/library" },
              { label: "Deployments", value: liveStats.published, icon: Zap, color: "from-amber-500 to-orange-600", href: "/profile/publisher" },
              { label: "Data Logs", value: liveStats.reviews, icon: Activity, color: "from-rose-500 to-red-600", href: "#" },
            ].map((stat, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 * i }} className="group">
                <Link href={stat.href}>
                  <div className="bg-white border border-outline-variant/10 rounded-[2.5rem] p-8 text-center hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500 cursor-pointer h-full flex flex-col justify-center active:scale-95">
                    <div className={`w-14 h-14 rounded-3xl mx-auto mb-4 bg-linear-to-br ${stat.color} text-white flex items-center justify-center shadow-xl shadow-black/5 group-hover:scale-110 transition-transform`}>
                      <stat.icon size={24} strokeWidth={2.5} />
                    </div>
                    <p className="text-4xl font-black tracking-tighter mb-1">{stat.value}</p>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">{stat.label}</p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-8">
               <div className="bg-white border border-outline-variant/10 rounded-[3rem] p-10 shadow-2xl shadow-black/[0.02]">
                  <div className="flex items-center justify-between mb-8">
                     <h2 className="text-2xl font-black tracking-tight flex items-center gap-3">
                        <GridIcon size={24} className="text-primary" strokeWidth={3} /> Deployments
                     </h2>
                     <Link href="/profile/publisher" className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline">View Nexus Hub</Link>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                     {myApps.length > 0 ? myApps.slice(0, 4).map(app => (
                        <div key={app.id} className="flex items-center gap-4 p-4 rounded-[2rem] bg-surface-low hover:bg-white border border-outline-variant/10 hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5 transition-all cursor-pointer group" onClick={() => router.push(`/apps/${app.id}`)}>
                           <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center shadow-lg overflow-hidden flex-shrink-0 group-hover:scale-110 transition-transform">
                              {app.icon_url ? <img src={app.icon_url} className="w-full h-full object-cover" /> : <Package size={24} className="text-gray-200" />}
                           </div>
                           <div className="min-w-0">
                              <p className="font-black tracking-tight truncate">{app.name}</p>
                              <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant/40 mt-1">{app.category}</p>
                           </div>
                           <ArrowUpRight size={16} className="ml-auto text-gray-300 group-hover:text-primary transition-colors" />
                        </div>
                     )) : (
                        <div className="col-span-2 py-12 text-center opacity-30">
                           <Package size={40} className="mx-auto mb-4" />
                           <p className="text-xs font-black uppercase tracking-widest">No Active Deployments</p>
                        </div>
                     )}
                  </div>
               </div>
            </div>

            <div className="space-y-8">
               <div className="bg-black rounded-[3rem] p-10 text-white shadow-2xl shadow-black/20 relative overflow-hidden h-full">
                  <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12 -mr-4 -mt-4">
                    <GitFork size={180} />
                  </div>
                  <div className="relative z-10">
                    <h2 className="text-2xl font-black tracking-tight mb-8 flex items-center gap-3">
                       <Code size={24} className="text-primary" strokeWidth={3} /> Source Nodes
                    </h2>
                    <div className="space-y-4">
                       {reposLoading ? <div className="space-y-3">
                          {[1,2,3].map(i => <div key={i} className="h-16 rounded-2xl bg-white/5 animate-pulse" />)}
                       </div> : repos.slice(0, 3).map(repo => (
                          <a key={repo.id} href={repo.html_url} target="_blank" className="block p-5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-primary/30 transition-all group">
                             <div className="flex items-center justify-between mb-2">
                                <p className="font-bold tracking-tight text-sm truncate">{repo.name}</p>
                                <ArrowUpRight size={14} className="text-white/20 group-hover:text-primary" />
                             </div>
                             <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-white/30">
                                <span className="flex items-center gap-1"><Star size={10} strokeWidth={3} className="text-amber-400" /> {repo.stargazers_count}</span>
                                <span className="flex items-center gap-1"><GitFork size={10} strokeWidth={3} className="text-blue-400" /> {repo.forks_count}</span>
                             </div>
                          </a>
                       ))}
                       {repos.length === 0 && !reposLoading && <p className="text-xs font-black uppercase tracking-widest opacity-30 text-center py-8">GitHub Link Offline</p>}
                    </div>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      <AnimatePresence>
        {editing && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-white flex flex-col selection:bg-primary/10"
          >
            <header className="px-6 py-5 flex items-center justify-between border-b border-gray-50 bg-white/80 backdrop-blur-xl">
              <button onClick={() => setEditing(false)} className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-400 hover:text-black">Cancel</button>
              <h2 className="font-black text-lg tracking-tight">Identity Matrix</h2>
              <button onClick={handleSave} disabled={saving} className="text-primary text-[11px] font-black uppercase tracking-[0.2em]">{saving ? "Syncing..." : "Commit"}</button>
            </header>

            <div className="flex-1 overflow-y-auto">
               <div className="max-w-lg mx-auto w-full pt-12 pb-24 px-6 space-y-12">
                  <div className="flex flex-col items-center gap-6">
                    <div className="relative group">
                      <div className="w-32 h-32 rounded-[2.75rem] bg-gray-50 border-[6px] border-gray-100 overflow-hidden shadow-xl active:scale-95 transition-transform duration-500">
                        {profile?.avatar_url ? <img src={profile.avatar_url} className="w-full h-full object-cover" /> : <User size={50} strokeWidth={1} className="text-gray-300 mx-auto mt-8" />}
                      </div>
                      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm opacity-0 group-hover:opacity-100 flex items-center justify-center rounded-[2.75rem] transition-all cursor-pointer">
                        <Camera size={32} className="text-white" strokeWidth={2.5} />
                      </div>
                      <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleAvatarUpload} />
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Alter Neural Signature</p>
                  </div>

                  <div className="space-y-10">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 flex items-center gap-2"><User size={12} strokeWidth={3} /> Legal Name</label>
                      <input 
                        value={formData.full_name} 
                        onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                        className="w-full bg-gray-50 rounded-2xl px-6 py-5 border border-transparent focus:bg-white focus:border-primary/20 outline-none text-base font-bold transition-all shadow-inner"
                        placeholder="Nexus Citizen Name"
                      />
                    </div>
                    <div className="space-y-3 opacity-50">
                      <label className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 flex items-center gap-2"><AtSign size={12} strokeWidth={3} /> Nexus Handle</label>
                      <div className="w-full bg-gray-100 rounded-2xl px-6 py-5 border border-transparent text-base font-bold text-gray-500 cursor-not-allowed">
                        {profile?.username}
                      </div>
                      <p className="text-[9px] font-black uppercase tracking-widest text-rose-400">Handle is immutable once established</p>
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 flex items-center gap-2"><Info size={12} strokeWidth={3} /> Neural Bio</label>
                      <textarea 
                        value={formData.bio} 
                        onChange={(e) => setFormData({...formData, bio: e.target.value})}
                        className="w-full bg-gray-50 rounded-2xl px-6 py-5 border border-transparent focus:bg-white focus:border-primary/20 outline-none text-base font-medium transition-all shadow-inner min-h-[140px] resize-none"
                        placeholder="Describe your digital essence..."
                      />
                    </div>
                    <div className="flex items-center justify-between p-6 bg-gray-50 rounded-[2rem] border border-transparent hover:border-primary/10 transition-all group">
                      <div className="flex items-center gap-4">
                         <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-gray-400 group-hover:text-primary transition-colors">
                            <Shield size={20} strokeWidth={2.5} />
                         </div>
                         <div>
                            <p className="text-sm font-black tracking-tight">Stealth Mode</p>
                            <p className="text-[10px] font-bold text-gray-400">Hide activity from public discovery</p>
                         </div>
                      </div>
                      <input type="checkbox" checked={formData.is_private} onChange={(e) => setFormData({...formData, is_private: e.target.checked})} className="w-6 h-6 rounded-full border-gray-200 text-primary focus:ring-primary/20 accent-primary" />
                    </div>
                  </div>
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}