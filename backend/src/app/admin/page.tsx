"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { CheckCircle2, Clock, ShieldAlert, XCircle, User, Tag } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";

// Define the shape of our app data based on your backend Pydantic schema
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

export default function AdminDashboard() {
    const router = useRouter();
    const { data: session, status } = useSession();

    const [apps, setApps] = useState<PendingApp[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<number | null>(null);

    useEffect(() => {
        // Only run if authentication is fully resolved
        if (status === "loading") return;

        const token = localStorage.getItem("token");
        if (!token && status === "unauthenticated") {
            toast.error("Please sign in to access the admin panel.");
            router.push("/login");
            return;
        }

        fetchPendingApps();
    }, [status, router]);

    const fetchPendingApps = async () => {
        try {
            setLoading(true);
            const res = await api.get("/apps/admin/pending");
            setApps(res.data);
        } catch (err: any) {
            if (err.response?.status === 403) {
                toast.error("Access Denied: You are not an admin.");
                router.push("/"); // Kick non-admins back to the home page
            } else {
                toast.error("Failed to load pending apps.");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id: number) => {
        try {
            setActionLoading(id);
            await api.patch(`/apps/admin/${id}/approve`);
            toast.success("App successfully approved and published!");
            // Remove the approved app from the UI queue
            setApps((prev) => prev.filter((app) => app.id !== id));
        } catch (err: any) {
            toast.error(err.response?.data?.detail || "Failed to approve app.");
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
            {/* Header */}
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
                    <h2 className="text-2xl font-bold text-on-surface">You're all caught up!</h2>
                    <p className="text-on-surface-variant max-w-md">
                        There are no apps pending review at the moment. Time for a coffee break.
                    </p>
                </GlassCard>
            ) : (
                <div className="grid grid-cols-1 gap-6">
                    {apps.map((app) => (
                        <GlassCard key={app.id} className="p-8 flex flex-col md:flex-row gap-6 justify-between items-start md:items-center transition-all hover:border-primary/30">
                            <div className="space-y-4 flex-1">
                                <div>
                                    <div className="flex items-center gap-3">
                                        <h3 className="text-2xl font-bold">{app.name}</h3>
                                        <span className="px-3 py-1 text-xs font-bold uppercase tracking-widest rounded-full bg-surface-low text-on-surface-variant">
                                            v{app.version}
                                        </span>
                                    </div>
                                    <p className="text-on-surface-variant mt-2 line-clamp-2">{app.description}</p>
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
                                {/* Future implementation: Reject button */}
                                <button className="flex-1 md:flex-none px-6 py-3 rounded-2xl border border-outline-variant hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/30 transition-all font-bold text-sm flex items-center justify-center gap-2">
                                    <XCircle size={18} /> Reject
                                </button>

                                <Button
                                    onClick={() => handleApprove(app.id)}
                                    disabled={actionLoading === app.id}
                                    className="flex-1 md:flex-none px-8"
                                >
                                    {actionLoading === app.id ? "Approving..." : "Approve App"}
                                </Button>
                            </div>
                        </GlassCard>
                    ))}
                </div>
            )}
        </div>
    );
}