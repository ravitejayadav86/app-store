/* eslint-disable @next/next/no-img-element */
import Link from 'next/link';

export default function Library() {
  return (
    <div className="w-full flex-col min-h-screen">
      {/* We already have a Navbar in layout, so we only replicate the Library sub-header */}
      <div className="bg-background/80 backdrop-blur-2xl sticky top-20 z-40 border-b border-white/5 pt-4">
        <div className="flex px-10 gap-8 max-w-[1800px] mx-auto w-full">
          <Link href="/library" className="flex flex-col items-center justify-center border-b-[3px] border-primary text-on-surface pb-[13px]">
            <p className="text-sm font-bold leading-normal tracking-[0.015em] drop-shadow-[0_0_8px_rgba(125,211,252,0.3)]">All Games</p>
          </Link>
          <Link href="#" className="flex flex-col items-center justify-center border-b-[3px] border-transparent text-on-surface-variant hover:text-on-surface transition-colors pb-[13px]">
            <p className="text-sm font-bold leading-normal tracking-[0.015em]">Installed</p>
          </Link>
          <Link href="#" className="flex flex-col items-center justify-center border-b-[3px] border-transparent text-on-surface-variant hover:text-on-surface transition-colors pb-[13px]">
            <p className="text-sm font-bold leading-normal tracking-[0.015em]">Favorites</p>
          </Link>
        </div>
      </div>

      <main className="flex-1 w-full max-w-[1800px] mx-auto px-10 py-10 flex flex-col gap-8">
        <div className="flex justify-between items-end border-b border-white/5 pb-6">
          <div>
            <h1 className="text-3xl font-bold text-on-surface tracking-tight mb-2 drop-shadow-[0_0_15px_rgba(125,211,252,0.1)]">Your Collection</h1>
            <p className="text-on-surface-variant text-sm">4 items</p>
          </div>
          <div className="flex gap-2">
            <button className="h-10 w-10 py-1 rounded-lg glass-panel flex items-center justify-center text-on-surface-variant hover:text-primary hover:border-primary/30 transition-colors">
              <span className="material-symbols-outlined">grid_view</span>
            </button>
            <button className="h-10 w-10 py-1 rounded-lg glass-panel flex items-center justify-center text-on-surface-variant hover:text-primary hover:border-primary/30 transition-colors">
              <span className="material-symbols-outlined">list</span>
            </button>
            <button className="h-10 px-4 rounded-lg glass-panel flex items-center gap-2 text-on-surface-variant hover:text-primary hover:border-primary/30 transition-colors text-sm font-medium ml-4">
              <span className="material-symbols-outlined text-[18px]">filter_list</span>
              Filter
            </button>
          </div>
        </div>

        <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-6 lg:gap-8 pt-4">
          
          {/* Game Card: Playable */}
          <div className="group relative rounded-2xl overflow-hidden aspect-[3/4] glass-panel shadow-[0_0_30px_rgba(125,211,252,0.02)] transition-all duration-500 hover:shadow-[0_0_50px_rgba(125,211,252,0.15)] hover:border-primary/30 hover:-translate-y-1">
            <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-out group-hover:scale-105" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDemXaSx6geMmcldcTKSwaUwqMmZ8bH2J0MrFJXEV6uLezxko_MXnxznwnItJ5_WK3ExEPJjBRJchXjo4esX_xWyrayJGCH3M_DSL_0jfsRBAjFJPRIaAB854cD70IT6gH5EUndNZQoAgkjr0lcECmyt_39sUrTxkt7nALSiKR7ULUz1jl1Jq6_GgIDp8L2w8LoNn5aYvclHTBYQZsguNMucWxt27QvXQjiM3z6jqGSJmdD0iO4fvm0Ck2zW8KhlzYSQTrZj1xhTlM')" }}></div>
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent opacity-90 transition-opacity duration-500 group-hover:opacity-100"></div>
            <div className="absolute top-4 right-4 glass-panel-elevated rounded-full px-3 py-1 flex items-center gap-1.5 border-primary/20">
              <div className="h-2 w-2 rounded-full bg-primary shadow-[0_0_8px_rgba(125,211,252,0.8)]"></div>
              <span className="text-[10px] font-bold text-primary uppercase tracking-wider">Ready</span>
            </div>
            <div className="absolute inset-0 p-6 flex flex-col justify-end">
              <h3 className="text-2xl font-bold text-on-surface mb-1 drop-shadow-md transition-transform duration-500 group-hover:-translate-y-2">Cyberpunk 2077</h3>
              <p className="text-sm text-on-surface-variant mb-6 transition-transform duration-500 group-hover:-translate-y-2">124 hours played</p>
              <div className="absolute bottom-6 left-6 right-6 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 ease-out pointer-events-none group-hover:pointer-events-auto">
                <button className="w-full py-3 rounded-xl bg-primary/20 hover:bg-primary/30 border border-primary/40 text-primary font-bold backdrop-blur-md transition-all duration-300 flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(125,211,252,0.15)] hover:shadow-[0_0_30px_rgba(125,211,252,0.3)]">
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>play_arrow</span>
                  Play Now
                </button>
              </div>
            </div>
          </div>

          {/* Game Card: Needs Update */}
          <div className="group relative rounded-2xl overflow-hidden aspect-[3/4] glass-panel shadow-[0_0_30px_rgba(125,211,252,0.02)] transition-all duration-500 hover:shadow-[0_0_50px_rgba(200,160,240,0.15)] hover:border-tertiary/30 hover:-translate-y-1">
            <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-out group-hover:scale-105" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAFwf4aO6K03mVGcFrFxV6TSMbKyG2OU5Bl4FRh-Pj-IhYQF4QPVzfZ8iPmm2iKnWoZ8vrT1IoFy33neEiKXYVMU4YLZRijc7NTZcF5lkfzLdli1TH0QF1pNNEOVf5BI1zCzVoBacdwLB1K4xkrIGlWFk9KDG8QTGAictjnjXjVKumea8_vAgLEcbVTQ8mofYr0_dY9CVeuZDlUKr1umchOgGCSP9mCZ4KfPlA4BJ7R7W-hM2Fzbt8yvwpqPHaELbn4WhpdK0tXRnA')" }}></div>
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent opacity-90 transition-opacity duration-500 group-hover:opacity-100"></div>
            <div className="absolute inset-0 p-6 flex flex-col justify-end">
              <h3 className="text-2xl font-bold text-on-surface mb-1 drop-shadow-md transition-transform duration-500 group-hover:-translate-y-2">Elden Ring</h3>
              <p className="text-sm text-tertiary mb-6 transition-transform duration-500 group-hover:-translate-y-2">Update available (2.4 GB)</p>
              <div className="absolute bottom-6 left-6 right-6 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 ease-out pointer-events-none group-hover:pointer-events-auto">
                <button className="w-full py-3 rounded-xl bg-tertiary/10 hover:bg-tertiary/20 border border-tertiary/30 text-tertiary font-bold backdrop-blur-md transition-all duration-300 flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(200,160,240,0.1)] hover:shadow-[0_0_30px_rgba(200,160,240,0.2)]">
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>download</span>
                  Update
                </button>
              </div>
            </div>
          </div>

          {/* Game Card: Active Installation */}
          <div className="group relative rounded-2xl overflow-hidden aspect-[3/4] glass-panel border-primary/30 shadow-[0_0_40px_rgba(125,211,252,0.1)]">
            <div className="absolute inset-0 bg-cover bg-center opacity-40 transition-transform duration-1000 scale-105" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuC5-s285zAutqEF8Hf6SoCkU8VozgSs2uKwhw2hjxgxzeANyfeWtYvE_05ea-YmBtoWW59L3rfZyuK1w9ENURVAerL7YcRLCUfQ4btKY9P_wY8leDWpm2xEb9GVfWVgoESfCseSZ92p442VqVk39fFhjLexT7RaTIBfWMv2rsrJoj3ARLnjuxhT1LEI9JSy4zqNxcDfp1W8l6erNQ9Q_Y_8dtZHzifQ7u72sOtsocn5yhLATcxK6itIKrl5LM6zHX9m0uaX11SuD7o')" }}></div>
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-background/30"></div>
            <div className="absolute inset-0 p-6 flex flex-col justify-between">
              <div className="flex justify-end">
                <div className="glass-panel-elevated rounded-full px-3 py-1 flex items-center gap-2 border-primary/20 bg-background/50">
                  <span className="material-symbols-outlined text-[14px] text-primary animate-spin">sync</span>
                  <span className="text-[10px] font-bold text-primary uppercase tracking-wider">Downloading</span>
                </div>
              </div>
              <div className="flex flex-col gap-4">
                <h3 className="text-2xl font-bold text-on-surface drop-shadow-md">Starfield</h3>
                <div className="flex flex-col gap-3 p-4 rounded-xl glass-panel-elevated bg-background/40">
                  <div className="flex justify-between text-sm items-center">
                    <span className="text-on-surface font-medium">Installing...</span>
                    <span className="text-primary font-bold drop-shadow-[0_0_8px_rgba(125,211,252,0.5)]">65%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-surface-bright overflow-hidden border border-white/5 relative">
                    <div className="absolute top-0 bottom-0 left-0 bg-primary w-[65%] rounded-full shadow-[0_0_15px_rgba(125,211,252,0.8)]">
                    </div>
                  </div>
                  <div className="flex justify-between items-center mt-1">
                    <p className="text-xs text-on-surface-variant flex items-center gap-1">
                      <span className="material-symbols-outlined text-[12px]">schedule</span>
                      45 mins remaining
                    </p>
                    <p className="text-xs text-on-surface-variant font-mono">24.5 MB/s</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
        </div>
      </main>
    </div>
  );
}
