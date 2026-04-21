"use client";

import React, { useState, useRef, useEffect, Suspense, ChangeEvent, FormEvent, DragEvent } from "react";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import {
  Upload, FileText, CheckCircle2, ArrowRight,
  ArrowLeft, CloudUpload, Globe, Tag, Image as ImageIcon, X, Gamepad2,
  Layout, Music, BookOpen, Wrench, Code2
} from "lucide-react";
import api from "@/lib/api";
import { toast } from "sonner";
import { useRouter, useSearchParams } from "next/navigation";

const CATEGORIES = [
  { label: "Development", icon: <Code2 size={16} /> },
  { label: "Productivity", icon: <Layout size={16} /> },
  { label: "Games", icon: <Gamepad2 size={16} /> },
  { label: "Music", icon: <Music size={16} /> },
  { label: "Books", icon: <BookOpen size={16} /> },
  { label: "Utilities", icon: <Wrench size={16} /> },
  { label: "Graphics", icon: <ImageIcon size={16} /> },
];

const ACCEPTED_FILE_TYPES = ".zip,.dmg,.exe,.apk,.ipa,.tar.gz";

interface ApiError {
  response?: {
    data?: {
      detail?: string;
    };
  };
}

export default function UploadPage() {
  return (
    <Suspense fallback={
      <div className="max-w-4xl mx-auto px-4 py-20 flex items-center justify-center min-h-[60vh]">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          <p className="text-on-surface-variant font-medium">Loading upload tools...</p>
        </div>
      </div>
    }>
      <UploadFormContent />
    </Suspense>
  );
}

