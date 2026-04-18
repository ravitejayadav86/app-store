"use client";

import React, { useEffect, useState, useCallback, Suspense } from "react";
import { useParams, useRouter } from "next/navigation";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import {
  ArrowLeft, Download, Star, ShieldCheck, Gamepad2, Code2,
  Music, BookOpen, Loader2, Send, User, Calendar
} from "lucide-react";
import api from "@/lib/api";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

interface AppData {
  id: number;
  name: string;
  description: string;
  category: string;
  developer: string;
  price: number;
  version: string;
  created_at: string;
  file_path: string | null;
}

interface Review {
  id: number;
  user_id: number;
  app_id: number;
  rating: number;
  comment: string | null;
  created_at: string;
}

interface ApiError {
  response?: { data?: { detail?: string } };
}

function getCategoryIcon(category: string) {
  switch (category?.toLowerCase()) {
    case "games": return <Gamepad2 size={64} className="text-primary" />;
    case "music": return <Music size={64} className="text-primary" />;
    case "books": return <BookOpen size={64} className="text-primary" />;
    default: return <Code2 size={64} className="text-primary" />;
  }
}

function getCategoryGradient(category: string) {
  switch (category?.toLowerCase()) {
    case "games": return "from-emerald-900/60 to-background";
    case "music": return "from-pink-900/60 to-background";
    case "books": return "from-purple-900/60 to-background";
    default: return "from-blue-900/60 to-background";
  }
}

function StarRating({ value, onChange }: { value: number; onChange?: (v: number) => void }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange?.(star)}
          onMouseEnter={() => onChange && setHovered(star)}
          onMouseLeave={() => onChange && setHovered(0)}
          className={`transition-transform ${onChange ? "cursor-pointer hover:scale-110" : "cursor-default"}`}
        >
          <Star
            size={onChange ? 28 : 16}
            className={
              star <= (hovered || value)
                ? "fill-yellow-400 text-yellow-400"
                : "text-outline-variant"
            }
          />
        </button>
      ))}
    </div>
  );
}

