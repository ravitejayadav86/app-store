"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, Search, Star, Music, BookOpen, Gamepad2, Code2 } from "lucide-react";
import api from "@/lib/api";

interface App {
  id: number;
  name: string;
  description: string;
  category: string;
  developer: string;
  price: number;
  version: string;
  icon_url?: string | null;
}

function getCategoryIcon(category: string, size: number = 32) {
  switch (category?.toLowerCase()) {
    case "games": return <Gamepad2 size={size} className="text-white" />;
    case "music": return <Music size={size} className="text-white" />;
    case "books": return <BookOpen size={size} className="text-white" />;
    default: return <Code2 size={size} className="text-white" />;
  }
}

function getCategoryColor(category: string) {
  switch (category?.toLowerCase()) {
    case "productivity": return "bg-[#255CFA]";
    case "graphics": return "bg-[#F36B2B]";
    case "development": return "bg-[#FFC400]";
    case "utilities": return "bg-[#202124]";
    case "music": return "bg-[#E91E63]";
    case "books": return "bg-[#673AB7]";
    case "games": return "bg-[#00C853]";
    default: return "bg-primary";
  }
}

const ALL_CATEGORIES = ["All", "Apps", "Games", "Music", "Books", "Productivity", "Development"];

export default function AppsPage() {
  const [apps, setApps] = useState<App[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  useEffect(() => {
    api.get("/apps/")
      .then((res) => setApps(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = apps.filter((app) => {
    const matchesSearch =
      app.name.toLowerCase().includes(search.toLowerCase()) ||
      app.developer.toLowerCase().includes(search.toLowerCase());
    const matchesCategory =
      activeCategory === "All" ||
      activeCategory === "Apps" ||
      app.category.toLowerCase() === activeCategory.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 pt-24 pb-20">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight mb-1">Browse Store</h1>
        <p className="text-on-surface-variant text-sm">Discover apps, games, music and books.</p>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search apps, games, music..."
          className="w-full pl-11 pr-4 py-3 rounded-xl glass border border-outline-variant focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm font-medium"
        />
      </div>

      {/* Category Tabs */}
      <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-2 mb-6">
        {ALL_CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
              activeCategory === cat
                ? "bg-primary text-on-primary shadow-md shadow-primary/10"
                : "bg-surface-low text-on-surface-variant hover:text-on-surface border border-outline-variant/50"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="animate-spin text-primary" size={32} />
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-20 text-center text-on-surface-variant">
          <p className="text-base font-medium">No results found for &ldquo;{search}&rdquo;</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 gap-x-4 gap-y-8">
          {filtered.map((app) => (
            <Link
              key={app.id}
              href={`/apps/${app.id}`}
              className="group"
            >
              <div className="flex flex-col gap-2 group cursor-pointer w-full">
                <div className="w-full aspect-square rounded-[22%] bg-surface-low shadow-sm border border-outline-variant/10 relative overflow-hidden group-hover:shadow-md transition-all">
                  {app.icon_url ? (
                    <img src={app.icon_url} alt={app.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-3xl font-bold bg-primary/10 text-primary">
                      {getCategoryIcon(app.category, 32)}
                    </div>
                  )}
                </div>
                <div className="mt-1 px-0.5">
                  <h3 className="text-[13px] md:text-sm font-medium text-on-surface line-clamp-2 leading-tight group-hover:text-primary transition-colors">{app.name}</h3>
                  <div className="flex items-center gap-1 mt-1 text-[11px] text-on-surface-variant">
                    <span className="font-semibold">{app.price === 0 ? "Free" : `$${app.price}`}</span>
                    <span>•</span>
                    <span className="truncate">{app.category || "App"}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      <style dangerouslySetInnerHTML={{__html: `.no-scrollbar::-webkit-scrollbar{display:none}.no-scrollbar{-ms-overflow-style:none;scrollbar-width:none}`}} />
    </div>
  );
}
