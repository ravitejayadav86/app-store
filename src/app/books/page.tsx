"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { BookOpen, Star, Loader2, Search } from "lucide-react";
import api from "@/lib/api";
import Link from "next/link";

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

  const filtered = books.filter((b) =>
    !search ||
    b.name.toLowerCase().includes(search.toLowerCase()) ||
    b.developer.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-12 md:gap-20 pb-20 pt-4 md:pt-0">
      <section className="px-4 md:px-8">
        <div className="relative h-[380px] md:h-[500px] w-full max-w-7xl mx-auto rounded-[2.5rem] overflow-hidden bg-gradient-to-br from-purple-900 to-indigo-900 p-8 md:p-12 text-white flex flex-col justify-end gap-4 shadow-2xl">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="absolute top-0 right-0 w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-purple-500/20 rounded-full blur-[100px] -mr-20 -mt-20"
          />
          <div className="relative z-10 max-w-2xl">
            <div className="flex items-center gap-2 mb-3 bg-white/10 w-fit px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest backdrop-blur-md border border-white/20">
              <BookOpen size={12} />
              <span>PandaStore Books</span>
            </div>
            <h1 className="text-4xl md:text-7xl font-black tracking-tight mb-2">Read &amp; Evolve.</h1>
            <p className="text-sm md:text-xl text-white/80 mb-2 font-medium max-w-sm">
              Discover e-books, guides, and publications published by the PandaStore community.
            </p>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 md:px-8 w-full">
        <div className="flex flex-col md:flex-row justify-between items-end gap-8 mb-12">
          <div className="flex items-center gap-3">
            <BookOpen className="text-primary" />
            <h2 className="text-3xl font-bold text-on-surface">Available Books</h2>
          </div>
          <div className="relative w-full md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant" size={16} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Find a publication..."
              className="w-full pl-10 pr-4 py-3 rounded-2xl glass border border-outline-variant focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm font-medium"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="animate-spin text-primary" size={40} />
          </div>
        ) : filtered.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filtered.map((book, index) => (
              <motion.div
                key={book.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + index * 0.1 }}
              >
                <Link href={`/apps/${book.id}`}>
                  <GlassCard className="flex gap-6 h-full group cursor-pointer hover:bg-surface-low transition-all">
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
            ))}
          </div>
        ) : (
          <div className="py-20 text-center bg-surface-low rounded-3xl border border-dashed border-outline-variant">
            <BookOpen size={48} className="mx-auto mb-4 text-on-surface-variant opacity-30" />
            <p className="text-on-surface-variant text-lg">
              {search ? `No books matching "${search}"` : "No books published yet."}
            </p>
            {!search && (
              <Link href="/publisher/upload?category=Books&price=0">
                <Button variant="secondary" className="mt-4">Publish a Book</Button>
              </Link>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
