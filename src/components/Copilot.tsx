"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { Sparkles, X, Send, Bot, User, ChevronRight, RefreshCw, Zap, ChevronDown } from "lucide-react";
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
  { label: "🎮 Top games", query: "Show me popular games" },
  { label: "🎵 Find music", query: "Find music for me" },
  { label: "🚀 Publish an app", query: "How do I publish an app?" },
  { label: "📚 Top books", query: "Show top books" },
  { label: "💬 Messaging help", query: "How does messaging work?" },
  { label: "🆓 Free apps", query: "Show me free apps" },
];

const PAGE_CONTEXT: Record<string, string> = {
  "/": "PandaStore home page",
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
  "/library": "Library page",
  "/login": "Login page",
};

/** Converts **bold**, bullet lines, and numbered lists to styled JSX */
function renderMarkdown(text: string) {
  const lines = text.split("\n");
  return lines.map((line, i) => {
    // Numbered list
    const numMatch = line.match(/^(\d+)\.\s(.+)/);
    if (numMatch) {
      return (
        <div key={i} className="flex gap-2 items-start">
          <span className="flex-shrink-0 w-5 h-5 rounded-full bg-sky-500/20 text-sky-300 text-[10px] font-bold flex items-center justify-center mt-0.5">{numMatch[1]}</span>
          <span>{applyInline(numMatch[2])}</span>
        </div>
      );
    }
    // Bullet
    if (line.match(/^[•\-\*]\s/)) {
      return (
        <div key={i} className="flex gap-2 items-start">
          <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-sky-400 mt-2" />
          <span>{applyInline(line.replace(/^[•\-\*]\s/, ""))}</span>
        </div>
      );
    }
    // Empty line → spacer
    if (line.trim() === "") return <div key={i} className="h-1" />;
    return <p key={i}>{applyInline(line)}</p>;
  });
}

function applyInline(text: string) {
  // **bold**
  const parts = text.split(/\*\*(.+?)\*\*/g);
  return parts.map((part, i) =>
    i % 2 === 1 ? <strong key={i} className="font-bold text-white">{part}</strong> : part
  );
}

