import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="fixed top-0 w-full bg-slate-950/60 backdrop-blur-xl border-b border-sky-300/10 shadow-[0_0_30px_rgba(125,211,252,0.05)] flex justify-between items-center px-8 h-20 z-50">
      <div className="text-2xl font-semibold tracking-tighter text-sky-300">GLACIER GAMES</div>
      <div className="hidden md:flex items-center space-x-8 font-inter tracking-tight">
        <Link href="/" className="text-sky-300 border-b-2 border-sky-300 pb-1 hover:text-sky-200 hover:bg-sky-300/5 transition-all duration-300 active:scale-95">Store</Link>
        <Link href="/library" className="text-slate-400 hover:text-sky-200 hover:bg-sky-300/5 transition-all duration-300 active:scale-95">Library</Link>
        <Link href="/community" className="text-slate-400 hover:text-sky-200 hover:bg-sky-300/5 transition-all duration-300 active:scale-95">Community</Link>
        <Link href="/support" className="text-slate-400 hover:text-sky-200 hover:bg-sky-300/5 transition-all duration-300 active:scale-95">Support</Link>
      </div>
      <div className="flex items-center space-x-6 text-sky-300">
        <div className="relative group hidden lg:block">
          <input className="bg-surface-container border-sky-300/20 rounded-full px-4 py-1.5 text-sm focus:ring-1 focus:ring-primary w-64 transition-all" placeholder="Search games..." type="text"/>
          <span className="material-symbols-outlined absolute right-3 top-1.5 text-slate-400">search</span>
        </div>
        <button className="active:scale-95 transition-transform hover:text-sky-200">
          <span className="material-symbols-outlined">shopping_cart</span>
        </button>
        <Link href="/login" className="active:scale-95 transition-transform hover:text-sky-200">
          <span className="material-symbols-outlined">person</span>
        </Link>
      </div>
    </nav>
  );
}
