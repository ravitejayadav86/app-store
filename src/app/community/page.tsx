"use client";

import { useRouter } from "next/navigation";
import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GlassCard } from "@/components/ui/GlassCard";
import { Users, MessageSquare, Heart, Trash2, Send, ChevronDown, ChevronUp, Search } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import api from "@/lib/api";
import { useRealtime } from "@/hooks/useRealtime";

interface Reply {
  id: number;
  user_id: number;
  post_id: number;
  content: string;
  created_at: string;
  username: string;
  avatar_url?: string | null;
}

interface Post {
  id: number;
  user_id: number;
  content: string;
  created_at: string;
  username: string;
  avatar_url?: string | null;
  likes_count: number;
  liked_by_me: boolean;
  replies: Reply[];
}

export default function CommunityPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [newPost, setNewPost] = useState("");
  const [posting, setPosting] = useState(false);
  const [replyText, setReplyText] = useState<{ [key: number]: string }>({});
  const [showReplies, setShowReplies] = useState<{ [key: number]: boolean }>({});
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();
  const [userSearch, setUserSearch] = useState("");
  const [userResults, setUserResults] = useState<any[]>([]);
  const searchInputRef = React.useRef<HTMLInputElement>(null);
  const searchTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  // Real-time Integration
  const { onEvent } = useRealtime(currentUserId || undefined);

  onEvent("NEW_POST", (data) => {
    setPosts(prev => {
      if (prev.find(p => p.id === data.post.id)) return prev;
      return [data.post, ...prev];
    });
  });

  onEvent("NEW_REPLY", (data) => {
    setPosts(prev => prev.map(p => {
      if (p.id === data.reply.post_id) {
        if (p.replies.find(r => r.id === data.reply.id)) return p;
        return { ...p, replies: [...p.replies, data.reply] };
      }
      return p;
    }));
  });

  onEvent("NOTIFICATION", (data) => {
    toast.info(data.title, { description: data.message });
  });

  const searchUsers = (q: string) => {
    setUserSearch(q);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    
    if (q.length < 2) { 
      setUserResults([]); 
      setIsSearching(false);
      return; 
    }
    
    setIsSearching(true);
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const res = await api.get(`/social/search?q=${q}`);
        setUserResults(res.data);
      } catch {
        toast.error("Failed to search users");
      } finally {
        setIsSearching(false);
      }
    }, 300);
  };

  const fetchPosts = useCallback(async () => {
    try {
      const res = await api.get("/community/posts");
      setPosts(res.data);
    } catch {
      toast.error("Failed to load posts");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts();
    api.get("/users/me").then((res) => {
      setCurrentUserId(res.data.id);
      setIsAdmin(res.data.is_admin);
    }).catch(() => {});
  }, [fetchPosts]);

  const handlePost = async () => {
    if (!newPost.trim()) return;
    setPosting(true);
    try {
      const res = await api.post("/community/posts", { content: newPost });
      setPosts([res.data, ...posts]);
      setNewPost("");
      toast.success("Posted!");
    } catch (err: any) {
      if (err.response?.status === 401) {
        toast.error("Please sign in to post.");
      } else {
        toast.error(err.response?.data?.detail || "Failed to post. Please try again.");
      }
    } finally {
      setPosting(false);
    }
  };

  const handleLike = async (postId: number) => {
    try {
      const res = await api.post(`/community/posts/${postId}/like`);
      setPosts(posts.map(p => p.id === postId ? {
        ...p,
        liked_by_me: res.data.liked,
        likes_count: res.data.liked ? p.likes_count + 1 : p.likes_count - 1
      } : p));
    } catch (err: any) {
      if (err.response?.status === 401) {
        toast.error("Please sign in to like.");
      } else {
        toast.error("Failed to like post.");
      }
    }
  };

  const handleDeletePost = async (postId: number) => {
    if (!confirm("Delete this post?")) return;
    try {
      await api.delete(`/community/posts/${postId}`);
      setPosts(posts.filter(p => p.id !== postId));
      toast.success("Post deleted.");
    } catch {
      toast.error("Failed to delete post.");
    }
  };

  const handleReply = async (postId: number) => {
    const content = replyText[postId]?.trim();
    if (!content) return;
    try {
      const res = await api.post(`/community/posts/${postId}/replies`, { content });
      setPosts(posts.map(p => p.id === postId ? {
        ...p,
        replies: [...p.replies, res.data]
      } : p));
      setReplyText({ ...replyText, [postId]: "" });
      toast.success("Reply added!");
    } catch (err: any) {
      if (err.response?.status === 401) {
        toast.error("Please sign in to reply.");
      } else {
        toast.error(err.response?.data?.detail || "Failed to add reply.");
      }
    }
  };

  const handleDeleteReply = async (postId: number, replyId: number) => {
    if (!confirm("Delete this reply?")) return;
    try {
      await api.delete(`/community/replies/${replyId}`);
      setPosts(posts.map(p => p.id === postId ? {
        ...p,
        replies: p.replies.filter(r => r.id !== replyId)
      } : p));
      toast.success("Reply deleted.");
    } catch {
      toast.error("Failed to delete reply.");
    }
  };

  const toggleReplies = (postId: number) => {
    setShowReplies({ ...showReplies, [postId]: !showReplies[postId] });
  };

  const timeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  return (
    <div className="flex flex-col gap-12 pb-20">
      <section className="px-4 md:px-8">
        <div className="relative h-[300px] md:h-[400px] w-full max-w-7xl mx-auto rounded-3xl overflow-hidden bg-linear-to-br from-primary to-primary-dim p-6 md:p-12 text-on-primary flex flex-col justify-end shadow-2xl">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1.5 }}
            className="absolute top-0 right-0 w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-white/10 rounded-full blur-[80px] md:blur-[100px] -mr-20 md:-mr-40 -mt-20 md:-mt-40"
          />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-3 md:mb-4 bg-white/10 w-fit px-3 py-1 rounded-full text-[10px] md:text-xs font-semibold backdrop-blur-md border border-white/20">
              <Users size={12} className="md:w-3.5 md:h-3.5" />
              <span>Community</span>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold tracking-tight mb-2">The Hub.</h1>
            <p className="text-sm md:text-lg text-on-primary/80 mb-4 md:mb-6">Share, connect, and discuss with PandaStore users.</p>
            <Button 
              variant="secondary" 
              className="bg-white/10 text-white border-white/20 w-full sm:w-auto"
              onClick={() => {
                document.getElementById('user-search')?.scrollIntoView({ behavior: 'smooth' });
                searchInputRef.current?.focus();
              }}
            >
              <Search size={16} className="mr-2" />
              Find People
            </Button>
          </div>
        </div>
      </section>

      <div className="max-w-3xl mx-auto px-4 w-full space-y-6">

        {/* User Search */}
        <div className="relative" id="user-search">
          <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant" />
          <input
            ref={searchInputRef}
            value={userSearch}
            onChange={e => searchUsers(e.target.value)}
            placeholder="Search users..."
            className="w-full pl-11 pr-4 py-3 rounded-2xl bg-surface-low border border-outline-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
          />
          {userSearch.length >= 2 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-surface border border-outline-variant rounded-2xl shadow-xl z-50 overflow-hidden">
              {isSearching ? (
                <div className="p-4 text-center text-xs text-on-surface-variant animate-pulse">Searching...</div>
              ) : userResults.length > 0 ? (
                userResults.map((u: any) => (
                  <button
                    key={u.id}
                    onClick={() => { router.push(`/users/${u.username}`); setUserResults([]); setUserSearch(""); }}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-surface-low transition-colors text-left"
                  >
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary overflow-hidden">
                      {u.avatar_url 
                        ? <img src={u.avatar_url} alt={u.username} className="w-full h-full object-cover" />
                        : u.username[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-on-surface">{u.full_name || u.username}</p>
                      <p className="text-[10px] text-on-surface-variant font-medium">@{u.username}</p>
                      {u.bio && <p className="text-xs text-on-surface-variant line-clamp-1 mt-0.5">{u.bio}</p>}
                    </div>
                  </button>
                ))
              ) : (
                <div className="p-4 text-center text-xs text-on-surface-variant">No users found for "{userSearch}"</div>
              )}
            </div>
          )}
        </div>

        {/* New Post */}
        <GlassCard className="p-5 space-y-3">
          <p className="text-sm font-bold text-on-surface">Share something with the community</p>
          <textarea
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
            placeholder="What's on your mind?"
            rows={3}
            className="w-full px-4 py-3 rounded-2xl bg-surface-low border border-outline-variant focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm resize-none"
          />
          <div className="flex justify-end">
            <button
              onClick={handlePost}
              disabled={posting || !newPost.trim()}
              className="flex items-center gap-2 px-5 py-2.5 bg-primary text-on-primary rounded-xl text-sm font-bold disabled:opacity-50 hover:opacity-90 transition-all"
            >
              <Send size={14} />
              {posting ? "Posting..." : "Post"}
            </button>
          </div>
        </GlassCard>

        {/* Posts */}
        {loading ? (
          <div className="text-center py-10 text-on-surface-variant text-sm">Loading posts...</div>
        ) : posts.length === 0 ? (
          <GlassCard className="p-12 text-center">
            <MessageSquare size={40} className="mx-auto mb-3 text-on-surface-variant opacity-30" />
            <p className="text-on-surface-variant font-medium">No posts yet. Be the first to share!</p>
          </GlassCard>
        ) : (
          <AnimatePresence>
            {posts.map((post, i) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ delay: i * 0.05 }}
              >
                <GlassCard className="p-5 space-y-4">
                  <div className="flex items-start justify-between">
                    <button
                      onClick={() => router.push(`/users/${post.username}`)}
                      className="flex items-center gap-3 hover:opacity-80 transition-opacity"
                    >
                      <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm overflow-hidden">
                        {post.avatar_url 
                          ? <img src={post.avatar_url} alt={post.username} className="w-full h-full object-cover" />
                          : post.username?.[0]?.toUpperCase() || "U"}
                      </div>
                      <div className="text-left">
                        <p className="font-bold text-sm text-on-surface">{post.username}</p>
                        <p className="text-xs text-on-surface-variant">{timeAgo(post.created_at)}</p>
                      </div>
                    </button>
                    {(currentUserId === post.user_id || isAdmin) && (
                      <button onClick={() => handleDeletePost(post.id)} className="text-on-surface-variant hover:text-red-500 transition-colors p-1">
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>

                  <p className="text-sm text-on-surface leading-relaxed">{post.content}</p>

                  <div className="flex items-center gap-4 pt-1">
                    <button
                      onClick={() => handleLike(post.id)}
                      className={`flex items-center gap-1.5 text-xs font-bold transition-colors ${post.liked_by_me ? "text-red-500" : "text-on-surface-variant hover:text-red-500"}`}
                    >
                      <Heart size={15} className={post.liked_by_me ? "fill-red-500" : ""} />
                      {post.likes_count}
                    </button>
                    <button
                      onClick={() => toggleReplies(post.id)}
                      className="flex items-center gap-1.5 text-xs font-bold text-on-surface-variant hover:text-primary transition-colors"
                    >
                      <MessageSquare size={15} />
                      {post.replies.length} {showReplies[post.id] ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                    </button>
                  </div>

                  <AnimatePresence>
                    {showReplies[post.id] && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-3 pt-2 border-t border-outline-variant/30"
                      >
                        {post.replies.map((reply) => (
                          <div key={reply.id} className="flex items-start gap-3 pl-2">
                            <div className="w-7 h-7 rounded-full bg-surface-low flex items-center justify-center text-xs font-bold text-on-surface-variant flex-shrink-0 overflow-hidden">
                              {reply.avatar_url 
                                ? <img src={reply.avatar_url} alt={reply.username} className="w-full h-full object-cover" />
                                : reply.username?.[0]?.toUpperCase() || "U"}
                            </div>
                            <div className="flex-1 bg-surface-low rounded-2xl px-3 py-2">
                              <div className="flex items-center justify-between mb-1">
                                <p className="text-xs font-bold text-on-surface">{reply.username}</p>
                                <div className="flex items-center gap-2">
                                  <p className="text-[10px] text-on-surface-variant">{timeAgo(reply.created_at)}</p>
                                  {(currentUserId === reply.user_id || isAdmin) && (
                                    <button onClick={() => handleDeleteReply(post.id, reply.id)} className="text-on-surface-variant hover:text-red-500 transition-colors">
                                      <Trash2 size={11} />
                                    </button>
                                  )}
                                </div>
                              </div>
                              <p className="text-xs text-on-surface-variant">{reply.content}</p>
                            </div>
                          </div>
                        ))}
                        <div className="flex items-center gap-2 pl-2">
                          <input
                            value={replyText[post.id] || ""}
                            onChange={(e) => setReplyText({ ...replyText, [post.id]: e.target.value })}
                            onKeyDown={(e) => e.key === "Enter" && handleReply(post.id)}
                            placeholder="Write a reply..."
                            className="flex-1 px-3 py-2 rounded-xl bg-surface-low border border-outline-variant text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
                          />
                          <button
                            onClick={() => handleReply(post.id)}
                            disabled={!replyText[post.id]?.trim()}
                            className="p-2 bg-primary text-on-primary rounded-xl disabled:opacity-40 hover:opacity-90 transition-all"
                          >
                            <Send size={13} />
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </GlassCard>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}