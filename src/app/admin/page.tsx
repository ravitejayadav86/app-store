"use client";

import React, { useEffect, useState, useCallback, Suspense } from "react";
import { useRouter } from "next/navigation";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import {
  ShieldAlert, Clock, CheckCircle2, XCircle, User, Tag, Trash2,
  Users, Package, Download, Star, DollarSign, AlertTriangle,
  Search, Shield, UserCheck, UserX, HardDrive, Cloud, Activity,
  Music, BookOpen, MessageSquare, ChevronRight, RefreshCw, Ban
} from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";

type Tab = "overview" | "apps" | "users" | "health";

interface Stats {
  total_users: number; total_apps: number; approved_apps: number;
  pending_apps: number; total_downloads: number; total_reviews: number;
  total_publishers: number; total_posts: number; total_revenue: number;
  missing_files: number;
}
interface AppItem {
  id: number; name: string; description: string; category: string;
  developer: string; version: string; price: number; created_at: string;
  is_approved?: boolean; file_path?: string;
}
interface UserItem {
  id: number; username: string; email: string; full_name: string | null;
  avatar_url: string | null; is_active: boolean; is_admin: boolean;
  is_publisher: boolean; created_at: string; apps_count: number;
  downloads_count: number;
}
interface FileHealth {
  id: number; name: string; developer: string; file_path: string;
  storage: string; status: string; is_approved: boolean;
}

export default function AdminDashboard() {
  return (
    <Suspense fallback={<div className="max-w-7xl mx-auto px-4 py-20 flex items-center justify-center"><div className="animate-pulse flex flex-col items-center gap-4"><Clock size={40} className="text-primary opacity-50" /><p className="text-on-surface-variant font-medium">Loading admin panel...</p></div></div>}>
      <AdminContent />
    </Suspense>
  );
}

