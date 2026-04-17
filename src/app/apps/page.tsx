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
}

function getCategoryIcon(category: string) {
  switch (category?.toLowerCase()) {
    case "games": return <Gamepad2 size={32} className="text-white" />;
    case "music": return <Music size={32} className="text-white" />;
    case "books": return <BookOpen size={32} className="text-white" />;
    default: return <Code2 size={32} className="text-white" />;
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
    <div className="max-w-7xl mx-auto px-4 pt-32 pb-20">
      <div className="mb-10">
        <h1 className="text-4xl font-bold tracking-tight mb-2">Browse Store</h1>
        <p className="text-on-surface-variant">Discover apps, games, music and books.</p>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search apps, games, music..."
          className="w-full pl-12 pr-4 py-4 rounded-2xl glass border border-outline-variant focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
        />
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 mb-8">
        {ALL_CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all ${
              activeCategory === cat
                ? "bg-primary text-on-primary shadow-lg shadow-primary/20"
                : "bg-surface-low text-on-surface-variant hover:text-on-surface border border-outline-variant/50"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="animate-spin text-primary" size={40} />
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-20 text-center text-on-surface-variant">
          <p className="text-lg font-medium">No results found for &ldquo;{search}&rdquo;</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((app) => (
            <Link
              key={app.id}
              href={`/apps/${app.id}`}
              className="group"
            >
              <div className="glass border border-outline-variant rounded-3xl p-6 hover:border-primary/30 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/10 flex flex-col gap-4">
                <div className={`w-16 h-16 rounded-2xl ${getCategoryColor(app.category)} flex items-center justify-center shadow-sm`}>
                  {getCategoryIcon(app.category)}
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-on-surface group-hover:text-primary transition-colors truncate">{app.name}</h3>
                  <p className="text-sm text-on-surface-variant truncate mt-0.5">{app.category} • {app.developer}</p>
                  <p className="text-sm text-on-surface-variant mt-2 line-clamp-2">{app.description}</p>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-xs text-on-surface-variant">
                    <Star size={12} className="fill-yellow-400 text-yellow-400" />
                    <span>4.8</span>
                  </div>
                  <span className={`text-sm font-bold px-3 py-1 rounded-full ${app.price === 0 ? "bg-green-500/10 text-green-500" : "bg-primary/10 text-primary"}`}>
                    {app.price === 0 ? "Free" : `$${app.price}`}
                  </span>
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
