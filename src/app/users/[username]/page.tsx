"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { ArrowLeft, Lock, Grid, MessageCircle, UserCheck, UserPlus, Gamepad2, Music, BookOpen, Code2 } from "lucide-react";
import Link from "next/link";
import api from "@/lib/api";
import { toast } from "sonner";

interface App {
  id: number;
  name: string;
  category: string;
  price: number;
  version: string;
  description: string;
  developer: string;
  is_active: boolean;
  is_approved: boolean;
  file_path: string | null;
  created_at: string;
}

interface Profile {
  id: number;
  username: string;
  bio: string | null;
  is_private: boolean;
  is_admin: boolean;
  created_at: string;
  followers_count: number;
  following_count: number;
  is_following: boolean;
  apps: App[];
}

const getCategoryIcon = (category: string) => {
  switch (category?.toLowerCase()) {
    case "games": return <Gamepad2 size={20} className="text-white" />;
    case "music": return <Music size={20} className="text-white" />;
    case "books": return <BookOpen size={20} className="text-white" />;
    default: return <Code2 size={20} className="text-white" />;
  }
};

const getCategoryGradient = (category: string) => {
  switch (category?.toLowerCase()) {
    case "games": return "from-emerald-500 to-teal-600";
    case "music": return "from-pink-500 to-rose-600";
    case "books": return "from-purple-500 to-violet-600";
    default: return "from-orange-500 to-amber-600";
  }
};

export default function UserProfilePage() {
  const { username } = useParams();
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [following, setFollowing] = useState(false);
  const [currentUsername, setCurrentUsername] = useState<string | null>(null);

  useEffect(() => {
    api.get("/users/me").then(res => setCurrentUsername(res.data.username)).catch(() => {});
  }, []);

  const fetchProfile = useCallback(async () => {
    try {
      const res = await api.get(`/social/profile/${username}`);
      setProfile(res.data);
      setFollowing(res.data.is_following);
    } catch {
      toast.error("User not found");
      router.push("/");
    } finally {
      setLoading(false);
    }
  }, [username, router]);

  useEffect(() => { fetchProfile(); }, [fetchProfile]);

  const handleFollow = async () => {
    try {
      const res = await api.post(`/social/follow/${username}`);
      setFollowing(res.data.following);
      setProfile(prev => prev ? {
        ...prev,
        followers_count: res.data.following ? prev.followers_count + 1 : prev.followers_count - 1,
        is_following: res.data.following
      } : prev);
      toast.success(res.data.following ? "Following!" : "Unfollowed");
    } catch {
      toast.error("Please sign in to follow.");
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-pulse text-on-surface-variant">Loading...</div>
    </div>
  );

  if (!profile) return null;

  const isOwnProfile = currentUsername === profile.username;
  const canSeeApps = !profile.is_private || profile.is_following || isOwnProfile;

  return (
    <div className="max-w-3xl mx-auto px-4 pt-28 pb-20">
      <button onClick={() => router.back()} className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors mb-6">
        <ArrowLeft size={18} /> Back
      </button>

      {/* Profile Header */}
      <GlassCard className="p-6 mb-6">
        <div className="flex items-start gap-5">
          <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center text-3xl font-bold text-primary flex-shrink-0">
            {profile.username[0].toUpperCase()}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl font-bold text-on-surface">{profile.username}</h1>
              {profile.is_admin && (
                <span className="text-xs bg-red-500/10 text-red-500 px-2 py-0.5 rounded-full font-bold">Admin</span>
              )}
              {profile.is_private && (
                <Lock size={14} className="text-on-surface-variant" />
              )}
            </div>
            {profile.bio && <p className="text-sm text-on-surface-variant mb-3">{profile.bio}</p>}
            <div className="flex gap-4 text-sm">
              <div className="text-center">
                <p className="font-bold text-on-surface">{profile.followers_count}</p>
                <p className="text-xs text-on-surface-variant">Followers</p>
              </div>
              <div className="text-center">
                <p className="font-bold text-on-surface">{profile.following_count}</p>
                <p className="text-xs text-on-surface-variant">Following</p>
              </div>
              <div className="text-center">
                <p className="font-bold text-on-surface">{profile.apps.length}</p>
                <p className="text-xs text-on-surface-variant">Apps</p>
              </div>
            </div>
          </div>
        </div>

        {!isOwnProfile && (
          <div className="flex gap-3 mt-5">
            <Button onClick={handleFollow} className="flex-1 flex items-center justify-center gap-2">
              {following ? <UserCheck size={16} /> : <UserPlus size={16} />}
              {following ? "Following" : "Follow"}
            </Button>
            <Link href={`/messages/${profile.username}`} className="flex-1">
              <Button className="w-full flex items-center justify-center gap-2">
                <MessageCircle size={16} /> Message
              </Button>
            </Link>
          </div>
        )}

        {isOwnProfile && (
          <div className="mt-4">
            <Link href="/profile">
              <Button className="w-full">Edit Profile</Button>
            </Link>
          </div>
        )}
      </GlassCard>

      {/* Apps Section */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Grid size={16} className="text-primary" />
          <h2 className="font-bold text-on-surface">Published Apps</h2>
        </div>

        {!canSeeApps ? (
          <GlassCard className="p-12 text-center">
            <Lock size={32} className="mx-auto mb-3 text-on-surface-variant opacity-30" />
            <p className="font-bold text-on-surface mb-1">This account is private</p>
            <p className="text-sm text-on-surface-variant">Follow to see their published apps.</p>
          </GlassCard>
        ) : profile.apps.length === 0 ? (
          <GlassCard className="p-12 text-center">
            <p className="text-on-surface-variant text-sm">No apps published yet.</p>
          </GlassCard>
        ) : (
          <div className="space-y-2">
            {profile.apps.map((app, i) => (
              <motion.div key={app.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Link href={`/apps/${app.id}`} className="flex items-center gap-4 p-3 rounded-2xl hover:bg-surface-low transition-colors group">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${getCategoryGradient(app.category)} flex items-center justify-center flex-shrink-0`}>
                    {getCategoryIcon(app.category)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm truncate text-on-surface group-hover:text-primary transition-colors">{app.name}</h4>
                    <p className="text-xs text-on-surface-variant">{app.category} • v{app.version}</p>
                    <p className="text-xs font-bold text-primary mt-0.5">{app.price === 0 ? "Free" : `$${app.price}`}</p>
                  </div>
                </Link>
                {i < profile.apps.length - 1 && <div className="ml-18 border-b border-outline-variant/20" />}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}