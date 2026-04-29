import type { Metadata } from "next";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import AppDetailClient from "./AppDetailClient";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://pandas-store-api.onrender.com";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  try {
    const res = await fetch(`${API_BASE}/apps/${id}`);
    if (res.ok) {
      const app = await res.json();
      return {
        title: app.name,
        description: app.description || `Download ${app.name} on PandaStore.`,
        openGraph: {
          title: app.name,
          description: app.description,
          images: app.icon_url ? [{ url: app.icon_url }] : [],
        },
        twitter: {
          card: "summary_large_image",
          title: app.name,
          description: app.description,
          images: app.icon_url ? [app.icon_url] : [],
        }
      };
    }
  } catch (e) {
    console.error("Metadata fetch error:", e);
  }
  return { title: "App Details | PandaStore" };
}

export function generateStaticParams() {
  return [{ id: 'placeholder' }];
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="animate-spin text-primary" size={48} />
        </div>
      }
    >
      <AppDetailClient id={id} />
    </Suspense>
  );
}