"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Music, UploadCloud, Search, Check, Loader2 } from "lucide-react";
import { Button } from "./Button";
import api from "@/lib/api";
import { toast } from "sonner";

interface AddMusicModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AddMusicModal({ isOpen, onClose, onSuccess }: AddMusicModalProps) {
  const [movieName, setMovieName] = useState("");
  const [songName, setSongName] = useState("");
  const [language, setLanguage] = useState("");
  const [file, setFile] = useState<File | null>(null);
  
  const [coverUrl, setCoverUrl] = useState<string | null>(null);
  const [isDetecting, setIsDetecting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Panda AI: Auto-detect cover art using iTunes API
  useEffect(() => {
    if (movieName.length < 2 || songName.length < 2) return;

    const timeout = setTimeout(async () => {
      setIsDetecting(true);
      try {
        const query = encodeURIComponent(`${movieName} ${songName}`);
        const res = await fetch(`https://itunes.apple.com/search?term=${query}&media=music&limit=1`);
        const data = await res.json();
        if (data.results && data.results.length > 0) {
          // Upgrade to high-res
          const highResUrl = data.results[0].artworkUrl100.replace("100x100bb", "512x512bb");
          setCoverUrl(highResUrl);
        } else {
          setCoverUrl(null);
        }
      } catch (err) {
        console.error("Failed to detect cover", err);
      } finally {
        setIsDetecting(false);
      }
    }, 800);

    return () => clearTimeout(timeout);
  }, [movieName, songName]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      toast.error("Please select an MP3 file");
      return;
    }

    setIsUploading(true);
    try {
      // 1. Submit App Metadata
      const metadataRes = await api.post("/apps/submit", {
        name: songName,
        developer: movieName, // Store movie name in developer field
        category: "Music",
        description: `Language: ${language}`,
        price: 0,
        version: "1.0.0",
      });

      const appId = metadataRes.data.id;

      // 2. Prepare files for upload
      const formData = new FormData();
      formData.append("file", file);

      if (coverUrl) {
        try {
          // Download cover image to upload as icon if available
          const imgRes = await fetch(coverUrl);
          const blob = await imgRes.blob();
          formData.append("icon", new File([blob], "cover.jpg", { type: blob.type }));
        } catch (imgErr) {
          console.error("Could not fetch cover blob, ignoring", imgErr);
        }
      }

      // 3. Upload files
      await api.post(`/apps/${appId}/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      toast.success("Song published successfully!");
      onSuccess();
      onClose();
      
      // Reset
      setMovieName("");
      setSongName("");
      setLanguage("");
      setFile(null);
      setCoverUrl(null);
    } catch (error: any) {
      console.error("Upload error:", error);
      const message = error.response?.data?.detail || error.message || "Upload failed. Please try again.";
      toast.error(message);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-lg glass bg-surface/90 border border-outline-variant p-6 md:p-8 rounded-[2rem] shadow-2xl overflow-hidden"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-surface-low transition-colors"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-primary/10 text-primary rounded-xl">
                <Music size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold">Publish Music</h2>
                <p className="text-sm text-on-surface-variant">Panda AI auto-detects artwork</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant ml-1">Song Name</label>
                <input
                  required
                  value={songName}
                  onChange={e => setSongName(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl glass border border-outline-variant focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="e.g. Pushpa Pushpa"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant ml-1">Movie / Album</label>
                  <input
                    required
                    value={movieName}
                    onChange={e => setMovieName(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl glass border border-outline-variant focus:outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder="e.g. Pushpa 2"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant ml-1">Language</label>
                  <input
                    required
                    value={language}
                    onChange={e => setLanguage(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl glass border border-outline-variant focus:outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder="e.g. Telugu"
                  />
                </div>
              </div>

              {/* Panda AI Detect Box */}
              <div className="p-4 rounded-2xl border border-primary/20 bg-primary/5 flex items-center gap-4 mt-2">
                <div className="w-16 h-16 rounded-xl overflow-hidden glass flex items-center justify-center relative shadow-sm shrink-0 border border-outline-variant">
                  {coverUrl ? (
                    <img src={coverUrl} alt="Cover" className="w-full h-full object-cover" />
                  ) : isDetecting ? (
                    <Loader2 size={24} className="text-primary animate-spin" />
                  ) : (
                    <Search size={24} className="text-on-surface-variant" />
                  )}
                </div>
                <div>
                  <h4 className="font-bold text-sm text-primary flex items-center gap-1">
                    Panda AI Vision ✨
                  </h4>
                  <p className="text-[11px] text-on-surface-variant mt-1 leading-snug">
                    {coverUrl 
                      ? "Original artwork found! This will be used automatically."
                      : isDetecting 
                        ? "Searching for original artwork..."
                        : "Type movie & song name to auto-detect artwork"}
                  </p>
                </div>
              </div>

              <div className="space-y-1 mt-2">
                <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant ml-1">MP3 File</label>
                <div 
                  className={`w-full h-28 rounded-3xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-colors ${file ? 'border-primary/50 bg-primary/5' : 'border-outline-variant hover:border-primary/50 glass'}`}
                  onClick={() => document.getElementById('mp3-upload')?.click()}
                >
                  {file ? (
                    <div className="flex flex-col items-center text-primary">
                      <Check size={28} className="mb-2" />
                      <span className="text-sm font-bold truncate px-4 max-w-[200px]">{file.name}</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center text-on-surface-variant">
                      <UploadCloud size={28} className="mb-2" />
                      <span className="text-sm font-bold">Upload MP3 Directly</span>
                    </div>
                  )}
                  <input 
                    id="mp3-upload" 
                    type="file" 
                    accept="audio/mpeg, audio/mp3, audio/wav" 
                    className="hidden" 
                    onChange={e => {
                      if (e.target.files && e.target.files[0]) setFile(e.target.files[0]);
                    }}
                  />
                </div>
              </div>

              <Button disabled={isUploading || !file} size="lg" className="w-full mt-2 py-4">
                {isUploading ? <Loader2 size={18} className="animate-spin mr-2" /> : null}
                {isUploading ? "Publishing..." : "Add Music"}
              </Button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