function UploadFormContent() {
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "loading") return;

    const init = async () => {
      const token = localStorage.getItem("token");
      if (token) return;

      if (session?.user?.email) {
        try {
          const res = await api.post("/auth/oauth-login", {
            email: session.user.email,
            name: session.user.name,
          });
          localStorage.setItem("token", res.data.access_token);
        } catch {
          toast.error("Authentication failed. Please sign in again.");
          router.push("/login");
        }
        return;
      }

      if (status === "unauthenticated") {
        toast.error("Please sign in to upload apps.");
        router.push("/login");
      }
    };

    init();
  }, [status, session?.user?.email]);

  const searchParams = useSearchParams();

  useEffect(() => {
    const category = searchParams.get("category");
    const price = searchParams.get("price");
    if (category || price) {
      setMetadata(prev => ({
        ...prev,
        category: category || prev.category,
        price: price ? parseFloat(price) : prev.price
      }));
    }
  }, [searchParams]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const iconInputRef = useRef<HTMLInputElement>(null);
  const screenshotInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [appId, setAppId] = useState<number | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const [metadata, setMetadata] = useState({
    name: "",
    description: "",
    price: 0,
    category: "Development",
    version: "1.0.0",
    website: "",
    supportEmail: "",
    external_url: "",
  });

  const [file, setFile] = useState<File | null>(null);
  const [iconFile, setIconFile] = useState<File | null>(null);
  const [iconPreview, setIconPreview] = useState<string | null>(null);
  const [screenshots, setScreenshots] = useState<File[]>([]);
  const [screenshotPreviews, setScreenshotPreviews] = useState<string[]>([]);

  const handleIconChange = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setIconFile(f);
    setIconPreview(URL.createObjectURL(f));
  };

  const handleScreenshotsChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).slice(0, 5);
    setScreenshots(files);
    setScreenshotPreviews(files.map((f) => URL.createObjectURL(f)));
  };

  const removeScreenshot = (index: number) => {
    setScreenshots((prev) => prev.filter((_, i) => i !== index));
    setScreenshotPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f) setFile(f);
  };

  const handleMetadataSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post("/apps/submit", metadata);
      setAppId(res.data.id);
      toast.success("App info saved! Now upload your files.");
      setStep(2);
    } catch (err: unknown) {
      const error = err as ApiError;
      toast.error(error.response?.data?.detail || "Submission failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: FormEvent) => {
    e.preventDefault();
    if (!appId) return;
    if (!file && !metadata.external_url) {
      toast.error("Please upload a file or provide a link in the previous step.");
      return;
    }
    
    setLoading(true);
    const formData = new FormData();
    if (file) formData.append("file", file);
    if (iconFile) formData.append("icon", iconFile);
    screenshots.forEach((s) => formData.append("screenshots", s));

    try {
      await api.post(`/apps/${appId}/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Application is now live!");
      setStep(3);
    } catch (err: unknown) {
      const error = err as ApiError;
      toast.error(error.response?.data?.detail || "File upload failed.");
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-20">
      <div className="flex items-center gap-4 mb-12">
        <button
          onClick={() => step === 2 ? setStep(1) : router.back()}
          className="p-3 rounded-2xl glass hover:bg-surface-low transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Submit New App</h1>
          <p className="text-on-surface-variant font-medium">
            {step === 1 ? "Step 1 of 2: App Information" :
             step === 2 ? "Step 2 of 2: Upload Files" :
             "Submission Complete!"}
          </p>
        </div>
      </div>

      <div className="flex gap-2 mb-10">
        {[1, 2, 3].map((s) => (
          <div key={s} className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${step >= s ? "bg-primary" : "bg-surface-low"}`} />
        ))}
      </div>

      <AnimatePresence mode="wait">

        {step === 1 && (
          <motion.div key="step1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
            <GlassCard className="p-10 space-y-8">
              <form onSubmit={handleMetadataSubmit} className="space-y-6">

                <div className="flex items-center gap-6">
                  <div
                    onClick={() => iconInputRef.current?.click()}
                    className="w-24 h-24 rounded-3xl bg-surface-low border-2 border-dashed border-outline-variant flex items-center justify-center cursor-pointer hover:border-primary/50 transition-all overflow-hidden"
                  >
                    {iconPreview ? (
                      <img src={iconPreview} alt="icon" className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon size={28} className="text-on-surface-variant" />
                    )}
                  </div>
                  <input ref={iconInputRef} type="file" accept="image/*" onChange={handleIconChange} className="hidden" />
                  <div>
                    <p className="font-bold text-on-surface">App Icon</p>
                    <p className="text-xs text-on-surface-variant mt-1">PNG or JPG, 512x512px recommended</p>
                    <button type="button" onClick={() => iconInputRef.current?.click()} className="text-xs font-bold text-primary mt-2 hover:underline">
                      {iconPreview ? "Change Icon" : "Upload Icon"}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant ml-1">App Name</label>
                    <div className="relative group">
                      <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-primary transition-colors" size={18} />
                      <input
                        required
                        value={metadata.name}
                        onChange={(e) => setMetadata({ ...metadata, name: e.target.value })}
                        type="text"
                        placeholder="My Awesome App"
                        className="w-full pl-12 pr-4 py-4 rounded-2xl glass border border-outline-variant focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant ml-1">Category</label>
                    <div className="relative group">
                      <Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-primary transition-colors" size={18} />
                      <select
                        value={metadata.category}
                        onChange={(e) => setMetadata({ ...metadata, category: e.target.value })}
                        className="w-full pl-12 pr-4 py-4 rounded-2xl glass border border-outline-variant focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium appearance-none"
                      >
                        {CATEGORIES.map((c) => <option key={c.label} value={c.label}>{c.label}</option>)}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant ml-1">Description</label>
                  <textarea
                    required
                    value={metadata.description}
                    onChange={(e) => setMetadata({ ...metadata, description: e.target.value })}
                    placeholder="Tell users what your app does and why they'll love it..."
                    rows={4}
                    className="w-full px-6 py-4 rounded-2xl glass border border-outline-variant focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant ml-1">Price ($) — enter 0 for free</label>
                    <input
                      required
                      type="number"
                      step="0.01"
                      min="0"
                      value={metadata.price}
                      onChange={(e) => setMetadata({ ...metadata, price: parseFloat(e.target.value) })}
                      className="w-full px-6 py-4 rounded-2xl glass border border-outline-variant focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant ml-1">Version</label>
                    <input
                      required
                      value={metadata.version}
                      onChange={(e) => setMetadata({ ...metadata, version: e.target.value })}
                      placeholder="1.0.0"
                      className="w-full px-6 py-4 rounded-2xl glass border border-outline-variant focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant ml-1">Website (optional)</label>
                    <input
                      value={metadata.website}
                      onChange={(e) => setMetadata({ ...metadata, website: e.target.value })}
                      placeholder="https://myapp.com"
                      className="w-full px-6 py-4 rounded-2xl glass border border-outline-variant focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant ml-1">Support Email (optional)</label>
                    <input
                      type="email"
                      value={metadata.supportEmail}
                      onChange={(e) => setMetadata({ ...metadata, supportEmail: e.target.value })}
                      placeholder="support@myapp.com"
                      className="w-full px-6 py-4 rounded-2xl glass border border-outline-variant focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                    />
                  </div>
                </div>

                {(metadata.category === "Music" || metadata.category === "Books") && (
                  <div className="space-y-2 p-6 rounded-3xl bg-primary/5 border border-primary/10">
                    <label className="text-xs font-bold uppercase tracking-widest text-primary ml-1 flex items-center gap-2">
                      <Globe size={14} /> Connect External Link (Optional)
                    </label>
                    <input
                      value={metadata.external_url || ""}
                      onChange={(e) => setMetadata({ ...metadata, external_url: e.target.value })}
                      placeholder="https://soundcloud.com/you or direct link..."
                      className="w-full px-6 py-4 rounded-2xl glass border border-primary/20 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium text-sm"
                    />
                    <p className="text-[10px] text-on-surface-variant mt-2 px-2 leading-relaxed">
                      If provided, users will be redirected to this link for your {metadata.category.toLowerCase()}. 
                      You won&apos;t need to upload a file in the next step.
                    </p>
                  </div>
                )}

                <Button size="lg" className="w-full py-6 text-lg" disabled={loading}>
                  {loading ? "Saving..." : "Continue to Upload"} <ArrowRight className="ml-2" />
                </Button>
              </form>
            </GlassCard>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <GlassCard className="p-10 space-y-8">
              <form onSubmit={handleFileUpload} className="space-y-8">
                <div className="space-y-3">
                  <div className="flex justify-between items-end px-1">
                    <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">App File</label>
                    {metadata.external_url && (
                      <span className="text-[10px] font-bold text-primary flex items-center gap-1">
                        <CheckCircle2 size={12} /> External Link Connected
                      </span>
                    )}
                  </div>
                  <div
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`w-full h-48 border-2 border-dashed rounded-3xl flex flex-col items-center justify-center gap-3 cursor-pointer transition-all ${dragOver ? "border-primary bg-primary/5" : "border-outline-variant hover:border-primary/50"} ${metadata.external_url && !file ? "opacity-60 grayscale-[0.5]" : ""}`}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept={ACCEPTED_FILE_TYPES}
                      onChange={(e) => setFile(e.target.files?.[0] || null)}
                      className="hidden"
                    />
                    {file ? (
                      <>
                        <FileText size={32} className="text-primary" />
                        <p className="font-bold text-on-surface">{file.name}</p>
                        <p className="text-xs text-on-surface-variant">{formatFileSize(file.size)}</p>
                      </>
                    ) : metadata.external_url ? (
                      <>
                        <Globe size={32} className="text-primary/40" />
                        <p className="font-bold text-on-surface">External link will be used</p>
                        <p className="text-xs text-on-surface-variant">Or click to replace with a file</p>
                      </>
                    ) : (
                      <>
                        <CloudUpload size={32} className="text-on-surface-variant" />
                        <p className="font-bold text-on-surface">Drag & drop or click to upload</p>
                        <p className="text-xs text-on-surface-variant uppercase tracking-widest">ZIP · DMG · EXE · APK · IPA — Max 500MB</p>
                      </>
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant ml-1">Screenshots (up to 5)</label>
                  <div className="flex flex-wrap gap-3">
                    {screenshotPreviews.map((src, i) => (
                      <div key={i} className="relative w-28 h-20 rounded-2xl overflow-hidden border border-outline-variant group">
                        <img src={src} alt={`screenshot ${i}`} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removeScreenshot(i)}
                          className="absolute top-1 right-1 w-5 h-5 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X size={10} className="text-white" />
                        </button>
                      </div>
                    ))}
                    {screenshots.length < 5 && (
                      <div
                        onClick={() => screenshotInputRef.current?.click()}
                        className="w-28 h-20 rounded-2xl border-2 border-dashed border-outline-variant flex items-center justify-center cursor-pointer hover:border-primary/50 transition-all"
                      >
                        <Upload size={18} className="text-on-surface-variant" />
                      </div>
                    )}
                    <input ref={screenshotInputRef} type="file" accept="image/*" multiple onChange={handleScreenshotsChange} className="hidden" />
                  </div>
                  <p className="text-xs text-on-surface-variant">PNG or JPG screenshots of your app in action</p>
                </div>

                <Button size="lg" className="w-full py-6 text-lg" disabled={loading || (!file && !metadata.external_url)}>
                  {loading ? "Uploading..." : "Publish Application"} <CheckCircle2 className="ml-2" />
                </Button>
              </form>
            </GlassCard>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div key="step3" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
            <GlassCard className="p-16 flex flex-col items-center text-center gap-6">
              <div className="w-24 h-24 rounded-full bg-green-500/10 flex items-center justify-center">
                <CheckCircle2 size={48} className="text-green-500" />
              </div>
              <h2 className="text-4xl font-bold text-on-surface">App Submitted!</h2>
              <p className="text-on-surface-variant max-w-md">Your application has been submitted. It will be live on PandaStore shortly.</p>
              <div className="flex gap-4 mt-4">
                <Button size="lg" onClick={() => router.push("/publisher")}>
                  Go to Publisher Hub <ArrowRight className="ml-2" />
                </Button>
                <button
                  onClick={() => {
                    setStep(1);
                    setFile(null);
                    setIconFile(null);
                    setIconPreview(null);
                    setScreenshots([]);
                    setScreenshotPreviews([]);
                    setMetadata({ name: "", description: "", price: 0, category: "Development", version: "1.0.0", website: "", supportEmail: "", external_url: "" });
                  }}
                  className="px-6 py-3 rounded-2xl border border-outline-variant hover:bg-surface-low transition-all font-bold text-sm"
                >
                  Submit Another
                </button>
              </div>
            </GlassCard>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}