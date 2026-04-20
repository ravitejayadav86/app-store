"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Send, Lock, Image as ImageIcon } from "lucide-react";
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

  const fetchMessages = useCallback(async () => {
    try {
      const res = await api.get(`/social/messages/${username}`);
      setMessages(res.data);
    } catch {
      toast.error("Failed to load messages");
    }
  }, [username]);

  useEffect(() => {
    if (currentUserId) fetchMessages();
  }, [currentUserId, fetchMessages]);

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
        setMessages(prev => {
          const exists = prev.some(m => m.id === msg.id);
          if (exists) return prev;
          return [...prev, msg];
        });
      } catch {}
    };

    return () => {
      ws.close();
    };
  }, [currentUserId]);

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
    <div className="flex flex-col h-screen pt-20">
      {/* Header */}
      <div className="flex items-center gap-4 px-4 py-3 border-b border-outline-variant/30 bg-surface">
        <button onClick={() => router.back()} className="text-on-surface-variant hover:text-primary transition-colors">
          <ArrowLeft size={20} />
        </button>
        <Link href={`/users/${username}`} className="flex items-center gap-3 hover:opacity-80 transition-opacity flex-1">
          <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary text-sm">
            {(username as string)?.[0]?.toUpperCase()}
          </div>
          <div>
            <p className="font-bold text-on-surface text-sm">{username}</p>
            <div className="flex items-center gap-1">
              <div className={`w-1.5 h-1.5 rounded-full ${connected ? "bg-green-500" : "bg-on-surface-variant/30"}`} />
              <p className="text-[10px] text-on-surface-variant">{connected ? "Connected" : "Offline"}</p>
            </div>
          </div>
        </Link>
        <div className="flex items-center gap-1 text-xs text-on-surface-variant">
          <Lock size={11} /> E2E
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.length === 0 && (
          <div className="text-center py-10 text-on-surface-variant text-sm">
            No messages yet. Say hi! 👋
          </div>
        )}
        {messages.map((msg) => {
          const isMe = msg.sender_id === currentUserId ||
            msg.sender_username === currentUsername;
          return (
            <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
              {!isMe && (
                <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary mr-2 flex-shrink-0 self-end mb-1">
                  {msg.sender_username?.[0]?.toUpperCase()}
                </div>
              )}
              <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm ${
                isMe
                  ? "bg-primary text-on-primary rounded-br-sm"
                  : "bg-surface-low text-on-surface rounded-bl-sm"
              }`}>
                <p className="leading-relaxed">{msg.content}</p>
                <p className={`text-[10px] mt-1 ${isMe ? "text-on-primary/60 text-right" : "text-on-surface-variant"}`}>
                  {timeAgo(msg.created_at)}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-3 border-t border-outline-variant/30 bg-surface flex items-center gap-3">
        <input
          value={newMessage}
          onChange={e => setNewMessage(e.target.value)}
          onKeyDown={e => e.key === "Enter" && !e.shiftKey && handleSend()}
          placeholder="Type a message..."
          className="flex-1 px-4 py-3 rounded-2xl bg-surface-low border border-outline-variant text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
        <button
          onClick={handleSend}
          disabled={sending || !newMessage.trim()}
          className="w-11 h-11 rounded-full bg-primary text-on-primary flex items-center justify-center disabled:opacity-40 hover:opacity-90 transition-all active:scale-95"
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  );
}