"use client";

import React from "react";
import { motion } from "framer-motion";
import { GlassCard } from "@/components/ui/GlassCard";
import { 
  Search, 
  HelpCircle, 
  CreditCard, 
  ShieldCheck, 
  Download, 
  Mail, 
  MessageCircle, 
  ChevronRight 
} from "lucide-react";

export default function SupportPage() {
  const categories = [
    { title: "Billing & Payments", icon: <CreditCard className="text-blue-500" /> },
    { title: "Security & Privacy", icon: <ShieldCheck className="text-green-500" /> },
    { title: "Download & Install", icon: <Download className="text-purple-500" /> },
    { title: "Account Settings", icon: <Mail className="text-pink-500" /> },
  ];

  const faqs = [
    "How do I request a refund for a premium app?",
    "Can I use my account across multiple devices?",
    "How do I become a verified publisher?",
    "What security measures protect my data?",
  ];

  return (
    <div className="flex flex-col gap-20 pb-20">
      <section className="px-4 md:px-8">
        <div className="relative h-[500px] w-full max-w-7xl mx-auto rounded-3xl overflow-hidden bg-linear-to-br from-primary to-primary-dim p-12 text-on-primary flex flex-col justify-center items-center text-center gap-8 shadow-2xl">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }} 
            animate={{ scale: 1, opacity: 1 }} 
            transition={{ duration: 1.5, ease: "easeOut" }} 
            className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/10 rounded-full blur-[100px] -mr-40 -mt-40" 
          />
          
          <div className="relative z-10 w-full max-w-2xl">
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">How can we help?</h1>
            <div className="relative w-full">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-on-primary/50" />
              <input 
                type="text" 
                placeholder="Search for articles, guides, and more..."
                className="w-full pl-16 pr-8 py-5 rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all text-lg shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 md:px-8 w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((cat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 + i * 0.1 }}
            >
              <GlassCard className="flex flex-col items-center text-center gap-4 py-10 hover:bg-surface-low transition-all cursor-pointer group">
                <div className="w-16 h-16 rounded-2xl bg-surface-low flex items-center justify-center text-3xl shadow-inner group-hover:scale-110 transition-transform">
                  {cat.icon}
                </div>
                <h3 className="text-xl font-bold text-on-surface">{cat.title}</h3>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 md:px-8 w-full grid grid-cols-1 lg:grid-cols-3 gap-16">
        <div className="lg:col-span-2 space-y-8">
          <div className="flex items-center gap-3 mb-4">
             <HelpCircle className="text-primary" />
             <h2 className="text-3xl font-bold text-on-surface">Common Questions</h2>
          </div>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
              >
                <GlassCard className="flex justify-between items-center group cursor-pointer hover:bg-surface-low transition-all">
                  <span className="font-bold text-on-surface hover:text-primary transition-colors">{faq}</span>
                  <ChevronRight size={20} className="text-on-surface-variant group-hover:translate-x-1 transition-transform" />
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>

        <aside className="space-y-8">
          <div className="p-10 bg-surface-lowest border border-outline-variant rounded-[2.5rem] flex flex-col gap-6 relative overflow-hidden">
             <div className="absolute top-0 inset-x-0 h-1 bg-linear-to-r from-transparent via-primary/50 to-transparent" />
             <h3 className="text-2xl font-bold">Still need help?</h3>
             <p className="text-on-surface-variant leading-relaxed">
               Our support team is available 24/7 to assist with any technical or billing inquiries.
             </p>
             <div className="space-y-4">
                <button className="w-full py-4 bg-primary text-on-primary rounded-2xl font-bold flex items-center justify-center gap-3 hover:scale-[1.02] transition-transform shadow-lg shadow-primary/20">
                  <MessageCircle size={20} />
                  Start Live Chat
                </button>
                <button className="w-full py-4 border border-outline-variant text-on-surface rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-surface-low transition-colors">
                  <Mail size={20} />
                  Send an Email
                </button>
             </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
