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
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-4">
        <button onClick={() => router.back()} className="p-1">
          <ChevronLeft size={24} />
        </button>
        <h1 className="font-bold text-lg">Follow Requests</h1>
      </header>

      {/* Search */}
      <div className="px-4 py-4">
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search requests"
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
              <div className="flex items-center gap-3 cursor-pointer" onClick={() => router.push(`/users/${user.username}`)}>
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
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => handleAccept(user.id, user.username)}
                  className="w-9 h-9 flex items-center justify-center bg-primary text-white rounded-full shadow-sm hover:scale-105 transition-transform"
                >
                  <Check size={18} />
                </button>
                <button 
                   onClick={() => handleDecline(user.id, user.username)}
                   className="w-9 h-9 flex items-center justify-center bg-gray-100 text-gray-500 rounded-full shadow-sm hover:scale-105 transition-transform"
                >
                  <X size={18} />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="py-20 text-center text-gray-400 text-sm">
            No pending follow requests.
          </div>
        )}
      </div>
    </div>
  );
}
