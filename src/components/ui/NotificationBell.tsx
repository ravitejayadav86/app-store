"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import { Bell, CheckCheck, X, MessageCircle, Users, ShieldCheck, Zap, Package } from "lucide-react";
import api from "@/lib/api";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useRealtime, useRealtimeEvent } from "@/hooks/useRealtime";
import { toast } from "sonner";

interface Notification {
  id: number;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

const SPRING = { type: "spring", stiffness: 520, damping: 36, mass: 0.5 } as const;

const timeAgo = (date: string) => {
  const d = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (d < 60)    return "just now";
  if (d < 3600)  return `${Math.floor(d / 60)}m ago`;
  if (d < 86400) return `${Math.floor(d / 3600)}h ago`;
  return new Date(date).toLocaleDateString("en", { month: "short", day: "numeric" });
};

const notifIcon = (title: string) => {
  if (title?.includes("Message"))  return <MessageCircle size={16} className="text-primary" />;
  if (title?.includes("Follow"))   return <Users         size={16} className="text-green-500" />;
  if (title?.includes("Request"))  return <Users         size={16} className="text-amber-500" />;
  if (title?.includes("Admin"))    return <ShieldCheck   size={16} className="text-red-500" />;
  if (title?.includes("App"))      return <Package       size={16} className="text-purple-500" />;
  return                                  <Zap           size={16} className="text-primary" />;
};

export function NotificationBell() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen]     = useState(false);
  const [unread, setUnread] = useState(0);
  const [userId, setUserId] = useState<number | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  // ── Auth ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    api.get("/users/me").then(r => setUserId(r.data.id)).catch(() => {});
  }, []);

  const { isConnected } = useRealtime(userId || undefined);

  // ── Native notification permission ────────────────────────────────────────
  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "default")
      Notification.requestPermission();
  }, []);

  // ── Real-time push ────────────────────────────────────────────────────────
  useRealtimeEvent(userId || undefined, "NOTIFICATION", (data) => {
    const n: Notification = {
      id:         data.id || Date.now(),
      title:      data.title,
      message:    data.message,
      is_read:    false,
      created_at: data.created_at || new Date().toISOString(),
    };
    setNotifications(prev => [n, ...prev]);
    setUnread(prev => prev + 1);

    toast(data.title, { description: data.message });

    if (typeof window !== "undefined" && document.hidden && Notification.permission === "granted")
      new window.Notification(data.title, { body: data.message, icon: "/panda-logo.png" });
  });

  // ── Fetch ─────────────────────────────────────────────────────────────────
  const fetchNotifications = useCallback(async () => {
    try {
      const res = await api.get("/notifications/");
      setNotifications(res.data);
      setUnread(res.data.filter((n: Notification) => !n.is_read).length);
    } catch {}
  }, []);

  useEffect(() => {
    fetchNotifications();
    const iv = setInterval(fetchNotifications, 60_000);
    return () => clearInterval(iv);
  }, [fetchNotifications]);

  // ── Outside click close ───────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // ── Actions ───────────────────────────────────────────────────────────────
  const markRead = async (id: number) => {
    await api.post(`/notifications/${id}/read`).catch(() => {});
    setNotifications(p => p.map(n => n.id === id ? { ...n, is_read: true } : n));
    setUnread(p => Math.max(0, p - 1));
  };

  const markAllRead = async () => {
    await api.post("/notifications/read-all").catch(() => {});
    setNotifications(p => p.map(n => ({ ...n, is_read: true })));
    setUnread(0);
  };

  const handleClick = (n: Notification) => {
    if (!n.is_read) markRead(n.id);
    setOpen(false);

    const match = n.message?.match(/@([\w\-.]+)/);
    const uname = match?.[1];

    if (n.title === "New Message"   && uname) { router.push(`/messages/${uname}`);   return; }
    if ((n.title === "New Follower" || n.title === "Follow Request" || n.title === "Request Accepted") && uname) {
      router.push(`/users/${uname}`); return;
    }
    if (n.title === "App Nudge!")                   { router.push("/publisher"); return; }
    if (n.title?.startsWith("Support Feedback"))    { router.push("/admin");     return; }
    router.push("/profile/notifications");
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    // IMPORTANT: position:static on the bell container — the dropdown is
    // portaled via fixed positioning so it escapes any overflow:hidden parent.
    <div ref={ref} className="relative" style={{ isolation: "isolate" }}>

      {/* ── Bell button ── */}
      <motion.button
        onClick={() => setOpen(o => !o)}
        whileTap={{ scale: 0.88 }}
        transition={{ duration: 0.08 }}
        className="relative p-2 rounded-xl text-on-surface-variant hover:text-primary hover:bg-primary/8 active:scale-90 transition-colors"
        aria-label="Notifications"
        style={{ willChange: "transform" }}
      >
        <Bell size={20} />
        <AnimatePresence>
          {unread > 0 && (
            <motion.span
              key="badge"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{   scale: 0, opacity: 0 }}
              transition={SPRING}
              className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center px-0.5 shadow-sm shadow-red-500/30"
              style={{ willChange: "transform, opacity" }}
            >
              {unread > 9 ? "9+" : unread}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>

      {/* ── Dropdown — fixed so it escapes navbar overflow clipping ── */}
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop (mobile full-screen tap-to-close) */}
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.12 }}
              className="fixed inset-0 z-[90] md:hidden"
              onClick={() => setOpen(false)}
            />

            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0,  scale: 1    }}
              exit={{   opacity: 0, y: -8,  scale: 0.96 }}
              transition={SPRING}
              style={{ willChange: "transform, opacity" }}
              /* Fixed keeps it out of any overflow:hidden container */
              className={[
                "fixed z-[100]",
                /* Desktop: anchor to right side of bell */
                "md:absolute md:right-0 md:top-[calc(100%+10px)]",
                /* Mobile: full-width sheet near top */
                "top-20 left-4 right-4 md:left-auto md:w-96",
              ].join(" ")}
            >
              <div className="bottom-nav-glass rounded-3xl shadow-2xl overflow-hidden border border-white/50">

                {/* Header */}
                <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/20">
                  <div className="flex items-center gap-2">
                    <span className="font-black text-sm text-on-surface">Notifications</span>
                    {unread > 0 && (
                      <span className="px-1.5 py-0.5 rounded-full bg-primary text-on-primary text-[10px] font-black">
                        {unread}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {unread > 0 && (
                      <button onClick={markAllRead}
                        className="flex items-center gap-1 text-[11px] font-bold text-primary hover:underline px-2 py-1 rounded-lg hover:bg-primary/8 transition-colors">
                        <CheckCheck size={13} /> Mark all read
                      </button>
                    )}
                    <button onClick={() => setOpen(false)} aria-label="Close"
                      className="p-1 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-low transition-colors">
                      <X size={16} />
                    </button>
                  </div>
                </div>

                {/* List */}
                <div className="max-h-[70vh] md:max-h-80 overflow-y-auto overscroll-contain" style={{ scrollbarWidth: "none" }}>
                  {notifications.length === 0 ? (
                    <div className="py-14 flex flex-col items-center gap-3 text-center">
                      <div className="w-14 h-14 rounded-2xl bg-surface-low border border-outline-variant/30 flex items-center justify-center">
                        <Bell size={24} className="text-on-surface-variant/30" />
                      </div>
                      <p className="text-sm font-semibold text-on-surface-variant/60">You're all caught up!</p>
                    </div>
                  ) : (
                    <AnimatePresence initial={false}>
                      {notifications.map((n, i) => (
                        <motion.button
                          key={n.id}
                          layout
                          initial={{ opacity: 0, x: 12 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ ...SPRING, delay: i * 0.02 }}
                          onClick={() => handleClick(n)}
                          className={`w-full text-left flex items-start gap-3 px-5 py-3.5 border-b border-white/10 transition-colors active:scale-[0.98] ${
                            n.is_read ? "opacity-55 hover:opacity-80 hover:bg-white/5" : "hover:bg-primary/5"
                          }`}
                        >
                          {/* Icon circle */}
                          <div className="flex-shrink-0 w-9 h-9 rounded-2xl bg-surface-low border border-outline-variant/20 flex items-center justify-center mt-0.5 shadow-inner">
                            {notifIcon(n.title)}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2 mb-0.5">
                              <p className="text-[13px] font-bold text-on-surface truncate">{n.title}</p>
                              <span className="text-[10px] text-on-surface-variant/50 flex-shrink-0">
                                {timeAgo(n.created_at)}
                              </span>
                            </div>
                            <p className="text-xs text-on-surface-variant leading-relaxed line-clamp-2">{n.message}</p>
                          </div>

                          {/* Unread dot */}
                          {!n.is_read && (
                            <div className="flex-shrink-0 w-2 h-2 rounded-full bg-primary mt-2" />
                          )}
                        </motion.button>
                      ))}
                    </AnimatePresence>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
