"use client";
import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, User, Menu, X, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export const Navbar = () => {
    const { data: session } = useSession();
    const [searchOpen, setSearchOpen] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const router = useRouter();

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.push(`/categories?search=${encodeURIComponent(searchQuery.trim())}`);
            setSearchOpen(false);
            setSearchQuery(""); // Fixed build error here
        }
    };

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 flex justify-center p-4">
            <div className="glass w-full max-w-7xl rounded-pill flex items-center justify-between px-6 py-3 border border-outline-variant">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2">
                    <div className="relative w-10 h-10 overflow-hidden">
                        <Image
                            src="/panda-logo.png"
                            alt="Panda Store Logo"
                            fill
                            className="object-contain"
                            priority
                        />
                    </div>
                    <span className="font-inter font-bold text-xl tracking-tight text-on-surface">PandaStore</span>
                </Link>

                {/* Search Bar (expanded) */}
                {searchOpen ? (
                    <form onSubmit={handleSearch} className="flex-1 mx-6 flex items-center gap-2">
                        <input
                            autoFocus
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search apps, games, music..."
                            className="w-full bg-surface-low border border-outline-variant rounded-full px-5 py-2 text-sm text-on-surface outline-none focus:border-primary transition-colors"
                        />
                        <button type="submit" className="p-2 text-primary">
                            <Search size={20} />
                        </button>
                        <button type="button" onClick={() => setSearchOpen(false)} className="p-2 text-on-surface-variant">
                            <X size={20} />
                        </button>
                    </form>
                ) : (
                    <>
                        {/* Categories - Desktop */}
                        <div className="hidden md:flex items-center gap-8">
                            {["Discover", "Categories", "Music", "Books", "Community", "Support"].map((item) => (
                                <Link
                                    key={item}
                                    href={`/${item.toLowerCase()}`}
                                    className="text-sm font-bold text-on-surface-variant hover:text-primary transition-colors tracking-tight"
                                >
                                    {item}
                                </Link>
                            ))}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 sm:gap-4">
                            <button
                                onClick={() => setSearchOpen(true)}
                                className="p-2 text-on-surface-variant hover:text-primary transition-colors"
                            >
                                <Search size={20} />
                            </button>

                            <div className="hidden sm:flex items-center gap-2">
                                {/* Only show Admin button if logged in */}
                                {session && (
                                    <Link href="/admin">
                                        <Button variant="tertiary" size="sm" className="text-red-500 hover:text-red-400 hover:bg-red-500/10 border-red-500/20">
                                            <ShieldAlert size={18} className="mr-2" />
                                            Admin
                                        </Button>
                                    </Link>
                                )}

                                {/* Hide Sign In if user is already logged in */}
                                {!session && (
                                    <Link href="/login">
                                        <Button variant="tertiary" size="sm">
                                            <User size={18} className="mr-2" />
                                            Sign In
                                        </Button>
                                    </Link>
                                )}

                                <Link href="/publisher">
                                    <Button size="sm">Publisher Portal</Button>
                                </Link>
                            </div>

                            {/* Profile Logo */}
                            <Link href="/profile" className="ml-1 sm:ml-2 w-9 h-9 rounded-full overflow-hidden border border-outline-variant hover:border-primary transition-colors flex items-center justify-center bg-surface-low text-on-surface-variant group">
                                <User size={18} className="group-hover:text-primary transition-colors" />
                            </Link>

                            <button
                                className="md:hidden p-2 text-on-surface-variant"
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                aria-label="Toggle menu"
                            >
                                {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
                            </button>
                        </div>
                    </>
                )}
            </div>

            {/* Mobile Menu Dropdown */}
            {mobileMenuOpen && (
                <div className="absolute top-[calc(100%+0.5rem)] left-4 right-4 p-5 glass rounded-2xl border border-outline-variant flex flex-col gap-4 md:hidden shadow-xl animate-in fade-in slide-in-from-top-4 duration-200">
                    {["Discover", "Categories", "Music", "Books", "Community", "Support"].map((item) => (
                        <Link
                            key={item}
                            href={`/${item.toLowerCase()}`}
                            className="text-base font-bold text-on-surface border-b border-outline-variant/30 pb-3 hover:text-primary transition-colors tracking-tight"
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            {item}
                        </Link>
                    ))}
                    <div className="flex flex-col gap-3 mt-2 sm:hidden">
                        {session && (
                            <Link href="/admin" onClick={() => setMobileMenuOpen(false)} className="w-full">
                                <Button variant="tertiary" className="w-full justify-center py-5 text-red-500 hover:bg-red-500/10">
                                    <ShieldAlert size={18} className="mr-2" />
                                    Admin Panel
                                </Button>
                            </Link>
                        )}

                        {!session && (
                            <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="w-full">
                                <Button variant="tertiary" className="w-full justify-center py-5">
                                    <User size={18} className="mr-2" />
                                    Sign In
                                </Button>
                            </Link>
                        )}

                        <Link href="/publisher" onClick={() => setMobileMenuOpen(false)} className="w-full">
                            <Button className="w-full justify-center py-5">Publisher Portal</Button>
                        </Link>
                    </div>
                </div>
            )}
        </nav>
    );
};