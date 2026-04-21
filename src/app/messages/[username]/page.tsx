"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Send, Lock, Image as ImageIcon, Check, CheckCheck } from "lucide-react";
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

  const handleSend = async () => {
    if (!newMessage.trim()) return;
    setSending(true);
    const content = newMessage;
    setNewMessage("");

    try {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({
          to: username,
          content
        }));
      } else {
        const res = await api.post(`/social/messages/${username}`, { content });
        setMessages(prev => [...prev, {
          ...res.data,
          sender_id: currentUserId!,
          receiver_id: 0,
          is_read: false
        }]);
      }
    } catch {
      toast.error("Failed to send message.");
    } finally {
      setSending(false);
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
    <div className="flex flex-col h-[calc(100vh-80px)] mt-20">
      {/* Header */}
      <div className="flex items-center gap-4 px-4 py-3 border-b border-outline-variant/30 bg-surface/80 backdrop-blur-md sticky top-0 z-20">
        <button onClick={() => router.back()} className="text-on-surface-variant hover:text-primary transition-colors">
          <ArrowLeft size={20} />
        </button>
        <Link href={`/users/${username}`} className="flex items-center gap-3 hover:opacity-80 transition-opacity flex-1">
          <div className="w-10 h-10 rounded-2xl bg-linear-to-br from-primary/20 to-transparent flex items-center justify-center font-bold text-primary text-sm overflow-hidden shadow-inner border border-primary/5">
            {recipientProfile?.avatar_url 
              ? <img src={recipientProfile.avatar_url} alt={username as string} className="w-full h-full object-cover" />
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
                      ? <img src={msg.sender_avatar_url} alt={msg.sender_username} className="w-full h-full object-cover" />
                      : msg.sender_username?.[0]?.toUpperCase()
                  ) : null}
                </div>
              )}
              <div className={`max-w-[80%] px-4 py-2.5 shadow-sm ${
                isMe
                  ? "bg-primary text-on-primary rounded-3xl rounded-br-sm"
                  : "bg-surface-low text-on-surface rounded-3xl rounded-bl-sm border border-outline-variant/30"
              }`}>
                <p className="leading-relaxed text-sm">{msg.content}</p>
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
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <div className="flex-1 relative">
            <input
              value={newMessage}
              onChange={e => setNewMessage(e.target.value)}
              onKeyDown={e => e.key === "Enter" && !e.shiftKey && handleSend()}
              placeholder="Message..."
              className="w-full px-5 py-3.5 rounded-3xl bg-surface-low border border-outline-variant text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all shadow-inner"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
               <button className="p-2 text-on-surface-variant hover:text-primary transition-colors">
                  <ImageIcon size={18} />
               </button>
            </div>
          </div>
          <button
            onClick={handleSend}
            disabled={sending || !newMessage.trim()}
            className="w-12 h-12 rounded-2xl bg-primary text-on-primary flex items-center justify-center disabled:opacity-40 hover:scale-105 active:scale-95 transition-all shadow-lg shadow-primary/20"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}