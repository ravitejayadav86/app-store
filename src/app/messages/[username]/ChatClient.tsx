"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft, Send, Lock, Image as ImageIcon,
  Check, CheckCheck, FileText, Loader2, X, Download, Paperclip, 
  Phone, Video, Info, Mic, Smile, Heart, Camera
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/lib/api";
import { toast } from "sonner";
import Link from "next/link";
import { useRealtime, useRealtimeEvent } from "@/hooks/useRealtime";

/* ─────────────────────────────────────────────────────────────────────────── */
interface Message {
  id: number;
  sender_id: number;
  receiver_id: number;
  content: string;
  is_read: boolean;
  created_at: string;
  sender_username: string;
  sender_avatar_url?: string | null;
  media_url?: string | null;
  media_type?: string | null;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://pandas-store-api.onrender.com";

const resolveMedia = (url: string | null | undefined, dl = false) => {
  if (!url) return "";
  const final = url.startsWith("http") || url.startsWith("blob:") || url.startsWith("data:")
    ? url : `${API_BASE}${url}`;
  return dl && final.includes("cloudinary.com")
    ? final.replace("/upload/", "/upload/fl_attachment/")
    : final;
};

const SPRING_MSG = { type: "spring", stiffness: 500, damping: 40, mass: 0.8 } as const;

/* ─────────────────────────────────────────────────────────────────────────── */
export default function ChatClient({ username: propUsername }: { username?: string }) {
  const params   = useParams();
  const username = (propUsername || params.username) as string;
  const router   = useRouter();

  const [messages,       setMessages]       = useState<Message[]>([]);
  const [newMessage,     setNewMessage]     = useState("");
  const [sending,        setSending]        = useState(false);
  const [currentUserId,  setCurrentUserId]  = useState<number | null>(null);
  const [currentUsername,setCurrentUsername]= useState<string | null>(null);
  const [recipientId,    setRecipientId]    = useState<number | null>(null);
  const [recipientAvatar,setRecipientAvatar]= useState<string | null>(null);
  const [isOnline,       setIsOnline]       = useState(false);
  const [filesToUpload,  setFilesToUpload]  = useState<File[]>([]);
  const [filePreviews,   setFilePreviews]   = useState<string[]>([]);
  const [uploading,      setUploading]      = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [hasMore,        setHasMore]        = useState(true);
  const [fetchingMore,   setFetchingMore]   = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const bottomRef    = useRef<HTMLDivElement>(null);
  const scrollRef    = useRef<HTMLDivElement>(null);
  const atBottom     = useRef(true);
  const textareaRef  = useRef<HTMLTextAreaElement>(null);

  const { isConnected, sendEvent } = useRealtime(currentUserId || undefined);

  /* ── Auth ── */
  useEffect(() => {
    api.get("/users/me")
      .then(r => { setCurrentUserId(r.data.id); setCurrentUsername(r.data.username); })
      .catch(() => { toast.error("Please sign in"); router.push("/login"); });
  }, [router]);

  /* ── Mark read ── */
  const markRead = useCallback(async () => {
    try { await api.post(`/social/messages/${username}/read`); sendEvent({ type: "READ", to: username }); }
    catch {}
  }, [username, sendEvent]);

  /* ── Fetch ── */
  const fetchMessages = useCallback(async () => {
    try {
      const r = await api.get(`/social/messages/${username}?limit=50`);
      setMessages(r.data);
      if (r.data.length < 50) setHasMore(false);
      markRead();
    } catch { toast.error("Failed to load messages"); }
  }, [username, markRead]);

  const loadMore = async () => {
    if (!hasMore || fetchingMore || messages.length === 0) return;
    setFetchingMore(true);
    try {
      const r = await api.get(`/social/messages/${username}?limit=50&before_id=${messages[0].id}`);
      if (r.data.length < 50) setHasMore(false);
      setMessages(p => [...r.data, ...p]);
    } catch {} finally { setFetchingMore(false); }
  };

  useEffect(() => {
    if (!currentUserId) return;
    fetchMessages();
    api.get(`/social/profile/${username}`).then(r => {
      setRecipientId(r.data.id);
      setRecipientAvatar(r.data.avatar_url);
      setIsOnline(r.data.is_online);
    }).catch(() => {});
  }, [currentUserId, fetchMessages, username]);

  /* ── Scroll ── */
  useEffect(() => {
    if (messages.length > 0 && messages.length <= 50 && !fetchingMore)
      bottomRef.current?.scrollIntoView({ behavior: "auto" });
  }, [messages.length, fetchingMore]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    atBottom.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
    if (el.scrollTop === 0 && hasMore && !fetchingMore) loadMore();
  };

  /* ── Real-time Events ── */
  useRealtimeEvent(currentUserId || undefined, "MESSAGES_READ", () =>
    setMessages(p => p.map(m => ({ ...m, is_read: true })))
  );

  useRealtimeEvent(currentUserId || undefined, "PRESENCE_CHANGE", (data) => {
    if (data.user_id === recipientId) {
      setIsOnline(data.is_online);
    }
  });

  useRealtimeEvent(currentUserId || undefined, "NEW_MESSAGE", (msg) => {
    if (msg.type === "NOTIFICATION") return;
    const isMe   = msg.sender_id === currentUserId || msg.sender_username === currentUsername;
    const isFrom = msg.sender_username === username;
    if (!isMe && !isFrom) return;
    setMessages(p => {
      if (p.some(m => m.id === msg.id)) return p;
      if (isMe) {
        const oi = p.findIndex(m => m.id < 0 && m.content === msg.content);
        if (oi !== -1) { const n = [...p]; n[oi] = msg; return n; }
      }
      if (isFrom) {
        sendEvent({ type: "READ", to: username });
      }
      return [...p, msg];
    });
    if (isMe || atBottom.current)
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
  });

  /* ── Files ── */
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setFilesToUpload(p => [...p, ...files]);
    setFilePreviews(p => [...p, ...files.map(f =>
      f.type.startsWith("image/") || f.type.startsWith("video/") ? URL.createObjectURL(f) : ""
    )]);
  };

