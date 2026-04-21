"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { User, Users, Mail, Calendar, Edit3, Save, X, Package, Download, Star, Shield, LogOut, Camera, ExternalLink, GitFork, Trash2 } from "lucide-react";
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
  followers_count?: number;
  following_count?: number;
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

useEffect(() => {
  const token = localStorage.getItem("token");
  if (!token && !session) { router.push("/login"); return; }
  if (session || token) fetchProfile();
}, [session?.user?.email]);

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
      const [profileRes, purchasesRes, analyticsRes] = await Promise.allSettled([
        api.get("/users/me"),
        api.get("/users/me/purchases"),
        api.get("/apps/analytics"),
      ]);

      let username = "";
      if (profileRes.status === "fulfilled") {
        username = profileRes.value.data.username;
        setProfile(profileRes.value.data);
        setFormData({ 
          full_name: profileRes.value.data.full_name || "", 
          email: profileRes.value.data.email || "",
          bio: profileRes.value.data.bio || "",
          is_private: profileRes.value.data.is_private || false
        });
      } else if (session?.user) {
        username = session.user.name || "";
        setProfile({ 
          id: 0, 
          username: session.user.name || "User", 
          email: session.user.email || "", 
          full_name: session.user.name || "", 
          bio: "",
          is_private: false,
          is_active: true, 
          is_publisher: false, 
          created_at: new Date().toISOString() 
        });
        setFormData({ full_name: session.user.name || "", email: session.user.email || "", bio: "", is_private: false });
      }

      // Fetch social stats if we have a username
      let followers = 0;
      let following = 0;
      if (username) {
        try {
          const socialRes = await api.get(`/social/profile/${username}`);
          followers = socialRes.data.followers_count || 0;
          following = socialRes.data.following_count || 0;
          setProfile(prev => prev ? { ...prev, followers_count: followers, following_count: following } : prev);
        } catch (err) {
          console.error("Failed to fetch social stats", err);
        }
      }

      const installs = purchasesRes.status === "fulfilled" ? purchasesRes.value.data.length : 0;
      const published = analyticsRes.status === "fulfilled" ? analyticsRes.value.data.approved : 0;
      setLiveStats({ installs, reviews: 0, published, followers, following });
    } finally {
      setLoading(false);
      fetchMyApps();
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
      fetchProfile(); // Refresh stats
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
    } catch { toast.error("Failed to update profile."); }
    finally { setSaving(false); }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    signOut({ callbackUrl: "/" });
    toast.success("Logged out successfully.");
  };

  const avatarLetter = profile?.full_name?.[0]?.toUpperCase() || profile?.username?.[0]?.toUpperCase() || "U";
  const joinDate = profile?.created_at ? new Date(profile.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long" }) : "Recently";

  const languageColors: Record<string, string> = {
    TypeScript: "bg-blue-500",
    JavaScript: "bg-yellow-400",
    Python: "bg-green-500",
    Rust: "bg-orange-500",
    Go: "bg-cyan-500",
    CSS: "bg-pink-500",
    HTML: "bg-red-500",
  };

  if (loading) return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-[calc(100vh-80px)] px-4 py-12 relative overflow-hidden bg-surface">
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/20 rounded-full blur-[150px] animate-pulse pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-4xl mx-auto relative z-10 space-y-6">

        {/* Profile Card */}
        <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
          <GlassCard className="p-8 relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-1 bg-linear-to-r from-transparent via-primary to-transparent opacity-50" />
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
              <div className="relative group">
                <div className="w-24 h-24 rounded-3xl bg-primary flex items-center justify-center text-on-primary text-4xl font-bold shadow-lg overflow-hidden">
                {profile?.avatar_url
                 ? <img src={profile.avatar_url} alt="avatar" className="w-full h-full object-cover" />
                   : session?.user?.image
                 ? <img src={session.user.image} alt="avatar" className="w-full h-full object-cover" />
                  : avatarLetter}
                </div>
               <label className="absolute -bottom-2 -right-2 w-8 h-8 bg-primary rounded-full flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                   <Camera size={14} className="text-on-primary" />
                  <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
              </label>
              </div>
              <div className="flex-1 text-center sm:text-left">
                {editing ? (
                  <input value={formData.full_name} onChange={(e) => setFormData({ ...formData, full_name: e.target.value })} className="text-2xl font-bold bg-transparent border-b-2 border-primary focus:outline-none text-on-surface w-full max-w-xs" placeholder="Your full name" />
                ) : (
                  <h1 className="text-3xl font-bold text-on-surface">{profile?.full_name || profile?.username}</h1>
                )}
                <p className="text-on-surface-variant font-medium mt-1">@{profile?.username}</p>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 mt-3">
                  <span className="flex items-center gap-1.5 text-sm text-on-surface-variant"><Calendar size={14} /> Joined {joinDate}</span>
                  {profile?.is_publisher && <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-primary bg-primary/10 px-3 py-1 rounded-full"><Shield size={12} /> Publisher</span>}
                  {profile?.is_active && <span className="text-xs font-bold uppercase tracking-widest text-green-600 bg-green-100 px-3 py-1 rounded-full">Active</span>}
                </div>
              </div>
              <div className="flex gap-2">
                {editing ? (
                  <>
                    <Button size="sm" onClick={handleSave} disabled={saving}><Save size={14} /> {saving ? "Saving..." : "Save"}</Button>
                    <button onClick={() => setEditing(false)} className="p-2 rounded-xl border border-outline-variant hover:bg-surface-low transition-all"><X size={16} className="text-on-surface-variant" /></button>
                  </>
                ) : (
                  <div className="flex gap-2">
                    <button onClick={() => router.push(`/users/${profile?.username}`)} className="flex items-center gap-2 px-4 py-2 rounded-xl border border-primary/20 bg-primary/5 hover:bg-primary/10 transition-all text-sm font-bold text-primary"><ExternalLink size={14} /> Public Profile</button>
                    <button onClick={() => setEditing(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl border border-outline-variant hover:bg-surface-low transition-all text-sm font-bold text-on-surface"><Edit3 size={14} /> Edit</button>
                  </div>
                )}
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* Stats */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.1 }} className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          {[
            { label: "Followers", value: liveStats.followers, icon: User },
            { label: "Following", value: liveStats.following, icon: Users },
            { label: "Installed", value: liveStats.installs, icon: Download },
            { label: "Published", value: liveStats.published, icon: Package },
            { label: "Reviews", value: liveStats.reviews, icon: Star },
          ].map((stat, i) => (
            <GlassCard key={i} className="p-4 text-center">
              <stat.icon size={18} className="text-primary mx-auto mb-2" />
              <p className="text-xl font-bold text-on-surface">{stat.value}</p>
              <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mt-1">{stat.label}</p>
            </GlassCard>
          ))}
        </motion.div>

        {/* Bio Section */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.15 }}>
          <GlassCard className="p-8">
            <h2 className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-4">Biography</h2>
            {editing ? (
              <textarea 
                value={formData.bio} 
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                className="w-full bg-surface-low rounded-2xl p-4 border border-outline-variant focus:outline-none focus:ring-2 focus:ring-primary/20 text-on-surface text-sm transition-all"
                placeholder="Tell the community about your innovations..."
                rows={3}
              />
            ) : (
              <p className="text-sm text-on-surface leading-relaxed italic">
                {profile?.bio || "No bio set. A panda of few words."}
              </p>
            )}
          </GlassCard>
        </motion.div>

        {/* Account Details & Privacy */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.2 }}>
          <GlassCard className="p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Account Details</h2>
              <div className="flex items-center gap-3 bg-surface-low px-3 py-1.5 rounded-full border border-outline-variant/30">
                <Shield size={14} className={formData.is_private ? "text-primary" : "text-on-surface-variant"} />
                <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                  {formData.is_private ? "Private Mode" : "Public Mode"}
                </span>
                {editing && (
                  <label className="relative inline-flex items-center cursor-pointer ml-2">
                    <input 
                      type="checkbox" 
                      checked={formData.is_private} 
                      onChange={(e) => setFormData({ ...formData, is_private: e.target.checked })}
                      className="sr-only peer" 
                    />
                    <div className="w-9 h-5 bg-outline-variant peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                )}
              </div>
            </div>
            
            <div className="space-y-5">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0"><Mail size={16} className="text-primary" /></div>
                <div className="flex-1">
                  <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Email</p>
                  {editing ? (
                    <input value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="text-sm font-medium bg-transparent border-b border-primary focus:outline-none text-on-surface w-full mt-0.5" />
                  ) : (
                    <p className="text-sm font-medium text-on-surface mt-0.5">{profile?.email || "Not set"}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0"><User size={16} className="text-primary" /></div>
                <div className="flex-1">
                  <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Username</p>
                  <p className="text-sm font-medium text-on-surface mt-0.5">@{profile?.username}</p>
                </div>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* GitHub Repos */}
        {session?.user && (
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.3 }}>
            <GlassCard className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <GitFork size={20} className="text-primary" />
                <h2 className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">GitHub Repositories</h2>
              </div>
              {reposLoading ? (
                <div className="text-center py-6 text-on-surface-variant animate-pulse">Loading repositories...</div>
              ) : repos.length === 0 ? (
                <div className="text-center py-6 text-on-surface-variant">No public repositories found.</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {repos.map((repo) => (
                    <a
                      key={repo.id}
                      href={repo.html_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-4 rounded-2xl border border-outline-variant hover:bg-surface-low transition-all group"
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <p className="font-bold text-on-surface group-hover:text-primary transition-colors truncate">{repo.name}</p>
                        <ExternalLink size={14} className="text-on-surface-variant shrink-0 mt-0.5" />
                      </div>
                      {repo.description && (
                        <p className="text-xs text-on-surface-variant mb-3 line-clamp-2">{repo.description}</p>
                      )}
                      <div className="flex items-center gap-4 text-xs text-on-surface-variant">
                        {repo.language && (
                          <span className="flex items-center gap-1.5">
                            <span className={`w-2.5 h-2.5 rounded-full ${languageColors[repo.language] || "bg-gray-400"}`} />
                            {repo.language}
                          </span>
                        )}
                        <span className="flex items-center gap-1"><Star size={12} /> {repo.stargazers_count}</span>
                        <span className="flex items-center gap-1"><GitFork size={12} /> {repo.forks_count}</span>
                      </div>
                    </a>
                  ))}
                </div>
              )}
              {repos.length > 0 && (
                <a
                  href={`https://github.com/${session.user.name}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-6 flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest text-primary hover:underline"
                >
                  <GitFork size={14} /> View All Repositories
                </a>
              )}
            </GlassCard>
          </motion.div>
        )}

        {/* My Published Apps */}
        {profile?.is_publisher && (
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.35 }}>
            <GlassCard className="p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <Package size={20} className="text-primary" />
                  <h2 className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">My Published Apps</h2>
                </div>
                <Button size="sm" variant="secondary" onClick={() => router.push("/publisher")}>
                  Upload New
                </Button>
              </div>
              
              {myAppsLoading ? (
                <div className="text-center py-6 text-on-surface-variant animate-pulse">Loading apps...</div>
              ) : myApps.length === 0 ? (
                <div className="text-center py-6 text-on-surface-variant">You haven't published any apps yet.</div>
              ) : (
                <div className="space-y-4">
                  {myApps.map((app) => (
                    <div key={app.id} className="flex items-center justify-between p-4 rounded-2xl border border-outline-variant hover:bg-surface-low transition-all bg-surface/50">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold">
                          {app.name[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-on-surface">{app.name}</p>
                          <div className="flex items-center gap-3 text-xs text-on-surface-variant mt-0.5">
                            <span className="bg-primary/5 px-2 py-0.5 rounded text-primary font-medium">{app.category}</span>
                            <span>v{app.version}</span>
                            <span>{app.is_approved ? "✅ Approved" : "⏳ Pending"}</span>
                          </div>
                        </div>
                      </div>
                      <button 
                        onClick={() => handleDeleteApp(app.id, app.name)}
                        className="p-2.5 rounded-xl text-red-500 hover:bg-red-50 transition-all border border-transparent hover:border-red-100"
                        title="Delete App"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </GlassCard>
          </motion.div>
        )}

        {/* Logout */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.4 }} className="flex justify-end">
          <button onClick={handleLogout} className="flex items-center gap-2 px-6 py-3 rounded-2xl border border-red-200 text-red-500 hover:bg-red-50 transition-all font-bold text-sm">
            <LogOut size={16} /> Sign Out
          </button>
        </motion.div>

      </div>
    </div>
  );
}