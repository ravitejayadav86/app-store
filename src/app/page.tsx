"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, Bell, Grid, Book, User, Gamepad2, Play, Star, MoreVertical, Loader2 } from "lucide-react";
import api from "@/lib/api";

interface App {
  id: number;
  name: string;
  description: string;
  category: string;
  developer: string;
  price: number;
  version: string;
  is_approved: boolean;
}

export default function Home() {
  const [activeBottomNav, setActiveBottomNav] = useState("Apps");
  const [apps, setApps] = useState<App[]>([]);
  const [loading, setLoading] = useState(true);

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

  const featuredApp = apps.length > 0 ? apps[0] : null;
  const suggestedApps = apps.slice(1, 5);

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case "productivity": return "🚀";
      case "graphics": return "✨";
      case "development": return "💻";
      case "utilities": return "🛠️";
      case "games": return "🎮";
      default: return "📦";
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case "productivity": return "bg-[#255CFA]";
      case "graphics": return "bg-[#F36B2B]";
      case "development": return "bg-[#FFC400]";
      case "utilities": return "bg-[#202124]";
      default: return "bg-primary";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-surface text-on-surface">
        <Loader2 className="animate-spin text-primary mb-4" size={48} />
        <p className="text-xl font-medium animate-pulse">Loading PandaStore...</p>
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
                    <button className="bg-[#8AB4F8] hover:bg-[#aecbfa] text-[#131314] md:px-10 px-6 py-2 md:py-2.5 rounded-full font-bold text-sm md:text-base transition-all active:scale-95 shadow-lg shadow-[#8AB4F8]/20">
                      {featuredApp.price === 0 ? "Install" : `$${featuredApp.price}`}
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

        {/* Suggested List */}
        <section className="space-y-6 max-w-4xl">
           <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg md:text-xl font-medium flex items-center gap-3 text-on-surface">
                 <span className="text-[11px] md:text-xs font-bold text-on-surface-variant border border-outline-variant px-1.5 py-0.5 rounded-sm uppercase tracking-wider text-primary">Live Store</span>
                 Suggested for You
              </h3>
           </div>
           
           {suggestedApps.length > 0 ? (
             <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                {suggestedApps.map((app, i) => (
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
                   </Link>
                ))}
             </div>
           ) : (
             <div className="py-10 text-center bg-surface-low rounded-2xl border border-outline-variant/50">
                <p className="text-on-surface-variant">Check back later for curated suggestions.</p>
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
              { name: "Search", icon: <Search size={24} />, href: "/discover" },
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