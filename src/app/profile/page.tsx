"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { 
  User, Users, Mail, Calendar, Edit3, Save, X, Package, 
  Download, Star, Shield, LogOut, Camera, ExternalLink, 
  GitFork, Trash2, Code, Sparkles
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

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      fetchProfile();
    } else if (session?.user) {
      // Handled by Providers sync
    }

    const handleSync = () => fetchProfile();
    window.addEventListener("auth-synced", handleSync);
    return () => window.removeEventListener("auth-synced", handleSync);
  }, [session?.user?.email, router]);

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
    } catch (err) {
      console.error("Failed to fetch profile/stats", err);
    } finally {
      setLoading(false);
      fetchMyApps();
    }
  };

  const fetchDetails = async (tab: string) => {
    setActiveTab(tab === activeTab ? null : tab);
    if (tab === activeTab) return;

    setDetailsLoading(true);
    try {
      if (tab === "Followers") {
        const res = await api.get(`/social/followers/${profile?.username}`);
        setFollowers(res.data);
      } else if (tab === "Following") {
        const res = await api.get(`/social/following/${profile?.username}`);
        setFollowing(res.data);
      } else if (tab === "Reviews") {
        const res = await api.get("/reviews/me");
        setMyReviews(res.data);
      } else if (tab === "Installed") {
        const res = await api.get("/users/me/purchases");
        setPurchasedApps(res.data);
      } else if (tab === "Published") {
        await fetchMyApps();
      }
    } catch {
      toast.error(`Failed to fetch ${tab.toLowerCase()}`);
    } finally {
      setDetailsLoading(false);
    }
  };

  const fetchMyApps = async () => {
    setMyAppsLoading(true);
    try {
      const res = await api.get("/apps/me");
      setMyApps(res.data);
    } catch {
      console.error("Failed to fetch my apps");
    } finally {
      setMyAppsLoading(false);
    }
  };

  const handleDeleteApp = async (appId: number, appName: string) => {
    if (!confirm(`Are you sure you want to delete "${appName}"? This action cannot be undone.`)) return;
    try {
      await api.delete(`/apps/${appId}`);
      toast.success(`"${appName}" deleted successfully`);
      fetchMyApps();
      fetchProfile(); 
    } catch {
      toast.error("Failed to delete app");
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
    toast.success("Logged out successfully.");
  };

  const avatarLetter = profile?.full_name?.[0]?.toUpperCase() || profile?.username?.[0]?.toUpperCase() || "U";
  const joinDate = profile?.created_at ? new Date(profile.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long" }) : "Recently";

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-surface">
      <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen px-4 py-12 relative overflow-hidden bg-surface">
      {/* Dynamic Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-primary/10 rounded-full blur-[150px] animate-pulse pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-4xl mx-auto relative z-10 space-y-6">
        
        {/* Profile Card - Liquid Glass Style */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <GlassCard className="p-8 relative overflow-hidden border-white/40">
            <div className="absolute top-0 inset-x-0 h-1 bg-linear-to-r from-transparent via-primary/40 to-transparent opacity-50" />
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8">
              <div className="relative group">
                <div className="w-28 h-28 rounded-[2.5rem] bg-white flex items-center justify-center text-primary text-5xl font-black shadow-2xl overflow-hidden border-2 border-white">
                  {profile?.avatar_url ? (
                    <img src={profile.avatar_url} alt="avatar" className="w-full h-full object-cover" />
                  ) : (
                    avatarLetter
                  )}
                </div>
                <label className="absolute -bottom-2 -right-2 w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center shadow-xl border-4 border-white cursor-pointer hover:scale-110 transition-transform">
                  <Camera size={18} />
                  <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
                </label>
                
                {/* Floating "Inspo" Note */}
                <div className="absolute -top-6 -left-4 bg-white/80 backdrop-blur-md px-3 py-1.5 rounded-2xl text-[10px] font-bold text-on-surface-variant shadow-lg border border-white/50">
                  Inspo needed...
                </div>
              </div>

              <div className="flex-1 text-center sm:text-left space-y-2">
                <div className="flex flex-col gap-1">
                  {editing ? (
                    <input 
                      value={formData.full_name} 
                      onChange={(e) => setFormData({ ...formData, full_name: e.target.value })} 
                      className="text-3xl font-black bg-transparent border-b-2 border-primary/30 focus:border-primary focus:outline-none text-on-surface w-full max-w-xs" 
                      placeholder="Your name"
                    />
                  ) : (
                    <h1 className="text-4xl font-black text-on-surface tracking-tight">{profile?.full_name || profile?.username}</h1>
                  )}
                  <p className="text-primary font-bold tracking-tight text-lg">@{profile?.username}</p>
                </div>
                
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mt-4">
                  <span className="flex items-center gap-1.5 text-xs font-bold text-on-surface-variant bg-white/50 px-3 py-1.5 rounded-full border border-white/50 shadow-sm">
                    <Calendar size={14} className="text-primary/60" /> Joined {joinDate}
                  </span>
                  {profile?.is_publisher && (
                    <span className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-primary bg-primary/10 px-3 py-1.5 rounded-full border border-primary/20 shadow-sm">
                      <Shield size={12} /> Publisher
                    </span>
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                {editing ? (
                  <div className="flex gap-2">
                    <Button size="sm" onClick={handleSave} disabled={saving}>
                      <Save size={16} className="mr-1.5" /> {saving ? "Saving..." : "Save"}
                    </Button>
                    <button onClick={() => setEditing(false)} className="p-2.5 rounded-2xl bg-white/50 border border-white/80 hover:bg-white transition-all shadow-sm">
                      <X size={20} className="text-on-surface-variant" />
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <button onClick={() => router.push(`/users/${profile?.username}`)} className="flex items-center gap-2 px-5 py-2.5 rounded-2xl border border-white bg-white/40 hover:bg-white/80 transition-all text-sm font-bold text-primary shadow-sm backdrop-blur-md">
                      <ExternalLink size={16} /> Public Profile
                    </button>
                    <button onClick={() => setEditing(true)} className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-primary text-white hover:bg-primary-dim transition-all text-sm font-bold shadow-lg shadow-primary/20">
                      <Edit3 size={16} /> Edit
                    </button>
                  </div>
                )}
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* Stats Grid - Liquid Glass Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          {[
            { label: "Followers", value: liveStats.followers, icon: User },
            { label: "Following", value: liveStats.following, icon: Users },
            { label: "Installed", value: liveStats.installs, icon: Download },
            { label: "Published", value: liveStats.published, icon: Package },
            { label: "Reviews", value: liveStats.reviews, icon: Star },
          ].map((stat, i) => (
            <motion.button 
              key={i} 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.05 }}
              onClick={() => fetchDetails(stat.label)}
              className="group"
            >
              <GlassCard className={`p-4 text-center transition-all h-full border-white/60 ${activeTab === stat.label ? 'border-primary bg-primary/5 ring-1 ring-primary/20' : 'hover:bg-white/80'}`}>
                <div className={`w-10 h-10 rounded-2xl mx-auto mb-3 flex items-center justify-center transition-colors ${activeTab === stat.label ? 'bg-primary text-white' : 'bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white'}`}>
                  <stat.icon size={20} />
                </div>
                <p className="text-2xl font-black text-on-surface tracking-tight">{stat.value}</p>
                <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant mt-1">{stat.label}</p>
              </GlassCard>
            </motion.button>
          ))}
        </div>

        {/* Details Dropdown Content */}
        <AnimatePresence mode="wait">
          {activeTab && (
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <GlassCard className="p-8 border-primary/20 bg-white/40 mb-6">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-sm font-black uppercase tracking-[0.2em] text-primary flex items-center gap-3">
                    <Sparkles size={18} /> {activeTab} Details
                  </h3>
                  <button onClick={() => setActiveTab(null)} className="p-2 hover:bg-white rounded-xl transition-colors shadow-sm">
                    <X size={18} className="text-on-surface-variant" />
                  </button>
                </div>

                {detailsLoading ? (
                  <div className="flex flex-col items-center justify-center py-16 gap-4">
                    <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                    <p className="text-xs font-black text-primary uppercase tracking-[0.2em]">Hydrating...</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {(activeTab === "Followers" || activeTab === "Following") && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {(activeTab === "Followers" ? followers : following).length === 0 ? (
                          <div className="col-span-full py-12 text-center text-on-surface-variant font-bold border-2 border-dashed border-white/60 rounded-[2rem]">
                            No {activeTab.toLowerCase()} yet.
                          </div>
                        ) : (
                          (activeTab === "Followers" ? followers : following).map((u: any) => (
                            <div key={u.id} className="flex items-center justify-between p-4 bg-white/60 rounded-3xl border border-white/80 hover:bg-white transition-all shadow-sm">
                              <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-black text-lg border-2 border-white">
                                  {u.avatar_url ? <img src={u.avatar_url} className="w-full h-full rounded-2xl object-cover" /> : u.username[0].toUpperCase()}
                                </div>
                                <div>
                                  <p className="font-black text-on-surface">@{u.username}</p>
                                  <p className="text-[11px] text-on-surface-variant font-medium line-clamp-1">{u.bio || "Active Panda user"}</p>
                                </div>
                              </div>
                              <Button size="sm" variant="secondary" onClick={() => router.push(`/users/${u.username}`)}>View</Button>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                    
                    {activeTab === "Installed" && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {purchasedApps.length === 0 ? (
                          <div className="col-span-full py-12 text-center text-on-surface-variant font-bold border-2 border-dashed border-white/60 rounded-[2rem]">No apps installed.</div>
                        ) : (
                          purchasedApps.map((p: any) => (
                            <div key={p.id} className="flex items-center gap-4 p-4 bg-white/60 rounded-3xl border border-white/80 hover:bg-white transition-all cursor-pointer shadow-sm" onClick={() => router.push(`/apps/${p.app.id}`)}>
                              <div className="w-14 h-14 rounded-2xl bg-primary/5 flex items-center justify-center text-primary font-black text-xl border-2 border-white">{p.app.name[0].toUpperCase()}</div>
                              <div className="flex-1">
                                <p className="font-black text-on-surface">{p.app.name}</p>
                                <p className="text-[10px] text-primary font-black uppercase tracking-widest">{p.app.category}</p>
                              </div>
                              <span className="bg-green-500/10 text-green-600 px-2.5 py-1 rounded-full text-[10px] font-black tracking-widest">READY</span>
                            </div>
                          ))
                        )}
                      </div>
                    )}

                    {activeTab === "Published" && (
                      <div className="space-y-4">
                        {myApps.length === 0 ? (
                          <div className="py-12 text-center text-on-surface-variant font-bold border-2 border-dashed border-white/60 rounded-[2rem]">No apps published.</div>
                        ) : (
                          myApps.map((app: any) => (
                            <div key={app.id} className="flex items-center justify-between p-5 bg-white/60 rounded-3xl border border-white/80 shadow-sm">
                              <div className="flex items-center gap-5">
                                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-black text-xl border-2 border-white">{app.name[0].toUpperCase()}</div>
                                <div>
                                  <p className="font-black text-on-surface text-lg">{app.name}</p>
                                  <div className="flex gap-2 mt-1">
                                    <span className={`text-[10px] font-black px-2.5 py-1 rounded-full tracking-widest ${app.is_approved ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}>
                                      {app.is_approved ? 'APPROVED' : 'PENDING'}
                                    </span>
                                    <span className="text-[10px] font-black text-on-surface-variant bg-white/80 px-2.5 py-1 rounded-full tracking-widest border border-white/80 uppercase">{app.category}</span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <button onClick={() => router.push(`/apps/${app.id}`)} className="p-3 hover:bg-white rounded-2xl transition-all text-primary shadow-sm border border-white/80"><ExternalLink size={20} /></button>
                                <button onClick={() => handleDeleteApp(app.id, app.name)} className="p-3 hover:bg-red-50 rounded-2xl transition-all text-red-500 shadow-sm border border-transparent hover:border-red-100"><Trash2 size={20} /></button>
                              </div>
                            </div>
                          ))
                        )}
                        <Button variant="secondary" className="w-full mt-2" onClick={() => router.push("/publisher")}>Upload New Achievement</Button>
                      </div>
                    )}

                    {activeTab === "Reviews" && (
                      <div className="space-y-4">
                        {myReviews.length === 0 ? (
                          <div className="py-12 text-center text-on-surface-variant font-bold border-2 border-dashed border-white/60 rounded-[2rem]">No reviews yet.</div>
                        ) : (
                          myReviews.map((r: any) => (
                            <div key={r.id} className="p-6 bg-white/60 rounded-3xl border border-white/80 shadow-sm">
                              <div className="flex items-center justify-between mb-3">
                                <div className="flex gap-1">
                                  {[...Array(5)].map((_, i) => (
                                    <Star key={i} size={14} className={i < r.rating ? "fill-primary text-primary" : "text-primary/10"} />
                                  ))}
                                </div>
                                <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest">{new Date(r.created_at).toLocaleDateString()}</p>
                              </div>
                              <p className="text-sm font-medium text-on-surface-variant italic">"{r.comment}"</p>
                              <div className="mt-4 flex justify-end">
                                <Button size="sm" variant="tertiary" className="text-[10px] font-black" onClick={() => router.push(`/apps/${r.app_id}`)}>View App</Button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                )}
              </GlassCard>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bio Card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <GlassCard className="p-8 border-white/60">
            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-primary mb-6">Biography</h2>
            {editing ? (
              <textarea 
                value={formData.bio} 
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                className="w-full bg-white/40 rounded-3xl p-5 border-2 border-white/80 focus:border-primary/30 focus:outline-none text-on-surface text-sm transition-all font-medium"
                placeholder="Share your story..."
                rows={3}
              />
            ) : (
              <p className="text-lg text-on-surface/80 leading-relaxed font-medium italic">
                {profile?.bio || "A panda of few words, but infinite innovations."}
              </p>
            )}
          </GlassCard>
        </motion.div>

        {/* Account Details */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <GlassCard className="p-8 border-white/60">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xs font-black uppercase tracking-[0.2em] text-primary">Account Security</h2>
              <div className="flex items-center gap-3 bg-white/60 px-4 py-2 rounded-full border border-white/80 shadow-sm">
                <Shield size={16} className={formData.is_private ? "text-primary" : "text-on-surface-variant"} />
                <span className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">
                  {formData.is_private ? "Private Mode" : "Public Mode"}
                </span>
                {editing && (
                  <label className="relative inline-flex items-center cursor-pointer ml-2">
                    <input type="checkbox" checked={formData.is_private} onChange={(e) => setFormData({ ...formData, is_private: e.target.checked })} className="sr-only peer" />
                    <div className="w-10 h-5 bg-primary/10 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="flex items-center gap-5 p-4 bg-white/40 rounded-3xl border border-white/80">
                <div className="w-12 h-12 rounded-2xl bg-primary/5 flex items-center justify-center text-primary"><Mail size={20} /></div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-primary">Email Address</p>
                  {editing ? (
                    <input value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="text-sm font-bold bg-transparent border-b border-primary/30 focus:outline-none text-on-surface w-full mt-1" />
                  ) : (
                    <p className="text-sm font-bold text-on-surface mt-1">{profile?.email || "Not verified"}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-5 p-4 bg-white/40 rounded-3xl border border-white/80">
                <div className="w-12 h-12 rounded-2xl bg-primary/5 flex items-center justify-center text-primary"><User size={20} /></div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-primary">System Handle</p>
                  <p className="text-sm font-bold text-on-surface mt-1">@{profile?.username}</p>
                </div>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* GitHub Integration */}
        {session?.user && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
            <GlassCard className="p-8 border-white/60">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-black text-white flex items-center justify-center shadow-lg"><Code size={24} /></div>
                  <div>
                    <h2 className="text-sm font-black uppercase tracking-tight text-on-surface">GitHub Repositories</h2>
                    <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Active Sync</p>
                  </div>
                </div>
                <ExternalLink size={18} className="text-on-surface-variant" />
              </div>

              {reposLoading ? (
                <div className="flex justify-center py-10 animate-pulse text-primary font-black uppercase tracking-widest">Fetching Repos...</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {repos.map((repo) => (
                    <a key={repo.id} href={repo.html_url} target="_blank" rel="noreferrer" className="p-5 rounded-3xl bg-white/40 border border-white/80 hover:bg-white hover:border-primary/20 transition-all group shadow-sm">
                      <p className="font-black text-on-surface group-hover:text-primary transition-colors truncate">{repo.name}</p>
                      {repo.description && <p className="text-[11px] text-on-surface-variant mt-2 line-clamp-2 font-medium">{repo.description}</p>}
                      <div className="flex items-center gap-4 mt-4 text-[10px] font-black text-on-surface-variant uppercase tracking-widest">
                        <span className="flex items-center gap-1.5"><Star size={12} className="text-yellow-500 fill-yellow-500" /> {repo.stargazers_count}</span>
                        <span className="flex items-center gap-1.5"><GitFork size={12} /> {repo.forks_count}</span>
                        {repo.language && <span className="bg-primary/5 text-primary px-2 py-1 rounded-full">{repo.language}</span>}
                      </div>
                    </a>
                  ))}
                </div>
              )}
            </GlassCard>
          </motion.div>
        )}

        {/* Footer Actions */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="flex justify-between items-center pt-8 border-t border-white/40">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant">PandaStore Security v2.0</p>
          <button onClick={handleLogout} className="flex items-center gap-3 px-8 py-3 rounded-2xl bg-white border border-red-100 text-red-500 hover:bg-red-50 transition-all font-black text-xs shadow-sm uppercase tracking-widest">
            <LogOut size={16} /> Sign Out
          </button>
        </motion.div>

      </div>
    </div>
  );
}