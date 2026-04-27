"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, User, Search } from "lucide-react";
import api from "@/lib/api";
import { Button } from "@/components/ui/Button";

export default function FollowingPage() {
  const router = useRouter();
  const [following, setFollowing] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchFollowing = async () => {
      try {
        const res = await api.get("/social/following/me");
        setFollowing(res.data);
      } catch (err) {
        console.error("Failed to fetch following", err);
      } finally {
        setLoading(false);
      }
    };
    fetchFollowing();
  }, []);

  const filtered = following.filter(f => 
    f.username.toLowerCase().includes(search.toLowerCase()) ||
    f.full_name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-transparent">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-surface/80 backdrop-blur-xl border-b border-outline-variant px-4 py-3 flex items-center gap-4">
        <button onClick={() => router.back()} className="p-1 text-on-surface">
          <ChevronLeft size={24} />
        </button>
        <h1 className="font-bold text-lg text-on-surface">Following</h1>
      </header>

      {/* Search */}
      <div className="px-4 py-4">
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search following"
            className="w-full bg-surface-low border border-outline-variant rounded-xl pl-10 pr-4 py-2.5 text-sm text-on-surface outline-none focus:ring-2 focus:ring-primary/20 transition-all"
          />
        </div>
      </div>

      {/* List */}
      <div className="px-4 space-y-4 pb-24">
        {loading ? (
          <div className="py-20 flex justify-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length > 0 ? (
          filtered.map((user) => (
            <div key={user.id} className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-surface-low overflow-hidden flex items-center justify-center border border-outline-variant">
                  {user.avatar_url ? (
                    <img src={user.avatar_url} className="w-full h-full object-cover" />
                  ) : (
                    <User size={24} className="text-on-surface-variant/30" />
                  )}
                </div>
                <div>
                  <p className="font-bold text-sm text-on-surface">{user.username}</p>
                  <p className="text-xs text-on-surface-variant">{user.full_name || "Panda User"}</p>
                </div>
              </div>
              <Button size="xs" variant="secondary" className="px-4 bg-surface-low border-none text-on-surface">Following</Button>
            </div>
          ))
        ) : (
          <div className="py-20 text-center text-on-surface-variant/40 text-sm">
            Not following anyone yet.
          </div>
        )}
      </div>
    </div>
  );
}
