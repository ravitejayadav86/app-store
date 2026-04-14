'use client';

import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden px-4">
      {/* Background Decorative Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 blur-[120px] rounded-full"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-tertiary/10 blur-[120px] rounded-full"></div>
      
      <div className="relative z-10 w-full max-w-md">
        <div className="glass-panel-elevated rounded-ROUND_TWELVE p-12 frozen-glow border border-white/10">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-extrabold tracking-tighter text-on-surface mb-2">
              GLACIER <span className="text-primary">GAMES</span>
            </h1>
            <p className="text-on-surface-variant text-sm">Welcome back. Enter your crystals to continue.</p>
          </div>
          
          <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant ml-1" htmlFor="email">
                Email Address
              </label>
              <input 
                className="w-full bg-surface-container/50 border border-outline-variant rounded-lg px-4 py-3 text-on-surface focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all placeholder:text-outline" 
                id="email" 
                placeholder="commander@glacier.io" 
                type="email" 
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant" htmlFor="password">
                  Password
                </label>
                <Link className="text-[10px] font-bold text-primary hover:underline uppercase tracking-wider" href="#">
                  Forgot?
                </Link>
              </div>
              <input 
                className="w-full bg-surface-container/50 border border-outline-variant rounded-lg px-4 py-3 text-on-surface focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all placeholder:text-outline" 
                id="password" 
                placeholder="••••••••" 
                type="password" 
              />
            </div>
            
            <button className="w-full py-4 bg-primary text-on-primary font-bold rounded-lg hover:bg-primary-fixed-dim transition-all hover:scale-[1.02] active:scale-[0.98] shadow-[0_0_20px_rgba(125,211,252,0.2)] mt-4">
              Sign In
            </button>
          </form>
          
          <div className="mt-8 pt-8 border-t border-white/5 text-center">
            <p className="text-on-surface-variant text-sm">
              Don't have an account? 
              <Link className="text-primary font-bold ml-2 hover:underline" href="#">
                Create One
              </Link>
            </p>
          </div>
        </div>
        
        <div className="mt-8 text-center">
          <Link className="text-on-surface-variant/60 hover:text-on-surface text-xs transition-colors" href="/">
            ← Back to Store
          </Link>
        </div>
      </div>
    </div>
  );
}
