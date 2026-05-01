"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { 
  User, Users, Mail, Calendar, Edit3, Package, 
  Download, Star, Shield, Camera, ExternalLink, 
  GitFork, Code, Sparkles, Menu, ChevronDown,
  Grid as GridIcon, Bookmark, UserSquare2, AtSign, UserPlus, UserMinus, ChevronRight,
  MapPin, ChevronLeft, Smartphone, Check, HelpCircle, MessageCircle, Settings, 
  Share2, ShieldCheck, Heart, Search, Bell, Zap, FileText, X
} from "lucide-react";
import api from "@/lib/api";
import { toast } from "sonner";
import Image from "next/image";
import Link from "next/link";

interface UserProfile {
  id: number;
  username: string;
  email?: string;
  full_name?: string;
  bio?: string;
  avatar_url?: string;
  is_publisher: boolean;
  is_admin: boolean;
  created_at: string;
  followers_count: number;
  following_count: number;
  apps_count: number;
  is_following?: boolean;
  apps?: any[];
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://pandas-store-api.onrender.com";

export default function UserProfileClient({ username: propUsername }: { username?: string }) {
  const params = useParams();
  const username = propUsername || params.username as string;
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const [isMe, setIsMe] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [isPfpZoomed, setIsPfpZoomed] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const [profileRes, meRes] = await Promise.all([
          api.get(`/social/profile/${username}`),
          api.get("/users/me").catch(() => ({ data: null }))
        ]);
        setUser(profileRes.data);
        if (meRes.data && meRes.data.username === username) {
          setIsMe(true);
        }
      } catch (err: any) {
        const status = err?.response?.status;
        if (status === 404) {
          setError("User not found");
        } else if (status === 401) {
          setError("Sign in to view this profile");
        } else {
          setError("Could not load profile. Please try again.");
        }
        console.error("Profile fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    if (username) fetchProfile();
  }, [username, router]);

  const handleFollow = async () => {
    if (!user) return;
    setFollowLoading(true);
    try {
      const res = await api.post(`/social/follow/${user.username}`);
      const { following } = res.data;
      
      setUser({ 
        ...user, 
        is_following: following, 
        followers_count: following ? user.followers_count + 1 : user.followers_count - 1 
      });
      
      toast.success(following ? `Following @${user.username}` : `Unfollowed @${user.username}`);
    } catch (err: any) {
      if (err.response?.status === 401) {
        toast.error("Please login to follow users");
        router.push("/login");
      } else {
        toast.error("Failed to update follow status");
      }
    } finally {
      setFollowLoading(false);
    }
  };

  const resolveMediaUrl = (url: string | null | undefined) => {
    if (!url) return "";
    if (url.startsWith("http") || url.startsWith("blob:") || url.startsWith("data:")) return url;
    return `${API_BASE}${url}`;
  };

