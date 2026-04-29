"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { BookOpen, Star, Loader2, Search, Sparkles, ExternalLink, Zap, ArrowLeft, X } from "lucide-react";
import api from "@/lib/api";
import Link from "next/link";
import { ANIME_BOOKS, AnimeBook } from "@/data/animeBooks";

interface BookApp {
  id: number;
  name: string;
  description: string;
  developer: string;
  price: number;
  version: string;
  category: string;
}

const COLORS = [
  "bg-blue-600", "bg-pink-600", "bg-purple-600",
  "bg-orange-600", "bg-cyan-600", "bg-emerald-600",
];

export default function BooksPage() {
  const [books, setBooks] = useState<BookApp[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<"all" | "anime">("all");

  useEffect(() => {
    api.get("/apps/")
      .then((res) => {
        const filtered = res.data.filter((app: BookApp) =>
          app.category?.toLowerCase() === "books" ||
          app.category?.toLowerCase() === "book"
        );
        setBooks(filtered);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filteredBooks = books.filter((b) =>
    !search ||
    b.name.toLowerCase().includes(search.toLowerCase()) ||
    b.developer.toLowerCase().includes(search.toLowerCase())
  );

  const filteredAnime = ANIME_BOOKS.filter((b) =>
    !search ||
    b.title.toLowerCase().includes(search.toLowerCase()) ||
    b.author.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-12 md:gap-20 pb-20 pt-4 md:pt-0">
      {/* HERO SECTION */}
      <section className="px-4 md:px-8">
        <div className="relative h-[380px] md:h-[500px] w-full max-w-7xl mx-auto rounded-[2.5rem] overflow-hidden bg-gradient-to-br from-indigo-950 via-purple-900 to-fuchsia-900 p-8 md:p-12 text-white flex flex-col justify-end gap-4 shadow-2xl">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="absolute top-0 right-0 w-[400px] md:w-[600px] h-[400px] md:h-[600px] bg-white/5 rounded-full blur-[120px] -mr-40 -mt-40"
          />
          <div className="relative z-10 max-w-2xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 mb-4 bg-white/10 w-fit px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest backdrop-blur-md border border-white/20"
            >
              <Sparkles size={12} className="text-yellow-400" />
              <span>Premium Library</span>
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-5xl md:text-8xl font-black tracking-tight mb-4 leading-none"
            >
              Read.<br/>Evolve.
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-base md:text-2xl text-white/70 mb-8 font-medium max-w-lg leading-relaxed"
            >
              Access the world's most popular Manga and Anime books, alongside local community publications.
            </motion.p>
            <div className="flex gap-4">
              <Button onClick={() => setTab("anime")} className="rounded-2xl px-8 py-6 bg-white text-black hover:bg-white/90">
                Explore Manga
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* NAVIGATION TABS */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 w-full">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8 mb-12">
          <div className="flex p-1.5 bg-surface-container-low rounded-2xl border border-outline-variant">
            <button 
              onClick={() => setTab("all")}
              className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${tab === "all" ? "bg-primary text-on-primary shadow-lg" : "text-on-surface-variant hover:bg-surface-variant"}`}
            >
              Community Books
            </button>
            <button 
              onClick={() => setTab("anime")}
              className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${tab === "anime" ? "bg-primary text-on-primary shadow-lg" : "text-on-surface-variant hover:bg-surface-variant"}`}
            >
              <Zap size={14} />
              Anime & Manga
            </button>
          </div>

          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant" size={18} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={tab === "all" ? "Search community books..." : "Find your favorite manga..."}
              className="w-full pl-12 pr-4 py-4 rounded-[1.5rem] glass border border-outline-variant focus:outline-none focus:ring-2 focus:ring-primary/20 text-base font-medium shadow-sm"
            />
          </div>
        </div>

        {tab === "all" ? (
          /* COMMUNITY BOOKS GRID */
          loading ? (
            <div className="flex flex-col items-center justify-center py-32 gap-4">
              <Loader2 className="animate-spin text-primary" size={48} />
              <p className="text-on-surface-variant font-bold animate-pulse">Scanning archives...</p>
            </div>
          ) : filteredBooks.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredBooks.map((book, index) => (
                <BookCard key={book.id} book={book} index={index} />
              ))}
            </div>
          ) : (
            <EmptyState search={search} />
          )
        ) : (
          /* ANIME & MANGA GRID */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredAnime.map((manga, index) => (
              <MangaCard key={manga.id} manga={manga} index={index} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function BookCard({ book, index }: { book: BookApp; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.05 }}
    >
      <Link href={`/apps/${book.id}`}>
        <GlassCard className="flex gap-6 h-full group cursor-pointer hover:bg-surface-low transition-all border-none ring-1 ring-outline-variant/10 hover:ring-primary/20">
          <div className={`w-32 h-44 rounded-xl ${COLORS[index % COLORS.length]} flex-shrink-0 shadow-2xl relative overflow-hidden flex flex-col justify-end p-3 transform group-hover:-translate-y-2 group-hover:rotate-2 transition-all duration-500`}>
            <div className="absolute top-0 right-0 p-2 opacity-20">
              <BookOpen size={40} />
            </div>
            <div className="w-full h-1 bg-white/20 mb-2 rounded-full" />
            <p className="text-[10px] font-bold text-white uppercase tracking-tighter opacity-70">PandaStore</p>
          </div>
          <div className="flex flex-col justify-between py-1">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-primary mb-2 block">{book.category}</span>
              <h3 className="text-xl font-bold text-on-surface leading-tight mb-1 group-hover:text-primary transition-colors">{book.name}</h3>
              <p className="text-sm text-on-surface-variant font-medium">{book.developer}</p>
              <p className="text-xs text-on-surface-variant mt-2 line-clamp-2">{book.description}</p>
            </div>
            <div className="flex items-center justify-between mt-auto">
              <div className="flex items-center gap-1.5">
                <Star size={14} className="text-yellow-500 fill-current" />
                <span className="text-xs font-bold text-on-surface-variant">New</span>
              </div>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${book.price === 0 ? "bg-green-500/10 text-green-500" : "bg-primary/10 text-primary"}`}>
                {book.price === 0 ? "Free" : `$${book.price}`}
              </span>
            </div>
          </div>
        </GlassCard>
      </Link>
    </motion.div>
  );
}

function MangaCard({ manga, index }: { manga: AnimeBook; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: -8 }}
      className="group"
    >
      <Link href={`/books/${manga.id}`}>
        <div className="relative aspect-[2/3] rounded-2xl overflow-hidden shadow-xl mb-4">
          <img 
            src={manga.coverUrl} 
            alt={manga.title} 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />
          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            <div className="px-2 py-1 rounded-lg bg-black/40 backdrop-blur-md text-white text-[9px] font-black uppercase tracking-wider border border-white/10 w-fit">
              {manga.type || "Manga"}
            </div>
          </div>
          <div className="absolute top-3 right-3 px-2 py-1 rounded-lg bg-primary text-on-primary text-[10px] font-black uppercase tracking-widest shadow-lg">
            {manga.status}
          </div>
          <div className="absolute bottom-4 left-4 right-4 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all">
            <div className="flex items-center justify-center gap-2 text-white font-bold text-sm bg-white/20 backdrop-blur-md px-4 py-2 rounded-xl border border-white/30">
              <BookOpen size={14} />
              Read Now
            </div>
          </div>
        </div>
        <h4 className="text-base font-bold text-on-surface group-hover:text-primary transition-colors truncate">{manga.title}</h4>
        <p className="text-xs text-on-surface-variant font-medium mb-1">{manga.author}</p>
        <span className="text-[10px] px-2 py-0.5 rounded-md bg-surface-container-high text-on-surface-variant font-bold">
          {manga.category}
        </span>
      </Link>
    </motion.div>
  );
}

function EmptyState({ search }: { search: string }) {
  return (
    <div className="py-24 text-center bg-surface-low rounded-[2.5rem] border-2 border-dashed border-outline-variant/30">
      <BookOpen size={64} className="mx-auto mb-6 text-on-surface-variant opacity-20" />
      <h3 className="text-2xl font-bold text-on-surface mb-2">
        {search ? "No matches found" : "Library is quiet"}
      </h3>
      <p className="text-on-surface-variant text-base mb-8 max-w-sm mx-auto">
        {search ? `We couldn't find any books matching "${search}".` : "The community hasn't published any books yet. Be the first!"}
      </p>
      {!search && (
        <Link href="/publisher/upload?category=Books&price=0">
          <Button className="rounded-2xl px-8 h-12 shadow-xl shadow-primary/20">Publish a Publication</Button>
        </Link>
      )}
    </div>
  );
}
