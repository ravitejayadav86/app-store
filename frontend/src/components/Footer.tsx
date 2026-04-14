import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-slate-950 border-t border-sky-300/10 w-full py-12 px-8">
      <div className="flex flex-col md:flex-row justify-between items-center max-w-7xl mx-auto space-y-8 md:space-y-0">
        <div className="flex flex-col items-center md:items-start space-y-4">
          <div className="text-sky-300 font-bold text-xl tracking-tighter">GLACIER GAMING</div>
          <p className="text-slate-500 font-inter text-sm">© 2024 GLACIER GAMING. ALL RIGHTS RESERVED.</p>
        </div>
        <div className="flex flex-wrap justify-center gap-8 font-inter text-sm">
          <Link className="text-slate-500 hover:text-sky-300 transition-colors" href="#">Privacy Policy</Link>
          <Link className="text-slate-500 hover:text-sky-300 transition-colors" href="#">Terms of Service</Link>
          <Link className="text-slate-500 hover:text-sky-300 transition-colors" href="#">Cookies</Link>
          <Link className="text-slate-500 hover:text-sky-300 transition-colors" href="/support">Contact</Link>
          <Link className="text-slate-500 hover:text-sky-300 transition-colors" href="/publisher">Publisher Portal</Link>
        </div>
        <div className="flex space-x-6">
          <a className="text-slate-400 hover:text-sky-300 transition-all" href="#"><span className="material-symbols-outlined">public</span></a>
          <a className="text-slate-400 hover:text-sky-300 transition-all" href="#"><span className="material-symbols-outlined">forum</span></a>
          <a className="text-slate-400 hover:text-sky-300 transition-all" href="#"><span className="material-symbols-outlined">rss_feed</span></a>
        </div>
      </div>
    </footer>
  );
}
