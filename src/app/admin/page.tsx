"use client";

import React, { useEffect, useState, useCallback, Suspense } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { CheckCircle2, Clock, ShieldAlert, XCircle, User, Tag, Music, BookOpen } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";

interface PendingApp {
    id: number;
    name: string;
    description: string;
    category: string;
    developer: string;
    version: string;
    price: number;
    created_at: string;
}

interface ApiError {
    response?: {
        status?: number;
        data?: {
            detail?: string;
        };
    };
}

export default function AdminDashboard() {
    return (
        <Suspense fallback={
            <div className="max-w-6xl mx-auto px-4 py-20 flex items-center justify-center">
                <div className="animate-pulse flex flex-col items-center gap-4">
                    <Clock size={40} className="text-primary opacity-50" />
                    <p className="text-on-surface-variant font-medium">Loading review queue...</p>
                </div>
            </div>
        }>
            <AdminContent />
        </Suspense>
    );
}

function AdminContent() {
    const router = useRouter();
    const { status } = useSession();

    const [apps, setApps] = useState<PendingApp[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<number | null>(null);

    const fetchPendingApps = useCallback(async () => {
        try {
            setLoading(true);
            const res = await api.get("/admin/pending");
            setApps(res.data);
        } catch (err: unknown) {
            const error = err as ApiError;
            if (error.response?.status === 403) {
                toast.error("Access Denied: You are not an admin.");
                router.push("/");
            } else {
                toast.error("Failed to load pending apps.");
            }
        } finally {
            setLoading(false);
        }
    }, [router]);

    useEffect(() => {
        if (status === "loading") return;

        const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
        if (!token && status === "unauthenticated") {
            toast.error("Please sign in to access the admin panel.");
            router.push("/login");
            return;
        }

        fetchPendingApps();
    }, [status, router, fetchPendingApps]);

    const handleApprove = async (id: number) => {
        try {
            setActionLoading(id);
            await api.post(`/admin/approve/${id}`);
            toast.success("Successfully approved and published!");
            setApps((prev) => prev.filter((app) => app.id !== id));
        } catch (err: unknown) {
            const error = err as ApiError;
            toast.error(error.response?.data?.detail || "Failed to approve app.");
        } finally {
            setActionLoading(null);
        }
    };

    const handleReject = async (id: number) => {
        if (!confirm("Reject and permanently delete this submission?")) return;
        try {
            setActionLoading(id);
            await api.post(`/admin/reject/${id}`);
            toast.success("Submission rejected and removed.");
            setApps((prev) => prev.filter((app) => app.id !== id));
        } catch (err: unknown) {
            const error = err as ApiError;
            toast.error(error.response?.data?.detail || "Failed to reject app.");
        } finally {
            setActionLoading(null);
        }
    };

    if (loading) {
        return (
            <div className="max-w-6xl mx-auto px-4 py-20 flex items-center justify-center">
                <div className="animate-pulse flex flex-col items-center gap-4">
                    <Clock size={40} className="text-primary opacity-50" />
                    <p className="text-on-surface-variant font-medium">Loading review queue...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto px-4 py-20">
            <div className="flex items-center gap-4 mb-12">
                <div className="p-4 rounded-2xl bg-red-500/10">
                    <ShieldAlert size={32} className="text-red-500" />
                </div>
                <div>
                    <h1 className="text-4xl font-bold tracking-tight">Admin Control Center</h1>
                    <p className="text-on-surface-variant font-medium mt-1">
                        Review and approve user-submitted applications.
                    </p>
                </div>
            </div>

            {apps.length === 0 ? (
                <GlassCard className="p-16 flex flex-col items-center text-center gap-6 border-dashed">
                    <CheckCircle2 size={48} className="text-green-500/50" />
                    <h2 className="text-2xl font-bold text-on-surface">You&apos;re all caught up!</h2>
                    <p className="text-on-surface-variant max-w-md">
                        There are no apps pending review at the moment. Time for a coffee break.
                    </p>
                </GlassCard>
            ) : (
                <div className="grid grid-cols-1 gap-6">
                    {apps.map((app) => {
                        const category = app.category?.toLowerCase() || '';
                        return (
                            <GlassCard key={app.id} className="p-8 flex flex-col md:flex-row gap-6 justify-between items-start md:items-center transition-all hover:border-primary/30">
                                <div className="space-y-4 flex-1">
                                    <div>
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-surface-low flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                                {category === 'music' ? <Music size={24} /> : 
                                                category === 'books' ? <BookOpen size={24} /> : 
                                                <Tag size={24} />}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-3">
                                                    <h3 className="text-2xl font-bold">{app.name}</h3>
                                                    <span className="px-3 py-1 text-xs font-bold uppercase tracking-widest rounded-full bg-surface-lowest text-on-surface-variant border border-outline-variant/30">
                                                        v{app.version}
                                                    </span>
                                                </div>
                                                <p className="text-on-surface-variant mt-1 line-clamp-1">{app.description}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-4 text-sm font-medium text-on-surface-variant">
                                        <span className="flex items-center gap-1.5"><User size={16} /> {app.developer}</span>
                                        <span className="flex items-center gap-1.5"><Tag size={16} /> {app.category}</span>
                                        <span className="flex items-center gap-1.5 text-primary">
                                            {app.price === 0 ? "Free" : `$${app.price}`}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex w-full md:w-auto gap-3">
                                    <button
                                        onClick={() => handleReject(app.id)}
                                        disabled={actionLoading === app.id}
                                        className="flex-1 md:flex-none px-6 py-3 rounded-2xl border border-outline-variant hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/30 transition-all font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50">
                                        <XCircle size={18} /> {actionLoading === app.id ? "..." : "Reject"}
                                    </button>

                                    <Button
                                        onClick={() => handleApprove(app.id)}
                                        disabled={actionLoading === app.id}
                                        className="flex-1 md:flex-none px-8"
                                    >
                                        {actionLoading === app.id ? "Approving..." : 
                                        category === 'music' ? "Approve Music" :
                                        category === 'books' ? "Approve Book" :
                                        "Approve Content"}
                                    </Button>
                                </div>
                            </GlassCard>
                        );
                    })}
                </div>
            )}
        </div>
    );
}