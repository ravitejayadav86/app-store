"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Star, Search, MessageSquare } from "lucide-react";
import api from "@/lib/api";

export default function MyReviewsPage() {
  const router = useRouter();
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await api.get("/reviews/me");
        setReviews(res.data);
      } catch (err) {
        console.error("Failed to fetch reviews", err);
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, []);

  return (
    <div className="min-h-screen bg-transparent">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-surface/80 backdrop-blur-xl border-b border-outline-variant px-4 py-3 flex items-center gap-4">
        <button onClick={() => router.back()} className="p-1 text-on-surface">
          <ChevronLeft size={24} />
        </button>
        <h1 className="font-bold text-lg text-on-surface">My Reviews</h1>
      </header>

      {/* List */}
      <div className="px-4 space-y-4 pt-6 pb-24">
        {loading ? (
          <div className="py-20 flex justify-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : reviews.length > 0 ? (
          reviews.map((review) => (
            <div key={review.id} className="p-4 rounded-2xl bg-surface-low border border-outline-variant/30 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} size={14} className={s <= review.rating ? "fill-yellow-400 text-yellow-400" : "text-on-surface-variant/20"} />
                  ))}
                </div>
                <span className="text-[10px] text-on-surface-variant/40 font-bold uppercase tracking-widest">{new Date(review.created_at).toLocaleDateString()}</span>
              </div>
              <p className="text-sm font-medium text-on-surface leading-relaxed">{review.comment}</p>
              <div className="pt-2 border-t border-outline-variant/20 flex items-center gap-2">
                 <div className="w-6 h-6 rounded-lg bg-surface flex items-center justify-center border border-outline-variant/30 text-[10px] font-black text-on-surface-variant">
                   {review.app_id}
                 </div>
                 <span className="text-xs font-bold text-on-surface-variant/40">App ID: {review.app_id}</span>
              </div>
            </div>
          ))
        ) : (
          <div className="py-20 text-center text-on-surface-variant/40 text-sm">
            You haven't written any reviews yet.
          </div>
        )}
      </div>
    </div>
  );
}
