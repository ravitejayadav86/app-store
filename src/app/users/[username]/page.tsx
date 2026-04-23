"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Users, 
  Package, 
  MessageSquare, 
  ChevronLeft,
  UserPlus,
  UserCheck,
  Music,
  Star,
  Shield,
  Download,
  Camera,
  Menu,
  ChevronDown,
  Grid as GridIcon,
  Bookmark,
  UserSquare2,
  AtSign,
  Plus,
  Mail,
  Lock,
  Search
} from "lucide-react";
import api from "@/lib/api";
import { toast } from "sonner";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui/GlassCard";

interface Profile {
  id: number;
  username: string;
  avatar_url: string | null;
  bio: string;
  is_private: boolean;
  is_admin: boolean;
  created_at: string;
  followers_count: number;
  following_count: number;
  is_following: boolean;
  apps: any[];
  posts: any[];
}

export default function UserProfile() {
  const { username } = useParams();
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [following, setFollowing] = useState(false);
  const [isMe, setIsMe] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("Apps");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const res = await api.get(`/social/profile/${username}`);
        setProfile(res.data);
        setFollowing(res.data.is_following);
        
        try {
          const meRes = await api.get("/users/me");
          if (meRes.data.username === username) {
            setIsMe(true);
          }
        } catch {}
      } catch (error: any) {
        if (error.response?.status === 404) {
          toast.error("User not found");
          router.push("/community");
        } else {
          toast.error("Failed to load profile");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchProfileData();
  }, [username, router]);

  const handleFollow = async () => {
    try {
      const res = await api.post(`/social/follow/${username}`);
      setFollowing(res.data.following);
      setProfile(prev => prev ? {
        ...prev,
        followers_count: res.data.following ? prev.followers_count + 1 : prev.followers_count - 1
      } : null);
      toast.success(res.data.following ? `Following ${username}` : `Unfollowed ${username}`);
    } catch {
      toast.error("Please sign in to follow users");
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-surface">
      <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!profile) return null;

  const canSeeContent = !profile.is_private || following || isMe;

  return (
    <div className="min-h-screen bg-surface pb-24 sm:pb-0">
      
      {/* 📱 MOBILE UI (Instagram Reference - White Theme) */}
      <div className="sm:hidden flex flex-col min-h-screen bg-white">
        {/* Mobile Header */}
        <header className="sticky top-0 z-50 bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button onClick={() => router.back()} className="p-1">
              <ChevronLeft size={24} />
            </button>
            <h1 className="font-bold text-lg flex items-center gap-1">
              {profile.username} <ChevronDown size={14} />
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
              <div className="w-20 h-20 rounded-full border-2 border-gray-100 p-0.5 overflow-hidden shadow-sm">
                {profile.avatar_url ? (
                  <img src={profile.avatar_url} className="w-full h-full rounded-full object-cover" />
                ) : (
                  <div className="w-full h-full rounded-full bg-gray-50 flex items-center justify-center text-gray-400 font-bold text-2xl">
                    {profile.username[0].toUpperCase()}
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex-1 flex justify-around text-center">
              <Link href={`/users/${username}/followers`} className="flex flex-col items-center">
                <p className="font-bold text-sm">{profile.followers_count}</p>
                <p className="text-[10px] text-gray-400 font-medium">Followers</p>
              </Link>
              <Link href={`/users/${username}/following`} className="flex flex-col items-center">
                <p className="font-bold text-sm">{profile.following_count}</p>
                <p className="text-[10px] text-gray-400 font-medium">Following</p>
              </Link>
              <div className="flex flex-col items-center">
                <p className="font-bold text-sm">{profile.apps?.length || 0}</p>
                <p className="text-[10px] text-gray-400 font-medium">Published</p>
              </div>
            </div>
          </div>

          <div className="space-y-0.5">
            <p className="font-bold text-sm">{profile.username}</p>
            <p className="text-xs text-gray-400">{profile.is_admin ? "Panda Staff" : "Panda Creator"}</p>
            <p className="text-sm text-gray-800 leading-tight">
              {profile.bio || "A panda of few words, but infinite innovations."}
            </p>
          </div>

          <div className="flex gap-2">
            {isMe ? (
              <button 
                onClick={() => router.push("/profile")}
                className="flex-1 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-bold transition-colors"
              >
                Edit profile
              </button>
            ) : (
              <>
                <button 
                  onClick={handleFollow}
                  className={`flex-1 py-2 rounded-lg text-sm font-bold transition-colors ${following ? "bg-gray-100 text-black" : "bg-primary text-white"}`}
                >
                  {following ? "Following" : "Follow"}
                </button>
                <button 
                  onClick={() => router.push(`/messages/${profile.username}`)}
                  className="flex-1 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-bold transition-colors"
                >
                  Message
                </button>
              </>
            )}
            <button className="px-2 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
              <UserSquare2 size={18} />
            </button>
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

        {/* Content Section */}
        <div className="bg-white">
          {!canSeeContent ? (
            <div className="py-20 flex flex-col items-center justify-center text-center gap-4 px-10">
              <div className="w-16 h-16 rounded-full border border-gray-200 flex items-center justify-center text-gray-400">
                <Lock size={28} />
              </div>
              <div>
                <p className="font-bold text-sm">This account is private</p>
                <p className="text-gray-400 text-xs mt-1">Follow this account to see their content.</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-0.5 pb-20">
              {profile.apps && profile.apps.length > 0 ? profile.apps.map((app) => (
                <div key={app.id} className="aspect-square bg-gray-100 relative group cursor-pointer" onClick={() => router.push(`/apps/${app.id}`)}>
                  {app.icon_url ? (
                    <img src={app.icon_url} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300 font-bold text-2xl">
                      {app.name[0]}
                    </div>
                  )}
                </div>
              )) : (
                <div className="col-span-3 py-20 text-center text-gray-400 text-sm font-medium">
                  No apps published yet
                </div>
              )}
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
                    {profile.avatar_url ? (
                      <img src={profile.avatar_url} alt="avatar" className="w-full h-full object-cover" />
                    ) : (
                      profile.username[0].toUpperCase()
                    )}
                  </div>
                </div>

                <div className="flex-1 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h1 className="text-4xl font-black text-on-surface">{profile.username}</h1>
                      <p className="text-primary font-bold">@panda_creator</p>
                    </div>
                    <div className="flex gap-2">
                      {isMe ? (
                        <Button onClick={() => router.push("/profile")}>My Settings</Button>
                      ) : (
                        <>
                          <Button 
                            variant={following ? "secondary" : "primary"}
                            onClick={handleFollow}
                          >
                            {following ? <UserCheck className="mr-2" size={18} /> : <UserPlus className="mr-2" size={18} />}
                            {following ? "Following" : "Follow"}
                          </Button>
                          <Button variant="secondary" onClick={() => router.push(`/messages/${profile.username}`)}><MessageSquare size={18} className="mr-2" /> Message</Button>
                        </>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <span className="flex items-center gap-1.5 text-xs font-bold text-on-surface-variant bg-white/50 px-3 py-1.5 rounded-full border border-white/50">
                      <AtSign size={14} /> Community Member
                    </span>
                    {profile.is_admin && <span className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-red-500 bg-red-50 px-3 py-1.5 rounded-full border border-red-100">Staff</span>}
                  </div>

                  <p className="text-on-surface/70 font-medium italic">{profile.bio || "A panda of few words..."}</p>
                </div>
              </div>
            </GlassCard>
          </motion.div>

          {/* Stats Grid - Desktop */}
          <div className="grid grid-cols-4 gap-4">
            {[
              { label: "Followers", value: profile.followers_count, icon: Users },
              { label: "Following", value: profile.following_count, icon: Users },
              { label: "Published", value: profile.apps?.length || 0, icon: Package },
              { label: "Member Since", value: new Date(profile.created_at).getFullYear(), icon: Star },
            ].map((stat, i) => (
              <GlassCard key={i} className="p-4 text-center hover:bg-white/80 transition-all">
                <div className="w-10 h-10 rounded-2xl mx-auto mb-2 bg-primary/10 text-primary flex items-center justify-center"><stat.icon size={20} /></div>
                <p className="text-2xl font-black">{stat.value}</p>
                <p className="text-[10px] font-black uppercase tracking-widest opacity-60">{stat.label}</p>
              </GlassCard>
            ))}
          </div>

          {/* Apps Section - Desktop */}
          <div className="space-y-6">
            <h2 className="text-xl font-black flex items-center gap-2">
              <Package className="text-primary" /> Published Applications
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {canSeeContent ? (
                profile.apps && profile.apps.length > 0 ? profile.apps.map((app) => (
                  <GlassCard 
                    key={app.id} 
                    className="p-4 flex items-center justify-between group hover:border-primary/30 transition-all cursor-pointer"
                    onClick={() => router.push(`/apps/${app.id}`)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
                        {app.icon_url ? (
                          <img src={app.icon_url} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-gray-50 flex items-center justify-center text-gray-300 font-bold">{app.name[0]}</div>
                        )}
                      </div>
                      <div>
                        <h3 className="font-bold text-on-surface group-hover:text-primary transition-colors">{app.name}</h3>
                        <p className="text-xs text-on-surface-variant font-medium uppercase tracking-wider">{app.category}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right hidden md:block">
                        <div className="flex items-center gap-1 text-xs font-bold text-primary">
                          <Star size={12} fill="currentColor" /> {app.rating?.toFixed(1) || "0.0"}
                        </div>
                        <p className="text-[10px] text-on-surface-variant font-bold">{app.downloads_count} Downloads</p>
                      </div>
                      <ChevronLeft size={20} className="rotate-180 text-gray-300 group-hover:text-primary transition-all group-hover:translate-x-1" />
                    </div>
                  </GlassCard>
                )) : (
                  <div className="col-span-2 py-20 text-center">
                    <p className="text-on-surface-variant font-medium">No apps published yet.</p>
                  </div>
                )
              ) : (
                <div className="col-span-2 py-20 text-center flex flex-col items-center gap-4">
                  <Lock size={40} className="text-gray-300" />
                  <p className="text-on-surface-variant font-medium">This account is private. Follow to see apps.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
