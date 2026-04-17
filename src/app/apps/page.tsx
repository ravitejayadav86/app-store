"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { ArrowLeft, Download, Star, ShieldCheck, Gamepad2, Code2 } from "lucide-react";
import api from "@/lib/api";
import { toast } from "sonner";

interface AppData {
  id: number;
  name: string;
  description: string;
  category: string;
  developer: string;
  price: number;
  version: string;
  created_at: string;
}

export default function AppDetails() {
  const params = useParams();
  const router = useRouter();
  const [app, setApp] = useState<AppData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApp = async () => {
      try {
        const res = await api.get(`/apps/${params.id}`);
        setApp(res.data);
      } catch (error: any) {
        toast.error("App not found");
        router.push("/");
      } finally {
        setLoading(false);
      }
    };
    if (params.id) fetchApp();
  }, [params.id, router]);

  if (loading) {
    return <div className="min-h-screen pt-32 text-center">Loading app details...</div>;
  }

  if (!app) return null;

  return (
    <div className="max-w-5xl mx-auto px-4 pt-32 pb-20">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors mb-8"
      >
        <ArrowLeft size={20} /> Back to Store
      </button>

      <GlassCard className="p-8 md:p-12 relative overflow-hidden">
        {/* Background Blur */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[80px] -z-10" />

        <div className="flex flex-col md:flex-row gap-8 items-start">
          {/* App Icon */}
          <div className="w-32 h-32 rounded-3xl bg-gradient-to-br from-surface-low to-background flex items-center justify-center border border-outline-variant shadow-2xl shrink-0">
            {app.category === "Games" ? <Gamepad2 size={64} className="text-primary" /> : <Code2 size={64} className="text-primary" />}
          </div>

          {/* Core Info */}
          <div className="flex-1 space-y-4">
            <div>
              <h1 className="text-4xl font-bold text-on-surface mb-2">{app.name}</h1>
              <p className="text-lg text-primary font-medium">{app.developer}</p>
            </div>

            <div className="flex flex-wrap gap-4 text-sm font-medium text-on-surface-variant">
              <span className="flex items-center gap-1"><Star size={16} className="text-yellow-500" /> 4.8 Ratings</span>
              <span className="flex items-center gap-1 px-3 py-1 bg-surface-low rounded-full">{app.category}</span>
              <span className="flex items-center gap-1 px-3 py-1 bg-surface-low rounded-full">v{app.version}</span>
            </div>
          </div>

          {/* Action Button */}
          <div className="w-full md:w-auto shrink-0 flex flex-col gap-3">
            <Button size="lg" className="w-full md:w-48 py-6 text-lg shadow-primary/25 shadow-xl">
              {/* NEW: Universal Download Button without Price Logic */}
              <Button
                size="lg"
                className="w-full md:w-48 py-6 text-lg shadow-primary/25 shadow-xl"
                onClick={handleDownload}
                disabled={downloading}
              >
                <Download size={20} className="mr-2" />
                {downloading ? "Downloading..." : "Download"}
              </Button>
            </Button>
            <p className="text-xs text-center text-on-surface-variant flex items-center justify-center gap-1">
              <ShieldCheck size={14} className="text-green-500" /> Verified Safe
            </p>
          </div>
        </div>

        {/* Description Section */}
        <div className="mt-12 pt-12 border-t border-outline-variant/50">
          <h2 className="text-2xl font-bold mb-6">About this {app.category === "Games" ? "game" : "app"}</h2>
          <p className="text-on-surface-variant leading-relaxed whitespace-pre-wrap">
            {app.description}
          </p>
        </div>
      </GlassCard>
    </div>
  );
}