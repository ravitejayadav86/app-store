"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  GlassCard 
} from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { 
  Settings, 
  MapPin, 
  Calendar, 
  Link as LinkIcon, 
  Edit3, 
  LogOut, 
  Users, 
  Package, 
  Heart, 
  MessageSquare,
  User,
  ShieldCheck,
  CheckCircle2,
  Mail,
  MoreHorizontal,
  ChevronRight,
  Share2,
  UserPlus,
  UserMinus,
  MessageCircle,
  Eye,
  FileText,
  Zap
} from "lucide-react";
import api from "@/lib/api";
import { toast } from "sonner";
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
  posts?: any[];
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://pandas-store-api.onrender.com";

export default function UserProfileClient({ username: propUsername }: { username?: string }) {
  const params = useParams();
  const username = propUsername || params.username as string;
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("apps");
  const [isMe, setIsMe] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

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
      // Backend uses POST /social/follow/{username} as a toggle
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
    <div className="min-h-screen flex items-center justify-center bg-surface">
      <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
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
    <div className="min-h-screen bg-surface pb-20 pt-20">
      {/* Dynamic Header/Hero */}
      <div className="relative h-[300px] w-full overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-br from-primary/30 via-surface to-surface z-0" />
        <div className="absolute top-0 left-0 w-full h-full">
           <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[100%] bg-primary/10 rounded-full blur-[120px] animate-pulse" />
           <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[80%] bg-secondary/5 rounded-full blur-[100px]" />
        </div>
        
        <div className="max-w-7xl mx-auto px-4 md:px-8 h-full flex items-end pb-12 relative z-10">
          <div className="flex flex-col md:flex-row items-center md:items-end gap-8 w-full">
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-40 h-40 rounded-[2.5rem] bg-surface-lowest shadow-2xl border-4 border-surface overflow-hidden flex items-center justify-center relative group"
            >
              {user.avatar_url ? (
                <img src={resolveMediaUrl(user.avatar_url)} alt={user.username} className="w-full h-full object-cover" />
              ) : (
                <span className="text-6xl font-bold text-primary">{user.username[0].toUpperCase()}</span>
              )}
              {isMe && (
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                  <Edit3 className="text-white" size={24} />
                </div>
              )}
            </motion.div>

            <div className="flex-grow text-center md:text-left space-y-2">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                <h1 className="text-4xl font-bold text-on-surface">{user.full_name || user.username}</h1>
                <div className="flex gap-2">
                  {user.is_publisher && (
                    <div className="px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-[10px] font-bold text-primary uppercase tracking-widest flex items-center gap-1.5 shadow-sm">
                      <ShieldCheck size={12} /> Publisher
                    </div>
                  )}
                  {user.is_admin && (
                    <div className="px-3 py-1 rounded-full bg-secondary/10 border border-secondary/20 text-[10px] font-bold text-secondary uppercase tracking-widest flex items-center gap-1.5 shadow-sm">
                      <Zap size={12} /> Admin
                    </div>
                  )}
                </div>
              </div>
              <p className="text-on-surface-variant font-medium text-lg">@{user.username}</p>
              
              <div className="flex flex-wrap justify-center md:justify-start items-center gap-6 mt-4">
                <div className="flex items-center gap-2 text-on-surface-variant font-medium">
                  <Calendar size={16} />
                  <span className="text-sm">Joined {new Date(user.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" })}</span>
                </div>
                {user.bio && (
                   <div className="flex items-center gap-2 text-on-surface-variant font-medium">
                    <FileText size={16} />
                    <span className="text-sm truncate max-w-[300px]">{user.bio}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-3">
              {isMe ? (
                <>
                  <Link href="/settings">
                    <Button variant="secondary" className="rounded-2xl px-6 border-outline-variant hover:bg-surface-low shadow-sm">
                      <Settings size={18} className="mr-2" /> Settings
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <Button 
                    variant={user.is_following ? "secondary" : "primary"}
                    onClick={handleFollow}
                    disabled={followLoading}
                    className={`rounded-2xl px-8 shadow-lg transition-all active:scale-95 ${!user.is_following ? "shadow-primary/20" : "border-outline-variant hover:bg-surface-low"}`}
                  >
                    {user.is_following ? (
                      <><UserMinus size={18} className="mr-2" /> Unfollow</>
                    ) : (
                      <><UserPlus size={18} className="mr-2" /> Follow</>
                    )}
                  </Button>
                  <Link href={`/messages/${user.username}`}>
                    <Button variant="secondary" className="rounded-2xl px-6 border-outline-variant hover:bg-surface-low shadow-sm">
                      <MessageCircle size={18} />
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Profile Content */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 mt-12 grid grid-cols-1 lg:grid-cols-4 gap-12">
        {/* Left Sidebar */}
        <aside className="space-y-8">
          <GlassCard className="p-8 border-outline-variant">
             <div className="grid grid-cols-3 gap-4 text-center">
                <Link href={`/users/${user.username}/followers`} className="hover:bg-primary/5 p-2 rounded-xl transition-colors cursor-pointer group">
                  <p className="text-2xl font-bold group-hover:text-primary">{user.followers_count}</p>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Followers</p>
                </Link>
                <Link href={`/users/${user.username}/following`} className="hover:bg-primary/5 p-2 rounded-xl transition-colors cursor-pointer group">
                  <p className="text-2xl font-bold group-hover:text-primary">{user.following_count}</p>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Following</p>
                </Link>
                <div className="p-2">
                  <p className="text-2xl font-bold">{user.apps_count}</p>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Apps</p>
                </div>
             </div>
          </GlassCard>

          <div className="space-y-4 px-2">
             <h3 className="text-xs font-bold uppercase tracking-widest text-primary ml-1">About</h3>
             <p className="text-sm text-on-surface-variant leading-relaxed">
               {user.bio || "No bio available. This user prefers to let their collection do the talking."}
             </p>
          </div>

          <div className="space-y-4 px-2">
             <h3 className="text-xs font-bold uppercase tracking-widest text-primary ml-1">Connect</h3>
             <div className="flex gap-4">
                {[1,2,3].map(i => (
                  <button key={i} className="w-10 h-10 rounded-xl bg-surface-low border border-outline-variant flex items-center justify-center text-on-surface-variant hover:text-primary transition-all hover:scale-110">
                    <Share2 size={18} />
                  </button>
                ))}
             </div>
          </div>
        </aside>

        {/* Main Feed */}
        <main className="lg:col-span-3 space-y-8">
           <div className="flex gap-8 border-b border-outline-variant">
              {[
                { id: "apps", label: "Published Apps", icon: <Package size={16} /> },
                { id: "activity", label: "Activity", icon: <Zap size={16} /> },
                { id: "reviews", label: "Reviews", icon: <Heart size={16} /> }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 pb-4 px-2 text-sm font-bold uppercase tracking-widest transition-all relative ${
                    activeTab === tab.id ? "text-primary" : "text-on-surface-variant hover:text-on-surface"
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                  {activeTab === tab.id && (
                    <motion.div layoutId="profile-tab" className="absolute bottom-0 inset-x-0 h-1 bg-primary rounded-full" />
                  )}
                </button>
              ))}
           </div>

           <AnimatePresence mode="wait">
             <motion.div
               key={activeTab}
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               exit={{ opacity: 0, y: -20 }}
               transition={{ duration: 0.4 }}
             >
                {activeTab === "apps" ? (
                   user.apps && user.apps.filter(a => a.is_approved && a.is_active).length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         {user.apps.filter(a => a.is_approved && a.is_active).map((app: any) => (
                           <Link key={app.id} href={`/apps/${app.id}`}>
                            <GlassCard className="p-6 group cursor-pointer border-outline-variant/40 hover:border-primary/30 transition-all shadow-sm hover:shadow-xl hover:shadow-primary/5">
                               <div className="flex gap-6 items-center">
                                  <div className="w-20 h-20 rounded-2xl bg-surface-lowest shadow-inner border border-outline-variant/30 flex items-center justify-center group-hover:scale-105 transition-transform overflow-hidden">
                                     {app.icon_url
                                       ? <img src={app.icon_url} alt={app.name} className="w-full h-full object-cover" />
                                       : <Package className="text-primary/40" size={32} />}
                                  </div>
                                  <div className="flex-grow">
                                     <h4 className="font-bold text-lg group-hover:text-primary transition-colors">{app.name}</h4>
                                     <p className="text-xs text-on-surface-variant">{app.category} {app.file_size ? `• ${app.file_size}` : ""}</p>
                                     <div className="flex items-center gap-1.5 mt-2">
                                        <span className="text-[10px] font-bold text-primary px-2 py-0.5 rounded-full bg-primary/10">{app.price === 0 ? "Free" : `₹${app.price}`}</span>
                                     </div>
                                  </div>
                                  <ChevronRight className="text-on-surface-variant/30 group-hover:text-primary transition-colors" />
                               </div>
                            </GlassCard>
                           </Link>
                         ))}
                      </div>
                   ) : (
                      <div className="flex flex-col items-center justify-center py-24 text-center space-y-4 opacity-40">
                         <Package size={60} />
                         <p className="text-lg font-medium">No apps published yet.</p>
                      </div>
                   )
                ) : (
                   <div className="flex flex-col items-center justify-center py-24 text-center space-y-4 opacity-40">
                      <Zap size={60} />
                      <p className="text-lg font-medium">No recent {activeTab} to show.</p>
                   </div>
                )}
             </motion.div>
           </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
