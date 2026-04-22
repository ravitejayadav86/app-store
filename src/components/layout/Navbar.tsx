"use client";
import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, User, Menu, X, ShieldAlert, Settings, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { NotificationBell } from "@/components/ui/NotificationBell";
import { useRouter, usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";

export const Navbar = ({ isHidden = false }: { isHidden?: boolean }) => {
    const { data: session } = useSession();
    const pathname = usePathname();
    const [searchOpen, setSearchOpen] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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
                    className="fixed top-0 left-0 right-0 z-50 flex justify-center p-4"
                >
            <div className="liquid-glass w-full max-w-7xl flex items-center justify-between px-6 py-2.5 border border-white/20">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2">
                    <div className="relative w-10 h-10 overflow-hidden">
                        <Image
                            src="/panda-logo.png"
                            alt="Panda Store Logo"
                            fill
                            className="object-contain"
                            priority
                            sizes="40px"
                        />
                    </div>
                    <span className="font-inter font-bold text-xl tracking-tight text-on-surface">PandaStore</span>
                </Link>

                {/* Search Bar (expanded) */}
                {searchOpen ? (
                    <form onSubmit={handleSearch} className="flex-1 mx-6 flex items-center gap-2" role="search">
                        <label htmlFor="nav-search-input" className="sr-only">Search PandaStore</label>
                        <input
                            autoFocus
                            id="nav-search-input"
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search apps, games, music..."
                            className="w-full bg-surface-low border border-outline-variant rounded-full px-5 py-2 text-sm text-on-surface outline-none focus:border-primary transition-colors"
                        />
                        <button type="submit" className="p-2 text-primary" aria-label="Submit search">
                            <Search size={20} />
                        </button>
                        <button type="button" onClick={() => setSearchOpen(false)} className="p-2 text-on-surface-variant" aria-label="Close search">
                            <X size={20} />
                        </button>
                    </form>
                ) : (
                    <>
                        {/* Categories - Desktop */}
                        <div className="hidden md:flex items-center gap-6">
                            {["Discover", "Categories", "Music", "Books", "Community", "Support"].map((item) => {
                                const href = `/${item.toLowerCase()}`;
                                const isActive = pathname === href;
                                return (
                                    <Link
                                        key={item}
                                        href={href}
                                        className={`relative text-sm font-bold transition-all px-2 py-1 ${
                                            isActive ? "text-primary" : "text-on-surface-variant hover:text-primary"
                                        } tracking-tight`}
                                    >
                                        {item}
                                        {isActive && (
                                            <motion.div
                                                layoutId="nav-active"
                                                className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary rounded-full"
                                                transition={{ type: "spring", stiffness: 380, damping: 30 }}
                                            />
                                        )}
                                    </Link>
                                );
                            })}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 sm:gap-3">
                            <button
                                onClick={() => setSearchOpen(true)}
                                className="p-2 text-on-surface-variant hover:text-primary transition-colors"
                                aria-label="Open search"
                            >
                                <Search size={20} />
                            </button>

                            {/* Messages icon - logged in only */}
                            {session && (
                                <Link href="/messages" className="p-2 text-on-surface-variant hover:text-primary transition-colors relative" aria-label="Messages">
                                    <MessageCircle size={20} />
                                </Link>
                            )}

                            <div className="hidden sm:flex items-center gap-2">
                                {/* Admin button */}
                                {session && (
                                    <Link href="/admin">
                                        <Button variant="tertiary" size="sm" className="text-red-500 hover:text-red-400 hover:bg-red-500/10 border-red-500/20">
                                            <ShieldAlert size={18} className="mr-2" />
                                            Admin
                                        </Button>
                                    </Link>
                                )}

                                {/* Sign In if not logged in */}
                                {!session && (
                                    <Link href="/login">
                                        <Button variant="tertiary" size="sm">
                                            <User size={18} className="mr-2" />
                                            Sign In
                                        </Button>
                                    </Link>
                                )}

                                <Link href="/publisher">
                                    <Button size="sm">Publisher</Button>
                                </Link>
                            </div>

                            {/* Notification Bell */}
                            {session && <NotificationBell />}

                            {/* Settings icon - hidden on mobile */}
                            <Link href="/settings" className="hidden md:flex p-2 text-on-surface-variant hover:text-primary transition-colors" aria-label="Settings">
                                <Settings size={18} />
                            </Link>

                            {/* Profile */}
                            <Link href="/profile" className="hidden md:flex w-9 h-9 rounded-full overflow-hidden border border-outline-variant hover:border-primary transition-colors items-center justify-center bg-surface-low text-on-surface-variant group" aria-label="View profile">
                                <User size={18} className="group-hover:text-primary transition-colors" />
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
