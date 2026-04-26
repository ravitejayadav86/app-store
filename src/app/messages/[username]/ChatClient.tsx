"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft, Send, Lock, Image as ImageIcon,
  Check, CheckCheck, FileText, Loader2, X, Download, Paperclip
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/lib/api";
import { toast } from "sonner";
import Link from "next/link";
import { useRealtime } from "@/hooks/useRealtime";

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

const timeAgo = (date: string) => {
  const d = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (d < 60)    return "just now";
  if (d < 3600)  return `${Math.floor(d / 60)}m ago`;
  if (d < 86400) return `${Math.floor(d / 3600)}h ago`;
  return new Date(date).toLocaleDateString("en", { month: "short", day: "numeric" });
};

const SPRING_MSG = { type: "spring", stiffness: 520, damping: 38, mass: 0.5 } as const;

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
  const [recipientAvatar,setRecipientAvatar]= useState<string | null>(null);
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

  const { isConnected, useEvent, sendEvent } = useRealtime(currentUserId || undefined);

  /* ── Auth ── */
  useEffect(() => {
    api.get("/users/me")
      .then(r => { setCurrentUserId(r.data.id); setCurrentUsername(r.data.username); })
      .catch(() => { toast.error("Please sign in"); router.push("/login"); });
    if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "default")
      Notification.requestPermission();
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
    api.get(`/social/profile/${username}`).then(r => setRecipientAvatar(r.data.avatar_url)).catch(() => {});
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

  /* ── Real-time ── */
  useEvent("MESSAGES_READ", () =>
    setMessages(p => p.map(m => ({ ...m, is_read: true })))
  );

  useEvent("NEW_MESSAGE", (msg) => {
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
        if (document.hidden && Notification.permission === "granted")
          new window.Notification(`@${username}`, { body: msg.content || "📎", icon: "/panda-logo.png", tag: `msg-${username}` });
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
    if (filesToUpload.length === 1 && fileInputRef.current) fileInputRef.current.value = "";
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
          if (file.size > 500 * 1024 * 1024) { toast.error(`${file.name} is too large`); continue; }
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
            setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
          } catch { toast.error(`Failed to upload ${file.name}`); }
        }
        setUploading(false); setUploadProgress(0);
      }
    } catch { toast.error("Failed to send"); }
    finally { setSending(false); setUploading(false); }
  };

  /* ─────────────────────────────────── RENDER ─────────────────────────── */
  /* Group messages by date */
  const messageGroups: { date: string; msgs: Message[] }[] = [];
  messages.forEach(m => {
    const day = new Date(m.created_at).toLocaleDateString("en", { weekday: "long", month: "short", day: "numeric" });
    const last = messageGroups[messageGroups.length - 1];
    if (!last || last.date !== day) messageGroups.push({ date: day, msgs: [m] });
    else last.msgs.push(m);
  });

  return (
    <div className="flex flex-col h-[calc(100dvh-0px)] max-h-[100dvh]" style={{ paddingTop: "env(safe-area-inset-top)" }}>

      {/* ── Header ────────────────────────────────────────────────────────── */}
      <div className="bottom-nav-glass border-b border-white/40 px-3 py-2.5 flex items-center gap-3 z-20 flex-shrink-0">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-xl hover:bg-primary/8 active:scale-90 transition-all text-on-surface-variant"
          aria-label="Back"
        >
          <ArrowLeft size={20} />
        </button>

        <Link href={`/users/${username}`} className="flex items-center gap-2.5 flex-1 min-w-0 group">
          {/* Avatar */}
          <div className="relative w-10 h-10 rounded-2xl overflow-hidden bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center font-bold text-primary border border-primary/10 flex-shrink-0">
            {recipientAvatar
              ? <img src={resolveMedia(recipientAvatar)} alt={username} className="w-full h-full object-cover" />
              : username[0]?.toUpperCase()}
            {/* Online dot */}
            <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${isConnected ? "bg-green-400" : "bg-on-surface-variant/20"}`} />
          </div>

          <div className="min-w-0">
            <p className="font-bold text-on-surface text-sm truncate group-hover:text-primary transition-colors">@{username}</p>
            <p className="text-[10px] font-semibold text-on-surface-variant/70 uppercase tracking-wider">
              {isConnected ? "Active now" : "Offline"}
            </p>
          </div>
        </Link>

        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-500/10 text-green-600 text-[9px] font-bold uppercase tracking-widest flex-shrink-0">
          <Lock size={9} /> Secure
        </div>
      </div>

      {/* ── Messages ──────────────────────────────────────────────────────── */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto overscroll-contain"
        style={{ WebkitOverflowScrolling: "touch", scrollbarWidth: "none" }}
        onScroll={handleScroll}
      >
        <div className="px-4 py-4 space-y-1 min-h-full flex flex-col justify-end">

          {/* Load more */}
          {hasMore && (
            <div className="flex justify-center py-3">
              <button onClick={loadMore} disabled={fetchingMore}
                className="text-[10px] font-bold uppercase tracking-widest text-primary/50 hover:text-primary transition-colors flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/5">
                {fetchingMore ? <Loader2 size={11} className="animate-spin" /> : "Load older"}
              </button>
            </div>
          )}

          {/* Empty state */}
          {messages.length === 0 && !fetchingMore && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 rounded-3xl bg-surface-low border border-outline-variant/30 flex items-center justify-center mb-4 shadow-inner">
                <Lock size={28} className="text-on-surface-variant/30" />
              </div>
              <p className="text-sm font-semibold text-on-surface-variant/60">Messages are end-to-end encrypted</p>
              <p className="text-xs text-on-surface-variant/40 mt-1">Say hello to @{username}!</p>
            </div>
          )}

          {/* Date-grouped messages */}
          {messageGroups.map(({ date, msgs }) => (
            <div key={date}>
              {/* Date divider */}
              <div className="flex items-center gap-3 my-4">
                <div className="flex-1 h-px bg-outline-variant/30" />
                <span className="text-[10px] font-bold text-on-surface-variant/50 uppercase tracking-wider px-2">{date}</span>
                <div className="flex-1 h-px bg-outline-variant/30" />
              </div>

              <div className="space-y-1">
                {msgs.map((msg, i) => {
                  const isMe = msg.sender_id === currentUserId || msg.sender_username === currentUsername;
                  const isFirst = i === 0 || msgs[i - 1].sender_username !== msg.sender_username;
                  const isLast  = i === msgs.length - 1 || msgs[i + 1].sender_username !== msg.sender_username;

                  return (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 8, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={SPRING_MSG}
                      style={{ willChange: "transform, opacity" }}
                      className={`flex items-end gap-2 ${isMe ? "justify-end" : "justify-start"}`}
                    >
                      {/* Recipient avatar — only on last bubble in a group */}
                      {!isMe && (
                        <div className={`w-7 h-7 rounded-xl overflow-hidden bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-[10px] font-bold text-primary border border-primary/10 flex-shrink-0 ${isLast ? "visible" : "invisible"}`}>
                          {recipientAvatar
                            ? <img src={resolveMedia(recipientAvatar)} alt={username} className="w-full h-full object-cover" />
                            : username[0]?.toUpperCase()}
                        </div>
                      )}

                      {/* Bubble */}
                      <div className={`relative max-w-[78%] md:max-w-[60%] ${
                        isMe
                          ? `bg-primary text-on-primary shadow-lg shadow-primary/20 ${isFirst && isLast ? "rounded-2xl" : isFirst ? "rounded-2xl rounded-br-md" : isLast ? "rounded-2xl rounded-tr-md" : "rounded-2xl rounded-r-md"}`
                          : `glass border-white/30 text-on-surface shadow-sm ${isFirst && isLast ? "rounded-2xl" : isFirst ? "rounded-2xl rounded-bl-md" : isLast ? "rounded-2xl rounded-tl-md" : "rounded-2xl rounded-l-md"}`
                      } overflow-hidden`}>

                        {/* Media */}
                        {msg.media_url && (
                          <div className="relative">
                            {msg.media_type === "image" ? (
                              <div>
                                <img
                                  src={resolveMedia(msg.media_url)} alt="attachment"
                                  className="w-full max-h-72 object-cover cursor-pointer"
                                  onClick={() => window.open(resolveMedia(msg.media_url), "_blank")}
                                />
                                <a href={resolveMedia(msg.media_url, true)} download target="_blank" rel="noopener noreferrer"
                                  className={`absolute bottom-2 right-2 p-1.5 rounded-xl backdrop-blur-md text-white shadow-lg ${isMe ? "bg-black/30 hover:bg-black/50" : "bg-black/20 hover:bg-black/40"} transition-colors`}
                                  onClick={e => e.stopPropagation()}>
                                  <Download size={13} />
                                </a>
                              </div>
                            ) : msg.media_type === "video" ? (
                              <div>
                                <video src={resolveMedia(msg.media_url)} controls className="w-full max-h-72 object-cover" />
                              </div>
                            ) : (
                              <a href={resolveMedia(msg.media_url, true)} target="_blank" rel="noopener noreferrer"
                                className={`flex items-center gap-2.5 p-3 ${isMe ? "bg-white/15 hover:bg-white/25" : "bg-primary/8 hover:bg-primary/15"} transition-colors`}>
                                <div className={`p-2 rounded-xl ${isMe ? "bg-white/20" : "bg-primary/10"}`}><FileText size={18} /></div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-bold truncate">Download File</p>
                                </div>
                                <Download size={14} />
                              </a>
                            )}
                          </div>
                        )}

                        {/* Text */}
                        {msg.content && (
                          <p className="px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                        )}

                        {/* Meta */}
                        <div className={`flex items-center gap-1 pb-1.5 pr-2 ${msg.content ? "px-3.5" : "px-3.5"} ${isMe ? "justify-end" : "justify-start"}`}>
                          <span className={`text-[9px] font-medium ${isMe ? "text-on-primary/55" : "text-on-surface-variant/60"}`}>
                            {timeAgo(msg.created_at)}
                          </span>
                          {isMe && (
                            msg.is_read
                              ? <CheckCheck size={11} className="text-on-primary/70" />
                              : <Check      size={11} className="text-on-primary/40" />
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          ))}

          <div ref={bottomRef} />
        </div>
      </div>

      {/* ── Input bar ─────────────────────────────────────────────────────── */}
      <div className="bottom-nav-glass border-t border-white/40 px-3 pt-2 flex-shrink-0"
        style={{ paddingBottom: "max(env(safe-area-inset-bottom), 12px)" }}>

        {/* File previews */}
        <AnimatePresence>
          {filesToUpload.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
              className="flex gap-2 overflow-x-auto pb-2 no-scrollbar"
            >
              {filesToUpload.map((file, idx) => (
                <div key={idx} className="relative flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden bg-surface-low border border-outline-variant/30 group">
                  <button onClick={() => removeFile(idx)}
                    className="absolute top-0.5 right-0.5 w-5 h-5 bg-black/60 rounded-full flex items-center justify-center text-white z-10 hover:bg-red-500 transition-colors">
                    <X size={10} />
                  </button>
                  {filePreviews[idx]
                    ? file.type.startsWith("video/")
                      ? <video src={filePreviews[idx]} className="w-full h-full object-cover" />
                      : <img src={filePreviews[idx]} alt="" className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex flex-col items-center justify-center gap-1 p-1">
                        <FileText size={18} className="text-primary" />
                        <p className="text-[8px] text-on-surface-variant text-center truncate w-full px-1">{file.name}</p>
                      </div>
                  }
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Upload progress */}
        {uploading && uploadProgress > 0 && (
          <div className="mb-2">
            <div className="flex justify-between text-[9px] font-bold mb-0.5">
              <span className="text-on-surface-variant">Uploading…</span>
              <span className="text-primary">{uploadProgress}%</span>
            </div>
            <div className="h-1 bg-surface-low rounded-full overflow-hidden">
              <motion.div className="h-full bg-primary rounded-full" animate={{ width: `${uploadProgress}%` }} transition={{ duration: 0.2 }} />
            </div>
          </div>
        )}

        {/* Composer */}
        <div className="flex items-end gap-2 py-1">
          {/* Attach */}
          <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" multiple />
          <button onClick={() => fileInputRef.current?.click()} disabled={sending}
            className="flex-shrink-0 p-2.5 rounded-2xl text-on-surface-variant hover:text-primary hover:bg-primary/8 active:scale-90 transition-all disabled:opacity-40 mb-0.5">
            <Paperclip size={20} />
          </button>

          {/* Text input */}
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              rows={1}
              value={newMessage}
              onChange={e => { setNewMessage(e.target.value); resizeTextarea(); }}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
              placeholder={`Message @${username}…`}
              disabled={sending}
              className="w-full px-4 py-3 pr-4 rounded-3xl bg-surface-low border border-outline-variant/40 focus:outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10 text-sm text-on-surface placeholder:text-on-surface-variant/50 resize-none leading-snug transition-all disabled:opacity-50"
              style={{ minHeight: 44, maxHeight: 120 }}
            />
          </div>

          {/* Send */}
          <motion.button
            onClick={handleSend}
            disabled={sending || (!newMessage.trim() && filesToUpload.length === 0)}
            whileTap={{ scale: 0.88 }}
            transition={{ duration: 0.08 }}
            className="flex-shrink-0 w-11 h-11 rounded-2xl bg-primary text-on-primary flex items-center justify-center shadow-lg shadow-primary/30 disabled:opacity-35 hover:shadow-primary/50 transition-shadow mb-0.5"
            style={{ willChange: "transform" }}
          >
            {sending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
          </motion.button>
        </div>
      </div>
    </div>
  );
}
