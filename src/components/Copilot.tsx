"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { Sparkles, X, Send, Bot, User, ChevronRight, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/lib/api";
import { usePathname } from "next/navigation";
import Link from "next/link";

interface Message {
  id: string;
  sender: "user" | "bot";
  text: string;
  links?: { text: string; url: string }[];
}

const QUICK_SUGGESTIONS = [
  "Show me popular games 🎮",
  "Find music for me 🎵",
  "How do I publish an app?",
  "What is PandaStore?",
  "I need help & support",
  "Show top books 📚",
];

const PAGE_CONTEXT: Record<string, string> = {
  "/": "home page",
  "/apps": "Apps category",
  "/games": "Games category",
  "/music": "Music category",
  "/books": "Books category",
  "/discover": "Discover / trending page",
  "/community": "Community Hub",
  "/messages": "Messages inbox",
  "/publisher": "Publisher Portal",
  "/settings": "Settings page",
  "/profile": "User profile",
};

export const Copilot = () => {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [messages, isOpen, scrollToBottom]);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isLoading) return;

    const pageCtx = PAGE_CONTEXT[pathname] || `the ${pathname} page`;
    const userMsg: Message = {
      id: Date.now().toString(),
      sender: "user",
      text: text.trim(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);
    setShowSuggestions(false);

    try {
      const res = await api.post("/copilot/ask", {
        message: text.trim(),
        context: `User is currently on ${pageCtx}.`,
      });
      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: "bot",
        text: res.data.reply,
        links: res.data.links,
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: "bot",
          text: "Sorry, I'm having trouble connecting right now. Please try again in a moment!",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, pathname]);

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    sendMessage(input);
  };

  const resetChat = () => {
    setMessages([]);
    setShowSuggestions(true);
    setInput("");
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.94 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="fixed bottom-24 md:bottom-24 right-4 md:right-6 w-[360px] max-w-[calc(100vw-2rem)] h-[560px] max-h-[75vh] z-50 flex flex-col overflow-hidden"
            style={{
              background: "var(--color-surface)",
              border: "1px solid var(--color-outline-variant)",
              borderRadius: "24px",
              boxShadow: "0 24px 64px rgba(0,0,0,0.20), 0 4px 16px rgba(0,0,0,0.1)",
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3.5 border-b border-outline-variant/50"
              style={{ background: "linear-gradient(135deg, var(--color-primary)/10, transparent)" }}>
              <div className="flex items-center gap-2.5">
                <div className="relative">
                  <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/30">
                    <Sparkles size={17} className="text-white" />
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-surface animate-pulse" />
                </div>
                <div>
                  <h3 className="font-bold text-on-surface text-sm leading-tight">Panda AI</h3>
                  <p className="text-[10px] text-on-surface-variant font-medium">PandaStore Assistant · Online</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={resetChat}
                  title="New chat"
                  className="p-2 text-on-surface-variant hover:text-primary hover:bg-primary/5 transition-colors rounded-xl"
                >
                  <RefreshCw size={15} />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 text-on-surface-variant hover:text-on-surface hover:bg-surface-low transition-colors rounded-xl"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3" style={{ scrollbarWidth: "none" }}>

              {/* Welcome Screen */}
              {messages.length === 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col items-center text-center gap-3 pt-4"
                >
                  <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-primary to-primary-dim flex items-center justify-center shadow-xl shadow-primary/25">
                    <Sparkles size={28} className="text-white" />
                  </div>
                  <div>
                    <h4 className="font-bold text-on-surface text-base">Hi, I'm Panda AI! 🐼</h4>
                    <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
                      Your personal guide to PandaStore. Ask me anything — I can find apps, help you publish, or guide you around the platform.
                    </p>
                  </div>
                </motion.div>
              )}

              {/* Quick suggestions */}
              {showSuggestions && messages.length === 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.15 }}
                  className="flex flex-col gap-2 mt-2"
                >
                  <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant px-1">Quick questions</p>
                  <div className="grid grid-cols-2 gap-2">
                    {QUICK_SUGGESTIONS.map((s) => (
                      <button
                        key={s}
                        onClick={() => sendMessage(s)}
                        className="text-left px-3 py-2.5 rounded-xl bg-surface-low hover:bg-primary/5 border border-outline-variant hover:border-primary/30 text-xs font-medium text-on-surface transition-all hover:shadow-sm"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Messages */}
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`flex gap-2.5 max-w-[88%] ${msg.sender === "user" ? "ml-auto flex-row-reverse" : "mr-auto"}`}
                >
                  <div className={`flex-shrink-0 w-7 h-7 rounded-xl flex items-center justify-center mt-0.5 ${
                    msg.sender === "user"
                      ? "bg-surface-low border border-outline-variant text-on-surface"
                      : "bg-primary text-white shadow-sm shadow-primary/30"
                  }`}>
                    {msg.sender === "user" ? <User size={12} /> : <Bot size={12} />}
                  </div>
                  <div className={`flex flex-col gap-2 ${msg.sender === "user" ? "items-end" : "items-start"}`}>
                    <div className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                      msg.sender === "user"
                        ? "bg-primary text-white rounded-tr-sm"
                        : "bg-surface-low border border-outline-variant/60 text-on-surface rounded-tl-sm"
                    }`}>
                      {msg.text}
                    </div>
                    {msg.links && msg.links.length > 0 && (
                      <div className="flex flex-col gap-1.5 w-full">
                        {msg.links.map((link, i) => (
                          <Link
                            key={i}
                            href={link.url}
                            onClick={() => setIsOpen(false)}
                            className="bg-primary/8 hover:bg-primary/15 border border-primary/20 hover:border-primary/40 text-primary px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition-all w-full group"
                          >
                            <span className="truncate">{link.text}</span>
                            <ChevronRight size={13} className="flex-shrink-0 ml-1 group-hover:translate-x-0.5 transition-transform" />
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}

              {/* Typing indicator */}
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-2.5 max-w-[88%] mr-auto"
                >
                  <div className="flex-shrink-0 w-7 h-7 rounded-xl bg-primary text-white flex items-center justify-center shadow-sm shadow-primary/30">
                    <Bot size={12} />
                  </div>
                  <div className="bg-surface-low border border-outline-variant/60 px-4 py-3 rounded-2xl rounded-tl-sm flex items-center gap-1.5">
                    {[0, 0.15, 0.3].map((delay, i) => (
                      <motion.div
                        key={i}
                        animate={{ y: [0, -5, 0] }}
                        transition={{ repeat: Infinity, duration: 0.7, delay }}
                        className="w-1.5 h-1.5 rounded-full bg-on-surface-variant/60"
                      />
                    ))}
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="px-3 py-3 border-t border-outline-variant/50" style={{ background: "var(--color-surface)" }}>
              <form onSubmit={handleSend} className="flex items-center gap-2">
                <div className="relative flex-1">
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask Panda AI anything..."
                    disabled={isLoading}
                    className="w-full bg-surface-low border border-outline-variant/60 focus:border-primary/50 rounded-2xl pl-4 pr-4 py-2.5 text-sm text-on-surface outline-none transition-colors disabled:opacity-60 placeholder:text-on-surface-variant/50"
                  />
                </div>
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="w-10 h-10 flex-shrink-0 bg-primary text-white rounded-xl flex items-center justify-center disabled:opacity-40 disabled:bg-surface-low disabled:text-on-surface-variant hover:scale-105 active:scale-95 transition-all shadow-md shadow-primary/20"
                >
                  <Send size={15} />
                </button>
              </form>
              <p className="text-[9px] text-center text-on-surface-variant/40 mt-2 font-medium tracking-wide">
                PANDA AI · PANDASTORE ASSISTANT
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FAB */}
      <motion.button
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.93 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed right-4 md:right-6 w-14 h-14 text-white rounded-2xl shadow-2xl flex items-center justify-center z-40 border border-white/20 transition-all ${
          isOpen
            ? "bottom-24 md:bottom-24 opacity-0 pointer-events-none"
            : "bottom-24 md:bottom-6 opacity-100"
        } ${pathname === "/profile" ? "hidden md:flex" : "flex"}`}
        style={{ background: "linear-gradient(135deg, var(--color-primary), var(--color-primary-dim))" }}
        title="Open Panda AI"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={isOpen ? "x" : "sparkle"}
            initial={{ scale: 0.5, opacity: 0, rotate: -90 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            exit={{ scale: 0.5, opacity: 0, rotate: 90 }}
            transition={{ duration: 0.15 }}
          >
            <Sparkles size={22} />
          </motion.div>
        </AnimatePresence>
      </motion.button>
    </>
  );
};
