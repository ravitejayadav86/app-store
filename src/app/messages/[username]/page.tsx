"use client";

import React, { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { 
  Send, 
  ChevronLeft, 
  Loader2, 
  Lock, 
  ShieldCheck,
  User,
  Info
} from "lucide-react";
import api from "@/lib/api";
import { toast } from "sonner";
import Link from "next/link";

import { 
  generateKeyPair, 
  encryptMessage, 
  decryptMessage, 
  getPrivateKey, 
  savePrivateKey 
} from "@/lib/crypto";

interface Message {
  id: number;
  sender_id: number;
  receiver_id: number;
  content: string;
  created_at: string;
  sender_username: string;
}

export default function ChatPage() {
  const { username } = useParams();
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [me, setMe] = useState<any>(null);
  const [otherUser, setOtherUser] = useState<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const decryptAll = async (msgs: Message[], privKey: string) => {
    const decrypted = await Promise.all(msgs.map(async m => ({
      ...m,
      content: await decryptMessage(m.content, privKey)
    })));
    setMessages(decrypted);
  };

  const fetchMessages = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const res = await api.get(`/social/messages/${username}`);
      const privKey = getPrivateKey();
      if (privKey) {
        await decryptAll(res.data, privKey);
      } else {
        setMessages(res.data);
      }
    } catch {
      if (!silent) toast.error("Failed to load messages");
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    const setup = async () => {
      try {
        const meRes = await api.get("/users/me");
        setMe(meRes.data);

        // Key management
        let privKey = getPrivateKey();
        if (!privKey || !meRes.data.public_key) {
          const { publicKey, privateKey } = await generateKeyPair();
          savePrivateKey(privateKey);
          await api.patch("/social/profile", { public_key: publicKey });
          privKey = privateKey;
        }

        const otherRes = await api.get(`/social/profile/${username}`);
        setOtherUser(otherRes.data);

        await fetchMessages();
      } catch (err) {
        router.push("/login");
      }
    };
    setup();
    
    const interval = setInterval(() => fetchMessages(true), 12000); 
    return () => clearInterval(interval);
  }, [username, router]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!newMessage.trim() || !otherUser) return;
    setSending(true);
    try {
      let payload = newMessage;
      if (otherUser.public_key) {
        payload = await encryptMessage(newMessage, otherUser.public_key);
      }

      const res = await api.post(`/social/messages/${username}`, { content: payload });
      
      // Add local message immediately (plaintext)
      setMessages([...messages, { ...res.data, content: newMessage }]);
      setNewMessage("");
    } catch {
      toast.error("Failed to send message");
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="animate-spin text-primary" size={40} />
        <p className="text-on-surface-variant">Establishing secure tunnel...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-8 pb-10 pt-6 flex flex-col h-[calc(100vh-100px)]">
      {/* Header */}
      <GlassCard className="p-4 flex items-center justify-between mb-4 shrink-0 border-primary/10">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="p-2 hover:bg-surface-low rounded-xl transition-colors">
            <ChevronLeft size={20} />
          </button>
          <Link href={`/users/${username}`} className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary border border-primary/10">
              {username?.[0]?.toUpperCase()}
            </div>
            <div>
              <h2 className="font-bold text-on-surface group-hover:text-primary transition-colors">{username}</h2>
              <p className="text-[10px] text-green-500 font-bold flex items-center gap-1 uppercase tracking-widest">
                <ShieldCheck size={10} />
                Secure
              </p>
            </div>
          </Link>
        </div>
        <div className="hidden md:flex items-center gap-2 text-[10px] font-bold text-on-surface-variant bg-surface-low px-3 py-1.5 rounded-full border border-outline-variant/30">
          <Lock size={12} className="text-primary" />
          E2E ENCRYPTED CHANNEL
        </div>
      </GlassCard>

      {/* Messages Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-2 space-y-4 pb-4 no-scrollbar scroll-smooth"
      >
        <div className="py-10 text-center">
          <div className="w-16 h-16 rounded-full bg-surface-low flex items-center justify-center mx-auto mb-4 text-on-surface-variant/30">
            <Lock size={32} />
          </div>
          <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-1">Secure Beginning</p>
          <p className="text-[10px] text-on-surface-variant/60 max-w-xs mx-auto">
            Messages are end-to-end encrypted. No one outside of this chat, not even PandaStore, can read them.
          </p>
        </div>

        {messages.map((m, i) => {
          const isMe = m.sender_id === me?.id;
          return (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.2 }}
              className={`flex ${isMe ? "justify-end" : "justify-start"}`}
            >
              <div className={`max-w-[80%] md:max-w-[70%] flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                <div 
                  className={`px-4 py-2.5 rounded-2xl text-sm shadow-sm ${
                    isMe 
                      ? "bg-primary text-on-primary rounded-tr-none" 
                      : "bg-surface-low text-on-surface border border-outline-variant/50 rounded-tl-none"
                  }`}
                >
                  {m.content}
                </div>
                <span className="text-[9px] text-on-surface-variant mt-1 font-medium px-1">
                  {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Input Area */}
      <GlassCard className="p-3 mt-4 shrink-0 flex items-center gap-2">
        <textarea 
          value={newMessage}
          onChange={e => setNewMessage(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder="Type a secure message..."
          rows={1}
          className="flex-1 px-4 py-2.5 rounded-xl bg-surface-low border border-outline-variant text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none no-scrollbar"
        />
        <Button 
          onClick={handleSend}
          disabled={sending || !newMessage.trim()}
          className="h-10 w-10 p-0 rounded-xl"
        >
          {sending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
        </Button>
      </GlassCard>
    </div>
  );
}
