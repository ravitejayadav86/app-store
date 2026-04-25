"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { 
  User, Users, Mail, Calendar, Edit3, Save, X, Package, 
  Download, Star, Shield, LogOut, Camera, ExternalLink, 
  GitFork, Trash2, Code, Sparkles, Plus, Menu, ChevronDown,
  Grid as GridIcon, Bookmark, UserSquare2, AtSign, UserPlus, ChevronRight,
  CreditCard, MapPin, ChevronLeft, Smartphone, Check
} from "lucide-react";
import api from "@/lib/api";
import { toast } from "sonner";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

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
  billing_address?: string;
  payment_method?: string;
  biometric_enabled?: boolean;
  safe_browsing?: boolean;
  auto_update?: string;
  download_pref?: string;
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
  requests: number;
}

export default function ProfileClient() {
  const router = useRouter();
  const { data: session } = useSession();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [showPersonalInfo, setShowPersonalInfo] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({ 
    full_name: "", 
    email: "", 
    bio: "", 
    is_private: false,
    billing_address: "",
    payment_method: "",
    biometric_enabled: false,
    safe_browsing: true,
    auto_update: "Over Wi-Fi only",
    download_pref: "Ask every time"
  });
  const [liveStats, setLiveStats] = useState<LiveStats>({ 
    installs: 0, 
    reviews: 0, 
    published: 0, 
    followers: 0, 
    following: 0,
    requests: 0 
  });
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
    if (!token && !session) {
      router.push("/login");
      return;
    }
    fetchProfile();
    
    const handleSync = () => fetchProfile();
    window.addEventListener("auth-synced", handleSync);
    return () => window.removeEventListener("auth-synced", handleSync);
  }, [session, router]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const profileRes = await api.get("/users/me");
      setProfile(profileRes.data);
      setFormData({ 
        full_name: profileRes.data.full_name || "", 
        email: profileRes.data.email || "",
        bio: profileRes.data.bio || "",
        is_private: profileRes.data.is_private || false,
        billing_address: profileRes.data.billing_address || "",
        payment_method: profileRes.data.payment_method || "",
        biometric_enabled: profileRes.data.biometric_enabled || false,
        safe_browsing: profileRes.data.safe_browsing ?? true,
        auto_update: profileRes.data.auto_update || "Over Wi-Fi only",
        download_pref: profileRes.data.download_pref || "Ask every time"
      });

      const statsRes = await api.get("/users/me/stats");
      const reqRes = await api.get("/social/requests/pending");
      setLiveStats({
        ...statsRes.data,
        requests: reqRes.data.length
      });

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
      setProfile(prev => prev ? { ...prev, avatar_url: res.data.avatar_url } : null);
      toast.success("Avatar updated!");
    } catch {
      toast.error("Avatar upload failed.");
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await api.put("/users/me", formData);
      setProfile(res.data);
      setEditing(false);
      setShowPersonalInfo(false);
      toast.success("Profile updated successfully!");
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
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="bg-white/80 backdrop-blur-md border-b border-gray-100 px-6 py-4 flex items-center justify-between sticky top-0 z-[100] sm:hidden">
        <div className="w-24 h-6 bg-gray-100 rounded-lg animate-pulse" />
        <div className="w-8 h-8 bg-gray-100 rounded-full animate-pulse" />
      </div>

      <div className="flex-1 max-w-5xl mx-auto w-full px-4 sm:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm space-y-6">
              <div className="w-32 h-32 bg-gray-100 rounded-3xl mx-auto animate-pulse" />
              <div className="space-y-3 text-center">
                <div className="w-48 h-8 bg-gray-100 rounded-xl mx-auto animate-pulse" />
                <div className="w-32 h-4 bg-gray-100 rounded-lg mx-auto animate-pulse" />
              </div>
            </div>
          </div>
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm h-[400px] animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-surface pb-24 sm:pb-0">
      
      {/* 📱 MOBILE UI (Instagram Reference) */}
      <div className="sm:hidden flex flex-col min-h-screen bg-white">
        <header className="sticky top-0 z-50 bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => router.back()} aria-label="Go back" className="text-gray-900">
              <ChevronLeft size={24} />
            </button>
            <div className="relative w-7 h-7">
              <Image 
                src="/paw-logo.png" 
                alt="Paw Logo" 
                fill
                priority
                className="object-contain" 
                sizes="28px"
              />
            </div>
            <h1 className="font-bold text-lg flex items-center gap-1">
              {profile?.username} <ChevronDown size={14} />
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => router.push("/publisher")} aria-label="Go to Publisher Hub" className="text-gray-900"><Plus size={24} /></button>
            <button aria-label="Open Menu" className="text-gray-900"><Menu size={24} /></button>
          </div>
        </header>

        <div className="px-4 pt-4 flex items-center gap-6">
          <div className="relative">
            <div className="w-20 h-20 rounded-full border-2 border-primary p-0.5">
              <div className="relative w-full h-full rounded-full bg-gray-100 flex items-center justify-center text-primary font-black text-2xl overflow-hidden border border-white">
                {profile?.avatar_url ? (
                  <Image 
                    src={profile.avatar_url} 
                    alt="Avatar"
                    fill
                    priority
                    className="object-cover"
                    sizes="80px"
                  />
                ) : profile?.username[0].toUpperCase()}
              </div>
            </div>
            <label className="absolute bottom-0 right-0 w-6 h-6 bg-primary rounded-full border-2 border-white flex items-center justify-center text-white cursor-pointer shadow-lg">
              <Camera size={12} />
              <input type="file" className="hidden" onChange={handleAvatarUpload} accept="image/*" />
            </label>
          </div>
          <div className="flex-1 flex justify-around">
            <div className="text-center" onClick={() => router.push("/profile/publisher")}>
              <p className="font-black text-sm">{liveStats.published}</p>
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Apps</p>
            </div>
            <div className="text-center" onClick={() => router.push("/profile/followers")}>
              <p className="font-black text-sm">{liveStats.followers}</p>
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Followers</p>
            </div>
            <div className="text-center" onClick={() => router.push("/profile/following")}>
              <p className="font-black text-sm">{liveStats.following}</p>
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Following</p>
            </div>
          </div>
        </div>

        <div className="px-4 mt-3 space-y-0.5">
          <p className="font-bold text-sm">{profile?.full_name || profile?.username}</p>
          <p className="text-xs text-gray-400">Developer</p>
          <p className="text-sm text-gray-800 leading-tight">
            {profile?.bio || "A panda of few words, but infinite innovations."}
          </p>
          {profile?.is_publisher && (
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-100 mt-2">
              <Shield size={10} />
              <span className="text-[10px] font-bold uppercase tracking-wider">Verified Publisher</span>
            </div>
          )}
        </div>

        <div className="px-4 mt-4 grid grid-cols-2 gap-2">
          <button onClick={() => setEditing(true)} className="py-2 bg-gray-100 text-gray-900 font-bold rounded-xl text-sm hover:bg-gray-200 transition-colors">Edit Profile</button>
          <button className="py-2 bg-gray-100 text-gray-900 font-bold rounded-xl text-sm hover:bg-gray-200 transition-colors">Share Profile</button>
        </div>

        <div className="mt-6 flex border-b border-gray-100">
          <button aria-label="Grid View" onClick={() => setActiveTab(null)} className={`flex-1 py-3 flex justify-center border-b-2 ${!activeTab ? "border-primary text-primary" : "border-transparent text-gray-400"}`}><GridIcon size={20} /></button>
          <button aria-label="Installed Apps" onClick={() => setActiveTab("installed")} className={`flex-1 py-3 flex justify-center border-b-2 ${activeTab === "installed" ? "border-primary text-primary" : "border-transparent text-gray-400"}`}><Package size={20} /></button>
          <button aria-label="Saved Items" onClick={() => setActiveTab("saved")} className={`flex-1 py-3 flex justify-center border-b-2 ${activeTab === "saved" ? "border-primary text-primary" : "border-transparent text-gray-400"}`}><Bookmark size={20} /></button>
          <button aria-label="Tagged Posts" onClick={() => setActiveTab("tags")} className={`flex-1 py-3 flex justify-center border-b-2 ${activeTab === "tags" ? "border-primary text-primary" : "border-transparent text-gray-400"}`}><UserSquare2 size={20} /></button>
        </div>

        <div className="flex-1 bg-white">
          <div className="grid grid-cols-3 gap-0.5">
              <div key={app.id} onClick={() => router.push(`/apps/${app.id}`)} className="aspect-square bg-gray-100 relative group overflow-hidden">
                <Image 
                  src={app.icon_url || "/app-placeholder.png"} 
                  alt={app.name}
                  fill
                  className="object-cover transition-transform group-hover:scale-110" 
                  sizes="(max-width: 768px) 33vw, 200px"
                />
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-4 text-white text-xs font-bold transition-opacity">
                  <span className="flex items-center gap-1"><Star size={12} fill="white" /> {app.rating || "0"}</span>
                  <span className="flex items-center gap-1"><Download size={12} fill="white" /> {app.downloads_count || "0"}</span>
                </div>
              </div>
            ))}
              <div key={p.id} onClick={() => router.push(`/apps/${p.app_id}`)} className="aspect-square bg-gray-100 relative overflow-hidden">
                <Image 
                  src={p.app?.icon_url || "/app-placeholder.png"} 
                  alt={p.app?.name || "App"}
                  fill
                  className="object-cover" 
                  sizes="(max-width: 768px) 33vw, 200px"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="mt-auto px-4 py-8 space-y-4">
          <button onClick={() => router.push("/publisher")} className="w-full py-3 bg-gray-50 text-primary font-bold rounded-xl text-sm">Switch to professional account</button>
          <button onClick={() => setShowPersonalInfo(true)} className="w-full py-3 bg-gray-50 text-primary font-bold rounded-xl text-sm">Personal information settings</button>
        </div>
      </div>

      {/* 🖥️ DESKTOP UI (White Liquid Glass) */}
      <div className="hidden sm:block">
        <div className="max-w-6xl mx-auto px-6 pt-32 pb-20">
          <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="mb-6">
            <button 
              onClick={() => router.back()}
              className="group flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors font-bold text-sm"
            >
              <div className="p-2 rounded-xl bg-surface-low border border-outline-variant group-hover:border-primary/30 transition-all">
                <ChevronLeft size={18} />
              </div>
              Back
            </button>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
            <GlassCard className="p-10 border-white/60 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-12 opacity-[0.03] rotate-12 pointer-events-none">
                <User size={300} className="text-primary" />
              </div>
              
              <div className="relative flex flex-col md:flex-row items-center gap-12">
                <div className="relative group">
                  <div className="relative w-48 h-48 rounded-[2.5rem] bg-linear-to-br from-primary to-primary-container p-1 shadow-2xl shadow-primary/20 transition-transform hover:scale-105 overflow-hidden">
                    <div className="relative w-full h-full rounded-[2.3rem] bg-white flex items-center justify-center text-primary font-black text-6xl overflow-hidden border-4 border-white shadow-inner">
                      {profile?.avatar_url ? (
                        <Image 
                          src={profile.avatar_url} 
                          alt="Profile"
                          fill
                          priority
                          className="object-cover"
                          sizes="192px"
                        />
                      ) : profile?.username[0].toUpperCase()}
                    </div>
                  </div>
                  <label className="absolute -bottom-4 -right-4 w-12 h-12 bg-white rounded-2xl shadow-xl flex items-center justify-center text-primary cursor-pointer border border-gray-100 hover:scale-110 active:scale-95 transition-all">
                    <Camera size={20} />
                    <input type="file" className="hidden" onChange={handleAvatarUpload} accept="image/*" />
                  </label>
                </div>

                <div className="flex-1 space-y-6 text-center md:text-left">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center justify-center md:justify-start gap-3">
                        <h1 className="text-4xl font-black text-gray-900 tracking-tight">@{profile?.username}</h1>
                        {profile?.is_publisher && <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-primary/20">Verified Publisher</span>}
                      </div>
                      <p className="text-gray-500 font-medium flex items-center justify-center md:justify-start gap-2"><AtSign size={14} /> {profile?.full_name || "Innovator"}</p>
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

          <div className="grid grid-cols-5 gap-4">
            {[
              { label: "Followers", value: liveStats.followers, icon: User, href: "/profile/followers" },
              { label: "Following", value: liveStats.following, icon: Users, href: "/profile/following" },
              { label: "Installed", value: liveStats.installs, icon: Download, href: "/profile/installed" },
              { label: "Published", value: liveStats.published, icon: Package, href: "/profile/publisher" },
              { label: "Reviews", value: liveStats.reviews, icon: Star, href: "/profile/reviews" },
            ].map((stat, i) => (
              <GlassCard key={i} className="p-4 text-center hover:bg-white/80 transition-all cursor-pointer" onClick={() => router.push(stat.href)}>
                <div className="w-10 h-10 rounded-2xl mx-auto mb-2 bg-primary/10 text-primary flex items-center justify-center"><stat.icon size={20} /></div>
                <p className="text-2xl font-black">{stat.value}</p>
                <p className="text-[10px] font-black uppercase tracking-widest opacity-60">{stat.label}</p>
              </GlassCard>
            ))}
          </div>

          <div className="mt-12 space-y-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <GlassCard className="p-8 border-white/60">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xs font-black uppercase tracking-[0.2em] text-primary">Account Details</h2>
                  <button onClick={() => setShowPersonalInfo(true)} className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline">Manage</button>
                </div>
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
                  <div className="flex items-center gap-4 p-3 bg-white/40 rounded-2xl border border-white/60">
                    <MapPin size={18} className="text-primary" />
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest opacity-50">Billing Address</p>
                      <p className="text-sm font-bold truncate max-w-[200px]">{profile?.billing_address || "Not set"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-3 bg-white/40 rounded-2xl border border-white/60">
                    <CreditCard size={18} className="text-primary" />
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest opacity-50">Payment Method</p>
                      <p className="text-sm font-bold">{profile?.payment_method || "Not set"}</p>
                    </div>
                  </div>
                </div>
              </GlassCard>

              {session?.user && (
                <GlassCard className="p-8 border-white/60 flex flex-col justify-between">
                  <div>
                    <h2 className="text-xs font-black uppercase tracking-[0.2em] text-primary mb-6">Connected Accounts</h2>
                    <div className="flex items-center gap-4 p-4 bg-gray-900 text-white rounded-3xl">
                      <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                        <Code size={20} />
                      </div>
                      <div className="flex-1">
                        <p className="text-[10px] font-black uppercase tracking-widest opacity-50">Github Connected</p>
                        <p className="text-sm font-bold">{(session.user as any).login || session.user.name}</p>
                      </div>
                      <Check size={20} className="text-green-400" />
                    </div>
                  </div>
                  <div className="mt-8">
                    <button className="w-full py-4 rounded-2xl bg-white border border-gray-100 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-primary hover:border-primary transition-all">Link External Services</button>
                  </div>
                </GlassCard>
              )}
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-black text-gray-900">Recently Published</h2>
                <button onClick={() => router.push("/publisher")} className="text-xs font-black uppercase tracking-widest text-primary flex items-center gap-2 hover:translate-x-1 transition-transform">Go to Publisher Hub <ChevronRight size={14} /></button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {myApps.slice(0, 3).map((app) => (
                  <GlassCard key={app.id} className="p-4 hover:shadow-xl transition-all cursor-pointer group" onClick={() => router.push(`/apps/${app.id}`)}>
                    <div className="flex gap-4">
                      <div className="relative w-16 h-16 rounded-2xl bg-gray-50 overflow-hidden border border-gray-100 group-hover:scale-105 transition-transform">
                        <Image 
                          src={app.icon_url || "/app-placeholder.png"} 
                          alt={app.name}
                          fill
                          className="object-cover" 
                          sizes="64px"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-900 truncate">{app.name}</h3>
                        <p className="text-xs text-gray-500">{app.category}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-[10px] font-black bg-primary/10 text-primary px-2 py-0.5 rounded-md">{app.price === 0 ? "FREE" : `$${app.price}`}</span>
                        </div>
                      </div>
                    </div>
                  </GlassCard>
                ))}
                {myApps.length === 0 && (
                  <div className="col-span-full py-12 text-center bg-gray-50 rounded-[2rem] border border-dashed border-gray-200">
                    <p className="text-gray-400 font-bold">No apps published yet.</p>
                    <button onClick={() => router.push("/publisher")} className="mt-2 text-primary font-black uppercase text-[10px] tracking-widest hover:underline">Start Publishing</button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      <AnimatePresence>
        {editing && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="w-full max-w-lg bg-white rounded-[2.5rem] overflow-hidden shadow-2xl">
              <header className="px-8 py-6 border-b border-gray-100 flex items-center justify-between">
                <h2 className="text-xl font-black text-gray-900">Edit Profile</h2>
                <button onClick={() => setEditing(false)} aria-label="Close edit profile" className="text-gray-400 hover:text-gray-900"><X size={24} /></button>
              </header>
              <div className="p-8 space-y-6">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Full Name</label>
                  <input type="text" value={formData.full_name} onChange={e => setFormData({ ...formData, full_name: e.target.value })} className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-primary/20 outline-none font-bold text-gray-900" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Bio</label>
                  <textarea value={formData.bio} onChange={e => setFormData({ ...formData, bio: e.target.value })} className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-primary/20 outline-none font-medium text-gray-900 min-h-[100px] resize-none" />
                </div>
                <div className="flex items-center justify-between p-6 bg-gray-50 rounded-3xl">
                  <div>
                    <p className="font-bold text-gray-900">Private Account</p>
                    <p className="text-xs text-gray-500">Hide your library from others</p>
                  </div>
                  <input type="checkbox" checked={formData.is_private} onChange={e => setFormData({ ...formData, is_private: e.target.checked })} className="w-6 h-6 accent-primary" />
                </div>
                <div className="flex gap-4 pt-4">
                  <button onClick={() => setEditing(false)} className="flex-1 py-4 text-gray-400 font-bold text-sm">Cancel</button>
                  <Button className="flex-1 py-4" onClick={handleSave} disabled={saving}>{saving ? "Saving..." : "Save Changes"}</Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Personal Information Modal (New) */}
      <AnimatePresence>
        {showPersonalInfo && (
          <motion.div 
            initial={{ opacity: 0, x: "100%" }} 
            animate={{ opacity: 1, x: 0 }} 
            exit={{ opacity: 0, x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[110] bg-white flex flex-col sm:max-w-md sm:ml-auto sm:shadow-2xl sm:border-l sm:border-gray-100"
          >
            <header className="px-4 py-3 flex items-center justify-between border-b border-gray-100 bg-white sticky top-0 z-10">
              <button onClick={() => setShowPersonalInfo(false)} aria-label="Go back" className="p-2 -ml-2 text-gray-500 hover:text-black transition-colors">
                <ChevronLeft size={24} />
              </button>
              <h2 className="font-bold text-lg">Personal Information</h2>
              <button onClick={handleSave} disabled={saving} className="text-primary text-sm font-bold disabled:opacity-50">
                {saving ? "Saving..." : "Save"}
              </button>
            </header>

            <div className="flex-1 overflow-y-auto px-5 py-6 space-y-8 pb-32">
              <div className="bg-gray-50 p-5 rounded-3xl flex items-center gap-4">
                <div className="relative w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center text-primary font-black text-xl overflow-hidden">
                  {profile?.avatar_url ? (
                    <Image 
                      src={profile.avatar_url} 
                      alt="Avatar Small"
                      fill
                      className="object-cover"
                      sizes="56px"
                    />
                  ) : profile?.username[0].toUpperCase()}
                </div>
                <div>
                  <p className="font-bold text-gray-900">@{profile?.username}</p>
                  <p className="text-xs text-gray-500">{profile?.email}</p>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400">Billing & Payment</h3>
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-500 flex items-center gap-2"><MapPin size={12} /> Billing Address</label>
                    <textarea 
                      value={formData.billing_address} 
                      onChange={(e) => setFormData({...formData, billing_address: e.target.value})}
                      placeholder="Street, City, State, ZIP"
                      className="w-full px-4 py-3 bg-gray-100 border-none rounded-2xl text-sm font-medium focus:ring-2 focus:ring-primary/20 outline-none resize-none min-h-[80px]"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-500 flex items-center gap-2"><CreditCard size={12} /> Payment Method</label>
                    <select 
                      value={formData.payment_method} 
                      onChange={(e) => setFormData({...formData, payment_method: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-100 border-none rounded-2xl text-sm font-medium focus:ring-2 focus:ring-primary/20 outline-none"
                    >
                      <option value="">None selected</option>
                      <option value="Visa">Visa (ending in ****)</option>
                      <option value="Mastercard">Mastercard (ending in ****)</option>
                      <option value="Apple Pay">Apple Pay</option>
                      <option value="Google Pay">Google Pay</option>
                      <option value="Crypto">Crypto Wallet</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400">Security & Preferences</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                    <div className="flex items-center gap-3">
                      <Shield size={18} className="text-gray-400" />
                      <span className="text-sm font-medium">Safe Browsing</span>
                    </div>
                    <input 
                      type="checkbox" 
                      checked={formData.safe_browsing} 
                      onChange={(e) => setFormData({...formData, safe_browsing: e.target.checked})} 
                      className="w-5 h-5 accent-primary" 
                    />
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                    <div className="flex items-center gap-3">
                      <Smartphone size={18} className="text-gray-400" />
                      <span className="text-sm font-medium">Biometric Login</span>
                    </div>
                    <input 
                      type="checkbox" 
                      checked={formData.biometric_enabled} 
                      onChange={(e) => setFormData({...formData, biometric_enabled: e.target.checked})} 
                      className="w-5 h-5 accent-primary" 
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4 pb-12">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400">App Preferences</h3>
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-500">Auto-update apps</label>
                    <select 
                      value={formData.auto_update} 
                      onChange={(e) => setFormData({...formData, auto_update: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-100 border-none rounded-2xl text-sm font-medium outline-none"
                    >
                      <option value="Over Wi-Fi only">Over Wi-Fi only</option>
                      <option value="Over any network">Over any network</option>
                      <option value="Don't auto-update">Don't auto-update</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-500">App download preference</label>
                    <select 
                      value={formData.download_pref} 
                      onChange={(e) => setFormData({...formData, download_pref: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-100 border-none rounded-2xl text-sm font-medium outline-none"
                    >
                      <option value="Ask every time">Ask every time</option>
                      <option value="Over Wi-Fi only">Over Wi-Fi only</option>
                      <option value="Over any network">Over any network</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 bg-white border-t border-gray-100 sticky bottom-0">
               <button 
                 onClick={handleLogout}
                 className="w-full py-4 text-red-500 font-bold text-sm bg-red-50 rounded-2xl hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
               >
                 <LogOut size={18} /> Sign out of current session
               </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-white/50 backdrop-blur-xl pointer-events-none fixed bottom-0 left-0 right-0 h-24 z-[90] sm:hidden" />
    </div>
  );
}
