"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { 
  User, Users, Mail, Calendar, Edit3, Save, X, Package, 
  Download, Star, Shield, LogOut, Camera, ExternalLink, 
  GitFork, Trash2, Code, Sparkles, Plus, Menu, ChevronDown,
  Grid as GridIcon, Bookmark, UserSquare2, AtSign
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
  const [followers, setFollowers] = useState<any[]>([]);
  const [following, setFollowing] = useState<any[]>([]);
  const [myReviews, setMyReviews] = useState<any[]>([]);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      fetchProfile();
    }
    const handleSync = () => fetchProfile();
    window.addEventListener("auth-synced", handleSync);
    return () => window.removeEventListener("auth-synced", handleSync);
  }, []);

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

  const fetchProfile = async () => {
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
    <div className="min-h-screen flex items-center justify-center bg-surface">
      <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-surface pb-24 sm:pb-0">
      
      {/* 📱 MOBILE UI (Instagram Reference) */}
      <div className="sm:hidden flex flex-col min-h-screen bg-white">
        {/* Mobile Header */}
        <header className="sticky top-0 z-50 bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Shield size={18} className="text-black" />
            <h1 className="font-bold text-lg flex items-center gap-1">
              {profile?.username} <ChevronDown size={14} />
            </h1>
          </div>
          <div className="flex items-center gap-5">
            <button className="p-1"><Plus size={24} /></button>
            <button className="p-1"><Menu size={24} /></button>
          </div>
        </header>

        {/* Profile Info */}
        <div className="px-4 pt-4 pb-6 space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div className="relative">
              <div className="w-20 h-20 rounded-full border-2 border-gray-100 p-0.5 overflow-hidden">
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} className="w-full h-full rounded-full object-cover" />
                ) : (
                  <div className="w-full h-full rounded-full bg-gray-50 flex items-center justify-center text-gray-400 font-bold text-2xl">
                    {profile?.username[0].toUpperCase()}
                  </div>
                )}
              </div>
              <label className="absolute bottom-0 right-0 w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center border-2 border-white cursor-pointer">
                <Plus size={14} />
                <input type="file" className="hidden" onChange={handleAvatarUpload} />
              </label>
            </div>
            
            <div className="flex-1 flex justify-around text-center">
              <div>
                <p className="font-bold text-sm">{liveStats.published}</p>
                <p className="text-xs text-gray-500">Posts</p>
              </div>
              <div>
                <p className="font-bold text-sm">{liveStats.followers}</p>
                <p className="text-xs text-gray-500">Followers</p>
              </div>
              <div>
                <p className="font-bold text-sm">{liveStats.following}</p>
                <p className="text-xs text-gray-500">Following</p>
              </div>
            </div>
          </div>

          <div className="space-y-0.5">
            <p className="font-bold text-sm">{profile?.full_name || profile?.username}</p>
            <p className="text-xs text-gray-400">Developer</p>
            <p className="text-sm text-gray-800 leading-tight">
              {profile?.bio || "A panda of few words, but infinite innovations."}
            </p>
          </div>

          <div className="flex gap-2">
            <button 
              onClick={() => setEditing(true)}
              className="flex-1 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-bold transition-colors"
            >
              Edit profile
            </button>
            <button className="flex-1 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-bold transition-colors">
              Share profile
            </button>
            <button className="px-2 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
              <UserSquare2 size={18} />
            </button>
          </div>

          {/* Story Highlights (App Categories) */}
          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
            {["Apps", "Games", "Music", "Books"].map((cat) => (
              <div key={cat} className="flex flex-col items-center gap-1 flex-shrink-0">
                <div className="w-14 h-14 rounded-full border border-gray-200 p-1">
                  <div className="w-full h-full rounded-full bg-gray-50 flex items-center justify-center text-gray-400">
                    <Sparkles size={20} />
                  </div>
                </div>
                <p className="text-[10px] font-medium">{cat}</p>
              </div>
            ))}
            <div className="flex flex-col items-center gap-1 flex-shrink-0">
              <div className="w-14 h-14 rounded-full border border-gray-200 flex items-center justify-center">
                <Plus size={20} className="text-gray-400" />
              </div>
              <p className="text-[10px] font-medium">New</p>
            </div>
          </div>
        </div>

        {/* Mobile Tabs */}
        <div className="flex border-t border-gray-100">
          <button 
            onClick={() => setViewMode("grid")}
            className={`flex-1 flex justify-center py-3 border-b-2 transition-colors ${viewMode === "grid" ? "border-black text-black" : "border-transparent text-gray-400"}`}
          >
            <GridIcon size={22} />
          </button>
          <button 
            onClick={() => setViewMode("list")}
            className={`flex-1 flex justify-center py-3 border-b-2 transition-colors ${viewMode === "list" ? "border-black text-black" : "border-transparent text-gray-400"}`}
          >
            <Bookmark size={22} />
          </button>
          <button className="flex-1 flex justify-center py-3 border-b-2 border-transparent text-gray-400">
            <UserSquare2 size={22} />
          </button>
        </div>

        {/* Post Grid */}
        <div className="grid grid-cols-3 gap-0.5 pb-20">
          {myApps.length > 0 ? myApps.map((app) => (
            <div key={app.id} className="aspect-square bg-gray-100 relative group cursor-pointer" onClick={() => router.push(`/apps/${app.id}`)}>
              {app.icon_url ? (
                <img src={app.icon_url} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-300 font-bold text-2xl">
                  {app.name[0]}
                </div>
              )}
              {app.is_private && <div className="absolute top-2 right-2"><Shield size={12} className="text-white" /></div>}
            </div>
          )) : (
            <div className="col-span-3 py-20 text-center text-gray-400 text-sm font-medium">
              No posts yet
            </div>
          )}
        </div>
      </div>

      {/* 🖥️ DESKTOP UI (White Liquid Glass) */}
      <div className="hidden sm:block min-h-screen px-4 py-12 relative overflow-hidden">
        {/* Dynamic Background Glows */}
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-primary/10 rounded-full blur-[150px] animate-pulse pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-4xl mx-auto relative z-10 space-y-6">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
            <GlassCard className="p-8 border-white/40">
              <div className="flex gap-8 items-start">
                <div className="relative group">
                  <div className="w-28 h-28 rounded-[2.5rem] bg-white flex items-center justify-center text-primary text-5xl font-black shadow-2xl overflow-hidden border-2 border-white">
                    {profile?.avatar_url ? (
                      <img src={profile.avatar_url} alt="avatar" className="w-full h-full object-cover" />
                    ) : (
                      profile?.username[0].toUpperCase()
                    )}
                  </div>
                  <label className="absolute -bottom-2 -right-2 w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center shadow-xl border-4 border-white cursor-pointer hover:scale-110 transition-transform">
                    <Camera size={18} />
                    <input type="file" className="hidden" onChange={handleAvatarUpload} />
                  </label>
                </div>

                <div className="flex-1 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h1 className="text-4xl font-black text-on-surface">{profile?.full_name || profile?.username}</h1>
                      <p className="text-primary font-bold">@{profile?.username}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => setEditing(true)}><Edit3 size={16} className="mr-2" /> Edit Profile</Button>
                      <button onClick={handleLogout} className="p-2.5 rounded-xl bg-red-50 text-red-500 hover:bg-red-100 transition-colors"><LogOut size={20} /></button>
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <span className="flex items-center gap-1.5 text-xs font-bold text-on-surface-variant bg-white/50 px-3 py-1.5 rounded-full border border-white/50"><Calendar size={14} /> Joined {profile?.created_at && new Date(profile.created_at).toLocaleDateString()}</span>
                    {profile?.is_publisher && <span className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-primary bg-primary/10 px-3 py-1.5 rounded-full border border-primary/20">Publisher</span>}
                  </div>

                  <p className="text-on-surface/70 font-medium italic">{profile?.bio || "A panda of few words..."}</p>
                </div>
              </div>
            </GlassCard>
          </motion.div>

          {/* Stats Grid - Desktop */}
          <div className="grid grid-cols-5 gap-4">
            {[
              { label: "Followers", value: liveStats.followers, icon: User },
              { label: "Following", value: liveStats.following, icon: Users },
              { label: "Installed", value: liveStats.installs, icon: Download },
              { label: "Published", value: liveStats.published, icon: Package },
              { label: "Reviews", value: liveStats.reviews, icon: Star },
            ].map((stat, i) => (
              <GlassCard key={i} className="p-4 text-center hover:bg-white/80 transition-all cursor-pointer" onClick={() => setActiveTab(stat.label)}>
                <div className="w-10 h-10 rounded-2xl mx-auto mb-2 bg-primary/10 text-primary flex items-center justify-center"><stat.icon size={20} /></div>
                <p className="text-2xl font-black">{stat.value}</p>
                <p className="text-[10px] font-black uppercase tracking-widest opacity-60">{stat.label}</p>
              </GlassCard>
            ))}
          </div>

          {/* Detailed Info Cards - Desktop */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <GlassCard className="p-8 border-white/60">
              <h2 className="text-xs font-black uppercase tracking-[0.2em] text-primary mb-6">Account Details</h2>
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-3 bg-white/40 rounded-2xl border border-white/60">
                  <Mail size={18} className="text-primary" />
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-50">Email</p>
                    <p className="text-sm font-bold">{profile?.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-3 bg-white/40 rounded-2xl border border-white/60">
                  <Shield size={18} className="text-primary" />
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-50">Visibility</p>
                    <p className="text-sm font-bold">{profile?.is_private ? "Private" : "Public"}</p>
                  </div>
                </div>
              </div>
            </GlassCard>

            {session?.user && (
              <GlassCard className="p-8 border-white/60">
                <h2 className="text-xs font-black uppercase tracking-[0.2em] text-primary mb-6">GitHub Sync</h2>
                <div className="grid grid-cols-2 gap-3">
                  {reposLoading ? <p className="col-span-2 text-center py-4 animate-pulse">Loading...</p> : repos.slice(0, 4).map(repo => (
                    <a key={repo.id} href={repo.html_url} target="_blank" className="p-3 bg-black text-white rounded-2xl flex flex-col justify-between hover:scale-105 transition-transform">
                      <p className="text-xs font-bold truncate">{repo.name}</p>
                      <div className="flex items-center gap-2 mt-2 opacity-60 text-[10px]">
                        <Star size={10} /> {repo.stargazers_count}
                        <GitFork size={10} /> {repo.forks_count}
                      </div>
                    </a>
                  ))}
                </div>
              </GlassCard>
            )}
          </div>
        </div>
      </div>

      {/* Edit Profile Modal (Shared) */}
      <AnimatePresence>
        {editing && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-white flex flex-col"
          >
            <header className="px-4 py-3 flex items-center justify-between border-b border-gray-100">
              <button onClick={() => setEditing(false)} className="text-sm font-medium">Cancel</button>
              <h2 className="font-bold">Edit profile</h2>
              <button onClick={handleSave} disabled={saving} className="text-primary text-sm font-bold">{saving ? "Saving..." : "Done"}</button>
            </header>

            <div className="flex flex-col items-center py-8 gap-4">
              <div className="relative">
                <div className="w-20 h-20 rounded-full bg-gray-100 overflow-hidden">
                  {profile?.avatar_url ? <img src={profile.avatar_url} className="w-full h-full object-cover" /> : <User size={40} className="text-gray-300 mx-auto mt-5" />}
                </div>
                <div className="absolute inset-0 bg-black/20 flex items-center justify-center rounded-full">
                  <Camera size={24} className="text-white" />
                </div>
                <input type="file" className="absolute inset-0 opacity-0" onChange={handleAvatarUpload} />
              </div>
              <button className="text-primary text-xs font-bold">Edit picture or avatar</button>
            </div>

            <div className="px-4 space-y-6">
              <div className="space-y-1">
                <label className="text-xs text-gray-400">Name</label>
                <input 
                  value={formData.full_name} 
                  onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                  className="w-full py-2 border-b border-gray-100 focus:border-black outline-none text-sm font-medium"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-gray-400">Username</label>
                <input 
                  value={profile?.username} 
                  disabled
                  className="w-full py-2 border-b border-gray-100 opacity-50 outline-none text-sm font-medium"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-gray-400">Bio</label>
                <textarea 
                  value={formData.bio} 
                  onChange={(e) => setFormData({...formData, bio: e.target.value})}
                  className="w-full py-2 border-b border-gray-100 focus:border-black outline-none text-sm font-medium min-h-[80px]"
                />
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm font-medium">Private account</span>
                <input type="checkbox" checked={formData.is_private} onChange={(e) => setFormData({...formData, is_private: e.target.checked})} className="w-5 h-5 accent-primary" />
              </div>
            </div>

            <div className="mt-auto px-4 py-8 space-y-4">
              <button className="w-full py-3 bg-gray-50 text-primary font-bold rounded-xl text-sm">Switch to professional account</button>
              <button className="w-full py-3 bg-gray-50 text-primary font-bold rounded-xl text-sm">Personal information settings</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}