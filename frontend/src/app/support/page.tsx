'use client';

import Link from "next/link";

export default function SupportPage() {
  const categories = [
    { title: "Account & Billing", icon: "payments", count: 124 },
    { title: "Technical issues", icon: "settings_suggest", count: 85 },
    { title: "Safety & Privacy", icon: "gpp_good", count: 42 },
    { title: "Refund Policy", icon: "currency_exchange", count: 18 },
  ];

  return (
    <main className="min-h-screen pt-24 pb-12 px-8 max-w-7xl mx-auto flex flex-col items-center">
      <header className="text-center mb-16">
        <h1 className="text-6xl font-extrabold tracking-tighter text-on-surface mb-6">
          How can we <span className="text-primary italic">help?</span>
        </h1>
        <div className="relative max-w-2xl mx-auto group">
          <input className="w-full bg-surface-container/50 border border-outline-variant rounded-full py-5 px-10 text-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all shadow-[0_0_30px_rgba(125,211,252,0.05)]" placeholder="Search for solutions..." type="text"/>
          <span className="material-symbols-outlined absolute right-8 top-5 text-on-surface-variant text-3xl">search</span>
        </div>
      </header>

      {/* Categories Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 w-full mb-20">
        {categories.map((cat, i) => (
          <div key={i} className="glass-panel p-8 rounded-ROUND_TWELVE text-center hover:border-primary/40 transition-all duration-500 cursor-pointer group hover:-translate-y-2">
            <div className="w-16 h-16 rounded-2xl bg-surface-container-highest mx-auto mb-6 flex items-center justify-center text-primary group-hover:bg-primary/10 group-hover:scale-110 transition-all">
                <span className="material-symbols-outlined text-4xl">{cat.icon}</span>
            </div>
            <h3 className="text-xl font-bold text-on-surface mb-2">{cat.title}</h3>
            <p className="text-xs text-on-surface-variant font-bold uppercase tracking-widest">{cat.count} Articles</p>
          </div>
        ))}
      </section>

      {/* Featured Articles & Contact */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-16 w-full">
        <section className="lg:col-span-2 space-y-10">
          <h2 className="text-xs font-bold uppercase tracking-widest text-primary ml-1">Featured Solutions</h2>
          <div className="space-y-4">
            {[
              "Restoring a lost account via Glacier Authenticator",
              "Common Direct3D 12 initialization errors and fixes",
              "Managing subscription tiers and billing cycles",
              "Setting up family sharing for Glacier Prime members",
              "Optimizing performance for high-refresh rate displays"
            ].map((text, i) => (
              <Link key={i} className="block glass-panel-elevated p-6 rounded-lg border border-white/5 hover:bg-white/[0.03] transition-all flex justify-between items-center group" href="#">
                <span className="text-on-surface font-semibold">{text}</span>
                <span className="material-symbols-outlined text-primary opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">arrow_forward</span>
              </Link>
            ))}
          </div>
        </section>

        <section className="space-y-12">
            <div className="glass-panel p-10 rounded-ROUND_TWELVE border border-tertiary/20 text-center relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-tertiary/5 blur-[60px] rounded-full"></div>
                <h3 className="text-2xl font-bold text-on-surface mb-4">Immediate Support</h3>
                <p className="text-on-surface-variant text-sm mb-8 leading-relaxed">Can't find what you need? Open a priority secure line with our support agents.</p>
                <button className="w-full py-4 bg-tertiary text-on-tertiary font-bold rounded-lg hover:scale-105 transition-all shadow-[0_0_20px_rgba(200,160,240,0.2)]">Open Live Chat</button>
                <p className="mt-4 text-[10px] uppercase font-bold tracking-widest text-on-surface-variant/60">Average Wait: 2 mins</p>
            </div>

            <div className="glass-panel p-10 rounded-ROUND_TWELVE text-center">
                <h3 className="text-lg font-bold text-on-surface mb-4">Legacy Knowledge</h3>
                <p className="text-xs text-on-surface-variant mb-8">Access our legacy archives for older hardware compatibility and archived game titles.</p>
                <Link className="text-primary font-bold text-xs uppercase tracking-widest hover:underline" href="#">Browse Archives</Link>
            </div>
        </section>
      </div>
    </main>
  );
}
