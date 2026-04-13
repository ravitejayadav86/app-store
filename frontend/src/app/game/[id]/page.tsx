/* eslint-disable @next/next/no-img-element */

export default function GameDetail() {
  return (
    <main className="w-full">
      {/* Immersive Header */}
      <section className="relative h-[819px] w-full overflow-hidden">
        <div className="absolute inset-0">
          {/* We emulate the hero mask inline using an inline style maskImage or CSS */}
          <div className="absolute inset-0 max-h-full" style={{ maskImage: 'linear-gradient(to bottom, black 60%, transparent 100%)', WebkitMaskImage: 'linear-gradient(to bottom, black 60%, transparent 100%)' }}>
             <img className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBAH8RE3R5oCx-OrI1dJofaYonyHd9vWCS-ABTVnPfFTOM8HJ4ojQnvtlO1bjJyFTg_usOeOFrY50ZVhlfwKLrziZbA6SIDUYFsnShTdHJvh7aA-FQL0DDZg66aeORCX3Z73QY9IHT1SPYHgmp7PRtk8626NURj3NNjoIfa4Hr7LlZ8s7fFf2yaqHhAnoSnY73kwyixdAaLdwIIXkYoR6D8Hm5DZ4F3Vvqu68P-GLVqypOvoDu-SybdjzDLG4T9b8Rszli7AhMTzkE" alt="Cinematic wide shot" />
             <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent"></div>
          </div>
        </div>
        
        <div className="relative z-10 h-full flex flex-col justify-end pb-24 px-8 md:px-20 max-w-7xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 glass-panel-elevated rounded-full text-xs font-bold tracking-widest text-tertiary mb-6 uppercase max-w-max">
            <span className="material-symbols-outlined text-sm">rocket_launch</span>
            Available Now
          </div>
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-on-surface mb-4">NEBULA <span className="text-primary italic">BREACH</span></h1>
          <p className="max-w-2xl text-lg text-on-surface-variant leading-relaxed">
            Survive the edge of the galaxy in this high-octane sci-fi action epic. Master gravity-defying combat and reclaim the lost sectors from the Void Collective.
          </p>
        </div>
      </section>

      {/* Main Content & Sidebar Grid */}
      <section className="px-8 md:px-20 max-w-7xl mx-auto -mt-16 relative z-20 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Main Content (Screenshots & Description) */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Glassmorphic Image Gallery */}
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 group relative overflow-hidden rounded-xl border border-sky-300/10 shadow-[0_0_30px_rgba(125,211,252,0.05)]">
                <img className="w-full aspect-video object-cover group-hover:scale-105 transition-transform duration-700" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBxZ_4HGlaVzKzqgUGll2A4uEUrHgNJ4lBVug9ujKqqTlNq0qBjnCb_VqgjANwiIbQtXM6Djmy94Q0NsYtlneLSuIX0a47GH9TTwSpwjc2qsa-KxMGlBPi8qpnaVxoKr9drI-6v5vuRtzzKWneSYYH77Qq9DLtALNTsADIE4NAtYJkqEJZaCpnmf6dZLFXokTjIxsQiE0kOfKVOouh0Aou3JSYm8TSOUnFK7-8zxH_QgEJjPWqG1TksX92ImGGPmWamN9r-7hbQfI4" alt="Gameplay" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
                  <span className="text-sm font-medium text-sky-300">Intense Close-Quarters Combat</span>
                </div>
              </div>
              <div className="group relative overflow-hidden rounded-xl border border-sky-300/10 shadow-[0_0_30px_rgba(125,211,252,0.05)]">
                <img className="w-full aspect-square object-cover group-hover:scale-105 transition-transform duration-700" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBvQuyphMtjCjHAGyVz2GPoW6obQJUdS8DHbVoRTUbiD2gokA1K6Cfe1ymjI5Icokz8VzPvXjCL1skgLC2409twEedYyXg9IjLWW1wb6_kIb-dAFtC_csBg9izK-NneANQew9cTBvjApK9fw1Un6E4ZAwkieWc306QgXVyNcsT0PrwximxBinedDA33JBqVP1ZFt6-tzgrzPmnfk7htwQPb6w69ExXBu2uMQm-E7ZfRahbMzG4nfFITvQijgBREbodm5WctL-tVeI4" alt="Planet" />
              </div>
              <div className="group relative overflow-hidden rounded-xl border border-sky-300/10 shadow-[0_0_30px_rgba(125,211,252,0.05)]">
                <img className="w-full aspect-square object-cover group-hover:scale-105 transition-transform duration-700" src="https://lh3.googleusercontent.com/aida-public/AB6AXuB_aYD8ZozJHjjLpaB7ezV0UmkvLE-8KqHMIGTmATUxnz24WdoT1GFOGhnywLOiEDNecYAezV-gjhWfPtCJGnpK-W_FlFoBk1JnQeXZ_d_II8367shn_ise5CI7WNc7GsTnU_4LoaW7nK1PDEcXNepALd2_TJ22BdVZTrKe0e-jFimS_1jZ3w5TgW8p_t-dLfsrKfJ9yo8VStzPR-MXqHQi9d2ydRr38IdjjzX4Ii6J6h9kwGCT_4P5pOh9Bz06VscIWx115ETLr34" alt="Cockpit" />
              </div>
            </div>

            {/* About Section */}
            <div className="glass-panel p-8 rounded-xl">
              <h2 className="text-2xl font-bold text-on-surface mb-4">About the Game</h2>
              <div className="space-y-4 text-on-surface-variant leading-relaxed">
                <p>Nebula Breach pushes the boundaries of tactical action. Infiltrate massive Dyson Spheres, navigate asteroid fields, and engage in visceral combat that seamlessly transitions between ground and space.</p>
                <p>Featuring a dynamic story where every tactical decision influences the political landscape of the star system. Will you be a liberator or a conqueror?</p>
              </div>
            </div>
          </div>

          {/* Sidebar (Game Details) */}
          <aside className="lg:col-span-4 space-y-6">
            
            {/* Purchase Box */}
            <div className="glass-panel-elevated p-6 rounded-xl space-y-6 sticky top-28 shadow-[0_0_50px_rgba(125,211,252,0.1)]">
              <div>
                <div className="flex justify-between items-end mb-2">
                  <span className="text-on-surface-variant text-sm font-medium">Standard Edition</span>
                  <span className="text-3xl font-black text-on-surface">$59.99</span>
                </div>
                <button className="w-full py-4 rounded-lg bg-primary text-on-primary font-bold text-lg shadow-[0_0_20px_rgba(125,211,252,0.4)] hover:shadow-[0_0_35px_rgba(125,211,252,0.6)] hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>shopping_bag</span>
                  BUY NOW
                </button>
              </div>
              <div className="h-px bg-sky-300/10"></div>
              <div className="space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-on-surface-variant">Publisher</span>
                  <span className="text-on-surface font-semibold">GLACIER GAMING</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-on-surface-variant">Release Date</span>
                  <span className="text-on-surface font-semibold">DEC 12, 2023</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-on-surface-variant">Reviews</span>
                  <span className="text-primary font-semibold flex items-center gap-1">
                    <span className="material-symbols-outlined text-xs" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                    9.4/10
                  </span>
                </div>
              </div>
              
              <div className="h-px bg-sky-300/10"></div>
              <div className="space-y-3">
                <span className="text-xs font-bold text-on-surface-variant tracking-wider uppercase">Tags</span>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-sky-300/5 border border-sky-300/10 rounded-full text-xs text-sky-300">Sci-Fi</span>
                  <span className="px-3 py-1 bg-sky-300/5 border border-sky-300/10 rounded-full text-xs text-sky-300">Tactical</span>
                  <span className="px-3 py-1 bg-sky-300/5 border border-sky-300/10 rounded-full text-xs text-sky-300">Open World</span>
                  <span className="px-3 py-1 bg-sky-300/5 border border-sky-300/10 rounded-full text-xs text-sky-300">Singleplayer</span>
                </div>
              </div>
              
              <div className="flex gap-4">
                <button className="flex-1 py-3 glass-panel rounded-lg text-sm font-semibold hover:bg-sky-300/10 transition-colors flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined text-lg">favorite</span>
                  Wishlist
                </button>
                <button className="flex-1 py-3 glass-panel rounded-lg text-sm font-semibold hover:bg-sky-300/10 transition-colors flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined text-lg">share</span>
                  Share
                </button>
              </div>
            </div>

            {/* System Requirements */}
            <div className="glass-panel p-6 rounded-xl">
              <h3 className="text-sm font-bold text-on-surface mb-4 uppercase tracking-wider">Recommended Specs</h3>
              <div className="space-y-3 text-xs text-on-surface-variant">
                <div className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-primary text-sm">memory</span>
                  <span>AMD Ryzen 7 5800X / Intel i7-12700K</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-primary text-sm">videogame_asset</span>
                  <span>RTX 3080 / RX 6800 XT (10GB VRAM)</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-primary text-sm">storage</span>
                  <span>120 GB Available Space (NVMe SSD Required)</span>
                </div>
              </div>
            </div>
            
          </aside>
        </div>
      </section>
    </main>
  );
}
