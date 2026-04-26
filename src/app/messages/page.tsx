"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare, Search, Lock, Plus,
  Check, CheckCheck, Users, ArrowRight
} from "lucide-react";
import api from "@/lib/api";
import { toast } from "sonner";
import Link from "next/link";
import { useRealtime } from "@/hooks/useRealtime";

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
  const d = new Date(date);
  return d.toLocaleDateString("en", { month: "short", day: "numeric" });
};

const Avatar = ({ username, url, size = 48 }: { username: string; url?: string | null; size?: number }) => (
  <div
    style={{ width: size, height: size, minWidth: size }}
    className="rounded-2xl overflow-hidden bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center font-bold text-primary border border-primary/10 shadow-inner text-base"
  >
    {url
      ? <img src={url} alt={username} className="w-full h-full object-cover" />
      : username[0].toUpperCase()}
  </div>
);

export default function MessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading]             = useState(true);
  const [search, setSearch]               = useState("");
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const router = useRouter();

  const { useEvent } = useRealtime(currentUserId || undefined);

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

  useEvent("MESSAGES_READ", (msg) => {
    setConversations(prev =>
      prev.map(c => c.username === msg.by ? { ...c, unread_count: 0 } : c)
    );
  });

  useEvent("NEW_MESSAGE", (msg) => {
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

  const totalUnread = conversations.reduce((s, c) => s + (c.unread_count || 0), 0);

  // ── Skeleton ──────────────────────────────────────────────────────────────
  if (loading) return (
    <div className="max-w-2xl mx-auto px-4 pt-6 pb-24 space-y-3">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-4 rounded-3xl bg-surface-low animate-pulse">
          <div className="w-12 h-12 rounded-2xl bg-outline-variant/30 flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-3 rounded-full bg-outline-variant/30 w-1/3" />
            <div className="h-2.5 rounded-full bg-outline-variant/20 w-2/3" />
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto px-4 pt-6 pb-28">

      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2.5 mb-0.5">
            <h1 className="text-3xl font-black tracking-tight text-on-surface">Messages</h1>
            {totalUnread > 0 && (
              <motion.span
                initial={{ scale: 0 }} animate={{ scale: 1 }} transition={SPRING}
                className="px-2 py-0.5 rounded-full bg-primary text-on-primary text-xs font-bold"
              >
                {totalUnread}
              </motion.span>
            )}
          </div>
          <p className="text-on-surface-variant text-xs flex items-center gap-1.5">
            <Lock size={10} className="text-green-500" />
            End-to-end encrypted
          </p>
        </div>
        <Link href="/community">
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-primary text-on-primary text-sm font-bold shadow-lg shadow-primary/25 hover:shadow-primary/40 active:scale-95 transition-all">
            <Plus size={16} /> New
          </button>
        </Link>
      </div>

      {/* ── Search ── */}
      <div className="relative mb-5">
        <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/60" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search messages…"
          className="w-full pl-11 pr-4 py-3 rounded-2xl bg-surface-low border border-outline-variant/40 focus:outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10 transition-all text-sm text-on-surface placeholder:text-on-surface-variant/50"
        />
      </div>

      {/* ── List ── */}
      <AnimatePresence mode="popLayout">
        {filtered.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            transition={SPRING}
            className="flex flex-col items-center justify-center py-24 text-center"
          >
            <div className="w-20 h-20 rounded-3xl bg-surface-low border border-outline-variant/30 flex items-center justify-center mb-5 shadow-inner">
              <MessageSquare size={32} className="text-on-surface-variant/30" />
            </div>
            <p className="font-bold text-on-surface mb-1">No conversations yet</p>
            <p className="text-sm text-on-surface-variant mb-6">Start chatting with someone from the community.</p>
            <Link href="/community">
              <button className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-primary text-on-primary text-sm font-bold shadow-lg shadow-primary/20 active:scale-95 transition-all">
                <Users size={16} /> Browse Community <ArrowRight size={14} />
              </button>
            </Link>
          </motion.div>
        ) : (
          <div className="space-y-1.5">
            {filtered.map((c, i) => (
              <motion.div
                key={c.username}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ ...SPRING, delay: i * 0.03 }}
              >
                <Link href={`/messages/${c.username}`}>
                  <div className={`group flex items-center gap-3.5 p-3.5 rounded-3xl transition-all active:scale-[0.98] cursor-pointer ${
                    c.unread_count && c.unread_count > 0
                      ? "bg-primary/5 border border-primary/10"
                      : "hover:bg-surface-low border border-transparent"
                  }`}>
                    {/* Avatar */}
                    <div className="relative flex-shrink-0">
                      <Avatar username={c.username} url={c.avatar_url} size={52} />
                      {c.unread_count && c.unread_count > 0 ? (
                        <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-primary text-on-primary text-[9px] font-black rounded-full flex items-center justify-center px-1 shadow-sm shadow-primary/30">
                          {c.unread_count > 9 ? "9+" : c.unread_count}
                        </span>
                      ) : null}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className={`font-bold text-sm truncate ${c.unread_count && c.unread_count > 0 ? "text-on-surface" : "text-on-surface"}`}>
                          @{c.username}
                        </span>
                        <span className="text-[10px] text-on-surface-variant/60 ml-2 flex-shrink-0">
                          {formatTime(c.created_at)}
                        </span>
                      </div>
                      <p className={`text-xs truncate leading-relaxed ${
                        c.unread_count && c.unread_count > 0
                          ? "text-on-surface font-semibold"
                          : "text-on-surface-variant"
                      }`}>
                        {c.last_message || "No messages yet"}
                      </p>
                    </div>

                    {/* Read status */}
                    <div className="flex-shrink-0">
                      {!c.unread_count || c.unread_count === 0 ? (
                        c.is_read
                          ? <CheckCheck size={14} className="text-primary/50" />
                          : <Check size={14} className="text-on-surface-variant/30" />
                      ) : null}
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
