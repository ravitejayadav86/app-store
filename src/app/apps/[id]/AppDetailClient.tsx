"use client";

import React, { useEffect, useState, useCallback, Suspense } from "react";
import { useParams, useRouter } from "next/navigation";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import {
  ArrowLeft, Download, Star, ShieldCheck, Gamepad2, Code2,
  Music, BookOpen, Loader2, Send, User, Calendar, Bell, Clock, Info,
  Sparkles, Database, Cloud, Briefcase, CloudUpload, X
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
  icon_url?: string | null;
  screenshot_urls?: string | null;
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
    case "games": return <Gamepad2 size={64} className="text-emerald-500" />;
    case "music": return <Music size={64} className="text-pink-500" />;
    case "books": return <BookOpen size={64} className="text-purple-500" />;
    case "productivity": return <Briefcase size={64} className="text-blue-500" />;
    case "development": return <Database size={64} className="text-yellow-500" />;
    case "utilities": return <Cloud size={64} className="text-cyan-500" />;
    case "graphics": return <Sparkles size={64} className="text-orange-500" />;
    default: return <Code2 size={64} className="text-primary" />;
  }
}

function getCategoryGradient(category: string) {
  switch (category?.toLowerCase()) {
    case "games": return "from-emerald-950/40 via-emerald-900/10 to-background";
    case "music": return "from-pink-950/40 via-pink-900/10 to-background";
    case "books": return "from-purple-950/40 via-purple-900/10 to-background";
    case "productivity": return "from-blue-950/40 via-blue-900/10 to-background";
    case "development": return "from-yellow-950/40 via-yellow-900/10 to-background";
    case "graphics": return "from-orange-950/40 via-orange-900/10 to-background";
    default: return "from-primary-dim/20 via-surface-lowest/40 to-background";
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

    if (!app.file_path) {
      // Trigger a real nudge in the backend
      try {
        await api.post(`/apps/${app.id}/nudge`);
      } catch (err) {
        console.error("Failed to send nudge", err);
      }

      toast.custom((id) => (
        <div className="flex items-center gap-3 p-4 bg-primary text-on-primary rounded-2xl shadow-2xl shadow-primary/20 border border-primary/20 animate-in fade-in slide-in-from-bottom-5">
          <CloudUpload className="animate-bounce shrink-0" size={24} />
          <div className="flex-1">
            <p className="text-sm font-bold tracking-tight">Coming Soon!</p>
            <p className="text-[11px] opacity-90 leading-tight mt-0.5">
              "{app.name}" hasn't released a file yet. We've sent a real nudge to the publisher!
            </p>
          </div>
          <button onClick={() => toast.dismiss(id)} className="p-1 hover:bg-white/10 rounded-lg transition-colors">
            <X size={16} />
          </button>
        </div>
      ), { duration: 5000 });
      return;
    }

    setDownloading(true);
    try {
      // Use native browser navigation to bypass CORS issues on redirects
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "https://pandas-store-api.onrender.com";
      const downloadUrl = `${baseUrl}/apps/${app.id}/download`;
      
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.target = "_blank";
      link.setAttribute("download", app.name);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast.success("Download started!");
    } catch (err: unknown) {
      toast.error("Download failed.");
    } finally {
      setTimeout(() => setDownloading(false), 1000);
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
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <motion.div
           initial={{ opacity: 0, scale: 0.9 }}
           animate={{ opacity: 1, scale: 1 }}
           className="bg-white/50 backdrop-blur-xl p-8 rounded-[2.5rem] shadow-2xl flex flex-col items-center gap-4"
        >
          <Loader2 className="animate-spin text-primary" size={40} />
          <p className="text-sm font-medium text-on-surface-variant">Gathering app details...</p>
        </motion.div>
      </div>
    );
  }

  if (!app) return null;

  return (
    <div className="min-h-screen bg-surface selection:bg-primary/10 pb-32">
      {/* Background decoration */}
      <div className={`fixed inset-0 bg-linear-to-b ${getCategoryGradient(app.category)} opacity-30 pointer-events-none`} />
      
      <div className="relative z-10 max-w-4xl mx-auto px-5 pt-20">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="mb-8 p-3 rounded-full bg-surface-lowest/50 backdrop-blur-xl border border-white/20 hover:scale-110 transition-transform active:scale-95"
        >
          <ArrowLeft size={20} className="text-on-surface" />
        </button>

        {/* Play Store Style Header */}
        <div className="flex flex-col sm:flex-row gap-6 sm:gap-8 items-start mb-10">
          {/* App Icon */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-24 h-24 sm:w-32 sm:h-32 rounded-[1.5rem] sm:rounded-[2rem] overflow-hidden liquid-glass border-white/40 shadow-2xl shrink-0"
          >
            {app.icon_url ? (
              <img src={app.icon_url} alt={app.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-surface-low text-primary">
                {getCategoryIcon(app.category)}
              </div>
            )}
          </motion.div>

          {/* App Info */}
          <div className="flex-1 space-y-2">
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-on-surface leading-tight">
              {app.name}
            </h1>
            <p className="text-lg font-bold text-primary opacity-90">
              {app.developer}
            </p>
            <p className="text-sm font-bold text-on-surface-variant opacity-60 flex items-center gap-2">
              {app.category} • Contains ads
            </p>
          </div>
        </div>

        {/* Quick Stats Bar (Play Store Style) */}
        <div className="flex overflow-x-auto no-scrollbar gap-8 pb-8 mb-8 border-b border-white/10">
          <div className="flex flex-col items-center min-w-[80px] shrink-0">
            <div className="flex items-center gap-1 font-black text-on-surface mb-1 text-lg">
              {avgRating ?? "0.0"} <Star size={14} className="fill-current text-primary" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Reviews</span>
          </div>
          <div className="w-px h-8 bg-white/10 self-center" />
          <div className="flex flex-col items-center min-w-[80px] shrink-0">
            <div className="font-black text-on-surface mb-1 text-lg">
              5K+
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Downloads</span>
          </div>
          <div className="w-px h-8 bg-white/10 self-center" />
          <div className="flex flex-col items-center min-w-[80px] shrink-0">
            <div className="p-1 rounded-sm border border-on-surface/20 text-[10px] font-black mb-1">
              3+
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Rated for 3+</span>
          </div>
          <div className="w-px h-8 bg-white/10 self-center" />
          <div className="flex flex-col items-center min-w-[80px] shrink-0">
             <div className="font-black text-on-surface mb-1 text-lg">
                Small
             </div>
             <span className="text-[10px] font-black uppercase tracking-widest opacity-40">App Size</span>
          </div>
        </div>

        {/* Main Action Button */}
        <Button
          size="lg"
          onClick={() => {
            if (!app.file_path) {
              handleDownload();
              return;
            }
            if (app.price > 0) {
              router.push(`/checkout?appId=${app.id}`);
            } else {
              handleDownload();
            }
          }}
          disabled={downloading}
          className="w-full h-14 sm:h-12 rounded-xl sm:rounded-full bg-primary text-on-primary font-black text-lg mb-12 shadow-xl shadow-primary/20 active:scale-95 transition-all"
        >
          {downloading ? (
            <Loader2 className="animate-spin mr-3" size={20} />
          ) : !app.file_path ? (
            <Bell size={20} className="mr-3" />
          ) : (
            <Download size={20} className="mr-3" />
          )}
          {downloading
            ? "Installing..."
            : !app.file_path
            ? "Notify Me"
            : app.price === 0
            ? "Install"
            : `Buy for $${app.price}`}
        </Button>

        {/* Screenshots Section */}
        {app.screenshot_urls && JSON.parse(app.screenshot_urls).length > 0 && (
          <div className="mb-12">
            <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar -mx-5 px-5">
              {JSON.parse(app.screenshot_urls).map((url: string, i: number) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="shrink-0 w-44 sm:w-64 aspect-[9/16] rounded-2xl overflow-hidden liquid-glass border-white/20 shadow-lg"
                >
                  <img src={url} alt={`Screenshot ${i + 1}`} className="w-full h-full object-cover" />
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* About Section */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-black text-on-surface">About this {app.category === "Games" ? "game" : "app"}</h2>
            <button className="text-primary font-bold text-sm"><ArrowLeft size={16} className="rotate-180 inline ml-1" /></button>
          </div>
          <p className="text-on-surface-variant leading-relaxed line-clamp-3 font-medium opacity-80">
            {app.description || "Explore this amazing addition to our store. Carefully crafted for the best user experience."}
          </p>
          
          <div className="mt-6 flex flex-wrap gap-2">
            <span className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-xs font-black text-on-surface-variant">#TopChoice</span>
            <span className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-xs font-black text-on-surface-variant">#{app.category}</span>
          </div>
        </section>

        {/* Ratings Section */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-black text-on-surface">Ratings and reviews</h2>
            <button className="text-primary font-bold text-sm"><ArrowLeft size={16} className="rotate-180 inline ml-1" /></button>
          </div>
          
          <div className="flex items-center gap-10 mb-8">
            <div className="text-center">
              <div className="text-5xl font-black text-on-surface mb-2">{avgRating ?? "0.0"}</div>
              <StarRating value={Number(avgRating) || 0} />
              <div className="text-[11px] font-black opacity-40 mt-2 uppercase tracking-widest">{reviews.length} reviews</div>
            </div>
            
            <div className="flex-1 space-y-2">
              {[5, 4, 3, 2, 1].map((star) => (
                <div key={star} className="flex items-center gap-4">
                  <span className="text-xs font-black opacity-60 w-2">{star}</span>
                  <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${(reviews.filter(r => r.rating === star).length / (reviews.length || 1)) * 100}%` }}
                      className="h-full bg-primary rounded-full" 
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            {reviews.slice(0, 3).map((review, i) => (
              <div key={review.id} className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-black text-xs">
                      {review.user_id}
                    </div>
                    <span className="text-sm font-black text-on-surface">User #{review.user_id}</span>
                  </div>
                  <StarRating value={review.rating} />
                </div>
                <p className="text-sm text-on-surface-variant font-medium opacity-80 leading-relaxed">
                  {review.comment}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Write Review Section */}
        <section className="p-8 rounded-[2rem] liquid-glass border-white/20 shadow-2xl">
          <h3 className="text-xl font-black text-on-surface mb-6">Rate this {app.category === "Games" ? "game" : "app"}</h3>
          <form onSubmit={handleSubmitReview} className="space-y-6">
            <div className="flex flex-col items-center gap-4 py-4">
              <StarRating value={myRating} onChange={setMyRating} />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">Tap your rating</span>
            </div>
            <textarea
              value={myComment}
              onChange={(e) => setMyComment(e.target.value)}
              placeholder="Describe your experience (optional)"
              rows={4}
              className="w-full px-5 py-4 rounded-2xl bg-white/5 border border-white/10 focus:border-primary/50 transition-all font-medium text-sm outline-none resize-none"
            />
            <Button 
              type="submit" 
              disabled={submittingReview || myRating === 0} 
              className="w-full h-12 rounded-xl font-black"
            >
              {submittingReview ? <Loader2 className="animate-spin" size={20} /> : "Post Review"}
            </Button>
          </form>
        </section>
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