  const removeFile = (i: number) => {
    setFilesToUpload(p => p.filter((_, j) => j !== i));
    setFilePreviews(p => { if (p[i]) URL.revokeObjectURL(p[i]); return p.filter((_, j) => j !== i); });
  };

  const clearFiles = () => {
    filePreviews.forEach(u => { if (u) URL.revokeObjectURL(u); });
    setFilesToUpload([]); setFilePreviews([]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  /* ── Auto-resize textarea ── */
  const resizeTextarea = () => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = Math.min(ta.scrollHeight, 120) + "px";
  };

  /* ── Send ── */
  const handleSend = async () => {
    if (!newMessage.trim() && filesToUpload.length === 0) return;
    setSending(true);
    const text  = newMessage.trim();
    const files = [...filesToUpload];
    setNewMessage(""); clearFiles();
    if (textareaRef.current) textareaRef.current.style.height = "auto";

    try {
      if (files.length === 0) {
        const optId = -Date.now();
        setMessages(p => [...p, {
          id: optId, sender_id: currentUserId!, receiver_id: 0, content: text,
          is_read: false, created_at: new Date().toISOString(), sender_username: currentUsername!
        }]);
        setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
        const ok = sendEvent({ to: username, content: text, media_url: null, media_type: null });
        if (!ok) {
          const r = await api.post(`/social/messages/${username}`, { content: text, media_url: null, media_type: null });
          setMessages(p => p.map(m => m.id === optId
            ? { ...r.data, sender_id: currentUserId!, sender_username: currentUsername! } : m));
        }
      } else {
        setUploading(true);
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          setUploadProgress(0);
          const fd = new FormData(); fd.append("file", file);
          try {
            const r = await api.post(`/social/messages/${username}/upload`, fd, {
              headers: { "Content-Type": "multipart/form-data" },
              onUploadProgress: (e) => { if (e.total) setUploadProgress(Math.round((e.loaded * 100) / e.total)); }
            });
            const content = i === 0 && text ? text : "";
            const ok = sendEvent({ to: username, content, media_url: r.data.media_url, media_type: r.data.media_type });
            if (!ok) await api.post(`/social/messages/${username}`, { content, media_url: r.data.media_url, media_type: r.data.media_type });
          } catch { toast.error(`Failed to upload ${file.name}`); }
        }
        setUploading(false); setUploadProgress(0);
      }
    } catch { toast.error("Failed to send"); }
    finally { setSending(false); setUploading(false); }
  };

