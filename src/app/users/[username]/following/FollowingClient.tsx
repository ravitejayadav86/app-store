"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ChevronLeft, User, Search, UserMinus } from "lucide-react";
import api from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui/GlassCard";
import Image from "next/image";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://pandas-store-api.onrender.com";

export default function FollowingClient({ username: propUsername }: { username?: string }) {
  const params = useParams();
  const username = propUsername || params.username as string;
  const router = useRouter();
  const [following, setFollowing] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchFollowing = async () => {
      try {
        const res = await api.get(`/social/following/${username}`);
        setFollowing(res.data);
      } catch (err) {
        console.error("Failed to fetch following", err);
      } finally {
        setLoading(false);
      }
    };
    fetchFollowing();
  }, [username]);

  const filtered = following.filter(f => 
    f.username.toLowerCase().includes(search.toLowerCase()) ||
    f.full_name?.toLowerCase().includes(search.toLowerCase())
  );

  const resolveMediaUrl = (url: string | null | undefined) => {
    if (!url) return "";
    if (url.startsWith("http") || url.startsWith("blob:") || url.startsWith("data:")) return url;
    return `${API_BASE}${url}`;
  };

  return (
    <div className="min-h-screen bg-surface">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-surface/80 backdrop-blur-xl border-b border-outline-variant px-4 py-4 flex items-center gap-4">
        <button onClick={() => router.back()} className="p-2 hover:bg-surface-low rounded-xl transition-colors">
          <ChevronLeft size={24} className="text-on-surface" />
        </button>
        <div>
          <h1 className="font-black text-xl text-on-surface">Following</h1>
          <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">@{username}</p>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Search */}
        <div className="mb-8">
          <div className="relative group">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-primary transition-colors" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search following..."
              className="w-full bg-surface-low border border-outline-variant rounded-2xl pl-12 pr-4 py-3.5 text-sm font-bold outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary/30 transition-all shadow-sm"
            />
          </div>
        </div>

        {/* List */}
        <div className="space-y-3 pb-24">
          {loading ? (
            <div className="py-20 flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="text-xs font-black uppercase tracking-widest text-on-surface-variant animate-pulse">Checking connections...</p>
            </div>
          ) : filtered.length > 0 ? (
            filtered.map((user) => (
              <GlassCard 
                key={user.id} 
                className="p-4 flex items-center justify-between gap-4 cursor-pointer hover:bg-surface-lowest transition-all group border-outline-variant/30" 
                onClick={() => router.push(`/users/${user.username}`)}
              >
                <div className="flex items-center gap-4">
                  <div className="relative w-14 h-14 rounded-2xl bg-surface-low overflow-hidden flex items-center justify-center border border-outline-variant group-hover:scale-105 transition-transform">
                    {user.avatar_url ? (
                      <Image src={resolveMediaUrl(user.avatar_url)} alt={user.username} fill className="object-cover" sizes="56px" />
                    ) : (
                      <div className="w-full h-full bg-primary/10 flex items-center justify-center text-primary font-black text-xl">
                        {user.username[0].toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="font-black text-on-surface text-base group-hover:text-primary transition-colors">@{user.username}</p>
                    <p className="text-xs font-bold text-on-surface-variant">{user.full_name || "Panda Explorer"}</p>
                  </div>
                </div>
                <Button size="sm" variant="secondary" className="rounded-xl px-6 font-black text-[10px] uppercase tracking-widest shadow-sm">View</Button>
              </GlassCard>
            ))
          ) : (
            <div className="py-24 text-center">
              <div className="w-20 h-20 bg-surface-low rounded-[2.5rem] flex items-center justify-center mx-auto mb-6 border border-outline-variant/30 shadow-inner">
                <UserMinus size={32} className="text-on-surface-variant/20" />
              </div>
              <p className="text-sm font-bold text-on-surface-variant">Not following anyone yet.</p>
              <p className="text-[10px] font-black uppercase tracking-widest text-primary mt-2">Explore to find connections</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
