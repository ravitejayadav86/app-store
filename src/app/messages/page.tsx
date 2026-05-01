"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare, Search, Lock, Plus,
  Check, CheckCheck, Users, ArrowLeft, Camera, Video, Edit
} from "lucide-react";
import api from "@/lib/api";
import { toast } from "sonner";
import Link from "next/link";
import { useRealtime, useRealtimeEvent } from "@/hooks/useRealtime";

interface Conversation {
  username: string;
  avatar_url?: string | null;
  last_message: string;
  created_at: string;
  is_read: boolean;
  unread_count?: number;
}

const SPRING = { type: "spring", stiffness: 480, damping: 36, mass: 0.6 } as const;

const formatTime = (date: string) => {
  const diff = (Date.now() - new Date(date).getTime()) / 1000;
  if (diff < 60)    return "now";
  if (diff < 3600)  return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d`;
  const d = new Date(date);
  return d.toLocaleDateString("en", { month: "short", day: "numeric" });
};

const Avatar = ({ username, url, size = 56, isActive = false }: { username: string; url?: string | null; size?: number, isActive?: boolean }) => (
  <div className="relative">
    <div
      style={{ width: size, height: size, minWidth: size }}
      className={`rounded-full overflow-hidden flex items-center justify-center font-bold border-2 ${isActive ? "border-green-500 p-0.5" : "border-transparent"}`}
    >
      <div className="w-full h-full rounded-full overflow-hidden bg-surface-low flex items-center justify-center text-primary border border-outline-variant/30 shadow-inner">
        {url
          ? <img src={url} alt={username} className="w-full h-full object-cover" />
          : username[0].toUpperCase()}
      </div>
    </div>
    {isActive && (
      <span className="absolute bottom-0.5 right-0.5 w-3.5 h-3.5 bg-green-500 border-2 border-surface rounded-full" />
    )}
  </div>
);

export default function MessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading]             = useState(true);
  const [search, setSearch]               = useState("");
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const router = useRouter();

  useRealtime(currentUserId || undefined);

  const fetchConversations = async () => {
    try {
      const res = await api.get("/social/conversations");
      setConversations(res.data);
    } catch (err: any) {
      toast.error("Could not load conversations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    api.get("/users/me")
      .then(res => setCurrentUserId(res.data.id))
      .catch(() => toast.error("Please sign in"));
  }, []);

  useEffect(() => { if (currentUserId) fetchConversations(); }, [currentUserId]);

  useRealtimeEvent(currentUserId || undefined, "MESSAGES_READ", (msg) => {
    setConversations(prev =>
      prev.map(c => c.username === msg.by ? { ...c, unread_count: 0 } : c)
    );
  });

  useRealtimeEvent(currentUserId || undefined, "NEW_MESSAGE", (msg) => {
    if (!msg.content) return;
    setConversations(prev => {
      const idx = prev.findIndex(c => c.username === msg.sender_username);
      const conv: Conversation = {
        username:     msg.sender_username,
        avatar_url:   msg.sender_avatar_url,
        last_message: msg.content,
        created_at:   msg.created_at,
        is_read:      false,
        unread_count: (idx >= 0 ? (prev[idx].unread_count || 0) : 0) + 1,
      };
      const next = idx >= 0 ? [...prev] : [...prev];
      if (idx >= 0) next.splice(idx, 1);
      return [conv, ...next];
    });
  });

  const filtered = conversations.filter(c =>
    c.username.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return (
    <div className="min-h-screen bg-surface">
      <header className="px-4 py-3 flex items-center justify-between border-b border-outline-variant/30">
        <div className="w-24 h-6 bg-surface-low rounded animate-pulse" />
        <div className="w-8 h-8 bg-surface-low rounded-full animate-pulse" />
      </header>
      <div className="px-4 pt-6 space-y-4">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="flex items-center gap-4 animate-pulse">
            <div className="w-14 h-14 rounded-full bg-surface-low" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-surface-low rounded w-1/4" />
              <div className="h-3 bg-surface-low rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      {/* ── Header ── */}
      <header className="sticky top-0 z-50 bg-surface/80 backdrop-blur-xl border-b border-outline-variant/30 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="text-on-surface">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-xl font-black text-on-surface">Messages</h1>
        </div>
        <div className="flex items-center gap-5">
          <button className="text-on-surface"><Video size={24} /></button>
          <Link href="/community">
            <button className="text-on-surface"><Edit size={22} /></button>
          </Link>
        </div>
      </header>

      {/* ── Search ── */}
      <div className="px-4 pt-4 pb-2">
        <div className="relative">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/50" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search"
            className="w-full pl-12 pr-4 py-2.5 rounded-xl bg-surface-low border-none focus:ring-2 focus:ring-primary/10 transition-all text-sm text-on-surface placeholder:text-on-surface-variant/50"
          />
        </div>
      </div>

      {/* ── Active Users (IG Style) ── */}
      {!search && (
        <div className="px-4 py-4 overflow-x-auto no-scrollbar border-b border-outline-variant/10">
          <div className="flex gap-5">
            {conversations.slice(0, 8).map((c, i) => (
              <div key={i} className="flex flex-col items-center gap-1.5 cursor-pointer" onClick={() => router.push(`/messages/${c.username}`)}>
                <Avatar username={c.username} url={c.avatar_url} size={64} isActive={i < 3} />
                <span className="text-[10px] font-bold text-on-surface-variant truncate w-16 text-center">
                  {c.username}
                </span>
              </div>
            ))}
            <Link href="/community" className="flex flex-col items-center gap-1.5">
               <div className="w-[64px] h-[64px] rounded-full border-2 border-dashed border-outline-variant flex items-center justify-center text-on-surface-variant">
                  <Plus size={24} />
               </div>
               <span className="text-[10px] font-bold text-on-surface-variant">Add</span>
            </Link>
          </div>
        </div>
      )}

      {/* ── Messages List ── */}
      <div className="flex-1 overflow-y-auto px-1 pt-2 pb-24">
        <AnimatePresence mode="popLayout">
          {filtered.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-24 text-center px-8"
            >
              <div className="w-20 h-20 rounded-full bg-surface-low border border-outline-variant/30 flex items-center justify-center mb-6 shadow-inner">
                <MessageSquare size={32} className="text-on-surface-variant/30" />
              </div>
              <h2 className="text-lg font-black text-on-surface mb-2">Messages</h2>
              <p className="text-sm text-on-surface-variant">Send private photos and messages to a friend.</p>
              <Link href="/community" className="mt-6 text-primary font-black text-sm hover:underline">
                Send Message
              </Link>
            </motion.div>
          ) : (
            <div className="space-y-1">
              {filtered.map((c, i) => (
                <motion.div
                  key={c.username}
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => router.push(`/messages/${c.username}`)}
                  className="group flex items-center gap-3.5 p-3 hover:bg-surface-low transition-colors cursor-pointer active:scale-[0.98]"
                >
                  <Avatar username={c.username} url={c.avatar_url} size={56} />
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-bold truncate ${c.unread_count && c.unread_count > 0 ? "text-on-surface" : "text-on-surface"}`}>
                      {c.username}
                    </p>
                    <div className="flex items-center gap-1.5">
                      <p className={`text-xs truncate max-w-[200px] ${c.unread_count && c.unread_count > 0 ? "font-black text-on-surface" : "text-on-surface-variant"}`}>
                        {c.last_message || "Started a conversation"}
                      </p>
                      <span className="text-[10px] text-on-surface-variant/50 flex-shrink-0">
                        • {formatTime(c.created_at)}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1.5 pr-1">
                    {c.unread_count && c.unread_count > 0 ? (
                      <div className="w-2.5 h-2.5 bg-primary rounded-full shadow-sm" />
                    ) : (
                       c.is_read ? <CheckCheck size={14} className="text-primary/40" /> : <Check size={14} className="text-on-surface-variant/30" />
                    )}
                    <Camera size={18} className="text-on-surface-variant/30 group-hover:text-on-surface-variant transition-colors" />
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
