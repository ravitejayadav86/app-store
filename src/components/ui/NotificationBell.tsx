"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import { Bell, CheckCheck, X } from "lucide-react";
import api from "@/lib/api";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useRealtime } from "@/hooks/useRealtime";

interface Notification {
  id: number;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

interface ApiError {
  response?: { status?: number };
}

export function NotificationBell() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(0);
  const [userId, setUserId] = useState<number | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    api.get("/users/me")
      .then(res => setUserId(res.data.id))
      .catch(() => {});
  }, []);

  const { onEvent } = useRealtime(userId || undefined);

  onEvent("NOTIFICATION", (data) => {
    const newNotif: Notification = {
      id: data.id,
      title: data.title,
      message: data.message,
      is_read: false,
      created_at: data.created_at || new Date().toISOString()
    };
    setNotifications(prev => [newNotif, ...prev]);
    setUnread(prev => prev + 1);
  });

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await api.get("/notifications/");
      setNotifications(res.data);
      setUnread(res.data.filter((n: Notification) => !n.is_read).length);
    } catch (err: unknown) {
      const error = err as ApiError;
      // 401 = not logged in, silently skip
      if (error.response?.status !== 401) {
        console.error("Failed to fetch notifications");
      }
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await api.get("/notifications/");
        if (!cancelled) {
          setNotifications(res.data);
          setUnread(res.data.filter((n: Notification) => !n.is_read).length);
        }
      } catch (err: unknown) {
        const error = err as ApiError;
        if (error.response?.status !== 401) {
          console.error("Failed to fetch notifications");
        }
      }
    };
    load();
    const interval = setInterval(load, 30000);
    return () => { cancelled = true; clearInterval(interval); };
  }, []);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const markRead = async (id: number) => {
    await api.post(`/notifications/${id}/read`).catch(() => {});
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );
    setUnread((prev) => Math.max(0, prev - 1));
  };

  const markAllRead = async () => {
    await api.post("/notifications/read-all").catch(() => {});
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    setUnread(0);
  };

  const handleNotificationClick = (n: Notification) => {
    if (!n.is_read) {
      markRead(n.id);
    }

    // Route to user profile if message contains "@username"
    const match = n.message.match(/@([\w\-\.]+)/);
    if (match && match[1]) {
      router.push(`/users/${match[1]}`);
      setOpen(false);
      return;
    }

    // Route to publisher dashboard for app nudges
    if (n.title === "App Nudge!") {
      router.push("/publisher");
      setOpen(false);
      return;
    }
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative p-2 text-on-surface-variant hover:text-primary transition-colors"
        aria-label="Notifications"
      >
        <Bell size={20} />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-0.5 animate-pulse">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-[calc(100%+0.75rem)] w-80 glass border border-outline-variant rounded-2xl shadow-2xl z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-outline-variant/50">
              <span className="font-bold text-sm text-on-surface">Notifications</span>
              <div className="flex items-center gap-2">
                {unread > 0 && (
                  <button
                    onClick={markAllRead}
                    className="text-xs text-primary hover:underline flex items-center gap-1"
                  >
                    <CheckCheck size={14} /> All read
                  </button>
                )}
                <button onClick={() => setOpen(false)} className="text-on-surface-variant hover:text-on-surface">
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* List */}
            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="py-10 text-center text-on-surface-variant">
                  <Bell size={28} className="mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No notifications yet</p>
                </div>
              ) : (
                notifications.map((n) => (
                  <button
                    key={n.id}
                    onClick={() => handleNotificationClick(n)}
                    className={`w-full text-left px-4 py-3 border-b border-outline-variant/30 hover:bg-surface-low transition-colors ${
                      n.is_read ? "opacity-60" : ""
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      {!n.is_read && (
                        <span className="mt-1.5 w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                      )}
                      <div className={!n.is_read ? "" : "pl-4"}>
                        <p className="text-sm font-bold text-on-surface">{n.title}</p>
                        <p className="text-xs text-on-surface-variant mt-0.5 leading-relaxed">{n.message}</p>
                        <p className="text-[10px] text-on-surface-variant/50 mt-1">
                          {new Date(n.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
