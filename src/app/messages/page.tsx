"use client";

import React, { useEffect, useState } from "react";
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
  Plus
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
}

export default function MessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const router = useRouter();

  useEffect(() => {
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
    fetchConversations();
  }, [router]);

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
    <div className="max-w-4xl mx-auto px-4 md:px-8 pb-20 pt-10">
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
                      <p className={`text-sm truncate ${!c.is_read ? "font-bold text-on-surface" : "text-on-surface-variant"}`}>
                        {c.last_message}
                      </p>
                    </div>

                    {!c.is_read && (
                      <div className="w-2.5 h-2.5 rounded-full bg-primary shadow-sm shadow-primary/50 flex-shrink-0" />
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
