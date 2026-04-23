"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  User, Users, Mail, Calendar, Edit3, Save, X, Package, 
  Download, Star, Shield, LogOut, Camera, ExternalLink, 
  GitFork, Trash2, Plus, ChevronDown, Menu, AtSign, UserPlus, 
  Share2, MessageCircle
} from "lucide-react";
import api from "@/lib/api";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { Button } from "@/components/ui/Button";

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
  const [myApps, setMyApps] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      fetchProfile();
    } else if (session?.user) {
      // Syncing handled by Providers.tsx
    }

    const handleSync = () => fetchProfile();
    window.addEventListener("auth-synced", handleSync);
    return () => window.removeEventListener("auth-synced", handleSync);
  }, [session?.user?.email, router]);

  const fetchProfile = async () => {
    try {
      const [profileRes] = await Promise.allSettled([
        api.get("/users/me"),
      ]);

      if (profileRes.status === "fulfilled") {
        setProfile(profileRes.value.data);
        setFormData({ 
          full_name: profileRes.value.data.full_name || "", 
          email: profileRes.value.data.email || "",
          bio: profileRes.value.data.bio || "",
          is_private: profileRes.value.data.is_private || false
        });
      } else if (session?.user) {
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
      }

      try {
        const statsRes = await api.get("/users/me/stats");
        setLiveStats(statsRes.data);
      } catch (err) {
        console.error("Failed to fetch stats", err);
      }
    } finally {
      setLoading(false);
      fetchMyApps();
    }
  };

  const fetchMyApps = async () => {
    try {
      const res = await api.get("/apps/me");
      setMyApps(res.data);
    } catch {
      console.error("Failed to fetch my apps");
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

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#000000] text-white selection:bg-white/20">
      {/* Top Navigation Bar */}
      <nav className="flex items-center justify-between px-4 py-3 sticky top-0 bg-black/80 backdrop-blur-md z-50">
        <div className="flex items-center gap-6">
          <button className="hover:opacity-60 transition-opacity">
            <Plus size={24} />
          </button>
        </div>
        
        <div className="flex items-center gap-1 cursor-pointer hover:opacity-60 transition-opacity">
          <span className="font-bold text-[17px] tracking-tight truncate max-w-[150px]">
            {profile?.username}
          </span>
          <ChevronDown size={16} className="mt-0.5" />
          {profile?.is_private && <Shield size={12} className="ml-1 text-white/40" />}
        </div>

        <div className="flex items-center gap-5">
          <div className="relative">
            <AtSign size={24} className="hover:opacity-60 transition-opacity cursor-pointer" />
            <div className="absolute -top-1.5 -right-2 bg-[#ff3b30] text-[10px] font-bold px-1.5 py-0.5 rounded-full border-2 border-black min-w-[20px] text-center">
              9+
            </div>
          </div>
          <Menu size={28} className="hover:opacity-60 transition-opacity cursor-pointer" />
        </div>
      </nav>

      {/* Profile Header */}
      <div className="px-4 pt-6 pb-4">
        <div className="flex items-center justify-between mb-6">
          {/* Avatar Section */}
          <div className="relative">
            <div className="w-[86px] h-[86px] rounded-full overflow-hidden border border-white/10 p-0.5">
              <div className="w-full h-full rounded-full overflow-hidden bg-[#1c1c1e] flex items-center justify-center">
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt="avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-3xl font-medium text-white/40">
                    {profile?.username?.[0]?.toUpperCase()}
                  </span>
                )}
              </div>
            </div>
            <label className="absolute bottom-0 right-0 w-6 h-6 bg-[#0095f6] rounded-full flex items-center justify-center border-2 border-black cursor-pointer hover:scale-110 transition-transform">
              <Plus size={14} className="text-white fill-current" strokeWidth={3} />
              <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
            </label>
            
            {/* Note Bubble (like "Inspo needed...") */}
            <div className="absolute -top-8 -left-2 bg-[#262626] px-3 py-1.5 rounded-2xl text-[11px] font-medium text-white/80 shadow-lg border border-white/5 whitespace-nowrap">
              Inspo needed...
              <div className="absolute -bottom-1 left-4 w-2 h-2 bg-[#262626] rotate-45 border-r border-b border-white/5" />
            </div>
          </div>

          {/* Stats Grid */}
          <div className="flex gap-8 mr-4">
            <div className="flex flex-col items-center">
              <span className="font-bold text-lg leading-tight">{liveStats.published}</span>
              <span className="text-[13px] text-white/80">posts</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="font-bold text-lg leading-tight">{liveStats.followers}</span>
              <span className="text-[13px] text-white/80">followers</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="font-bold text-lg leading-tight">{liveStats.following}</span>
              <span className="text-[13px] text-white/80">following</span>
            </div>
          </div>
        </div>

        {/* User Info & Bio */}
        <div className="space-y-1 mb-6">
          <h1 className="font-bold text-[15px] tracking-tight">@{profile?.username}</h1>
          <div className="text-[14px] leading-snug whitespace-pre-wrap">
            {profile?.bio || "No bio set. A panda of few words."}
          </div>
          
          {/* External Handle / Link */}
          <div className="flex items-center gap-2 pt-2">
            <div className="bg-[#1c1c1e] px-3 py-1.5 rounded-full flex items-center gap-1.5 cursor-pointer hover:bg-[#262626] transition-colors">
              <AtSign size={14} className="text-white/60" />
              <span className="text-[13px] font-medium">{profile?.username}_yadav</span>
            </div>
            <button className="bg-[#1c1c1e] px-3 py-1.5 rounded-full flex items-center gap-1.5 cursor-pointer hover:bg-[#262626] transition-colors">
              <Plus size={14} className="text-white/60" />
              <span className="text-[13px] font-medium">Add</span>
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 mb-8">
          <button 
            onClick={() => setEditing(true)}
            className="flex-1 bg-[#262626] hover:bg-[#363636] text-white font-bold text-[14px] py-2 px-4 rounded-lg transition-colors"
          >
            Edit profile
          </button>
          <button className="flex-1 bg-[#262626] hover:bg-[#363636] text-white font-bold text-[14px] py-2 px-4 rounded-lg transition-colors">
            Share profile
          </button>
          <button className="bg-[#262626] hover:bg-[#363636] text-white p-2 rounded-lg transition-colors">
            <UserPlus size={18} />
          </button>
        </div>
      </div>

      {/* Tabs / Content Section */}
      <div className="border-t border-white/10">
        <div className="flex">
          {["Posts", "Apps", "Reviews"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-3 text-sm font-bold transition-colors relative ${
                activeTab === tab ? "text-white" : "text-white/40"
              }`}
            >
              {tab}
              {activeTab === tab && (
                <motion.div layoutId="tab-underline" className="absolute bottom-0 inset-x-0 h-[1.5px] bg-white" />
              )}
            </button>
          ))}
        </div>

        <div className="p-4 grid grid-cols-3 gap-[2px]">
          {activeTab === "Posts" && (
            <div className="col-span-3 py-20 text-center text-white/40 space-y-2">
              <div className="w-16 h-16 rounded-full border-2 border-white/20 flex items-center justify-center mx-auto mb-4">
                <Camera size={32} />
              </div>
              <p className="font-bold text-lg text-white">No Posts Yet</p>
            </div>
          )}

          {activeTab === "Apps" && (
            myApps.length === 0 ? (
              <div className="col-span-3 py-20 text-center text-white/40">
                <p>No apps published yet.</p>
              </div>
            ) : (
              myApps.map((app) => (
                <div key={app.id} className="aspect-square bg-[#1c1c1e] relative group cursor-pointer" onClick={() => router.push(`/apps/${app.id}`)}>
                  <div className="absolute inset-0 flex items-center justify-center text-2xl font-black text-white/20">
                    {app.name[0].toUpperCase()}
                  </div>
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                    <span className="flex items-center gap-1 text-[13px] font-bold"><Download size={14} /> 0</span>
                    <span className="flex items-center gap-1 text-[13px] font-bold"><Star size={14} /> 0</span>
                  </div>
                </div>
              ))
            )
          )}
        </div>
      </div>

      {/* Edit Profile Modal */}
      <AnimatePresence>
        {editing && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black flex flex-col"
          >
            <nav className="flex items-center justify-between px-4 py-3 border-b border-white/10">
              <button onClick={() => setEditing(false)} className="text-[16px]">Cancel</button>
              <span className="font-bold text-[16px]">Edit profile</span>
              <button 
                onClick={handleSave} 
                disabled={saving}
                className="text-[16px] font-bold text-[#0095f6] disabled:opacity-50"
              >
                {saving ? "Saving..." : "Done"}
              </button>
            </nav>

            <div className="p-6 flex flex-col items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-[#1c1c1e] flex items-center justify-center overflow-hidden">
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt="avatar" className="w-full h-full object-cover" />
                ) : (
                  <User size={40} className="text-white/20" />
                )}
              </div>
              <label className="text-[#0095f6] text-[14px] font-bold cursor-pointer">
                Edit picture or avatar
                <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
              </label>

              <div className="w-full space-y-6 mt-4">
                <div className="flex flex-col gap-1 border-b border-white/10 pb-2">
                  <label className="text-[12px] text-white/40">Name</label>
                  <input 
                    value={formData.full_name} 
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    className="bg-transparent border-none focus:ring-0 p-0 text-[16px]"
                    placeholder="Name"
                  />
                </div>
                <div className="flex flex-col gap-1 border-b border-white/10 pb-2">
                  <label className="text-[12px] text-white/40">Username</label>
                  <input 
                    value={profile?.username} 
                    disabled
                    className="bg-transparent border-none focus:ring-0 p-0 text-[16px] opacity-50"
                    placeholder="Username"
                  />
                </div>
                <div className="flex flex-col gap-1 border-b border-white/10 pb-2">
                  <label className="text-[12px] text-white/40">Bio</label>
                  <textarea 
                    value={formData.bio} 
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    className="bg-transparent border-none focus:ring-0 p-0 text-[16px] resize-none"
                    placeholder="Bio"
                    rows={2}
                  />
                </div>
              </div>

              <div className="w-full mt-10">
                <button 
                  onClick={handleLogout}
                  className="w-full py-3 text-red-500 font-medium border-t border-b border-white/10"
                >
                  Log Out
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}