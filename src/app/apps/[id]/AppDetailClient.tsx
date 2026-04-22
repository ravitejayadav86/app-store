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
    <div className="min-h-screen bg-surface selection:bg-primary/10">
      {/* Dynamic Background Glow */}
      <div className={`fixed inset-0 bg-linear-to-b ${getCategoryGradient(app.category)} opacity-40 pointer-events-none`} />
      
      <div className="relative z-10 max-w-5xl mx-auto px-6 pt-24 pb-24">
        {/* Navigation */}
        <motion.button
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => router.back()}
          className="group flex items-center gap-2 text-on-surface-variant hover:text-primary transition-all mb-8 text-sm font-bold"
        >
          <div className="p-2.5 rounded-full liquid-glass group-hover:scale-110 transition-transform">
            <ArrowLeft size={18} />
          </div>
          Back to Store
        </motion.button>

        {/* Hero Section */}
        <div className="flex flex-col md:flex-row gap-12 items-center md:items-start mb-16">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative"
          >
            <div className="absolute inset-0 bg-primary/30 blur-[100px] opacity-40" />
            <div className="relative w-44 h-44 md:w-56 md:h-56 rounded-[3rem] liquid-glass flex items-center justify-center shadow-2xl border-white/40 overflow-hidden p-1">
              <div className="absolute inset-0 bg-linear-to-br from-white/30 to-transparent pointer-events-none" />
              <div className="w-full h-full rounded-[2.8rem] overflow-hidden">
                {app.icon_url ? (
                  <img src={app.icon_url} alt={app.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-surface-low">
                    {getCategoryIcon(app.category)}
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex-1 text-center md:text-left space-y-8 w-full"
          >
            <div className="space-y-3">
              <h1 className="text-5xl md:text-7xl font-black tracking-tight text-on-surface">
                {app.name}
              </h1>
              <p className="text-xl md:text-2xl text-primary font-bold tracking-wide flex items-center justify-center md:justify-start gap-3">
                <User size={22} className="text-primary/60" />
                {app.developer}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row justify-center md:justify-start items-center gap-6">
              <Button
                size="lg"
                className={`h-16 px-12 text-xl font-black rounded-3xl transition-all duration-500 shadow-2xl active:scale-95 ${
                  !app.file_path 
                    ? "bg-white/40 text-on-surface-variant border-2 border-white/50 backdrop-blur-xl" 
                    : "hover:shadow-primary/40 hover:-translate-y-1"
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
                  <Loader2 className="animate-spin mr-3" size={26} />
                ) : !app.file_path ? (
                  <Bell size={24} className="mr-3" />
                ) : (
                  <Download size={24} className="mr-3" />
                )}
                {downloading
                  ? "Processing..."
                  : !app.file_path
                  ? "Notify Me"
                  : app.price === 0
                  ? "Get for Free"
                  : `$${app.price}`}
              </Button>
              
              <div className="flex flex-col items-center md:items-start gap-2">
                <div className="flex items-center gap-2 px-6 py-3 liquid-glass shadow-lg border-white/50">
                  <Star size={20} className="fill-yellow-400 text-yellow-400" />
                  <span className="font-black text-xl text-on-surface">{avgRating ?? "New"}</span>
                  <span className="text-sm text-on-surface-variant font-bold">({reviews.length})</span>
                </div>
                <p className="text-xs uppercase tracking-[0.2em] font-black text-green-600 flex items-center gap-2 px-2">
                  <ShieldCheck size={14} /> Safe & Verified
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Metadata Grid */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16"
        >
          <div className="liquid-glass p-6 flex flex-col items-center justify-center gap-2 text-center group hover:-translate-y-1 transition-all border-white/40">
            <span className="text-[11px] uppercase tracking-widest text-on-surface-variant font-black opacity-50">Category</span>
            <span className="text-base font-black text-on-surface">{app.category}</span>
          </div>
          <div className="liquid-glass p-6 flex flex-col items-center justify-center gap-2 text-center group hover:-translate-y-1 transition-all border-white/40">
            <span className="text-[11px] uppercase tracking-widest text-on-surface-variant font-black opacity-50">Version</span>
            <span className="text-base font-black text-on-surface">{app.version}</span>
          </div>
          <div className="liquid-glass p-6 flex flex-col items-center justify-center gap-2 text-center group hover:-translate-y-1 transition-all border-white/40">
            <span className="text-[11px] uppercase tracking-widest text-on-surface-variant font-black opacity-50">Updated</span>
            <span className="text-base font-black text-on-surface">{new Date(app.created_at).toLocaleDateString()}</span>
          </div>
          <div className="liquid-glass p-6 flex flex-col items-center justify-center gap-2 text-center group hover:-translate-y-1 transition-all border-white/40">
            <span className="text-[11px] uppercase tracking-widest text-on-surface-variant font-black opacity-50">Security</span>
            <span className="text-sm font-black text-green-600 flex items-center gap-1.5">
              <ShieldCheck size={16} /> End-to-End
            </span>
          </div>
        </motion.div>

        {/* Content Tabs / Body */}
        <div className="grid md:grid-cols-3 gap-16">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="md:col-span-2 space-y-16"
          >
            <section className="liquid-glass p-10 border-white/30 shadow-2xl">
              <h2 className="text-3xl font-black text-on-surface mb-8 flex items-center gap-3">
                <Info size={32} className="text-primary" />
                About this {app.category === "Games" ? "Game" : "App"}
              </h2>
              <p className="text-xl text-on-surface-variant leading-relaxed font-bold opacity-90 whitespace-pre-wrap">
                {app.description}
              </p>
            </section>

            <section>
              <h2 className="text-3xl font-black text-on-surface mb-10 flex items-center justify-between">
                <span>Ratings & Reviews</span>
                {avgRating && (
                  <div className="flex items-center gap-3 text-primary bg-primary/10 px-5 py-2 rounded-2xl border border-primary/20 shadow-inner">
                    <Star size={28} className="fill-current" />
                    <span className="text-4xl font-black">{avgRating}</span>
                  </div>
                )}
              </h2>

              <div className="space-y-8">
                <AnimatePresence>
                  {reviews.length === 0 ? (
                    <div className="p-20 text-center liquid-glass border-dashed border-white/40">
                      <Star size={64} className="mx-auto mb-6 text-primary/20" />
                      <h3 className="text-2xl font-black text-on-surface mb-3">No reviews yet</h3>
                      <p className="text-on-surface-variant max-w-sm mx-auto text-lg font-bold leading-relaxed">
                        Be the first to share your experience and help others discover this {app.category?.toLowerCase()}.
                      </p>
                    </div>
                  ) : (
                    reviews.map((review, i) => (
                      <motion.div
                        key={review.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="liquid-glass p-8 border-white/30 shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all"
                      >
                        <div className="flex items-center justify-between mb-6">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl liquid-glass flex items-center justify-center text-primary font-black text-xl border-white/50 shadow-inner">
                              {review.user_id}
                            </div>
                            <div>
                                <p className="text-lg font-black text-on-surface">User #{review.user_id}</p>
                                <p className="text-[11px] text-on-surface-variant font-black uppercase tracking-[0.2em] opacity-50">
                                    {new Date(review.created_at).toLocaleDateString()}
                                </p>
                            </div>
                          </div>
                          <StarRating value={review.rating} />
                        </div>
                        {review.comment && (
                          <p className="text-on-surface-variant text-lg leading-relaxed font-bold">
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
