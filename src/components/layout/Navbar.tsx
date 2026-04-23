"use client";
import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, User, Menu, X, ShieldAlert, Settings, MessageCircle, Zap, Boxes } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { NotificationBell } from "@/components/ui/NotificationBell";
import { useRouter, usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";

export const Navbar = ({ isHidden = false }: { isHidden?: boolean }) => {
    const { data: session } = useSession();
    const pathname = usePathname();
    const [searchOpen, setSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const router = useRouter();

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.push(`/categories?search=${encodeURIComponent(searchQuery.trim())}`);
            setSearchOpen(false);
            setSearchQuery("");
        }
    };

    return (
        <AnimatePresence>
            {!isHidden && (
                <motion.nav 
                    initial={{ y: -100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -100, opacity: 0 }}
                    transition={{ type: "spring", damping: 30, stiffness: 300 }}
                    className="fixed top-0 left-0 right-0 z-50 flex justify-center p-2 md:p-4"
                >
            <div className="liquid-glass w-full max-w-7xl flex items-center justify-between px-4 md:px-6 py-2 md:py-3 border border-white/10 rounded-full shadow-2xl shadow-black/5">
                {/* Logo - Compressed for Mobile */}
                <Link href="/" className="flex items-center gap-2 group">
                    <div className="relative w-8 h-8 md:w-10 md:h-10 bg-black rounded-xl flex items-center justify-center text-white shadow-xl group-hover:scale-110 transition-transform duration-500">
                        <Zap size={18} className="md:size-24" fill="currentColor" />
                    </div>
                    <span className="font-black text-base md:text-xl tracking-tighter text-on-surface hidden xs:block">NEXUS</span>
                </Link>

                {/* Search Bar (expanded) */}
                {searchOpen ? (
                    <form onSubmit={handleSearch} className="flex-1 mx-4 flex items-center gap-2" role="search">
                        <input
                            autoFocus
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Scan registry..."
                            className="w-full bg-surface-low border border-outline-variant/10 rounded-full px-5 py-2 text-xs font-bold text-on-surface outline-none focus:border-primary transition-all shadow-inner"
                        />
                        <button type="button" onClick={() => setSearchOpen(false)} className="p-2 text-on-surface-variant hover:text-rose-500 transition-colors">
                            <X size={18} strokeWidth={3} />
                        </button>
                    </form>
                ) : (
                    <>
                        {/* Categories - Desktop Only */}
                        <div className="hidden lg:flex items-center gap-1">
                            {["Discover", "Music", "Books", "Nexus"].map((item) => {
                                const href = `/${item.toLowerCase() === 'discover' ? '' : item.toLowerCase()}`;
                                const isActive = pathname === href || (href !== "/" && pathname?.startsWith(href));
                                return (
                                    <Link
                                        key={item}
                                        href={href}
                                        className={`relative text-[10px] font-black uppercase tracking-widest transition-all px-4 py-2 rounded-full ${
                                            isActive ? "text-primary" : "text-on-surface-variant hover:text-primary hover:bg-primary/5"
                                        }`}
                                    >
                                        <span className="relative z-10">{item}</span>
                                        {isActive && (
                                            <motion.div
                                                layoutId="desktop-nav-active"
                                                className="absolute inset-0 bg-primary/5 rounded-full border border-primary/10"
                                            />
                                        )}
                                    </Link>
                                );
                            })}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1 md:gap-2">
                            <button
                                onClick={() => setSearchOpen(true)}
                                className="p-2 text-on-surface-variant hover:text-primary transition-all active:scale-90"
                                aria-label="Open search"
                            >
                                <Search size={18} strokeWidth={3} />
                            </button>

                            {session && (
                                <Link href="/messages" className="p-2 text-on-surface-variant hover:text-primary transition-all active:scale-90 relative" aria-label="Messages">
                                    <MessageCircle size={18} strokeWidth={3} />
                                </Link>
                            )}

                            {/* Notifications */}
                            {session && <NotificationBell />}

                            {/* Profile / Account */}
                            <Link 
                                href="/profile" 
                                className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-surface-low border border-outline-variant/10 flex items-center justify-center text-on-surface-variant hover:border-primary/30 hover:text-primary transition-all shadow-sm active:scale-90 ml-1"
                            >
                                <User size={18} strokeWidth={3} />
                            </Link>
                        </div>
                    </>
                )}
            </div>
                </motion.nav>
            )}
        </AnimatePresence>
    );
};
