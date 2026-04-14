'use client';

import Link from "next/link";

export default function CommunityPage() {
  const featuredHubs = [
    { title: "Crystal Vanguard", members: "1.2M", online: "45K", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuChEtbd1CjYB_SM-O5F4WkId0kNUwQABkM4L3tho6C8NYhCgNF4g_d2UiANpn5ODGF2cA4ifaa2wBBsQDdjnxEgnDYSy29_ki0EUCIOxOPr5WsMb0-dspo5BCOJjJKmRU-cjdaVG3LIEi6IeR4eOHsfRKj34ya33xaLLm4473TPyYH-Md3g1eWT-LIvuwkaSlzFY6p7K8IL_PtGq7XexK0tYtldpWFwLUZzfdgllwBpqWQhk58of6xo01OWoTmDnZaXlauU0nVhFwE" },
    { title: "Neon Frost", members: "840K", online: "12K", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDUAMtYmOMbeifsaCTO1Tj3p-9xeYVNrU4a8fW2-pmtfDo9F6zylw_sl9AljjWJVwIu3491asuVj0MUym_EgOck9oIOobl2-SUr-dPHIE3qI6GARk6RXf13vW6XUYLHP7_hqWpZYpU3i2IvedflhEC84Ilh9IHY7VXjYPWp94w7zcvaUNAx5-ntvN9iCKd5D1afIHGVTuVjY6XOwFO98GlCYs0TF18Tqen88G4eJPPPBaI7f6tneKb6eaJcRFRqSuXBUIkFCPWqqHQ" },
    { title: "Circuit Breaker", members: "250K", online: "8K", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuADoohaGouEd_xDmRlQcd_C9gRcdGl4ikHhBP18pCtYKI-xGVARUNrVu2HxJuE7Wi0neul9dC49g7Jq0SLpwOrd3YGnPTJS0feGswXfJwzY5ryWk4mn6O1aE15J4T3eOqDMyGnI2vqUqBRP1XHO7Ny_lEhibdfJgWS445UYgXuoXg6jHPiWG2oB8pvL_CXqya6Qjp7ahQqyumz205QTRUQL3N1X8sbaJAPrSndrpIcw8-VWNwVVSPHZ59t1M1FM5eKvhlWd8CypxpI" },
  ];

  return (
    <main className="min-h-screen pt-24 pb-12 px-8 max-w-7xl mx-auto">
      <header className="mb-12">
        <h1 className="text-5xl font-extrabold tracking-tighter text-on-surface mb-4">
          Community <span className="text-tertiary">Hub</span>
        </h1>
        <p className="text-on-surface-variant max-w-2xl text-lg">
          Connect with millions of players, share your highlights, and stay ahead of the meta.
        </p>
      </header>

      {/* Featured Hubs Grid */}
      <section className="mb-16">
        <h2 className="text-xs font-bold uppercase tracking-widest text-primary mb-6">Trending Hubs</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {featuredHubs.map((hub, i) => (
            <div key={i} className="glass-panel rounded-ROUND_TWELVE overflow-hidden group cursor-pointer hover:border-primary/30 transition-all duration-500">
              <div className="h-48 relative overflow-hidden">
                <img alt={hub.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-80" src={hub.image} />
                <div className="absolute inset-0 bg-gradient-to-t from-surface to-transparent"></div>
              </div>
              <div className="p-6">
                <h3 className="text-2xl font-bold text-on-surface mb-2">{hub.title}</h3>
                <div className="flex gap-4 text-xs font-bold uppercase tracking-wider">
                  <span className="text-on-surface-variant"><span className="text-primary">{hub.members}</span> members</span>
                  <span className="text-on-surface-variant"><span className="text-tertiary">{hub.online}</span> online</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Community Activity Feed Placeholder */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <section className="lg:col-span-2 space-y-8">
          <h2 className="text-xs font-bold uppercase tracking-widest text-primary">Global Activity</h2>
          {[1, 2, 3].map((item) => (
            <div key={item} className="glass-panel-elevated p-8 rounded-ROUND_TWELVE border border-white/5 flex gap-6">
              <div className="w-12 h-12 rounded-full bg-surface-container-highest flex-shrink-0"></div>
              <div className="flex-grow">
                <div className="flex justify-between items-start mb-2">
                  <span className="font-bold text-on-surface">ZeroGravity_99 <span className="text-on-surface-variant font-normal text-sm ml-2">posted in Neon Frost</span></span>
                  <span className="text-xs text-on-surface-variant">2h ago</span>
                </div>
                <p className="text-on-surface-variant text-sm mb-4 leading-relaxed">
                  Just reached the platinum league! Check out this drift sequence on the Neo-Tokyo track. 
                  Does anyone have tips for optimizing the cryogenic engine mod?
                </p>
                <div className="flex gap-4">
                  <button className="flex items-center gap-2 text-xs font-bold text-on-surface-variant hover:text-primary transition-colors">
                    <span className="material-symbols-outlined text-sm">thumb_up</span> 1.2K
                  </button>
                  <button className="flex items-center gap-2 text-xs font-bold text-on-surface-variant hover:text-tertiary transition-colors">
                    <span className="material-symbols-outlined text-sm">comment</span> 42
                  </button>
                </div>
              </div>
            </div>
          ))}
        </section>

        <aside className="space-y-12">
          <div className="glass-panel p-8 rounded-ROUND_TWELVE">
            <h3 className="text-lg font-bold text-on-surface mb-6">Upcoming Events</h3>
            <div className="space-y-6">
              <div className="border-l-2 border-primary pl-4">
                <h4 className="font-bold text-on-surface text-sm">Circuit Breaker Tournament</h4>
                <p className="text-xs text-on-surface-variant">Registration closes in 4h</p>
              </div>
              <div className="border-l-2 border-tertiary pl-4">
                <h4 className="font-bold text-on-surface text-sm">Glacier Gala Live Stream</h4>
                <p className="text-xs text-on-surface-variant">Tomorrow at 18:00 UTC</p>
              </div>
            </div>
          </div>

          <div className="glass-panel p-8 rounded-ROUND_TWELVE">
            <h3 className="text-lg font-bold text-on-surface mb-6">Live Rankings</h3>
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map(rank => (
                <div key={rank} className="flex justify-between items-center text-sm">
                  <span className="text-on-surface-variant">#{rank} <span className="text-on-surface ml-2">FrostLord_{rank}</span></span>
                  <span className="text-primary font-bold">{(12000 / rank).toFixed(0)}</span>
                </div>
              ))}
            </div>
            <button className="w-full mt-8 py-3 glass-panel-elevated rounded-lg text-xs font-bold hover:bg-white/5 transition-all uppercase tracking-widest text-primary">View Leaderboard</button>
          </div>
        </aside>
      </div>
    </main>
  );
}
