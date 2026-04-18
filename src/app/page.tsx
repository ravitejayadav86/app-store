"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, Grid, Book, User, Gamepad2, Star, Loader2, Music, Download } from "lucide-react";
import api from "@/lib/api";
import { toast } from "sonner";

interface App {
  id: number;
  name: string;
  description: string;
  category: string;
  developer: string;
  price: number;
  version: string;
  is_approved: boolean;
  file_path: string | null;
}

const CATEGORY_TABS = ["All", "Apps", "Games", "Music", "Books"];

export default function Home() {
  const [activeBottomNav, setActiveBottomNav] = useState("Apps");
  const [apps, setApps] = useState<App[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [downloadingId, setDownloadingId] = useState<number | null>(null);

  useEffect(() => {
    const fetchApps = async () => {
      try {
        const res = await api.get("/apps/");
        setApps(res.data);
      } catch (error) {
        console.error("Failed to fetch apps:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchApps();
  }, []);

  const handleDownload = async (e: React.MouseEvent, app: App) => {
    e.preventDefault();
    e.stopPropagation();
    if (downloadingId === app.id) return;

    // Check if a file has actually been uploaded by the publisher
    if (!app.file_path) {
      toast.info(`"${app.name}" has no file uploaded by the publisher yet.`);
      return;
    }

    setDownloadingId(app.id);
    try {
      const res = await api.get(`/apps/${app.id}/download`, { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", app.name);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success(`"${app.name}" downloaded to your files!`);
    } catch {
      toast.error("Download failed. Please try again.");
    } finally {
      setDownloadingId(null);
    }
  };

  const featuredApp = apps.length > 0 ? apps[0] : null;
  const allOtherApps = apps.slice(1);

  const filteredApps = allOtherApps.filter((app) => {
    const matchesSearch =
      !search ||
      app.name.toLowerCase().includes(search.toLowerCase()) ||
      app.developer.toLowerCase().includes(search.toLowerCase());
    const matchesCategory =
      activeCategory === "All" ||
      activeCategory === "Apps" ||
      app.category.toLowerCase() === activeCategory.toLowerCase();
    return matchesSearch && matchesCategory;
  }).slice(0, 6);

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case "productivity": return "🚀";
      case "graphics": return "✨";
      case "development": return "💻";
      case "utilities": return "🛠️";
      case "games": return "🎮";
      case "music": return "🎵";
      case "books": return "📚";
      default: return "📦";
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case "productivity": return "bg-[#255CFA]";
      case "graphics": return "bg-[#F36B2B]";
      case "development": return "bg-[#FFC400]";
      case "utilities": return "bg-[#202124]";
      case "music": return "bg-[#E91E63]";
      case "books": return "bg-[#673AB7]";
      default: return "bg-primary";
    }
  };

  if (loading) {
    return (
      <div className="bg-surface text-on-surface min-h-screen -mt-24 pt-[88px] px-5 py-6 pb-32 max-w-7xl mx-auto space-y-12 animate-pulse">
        {/* Featured skeleton */}
        <div className="w-full aspect-[4/3] md:aspect-[21/9] max-h-[500px] rounded-[1.5rem] md:rounded-[3rem] bg-surface-low" />
        {/* Search skeleton */}
        <div className="h-12 rounded-2xl bg-surface-low w-full" />
        {/* Category tabs skeleton */}
        <div className="flex gap-2">
          {[1,2,3,4,5].map(i => <div key={i} className="h-8 w-20 rounded-full bg-surface-low" />)}
        </div>
        {/* App list skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
          {[1,2,3,4].map(i => (
            <div key={i} className="flex items-center gap-5">
              <div className="w-[84px] h-[84px] rounded-[22px] bg-surface-low flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-5 bg-surface-low rounded w-3/4" />
                <div className="h-4 bg-surface-low rounded w-1/2" />
                <div className="h-3 bg-surface-low rounded w-1/4" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface text-on-surface min-h-screen font-sans -mt-24 pt-[88px] md:pt-[100px] pb-safe overflow-x-hidden relative z-10 w-full feel-play-store">
      {/* Main Content */}
      <main className="px-5 py-6 pb-32 max-w-7xl mx-auto space-y-12">
        
        {/* Featured App Card */}
        {featuredApp ? (
          <Link href={`/apps/${featuredApp.id}`} className="block mb-4 outline-none rounded-[1.5rem] md:rounded-[3rem]">
            <section className="relative rounded-[1.5rem] md:rounded-[3rem] overflow-hidden w-full aspect-[4/3] md:aspect-[21/9] max-h-[500px] bg-gradient-to-r from-[#203060] to-[#101830] group cursor-pointer shadow-2xl transition-all hover:shadow-3xl">
              <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/20 rounded-full blur-[100px] mix-blend-screen pointer-events-none"></div>
              
              <div className="absolute inset-x-0 top-0 p-6 md:p-10 z-10 flex flex-col items-start gap-4">
                 <span className="bg-[#FAD2E1] text-[#711A46] text-xs md:text-sm font-bold px-3 md:px-4 py-1.5 rounded-full shadow-sm">Featured App</span>
                 <h2 className="text-3xl md:text-5xl font-medium leading-[1.1] text-white max-w-[90%] md:max-w-[50%] mt-2 drop-shadow-md">
                   {featuredApp.name}: {featuredApp.description?.substring(0, 60)}...
                 </h2>
              </div>
              
              <div className="absolute bottom-0 inset-x-0 p-6 md:p-10 bg-gradient-to-t from-[#0b1224] via-[#0b1224]/80 to-transparent pt-32 flex justify-between items-end">
                 <div className="flex items-center gap-4 md:gap-5">
                    <div className="w-14 h-14 md:w-20 md:h-20 rounded-2xl bg-white flex items-center justify-center overflow-hidden shadow-xl border border-white/10 flex-shrink-0">
                       <div className="w-full h-full bg-[#E8F0FE] flex items-center justify-center">
                          <Image src="/panda-logo.png" width={48} height={48} alt="Panda Logo" className="object-cover" />
                       </div>
                    </div>
                    <div>
                       <h3 className="font-semibold text-lg md:text-2xl text-white tracking-wide group-hover:text-blue-100 transition-colors uppercase">{featuredApp.name}</h3>
                       <p className="text-sm md:text-md text-[#9AA0A6] mt-0.5">{featuredApp.developer}</p>
                       <div className="flex items-center gap-2 mt-1 text-xs md:text-sm text-[#9AA0A6]">
                          <span className="flex items-center">4.9 <Star size={12} className="ml-1 md:ml-1.5 fill-[#9AA0A6]" /></span>
                          <span className="border border-[#3C4043] px-1 md:px-1.5 rounded-[4px] text-[10px] md:text-xs">v{featuredApp.version}</span>
                       </div>
                    </div>
                 </div>
                 <div className="flex flex-col items-end gap-1.5">
                     <button
                       onClick={(e) => handleDownload(e, featuredApp)}
                       disabled={downloadingId === featuredApp.id || !featuredApp.file_path}
                       className={`flex items-center gap-2 md:px-10 px-6 py-2 md:py-2.5 rounded-full font-bold text-sm md:text-base transition-all active:scale-95 shadow-lg ${
                         !featuredApp.file_path 
                           ? "bg-gray-500/50 text-white/50 cursor-not-allowed shadow-none" 
                           : "bg-[#8AB4F8] hover:bg-[#aecbfa] text-[#131314] shadow-[#8AB4F8]/20"
                       }`}
                     >
                       {downloadingId === featuredApp.id ? (
                         <><Loader2 size={14} className="animate-spin" /> Downloading...</>
                       ) : !featuredApp.file_path ? (
                         "Not Available"
                       ) : (
                         <><Download size={14} /> {featuredApp.price === 0 ? "Install" : `$${featuredApp.price}`}</>
                       )}
                     </button>
                  </div>
              </div>
            </section>
          </Link>
        ) : (
          <section className="h-64 flex items-center justify-center bg-surface-low rounded-3xl border border-dashed border-outline-variant">
             <p className="text-on-surface-variant font-medium">No featured apps currently available.</p>
          </section>
        )}

        {/* Search & Category Filter */}
        <section className="space-y-4">
          <div className="relative">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search apps, games, music..."
              className="w-full pl-11 pr-4 py-3 rounded-2xl bg-surface-low border border-outline-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm font-medium"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            {CATEGORY_TABS.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                  activeCategory === cat
                    ? "bg-primary text-on-primary"
                    : "bg-surface-low text-on-surface-variant hover:text-on-surface border border-outline-variant/50"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </section>

        {/* Suggested List */}
        <section className="space-y-6 max-w-4xl">
           <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg md:text-xl font-medium flex items-center gap-3 text-on-surface">
                 <span className="text-[11px] md:text-xs font-bold text-on-surface-variant border border-outline-variant px-1.5 py-0.5 rounded-sm uppercase tracking-wider text-primary">Live Store</span>
                 {search ? `Results for "${search}"` : activeCategory === "All" ? "Suggested for You" : activeCategory}
              </h3>
           </div>
           
           {filteredApps.length > 0 ? (
             <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                {filteredApps.map((app, i) => (
                   <Link key={app.id} href={`/apps/${app.id}`} className="flex items-center gap-5 cursor-pointer hover:bg-surface-low p-3 -mx-3 rounded-2xl transition-colors group">
                      <div className={`w-[84px] h-[84px] rounded-[22px] ${getCategoryColor(app.category)} flex items-center justify-center shadow-sm border border-outline-variant/30 flex-shrink-0 text-3xl group-hover:scale-105 transition-transform font-bold text-white`}>
                         {getCategoryIcon(app.category)}
                      </div>
                      <div className="flex-1 min-w-0">
                         <h4 className="font-medium text-[17px] md:text-lg truncate text-on-surface group-hover:text-primary transition-colors">{app.name}</h4>
                         <p className="text-sm md:text-[15px] text-on-surface-variant truncate mt-0.5">{app.category} • {app.developer}</p>
                         <div className="flex items-center gap-3 mt-1.5 text-xs md:text-[13px] text-on-surface-variant">
                            <span className="flex items-center">4.8 <Star size={12} className="ml-1 fill-on-surface-variant text-on-surface-variant" /></span>
                            <span className="bg-surface-lowest px-2 py-0.5 rounded text-[10px] font-bold uppercase">{app.price === 0 ? "Free" : `$${app.price}`}</span>
                         </div>
                      </div>
                      <button
                        onClick={(e) => handleDownload(e, app)}
                        disabled={downloadingId === app.id || !app.file_path}
                        title={!app.file_path ? "No file uploaded by publisher" : `Download ${app.name}`}
                        className={`ml-2 flex-shrink-0 flex items-center justify-center w-9 h-9 rounded-full transition-all active:scale-90 ${
                          !app.file_path
                            ? "bg-surface-low text-on-surface-variant/30 cursor-not-allowed"
                            : "bg-primary/10 hover:bg-primary/20 text-primary"
                        }`}
                      >
                        {downloadingId === app.id ? (
                          <Loader2 size={16} className="animate-spin" />
                        ) : (
                          <Download size={16} className={!app.file_path ? "opacity-30" : ""} />
                        )}
                      </button>
                   </Link>
                ))}
             </div>
           ) : (
             <div className="py-10 text-center bg-surface-low rounded-2xl border border-outline-variant/50">
                <p className="text-on-surface-variant">{search ? `No results for "${search}"` : "Check back later for curated suggestions."}</p>
             </div>
           )}
        </section>

      </main>

      {/* Bottom Navigation (Mobile Only) */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 bg-surface/95 backdrop-blur-xl border-t border-outline-variant z-50">
         <div className="flex justify-around items-center pt-2 pb-5">
            {[
              { name: "Games", icon: <Gamepad2 size={24} />, href: "/games" },
              { name: "Apps", icon: <Grid size={24} />, href: "/apps" },
              { name: "Music", icon: <Music size={24} />, href: "/music" },
              { name: "Books", icon: <Book size={24} />, href: "/books" },
              { name: "You", icon: <User size={24} />, href: "/profile" },
            ].map(item => (
               <Link 
                  key={item.name}
                  href={item.href}
                  onClick={() => setActiveBottomNav(item.name)}
                  className={`flex flex-col items-center gap-1 w-16 transition-colors ${activeBottomNav === item.name ? 'text-primary' : 'text-on-surface-variant hover:text-on-surface'}`}
               >
                  <div className={`px-4 py-1 rounded-full transition-all ${activeBottomNav === item.name ? 'bg-primary/10' : 'bg-transparent'}`}>
                     {item.icon}
                  </div>
                  <span className="text-[11px] font-medium mt-0.5">{item.name}</span>
               </Link>
            ))}
         </div>
      </nav>

      <style dangerouslySetInnerHTML={{__html: `
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .pb-safe {
          padding-bottom: env(safe-area-inset-bottom, 24px);
        }
      `}} />
    </div>
  );
}