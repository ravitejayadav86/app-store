"use client";

import React, { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, CheckCheck, MessageCircle, Users, ShieldCheck, Zap, Package, ArrowLeft, Trash2 } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import api from "@/lib/api";
import { useRouter } from "next/navigation";

interface Notification {
  id: number;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

const timeAgo = (date: string) => {
  const d = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (d < 60) return "just now";
  if (d < 3600) return Math.floor(d / 60) + "m ago";
  if (d < 86400) return Math.floor(d / 3600) + "h ago";
  return new Date(date).toLocaleDateString("en", { month: "short", day: "numeric" });
};

const notifIcon = (title: string) => {
  if (title?.includes("Message")) return <MessageCircle size={20} className="text-primary" />;
  if (title?.includes("Follow")) return <Users size={20} className="text-green-500" />;
  if (title?.includes("Admin")) return <ShieldCheck size={20} className="text-red-500" />;
  if (title?.includes("App")) return <Package size={20} className="text-purple-500" />;
  return <Zap size={20} className="text-primary" />;
};

export default function NotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [unread, setUnread] = useState(0);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await api.get("/notifications/");
      setNotifications(res.data);
      setUnread(res.data.filter((n: Notification) => !n.is_read).length);
    } catch {
      router.push("/login");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => { fetchNotifications(); }, [fetchNotifications]);

  const markRead = async (id: number) => {
    await api.post("/notifications/" + id + "/read").catch(() => {});
    setNotifications(p => p.map(n => n.id === id ? { ...n, is_read: true } : n));
    setUnread(p => Math.max(0, p - 1));
  };

  const deleteNotification = async (id: number) => {
    // Immediate local update for permanent feel
    setNotifications(p => p.filter(n => n.id !== id));
    setUnread(p => notifications.find(n => n.id === id && !n.is_read) ? Math.max(0, p - 1) : p);
    
    try {
      await api.delete(`/notifications/${id}/`);
    } catch (error) {
      console.error("Permanent delete failed:", error);
    }
  };

  const deleteAllNotifications = async () => {
    if (!window.confirm("Permanently clear all notifications?")) return;
    setNotifications([]);
    setUnread(0);
    try {
      await api.delete("/notifications/delete-all/");
    } catch (error) {
      console.error("Clear all failed:", error);
    }
  };

  const markAllRead = async () => {
    await api.post("/notifications/read-all").catch(() => {});
    setNotifications(p => p.map(n => ({ ...n, is_read: true })));
    setUnread(0);
  };

  const handleClick = (n: Notification) => {
    if (!n.is_read) markRead(n.id);
    const match = n.message?.match(/@([\w\-.]+)/);
    const uname = match?.[1];
    if (n.title === "New Message" && uname) { router.push("/messages/" + uname); return; }
    if ((n.title === "New Follower" || n.title === "Follow Request") && uname) { router.push("/users/" + uname); return; }
    if (n.title === "App Nudge!") { router.push("/publisher"); return; }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 pt-28 pb-20">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="p-2 rounded-xl text-on-surface-variant hover:text-primary hover:bg-primary/8 transition-colors">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-on-surface">Notifications</h1>
            {unread > 0 && <p className="text-xs text-on-surface-variant">{unread} unread</p>}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {unread > 0 && (
            <button onClick={markAllRead} className="flex items-center gap-1.5 text-xs font-bold text-primary hover:underline px-3 py-2 rounded-xl hover:bg-primary/8 transition-colors">
              <CheckCheck size={14} /> Mark all read
            </button>
          )}
          {notifications.length > 0 && (
            <button onClick={deleteAllNotifications} className="flex items-center gap-1.5 text-xs font-bold text-red-500 hover:underline px-3 py-2 rounded-xl hover:bg-red-500/8 transition-colors">
              <Trash2 size={14} /> Clear all
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 text-on-surface-variant animate-pulse">Loading...</div>
      ) : notifications.length === 0 ? (
        <GlassCard className="p-20 text-center">
          <div className="w-16 h-16 rounded-3xl bg-surface-low border border-outline-variant/30 flex items-center justify-center mx-auto mb-4">
            <Bell size={28} className="text-on-surface-variant/30" />
          </div>
          <p className="font-bold text-on-surface mb-1">All caught up!</p>
          <p className="text-sm text-on-surface-variant">No notifications yet.</p>
        </GlassCard>
      ) : (
        <div className="space-y-3">
          <AnimatePresence mode="popLayout" initial={false}>
            {notifications.map((n, i) => (
              <motion.div
                key={n.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, x: -100, scale: 0.9, height: 0, marginBottom: 0 }}
                transition={{ type: "spring", stiffness: 500, damping: 40 }}
                className="relative overflow-hidden rounded-2xl"
              >
                {/* Background delete action - Neutral Glassy Theme */}
                <div className="absolute inset-0 bg-surface-low flex items-center justify-end px-6">
                  <motion.div 
                    initial={{ scale: 0.5, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                  >
                    <Trash2 className="text-on-surface-variant" size={20} />
                  </motion.div>
                </div>

                <motion.div
                  drag="x"
                  dragDirectionLock
                  dragConstraints={{ left: -120, right: 0 }}
                  dragElastic={{ left: 0.1, right: 0 }}
                  onDragEnd={(_, info) => {
                    if (info.offset.x < -70) {
                      deleteNotification(n.id);
                    }
                  }}
                  className={"relative z-10 w-full text-left flex items-start gap-4 p-4 rounded-2xl border transition-all hover:bg-surface-low cursor-grab active:cursor-grabbing " + (n.is_read ? "border-transparent opacity-60 bg-surface" : "border-primary/10 bg-primary/5")}
                  style={{ touchAction: "none" }}
                  onClick={() => handleClick(n)}
                >
                  <div className="w-10 h-10 rounded-2xl bg-surface-low border border-outline-variant/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    {notifIcon(n.title)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-0.5">
                      <p className="text-sm font-bold text-on-surface truncate">{n.title}</p>
                      <span className="text-[10px] text-on-surface-variant/50 flex-shrink-0">{timeAgo(n.created_at)}</span>
                    </div>
                    <p className="text-xs text-on-surface-variant leading-relaxed line-clamp-2">{n.message}</p>
                  </div>
                  {!n.is_read && <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-2" />}
                </motion.div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

