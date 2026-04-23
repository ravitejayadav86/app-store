"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GlassCard } from "@/components/ui/GlassCard";
import { 
  Search, 
  HelpCircle, 
  CreditCard, 
  ShieldCheck, 
  Download, 
  Mail, 
  MessageCircle, 
  ChevronRight,
  BookOpen,
  Send,
  Sparkles,
  CheckCircle2,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import api from "@/lib/api";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";

export default function SupportPage() {
  const [feedback, setFeedback] = useState("");
  const [sending, setSending] = useState(false);
  const [openGuide, setOpenGuide] = useState<number | null>(null);

  const categories = [
    { title: "Billing & Payments", icon: <CreditCard className="text-blue-500" /> },
    { title: "Security & Privacy", icon: <ShieldCheck className="text-green-500" /> },
    { title: "Download & Install", icon: <Download className="text-purple-500" /> },
    { title: "Account Settings", icon: <Mail className="text-pink-500" /> },
  ];

  const guideSteps = [
    {
      title: "Getting Started with Panda",
      content: "Welcome to PandaStore! To start, simply search for your favorite apps or browse by categories. Click 'Install' on any app to add it to your library instantly."
    },
    {
      title: "Managing Your Library",
      content: "All your installed apps are available in the 'Library' section. You can check for updates, manage downloads, and even see your purchase history there."
    },
    {
      title: "Becoming a Publisher",
      content: "Want to share your own apps? Head to the 'Publisher' section in your profile settings. Complete the verification steps to start uploading your software, music, or books."
    },
    {
      title: "Connecting with the Community",
      content: "Use the 'Community' tab to share posts, like others' content, and follow your favorite developers. It's the best way to stay updated on new releases."
    }
  ];

  const handleFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedback.trim()) return;
    setSending(true);
    try {
      await api.post("/social/support/feedback", { content: feedback });
      toast.success("Feedback sent! Our admin team has been notified.");
      setFeedback("");
    } catch {
      toast.error("Please sign in to send feedback.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex flex-col gap-20 pb-20 bg-white">
      {/* Hero Section */}
      <section className="px-4 md:px-8">
        <div className="relative h-[400px] md:h-[500px] w-full max-w-7xl mx-auto rounded-3xl overflow-hidden bg-linear-to-br from-primary to-primary-dim p-6 md:p-12 text-on-primary flex flex-col justify-center items-center text-center gap-8 shadow-2xl mt-4">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }} 
            animate={{ scale: 1, opacity: 1 }} 
            transition={{ duration: 1.5, ease: "easeOut" }} 
            className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/10 rounded-full blur-[100px] -mr-40 -mt-40" 
          />
          
          <div className="relative z-10 w-full max-w-2xl">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="flex items-center gap-2 mb-4 bg-white/10 w-fit mx-auto px-4 py-1.5 rounded-full text-xs font-bold backdrop-blur-md border border-white/20"
            >
              <Sparkles size={14} />
              <span>Always here for you</span>
            </motion.div>
            <h1 className="text-4xl md:text-7xl font-bold tracking-tight mb-6">Panda Support.</h1>
            <div className="relative w-full">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-on-primary/50" />
              <input 
                type="text" 
                placeholder="Search for articles, guides..."
                className="w-full pl-16 pr-8 py-4 md:py-5 rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all text-base md:text-lg shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Grid */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 w-full grid grid-cols-1 lg:grid-cols-3 gap-16">
        
        {/* Left Column: FAQ & Guide */}
        <div className="lg:col-span-2 space-y-16">
          
          {/* Guide Section */}
          <section className="space-y-8">
            <div className="flex items-center gap-3">
               <BookOpen className="text-primary" size={28} />
               <h2 className="text-3xl font-bold text-gray-900">Panda Guide</h2>
            </div>
            <div className="grid gap-4">
              {guideSteps.map((step, i) => (
                <GlassCard key={i} className="p-0 overflow-hidden border-gray-100">
                  <button 
                    onClick={() => setOpenGuide(openGuide === i ? null : i)}
                    className="w-full flex items-center justify-between p-6 hover:bg-gray-50 transition-colors text-left"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                        {i + 1}
                      </div>
                      <span className="font-bold text-gray-900">{step.title}</span>
                    </div>
                    {openGuide === i ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </button>
                  <AnimatePresence>
                    {openGuide === i && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="px-6 pb-6"
                      >
                        <p className="text-sm text-gray-600 leading-relaxed pl-12 border-l-2 border-primary/20">
                          {step.content}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </GlassCard>
              ))}
            </div>
          </section>

          {/* Categories */}
          <section className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {categories.map((cat, i) => (
              <GlassCard key={i} className="flex flex-col items-center text-center gap-4 py-8 hover:bg-gray-50 transition-all cursor-pointer group border-gray-100">
                <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                  {cat.icon}
                </div>
                <h3 className="text-sm font-bold text-gray-900">{cat.title}</h3>
              </GlassCard>
            ))}
          </section>
        </div>

        {/* Right Column: Feedback Form */}
        <aside className="space-y-8">
          <div className="sticky top-24 p-8 bg-gray-50 border border-gray-100 rounded-[2.5rem] flex flex-col gap-6 relative overflow-hidden shadow-sm">
             <div className="absolute top-0 inset-x-0 h-1 bg-linear-to-r from-transparent via-primary/50 to-transparent" />
             
             <div className="space-y-2">
                <h3 className="text-2xl font-bold text-gray-900">Direct Feedback</h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  Send your feedback directly to our admin team. They will be notified instantly.
                </p>
             </div>

             <form onSubmit={handleFeedback} className="space-y-4">
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="How can we improve Panda Store?"
                  rows={5}
                  className="w-full px-4 py-3 rounded-2xl bg-white border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm resize-none"
                />
                <Button 
                  type="submit"
                  disabled={sending || !feedback.trim()}
                  className="w-full py-4 bg-primary text-on-primary rounded-2xl font-bold flex items-center justify-center gap-3 shadow-lg shadow-primary/20 disabled:opacity-50"
                >
                  {sending ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Send size={18} />
                      Send Feedback
                    </>
                  )}
                </Button>
             </form>

             <div className="pt-6 border-t border-gray-100 flex flex-col gap-4">
                <div className="flex items-center gap-3 text-xs text-gray-500">
                  <CheckCircle2 size={14} className="text-green-500" />
                  <span>Admins notified instantly via WebSockets</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-500">
                  <CheckCircle2 size={14} className="text-green-500" />
                  <span>24/7 technical monitoring</span>
                </div>
             </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
