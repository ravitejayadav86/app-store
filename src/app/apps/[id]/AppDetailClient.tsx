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
    <div className="min-h-screen bg-surface selection:bg-primary/10">
      {/* Dynamic Background Glow */}
      <div className={`fixed inset-0 bg-linear-to-b ${getCategoryGradient(app.category)} opacity-30 pointer-events-none`} />
      
      <div className="relative z-10 max-w-4xl mx-auto px-6 pt-32 pb-24">
        {/* Navigation */}
        <motion.button
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => router.back()}
          className="group flex items-center gap-2 text-on-surface-variant hover:text-primary transition-all mb-10 text-sm font-medium"
        >
          <div className="p-2 rounded-full group-hover:bg-primary/10 transition-colors">
            <ArrowLeft size={18} />
          </div>
          Back to Store
        </motion.button>

        {/* Hero Section */}
        <div className="flex flex-col md:flex-row gap-10 items-center md:items-start mb-16">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative group"
          >
            <div className="absolute inset-0 bg-primary/20 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative w-40 h-40 md:w-48 md:h-48 rounded-[2.5rem] bg-surface-lowest flex items-center justify-center shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-outline-variant/30 overflow-hidden">
              <div className="absolute inset-0 bg-linear-to-br from-white/40 to-transparent pointer-events-none" />
              {app.icon_url ? (
                <img src={app.icon_url} alt={app.name} className="w-full h-full object-cover" />
              ) : (
                getCategoryIcon(app.category)
              )}
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex-1 text-center md:text-left space-y-6 w-full"
          >
            <div className="space-y-2">
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-on-surface">
                {app.name}
              </h1>
              <p className="text-lg md:text-xl text-primary font-semibold tracking-wide flex items-center justify-center md:justify-start gap-2">
                <User size={18} className="opacity-70" />
                {app.developer}
              </p>
            </div>

            <div className="flex flex-wrap justify-center md:justify-start items-center gap-4">
              <Button
                size="lg"
                className={`h-14 px-10 text-lg font-bold rounded-[1.25rem] transition-all duration-500 shadow-xl shadow-primary/20 active:scale-95 ${
                  !app.file_path 
                    ? "bg-surface-low text-on-surface-variant border-2 border-outline-variant hover:border-primary/30" 
                    : "hover:shadow-2xl hover:shadow-primary/40"
                }`}
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
              >
                {downloading ? (
                  <Loader2 className="animate-spin mr-3" size={24} />
                ) : !app.file_path ? (
                  <Bell size={22} className="mr-3" />
                ) : (
                  <Download size={22} className="mr-3" />
                )}
                {downloading
                  ? "Processing..."
                  : !app.file_path
                  ? "Notify Me"
                  : app.price === 0
                  ? "Get for Free"
                  : `$${app.price}`}
              </Button>
              
              <div className="flex flex-col items-center md:items-start">
                <div className="flex items-center gap-1.5 px-4 py-2 bg-surface-lowest rounded-full border border-outline-variant shadow-sm">
                  <Star size={16} className="fill-yellow-400 text-yellow-400" />
                  <span className="font-bold text-on-surface">{avgRating ?? "New"}</span>
                  <span className="text-xs text-on-surface-variant font-medium">({reviews.length})</span>
                </div>
                <p className="text-[10px] uppercase tracking-widest font-bold text-green-600 mt-2 flex items-center gap-1 opacity-80">
                  <ShieldCheck size={12} /> Verified Safe
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Metadata Pills */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16"
        >
          <div className="bg-surface-lowest p-4 rounded-3xl border border-outline-variant/30 shadow-sm flex flex-col items-center justify-center gap-1 text-center group hover:border-primary/20 transition-all">
            <span className="text-[10px] uppercase tracking-tighter text-on-surface-variant font-bold opacity-60">Category</span>
            <span className="text-sm font-bold text-on-surface">{app.category}</span>
          </div>
          <div className="bg-surface-lowest p-4 rounded-3xl border border-outline-variant/30 shadow-sm flex flex-col items-center justify-center gap-1 text-center group hover:border-primary/20 transition-all">
            <span className="text-[10px] uppercase tracking-tighter text-on-surface-variant font-bold opacity-60">Version</span>
            <span className="text-sm font-bold text-on-surface">{app.version}</span>
          </div>
          <div className="bg-surface-lowest p-4 rounded-3xl border border-outline-variant/30 shadow-sm flex flex-col items-center justify-center gap-1 text-center group hover:border-primary/20 transition-all">
            <span className="text-[10px] uppercase tracking-tighter text-on-surface-variant font-bold opacity-60">Updated</span>
            <span className="text-sm font-bold text-on-surface">{new Date(app.created_at).toLocaleDateString()}</span>
          </div>
          <div className="bg-surface-lowest p-4 rounded-3xl border border-outline-variant/30 shadow-sm flex flex-col items-center justify-center gap-1 text-center group hover:border-primary/20 transition-all">
            <span className="text-[10px] uppercase tracking-tighter text-on-surface-variant font-bold opacity-60">Safety</span>
            <span className="text-xs font-bold text-green-600 flex items-center gap-1">
              <ShieldCheck size={14} /> Encrypted
            </span>
          </div>
        </motion.div>

        {/* Content Tabs / Body */}
        <div className="grid md:grid-cols-3 gap-12">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="md:col-span-2 space-y-12"
          >
            <section>
              <h2 className="text-2xl font-bold text-on-surface mb-6 flex items-center gap-3">
                <Info size={24} className="text-primary" />
                About this {app.category === "Games" ? "Game" : "App"}
              </h2>
              <p className="text-lg text-on-surface-variant leading-relaxed font-medium opacity-90 whitespace-pre-wrap">
                {app.description}
              </p>
            </section>

            <section className="pt-12 border-t border-outline-variant/50">
              <h2 className="text-2xl font-bold text-on-surface mb-8 flex items-center justify-between">
                <span>Ratings & Reviews</span>
                {avgRating && (
                  <div className="flex items-center gap-2 text-primary">
                    <Star size={24} className="fill-current" />
                    <span className="text-3xl font-black">{avgRating}</span>
                  </div>
                )}
              </h2>

              <div className="space-y-6">
                <AnimatePresence>
                  {reviews.length === 0 ? (
                    <div className="p-12 text-center bg-surface-lowest rounded-[2.5rem] border-2 border-dashed border-outline-variant/50">
                      <Star size={48} className="mx-auto mb-4 text-on-surface-variant opacity-20" />
                      <h3 className="text-lg font-bold text-on-surface mb-2">No reviews yet</h3>
                      <p className="text-on-surface-variant max-w-xs mx-auto text-sm leading-relaxed">
                        Be the first to share your thoughts and help others discover this {app.category?.toLowerCase()}.
                      </p>
                    </div>
                  ) : (
                    reviews.map((review, i) => (
                      <motion.div
                        key={review.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="bg-surface-lowest p-6 rounded-[2rem] border border-outline-variant shadow-sm hover:shadow-md transition-all active:scale-[0.99]"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                              {review.user_id}
                            </div>
                            <div>
                                <p className="text-sm font-bold text-on-surface">User #{review.user_id}</p>
                                <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest opacity-60">
                                    {new Date(review.created_at).toLocaleDateString()}
                                </p>
                            </div>
                          </div>
                          <StarRating value={review.rating} />
                        </div>
                        {review.comment && (
                          <p className="text-on-surface-variant text-base leading-relaxed font-medium">
                            {review.comment}
                          </p>
                        )}
                      </motion.div>
                    ))
                  )}
                </AnimatePresence>
              </div>
            </section>
          </motion.div>

          <motion.aside 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-8"
          >
            <div className="bg-surface-lowest p-8 rounded-[2.5rem] border border-outline-variant/30 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                <Info size={40} />
              </div>
              <h4 className="text-xl font-bold text-on-surface mb-6 flex items-center gap-2">
                About this app
              </h4>
              <p className="text-on-surface-variant leading-relaxed whitespace-pre-wrap">
                {app.description || "No description provided by the developer."}
              </p>
            </div>

            {app.screenshot_urls && JSON.parse(app.screenshot_urls).length > 0 && (
              <div className="space-y-6">
                <h4 className="text-xl font-bold text-on-surface flex items-center gap-2">
                  Screenshots
                </h4>
                <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar -mx-2 px-2">
                  {JSON.parse(app.screenshot_urls).map((url: string, i: number) => (
                    <motion.div
                      key={i}
                      whileHover={{ y: -5, scale: 1.02 }}
                      className="shrink-0 w-[240px] md:w-[320px] aspect-video rounded-2xl overflow-hidden bg-surface-low border border-outline-variant shadow-lg"
                    >
                      <img src={url} alt={`Screenshot ${i + 1}`} className="w-full h-full object-cover" />
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
            <div className="bg-surface-lowest p-8 rounded-[2.5rem] border border-outline-variant shadow-xl sticky top-32">
              <h3 className="text-xl font-bold text-on-surface mb-6">Write a Review</h3>
              <form onSubmit={handleSubmitReview} className="space-y-6">
                <div className="flex flex-col items-center gap-4 py-4 bg-surface-low rounded-3xl">
                  <span className="text-xs font-bold uppercase tracking-widest text-on-surface-variant opacity-60">Tap to Rate</span>
                  <StarRating value={myRating} onChange={setMyRating} />
                </div>
                <textarea
                  value={myComment}
                  onChange={(e) => setMyComment(e.target.value)}
                  placeholder="Tell us what you think..."
                  rows={4}
                  className="w-full px-5 py-4 rounded-3xl bg-surface-low border border-transparent focus:bg-surface-lowest focus:border-primary/30 focus:ring-4 focus:ring-primary/5 transition-all font-medium text-sm resize-none outline-none"
                />
                <Button 
                  type="submit" 
                  disabled={submittingReview || myRating === 0} 
                  className="w-full h-14 rounded-2xl flex items-center justify-center gap-3 text-base shadow-lg shadow-primary/20"
                >
                  {submittingReview ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
                  {submittingReview ? "Posting..." : "Submit Review"}
                </Button>
              </form>
            </div>
          </motion.aside>
        </div>
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