function AppDetailContent() {
  const params = useParams();
  const router = useRouter();
  const [app, setApp] = useState<AppData | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [myRating, setMyRating] = useState(0);
  const [myComment, setMyComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  const fetchReviews = useCallback(async (appId: number) => {
    try {
      const res = await api.get(`/reviews/${appId}`);
      setReviews(res.data);
    } catch {
      // Reviews are optional
    }
  }, []);

  useEffect(() => {
    const fetchApp = async () => {
      try {
        const res = await api.get(`/apps/${params.id}`);
        setApp(res.data);
        fetchReviews(res.data.id);
      } catch {
        toast.error("App not found");
        router.push("/");
      } finally {
        setLoading(false);
      }
    };
    if (params.id) fetchApp();
  }, [params.id, router, fetchReviews]);

  const handleDownload = async () => {
    if (!app) return;

    // Check if a file has actually been uploaded
    if (!app.file_path) {
      toast.info(`"${app.name}" has no file uploaded by the publisher yet.`);
      return;
    }

    setDownloading(true);
    try {
      const res = await api.get(`/apps/${app.id}/download`, { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", app.name);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success("Download started!");
    } catch (err: unknown) {
      const error = err as ApiError;
      toast.error(error.response?.data?.detail || "Download failed.");
    } finally {
      setDownloading(false);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!app || myRating === 0) return toast.error("Please select a star rating.");
    setSubmittingReview(true);
    try {
      await api.post(`/reviews/${app.id}`, { rating: myRating, comment: myComment });
      toast.success("Review submitted!");
      setMyRating(0);
      setMyComment("");
      fetchReviews(app.id);
    } catch (err: unknown) {
      const error = err as ApiError;
      toast.error(error.response?.data?.detail || "Failed to submit review. Please sign in first.");
    } finally {
      setSubmittingReview(false);
    }
  };

  const avgRating = reviews.length
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={48} />
      </div>
    );
  }

  if (!app) return null;

  return (
    <div className="max-w-5xl mx-auto px-4 pt-32 pb-20">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors mb-8"
      >
        <ArrowLeft size={20} /> Back to Store
      </button>

      <GlassCard className="relative overflow-hidden mb-8">
        <div className={`absolute inset-0 bg-gradient-to-br ${getCategoryGradient(app.category)} pointer-events-none`} />
        <div className="relative z-10 p-8 md:p-12">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            <div className="w-32 h-32 rounded-3xl bg-gradient-to-br from-surface-low to-background flex items-center justify-center border border-outline-variant shadow-2xl shrink-0">
              {getCategoryIcon(app.category)}
            </div>
            <div className="flex-1 space-y-4">
              <div>
                <h1 className="text-4xl font-bold text-on-surface mb-1">{app.name}</h1>
                <p className="text-lg text-primary font-medium">{app.developer}</p>
              </div>
              <div className="flex flex-wrap gap-3 text-sm font-medium text-on-surface-variant">
                <span className="flex items-center gap-1.5">
                  <Star size={16} className="fill-yellow-400 text-yellow-400" />
                  {avgRating ?? "No ratings yet"}
                  {avgRating && <span className="text-xs">({reviews.length})</span>}
                </span>
                <span className="px-3 py-1 bg-surface-low rounded-full border border-outline-variant/30">{app.category}</span>
                <span className="px-3 py-1 bg-surface-low rounded-full border border-outline-variant/30">v{app.version}</span>
                <span className="px-3 py-1 bg-surface-low rounded-full border border-outline-variant/30 flex items-center gap-1">
                  <Calendar size={12} />
                  {new Date(app.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
            <div className="w-full md:w-auto shrink-0 flex flex-col gap-3">
              <Button
                size="lg"
                className={`w-full md:w-48 py-6 text-lg shadow-xl ${!app.file_path ? "opacity-60 cursor-not-allowed" : "shadow-primary/25"}`}
                onClick={handleDownload}
                disabled={downloading}
              >
                <Download size={20} className="mr-2" />
                {downloading
                  ? "Downloading..."
                  : !app.file_path
                  ? "Not Available"
                  : app.price === 0
                  ? "Free Download"
                  : `Buy $${app.price}`}
              </Button>
              <p className="text-xs text-center text-on-surface-variant flex items-center justify-center gap-1">
                <ShieldCheck size={14} className="text-green-500" /> Verified Safe
              </p>
            </div>
          </div>
          <div className="mt-10 pt-10 border-t border-outline-variant/50">
            <h2 className="text-xl font-bold mb-3">
              About this {app.category === "Games" ? "game" : app.category?.toLowerCase() || "app"}
            </h2>
            <p className="text-on-surface-variant leading-relaxed whitespace-pre-wrap">{app.description}</p>
          </div>
        </div>
      </GlassCard>

      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-on-surface">Ratings &amp; Reviews</h2>
        <GlassCard className="p-6 space-y-4">
          <h3 className="font-bold text-on-surface">Write a Review</h3>
          <form onSubmit={handleSubmitReview} className="space-y-4">
            <StarRating value={myRating} onChange={setMyRating} />
            <textarea
              value={myComment}
              onChange={(e) => setMyComment(e.target.value)}
              placeholder="Share your experience (optional)..."
              rows={3}
              className="w-full px-4 py-3 rounded-2xl glass border border-outline-variant focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium resize-none"
            />
            <Button type="submit" disabled={submittingReview || myRating === 0} className="flex items-center gap-2">
              <Send size={16} />
              {submittingReview ? "Submitting..." : "Submit Review"}
            </Button>
          </form>
        </GlassCard>

        <AnimatePresence>
          {reviews.length === 0 ? (
            <GlassCard className="p-8 text-center text-on-surface-variant">
              <Star size={32} className="mx-auto mb-3 opacity-30" />
              <p className="font-medium">No reviews yet. Be the first to review!</p>
            </GlassCard>
          ) : (
            <div className="space-y-4">
              {reviews.map((review, i) => (
                <motion.div
                  key={review.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <GlassCard className="p-5 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-on-surface-variant text-sm">
                        <User size={14} />
                        <span className="font-medium">User #{review.user_id}</span>
                      </div>
                      <StarRating value={review.rating} />
                    </div>
                    {review.comment && (
                      <p className="text-on-surface-variant text-sm leading-relaxed">{review.comment}</p>
                    )}
                    <p className="text-xs text-on-surface-variant/60">
                      {new Date(review.created_at).toLocaleDateString()}
                    </p>
                  </GlassCard>
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function AppDetails() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={48} />
      </div>
    }>
      <AppDetailContent />
    </Suspense>
  );
}
