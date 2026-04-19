"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { GlassCard } from "@/components/ui/GlassCard";
import { MessageCircle, Search } from "lucide-react";
import api from "@/lib/api";
import { toast } from "sonner";

interface Conversation {
  username: string;
  last_message: string;
  created_at: string;
  is_read: boolean;
}

export default function MessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    api.get("/social/conversations")
      .then(res => setConversations(res.data))
      .catch(() => toast.error("Please sign in to view messages"))
      .finally(() => setLoading(false));
  }, []);

  const timeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h`;
    return `${Math.floor(hrs / 24)}d`;
  };

  const filtered = conversations.filter(c =>
    c.username.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-2xl mx-auto px-4 pt-28 pb-20">
      <h1 className="text-2xl font-bold text-on-surface mb-6">Messages</h1>

      <div className="relative mb-4">
        <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search conversations..."
          className="w-full pl-11 pr-4 py-3 rounded-2xl bg-surface-low border border-outline-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
        />
      </div>

      {loading ? (
        <div className="text-center py-10 text-on-surface-variant text-sm">Loading...</div>
      ) : filtered.length === 0 ? (
        <GlassCard className="p-12 text-center">
          <MessageCircle size={40} className="mx-auto mb-3 text-on-surface-variant opacity-30" />
          <p className="font-bold text-on-surface mb-1">No messages yet</p>
          <p className="text-sm text-on-surface-variant">Find users and start a conversation!</p>
        </GlassCard>
      ) : (
        <div className="space-y-1">
          {filtered.map((conv, i) => (
            <Link key={i} href={`/messages/${conv.username}`}>
              <div className="flex items-center gap-4 p-4 rounded-2xl hover:bg-surface-low transition-colors cursor-pointer">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-lg font-bold text-primary flex-shrink-0">
                  {conv.username[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <p className="font-bold text-sm text-on-surface">{conv.username}</p>
                    <p className="text-xs text-on-surface-variant">{timeAgo(conv.created_at)}</p>
                  </div>
                  <p className="text-xs text-on-surface-variant truncate">{conv.last_message}</p>
                </div>
                {!conv.is_read && (
                  <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}