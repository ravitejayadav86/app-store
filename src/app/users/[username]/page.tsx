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
  Camera
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
    <div className="min-h-screen bg-black text-white selection:bg-white/20">
      {/* Top Navigation Bar */}
      <nav className="flex items-center justify-between px-4 py-3 sticky top-0 bg-black/80 backdrop-blur-md z-50 border-b border-white/5">
        <button onClick={() => router.back()} className="hover:opacity-60 transition-opacity">
          <ChevronLeft size={28} />
        </button>
        
        <div className="flex items-center gap-1">
          <span className="font-bold text-[17px] tracking-tight">
            {profile.username}
          </span>
          {profile.is_private && <Lock size={12} className="ml-1 text-white/40" />}
        </div>

        <button className="hover:opacity-60 transition-opacity">
          <Menu size={28} />
        </button>
      </nav>

      {/* Profile Header */}
      <div className="px-4 pt-6 pb-4">
        <div className="flex items-center justify-between mb-6">
          {/* Avatar Section */}
          <div className="w-[86px] h-[86px] rounded-full overflow-hidden border border-white/10 p-0.5">
            <div className="w-full h-full rounded-full overflow-hidden bg-[#1c1c1e] flex items-center justify-center">
              {profile.avatar_url ? (
                <img src={profile.avatar_url} alt="avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="text-3xl font-medium text-white/40">
                  {profile.username[0].toUpperCase()}
                </span>
              )}
            </div>
          </div>

          {/* Stats Grid */}
          <div className="flex gap-8 mr-4">
            <div className="flex flex-col items-center">
              <span className="font-bold text-lg leading-tight">{profile.apps.length}</span>
              <span className="text-[13px] text-white/80">posts</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="font-bold text-lg leading-tight">{profile.followers_count}</span>
              <span className="text-[13px] text-white/80">followers</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="font-bold text-lg leading-tight">{profile.following_count}</span>
              <span className="text-[13px] text-white/80">following</span>
            </div>
          </div>
        </div>

        {/* User Info & Bio */}
        <div className="space-y-1 mb-6">
          <h1 className="font-bold text-[15px] tracking-tight">{profile.username}</h1>
          <div className="text-[14px] leading-snug whitespace-pre-wrap">
            {profile.bio || "No bio yet. This panda explores innovations in silence."}
          </div>
          {profile.is_admin && (
            <div className="flex items-center gap-1.5 pt-1">
              <Shield size={12} className="text-[#0095f6]" />
              <span className="text-[12px] font-bold text-[#0095f6] uppercase tracking-wider">PandaStore Staff</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 mb-8">
          {isMe ? (
            <button 
              onClick={() => router.push("/profile")}
              className="flex-1 bg-[#262626] hover:bg-[#363636] text-white font-bold text-[14px] py-2 px-4 rounded-lg transition-colors"
            >
              Edit profile
            </button>
          ) : (
            <>
              <button 
                onClick={handleFollow}
                className={`flex-1 font-bold text-[14px] py-2 px-4 rounded-lg transition-colors ${
                  following 
                    ? "bg-[#262626] hover:bg-[#363636] text-white" 
                    : "bg-[#0095f6] hover:bg-[#1877f2] text-white"
                }`}
              >
                {following ? "Following" : "Follow"}
              </button>
              <button 
                onClick={() => router.push(`/messages/${profile.username}`)}
                className="flex-1 bg-[#262626] hover:bg-[#363636] text-white font-bold text-[14px] py-2 px-4 rounded-lg transition-colors"
              >
                Message
              </button>
            </>
          )}
          <button className="bg-[#262626] hover:bg-[#363636] text-white p-2 rounded-lg transition-colors">
            <UserPlus size={18} />
          </button>
        </div>
      </div>

      {/* Tabs / Content Section */}
      <div className="border-t border-white/10">
        {!canSeeContent ? (
          <div className="py-20 flex flex-col items-center justify-center text-center gap-4">
            <div className="w-20 h-20 rounded-full border-2 border-white/20 flex items-center justify-center">
              <Lock size={32} />
            </div>
            <p className="font-bold text-lg">This account is private</p>
            <p className="text-white/40 text-sm max-w-[250px]">Follow to see their photos and videos.</p>
          </div>
        ) : (
          <>
            <div className="flex">
              {["Posts", "Apps", "Activity"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-3 text-sm font-bold transition-colors relative ${
                    activeTab === tab ? "text-white" : "text-white/40"
                  }`}
                >
                  {tab}
                  {activeTab === tab && (
                    <motion.div layoutId="public-tab-underline" className="absolute bottom-0 inset-x-0 h-[1.5px] bg-white" />
                  )}
                </button>
              ))}
            </div>

            <div className="p-4 grid grid-cols-3 gap-[2px]">
              {activeTab === "Posts" && (
                profile.posts.length === 0 ? (
                  <div className="col-span-3 py-20 text-center text-white/40 space-y-2">
                    <div className="w-16 h-16 rounded-full border-2 border-white/20 flex items-center justify-center mx-auto mb-4">
                      <Camera size={32} />
                    </div>
                    <p className="font-bold text-lg text-white">No Posts Yet</p>
                  </div>
                ) : (
                  profile.posts.map((post) => (
                    <div key={post.id} className="aspect-square bg-[#1c1c1e] relative group cursor-pointer" onClick={() => setActiveTab("Activity")}>
                      <div className="absolute inset-0 flex items-center justify-center text-xs p-2 text-white/40 line-clamp-3">
                        {post.content}
                      </div>
                    </div>
                  ))
                )
              )}

              {activeTab === "Apps" && (
                profile.apps.length === 0 ? (
                  <div className="col-span-3 py-20 text-center text-white/40">
                    <p>No apps published yet.</p>
                  </div>
                ) : (
                  profile.apps.map((app) => (
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

              {activeTab === "Activity" && (
                <div className="col-span-3 space-y-[1px] bg-white/5">
                  {profile.posts.map((post) => (
                    <div key={post.id} className="bg-black p-4 space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#1c1c1e] overflow-hidden">
                          {profile.avatar_url ? <img src={profile.avatar_url} className="w-full h-full object-cover" /> : profile.username[0].toUpperCase()}
                        </div>
                        <span className="font-bold text-sm">{profile.username}</span>
                      </div>
                      <p className="text-sm text-white/80">{post.content}</p>
                      <div className="flex items-center gap-4 text-white/40">
                        <Heart size={18} />
                        <MessageSquare size={18} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
