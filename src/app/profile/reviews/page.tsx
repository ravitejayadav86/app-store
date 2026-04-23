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
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-4">
        <button onClick={() => router.back()} className="p-1">
          <ChevronLeft size={24} />
        </button>
        <h1 className="font-bold text-lg">My Reviews</h1>
      </header>

      {/* List */}
      <div className="px-4 space-y-4 pt-6 pb-24">
        {loading ? (
          <div className="py-20 flex justify-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : reviews.length > 0 ? (
          reviews.map((review) => (
            <div key={review.id} className="p-4 rounded-2xl bg-gray-50 border border-gray-100 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} size={14} className={s <= review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-200"} />
                  ))}
                </div>
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{new Date(review.created_at).toLocaleDateString()}</span>
              </div>
              <p className="text-sm font-medium text-gray-800 leading-relaxed">{review.comment}</p>
              <div className="pt-2 border-t border-gray-100 flex items-center gap-2">
                 <div className="w-6 h-6 rounded-lg bg-white flex items-center justify-center border border-gray-200 text-[10px] font-black">
                   {review.app_id}
                 </div>
                 <span className="text-xs font-bold text-gray-400">App ID: {review.app_id}</span>
              </div>
            </div>
          ))
        ) : (
          <div className="py-20 text-center text-gray-400 text-sm">
            You haven't written any reviews yet.
          </div>
        )}
      </div>
    </div>
  );
}
