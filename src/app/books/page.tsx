"use client";
import React, { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { BookOpen, Star, Search, Bookmark } from "lucide-react";
import api from "@/lib/api";
import Link from "next/link";
import debounce from "lodash/debounce";

interface BookApp {
  id: number;
  name: string;
  description: string;
  developer: string;
  price: number;
  version: string;
  category: string;
  icon_url?: string | null;
}

const COLORS = [
  "bg-indigo-600", "bg-violet-600", "bg-purple-600",
  "bg-blue-600", "bg-cyan-600", "bg-emerald-600",
];

export default function BooksPage() {
  const [books, setBooks] = useState<BookApp[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchBooks = useCallback(async (q: string) => {
    setLoading(true);
    try {
      const res = await api.get("/apps/", { 
        params: { category: "Books", q } 
      });
      setBooks(res.data);
    } catch (error) {
      console.error("Failed to fetch books:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const debouncedFetch = useCallback(
    debounce((q: string) => fetchBooks(q), 500),
    [fetchBooks]
  );

  useEffect(() => {
    if (search) {
      debouncedFetch(search);
    } else {
      fetchBooks("");
    }
    return () => debouncedFetch.cancel();
  }, [search, debouncedFetch, fetchBooks]);

  return (
    <div className="flex flex-col gap-10 pb-32">
      <section className="px-4 pt-12">
        <div className="relative h-[250px] md:h-[350px] w-full max-w-7xl mx-auto rounded-[2.5rem] overflow-hidden bg-black p-8 md:p-12 text-white flex flex-col justify-end gap-3 shadow-2xl">
          <div className="absolute inset-0 bg-linear-to-tr from-black via-black/80 to-indigo-500/20" />
          
          <div className="relative z-10 max-w-xl">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 mb-2 bg-white/10 w-fit px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest backdrop-blur-md border border-white/10"
            >
              <Bookmark size={12} />
              <span>Archive v3.0</span>
            </motion.div>
            <h1 className="text-3xl md:text-5xl font-black tracking-tighter leading-none mb-1">Mind Vault.</h1>
            <p className="text-[11px] md:text-base text-gray-400 font-medium max-w-xs">Technical deep-dives and indie publications for the modern mind.</p>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto w-full px-4">
        <div className="relative group w-full mb-8">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search publications..."
            className="w-full pl-10 pr-6 py-3 rounded-xl bg-white border border-outline-variant/20 outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500/30 transition-all text-[12px] font-semibold"
          />
        </div>

        <div className="flex items-center justify-between mb-6 px-2">
          <div className="flex items-center gap-2">
            <BookOpen size={16} className="text-indigo-500" />
            <h2 className="text-lg font-black text-on-surface tracking-tighter">Vault Registry</h2>
          </div>
          <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">
            {books.length} Nodes Indexed
          </span>
        </div>

        {loading && books.length === 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="aspect-square rounded-[1.5rem] bg-gray-50 animate-pulse" />
            ))}
          </div>
        ) : books.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {books.map((book, index) => (
              <motion.div
                key={book.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link href={`/apps/${book.id}`}>
                  <div className="group bg-white border border-outline-variant/10 rounded-[2rem] p-4 hover:shadow-xl hover:border-indigo-500/20 transition-all flex gap-4 h-full relative overflow-hidden">
                    <div className={`w-16 h-24 rounded-lg ${COLORS[index % COLORS.length]} shadow-lg flex-shrink-0 relative overflow-hidden flex flex-col justify-end p-2 transform group-hover:rotate-2 group-hover:scale-105 transition-all duration-500`}>
                      <div className="absolute top-0 right-0 p-1 opacity-20">
                        <BookOpen size={16} />
                      </div>
                      <p className="text-[6px] font-black text-white uppercase tracking-widest opacity-50">NEXUS PUB</p>
                      {book.icon_url && <img src={book.icon_url} className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-40" />}
                    </div>
                    
                    <div className="flex flex-col justify-center flex-1 min-w-0">
                      <span className="text-[8px] font-black uppercase tracking-widest text-indigo-500 mb-1">v{book.version}</span>
                      <h3 className="text-sm font-black text-on-surface leading-tight mb-0.5 group-hover:text-indigo-600 transition-colors truncate">{book.name}</h3>
                      <p className="text-[10px] text-gray-400 font-bold truncate">by {book.developer}</p>
                      <div className="flex items-center gap-1.5 mt-2">
                        <Star size={8} className="text-yellow-500 fill-current" />
                        <span className="text-[8px] font-black uppercase tracking-widest text-indigo-500">
                          {book.price === 0 ? "Read Free" : `$${book.price}`}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="py-20 text-center bg-surface-low rounded-[2.5rem] border border-dashed border-outline-variant/20">
             <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Vault Sealed</p>
          </div>
        )}
      </section>
    </div>
  );
}
