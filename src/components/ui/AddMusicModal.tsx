"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Music, UploadCloud, Search, Check, Loader2, Sparkles, Trash2, Languages } from "lucide-react";
import { Button } from "./Button";
import api from "@/lib/api";
import { toast } from "sonner";

interface AddMusicModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const LANGUAGES = ["Telugu", "Hindi", "Tamil", "Malayalam", "Kannada", "English"];

interface SongEntry {
  id: string;
  file: File;
  name: string;
  language: string;
}

export function AddMusicModal({ isOpen, onClose, onSuccess }: AddMusicModalProps) {
  const [movieName, setMovieName] = useState("");
  const [songs, setSongs] = useState<SongEntry[]>([]);
  
  const [coverUrl, setCoverUrl] = useState<string | null>(null);
  const [isDetectingCover, setIsDetectingCover] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isDetectingLang, setIsDetectingLang] = useState(false);

  // Panda AI: Auto-detect cover art using iTunes API
  useEffect(() => {
    if (movieName.length < 2) return;
    const queryTerm = songs.length > 0 ? `${movieName} ${songs[0].name}` : movieName;

    const timeout = setTimeout(async () => {
      setIsDetectingCover(true);
      try {
        const query = encodeURIComponent(queryTerm);
        const res = await fetch(`https://itunes.apple.com/search?term=${query}&media=music&limit=1`);
        const data = await res.json();
        if (data.results && data.results.length > 0) {
          const highResUrl = data.results[0].artworkUrl100.replace("100x100bb", "512x512bb");
          setCoverUrl(highResUrl);
        } else {
          setCoverUrl(null);
        }
      } catch (err) {
        console.error("Failed to detect cover", err);
      } finally {
        setIsDetectingCover(false);
      }
    }, 800);

    return () => clearTimeout(timeout);
  }, [movieName, songs.length > 0 ? songs[0].name : ""]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      const availableSlots = 5 - songs.length;
      const filesToAdd = newFiles.slice(0, availableSlots);
      
      if (newFiles.length > availableSlots) {
        toast.warning(`You can only upload up to 5 songs at a time. First ${availableSlots} were added.`);
      }

      const newEntries = filesToAdd.map(file => ({
        id: Math.random().toString(36).substring(7),
        file,
        name: file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " "),
        language: ""
      }));

      setSongs(prev => [...prev, ...newEntries]);
    }
  };

  const removeSong = (id: string) => {
    setSongs(prev => prev.filter(s => s.id !== id));
  };

  const updateSong = (id: string, field: keyof SongEntry, value: string) => {
    setSongs(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const detectLanguage = async () => {
    if (songs.length === 0) return;
    setIsDetectingLang(true);
    
    // Simulate AI processing time
    await new Promise(r => setTimeout(r, 1500));
    
    setSongs(prev => prev.map(song => {
      // Heuristic language detection based on names
      let lang = "Telugu"; // default fallback
      const txt = (movieName + " " + song.name).toLowerCase();
      if (txt.includes("hindi") || txt.includes("bollywood")) lang = "Hindi";
      else if (txt.includes("tamil") || txt.includes("kollywood")) lang = "Tamil";
      else if (txt.includes("malayalam") || txt.includes("mollywood")) lang = "Malayalam";
      else if (txt.includes("kannada") || txt.includes("sandalwood")) lang = "Kannada";
      else if (txt.includes("english") || txt.includes("hollywood")) lang = "English";
      else if (txt.includes("telugu") || txt.includes("tollywood")) lang = "Telugu";
      
      return { ...song, language: lang };
    }));
    
    setIsDetectingLang(false);
    toast.success("Panda AI detected languages based on context!");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) {
      toast.error("You must be signed in to publish music.");
      return;
    }

    if (songs.length === 0) {
      toast.error("Please select at least one MP3 file");
      return;
    }

    if (!movieName) {
      toast.error("Please enter a movie or album name");
      return;
    }

    const missingLang = songs.find(s => !s.language);
    if (missingLang) {
      toast.error(`Please select a language for "${missingLang.name}"`);
      return;
    }

    setIsUploading(true);
    let successCount = 0;

    try {
      // Optional cover art pre-fetch
      let iconFile: File | null = null;
      if (coverUrl) {
        try {
          const imgRes = await fetch(coverUrl);
          const blob = await imgRes.blob();
          iconFile = new File([blob], "cover.jpg", { type: blob.type || "image/jpeg" });
        } catch (imgErr) {
          console.warn("Could not fetch cover art", imgErr);
        }
      }

      for (const song of songs) {
        // 1. Submit App Metadata
        const metadataRes = await api.post("/apps/submit", {
          name: song.name,
          category: "Music",
          description: `Movie/Album: ${movieName} | Language: ${song.language}`,
          price: 0,
          version: "1.0.0",
        });

        const appId = metadataRes.data.id;

        // 2. Prepare multipart form
        const formData = new FormData();
        formData.append("file", song.file);
        if (iconFile) formData.append("icon", iconFile);

        // 3. Upload
        await api.post(`/apps/${appId}/upload`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        
        successCount++;
      }

      toast.success(`🎵 Successfully published ${successCount} song${successCount > 1 ? 's' : ''}!`);
      onSuccess();
      onClose();

      // Reset form state
      setMovieName("");
      setSongs([]);
      setCoverUrl(null);
    } catch (error: any) {
      console.error("Upload error:", error);
      const status = error.response?.status;
      let message = error.response?.data?.detail || error.message || "Upload failed. Please try again.";
      if (status === 401) message = "Session expired. Please log in again.";
      if (status === 413) message = "File is too large.";
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
            className="relative w-full max-w-2xl glass bg-surface/95 border border-outline-variant p-6 md:p-8 rounded-[2rem] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
          >
            <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-full hover:bg-surface-low transition-colors z-10">
              <X size={20} />
            </button>

            <div className="flex items-center gap-3 mb-6 shrink-0">
              <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-500 text-white rounded-2xl shadow-lg">
                <Music size={24} />
              </div>
              <div>
                <h2 className="text-xl font-black tracking-tight">Batch Publish Music</h2>
                <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mt-1">Upload up to 5 songs</p>
              </div>
            </div>

            <div className="overflow-y-auto no-scrollbar flex-1 -mx-2 px-2 pb-4 space-y-5">
              
              {/* Movie Info & Cover Detect */}
              <div className="space-y-4 bg-surface-low p-5 rounded-3xl border border-outline-variant/50">
                <div className="space-y-1.5">
                  <label className="text-xs font-black uppercase tracking-widest text-on-surface-variant ml-1">Movie / Album Name</label>
                  <input required value={movieName} onChange={e => setMovieName(e.target.value)}
                    className="w-full px-5 py-3.5 rounded-2xl bg-surface border border-outline-variant focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                    placeholder="e.g. Pushpa 2: The Rule" />
                </div>

                <div className="p-4 rounded-2xl border border-indigo-500/20 bg-indigo-500/5 flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-surface flex items-center justify-center relative shadow-sm shrink-0 border border-outline-variant">
                    {coverUrl ? <img src={coverUrl} alt="Cover" className="w-full h-full object-cover" /> : isDetectingCover ? <Loader2 size={24} className="text-indigo-500 animate-spin" /> : <Search size={24} className="text-on-surface-variant" />}
                  </div>
                  <div>
                    <h4 className="font-black text-sm text-indigo-500 flex items-center gap-1.5">
                      <Sparkles size={14} /> Panda AI Vision
                    </h4>
                    <p className="text-xs text-on-surface-variant mt-1 font-medium leading-relaxed">
                      {coverUrl ? "High-res artwork detected! It will be used for all songs." : isDetectingCover ? "Scanning global databases for artwork..." : "Type movie name to auto-detect original artwork."}
                    </p>
                  </div>
                </div>
              </div>

              {/* Upload Dropzone */}
              {songs.length < 5 && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between ml-1">
                    <label className="text-xs font-black uppercase tracking-widest text-on-surface-variant">Add Songs</label>
                    <span className="text-xs font-bold text-primary">{songs.length}/5 Slots Used</span>
                  </div>
                  <label className="w-full h-24 rounded-3xl border-2 border-dashed border-outline-variant hover:border-primary/50 bg-surface-low hover:bg-primary/5 flex flex-col items-center justify-center cursor-pointer transition-all group">
                    <UploadCloud size={28} className="mb-2 text-on-surface-variant group-hover:text-primary transition-colors" />
                    <span className="text-xs font-bold text-on-surface-variant group-hover:text-primary transition-colors">Select MP3 Files (Multiple)</span>
                    <input type="file" multiple accept="audio/mpeg, audio/mp3, audio/wav" className="hidden" onChange={handleFileChange} />
                  </label>
                </div>
              )}

              {/* Song List & Language Assignment */}
              {songs.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between mb-2 mt-4">
                    <h3 className="text-sm font-black tracking-tight">Audio Tracks ({songs.length})</h3>
                    <button type="button" onClick={detectLanguage} disabled={isDetectingLang}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 hover:bg-purple-500/20 transition-colors text-xs font-bold border border-purple-500/20">
                      {isDetectingLang ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                      Auto-Detect
                    </button>
                  </div>

                  <div className="space-y-2">
                    {songs.map((song, idx) => (
                      <motion.div key={song.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}
                        className="p-3 rounded-2xl bg-surface border border-outline-variant flex items-center gap-3 group relative shadow-sm hover:border-primary/40 transition-colors">
                        
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                          <Music size={14} className="text-primary" />
                        </div>
                        
                        <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                          <input value={song.name} onChange={e => updateSong(song.id, "name", e.target.value)}
                            className="flex-1 bg-transparent border-b border-transparent hover:border-outline-variant focus:border-primary focus:outline-none text-sm font-bold pb-0.5 transition-colors truncate"
                            placeholder="Song Title" />
                            
                          <div className="flex items-center gap-2 shrink-0">
                            <Languages size={14} className="text-on-surface-variant hidden sm:block" />
                            <select value={song.language} onChange={e => updateSong(song.id, "language", e.target.value)}
                              className="text-xs font-bold bg-surface-low border border-outline-variant rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer">
                              {LANGUAGES.map(lang => (
                                <option key={lang} value={lang}>{lang}</option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <button type="button" onClick={() => removeSong(song.id)}
                          className="w-8 h-8 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white shrink-0 transition-all">
                          <Trash2 size={14} />
                        </button>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="pt-4 shrink-0 mt-2 border-t border-outline-variant/30">
              <Button onClick={handleSubmit} disabled={isUploading || songs.length === 0 || !movieName} size="lg" className="w-full py-4 text-sm rounded-2xl shadow-xl shadow-primary/20">
                {isUploading ? <Loader2 size={18} className="animate-spin mr-2" /> : null}
                {isUploading ? "Publishing Batch..." : `Publish ${songs.length} Song${songs.length !== 1 ? 's' : ''}`}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
