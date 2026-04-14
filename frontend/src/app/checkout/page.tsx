"use client";

import React from "react";
import { motion } from "framer-motion";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { 
  CreditCard, 
  ShieldCheck, 
  Lock, 
  CheckCircle2,
  ArrowLeft,
  Globe,
  ArrowRight
} from "lucide-react";
import Link from "next/link";

export default function CheckoutPage() {
  const item = {
    title: "Quantum Code Pro",
    publisher: "Neon Labs",
    price: "$29.99",
    category: "Development"
  };

  return (
    <div className="flex flex-col gap-12 pb-20">
      <section className="px-4 md:px-8">
        <div className="relative h-[400px] w-full max-w-7xl mx-auto rounded-3xl overflow-hidden bg-linear-to-br from-surface-low to-surface p-12 text-on-surface flex flex-col justify-end gap-2 shadow-inner">
           <Link href="/" className="absolute top-12 left-12 flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors font-bold text-xs uppercase tracking-widest z-10">
              <ArrowLeft size={16} /> Back to Collection
           </Link>
           <motion.h1 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-5xl md:text-7xl font-bold tracking-tight text-on-surface"
            >
              Review & Finalize.
            </motion.h1>
            <p className="text-lg md:text-xl text-on-surface-variant max-w-xl">Complete your curation by securing this premium addition to your authorized library.</p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 md:px-8 w-full grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-7 space-y-12">
          <section className="space-y-6">
             <div className="flex items-center gap-3">
                <CreditCard className="text-primary" size={20} />
                <h2 className="text-2xl font-bold">Secure Payment</h2>
             </div>
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-surface-lowest rounded-3xl p-8 border-2 border-primary shadow-sm relative group cursor-pointer">
                   <div className="flex justify-between items-start mb-10">
                      <div className="w-12 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-[10px] text-white font-bold tracking-tighter shadow-inner">VISA</div>
                      <CheckCircle2 size={24} className="text-primary" />
                   </div>
                   <div className="space-y-1">
                      <p className="text-xl font-bold tracking-[0.2em] text-on-surface">•••• 4242</p>
                      <p className="text-xs text-on-surface-variant uppercase font-bold tracking-widest opacity-60">Expires 12/26</p>
                   </div>
                </div>
                <div className="bg-surface-low/50 rounded-3xl p-8 border-2 border-dashed border-outline-variant flex flex-col items-center justify-center gap-4 text-on-surface-variant hover:bg-surface-low hover:border-primary/40 hover:text-primary transition-all cursor-pointer group">
                   <div className="w-10 h-10 rounded-full bg-surface center flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                      <CreditCard size={20} />
                   </div>
                   <span className="text-sm font-bold tracking-tight">Add New Source</span>
                </div>
             </div>
          </section>

          <section className="space-y-6">
             <div className="flex items-center gap-3">
                <ShieldCheck className="text-primary" size={20} />
                <h2 className="text-2xl font-bold">Billing Architecture</h2>
             </div>
             <div className="bg-surface-low/30 p-8 rounded-3xl border border-outline-variant/50 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5">
                   <Globe size={80} />
                </div>
                <p className="text-on-surface text-lg font-medium leading-relaxed max-w-md">
                  123 Digital Avenue, Phase 4<br />
                  Silicon Valley, CA 94025<br />
                  United States Premium Region
                </p>
                <button className="mt-6 text-xs font-bold uppercase tracking-widest text-primary hover:underline">Edit Address</button>
             </div>
          </section>
        </div>

        <aside className="lg:col-span-5">
          <div className="sticky top-24 p-1 rounded-[2.5rem] bg-linear-to-b from-primary/10 to-primary/5">
            <GlassCard className="p-10 space-y-10 bg-white/50 shadow-2xl relative overflow-hidden">
              <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-bold">The Summary</h3>
                  <div className="w-10 h-10 rounded-full bg-primary/5 flex items-center justify-center text-primary">
                     <Lock size={18} />
                  </div>
              </div>

              <div className="flex gap-6 items-center">
                  <div className="w-24 h-24 rounded-3xl bg-primary text-on-primary flex items-center justify-center text-5xl font-bold shadow-2xl shadow-primary/30 transform -rotate-3">
                     {item.title[0]}
                  </div>
                  <div>
                     <h4 className="text-2xl font-bold text-on-surface">{item.title}</h4>
                     <p className="text-on-surface-variant font-medium opacity-80">{item.publisher}</p>
                     <div className="mt-2 flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-widest bg-primary/10 text-primary px-3 py-1 rounded-full">Editorial Choice</span>
                     </div>
                  </div>
              </div>

              <div className="space-y-6 pt-10 border-t border-outline-variant/30">
                  <div className="flex justify-between text-on-surface-variant font-bold text-sm uppercase tracking-widest">
                     <span>Base License</span>
                     <span className="text-on-surface">{item.price}</span>
                  </div>
                  <div className="flex justify-between text-on-surface-variant font-bold text-sm uppercase tracking-widest">
                     <span>Platform Tax</span>
                     <span className="text-on-surface">$0.00</span>
                  </div>
                  <div className="flex justify-between items-end pt-6 border-t border-outline-variant/30">
                     <div className="space-y-1">
                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-on-surface-variant">Grant Total</p>
                        <span className="text-4xl font-bold text-primary tracking-tighter">{item.price}</span>
                     </div>
                     <span className="text-[10px] font-bold text-on-surface-variant opacity-50 mb-1">USD (VAT Incl.)</span>
                  </div>
              </div>

              <div className="space-y-4 pt-4">
                 <Button size="lg" className="w-full py-8 text-xl font-bold shadow-2xl shadow-primary/20 rounded-2xl group transition-all active:scale-95">
                    Authorize Transaction <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                 </Button>
                 <div className="flex items-center justify-center gap-2 text-[10px] text-on-surface-variant/60 font-bold uppercase tracking-widest">
                    <ShieldCheck size={14} /> 256-Bit SSL Authorized Connection
                 </div>
              </div>
            </GlassCard>
          </div>
        </aside>
      </div>
    </div>
  );
}
