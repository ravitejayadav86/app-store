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
  Book,
  Heart,
  Layout,
  Globe,
  Loader2,
  Lock,
  Plus,
  Menu,
  AtSign,
  ChevronDown,
  Shield,
  Download,
  Star,
  Camera,
  Grid as GridIcon
} from "lucide-react";
import api from "@/lib/api";
import { toast } from "sonner";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

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
  const [activeTab, setActiveTab] = useState<string>("Posts");

  useEffect(() => {
    const fetchProfile = async () => {
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
    fetchProfile();
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  if (!profile) return null;

  const canSeeContent = !profile.is_private || following || isMe;

  return (
    <div className="min-h-screen bg-surface sm:bg-black sm:text-white pb-24 sm:pb-0">
      
      {/* 📱 MOBILE UI (Instagram Reference - White Theme) */}
      <div className="sm:hidden flex flex-col min-h-screen bg-white text-black">
        {/* Mobile Header */}
        <header className="sticky top-0 z-50 bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => router.back()} className="p-1">
              <ChevronLeft size={26} />
            </button>
            <h1 className="font-bold text-lg flex items-center gap-1">
              {profile.username} <ChevronDown size={14} className="opacity-50" />
            </h1>
          </div>
          <div className="flex items-center gap-5">
            <button className="p-1"><AtSign size={22} /></button>
            <button className="p-1"><Menu size={24} /></button>
          </div>
        </header>

        {/* Profile Info */}
        <div className="px-4 pt-4 pb-6 space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div className="relative">
              <div className="w-20 h-20 rounded-full border border-gray-100 p-0.5 overflow-hidden bg-gray-50 flex items-center justify-center">
                {profile.avatar_url ? (
                  <img src={profile.avatar_url} className="w-full h-full rounded-full object-cover" />
                ) : (
                  <span className="text-gray-300 font-bold text-2xl">
                    {profile.username[0].toUpperCase()}
                  </span>
                )}
              </div>
            </div>
            
            <div className="flex-1 flex justify-around text-center">
              <div className="flex flex-col items-center">
                <p className="font-bold text-sm">{profile.apps.length}</p>
                <p className="text-[11px] text-gray-500 font-medium">Posts</p>
              </div>
              <div className="flex flex-col items-center">
                <p className="font-bold text-sm">{profile.followers_count}</p>
                <p className="text-[11px] text-gray-500 font-medium">Followers</p>
              </div>
              <div className="flex flex-col items-center">
                <p className="font-bold text-sm">{profile.following_count}</p>
                <p className="text-[11px] text-gray-500 font-medium">Following</p>
              </div>
            </div>
          </div>

          <div className="space-y-0.5">
            <p className="font-bold text-sm">{profile.username}</p>
            <div className="flex items-center gap-1.5">
               <span className="text-xs text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full border border-gray-100">Professional</span>
               {profile.is_admin && <span className="text-[10px] font-black uppercase text-primary tracking-wider">Staff</span>}
            </div>
            <p className="text-sm text-gray-800 leading-tight pt-1">
              {profile.bio || "This panda explores innovations in silence."}
            </p>
          </div>

          <div className="flex gap-2">
            {isMe ? (
              <button 
                onClick={() => router.push("/profile")}
                className="flex-1 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-bold transition-colors"
              >
                Edit profile
              </button>
            ) : (
              <>
                <button 
                  onClick={handleFollow}
                  className={`flex-1 py-1.5 rounded-lg text-sm font-bold transition-colors ${
                    following 
                      ? "bg-gray-100 text-black" 
                      : "bg-primary text-white"
                  }`}
                >
                  {following ? "Following" : "Follow"}
                </button>
                <button 
                  onClick={() => router.push(`/messages/${profile.username}`)}
                  className="flex-1 py-1.5 bg-gray-100 text-black rounded-lg text-sm font-bold transition-colors"
                >
                  Message
                </button>
              </>
            )}
            <button className="px-2 py-1.5 bg-gray-100 rounded-lg transition-colors">
              <UserPlus size={18} />
            </button>
          </div>
        </div>

        {/* Mobile Tabs */}
        <div className="flex border-t border-gray-100">
          <button 
            onClick={() => setActiveTab("Posts")}
            className={`flex-1 flex justify-center py-3 border-b-2 transition-colors ${activeTab === "Posts" ? "border-black text-black" : "border-transparent text-gray-300"}`}
          >
            <GridIcon size={22} />
          </button>
          <button 
            onClick={() => setActiveTab("Apps")}
            className={`flex-1 flex justify-center py-3 border-b-2 transition-colors ${activeTab === "Apps" ? "border-black text-black" : "border-transparent text-gray-300"}`}
          >
            <Package size={22} />
          </button>
          <button 
            onClick={() => setActiveTab("Activity")}
            className={`flex-1 flex justify-center py-3 border-b-2 transition-colors ${activeTab === "Activity" ? "border-black text-black" : "border-transparent text-gray-300"}`}
          >
            <AtSign size={22} />
          </button>
        </div>

        {/* Content Section */}
        <div className="bg-white min-h-[300px]">
          {!canSeeContent ? (
            <div className="py-20 flex flex-col items-center justify-center text-center gap-4 px-10">
              <div className="w-16 h-16 rounded-full border border-gray-200 flex items-center justify-center text-gray-400">
                <Lock size={28} />
              </div>
              <div>
                <p className="font-bold text-sm">This account is private</p>
                <p className="text-gray-400 text-xs mt-1">Follow this account to see their posts and apps.</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-0.5 pb-20">
              {activeTab === "Posts" && (
                profile.posts.length > 0 ? profile.posts.map((post) => (
                  <div key={post.id} className="aspect-square bg-gray-50 relative overflow-hidden flex items-center justify-center p-2 text-[10px] text-gray-400 text-center">
                    {post.content}
                  </div>
                )) : (
                  <div className="col-span-3 py-20 text-center text-gray-400 text-sm font-medium">No posts yet</div>
                )
              )}
              {activeTab === "Apps" && (
                profile.apps.length > 0 ? profile.apps.map((app) => (
                  <div key={app.id} className="aspect-square bg-gray-50 relative group cursor-pointer" onClick={() => router.push(`/apps/${app.id}`)}>
                    {app.icon_url ? (
                      <img src={app.icon_url} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-200 font-black text-2xl">
                        {app.name[0]}
                      </div>
                    )}
                  </div>
                )) : (
                  <div className="col-span-3 py-20 text-center text-gray-400 text-sm font-medium">No apps yet</div>
                )
              )}
              {activeTab === "Activity" && (
                <div className="col-span-3 divide-y divide-gray-50">
                  {profile.posts.map(post => (
                    <div key={post.id} className="p-4 space-y-2">
                       <div className="flex items-center gap-2">
                         <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-[10px]">{profile.username[0]}</div>
                         <span className="text-xs font-bold">{profile.username}</span>
                       </div>
                       <p className="text-xs text-gray-600 leading-relaxed">{post.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 🖥️ DESKTOP UI (Glass Dark Theme) */}
      <div className="hidden sm:block">
        <nav className="flex items-center justify-between px-8 py-4 sticky top-0 bg-black/80 backdrop-blur-md z-50 border-b border-white/5">
          <button onClick={() => router.back()} className="hover:opacity-60 transition-opacity">
            <ChevronLeft size={28} />
          </button>
          <div className="flex items-center gap-1">
            <span className="font-bold text-xl tracking-tight">{profile.username}</span>
            {profile.is_private && <Lock size={14} className="ml-2 text-white/40" />}
          </div>
          <button className="hover:opacity-60 transition-opacity"><Menu size={28} /></button>
        </nav>

        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="flex flex-col md:flex-row gap-12 items-center md:items-start mb-16">
            <div className="w-40 h-40 rounded-full border-2 border-white/10 p-1 shrink-0">
              <div className="w-full h-full rounded-full bg-white/5 flex items-center justify-center text-5xl font-bold text-white/20 overflow-hidden">
                {profile.avatar_url ? <img src={profile.avatar_url} className="w-full h-full object-cover" /> : profile.username[0].toUpperCase()}
              </div>
            </div>
            
            <div className="flex-1 space-y-8">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
                <h1 className="text-2xl font-light">{profile.username}</h1>
                <div className="flex gap-2">
                  {isMe ? (
                    <Button onClick={() => router.push("/profile")} variant="secondary" size="sm">Edit profile</Button>
                  ) : (
                    <>
                      <Button onClick={handleFollow} variant={following ? "secondary" : "primary"} size="sm">
                        {following ? "Following" : "Follow"}
                      </Button>
                      <Button onClick={() => router.push(`/messages/${profile.username}`)} variant="secondary" size="sm">Message</Button>
                    </>
                  )}
                  <button className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"><UserPlus size={20} /></button>
                </div>
              </div>

              <div className="flex gap-10">
                <div className="flex gap-1.5 items-baseline">
                  <span className="font-bold text-lg">{profile.apps.length}</span>
                  <span className="text-white/60">posts</span>
                </div>
                <div className="flex gap-1.5 items-baseline">
                  <span className="font-bold text-lg">{profile.followers_count}</span>
                  <span className="text-white/60">followers</span>
                </div>
                <div className="flex gap-1.5 items-baseline">
                  <span className="font-bold text-lg">{profile.following_count}</span>
                  <span className="text-white/60">following</span>
                </div>
              </div>

              <div className="space-y-1">
                <p className="font-bold">{profile.username}</p>
                <p className="text-white/80 leading-relaxed max-w-lg">{profile.bio || "No bio available."}</p>
              </div>
            </div>
          </div>

          <div className="border-t border-white/10">
            <div className="flex justify-center gap-16 -mt-px">
              {["Posts", "Apps", "Activity"].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex items-center gap-2 py-4 text-xs font-bold uppercase tracking-widest border-t transition-colors ${
                    activeTab === tab ? "border-white text-white" : "border-transparent text-white/40"
                  }`}
                >
                  {tab === "Posts" && <GridIcon size={14} />}
                  {tab === "Apps" && <Package size={14} />}
                  {tab === "Activity" && <AtSign size={14} />}
                  {tab}
                </button>
              ))}
            </div>

            <div className="pt-8">
              {!canSeeContent ? (
                <div className="py-20 text-center space-y-4">
                  <Lock size={48} className="mx-auto opacity-20" />
                  <p className="text-xl font-light">This Account is Private</p>
                  <p className="text-white/40">Follow to see their content.</p>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-8">
                  {activeTab === "Apps" && profile.apps.map(app => (
                    <Link href={`/apps/${app.id}`} key={app.id} className="aspect-square bg-white/5 rounded-2xl overflow-hidden group relative">
                       {app.icon_url ? (
                         <img src={app.icon_url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                       ) : (
                         <div className="w-full h-full flex items-center justify-center text-4xl font-black text-white/10 group-hover:text-white/20 transition-colors">
                           {app.name[0]}
                         </div>
                       )}
                       <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                         <span className="flex items-center gap-1 font-bold"><Download size={16} /> {app.downloads_count || 0}</span>
                         <span className="flex items-center gap-1 font-bold"><Star size={16} /> {app.rating || 0}</span>
                       </div>
                    </Link>
                  ))}
                  {/* ... other desktop tabs ... */}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

}
