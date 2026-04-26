"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Send, Lock, Image as ImageIcon, Check, CheckCheck, FileText, Loader2, X, Download } from "lucide-react";
import api from "@/lib/api";
import { toast } from "sonner";
import Link from "next/link";

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

const resolveMediaUrl = (url: string | null | undefined, forDownload = false) => {
  if (!url) return "";
  let finalUrl = url;
  if (!(url.startsWith("http") || url.startsWith("blob:") || url.startsWith("data:"))) {
    finalUrl = `${API_BASE}${url}`;
  }
  
  if (forDownload && finalUrl.includes("cloudinary.com")) {
    return finalUrl.replace("/upload/", "/upload/fl_attachment/");
  }
  return finalUrl;
};

import { useRealtime } from "@/hooks/useRealtime";

export default function ChatClient({ username: propUsername }: { username?: string }) {
  const params = useParams();
  const username = propUsername || params.username as string;
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [currentUsername, setCurrentUsername] = useState<string | null>(null);

  const [recipientProfile, setRecipientProfile] = useState<{avatar_url?: string | null} | null>(null);
  const [filesToUpload, setFilesToUpload] = useState<File[]>([]);
  const [filePreviews, setFilePreviews] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const { isConnected: connected, useEvent, sendEvent } = useRealtime(currentUserId || undefined);

  const [hasMore, setHasMore] = useState(true);
  const [fetchingMore, setFetchingMore] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const atBottomRef = useRef(true);

  useEffect(() => {
    api.get("/users/me")
      .then(res => {
        setCurrentUserId(res.data.id);
        setCurrentUsername(res.data.username);
      })
      .catch(() => {
        toast.error("Please sign in to message");
        router.push("/login");
      });
    
    // Request notification permission
    if (typeof window !== "undefined" && "Notification" in window) {
      if (Notification.permission === "default") {
        Notification.requestPermission();
      }
    }
  }, [router]);

  const markAsRead = useCallback(async () => {
    try {
      await api.post(`/social/messages/${username}/read`);
      sendEvent({
        type: "READ",
        to: username
      });
    } catch (err) {
      console.error("Failed to mark messages as read", err);
    }
  }, [username, sendEvent]);

  const fetchMessages = useCallback(async () => {
    try {
      const res = await api.get(`/social/messages/${username}?limit=50`);
      setMessages(res.data);
      if (res.data.length < 50) setHasMore(false);
      // Mark as read when messages are loaded
      markAsRead();
    } catch {
      toast.error("Failed to load messages");
    }
  }, [username, markAsRead]);

  const loadMoreMessages = async () => {
    if (!hasMore || fetchingMore || messages.length === 0) return;
    setFetchingMore(true);
    try {
      const beforeId = messages[0].id;
      const res = await api.get(`/social/messages/${username}?limit=50&before_id=${beforeId}`);
      if (res.data.length < 50) setHasMore(false);
      setMessages(prev => [...res.data, ...prev]);
    } catch {
      console.error("Failed to load more messages");
    } finally {
      setFetchingMore(false);
    }
  };

  useEffect(() => {
    if (currentUserId) fetchMessages();
    
    // Fetch recipient profile for avatar
    if (username) {
      api.get(`/social/profile/${username}`)
        .then(res => setRecipientProfile(res.data))
        .catch(() => {});
    }
  }, [currentUserId, fetchMessages, username]);

  // WebSocket connection using the shared hook
  useEvent("MESSAGES_READ", () => {
    setMessages(prev => prev.map(m => ({ ...m, is_read: true })));
  });

  useEvent("NEW_MESSAGE", (msg) => {
    // Ignore notifications in the chat list
    if (msg.type === "NOTIFICATION") return;

    setMessages(prev => {
      // Verify this message belongs to the current conversation
      const isFromMe = msg.sender_id === currentUserId || msg.sender_username === currentUsername;
      const isFromRecipient = msg.sender_username === username;

      if (!isFromMe && !isFromRecipient) {
        return prev; // Ignore messages from other users in this chat window
      }

      const exists = prev.some(m => m.id === msg.id);
      if (exists) return prev;

      // Deduplicate optimistic messages
      if (isFromMe) {
        const optIdx = prev.findIndex(m => m.id < 0 && m.content === msg.content);
        if (optIdx !== -1) {
          const next = [...prev];
          next[optIdx] = msg;
          return next;
        }
      }
      
      // Mark incoming messages as read immediately
      if (isFromRecipient) {
        sendEvent({ type: "READ", to: username });
        // Native push notification when tab is hidden
        if (typeof window !== "undefined" && document.hidden && Notification.permission === "granted") {
          new window.Notification(`New message from @${username}`, {
            body: msg.content || "📎 Attachment",
            icon: "/panda-logo.png",
            tag: `msg-${username}`, // dedup: only one notif per sender
          });
        }
      }

      return [...prev, msg];
    });

    // Auto-scroll: always for own messages, for received when near bottom
    const isOwn = msg.sender_id === currentUserId || msg.sender_username === currentUsername;
    if (isOwn || atBottomRef.current) {
      setTimeout(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 50);
    }
  });


  useEffect(() => {
    // Initial scroll to bottom on first load
    if (messages.length > 0 && messages.length <= 50 && !fetchingMore) {
      bottomRef.current?.scrollIntoView({ behavior: "auto" });
    }
  }, [messages.length, fetchingMore]);

  // Track whether user is near the bottom
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    atBottomRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
    if (el.scrollTop === 0 && hasMore && !fetchingMore) {
      loadMoreMessages();
    }
  };


  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length === 0) return;
    
    setFilesToUpload(prev => [...prev, ...selectedFiles]);
    
    const newPreviews = selectedFiles.map(file => {
      // Only create preview URLs for actual images/videos to avoid crashing the browser
      if (file.type.startsWith("image/") || file.type.startsWith("video/")) {
        return URL.createObjectURL(file);
      }
      // Return empty string for APKs, ZIPs, etc so it falls back to the FileText icon
      return "";
    });
    
    setFilePreviews(prev => [...prev, ...newPreviews]);
  };

  const removeFile = (index: number) => {
    setFilesToUpload(prev => prev.filter((_, i) => i !== index));
    setFilePreviews(prev => {
      // Revoke the object URL to prevent memory leaks
      if (prev[index]) {
        URL.revokeObjectURL(prev[index]);
      }
      return prev.filter((_, i) => i !== index);
    });
    if (filesToUpload.length === 1 && fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const clearAllFiles = () => {
    setFilesToUpload([]);
    filePreviews.forEach(url => {
      if (url) URL.revokeObjectURL(url);
    });
    setFilePreviews([]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSend = async () => {
    if (!newMessage.trim() && filesToUpload.length === 0) return;
    setSending(true);

    const textContent = newMessage.trim();
    setNewMessage("");
    const files = [...filesToUpload];
    clearAllFiles();

    try {
      if (files.length === 0) {
        // Optimistic: show message immediately (negative ID indicates optimistic)
        const optimisticId = -Date.now();
        const optimistic: Message = {
          id: optimisticId,
          sender_id: currentUserId!,
          receiver_id: 0,
          content: textContent,
          is_read: false,
          created_at: new Date().toISOString(),
          sender_username: currentUsername!,
        };
        setMessages(prev => [...prev, optimistic]);
        setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);

        // Send via WS or REST
        const sentViaWs = sendEvent({ to: username, content: textContent, media_url: null, media_type: null });
        if (!sentViaWs) {
          const res = await api.post(`/social/messages/${username}`, { content: textContent, media_url: null, media_type: null });
          // Replace optimistic message with server-confirmed one
          setMessages(prev => prev.map(m => m.id === optimisticId ? { ...res.data, sender_id: currentUserId!, sender_username: currentUsername! } : m));
        } else {
          // WS echo will arrive; remove optimistic duplicate when it does
          // (handled in NEW_MESSAGE dedup by id)
        }
      } else {
        // File uploads
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          if (file.size > 500 * 1024 * 1024) {
            toast.error(`File ${file.name} is too large. Max 500MB.`);
            continue;
          }

          setUploading(true);
          setUploadProgress(0);
          const formData = new FormData();
          formData.append("file", file);

          try {
            const res = await api.post(`/social/messages/${username}/upload`, formData, {
              headers: { "Content-Type": "multipart/form-data" },
              onUploadProgress: (e) => {
                if (e.total) setUploadProgress(Math.round((e.loaded * 100) / e.total));
              },
            });

            const msgContent = (i === 0 && textContent) ? textContent : "";
            const sentViaWs = sendEvent({ to: username, content: msgContent, media_url: res.data.media_url, media_type: res.data.media_type });
            if (!sentViaWs) {
              await api.post(`/social/messages/${username}`, { content: msgContent, media_url: res.data.media_url, media_type: res.data.media_type });
            }
            setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
          } catch (err) {
            console.error("Upload error:", err);
            toast.error(`Failed to upload ${file.name}`);
          }
        }
        setUploading(false);
        setUploadProgress(0);
      }
    } catch {
      toast.error("Failed to send message.");
    } finally {
      setSending(false);
      setUploading(false);
    }
  };

  const emitMessage = async (content: string, media_url: string | null, media_type: string | null) => {
    const sentViaWs = sendEvent({
      to: username,
      content,
      media_url,
      media_type
    });
    
    if (!sentViaWs) {
      const res = await api.post(`/social/messages/${username}`, { 
        content,
        media_url,
        media_type
      });
      setMessages(prev => [...prev, {
        ...res.data,
        sender_id: currentUserId!,
        sender_username: currentUsername!,
        receiver_id: 0,
        is_read: false
      }]);
    }
  };

  const timeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return new Date(date).toLocaleDateString();
  };



  return (
    <div className="flex flex-col h-[calc(100vh-80px)] mt-20 md:mt-24">
      {/* Header */}
      <div className="mx-4 my-2 px-3 py-2 liquid-glass flex items-center gap-3 sticky top-24 z-20 border border-white/20">
        <button onClick={() => router.back()} className="p-2 rounded-xl hover:bg-primary/5 transition-colors">
          <ArrowLeft size={18} />
        </button>
        <Link href={`/users/${username}`} className="flex items-center gap-2.5 hover:opacity-80 transition-opacity flex-1">
          <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center font-bold text-primary text-sm overflow-hidden shadow-inner border border-primary/5">
            {recipientProfile?.avatar_url 
              ? <img src={resolveMediaUrl(recipientProfile.avatar_url)} alt={username as string} className="w-full h-full object-cover" />
              : (username as string)?.[0]?.toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="font-bold text-on-surface text-sm truncate">@{username}</p>
            <div className="flex items-center gap-1">
              <div className={`w-1.5 h-1.5 rounded-full ${connected ? "bg-green-500 animate-pulse" : "bg-on-surface-variant/30"}`} />
              <p className="text-[9px] font-bold uppercase tracking-wider text-on-surface-variant">{connected ? "Online" : "Offline"}</p>
            </div>
          </div>
        </Link>
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/5 text-[9px] font-bold uppercase tracking-widest text-primary">
          <Lock size={10} /> Secure
        </div>
      </div>

      {/* Messages */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 py-6 space-y-4 bg-surface/30 overscroll-contain"
        style={{ WebkitOverflowScrolling: "touch" }}
        onScroll={handleScroll}
      >

        {hasMore && (
          <div className="flex justify-center py-2">
            <button 
              onClick={loadMoreMessages}
              disabled={fetchingMore}
              className="text-[10px] font-bold uppercase tracking-widest text-primary/60 hover:text-primary transition-colors flex items-center gap-2"
            >
              {fetchingMore ? <Loader2 size={12} className="animate-spin" /> : "Load older messages"}
            </button>
          </div>
        )}

        {messages.length === 0 && !fetchingMore && (
          <div className="flex flex-col items-center justify-center h-full text-on-surface-variant space-y-4 opacity-40">
            <div className="p-4 rounded-3xl bg-surface-low border border-outline-variant/50">
              <Lock size={40} />
            </div>
            <p className="text-sm font-medium">Messages are end-to-end encrypted.</p>
          </div>
        )}
        {messages.map((msg, i) => {
          const isMe = msg.sender_id === currentUserId ||
            msg.sender_username === currentUsername;
          const showAvatar = !isMe && (i === 0 || messages[i-1].sender_id !== msg.sender_id);
          
          return (
            <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"} items-end gap-2 px-1`}>
              {!isMe && (
                <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center text-xs font-bold text-primary flex-shrink-0 overflow-hidden mb-1 border border-primary/5">
                  {showAvatar ? (
                    msg.sender_avatar_url 
                      ? <img src={resolveMediaUrl(msg.sender_avatar_url)} alt={msg.sender_username} className="w-full h-full object-cover" />
                      : msg.sender_username?.[0]?.toUpperCase()
                  ) : null}
                </div>
              )}
              <div className={`max-w-[85%] px-4 py-2.5 shadow-md ${
                isMe
                  ? "bg-primary text-white rounded-2xl rounded-br-none shadow-primary/20"
                  : "glass bg-white/60 text-on-surface rounded-2xl rounded-bl-none border-white/30"
              } transition-all duration-300`}>
                {msg.media_url && (
                  <div className="mb-2 rounded-2xl overflow-hidden mt-1 group/media relative bg-black/5 min-h-[120px] flex items-center justify-center">
                    {msg.media_type === "image" ? (
                      <>
                        <img 
                          src={resolveMediaUrl(msg.media_url)} 
                          alt="attachment" 
                          className="w-full h-auto max-h-80 object-cover cursor-pointer hover:scale-[1.02] transition-transform duration-300" 
                          onClick={() => window.open(resolveMediaUrl(msg.media_url), '_blank')}
                          onLoad={(e) => (e.currentTarget.parentElement!.style.minHeight = '0')}
                        />
                        <div className="p-2 border-t border-white/10 flex justify-end w-full">
                          <a 
                            href={resolveMediaUrl(msg.media_url, true)} 
                            download 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${isMe ? "bg-white/10 hover:bg-white/20 text-white" : "bg-primary/10 hover:bg-primary/20 text-primary"}`}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Download size={12} /> Download
                          </a>
                        </div>
                      </>
                    ) : msg.media_type === "video" ? (
                      <div className="relative group/vid flex flex-col w-full">
                        <video src={resolveMediaUrl(msg.media_url)} controls className="w-full h-auto max-h-80 object-cover rounded-2xl" />
                        <div className="p-2 flex justify-end">
                          <a 
                            href={resolveMediaUrl(msg.media_url, true)} 
                            download 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${isMe ? "bg-white/10 hover:bg-white/20 text-white" : "bg-primary/10 hover:bg-primary/20 text-primary"}`}
                          >
                            <Download size={12} /> Download
                          </a>
                        </div>
                      </div>
                    ) : (
                      <a href={resolveMediaUrl(msg.media_url, true)} target="_blank" rel="noopener noreferrer" className={`flex items-center gap-2 p-3 rounded-2xl w-full ${isMe ? "bg-white/20 hover:bg-white/30" : "bg-outline-variant/20 hover:bg-outline-variant/30"} transition-colors`}>
                        <FileText size={20} />
                        <span className="text-sm font-bold truncate flex-1">Download File</span>
                        <Download size={16} />
                      </a>
                    )}
                  </div>
                )}
                {msg.content && (
                  <p className="leading-relaxed text-sm whitespace-pre-wrap">{msg.content}</p>
                )}
                <div className={`flex items-center gap-1.5 mt-1.5 ${isMe ? "justify-end" : "justify-start"}`}>
                   <p className={`text-[10px] font-medium ${isMe ? "text-on-primary/60" : "text-on-surface-variant"}`}>
                    {timeAgo(msg.created_at)}
                  </p>
                  {isMe && (
                    <span className="flex items-center">
                      {msg.is_read ? (
                        <CheckCheck size={12} className="text-on-primary" />
                      ) : (
                        <Check size={12} className="text-on-primary/40" />
                      )}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-4 sticky bottom-8 z-20">
        <div className="max-w-4xl mx-auto flex flex-col gap-3 liquid-glass p-4 border border-white/20">
          
          {filesToUpload.length > 0 && (
            <div className="flex flex-wrap items-center gap-3 animate-in fade-in slide-in-from-bottom-2">
              {filesToUpload.map((file, idx) => (
                <div key={idx} className="flex items-center gap-3 p-2 pr-4 rounded-2xl bg-surface-low border border-outline-variant relative group">
                  <button onClick={() => removeFile(idx)} className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center shadow-lg text-white hover:scale-110 transition-transform z-10">
                    <X size={10} />
                  </button>
                  {filePreviews[idx] ? (
                    <div className="w-10 h-10 rounded-xl overflow-hidden bg-black/10">
                      {file.type.startsWith("video/") ? (
                        <video src={filePreviews[idx]} className="w-full h-full object-cover" />
                      ) : (
                        <img src={filePreviews[idx]} alt="preview" className="w-full h-full object-cover" />
                      )}
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                      <FileText size={18} />
                    </div>
                  )}
                  <div className="max-w-[100px]">
                    <p className="text-[10px] font-bold text-on-surface truncate">{file.name}</p>
                    <p className="text-[8px] text-on-surface-variant">{(file.size / 1024 / 1024).toFixed(1)} MB</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Upload progress bar */}
          {uploading && uploadProgress > 0 && (
            <div className="w-full">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-bold text-on-surface-variant">Uploading...</span>
                <span className="text-[10px] font-bold text-primary">{uploadProgress}%</span>
              </div>
              <div className="w-full h-1.5 bg-surface-low rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-150"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          <div className="flex items-center gap-3">
            <div className="flex-1 relative">
              <input
                value={newMessage}
                onChange={e => setNewMessage(e.target.value)}
                onKeyDown={e => e.key === "Enter" && !e.shiftKey && handleSend()}
                placeholder="Message..."
                disabled={sending}
                className="w-full pl-5 pr-12 py-3.5 rounded-3xl bg-surface-low border border-outline-variant text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all shadow-inner disabled:opacity-50"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                 <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" multiple />
                 <button onClick={() => fileInputRef.current?.click()} disabled={sending} className="p-2 rounded-full text-on-surface-variant hover:text-primary hover:bg-primary/10 transition-colors disabled:opacity-50">
                    <ImageIcon size={18} />
                 </button>
              </div>
            </div>
            <button
              onClick={handleSend}
              disabled={sending || (!newMessage.trim() && filesToUpload.length === 0)}
              className="w-12 h-12 flex-shrink-0 rounded-2xl bg-primary text-on-primary flex items-center justify-center disabled:opacity-40 hover:scale-105 active:scale-95 transition-all shadow-lg shadow-primary/20"
            >
              {sending ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
