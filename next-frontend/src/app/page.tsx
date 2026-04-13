/* eslint-disable @next/next/no-img-element */
import Link from 'next/link';

export default function Home() {
  return (
    <main className="w-full">
      {/* Hero Section */}
      <section className="relative h-[870px] flex items-center justify-center overflow-hidden px-8">
        <div className="absolute inset-0 hero-gradient"></div>
        <div className="relative z-10 max-w-7xl w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6 flex flex-col items-start">
            <span className="inline-block px-4 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold tracking-widest uppercase">New Release</span>
            <h1 className="text-6xl md:text-8xl font-extrabold tracking-tighter text-on-surface leading-tight">
              CRYSTAL <br/> <span className="text-primary drop-shadow-[0_0_20px_rgba(125,211,252,0.3)]">VANGUARD</span>
            </h1>
            <p className="text-lg text-on-surface-variant max-w-lg leading-relaxed">
              Journey through the frozen echoes of a forgotten civilization. Master the elements in this hyper-realistic 3D action RPG.
            </p>
            <div className="flex flex-wrap gap-4 pt-4">
              <Link href="/game/crystal-vanguard">
                <button className="px-8 py-4 bg-primary text-on-primary font-bold rounded-lg hover:bg-primary-fixed-dim transition-all hover:scale-105 active:scale-95 frozen-glow">
                  Play Now
                </button>
              </Link>
              <button className="px-8 py-4 glass-panel text-primary font-bold rounded-lg hover:bg-sky-300/10 transition-all hover:scale-105 active:scale-95">
                Watch Trailer
              </button>
            </div>
          </div>
          <div className="relative flex justify-center items-center group">
            <div className="absolute inset-0 bg-primary/20 blur-[100px] rounded-full group-hover:bg-primary/30 transition-all duration-700"></div>
            <img 
              alt="3D Character" 
              className="relative z-20 w-full max-w-[500px] animate-pulse-subtle" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuChEtbd1CjYB_SM-O5F4WkId0kNUwQABkM4L3tho6C8NYhCgNF4g_d2UiANpn5ODGF2cA4ifaa2wBBsQDdjnxEgnDYSy29_ki0EUCIOxOPr5WsMb0-dspo5BCOJjJKmRU-cjdaVG3LIEi6IeR4eOHsfRKj34ya33xaLLm4473TPyYH-Md3g1eWT-LIvuwkaSlzFY6p7K8IL_PtGq7XexK0tYtldpWFwLUZzfdgllwBpqWQhk58of6xo01OWoTmDnZaXlauU0nVhFwE"
            />
            {/* Decor elements */}
            <div className="absolute top-0 right-0 w-32 h-32 glass-panel-elevated rounded-2xl rotate-12 -z-10 animate-bounce"></div>
            <div className="absolute bottom-10 left-0 w-24 h-24 glass-panel-elevated rounded-full -rotate-12 -z-10"></div>
          </div>
        </div>
      </section>

      {/* Bento Grid: Top Releases */}
      <section className="max-w-7xl mx-auto px-8 py-24">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-4xl font-bold tracking-tight text-on-surface">Top Releases</h2>
            <p className="text-on-surface-variant">Most played experiences this month</p>
          </div>
          <button className="text-primary flex items-center gap-2 hover:underline font-semibold">
            View All <span className="material-symbols-outlined">arrow_forward</span>
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          
          {/* Large Card */}
          <Link href="/game/neon-frost" className="md:col-span-2 md:row-span-2 group relative overflow-hidden rounded-xl glass-panel frozen-glow cursor-pointer transition-all duration-500 hover:scale-[1.02]">
            <img alt="Game 1" className="w-full h-full object-cover opacity-60 group-hover:scale-110 transition-transform duration-700" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDUAMtYmOMbeifsaCTO1Tj3p-9xeYVNrU4a8fW2-pmtfDo9F6zylw_sl9AljjWJVwIu3491asuVj0MUym_EgOck9oIOobl2-SUr-dPHIE3qI6GARk6RXf13vW6XUYLHP7_hqWpZYpU3i2IvedflhEC84Ilh9IHY7VXjYPWp94w7zcvaUNAx5-ntvN9iCKd5D1afIHGVTuVjY6XOwFO98GlCYs0TF18Tqen88G4eJPPPBaI7f6tneKb6eaJcRFRqSuXBUIkFCPWqqHQ"/>
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent"></div>
            <div className="absolute bottom-0 p-8 w-full">
              <div className="flex justify-between items-center mb-2">
                <span className="text-primary font-bold text-sm tracking-widest uppercase">Popular Now</span>
                <span className="bg-primary text-on-primary px-3 py-1 rounded-full text-xs font-bold">$59.99</span>
              </div>
              <h3 className="text-3xl font-bold text-white mb-2">Neon Frost: Overdrive</h3>
              <p className="text-slate-300 text-sm mb-4">Master the streets in this high-octane racing simulator.</p>
              <div className="flex gap-2">
                <span className="material-symbols-outlined text-sky-300 text-xl">stadia_controller</span>
                <span className="material-symbols-outlined text-sky-300 text-xl">bolt</span>
              </div>
            </div>
          </Link>

          {/* Small Card 1 */}
          <Link href="/game/ether-shift" className="group relative overflow-hidden rounded-xl glass-panel frozen-glow cursor-pointer transition-all duration-500 hover:scale-[1.02]">
            <div className="aspect-square relative">
              <img alt="Game 2" className="w-full h-full object-cover opacity-60 group-hover:scale-110 transition-transform duration-700" src="https://lh3.googleusercontent.com/aida-public/AB6AXuB9-emRn92e985RuXyglxu1_N5i5HTc0JwED6a1hctbpRFNvIoWv0cvIiwE3_tmYeq98lWkj_7SwTwzVuSqBEk1Tbfhss1NN5UYbyjonyl9GW15-2gmiega6zVc3PZoKMT94PAhAl3PrVZ-87n8UvTZtV3GoAKQeZ9oGCSffxsZBk_JbqCT57CfQEmcal8eiSifiVrF1WFKkHMXpOYpCdipp1Ibj7KWN6IhUUclXvgPrV71ZtvrtsrYx9tse-691xhqWZWikt1_Nsc"/>
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent"></div>
              <div className="absolute bottom-0 p-6 w-full">
                <h3 className="text-xl font-bold text-sky-300 mb-1">Ether Shift</h3>
                <p className="text-slate-400 text-xs">Tactical Puzzle Strategy</p>
              </div>
            </div>
          </Link>

          {/* Small Card 2 */}
          <Link href="/game/verdant-abyss" className="group relative overflow-hidden rounded-xl glass-panel frozen-glow cursor-pointer transition-all duration-500 hover:scale-[1.02]">
            <div className="aspect-square relative">
              <img alt="Game 3" className="w-full h-full object-cover opacity-60 group-hover:scale-110 transition-transform duration-700" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDU0QBGaltwv9oW_6lP9oiFqqHL2hT4K4BLGxvjIRVE8YGy9pUZb3aXGMuuVO6mJ6gt7gt5S72yJpuB90SJSWs7lhkf7b1IICkCBaNiaK09-A4xscUcK9VGK0Bhc-VypMwTqmttg6g2J_cGMD_YdGAucvvLduHMkyM6w1dlp0gTfNMoGc9sBkwFPj-j71FsVtJErBWW1H4vvcuVOJ_Qxa1ktrew7HWmibUDnkDVRZk10Z3W_WUWlslkqqJg30bti4viztGMSQkbYUI"/>
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent"></div>
              <div className="absolute bottom-0 p-6 w-full flex flex-col justify-end">
                <h3 className="text-xl font-bold text-sky-300 mb-1">Verdant Abyss</h3>
                <p className="text-slate-400 text-xs">Survival Expedition</p>
              </div>
            </div>
          </Link>

          {/* Horizontal Card */}
          <Link href="/game/circuit-breaker" className="md:col-span-2 group relative overflow-hidden rounded-xl glass-panel frozen-glow cursor-pointer transition-all duration-500 hover:scale-[1.02]">
            <div className="flex h-full min-h-[160px]">
              <img alt="Game 4" className="w-1/3 object-cover opacity-60 group-hover:scale-105 transition-transform duration-700" src="https://lh3.googleusercontent.com/aida-public/AB6AXuADoohaGouEd_xDmRlQcd_C9gRcdGl4ikHhBP18pCtYKI-xGVARUNrVu2HxJuE7Wi0neul9dC49g7Jq0SLpwOrd3YGnPTJS0feGswXfJwzY5ryWk4mn6O1aE15J4T3eOqDMyGnI2vqUqBRP1XHO7Ny_lEhibdfJgWS445UYgXuoXg6jHPiWG2oB8pvL_CXqya6Qjp7ahQqyumz205QTRUQL3N1X8sbaJAPrSndrpIcw8-VWNwVVSPHZ59t1M1FM5eKvhlWd8CypxpI"/>
              <div className="w-2/3 p-6 flex flex-col justify-center">
                <h3 className="text-2xl font-bold text-sky-300 mb-1">Circuit Breaker</h3>
                <p className="text-slate-400 text-sm mb-3">Hack your way through the digital underworld.</p>
                <span className="text-primary text-sm font-bold">$19.99</span>
              </div>
            </div>
          </Link>

        </div>
      </section>

      {/* Coming Soon Carousel Placeholder */}
      <section className="max-w-7xl mx-auto px-8 py-12">
        <div className="glass-panel-elevated rounded-3xl p-12 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-tertiary/10 blur-[80px] rounded-full -mr-20 -mt-20"></div>
          <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-extrabold tracking-tight text-on-surface mb-6">Coming Soon</h2>
              <div className="space-y-8">
                <div className="flex gap-6 items-start">
                  <div className="w-20 h-20 rounded-xl glass-panel flex-shrink-0 flex items-center justify-center font-bold text-primary text-xl">OCT</div>
                  <div>
                    <h4 className="text-xl font-bold text-on-surface">Nova Horizon</h4>
                    <p className="text-on-surface-variant text-sm flex-wrap">A vast space exploration simulator with procedural universe generation.</p>
                  </div>
                </div>
                <div className="flex gap-6 items-start opacity-70">
                  <div className="w-20 h-20 rounded-xl glass-panel flex-shrink-0 flex items-center justify-center font-bold text-slate-400 text-xl">NOV</div>
                  <div>
                    <h4 className="text-xl font-bold text-on-surface">Shadow Archive</h4>
                    <p className="text-on-surface-variant text-sm">Psychological horror set in a decaying digital library.</p>
                  </div>
                </div>
              </div>
              <button className="mt-10 px-8 py-3 bg-tertiary-container text-on-tertiary-container rounded-lg font-bold hover:scale-105 transition-all">Pre-order Details</button>
            </div>
            <div className="rounded-2xl overflow-hidden aspect-video border border-white/5">
              <img alt="Coming Soon Teaser" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuALVUxM17DE28ymYg6IZSlA0I2oWRVI0lSggn8P00w23zhaNxJyoUW5CA3GyWS0YCMHxmst47KEPtub0u5_b7BoR5hYxSp5f0aJoX4Yara7Ss8KL-MpJzkD4rVNm4XQDaYWvds1KD8dP6pfnWza0smo6zQDYyCE6D5_TQO4ygGiZMs812wN_5LXxbXrPm6cZaQiRB0ta4WxWb5mWWcxRRs6JRVcJbcLyekOq1ulqFaxuhRM3WobFA9agsfwjHILoGHp78AIW6TSAng"/>
            </div>
          </div>
        </div>
      </section>

    </main>
  );
}
