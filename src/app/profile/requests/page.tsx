"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, User, Check, X, Search } from "lucide-react";
import api from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { toast } from "sonner";

export default function FollowRequestsPage() {
  const router = useRouter();
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchRequests = async () => {
    try {
      const res = await api.get("/social/requests/pending");
      setRequests(res.data);
    } catch (err) {
      console.error("Failed to fetch requests", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleAccept = async (followerId: number, username: string) => {
    try {
      await api.post(`/social/follow/accept/${followerId}`);
      toast.success(`Accepted @${username}'s request`);
      setRequests(prev => prev.filter(r => r.id !== followerId));
    } catch {
      toast.error("Failed to accept request");
    }
  };

  const handleDecline = async (followerId: number, username: string) => {
    try {
      // In social.py, toggle_follow handles unfollowing too.
      // But we need a specific 'decline' or just 'unfollow' from the follower side.
      // Actually, deleting the Follow record is enough.
      // For now, let's just toggle follow from the follower side if we have that logic.
      // Alternatively, we can just call toggle_follow with the follower's username.
      await api.post(`/social/follow/${username}`); 
      toast.info(`Declined @${username}'s request`);
      setRequests(prev => prev.filter(r => r.id !== followerId));
    } catch {
      toast.error("Failed to decline request");
    }
  };

  const filtered = requests.filter(f => 
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
        <h1 className="font-bold text-lg text-on-surface">Follow Requests</h1>
      </header>

      {/* Search */}
      <div className="px-4 py-4">
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search requests"
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
              <div className="flex items-center gap-3 cursor-pointer" onClick={() => router.push(`/users/${user.username}`)}>
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
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => handleAccept(user.id, user.username)}
                  className="w-9 h-9 flex items-center justify-center bg-primary text-white rounded-full shadow-sm hover:scale-105 transition-transform"
                >
                  <Check size={18} />
                </button>
                <button 
                   onClick={() => handleDecline(user.id, user.username)}
                   className="w-9 h-9 flex items-center justify-center bg-surface-low text-on-surface-variant rounded-full shadow-sm hover:scale-105 transition-transform border border-outline-variant"
                >
                  <X size={18} />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="py-20 text-center text-on-surface-variant/40 text-sm">
            No pending follow requests.
          </div>
        )}
      </div>
    </div>
  );
}
