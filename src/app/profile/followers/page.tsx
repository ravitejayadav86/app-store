"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, User, UserPlus, Search } from "lucide-react";
import api from "@/lib/api";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";

export default function FollowersPage() {
  const router = useRouter();
  const [followers, setFollowers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchFollowers = async () => {
      try {
        const res = await api.get("/users/me/followers");
        setFollowers(res.data);
      } catch (err) {
        console.error("Failed to fetch followers", err);
      } finally {
        setLoading(false);
      }
    };
    fetchFollowers();
  }, []);

  const filtered = followers.filter(f => 
    f.username.toLowerCase().includes(search.toLowerCase()) ||
    f.full_name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-4">
        <button onClick={() => router.back()} className="p-1">
          <ChevronLeft size={24} />
        </button>
        <h1 className="font-bold text-lg">Followers</h1>
      </header>

      {/* Search */}
      <div className="px-4 py-4">
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search followers"
            className="w-full bg-gray-100 border-none rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all"
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
                <div className="w-12 h-12 rounded-full bg-gray-100 overflow-hidden flex items-center justify-center border border-gray-100">
                  {user.avatar_url ? (
                    <img src={user.avatar_url} className="w-full h-full object-cover" />
                  ) : (
                    <User size={24} className="text-gray-300" />
                  )}
                </div>
                <div>
                  <p className="font-bold text-sm">{user.username}</p>
                  <p className="text-xs text-gray-500">{user.full_name || "Panda User"}</p>
                </div>
              </div>
              <Button size="xs" variant="secondary" className="px-4">Follow</Button>
            </div>
          ))
        ) : (
          <div className="py-20 text-center text-gray-400 text-sm">
            No followers found.
          </div>
        )}
      </div>
    </div>
  );
}
