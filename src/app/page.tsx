"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, Bell, Grid, Book, User, Gamepad2, Play, Star, MoreVertical } from "lucide-react";

const categoryData = [
  { name: "Productivity", icon: "🚀", title: "Horizon Docs", tag: "Documents", size: "12 MB", rating: "4.8", iconBg: "bg-[#255CFA]" },
  { name: "Graphics", icon: "✨", title: "Lumina Edit", tag: "Photo Editor", size: "45 MB", rating: "4.9", iconBg: "bg-[#F36B2B]" },
  { name: "Development", icon: "💻", title: "Quantum Code", tag: "IDE", size: "120 MB", rating: "4.7", iconBg: "bg-[#FFC400]" },
  { name: "Utilities", icon: "🛠️", title: "Nebula Sync", tag: "Cloud Sync", size: "22 MB", rating: "4.5", iconBg: "bg-[#202124]" },
];

const topTabs = ["For you", "Top charts", "PC", "Children", "Premium"];
const bottomNavInfo = [
  { name: "Games", icon: <Gamepad2 size={24} /> },
  { name: "Apps", icon: <Grid size={24} /> },
  { name: "Search", icon: <Search size={24} /> },
  { name: "Books", icon: <Book size={24} /> },
  { name: "You", icon: <User size={24} /> },
];

