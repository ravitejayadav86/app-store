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
const WS_BASE = API_BASE.replace("https://", "wss://").replace("http://", "ws://");

export default function ChatPage() {
  const { username } = useParams();
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [currentUsername, setCurrentUsername] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);
  const [recipientProfile, setRecipientProfile] = useState<{avatar_url?: string | null} | null>(null);
  const [filesToUpload, setFilesToUpload] = useState<File[]>([]);
  const [filePreviews, setFilePreviews] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<WebSocket | null>(null);

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
  }, [router]);

  const markAsRead = useCallback(async () => {
    try {
      await api.post(`/social/messages/${username}/read`);
      // Also send via WebSocket if connected for immediate update
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({
          type: "READ",
          to: username
        }));
      }
    } catch (err) {
      console.error("Failed to mark messages as read", err);
    }
  }, [username]);

  const fetchMessages = useCallback(async () => {
    try {
      const res = await api.get(`/social/messages/${username}`);
      setMessages(res.data);
      // Mark as read when messages are loaded
      markAsRead();
    } catch {
      toast.error("Failed to load messages");
    }
  }, [username, markAsRead]);

  useEffect(() => {
    if (currentUserId) fetchMessages();
    
    // Fetch recipient profile for avatar
    if (username) {
      api.get(`/social/profile/${username}`)
        .then(res => setRecipientProfile(res.data))
        .catch(() => {});
    }
  }, [currentUserId, fetchMessages, username]);

  // WebSocket connection
  useEffect(() => {
    if (!currentUserId) return;

    const ws = new WebSocket(`${WS_BASE}/social/ws/${currentUserId}`);
    wsRef.current = ws;

    ws.onopen = () => setConnected(true);
    ws.onclose = () => setConnected(false);
    ws.onerror = () => setConnected(false);

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        
        if (msg.type === "MESSAGES_READ") {
          setMessages(prev => prev.map(m => ({ ...m, is_read: true })));
          return;
        }

        setMessages(prev => {
          const exists = prev.some(m => m.id === msg.id);
          if (exists) return prev;
          
          // If we receive a message while in the chat, mark it as read immediately
          if (msg.sender_username === username) {
             // Send read confirmation back
             ws.send(JSON.stringify({ type: "READ", to: username }));
          }
          
          return [...prev, msg];
        });
      } catch {}
    };

    return () => {
      ws.close();
    };
  }, [currentUserId, username]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length === 0) return;
    
    setFilesToUpload(prev => [...prev, ...selectedFiles]);
    
    selectedFiles.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFilePreviews(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeFile = (index: number) => {
    setFilesToUpload(prev => prev.filter((_, i) => i !== index));
    setFilePreviews(prev => prev.filter((_, i) => i !== index));
    if (filesToUpload.length === 1 && fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const clearAllFiles = () => {
    setFilesToUpload([]);
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
        // Just text message
        await emitMessage(textContent, null, null);
      } else {
        // Send files one by one
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          if (file.size > 500 * 1024 * 1024) {
            toast.error(`File ${file.name} is too large. Max 500MB.`);
            continue;
          }

          setUploading(true);
          const formData = new FormData();
          formData.append("file", file);
          
          try {
            const res = await api.post(`/social/messages/${username}/upload`, formData, {
              headers: { "Content-Type": "multipart/form-data" }
            });
            
            // For the first file, attach the text message if any
            const msgContent = (i === 0 && textContent) ? textContent : "";
            await emitMessage(msgContent, res.data.media_url, res.data.media_type);
          } catch (err) {
            console.error("Upload error:", err);
            toast.error(`Failed to upload ${file.name}`);
          }
        }
        setUploading(false);
      }
    } catch {
      toast.error("Failed to send message.");
    } finally {
      setSending(false);
      setUploading(false);
    }
  };

  const emitMessage = async (content: string, media_url: string | null, media_type: string | null) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        to: username,
        content,
        media_url,
        media_type
      }));
    } else {
      const res = await api.post(`/social/messages/${username}`, { 
        content,
        media_url,
        media_type
      });
      setMessages(prev => [...prev, {
        ...res.data,
        sender_id: currentUserId!,
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

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] mt-20">
      {/* Header */}
      <div className="flex items-center gap-4 px-4 py-3 border-b border-outline-variant/30 bg-surface/80 backdrop-blur-md sticky top-0 z-20">
        <button onClick={() => router.back()} className="text-on-surface-variant hover:text-primary transition-colors">
          <ArrowLeft size={20} />
        </button>
        <Link href={`/users/${username}`} className="flex items-center gap-3 hover:opacity-80 transition-opacity flex-1">
          <div className="w-10 h-10 rounded-2xl bg-linear-to-br from-primary/20 to-transparent flex items-center justify-center font-bold text-primary text-sm overflow-hidden shadow-inner border border-primary/5">
            {recipientProfile?.avatar_url 
              ? <img src={resolveMediaUrl(recipientProfile.avatar_url)} alt={username as string} className="w-full h-full object-cover" />
              : (username as string)?.[0]?.toUpperCase()}
          </div>
          <div>
            <p className="font-bold text-on-surface text-sm">@{username}</p>
            <div className="flex items-center gap-1.5">
              <div className={`w-2 h-2 rounded-full ${connected ? "bg-green-500 animate-pulse" : "bg-on-surface-variant/30"}`} />
              <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">{connected ? "Connected" : "Offline"}</p>
            </div>
          </div>
        </Link>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/5 text-[10px] font-bold uppercase tracking-widest text-primary">
          <Lock size={12} /> E2E Active
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4 bg-surface/30">
        {messages.length === 0 && (
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
            <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"} items-end gap-2`}>
              {!isMe && (
                <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center text-xs font-bold text-primary flex-shrink-0 overflow-hidden mb-1 border border-primary/5">
                  {showAvatar ? (
                    msg.sender_avatar_url 
                      ? <img src={resolveMediaUrl(msg.sender_avatar_url)} alt={msg.sender_username} className="w-full h-full object-cover" />
                      : msg.sender_username?.[0]?.toUpperCase()
                  ) : null}
                </div>
              )}
              <div className={`max-w-[80%] px-4 py-2.5 shadow-sm ${
                isMe
                  ? "bg-primary text-on-primary rounded-3xl rounded-br-sm"
                  : "bg-surface-low text-on-surface rounded-3xl rounded-bl-sm border border-outline-variant/30"
              }`}>
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
      <div className="px-4 py-4 border-t border-outline-variant/30 bg-surface/80 backdrop-blur-md pb-8">
        <div className="max-w-4xl mx-auto flex flex-col gap-3">
          
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