export const Copilot = () => {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const chatBoxRef = useRef<HTMLDivElement>(null);

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

    const pageCtx = Object.entries(PAGE_CONTEXT).find(([path]) =>
      pathname === path || (path !== "/" && pathname?.startsWith(path))
    )?.[1] || `the ${pathname} page`;

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
        context: `User is on ${pageCtx}.`,
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
          text: "Sorry, I'm having trouble connecting right now. Please try again in a moment! 🐼",
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
            initial={{ opacity: 0, y: 28, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 28, scale: 0.92 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="fixed bottom-24 md:bottom-24 right-4 md:right-6 w-[370px] max-w-[calc(100vw-2rem)] h-[580px] max-h-[78vh] z-50 flex flex-col overflow-hidden"
            style={{
              background: "linear-gradient(160deg, #1a1033 0%, #130d28 60%, #0f0c1f 100%)",
              border: "1px solid rgba(139, 92, 246, 0.25)",
              borderRadius: "24px",
              boxShadow: "0 32px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(139,92,246,0.08), inset 0 1px 0 rgba(255,255,255,0.05)",
            }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-4 py-3.5 border-b"
              style={{ borderColor: "rgba(139, 92, 246, 0.15)", background: "rgba(139, 92, 246, 0.06)" }}
            >
              <div className="flex items-center gap-2.5">
                <div className="relative">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center shadow-lg"
                    style={{ background: "linear-gradient(135deg, #8b5cf6, #6d28d9)" }}
                  >
                    <Sparkles size={17} className="text-white" />
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-[#1a1033] animate-pulse" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm leading-tight flex items-center gap-1.5">
                    Panda AI
                    <span className="text-[9px] font-bold uppercase tracking-widest text-violet-400 bg-violet-500/10 px-1.5 py-0.5 rounded-full border border-violet-500/20">
                      Beta
                    </span>
                  </h3>
                  <p className="text-[10px] text-violet-300/60 font-medium">PandaStore AI Assistant · Online</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={resetChat}
                  title="New chat"
                  className="p-2 text-sky-400/60 hover:text-sky-300 hover:bg-sky-500/10 transition-colors rounded-xl"
                >
                  <RefreshCw size={14} />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 text-sky-400/60 hover:text-white hover:bg-white/5 transition-colors rounded-xl"
                >
                  <X size={15} />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div
              ref={chatBoxRef}
              className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3"
              style={{ scrollbarWidth: "none" }}
            >
              {/* Welcome Screen */}
              {messages.length === 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col items-center text-center gap-3 pt-2"
                >
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-xl"
                    style={{ background: "linear-gradient(135deg, #0ea5e9, #2563eb)", boxShadow: "0 8px 32px rgba(14,165,233,0.4)" }}
                  >
                    <Sparkles size={28} className="text-white" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-base">Hi, I'm Panda AI! 🐼</h4>
                    <p className="text-xs text-sky-300/60 mt-1 leading-relaxed max-w-[260px]">
                      Your intelligent guide to PandaStore. Ask me about apps, publishing, messaging, account settings — anything!
                    </p>
                  </div>
                </motion.div>
              )}

              {/* Quick suggestions */}
              {showSuggestions && messages.length === 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.12 }}
                  className="flex flex-col gap-2 mt-1"
                >
                  <p className="text-[10px] font-bold uppercase tracking-widest text-sky-400/50 px-1">
                    Quick questions
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {QUICK_SUGGESTIONS.map((s) => (
                      <button
                        key={s.query}
                        onClick={() => sendMessage(s.query)}
                        className="text-left px-3 py-2.5 rounded-xl text-xs font-medium text-sky-200/80 transition-all hover:text-white hover:shadow-md"
                        style={{
                          background: "rgba(14, 165, 233, 0.08)",
                          border: "1px solid rgba(14, 165, 233, 0.18)",
                        }}
                        onMouseEnter={e => {
                          (e.currentTarget as HTMLElement).style.background = "rgba(14, 165, 233, 0.18)";
                          (e.currentTarget as HTMLElement).style.borderColor = "rgba(14, 165, 233, 0.4)";
                        }}
                        onMouseLeave={e => {
                          (e.currentTarget as HTMLElement).style.background = "rgba(14, 165, 233, 0.08)";
                          (e.currentTarget as HTMLElement).style.borderColor = "rgba(14, 165, 233, 0.18)";
                        }}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Messages */}
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`flex gap-2.5 max-w-[90%] ${msg.sender === "user" ? "ml-auto flex-row-reverse" : "mr-auto"}`}
                >
                  {/* Avatar */}
                  <div
                    className="flex-shrink-0 w-7 h-7 rounded-xl flex items-center justify-center mt-0.5"
                    style={
                      msg.sender === "bot"
                        ? { background: "linear-gradient(135deg, #0ea5e9, #2563eb)", boxShadow: "0 4px 12px rgba(14,165,233,0.3)" }
                        : { background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }
                    }
                  >
                    {msg.sender === "user"
                      ? <User size={12} className="text-white/60" />
                      : <Bot size={12} className="text-white" />}
                  </div>

                  {/* Bubble */}
                  <div className={`flex flex-col gap-2 ${msg.sender === "user" ? "items-end" : "items-start"}`}>
                    <div
                      className="px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed flex flex-col gap-1"
                      style={
                        msg.sender === "user"
                          ? {
                              background: "linear-gradient(135deg, #8b5cf6, #6d28d9)",
                              borderRadius: "18px 18px 4px 18px",
                              color: "white",
                              boxShadow: "0 4px 16px rgba(139,92,246,0.25)",
                            }
                          : {
                              background: "rgba(255,255,255,0.04)",
                              border: "1px solid rgba(255,255,255,0.08)",
                              borderRadius: "18px 18px 18px 4px",
                              color: "rgba(255,255,255,0.85)",
                            }
                      }
                    >
                      {msg.sender === "bot"
                        ? <div className="flex flex-col gap-0.5 text-[13px]">{renderMarkdown(msg.text)}</div>
                        : <span>{msg.text}</span>
                      }
                    </div>

                    {/* Links */}
                    {msg.links && msg.links.length > 0 && (
                      <div className="flex flex-col gap-1.5 w-full">
                        {msg.links.map((link, i) => (
                          <Link
                            key={i}
                            href={link.url}
                            onClick={() => setIsOpen(false)}
                            className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all group"
                            style={{
                              background: "rgba(139, 92, 246, 0.1)",
                              border: "1px solid rgba(139, 92, 246, 0.22)",
                              color: "#c4b5fd",
                            }}
                            onMouseEnter={e => {
                              (e.currentTarget as HTMLElement).style.background = "rgba(139, 92, 246, 0.22)";
                              (e.currentTarget as HTMLElement).style.borderColor = "rgba(139, 92, 246, 0.5)";
                              (e.currentTarget as HTMLElement).style.color = "#ddd6fe";
                            }}
                            onMouseLeave={e => {
                              (e.currentTarget as HTMLElement).style.background = "rgba(139, 92, 246, 0.1)";
                              (e.currentTarget as HTMLElement).style.borderColor = "rgba(139, 92, 246, 0.22)";
                              (e.currentTarget as HTMLElement).style.color = "#c4b5fd";
                            }}
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
                  <div
                    className="flex-shrink-0 w-7 h-7 rounded-xl flex items-center justify-center"
                    style={{ background: "linear-gradient(135deg, #8b5cf6, #6d28d9)", boxShadow: "0 4px 12px rgba(139,92,246,0.3)" }}
                  >
                    <Bot size={12} className="text-white" />
                  </div>
                  <div
                    className="px-4 py-3 rounded-2xl rounded-tl-sm flex items-center gap-1.5"
                    style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
                  >
                    {[0, 0.15, 0.3].map((delay, i) => (
                      <motion.div
                        key={i}
                        animate={{ y: [0, -5, 0], opacity: [0.4, 1, 0.4] }}
                        transition={{ repeat: Infinity, duration: 0.75, delay }}
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ background: "#0ea5e9" }}
                      />
                    ))}
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div
              className="px-3 py-3 border-t"
              style={{ borderColor: "rgba(14, 165, 233, 0.15)", background: "rgba(0,0,0,0.2)" }}
            >
              <form onSubmit={handleSend} className="flex items-center gap-2">
                <div className="relative flex-1">
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask Panda AI anything..."
                    disabled={isLoading}
                    className="w-full pl-4 pr-4 py-2.5 text-sm text-white/90 outline-none transition-all disabled:opacity-50 placeholder:text-white/20 rounded-2xl"
                    style={{
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(14, 165, 233, 0.2)",
                    }}
                    onFocus={e => { e.currentTarget.style.borderColor = "rgba(14, 165, 233, 0.5)"; }}
                    onBlur={e => { e.currentTarget.style.borderColor = "rgba(14, 165, 233, 0.2)"; }}
                  />
                </div>
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="w-10 h-10 flex-shrink-0 rounded-xl flex items-center justify-center transition-all hover:scale-105 active:scale-95 disabled:opacity-30"
                  style={{
                    background: "linear-gradient(135deg, #0ea5e9, #2563eb)",
                    boxShadow: "0 4px 16px rgba(14,165,233,0.35)",
                  }}
                >
                  <Send size={15} className="text-white" />
                </button>
              </form>
              <p className="text-[9px] text-center text-white/15 mt-2 font-medium tracking-widest">
                PANDA AI · PANDASTORE ASSISTANT
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FAB Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.92 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed right-4 md:right-6 w-14 h-14 text-white rounded-2xl shadow-2xl flex items-center justify-center z-40 transition-all ${
          isOpen
            ? "bottom-24 md:bottom-24 opacity-0 pointer-events-none"
            : "bottom-24 md:bottom-6 opacity-100"
        } ${pathname === "/profile" ? "hidden md:flex" : "flex"}`}
        style={{
          background: "linear-gradient(135deg, #0ea5e9, #2563eb)",
          boxShadow: "0 8px 32px rgba(14,165,233,0.5), 0 0 0 1px rgba(14,165,233,0.3)",
          border: "1px solid rgba(255,255,255,0.15)",
        }}
        title="Open Panda AI"
        aria-label="Open Panda AI Assistant"
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