  if (loading) return (
    <div className="min-h-screen bg-surface flex flex-col">
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

  if (error || !user) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 bg-surface text-center px-4">
      <div className="w-24 h-24 rounded-3xl bg-surface-low border border-outline-variant/30 flex items-center justify-center shadow-inner">
        <User size={40} className="text-on-surface-variant/30" />
      </div>
      <div>
        <h2 className="text-2xl font-bold text-on-surface mb-2">{error || "User not found"}</h2>
        <p className="text-sm text-on-surface-variant">The profile @{username} could not be loaded.</p>
      </div>
      <button onClick={() => router.back()}
        className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-primary text-on-primary font-bold shadow-lg shadow-primary/20 active:scale-95 transition-all">
        Go Back
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-surface pb-24 sm:pb-0">
      
      {/* 📱 MOBILE UI (Instagram Reference) */}
      <div className="sm:hidden flex flex-col min-h-screen bg-transparent">
        <header className="sticky top-0 z-50 bg-surface/80 backdrop-blur-xl border-b border-outline-variant px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
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
              {user.username} <ChevronDown size={14} />
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <button aria-label="Share Profile" className="text-on-surface"><Share2 size={24} /></button>
            <button aria-label="Open Menu" className="text-on-surface"><Menu size={24} /></button>
          </div>
        </header>

        <div className="px-4 pt-4 flex items-center gap-6">
          <div className="relative">
            <motion.div 
              layoutId="user-profile-image"
              onClick={() => setIsPfpZoomed(true)}
              className="w-20 h-20 rounded-full border-2 border-primary p-0.5 cursor-pointer active:scale-90 transition-transform"
            >
              <div className="relative w-full h-full rounded-full bg-surface-low flex items-center justify-center text-primary font-black text-2xl overflow-hidden border border-surface">
                {user.avatar_url ? (
                  <Image 
                    src={resolveMediaUrl(user.avatar_url)} 
                    alt="Avatar"
                    fill
                    priority
                    className="object-cover"
                    sizes="80px"
                  />
                ) : user.username[0].toUpperCase()}
              </div>
            </motion.div>
          </div>
          <div className="flex-1 flex justify-around">
            <div className="text-center">
              <p className="font-black text-sm">{user.apps_count}</p>
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Apps</p>
            </div>
            <div className="text-center" onClick={() => router.push(`/users/${user.username}/followers`)}>
              <p className="font-black text-sm">{user.followers_count}</p>
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Followers</p>
            </div>
            <div className="text-center" onClick={() => router.push(`/users/${user.username}/following`)}>
              <p className="font-black text-sm">{user.following_count}</p>
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Following</p>
            </div>
          </div>
        </div>

        <div className="px-4 mt-3 space-y-0.5">
          <p className="font-bold text-sm">{user.full_name || user.username}</p>
          <p className="text-xs text-on-surface-variant">{user.is_publisher ? "Verified Publisher" : "Developer"}</p>
          <p className="text-sm text-on-surface leading-tight">
            {user.bio || "A panda of few words, but infinite innovations."}
          </p>
          {user.is_publisher && (
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-100 mt-2">
              <Shield size={10} />
              <span className="text-[10px] font-bold uppercase tracking-wider">Verified Publisher</span>
            </div>
          )}
        </div>

        <div className="px-4 mt-4 grid grid-cols-2 gap-2">
          {isMe ? (
            <button onClick={() => router.push("/profile")} className="py-2 bg-primary text-on-primary font-bold rounded-xl text-sm shadow-lg shadow-primary/20">Edit Profile</button>
          ) : (
            <button 
              onClick={handleFollow} 
              disabled={followLoading}
              className={`py-2 font-bold rounded-xl text-sm transition-all ${user.is_following ? "bg-surface-low text-on-surface border border-outline-variant" : "bg-primary text-on-primary shadow-lg shadow-primary/20"}`}
            >
              {user.is_following ? "Following" : "Follow"}
            </button>
          )}
          <button 
            onClick={() => router.push(`/messages/${user.username}`)}
            className="py-2 bg-surface-low text-on-surface font-bold rounded-xl text-sm hover:bg-surface-lowest transition-colors"
          >
            Message
          </button>
        </div>

        <div className="mt-6 flex border-b border-outline-variant">
          <button aria-label="Grid View" onClick={() => setActiveTab(null)} className={`flex-1 py-3 flex justify-center border-b-2 ${!activeTab ? "border-primary text-primary" : "border-transparent text-on-surface-variant"}`}><GridIcon size={20} /></button>
          <button aria-label="Activity" onClick={() => setActiveTab("activity")} className={`flex-1 py-3 flex justify-center border-b-2 ${activeTab === "activity" ? "border-primary text-primary" : "border-transparent text-on-surface-variant"}`}><Zap size={20} /></button>
          <button aria-label="Tagged Posts" onClick={() => setActiveTab("tags")} className={`flex-1 py-3 flex justify-center border-b-2 ${activeTab === "tags" ? "border-primary text-primary" : "border-transparent text-on-surface-variant"}`}><UserSquare2 size={20} /></button>
        </div>

        <div className="flex-1 bg-transparent">
          <div className="grid grid-cols-3 gap-0.5">
            {!activeTab && user.apps?.map((app, i) => (
              <div key={app.id} onClick={() => router.push(`/apps/${app.id}`)} className="aspect-square bg-surface-low relative group overflow-hidden">
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
            {activeTab === "activity" && (
              <div className="col-span-3 py-20 text-center opacity-40">
                <Zap size={40} className="mx-auto mb-2" />
                <p className="text-sm font-medium">No recent activity</p>
              </div>
            )}
          </div>
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
            <GlassCard className="p-10 border-outline-variant/30 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-12 opacity-[0.03] rotate-12 pointer-events-none">
                <User size={300} className="text-primary" />
              </div>
              
              <div className="relative flex flex-col md:flex-row items-center gap-12">
                <div className="relative group">
                  <motion.div 
                    layoutId="user-profile-image-desktop"
                    onClick={() => setIsPfpZoomed(true)}
                    className="relative w-48 h-48 rounded-[2.5rem] bg-linear-to-br from-primary to-primary-container p-1 shadow-2xl shadow-primary/20 transition-transform hover:scale-105 overflow-hidden cursor-pointer active:scale-95"
                  >
                    <div className="relative w-full h-full rounded-[2.3rem] bg-surface flex items-center justify-center text-primary font-black text-6xl overflow-hidden border-4 border-surface shadow-inner">
                      {user.avatar_url ? (
                        <Image 
                          src={resolveMediaUrl(user.avatar_url)} 
                          alt="Profile"
                          fill
                          priority
                          className="object-cover"
                          sizes="192px"
                        />
                      ) : user.username[0].toUpperCase()}
                    </div>
                  </motion.div>
                </div>

                <div className="flex-1 space-y-6 text-center md:text-left">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center justify-center md:justify-start gap-3">
                        <h1 className="text-4xl font-black text-on-surface tracking-tight">@{user.username}</h1>
                        {user.is_publisher && <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-primary/20">Verified Publisher</span>}
                      </div>
                      <p className="text-on-surface-variant font-medium flex items-center justify-center md:justify-start gap-2"><AtSign size={14} /> {user.full_name || "Innovator"}</p>
                    </div>
                    <div className="flex gap-2">
                      {isMe ? (
                        <Button size="sm" onClick={() => router.push("/profile")}><Edit3 size={16} className="mr-2" /> Edit Profile</Button>
                      ) : (
                        <>
                          <Button 
                            variant={user.is_following ? "secondary" : "primary"}
                            onClick={handleFollow}
                            disabled={followLoading}
                            className="rounded-xl px-8"
                          >
                            {user.is_following ? <><UserMinus size={16} className="mr-2" /> Unfollow</> : <><UserPlus size={16} className="mr-2" /> Follow</>}
                          </Button>
                          <Button 
                            variant="secondary" 
                            onClick={() => router.push(`/messages/${user.username}`)}
                            className="p-2.5 rounded-xl"
                          >
                            <MessageCircle size={20} />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <span className="flex items-center gap-1.5 text-xs font-bold text-on-surface-variant bg-surface-low px-3 py-1.5 rounded-full border border-outline-variant/30"><Calendar size={14} /> Joined {new Date(user.created_at).toLocaleDateString()}</span>
                    {user.is_publisher && <span className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-primary bg-primary/10 px-3 py-1.5 rounded-full border border-primary/20">Publisher</span>}
                  </div>

                  <p className="text-on-surface/70 font-medium italic">{user.bio || "A panda of few words..."}</p>
                </div>
              </div>
            </GlassCard>
          </motion.div>

          <div className="grid grid-cols-4 gap-4">
            {[
              { label: "Followers", value: user.followers_count, icon: User, href: `/users/${user.username}/followers` },
              { label: "Following", value: user.following_count, icon: Users, href: `/users/${user.username}/following` },
              { label: "Apps Published", value: user.apps_count, icon: Package, href: "#" },
              { label: "Activity", value: "Live", icon: Zap, href: "#" },
            ].map((stat, i) => (
              <GlassCard key={i} className="p-4 text-center hover:bg-surface-lowest transition-all cursor-pointer" onClick={() => stat.href !== "#" && router.push(stat.href)}>
                <div className="w-10 h-10 rounded-2xl mx-auto mb-2 bg-primary/10 text-primary flex items-center justify-center"><stat.icon size={20} /></div>
                <p className="text-2xl font-black text-on-surface">{stat.value}</p>
                <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant/60">{stat.label}</p>
              </GlassCard>
            ))}
          </div>

          <div className="mt-12 space-y-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <GlassCard className="p-8 border-white/60">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xs font-black uppercase tracking-[0.2em] text-primary">About @{user.username}</h2>
                  <HelpCircle size={16} className="text-primary/40" />
                </div>
                <div className="space-y-4">
                   <p className="text-sm text-on-surface-variant leading-relaxed">
                     {user.bio || "No detailed biography provided. This user is focused on building amazing experiences for the community."}
                   </p>
                   <div className="pt-4 flex gap-3">
                      <div className="flex items-center gap-2 p-2 px-3 bg-surface-low rounded-xl border border-outline-variant/30 text-xs font-bold">
                        <MapPin size={14} className="text-primary" /> Global
                      </div>
                      <div className="flex items-center gap-2 p-2 px-3 bg-surface-low rounded-xl border border-outline-variant/30 text-xs font-bold">
                        <LinkIcon size={14} className="text-primary" /> {user.username}.dev
                      </div>
                   </div>
                </div>
              </GlassCard>

              <GlassCard className="p-8 border-white/60 flex flex-col justify-between">
                <div>
                  <h2 className="text-xs font-black uppercase tracking-[0.2em] text-primary mb-6">Connect & Share</h2>
                  <div className="flex items-center gap-4 p-4 bg-surface-low text-on-surface rounded-3xl border border-outline-variant/30">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                      <Share2 size={20} />
                    </div>
                    <div className="flex-1">
                      <p className="text-[10px] font-black uppercase tracking-widest opacity-50">Profile Link</p>
                      <p className="text-sm font-bold truncate">pandas.store/users/{user.username}</p>
                    </div>
                    <button onClick={() => { navigator.clipboard.writeText(window.location.href); toast.success("Link copied!"); }} className="p-2 hover:bg-surface rounded-lg transition-colors">
                      <Bookmark size={20} className="text-primary" />
                    </button>
                  </div>
                </div>
                <div className="mt-8">
                  <button 
                    onClick={() => router.push(`/messages/${user.username}`)}
                    className="w-full py-4 rounded-2xl bg-primary text-on-primary text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
                  >
                    Send Direct Message
                  </button>
                </div>
              </GlassCard>
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-black text-on-surface">Published Apps</h2>
                <button className="text-xs font-black uppercase tracking-widest text-primary flex items-center gap-2 hover:translate-x-1 transition-transform">View All <ChevronRight size={14} /></button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {user.apps?.slice(0, 6).map((app) => (
                  <GlassCard key={app.id} className="p-4 hover:shadow-xl transition-all cursor-pointer group" onClick={() => router.push(`/apps/${app.id}`)}>
                    <div className="flex gap-4">
                      <div className="relative w-16 h-16 rounded-2xl bg-surface-low overflow-hidden border border-outline-variant group-hover:scale-105 transition-transform">
                        <Image 
                          src={app.icon_url || "/app-placeholder.png"} 
                          alt={app.name}
                          fill
                          className="object-cover" 
                          sizes="64px"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-on-surface truncate">{app.name}</h3>
                        <p className="text-xs text-on-surface-variant">{app.category}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-[10px] font-black bg-primary/10 text-primary px-2 py-0.5 rounded-md">{app.price === 0 ? "FREE" : `$${app.price}`}</span>
                          <span className="flex items-center gap-1 text-[10px] font-bold text-on-surface-variant"><Star size={10} fill="currentColor" /> {app.rating || "0"}</span>
                        </div>
                      </div>
                    </div>
                  </GlassCard>
                ))}
                {(!user.apps || user.apps.length === 0) && (
                  <div className="col-span-full py-12 text-center bg-gray-50/50 rounded-[2rem] border border-dashed border-gray-200">
                    <Package size={40} className="mx-auto mb-2 text-gray-300" />
                    <p className="text-gray-400 font-bold">No apps published yet.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Picture Zoom Overlay */}
      <AnimatePresence>
        {isPfpZoomed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center bg-surface/95 backdrop-blur-3xl"
            onDoubleClick={() => setIsPfpZoomed(false)}
          >
            <motion.div
              layoutId={typeof window !== "undefined" && window.innerWidth < 640 ? "user-profile-image" : "user-profile-image-desktop"}
              className="relative w-[85vw] aspect-square max-w-[450px] rounded-[3.5rem] overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.4)] border-8 border-surface cursor-pointer"
              transition={{ type: "spring", damping: 30, stiffness: 300, mass: 0.8 }}
            >
              {user.avatar_url ? (
                <Image 
                  src={resolveMediaUrl(user.avatar_url)} 
                  alt="Zoomed Profile"
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 85vw, 450px"
                />
              ) : (
                <div className="w-full h-full bg-primary flex items-center justify-center text-white text-8xl font-black">
                  {user.username[0].toUpperCase()}
                </div>
              )}
            </motion.div>
            <button 
              onClick={() => setIsPfpZoomed(false)}
              className="absolute top-10 right-10 p-4 rounded-full bg-surface-low text-on-surface hover:bg-surface-lowest transition-colors shadow-lg border border-outline-variant"
            >
              <X size={24} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Helper icon needed for the sidebar
const LinkIcon = ({ size, className }: { size: number, className?: string }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
  </svg>
);
