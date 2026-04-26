"use client";
import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, User, Menu, X, ShieldAlert, Settings, MessageCircle, LogOut } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { NotificationBell } from "@/components/ui/NotificationBell";
import { useRouter, usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";

// Spring presets tuned for 120 Hz — settle in < 250 ms, no bounce
const SPRING_NAV    = { type: "spring", stiffness: 500, damping: 36, mass: 0.6 } as const;
const SPRING_PILL   = { type: "spring", stiffness: 700, damping: 40, mass: 0.4 } as const;
const SPRING_DRAWER = { type: "spring", stiffness: 420, damping: 34, mass: 0.7 } as const;
const FADE_FAST     = { duration: 0.12, ease: [0.16, 1, 0.3, 1] as const };

export const Navbar = ({ isHidden = false }: { isHidden?: boolean }) => {
    const { data: session } = useSession();
    const pathname = usePathname();
    const [searchOpen, setSearchOpen] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [mounted, setMounted] = React.useState(false);
    const router = useRouter();

    React.useEffect(() => { setMounted(true); }, []);

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
                    initial={{ y: -72, opacity: 0 }}
                    animate={{ y: 0,   opacity: 1 }}
                    exit={{   y: -72,  opacity: 0 }}
                    transition={SPRING_NAV}
                    style={{ willChange: "transform, opacity" }}
                    className="fixed top-0 left-0 right-0 z-50 flex justify-center p-4 transform-gpu"
                >
                <div className="liquid-glass w-full max-w-7xl flex items-center justify-between px-3 md:px-6 py-1.5 md:py-2.5 border border-white/20 rounded-full md:rounded-[2rem]" style={{ isolation: "isolate" }}>
                    <Link href="/" className="flex items-center gap-1.5 md:gap-2">
                        <div className="relative w-8 h-8 md:w-10 md:h-10 overflow-hidden">
                            <Image src="/paw-logo.png" alt="Panda Store Logo" fill className="object-contain" priority sizes="(max-width: 768px) 32px, 40px" />
                        </div>
                        <span className="font-inter font-bold text-lg md:text-xl tracking-tight text-on-surface">PandaStore</span>
                    </Link>

                    {searchOpen ? (
                        <motion.form
                            initial={{ opacity: 0, scaleX: 0.9 }}
                            animate={{ opacity: 1, scaleX: 1 }}
                            exit={{   opacity: 0, scaleX: 0.9 }}
                            transition={FADE_FAST}
                            onSubmit={handleSearch}
                            className="flex-1 mx-6 flex items-center gap-2 origin-left"
                            role="search"
                            style={{ willChange: "transform, opacity" }}
                        >
                            <label htmlFor="nav-search-input" className="sr-only">Search PandaStore</label>
                            <input autoFocus id="nav-search-input" type="text" value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search apps, games, music..."
                                className="w-full bg-surface-low border border-outline-variant rounded-full px-5 py-2 text-sm text-on-surface outline-none focus:border-primary transition-colors" />
                            <button type="submit" className="p-2 text-primary" aria-label="Submit search"><Search size={20} /></button>
                            <button type="button" onClick={() => setSearchOpen(false)} className="p-2 text-on-surface-variant" aria-label="Close search"><X size={20} /></button>
                        </motion.form>
                    ) : (
                        <>
                            <div className="hidden lg:flex items-center gap-1.5">
                                {["Discover", "Categories", "Music", "Books", "Community", "Support"].map((item) => {
                                    const href = `/${item.toLowerCase() === "discover" ? "" : item.toLowerCase()}`;
                                    const isActive = pathname === href || (href !== "/" && pathname?.startsWith(href));
                                    return (
                                        <Link key={item} href={href}
                                            className={`relative text-sm font-bold px-4 py-2 rounded-full tracking-tight whitespace-nowrap transition-colors ${isActive ? "text-primary" : "text-on-surface-variant hover:text-primary hover:bg-primary/5"}`}>
                                            <span className="relative z-10">{item}</span>
                                            {isActive && (
                                                <motion.div layoutId="desktop-nav-active"
                                                    className="absolute inset-0 bg-primary/10 rounded-full border border-primary/20 shadow-sm"
                                                    transition={SPRING_PILL} />
                                            )}
                                        </Link>
                                    );
                                })}
                            </div>

                            <div className="flex items-center gap-0 sm:gap-2">
                                <button onClick={() => setSearchOpen(true)}
                                    className="p-2.5 rounded-xl text-on-surface-variant hover:text-primary hover:bg-primary/8 active:scale-90 transition-colors touch-manipulation"
                                    aria-label="Open search"
                                    style={{ touchAction: "manipulation" }}>
                                    <Search size={20} className="w-5 h-5 md:w-[18px] md:h-[18px]" />
                                </button>
                                {mounted && session && (
                                    <Link href="/messages"
                                        className="p-2.5 rounded-xl text-on-surface-variant hover:text-primary hover:bg-primary/8 active:scale-90 transition-colors"
                                        aria-label="Messages"
                                        style={{ touchAction: "manipulation" }}>
                                        <MessageCircle size={20} className="w-5 h-5 md:w-[18px] md:h-[18px]" />
                                    </Link>
                                )}
                                <div className="hidden xl:flex items-center gap-1.5">
                                    {mounted && session && (
                                        <Link href="/admin">
                                            <Button variant="tertiary" size="sm" className="h-9 text-red-500 hover:text-red-400 hover:bg-red-500/10 border-red-500/20 px-3">
                                                <ShieldAlert size={16} className="mr-1.5" />Admin
                                            </Button>
                                        </Link>
                                    )}
                                    {mounted && !session && (
                                        <Link href="/login">
                                            <Button variant="tertiary" size="sm" className="h-9 px-4"><User size={16} className="mr-1.5" />Sign In</Button>
                                        </Link>
                                    )}
                                    <Link href="/publisher"><Button size="sm" className="h-9 px-4">Publisher</Button></Link>
                                </div>
                                {mounted && session && <NotificationBell />}
                                <Link href="/settings" className="hidden sm:flex p-2 text-on-surface-variant hover:text-primary transition-colors" aria-label="Settings">
                                    <Settings size={18} />
                                </Link>
                                <Link href="/profile" className="flex w-8 h-8 md:w-9 md:h-9 rounded-full overflow-hidden border border-outline-variant hover:border-primary transition-colors items-center justify-center bg-surface-low text-on-surface-variant group ml-1" aria-label="View profile">
                                    <User size={16} className="md:size-[18px] group-hover:text-primary transition-colors" />
                                </Link>
                                <button
                                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                    className="lg:hidden p-2.5 ml-1 rounded-xl text-on-surface-variant hover:text-primary hover:bg-primary/8 active:scale-90 transition-colors"
                                    aria-label="Toggle menu"
                                    style={{ touchAction: "manipulation" }}>
                                    <AnimatePresence mode="wait" initial={false}>
                                        <motion.span key={mobileMenuOpen ? "x" : "m"}
                                            initial={{ opacity: 0, rotate: -45, scale: 0.6 }}
                                            animate={{ opacity: 1, rotate: 0,   scale: 1   }}
                                            exit={{   opacity: 0, rotate:  45,  scale: 0.6 }}
                                            transition={{ duration: 0.13, ease: [0.16, 1, 0.3, 1] }}
                                            className="block" style={{ willChange: "transform, opacity" }}>
                                            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                                        </motion.span>
                                    </AnimatePresence>
                                </button>
                            </div>
                        </>
                    )}
                </div>

                <AnimatePresence>
                    {mobileMenuOpen && (
                        <>
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                transition={{ duration: 0.15, ease: "linear" }}
                                onClick={() => setMobileMenuOpen(false)}
                                className="fixed inset-0 bg-black/40 backdrop-blur-md z-[55] lg:hidden"
                                style={{ willChange: "opacity" }} />
                            <motion.div
                                initial={{ opacity: 0, y: -12, scale: 0.97 }}
                                animate={{ opacity: 1, y: 0,   scale: 1    }}
                                exit={{   opacity: 0, y: -12,  scale: 0.97 }}
                                transition={SPRING_DRAWER}
                                style={{ willChange: "transform, opacity" }}
                                className="fixed top-24 left-4 right-4 liquid-glass p-8 lg:hidden flex flex-col gap-4 shadow-[0_30px_90px_rgba(0,0,0,0.3)] border border-white/40 z-[60] rounded-[2.5rem] transform-gpu"
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-xl font-black tracking-tight">Main Menu</h3>
                                    <button onClick={() => setMobileMenuOpen(false)} aria-label="Close menu"><X size={20} className="opacity-40" /></button>
                                </div>
                                <div className="grid grid-cols-2 gap-3 mb-6">
                                    {[
                                        { label: "Discover",  icon: <Search size={16} />,       href: "/" },
                                        { label: "Apps",      icon: <Settings size={16} />,      href: "/discover" },
                                        { label: "Music",     icon: <MessageCircle size={16} />, href: "/music" },
                                        { label: "Books",     icon: <User size={16} />,          href: "/books" },
                                        { label: "Community", icon: <MessageCircle size={16} />, href: "/community" },
                                        { label: "Support",   icon: <ShieldAlert size={16} />,   href: "/support" },
                                    ].map((item) => (
                                        <Link key={item.label} href={item.href} onClick={() => setMobileMenuOpen(false)}
                                            className="flex flex-col items-center justify-center p-5 rounded-[2rem] bg-surface-low border border-outline-variant/10 text-xs font-black text-on-surface hover:bg-primary/5 hover:text-primary transition-colors gap-2 active:scale-95">
                                            <div className="p-2.5 rounded-xl bg-white/5 shadow-sm text-primary">{item.icon}</div>
                                            {item.label}
                                        </Link>
                                    ))}
                                </div>
                                <div className="flex flex-col gap-3">
                                    <Link href="/publisher" onClick={() => setMobileMenuOpen(false)}>
                                        <Button className="w-full justify-center py-6 text-sm font-black uppercase tracking-widest rounded-3xl">Publisher Hub</Button>
                                    </Link>
                                    {mounted && (session ? (
                                        <button onClick={() => { localStorage.removeItem("token"); signOut({ callbackUrl: "/" }); setMobileMenuOpen(false); }}
                                            className="w-full py-5 text-red-500 font-black text-xs uppercase tracking-widest border border-red-200 rounded-3xl hover:bg-red-50 transition-colors flex items-center justify-center gap-2 active:scale-95">
                                            <LogOut size={16} /> Sign Out
                                        </button>
                                    ) : (
                                        <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                                            <Button variant="tertiary" className="w-full justify-center py-6 text-sm font-black uppercase tracking-widest rounded-3xl">Sign In</Button>
                                        </Link>
                                    ))}
                                </div>
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>
                </motion.nav>
            )}
        </AnimatePresence>
    );
};