export default function Home() {
  const [activeTab, setActiveTab] = useState("For you");
  const [activeBottomNav, setActiveBottomNav] = useState("Apps");

  return (
    <div className="bg-[#131314] text-white min-h-screen font-sans -mt-24 pt-[80px] md:pt-28 pb-safe overflow-x-hidden relative z-10 w-full feel-play-store">
      {/* Header section reflecting the top tabs from the screenshot */}
      <header className="px-4 sticky top-[72px] md:top-[84px] bg-[#131314]/95 backdrop-blur-md z-40">
        {/* Top Tabs */}
        <div className="flex overflow-x-auto no-scrollbar gap-6 items-center pt-2 max-w-7xl mx-auto">
          {topTabs.map(tab => (
            <button 
              key={tab} 
              onClick={() => setActiveTab(tab)}
              className={`whitespace-nowrap pb-3 border-b-2 text-[15px] transition-colors ${activeTab === tab ? 'border-[#8AB4F8] text-[#8AB4F8] font-medium' : 'border-transparent text-[#9AA0A6] font-normal hover:text-[#E8EAED]'}`}
            >
              {tab}
            </button>
          ))}
        </div>
      </header>

      {/* Main Content */}
      <main className="px-5 py-6 pb-32 max-w-7xl mx-auto space-y-12">
        
        {/* Featured App Card */}
        <Link href="/game/mongil-star-dive" className="block mb-4 outline-none rounded-[1.5rem] md:rounded-[3rem]">
          <section className="relative rounded-[1.5rem] md:rounded-[3rem] overflow-hidden w-full aspect-[4/3] md:aspect-[21/9] max-h-[500px] bg-gradient-to-r from-[#203060] to-[#101830] group cursor-pointer shadow-2xl transition-all hover:shadow-3xl">
            {/* Background visuals */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/20 rounded-full blur-[100px] mix-blend-screen pointer-events-none"></div>
            
            {/* Banner content mock */}
            <div className="absolute inset-x-0 top-0 p-6 md:p-10 z-10 flex flex-col items-start gap-4">
               <span className="bg-[#FAD2E1] text-[#711A46] text-xs md:text-sm font-bold px-3 md:px-4 py-1.5 rounded-full shadow-sm">Now available</span>
               <h2 className="text-3xl md:text-5xl font-medium leading-[1.1] text-white max-w-[90%] md:max-w-[50%] mt-2 drop-shadow-md">
                 Catch monsters and dive into a world of wonder
               </h2>
            </div>
            
            {/* Bottom Card for Hero */}
            <div className="absolute bottom-0 inset-x-0 p-6 md:p-10 bg-gradient-to-t from-[#131314] via-[#131314]/80 to-transparent pt-32 flex justify-between items-end">
               <div className="flex items-center gap-4 md:gap-5">
                  <div className="w-14 h-14 md:w-20 md:h-20 rounded-2xl bg-white flex items-center justify-center overflow-hidden shadow-xl border border-white/10 flex-shrink-0">
                     <div className="w-full h-full bg-[#E8F0FE] flex items-center justify-center">
                        <Image src="/panda-logo.png" width={48} height={48} alt="Panda Logo" className="object-cover" />
                     </div>
                  </div>
                  <div>
                     <h3 className="font-semibold text-lg md:text-2xl text-white tracking-wide group-hover:text-blue-100 transition-colors">MONGIL: STAR DIVE</h3>
                     <p className="text-sm md:text-md text-[#9AA0A6] mt-0.5">PandaStore Originals</p>
                     <div className="flex items-center gap-2 mt-1 text-xs md:text-sm text-[#9AA0A6]">
                        <span className="flex items-center">4.9 <Star size={12} className="ml-1 md:ml-1.5 fill-[#9AA0A6]" /></span>
                        <span className="border border-[#3C4043] px-1 md:px-1.5 rounded-[4px] text-[10px] md:text-xs">12+</span>
                        <span className="hidden sm:inline">Editor's Choice</span>
                     </div>
                  </div>
               </div>
               <div className="flex flex-col items-end gap-1.5">
                  <button className="bg-[#8AB4F8] hover:bg-[#aecbfa] text-[#131314] md:px-10 px-6 py-2 md:py-2.5 rounded-full font-bold text-sm md:text-base transition-all active:scale-95 shadow-lg shadow-[#8AB4F8]/20">
                    Install
                  </button>
                  <span className="text-[10px] md:text-xs text-[#9AA0A6]">In-app purchases</span>
               </div>
            </div>
          </section>
        </Link>

        {/* Sponsored List */}
        <section className="space-y-6 max-w-4xl">
           <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg md:text-xl font-medium flex items-center gap-3">
                 <span className="text-[11px] md:text-xs font-bold text-[#9AA0A6] border border-[#3C4043] px-1.5 py-0.5 rounded-sm uppercase tracking-wider">Sponsored</span>
                 Suggested for You
              </h3>
              <button aria-label="More options" className="hover:bg-white/5 p-2 rounded-full transition-colors">
                 <MoreVertical size={24} className="text-[#9AA0A6]" />
              </button>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              {categoryData.map((app, i) => (
                 <Link key={i} href={`/game/${app.title.toLowerCase().replace(/ /g, "-")}`} className="flex items-center gap-5 cursor-pointer hover:bg-white/5 p-3 -mx-3 rounded-2xl transition-colors group">
                    <div className={`w-[84px] h-[84px] rounded-[22px] ${app.iconBg} flex items-center justify-center shadow-inner border border-white/5 flex-shrink-0 text-3xl group-hover:scale-105 transition-transform`}>
                       {app.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                       <h4 className="font-medium text-[17px] md:text-lg truncate text-[#E8EAED] group-hover:text-blue-200 transition-colors">{app.title}</h4>
                       <p className="text-sm md:text-[15px] text-[#9AA0A6] truncate mt-0.5">{app.name} • {app.tag}</p>
                       <div className="flex items-center gap-3 mt-1.5 text-xs md:text-[13px] text-[#9AA0A6]">
                          <span className="flex items-center">{app.rating} <Star size={11} md:size={12} className="ml-1 fill-[#9AA0A6] text-[#9AA0A6]" /></span>
                          <span>{app.size}</span>
                       </div>
                    </div>
                 </Link>
              ))}
           </div>
        </section>

      </main>

      {/* Bottom Navigation (Mobile Only) */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 bg-[#1e1f22]/95 backdrop-blur-xl border-t border-[#3C4043] z-50">
         <div className="flex justify-around items-center pt-2 pb-5">
            {bottomNavInfo.map(item => (
               <button 
                  key={item.name}
                  onClick={() => setActiveBottomNav(item.name)}
                  className={`flex flex-col items-center gap-1 w-16 transition-colors ${activeBottomNav === item.name ? 'text-[#8AB4F8]' : 'text-[#9AA0A6] hover:text-[#E8EAED]'}`}
               >
                  <div className={`px-4 py-1 rounded-full transition-all ${activeBottomNav === item.name ? 'bg-[#8AB4F8]/20' : 'bg-transparent'}`}>
                     {item.icon}
                  </div>
                  <span className="text-[11px] font-medium mt-0.5">{item.name}</span>
               </button>
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