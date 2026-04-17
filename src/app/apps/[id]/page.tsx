import type { Metadata } from "next";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import AppDetailClient from "./AppDetailClient";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://pandas-store-api.onrender.com";

export async function generateMetadata(
  { params }: { params: { id: string } }
): Promise<Metadata> {
  try {
    const res = await fetch(`${API_BASE}/apps/${params.id}`, { next: { revalidate: 3600 } });
    if (res.ok) {
      const app = await res.json();
      return {
        title: app.name,
        description:
          app.description ||
          `Download ${app.name} on PandaStore — ${app.category} by ${app.developer}.`,
        openGraph: {
          title: `${app.name} | PandaStore`,
          description: app.description || `Download ${app.name} on PandaStore.`,
          type: "website",
        },
      };
    }
  } catch {
    // fall through to default
  }
  return { title: "App Details" };
}

export default function AppPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="animate-spin text-primary" size={48} />
        </div>
      }
    >
      <AppDetailClient />
    </Suspense>
  );
}