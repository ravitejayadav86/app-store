"use client";

import React, { useState, useRef, useEffect } from "react";
import { Sparkles, X, Send, Bot, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/lib/api";
import { usePathname } from "next/navigation";

interface Message {
  id: string;
  sender: "user" | "bot";
  text: string;
  links?: { text: string; url: string }[];
}

export const Copilot = () => {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      sender: "bot",
      text: "Hi there! I'm Panda AI. What can I help you find today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: "user",
      text: input.trim(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await api.post("/copilot/ask", { message: userMsg.text });
      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: "bot",
        text: res.data.reply,
        links: res.data.links,
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: "bot",
          text: "Sorry, I'm having trouble connecting to my brain right now. Please try again later!",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-24 md:bottom-24 right-4 md:right-6 w-[350px] max-w-[calc(100vw-2rem)] h-[500px] max-h-[70vh] z-50 glass rounded-3xl border border-outline-variant shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="bg-primary/10 border-b border-outline-variant p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white">
                  <Sparkles size={16} />
                </div>
                <div>
                  <h3 className="font-bold text-on-surface leading-tight">Panda AI</h3>
                  <p className="text-xs text-on-surface-variant">Database Assistant</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 text-on-surface-variant hover:text-on-surface transition-colors rounded-full hover:bg-surface-low"
              >
                <X size={18} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 no-scrollbar">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-3 max-w-[85%] ${
                    msg.sender === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
                  }`}
                >
                  <div
                    className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                      msg.sender === "user"
                        ? "bg-surface-low border border-outline-variant text-on-surface"
                        : "bg-primary text-white"
                    }`}
                  >
                    {msg.sender === "user" ? <User size={14} /> : <Bot size={14} />}
                  </div>
                  <div
                    className={`flex flex-col gap-2 w-full ${
                      msg.sender === "user" ? "items-end" : "items-start"
                    }`}
                  >
                    <div
                      className={`px-4 py-2 rounded-2xl text-sm ${
                        msg.sender === "user"
                          ? "bg-primary text-white rounded-tr-sm"
                          : "bg-surface-low border border-outline-variant text-on-surface rounded-tl-sm"
                      }`}
                    >
                      {msg.text}
                    </div>
                    {msg.links && msg.links.length > 0 && (
                      <div className="flex flex-col gap-2 w-full mt-1">
                        {msg.links.map((link, i) => (
                          <a
                            key={i}
                            href={link.url}
                            className="bg-primary/10 hover:bg-primary/20 border border-primary/20 text-primary px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors w-full"
                          >
                            {link.text}
                            <span className="text-lg leading-none">→</span>
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-3 max-w-[85%] mr-auto">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center">
                    <Bot size={14} />
                  </div>
                  <div className="bg-surface-low border border-outline-variant px-4 py-3 rounded-2xl rounded-tl-sm flex items-center gap-1">
                    <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6 }} className="w-1.5 h-1.5 rounded-full bg-on-surface-variant" />
                    <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} className="w-1.5 h-1.5 rounded-full bg-on-surface-variant" />
                    <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} className="w-1.5 h-1.5 rounded-full bg-on-surface-variant" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSend} className="p-3 border-t border-outline-variant bg-surface/50">
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask Panda AI..."
                  className="w-full bg-surface-low border border-outline-variant rounded-full pl-4 pr-12 py-2.5 text-sm text-on-surface outline-none focus:border-primary transition-colors"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="absolute right-1.5 p-1.5 bg-primary text-white rounded-full disabled:opacity-50 disabled:bg-surface-low disabled:text-on-surface-variant transition-all"
                >
                  <Send size={16} className="-ml-0.5" />
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed right-4 md:right-6 w-14 h-14 bg-linear-to-br from-primary to-primary-dim text-white rounded-full shadow-xl flex items-center justify-center z-40 border border-white/20 transition-all ${
          isOpen ? 'bottom-24 md:bottom-24 opacity-0 pointer-events-none' : 'bottom-24 md:bottom-6 opacity-100'
        } ${pathname === "/profile" ? "hidden md:flex" : "flex"}`}
      >
        <Sparkles size={24} />
      </motion.button>
    </>
  );
};
