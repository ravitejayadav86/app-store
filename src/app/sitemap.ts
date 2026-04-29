import { MetadataRoute } from "next";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://pandas-store-api.onrender.com";

export const dynamic = "force-static";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = "https://app-store-smoky.vercel.app";

  // Static routes
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: base, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${base}/discover`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/apps`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/games`, lastModified: new Date(), changeFrequency: "daily", priority: 0.8 },
    { url: `${base}/music`, lastModified: new Date(), changeFrequency: "daily", priority: 0.8 },
    { url: `${base}/books`, lastModified: new Date(), changeFrequency: "daily", priority: 0.8 },
    { url: `${base}/library`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.6 },
    { url: `${base}/publisher`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    { url: `${base}/login`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.4 },
    { url: `${base}/register`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.4 },
  ];

  // Dynamic app routes
  try {
    const res = await fetch(`${API_BASE}/apps/`);
    if (res.ok) {
      const apps = await res.json();
      const dynamicRoutes: MetadataRoute.Sitemap = apps.map((app: { id: number; created_at: string }) => ({
        url: `${base}/apps/${app.id}`,
        lastModified: new Date(app.created_at),
        changeFrequency: "weekly" as const,
        priority: 0.7,
      }));
      return [...staticRoutes, ...dynamicRoutes];
    }
  } catch {
    // Fall back to static-only if API is unreachable
  }

  return staticRoutes;
}
