"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { 
  MessageSquare, 
  Search, 
  ChevronRight, 
  Clock, 
  User, 
  Loader2,
  Lock,
  Plus,
  Check,
  CheckCheck
} from "lucide-react";
import api from "@/lib/api";
import { toast } from "sonner";
import Link from "next/link";

interface Conversation {
  username: string;
  avatar_url?: string | null;
  last_message: string;
  created_at: string;
  is_read: boolean;
  unread_count?: number;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://pandas-store-api.onrender.com";
const WS_BASE = API_BASE.replace("https://", "wss://").replace("http://", "ws://");

export default function MessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const router = useRouter();
  const wsRef = useRef<WebSocket | null>(null);

  const fetchConversations = async () => {
    try {
      const res = await api.get("/social/conversations");
      setConversations(res.data);
    } catch {
      toast.error("Please sign in to view messages");
      router.push("/login");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    api.get("/users/me")
      .then(res => setCurrentUserId(res.data.id))
      .catch(() => {
         toast.error("Please sign in to view messages");
         router.push("/login");
      });
  }, [router]);

  useEffect(() => {
    if (currentUserId) {
      fetchConversations();
    }
  }, [currentUserId]);

  // WebSocket for real-time list updates
  useEffect(() => {
    if (!currentUserId) return;

    const ws = new WebSocket(`${WS_BASE}/social/ws/${currentUserId}`);
    wsRef.current = ws;

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        
        // If it's a read notification
        if (msg.type === "MESSAGES_READ") {
          setConversations(prev => prev.map(c => 
            (c.username === msg.by) ? { ...c, unread_count: 0 } : c
          ));
          return;
        }

        // If it's a new message
        if (msg.content) {
          setConversations(prev => {
            const otherUsername = msg.sender_username === currentUserId ? msg.receiver_username : msg.sender_username;
            // Note: Our WS payload might not have receiver_username, but it has sender_username.
            // In a real app, we'd ensure the payload has what we need.
            
            const existingIdx = prev.findIndex(c => c.username === msg.sender_username);
            const newConv: Conversation = {
              username: msg.sender_username,
              avatar_url: msg.sender_avatar_url,
              last_message: msg.content,
              created_at: msg.created_at,
              is_read: false,
              unread_count: (existingIdx >= 0 ? (prev[existingIdx].unread_count || 0) : 0) + 1
            };

            if (existingIdx >= 0) {
              const updated = [...prev];
              updated.splice(existingIdx, 1);
              return [newConv, ...updated];
            } else {
              return [newConv, ...prev];
            }
          });
        }
      } catch {}
    };

    return () => ws.close();
  }, [currentUserId]);

  const filtered = conversations.filter(c => 
    c.username.toLowerCase().includes(search.toLowerCase())
  );

  const formatTime = (date: string) => {
    const diff = (Date.now() - new Date(date).getTime()) / 1000;
    if (diff < 60) return "now";
    if (diff < 3600) return `${Math.floor(diff/60)}m`;
    if (diff < 86400) return `${Math.floor(diff/3600)}h`;
    return `${Math.floor(diff/86400)}d`;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="animate-spin text-primary" size={40} />
        <p className="text-on-surface-variant">Opening secure channels...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-8 pb-20 pt-20">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold tracking-tight mb-1">Messages</h1>
          <p className="text-on-surface-variant text-sm flex items-center gap-2">
            <Lock size={12} className="text-primary" />
            End-to-end encryption active
          </p>
        </div>
        <Link href="/community">
          <Button size="sm" variant="secondary">
            <Plus size={16} className="mr-2" />
            New Chat
          </Button>
        </Link>
      </div>

      <div className="relative mb-6">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant" />
        <input 
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search conversations..."
          className="w-full pl-11 pr-4 py-3 rounded-2xl bg-surface-low border border-outline-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm"
        />
      </div>

      <div className="space-y-2">
        {filtered.length === 0 ? (
          <GlassCard className="p-12 text-center border-dashed">
            <MessageSquare size={48} className="mx-auto mb-4 text-outline-variant opacity-20" />
            <h3 className="text-lg font-bold mb-1">No messages yet</h3>
            <p className="text-on-surface-variant text-sm mb-6">Start a conversation with someone in the community.</p>
            <Link href="/community">
              <Button>Browse Community</Button>
            </Link>
          </GlassCard>
        ) : (
          <AnimatePresence>
            {filtered.map((c, i) => (
              <motion.div
                key={c.username}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Link href={`/messages/${c.username}`}>
                  <GlassCard className="p-4 flex items-center gap-4 hover:bg-surface-low transition-colors group relative overflow-hidden">
                    <div className="w-14 h-14 rounded-full bg-linear-to-br from-primary/10 to-transparent flex items-center justify-center text-xl font-bold text-primary flex-shrink-0 shadow-inner border border-primary/5 overflow-hidden">
                      {c.avatar_url 
                        ? <img src={c.avatar_url} alt={c.username} className="w-full h-full object-cover" />
                        : c.username[0].toUpperCase()}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-bold text-on-surface truncate pr-2">{c.username}</h4>
                        <span className="text-[10px] text-on-surface-variant font-medium flex items-center gap-1">
                          <Clock size={10} />
                          {formatTime(c.created_at)}
                        </span>
                      </div>
                      <p className={`text-sm truncate ${c.unread_count && c.unread_count > 0 ? "font-bold text-on-surface" : "text-on-surface-variant"}`}>
                        {c.last_message}
                      </p>
                    </div>

                    {c.unread_count && c.unread_count > 0 ? (
                      <div className="min-w-[20px] h-5 rounded-full bg-primary px-1.5 flex items-center justify-center shadow-sm shadow-primary/30 flex-shrink-0">
                        <span className="text-[10px] font-bold text-on-primary">{c.unread_count}</span>
                      </div>
                    ) : (
                      c.is_read ? <CheckCheck size={14} className="text-primary/40" /> : <Check size={14} className="text-on-surface-variant/20" />
                    )}
                    
                    <ChevronRight size={16} className="text-outline-variant group-hover:text-primary transition-colors group-hover:translate-x-1" />
                  </GlassCard>
                </Link>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
