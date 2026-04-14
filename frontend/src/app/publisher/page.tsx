'use client';

import Link from "next/link";

export default function PublisherPortal() {
  const stats = [
    { label: "Active Players", value: "2.4M", trend: "+12.5%", color: "text-primary" },
    { label: "Revenue (MTD)", value: "$1.2M", trend: "+8.2%", color: "text-tertiary" },
    { label: "App Store Rank", value: "#4", trend: "Stable", color: "text-on-surface" },
    { label: "Crash-free Rate", value: "99.9%", trend: "+0.1%", color: "text-sky-400" },
  ];

  return (
    <main className="min-h-screen pt-24 pb-12 px-8 flex flex-col gap-12 max-w-7xl mx-auto">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tighter text-on-surface mb-2">Publisher <span className="text-primary">Portal</span></h1>
          <p className="text-on-surface-variant">Manage your ecosystem and track real-time performance.</p>
        </div>
        <div className="flex gap-4">
          <button className="px-6 py-2.5 glass-panel rounded-lg text-sm font-bold border border-white/5 hover:bg-white/5 transition-all">Export Data</button>
          <button className="px-6 py-2.5 bg-primary text-on-primary rounded-lg text-sm font-bold hover:scale-105 transition-all shadow-[0_0_15px_rgba(125,211,252,0.1)]">Submit Update</button>
        </div>
      </header>

      {/* Stats Grid */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="glass-panel-elevated p-6 rounded-ROUND_TWELVE border border-white/5">
            <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant block mb-4">{stat.label}</span>
            <div className="flex justify-between items-end">
              <span className={`text-3xl font-extrabold ${stat.color} tracking-tighter`}>{stat.value}</span>
              <span className="text-xs font-bold text-sky-400/80 mb-1">{stat.trend}</span>
            </div>
          </div>
        ))}
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Main Content: Games Table */}
        <section className="lg:col-span-2 space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xs font-bold uppercase tracking-widest text-primary">Your Experiences</h2>
            <button className="text-xs font-bold text-on-surface-variant hover:text-on-surface flex items-center gap-1 transition-colors">
              Manage All <span className="material-symbols-outlined text-sm">chevron_right</span>
            </button>
          </div>
          
          <div className="glass-panel rounded-ROUND_TWELVE overflow-hidden border border-white/5">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-highest/30 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                  <th className="px-6 py-4">Title</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Installs (7d)</th>
                  <th className="px-6 py-4">Rating</th>
                </tr>
              </thead>
              <tbody className="text-sm text-on-surface">
                {[
                  { title: "Crystal Vanguard", status: "Live", installs: "840K", rating: "4.8" },
                  { title: "Neon Frost: Overdrive", status: "Live", installs: "420K", rating: "4.7" },
                  { title: "Ether Shift", status: "In Review", installs: "—", rating: "—" },
                  { title: "Verdant Abyss", status: "Live", installs: "120K", rating: "4.5" },
                ].map((game, i) => (
                  <tr key={i} className="border-t border-white/5 hover:bg-white/[0.02] transition-colors group cursor-pointer">
                    <td className="px-6 py-4 font-bold tracking-tight group-hover:text-primary transition-colors">{game.title}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${game.status === 'Live' ? 'bg-sky-400/10 text-sky-400' : 'bg-tertiary/10 text-tertiary'}`}>
                        {game.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs">{game.installs}</td>
                    <td className="px-6 py-4 flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm text-tertiary">star</span> {game.rating}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Sidebar: Notifications/Insights */}
        <aside className="space-y-8">
          <div className="glass-panel p-8 rounded-ROUND_TWELVE border border-white/5">
            <h3 className="text-lg font-bold text-on-surface mb-6">Security Insights</h3>
            <div className="space-y-6">
                <div className="flex gap-4 items-start">
                    <div className="w-10 h-10 rounded-lg glass-panel flex flex-shrink-0 items-center justify-center text-primary">
                        <span className="material-symbols-outlined">shield</span>
                    </div>
                    <div>
                        <h4 className="text-sm font-bold text-on-surface">Integrity Check Pass</h4>
                        <p className="text-xs text-on-surface-variant leading-relaxed mt-1">Global build manifests for 'Crystal Vanguard' have been verified.</p>
                    </div>
                </div>
                <div className="flex gap-4 items-start opacity-70">
                    <div className="w-10 h-10 rounded-lg glass-panel flex flex-shrink-0 items-center justify-center text-tertiary">
                        <span className="material-symbols-outlined">lock</span>
                    </div>
                    <div>
                        <h4 className="text-sm font-bold text-on-surface">Compliance Warning</h4>
                        <p className="text-xs text-on-surface-variant leading-relaxed mt-1">Updates required for Region-X privacy protocols by April 20th.</p>
                    </div>
                </div>
            </div>
            <button className="w-full mt-8 py-3 bg-surface-container-highest rounded-lg text-[10px] font-bold uppercase tracking-widest text-on-surface hover:bg-white/5 transition-all">Audit Center</button>
          </div>

          <div className="glass-panel-elevated p-8 rounded-ROUND_TWELVE border border-primary/20 frozen-glow">
            <h3 className="text-lg font-bold text-on-surface mb-2">Glacier Prime</h3>
            <p className="text-xs text-on-surface-variant mb-6">You are currently using the Enterprise Tier. All systems nominal.</p>
            <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center text-xs">
                    <span className="text-on-surface-variant">Cloud Storage</span>
                    <span className="text-on-surface font-bold">820 GB / 2 TB</span>
                </div>
                <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-primary w-[41%]"></div>
                </div>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
