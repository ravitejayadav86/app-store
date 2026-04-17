import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/api", "/publisher/upload"],
      },
    ],
    sitemap: "https://pandas-store.vercel.app/sitemap.xml",
    host: "https://pandas-store.vercel.app",
  };
}