function AdminContent() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("overview");
  const [stats, setStats] = useState<Stats | null>(null);
  const [pending, setPending] = useState<AppItem[]>([]);
  const [published, setPublished] = useState<AppItem[]>([]);
  const [users, setUsers] = useState<UserItem[]>([]);
  const [fileHealth, setFileHealth] = useState<FileHealth[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<number | null>(null);
  const [userSearch, setUserSearch] = useState("");

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const [s, p, pub] = await Promise.all([
        api.get("/admin/stats"), api.get("/admin/pending"), api.get("/admin/published")
      ]);
      setStats(s.data); setPending(p.data); setPublished(pub.data);
    } catch (err: any) {
      if (err.response?.status === 403) { toast.error("Admin access required."); router.push("/"); }
      else toast.error("Failed to load admin data.");
    } finally { setLoading(false); }
  }, [router]);

  const loadUsers = useCallback(async () => {
    try {
      const r = await api.get("/admin/users", { params: userSearch ? { q: userSearch } : {} });
      setUsers(r.data);
    } catch { toast.error("Failed to load users."); }
  }, [userSearch]);

  const loadHealth = useCallback(async () => {
    try { const r = await api.get("/admin/file-health"); setFileHealth(r.data); }
    catch { toast.error("Failed to load file health."); }
  }, []);

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) { toast.error("Please sign in."); router.push("/login"); return; }
    load();
  }, [load, router]);

  useEffect(() => { if (tab === "users") loadUsers(); }, [tab, loadUsers]);
  useEffect(() => { if (tab === "health") loadHealth(); }, [tab, loadHealth]);

  const approve = async (id: number) => {
    try { setActionId(id); await api.post(`/admin/approve/${id}`); toast.success("Approved!"); load(); }
    catch (e: any) { toast.error(e.response?.data?.detail || "Failed"); } finally { setActionId(null); }
  };
  const reject = async (id: number) => {
    if (!confirm("Reject and delete this submission?")) return;
    try { setActionId(id); await api.post(`/admin/reject/${id}`); toast.success("Rejected."); load(); }
    catch (e: any) { toast.error(e.response?.data?.detail || "Failed"); } finally { setActionId(null); }
  };
  const approveAll = async () => {
    if (!confirm("Approve all pending apps?")) return;
    try { const r = await api.post("/admin/approve-all"); toast.success(r.data.message); load(); }
    catch { toast.error("Failed"); }
  };
  const deleteApp = async (id: number, name: string) => {
    if (!confirm(`Delete "${name}" permanently?`)) return;
    try { setActionId(id); await api.delete(`/admin/apps/${id}`); toast.success(`"${name}" deleted.`); load(); }
    catch (e: any) { toast.error(e.response?.data?.detail || "Failed"); } finally { setActionId(null); }
  };
  const toggleUser = async (userId: number, action: string) => {
    try {
      setActionId(userId);
      const r = await api.post(`/admin/users/${userId}/${action}`);
      toast.success(r.data.message); loadUsers();
    } catch (e: any) { toast.error(e.response?.data?.detail || "Failed"); }
    finally { setActionId(null); }
  };

  if (loading) return (
    <div className="max-w-7xl mx-auto px-4 py-20 flex items-center justify-center">
      <div className="animate-pulse flex flex-col items-center gap-4">
        <RefreshCw size={40} className="text-primary opacity-50 animate-spin" />
        <p className="text-on-surface-variant font-medium">Loading admin panel...</p>
      </div>
    </div>
  );

  const tabs: { key: Tab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { key: "overview", label: "Overview", icon: <Activity size={18} /> },
    { key: "apps", label: "Apps", icon: <Package size={18} />, badge: stats?.pending_apps },
    { key: "users", label: "Users", icon: <Users size={18} />, badge: stats?.total_users },
    { key: "health", label: "File Health", icon: <HardDrive size={18} />, badge: stats?.missing_files },
  ];

  const getCatIcon = (cat: string) => {
    const c = cat?.toLowerCase() || "";
    if (c === "music") return <Music size={20} />;
    if (c === "books") return <BookOpen size={20} />;
    return <Tag size={20} />;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-20 pb-32">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="p-4 rounded-2xl" style={{ background: "linear-gradient(135deg, rgba(239,68,68,0.15), rgba(239,68,68,0.05))" }}>
          <ShieldAlert size={32} className="text-red-500" />
        </div>
        <div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Admin Control Center</h1>
          <p className="text-on-surface-variant font-medium mt-1">Manage your PandaStore platform</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-8 overflow-x-auto no-scrollbar pb-2">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-all whitespace-nowrap ${
              tab === t.key
                ? "bg-primary text-on-primary shadow-lg shadow-primary/20"
                : "liquid-glass text-on-surface-variant hover:text-primary"
            }`}>
            {t.icon} {t.label}
            {t.badge ? <span className={`ml-1 px-2 py-0.5 rounded-full text-xs font-black ${
              tab === t.key ? "bg-white/20" : "bg-red-500/10 text-red-500"
            }`}>{t.badge}</span> : null}
          </button>
        ))}
      </div>

      {/* ─── OVERVIEW TAB ─── */}
      {tab === "overview" && stats && (
        <div className="space-y-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Total Users", value: stats.total_users, icon: <Users size={22} />, color: "text-blue-500", bg: "rgba(59,130,246,0.1)" },
              { label: "Total Apps", value: stats.total_apps, icon: <Package size={22} />, color: "text-emerald-500", bg: "rgba(16,185,129,0.1)" },
              { label: "Downloads", value: stats.total_downloads, icon: <Download size={22} />, color: "text-violet-500", bg: "rgba(139,92,246,0.1)" },
              { label: "Revenue", value: `$${stats.total_revenue}`, icon: <DollarSign size={22} />, color: "text-amber-500", bg: "rgba(245,158,11,0.1)" },
              { label: "Reviews", value: stats.total_reviews, icon: <Star size={22} />, color: "text-pink-500", bg: "rgba(236,72,153,0.1)" },
              { label: "Publishers", value: stats.total_publishers, icon: <UserCheck size={22} />, color: "text-teal-500", bg: "rgba(20,184,166,0.1)" },
              { label: "Pending", value: stats.pending_apps, icon: <Clock size={22} />, color: "text-yellow-500", bg: "rgba(234,179,8,0.1)" },
              { label: "Missing Files", value: stats.missing_files, icon: <AlertTriangle size={22} />, color: stats.missing_files > 0 ? "text-red-500" : "text-green-500", bg: stats.missing_files > 0 ? "rgba(239,68,68,0.1)" : "rgba(34,197,94,0.1)" },
            ].map((s, i) => (
              <GlassCard key={i} className="p-5" animate={false}>
                <div className="flex items-center gap-3 mb-3">
                  <div className={`p-2 rounded-xl ${s.color}`} style={{ background: s.bg }}>{s.icon}</div>
                </div>
                <p className="text-2xl font-black tracking-tight">{s.value}</p>
                <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mt-1">{s.label}</p>
              </GlassCard>
            ))}
          </div>

          {/* Quick Actions */}
          <GlassCard className="p-6" animate={false}>
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><ChevronRight size={18} className="text-primary" /> Quick Actions</h3>
            <div className="flex flex-wrap gap-3">
              <Button onClick={() => setTab("apps")} variant="secondary" size="sm">
                <Clock size={16} className="mr-2" /> Review Pending ({stats.pending_apps})
              </Button>
              <Button onClick={() => setTab("users")} variant="secondary" size="sm">
                <Users size={16} className="mr-2" /> Manage Users
              </Button>
              {stats.missing_files > 0 && (
                <Button onClick={() => setTab("health")} variant="secondary" size="sm">
                  <AlertTriangle size={16} className="mr-2 text-red-500" /> Fix {stats.missing_files} Missing Files
                </Button>
              )}
              {stats.pending_apps > 0 && (
                <Button onClick={approveAll} size="sm">
                  <CheckCircle2 size={16} className="mr-2" /> Approve All Pending
                </Button>
              )}
            </div>
          </GlassCard>

          {/* Community */}
          <GlassCard className="p-6" animate={false}>
            <h3 className="text-lg font-bold mb-2 flex items-center gap-2"><MessageSquare size={18} className="text-primary" /> Community</h3>
            <p className="text-on-surface-variant text-sm">{stats.total_posts} community posts</p>
          </GlassCard>
        </div>
      )}

      {/* ─── APPS TAB ─── */}
      {tab === "apps" && (
        <div className="space-y-10">
          {/* Pending */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold flex items-center gap-2"><Clock size={22} className="text-yellow-500" /> Pending Review</h2>
              {pending.length > 0 && <Button onClick={approveAll} size="xs">Approve All</Button>}
            </div>
            {pending.length === 0 ? (
              <GlassCard className="p-12 flex flex-col items-center text-center gap-4 border-dashed" animate={false}>
                <CheckCircle2 size={40} className="text-green-500/50" />
                <h2 className="text-xl font-bold">All caught up!</h2>
                <p className="text-on-surface-variant">No apps pending review.</p>
              </GlassCard>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {pending.map(app => (
                  <GlassCard key={app.id} className="p-6 flex flex-col md:flex-row gap-4 justify-between items-start md:items-center" animate={false}>
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className="w-11 h-11 rounded-xl bg-surface-low flex items-center justify-center text-primary shrink-0">{getCatIcon(app.category)}</div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-bold truncate">{app.name}</h3>
                          <span className="px-2 py-0.5 text-[10px] font-black uppercase tracking-widest rounded-full bg-surface-lowest text-on-surface-variant border border-outline-variant/30">v{app.version}</span>
                        </div>
                        <div className="flex gap-3 text-xs font-medium text-on-surface-variant mt-1">
                          <span className="flex items-center gap-1"><User size={12} /> {app.developer}</span>
                          <span className="flex items-center gap-1"><Tag size={12} /> {app.category}</span>
                          <span className="text-primary">{app.price === 0 ? "Free" : `$${app.price}`}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 w-full md:w-auto">
                      <button onClick={() => reject(app.id)} disabled={actionId === app.id}
                        className="flex-1 md:flex-none px-5 py-2.5 rounded-xl border border-outline-variant hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/30 transition-all font-bold text-xs flex items-center justify-center gap-1.5 disabled:opacity-50">
                        <XCircle size={16} /> {actionId === app.id ? "..." : "Reject"}
                      </button>
                      <Button onClick={() => approve(app.id)} disabled={actionId === app.id} size="sm" className="flex-1 md:flex-none">
                        {actionId === app.id ? "..." : "Approve"}
                      </Button>
                    </div>
                  </GlassCard>
                ))}
              </div>
            )}
          </section>

          {/* Published */}
          <section>
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2"><ShieldAlert size={22} className="text-red-500" /> Published Apps</h2>
            {published.length === 0 ? (
              <GlassCard className="p-12 flex flex-col items-center text-center gap-4 border-dashed" animate={false}>
                <Package size={40} className="text-on-surface-variant/30" />
                <p className="text-on-surface-variant">No published apps.</p>
              </GlassCard>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {published.map(app => (
                  <GlassCard key={app.id} className="p-6 flex flex-col md:flex-row gap-4 justify-between items-start md:items-center" animate={false}>
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className="w-11 h-11 rounded-xl bg-surface-low flex items-center justify-center text-primary shrink-0">{getCatIcon(app.category)}</div>
                      <div className="min-w-0">
                        <h3 className="text-lg font-bold truncate">{app.name}</h3>
                        <div className="flex gap-3 text-xs font-medium text-on-surface-variant mt-1">
                          <span className="flex items-center gap-1"><User size={12} /> {app.developer}</span>
                          <span className="flex items-center gap-1"><Tag size={12} /> {app.category}</span>
                        </div>
                      </div>
                    </div>
                    <button onClick={() => deleteApp(app.id, app.name)} disabled={actionId === app.id}
                      className="px-5 py-2.5 rounded-xl border border-red-500/30 bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-all font-bold text-xs flex items-center gap-1.5 disabled:opacity-50">
                      <Trash2 size={16} /> {actionId === app.id ? "..." : "Delete"}
                    </button>
                  </GlassCard>
                ))}
              </div>
            )}
          </section>
        </div>
      )}

      {/* ─── USERS TAB ─── */}
      {tab === "users" && (
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-md">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant" />
              <input value={userSearch} onChange={e => setUserSearch(e.target.value)}
                onKeyDown={e => e.key === "Enter" && loadUsers()}
                placeholder="Search users by name or email..."
                className="w-full pl-11 pr-4 py-3 rounded-xl liquid-glass border-none text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
            <Button onClick={loadUsers} variant="secondary" size="sm"><RefreshCw size={16} /></Button>
          </div>

          {users.length === 0 ? (
            <GlassCard className="p-12 flex flex-col items-center gap-4 border-dashed" animate={false}>
              <Users size={40} className="text-on-surface-variant/30" />
              <p className="text-on-surface-variant">No users found.</p>
            </GlassCard>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {users.map(u => (
                <GlassCard key={u.id} className="p-5 flex flex-col md:flex-row gap-4 items-start md:items-center" animate={false}>
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-surface-low flex items-center justify-center shrink-0 overflow-hidden">
                      {u.avatar_url ? <img src={u.avatar_url} alt="" className="w-full h-full object-cover" /> : <User size={20} className="text-on-surface-variant" />}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold truncate">{u.username}</span>
                        {u.is_admin && <span className="px-1.5 py-0.5 text-[9px] font-black uppercase rounded bg-red-500/10 text-red-500">Admin</span>}
                        {u.is_publisher && <span className="px-1.5 py-0.5 text-[9px] font-black uppercase rounded bg-blue-500/10 text-blue-500">Publisher</span>}
                        {!u.is_active && <span className="px-1.5 py-0.5 text-[9px] font-black uppercase rounded bg-gray-500/10 text-gray-500">Banned</span>}
                      </div>
                      <p className="text-xs text-on-surface-variant truncate">{u.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-xs font-medium text-on-surface-variant">
                    <span>{u.apps_count} apps</span>
                    <span>{u.downloads_count} downloads</span>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => toggleUser(u.id, "toggle-admin")} disabled={actionId === u.id} title={u.is_admin ? "Remove Admin" : "Make Admin"}
                      className={`p-2 rounded-lg transition-all disabled:opacity-50 ${u.is_admin ? "bg-red-500/10 text-red-500 hover:bg-red-500/20" : "bg-surface-low text-on-surface-variant hover:text-primary hover:bg-primary/10"}`}>
                      <Shield size={16} />
                    </button>
                    <button onClick={() => toggleUser(u.id, "toggle-publisher")} disabled={actionId === u.id} title={u.is_publisher ? "Remove Publisher" : "Make Publisher"}
                      className={`p-2 rounded-lg transition-all disabled:opacity-50 ${u.is_publisher ? "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20" : "bg-surface-low text-on-surface-variant hover:text-primary hover:bg-primary/10"}`}>
                      <UserCheck size={16} />
                    </button>
                    <button onClick={() => toggleUser(u.id, "toggle-active")} disabled={actionId === u.id} title={u.is_active ? "Ban User" : "Unban User"}
                      className={`p-2 rounded-lg transition-all disabled:opacity-50 ${!u.is_active ? "bg-amber-500/10 text-amber-500 hover:bg-amber-500/20" : "bg-surface-low text-on-surface-variant hover:text-red-500 hover:bg-red-500/10"}`}>
                      {u.is_active ? <Ban size={16} /> : <UserX size={16} />}
                    </button>
                  </div>
                </GlassCard>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ─── FILE HEALTH TAB ─── */}
      {tab === "health" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <p className="text-on-surface-variant text-sm">{fileHealth.length} apps with file paths · <span className="text-red-500 font-bold">{fileHealth.filter(f => f.status === "missing").length} missing</span></p>
            <Button onClick={loadHealth} variant="secondary" size="sm"><RefreshCw size={16} className="mr-2" /> Re-scan</Button>
          </div>

          {fileHealth.filter(f => f.status === "missing").length > 0 && (
            <GlassCard className="p-5 border-red-500/20" animate={false}>
              <div className="flex items-start gap-3">
                <AlertTriangle size={20} className="text-red-500 mt-0.5 shrink-0" />
                <div>
                  <h3 className="font-bold text-red-500">Missing Files Detected</h3>
                  <p className="text-sm text-on-surface-variant mt-1">These apps have local file paths that no longer exist on the server. This typically happens when Render&apos;s ephemeral storage is wiped after a deploy. Developers have been automatically notified when users try to download.</p>
                </div>
              </div>
            </GlassCard>
          )}

          <div className="grid grid-cols-1 gap-3">
            {fileHealth.map(f => (
              <GlassCard key={f.id} className="p-5 flex flex-col md:flex-row gap-3 items-start md:items-center" animate={false}>
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {f.status === "ok" ? <CheckCircle2 size={20} className="text-green-500 shrink-0" />
                   : f.status === "missing" ? <AlertTriangle size={20} className="text-red-500 shrink-0" />
                   : <HardDrive size={20} className="text-on-surface-variant shrink-0" />}
                  <div className="min-w-0">
                    <span className="font-bold">{f.name}</span>
                    <p className="text-xs text-on-surface-variant truncate mt-0.5">{f.file_path}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-xs font-medium">
                  <span className="flex items-center gap-1 text-on-surface-variant">
                    {f.storage === "cloud" ? <Cloud size={14} /> : <HardDrive size={14} />} {f.storage}
                  </span>
                  <span className={`px-2 py-1 rounded-lg font-bold uppercase tracking-wider text-[10px] ${
                    f.status === "ok" ? "bg-green-500/10 text-green-600"
                    : f.status === "missing" ? "bg-red-500/10 text-red-500"
                    : "bg-gray-500/10 text-gray-500"
                  }`}>{f.status}</span>
                  <span className="text-on-surface-variant">{f.developer}</span>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}