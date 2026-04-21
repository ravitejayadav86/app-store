"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { 
  Users, 
  Package, 
  MessageSquare, 
  MapPin, 
  Calendar, 
  ChevronLeft,
  UserPlus,
  UserCheck,
  Music,
  Book,
  Heart,
  Layout,
  Globe,
  Loader2,
  Lock
} from "lucide-react";
import api from "@/lib/api";
import { toast } from "sonner";
import Link from "next/link";

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
  const [activeTab, setActiveTab] = useState<"Contributions" | "Activity">("Contributions");


  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get(`/social/profile/${username}`);
        setProfile(res.data);
        setFollowing(res.data.is_following);
        
        // Check if this is the current user's own profile
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

  const getIcon = (category: string) => {
    const cat = category?.toLowerCase();
    if (cat === "music") return <Music size={18} className="text-pink-500" />;
    if (cat === "books") return <Book size={18} className="text-amber-500" />;
    return <Layout size={18} className="text-primary" />;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="animate-spin text-primary" size={40} />
        <p className="text-on-surface-variant animate-pulse">Scanning social nodes...</p>
      </div>
    );
  }

  if (!profile) return null;

  const canSeeContent = !profile.is_private || following || isMe;

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 pb-20 pt-10">
      {/* Back Link */}
      <button 
        onClick={() => router.back()}
        className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors mb-8 group"
      >
        <ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
        <span className="text-sm font-medium">Back</span>
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: User Info */}
        <div className="lg:col-span-4 space-y-6">
          <GlassCard className="p-8 flex flex-col items-center text-center gap-6">
            <div className="relative">
              <div className="w-32 h-32 rounded-full bg-linear-to-br from-primary/20 to-primary/5 flex items-center justify-center text-5xl font-bold text-primary shadow-inner border border-primary/10 overflow-hidden">
                {profile.avatar_url 
                  ? <img src={profile.avatar_url} alt={profile.username} className="w-full h-full object-cover" />
                  : profile.username[0].toUpperCase()}
              </div>
              {profile.is_admin && (
                <div className="absolute -top-1 -right-1 bg-primary text-on-primary px-2 py-0.5 rounded-full text-[10px] font-bold shadow-lg uppercase tracking-wider">
                  Staff
                </div>
              )}
            </div>

            <div className="space-y-1">
              <h1 className="text-3xl font-bold tracking-tight">{profile.username}</h1>
              <p className="text-on-surface-variant text-sm flex items-center justify-center gap-1">
                {profile.is_private ? <Lock size={12} /> : <Globe size={12} />}
                {profile.is_private ? "Private Account" : "Public Profile"}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4 py-4 border-y border-outline-variant/30 w-full justify-center">
              <div className="text-center min-w-[70px]">
                <p className="text-xl font-bold">{profile.followers_count}</p>
                <p className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">Followers</p>
              </div>
              <div className="w-px h-8 bg-outline-variant/30 hidden sm:block" />
              <div className="text-center min-w-[70px]">
                <p className="text-xl font-bold">{profile.following_count}</p>
                <p className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">Following</p>
              </div>
              <div className="w-px h-8 bg-outline-variant/30 hidden sm:block" />
              <div className="text-center min-w-[70px]">
                <p className="text-xl font-bold">{profile.apps.length}</p>
                <p className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">Published</p>
              </div>
            </div>

            <p className="text-sm leading-relaxed text-on-surface-variant">
              {profile.bio || "No bio yet. This panda explores innovations in silence."}
            </p>

            <div className="flex gap-3 w-full">
              {!isMe && (
                <>
                  <Button 
                    variant={following ? "secondary" : "primary"} 
                    className="flex-1"
                    onClick={handleFollow}
                  >
                    {following ? <UserCheck size={18} className="mr-2" /> : <UserPlus size={18} className="mr-2" />}
                    {following ? "Following" : "Follow"}
                  </Button>
                  <Link href={`/messages/${profile.username}`} className="flex-1">
                    <Button variant="secondary" className="w-full">
                      <MessageSquare size={18} className="mr-2" />
                      Message
                    </Button>
                  </Link>
                </>
              )}
              {isMe && (
                <Link href="/profile" className="w-full">
                  <Button variant="secondary" className="w-full text-primary">Edit My Profile</Button>
                </Link>
              )}
            </div>
          </GlassCard>

          <GlassCard className="p-6 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-widest text-on-surface-variant">Details</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm text-on-surface-variant">
                <Calendar size={16} />
                <span>Joined {new Date(profile.created_at).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-on-surface-variant">
                <Package size={16} />
                <span>{profile.apps.length} Contributions</span>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Right Column: Content */}
        <div className="lg:col-span-8 space-y-8">
          <div className="flex items-center justify-between border-b border-outline-variant pb-4">
            <div className="flex gap-8">
              <button 
                onClick={() => setActiveTab("Contributions")}
                className={`text-sm font-bold transition-all ${activeTab === "Contributions" ? "border-b-2 border-primary pb-4 -mb-[18px]" : "text-on-surface-variant hover:text-on-surface pb-4 -mb-[18px]"}`}
              >
                Contributions
              </button>
              <button 
                onClick={() => setActiveTab("Activity")}
                className={`text-sm font-bold transition-all ${activeTab === "Activity" ? "border-b-2 border-primary pb-4 -mb-[18px]" : "text-on-surface-variant hover:text-on-surface pb-4 -mb-[18px]"}`}
              >
                Activity
              </button>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {!canSeeContent ? (
              <motion.div 
                key="private"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="py-20 flex flex-col items-center justify-center text-center gap-4 bg-surface-low rounded-3xl border border-dashed border-outline-variant"
              >
                <div className="w-20 h-20 rounded-full bg-outline-variant/10 flex items-center justify-center text-on-surface-variant">
                  <Lock size={40} />
                </div>
                <div>
                  <h3 className="text-xl font-bold">This Account is Private</h3>
                  <p className="text-on-surface-variant text-sm max-w-xs mx-auto mt-1">
                    Follow this user to see their published innovations and activity.
                  </p>
                </div>
                <Button variant="primary" size="sm" onClick={handleFollow} className="mt-2">
                  Request to Follow
                </Button>
              </motion.div>
            ) : activeTab === "Contributions" ? (
              profile.apps.length === 0 ? (
                <motion.div 
                  key="no-apps"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="py-20 flex flex-col items-center justify-center text-center gap-4"
                >
                  <Package size={48} className="text-outline-variant opacity-30" />
                  <p className="text-on-surface-variant">No contributions published yet.</p>
                </motion.div>
              ) : (
                <motion.div 
                  key="apps"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-4"
                >
                  {profile.apps.map((app, index) => (
                    <motion.div
                      key={app.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Link href={`/apps/${app.id}`}>
                        <GlassCard className="p-4 hover:bg-surface-low transition-colors group cursor-pointer flex items-center gap-4">
                          <div className="w-16 h-16 rounded-2xl bg-surface-low flex items-center justify-center shadow-inner group-hover:bg-surface-high transition-colors">
                            {getIcon(app.category)}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-bold text-on-surface group-hover:text-primary transition-colors">{app.name}</h4>
                            <p className="text-xs text-on-surface-variant">{app.category}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs font-bold text-primary">
                              {app.price === 0 ? "FREE" : `$${app.price}`}
                            </p>
                            <p className="text-[10px] text-on-surface-variant mt-1">v{app.version}</p>
                          </div>
                        </GlassCard>
                      </Link>
                    </motion.div>
                  ))}
                </motion.div>
              )
            ) : (
              // Activity Tab: User's Posts
              profile.posts.length === 0 ? (
                <motion.div 
                  key="no-posts"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="py-20 flex flex-col items-center justify-center text-center gap-4"
                >
                  <MessageSquare size={48} className="text-outline-variant opacity-30" />
                  <p className="text-on-surface-variant">No activity posts yet.</p>
                </motion.div>
              ) : (
                <motion.div 
                  key="posts"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-4"
                >
                  {profile.posts.map((post, index) => (
                    <motion.div
                      key={post.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <GlassCard className="p-6 space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                            {profile.avatar_url ? <img src={profile.avatar_url} className="w-full h-full rounded-full object-cover" /> : profile.username[0].toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-sm">{profile.username}</p>
                            <p className="text-[10px] text-on-surface-variant uppercase tracking-widest font-bold">
                              {new Date(post.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <p className="text-sm leading-relaxed text-on-surface-variant">{post.content}</p>
                        <div className="flex items-center gap-4 pt-4 border-t border-outline-variant/30">
                          <div className="flex items-center gap-1.5 text-xs font-bold text-on-surface-variant">
                            <Heart size={14} className={post.liked_by_me ? "fill-primary text-primary" : ""} />
                            {post.likes_count}
                          </div>
                          <div className="flex items-center gap-1.5 text-xs font-bold text-on-surface-variant">
                            <MessageSquare size={14} />
                            {post.replies.length}
                          </div>
                        </div>
                      </GlassCard>
                    </motion.div>
                  ))}
                </motion.div>
              )
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