  return (
    <div className="flex flex-col h-screen bg-surface">

      {/* ── Header ── */}
      <header className="px-4 py-3 border-b border-outline-variant/30 flex items-center justify-between sticky top-0 z-50 bg-surface/80 backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="text-on-surface">
            <ArrowLeft size={24} />
          </button>
          <Link href={`/users/${username}`} className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full overflow-hidden bg-surface-low border border-outline-variant/30 flex items-center justify-center font-bold text-primary">
              {recipientAvatar
                ? <img src={resolveMedia(recipientAvatar)} alt={username} className="w-full h-full object-cover" />
                : username[0]?.toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-black text-on-surface">@{username}</p>
              {isOnline ? (
                <p className="text-[10px] text-green-500 font-bold tracking-tight">Active now</p>
              ) : (
                <p className="text-[10px] text-on-surface-variant font-bold tracking-tight">Offline</p>
              )}
            </div>
          </Link>
        </div>
        <div className="flex items-center gap-5 text-on-surface">
          <Phone size={22} />
          <Video size={24} />
          <Info size={22} />
        </div>
      </header>

      {/* ── Messages ── */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 py-6 space-y-4 no-scrollbar"
        onScroll={handleScroll}
      >
        <div className="flex flex-col items-center py-10 opacity-50">
           <div className="w-20 h-20 rounded-full overflow-hidden bg-surface-low border border-outline-variant/30 flex items-center justify-center font-bold text-primary mb-3">
              {recipientAvatar ? <img src={resolveMedia(recipientAvatar)} className="w-full h-full object-cover" /> : username[0]?.toUpperCase()}
           </div>
           <p className="font-black text-lg text-on-surface">@{username}</p>
           <p className="text-xs text-on-surface-variant font-bold">Panda Community Member</p>
           <Link href={`/users/${username}`}>
              <button className="mt-4 px-4 py-1.5 rounded-lg bg-surface-low text-xs font-black border border-outline-variant/30">View Profile</button>
           </Link>
        </div>

        {messages.map((msg, i) => {
          const isMe = msg.sender_id === currentUserId || msg.sender_username === currentUsername;
          const isLast = i === messages.length - 1 || messages[i + 1].sender_username !== msg.sender_username;
          const isFirst = i === 0 || messages[i - 1].sender_username !== msg.sender_username;
          
          return (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={SPRING_MSG}
              className={`flex flex-col ${isMe ? "items-end" : "items-start"} ${isLast ? "mb-4" : "mb-0.5"}`}
            >
              <div className={`flex items-end gap-2 max-w-[80%]`}>
                {!isMe && isLast && (
                  <div className="w-7 h-7 rounded-full overflow-hidden bg-surface-low border border-outline-variant/30 mb-0.5 flex-shrink-0">
                    {recipientAvatar ? <img src={resolveMedia(recipientAvatar)} className="w-full h-full object-cover" /> : username[0].toUpperCase()}
                  </div>
                )}
                {!isMe && !isLast && <div className="w-7 flex-shrink-0" />}

                <div className={`group relative rounded-[20px] px-4 py-2.5 text-sm ${
                  isMe 
                    ? "bg-primary text-on-primary rounded-br-[4px]" 
                    : "bg-surface-low text-on-surface rounded-bl-[4px]"
                } ${!isFirst && isMe ? "rounded-tr-[20px]" : ""} ${!isFirst && !isMe ? "rounded-tl-[20px]" : ""}`}>
                  
                  {msg.media_url && (
                    <div className="mb-2 -mx-1 overflow-hidden rounded-xl bg-black/5">
                       {msg.media_type === "image" ? (
                         <img src={resolveMedia(msg.media_url)} alt="" className="max-h-[300px] w-full object-cover" />
                       ) : <div className="p-3 flex items-center gap-2"><FileText size={20} /> <span className="text-xs truncate">File attachment</span></div>}
                    </div>
                  )}

                  <p className="leading-tight">{msg.content}</p>
                </div>
              </div>
              
              {isLast && isMe && msg.is_read && i === messages.length - 1 && (
                <p className="text-[10px] text-on-surface-variant/40 font-bold mt-1 mr-1">Seen</p>
              )}
            </motion.div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* ── Input ── */}
      <div className="px-4 py-3 bg-surface border-t border-outline-variant/10">
        <div className="flex items-center gap-3">
          <div className="flex-1 bg-surface-low rounded-[26px] border border-outline-variant/30 flex items-center px-4 py-2 gap-3 min-h-[48px]">
            <button className="text-primary hover:bg-primary/5 rounded-full p-1"><Camera size={22} /></button>
            <textarea
              ref={textareaRef}
              rows={1}
              value={newMessage}
              onChange={e => { setNewMessage(e.target.value); resizeTextarea(); }}
              placeholder="Message..."
              className="flex-1 bg-transparent border-none focus:ring-0 text-sm py-1.5 resize-none no-scrollbar leading-tight"
            />
            {!newMessage.trim() && (
              <div className="flex items-center gap-3 text-on-surface-variant/60">
                 <Mic size={22} />
                 <ImageIcon size={22} onClick={() => fileInputRef.current?.click()} className="cursor-pointer" />
                 <Smile size={22} />
              </div>
            )}
            {newMessage.trim() && (
              <button onClick={handleSend} className="text-primary font-black text-sm pr-1">Send</button>
            )}
          </div>
          {!newMessage.trim() && (
            <Heart size={24} className="text-on-surface" />
          )}
        </div>
      </div>
      <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" multiple />
    </div>
  );
}
