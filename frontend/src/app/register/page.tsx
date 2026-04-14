"use client";

import React from "react";
import { motion } from "framer-motion";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { Mail, Lock, User, ArrowRight, Code, Sparkles } from "lucide-react";
import Link from "next/link";

import api from "@/lib/api";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = React.useState({
    fullName: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post("/auth/register", {
        email: formData.email,
        username: formData.fullName.replace(/\s+/g, '').toLowerCase(), // Mocking username from full name
        password: formData.password,
      });
      
      toast.success("Account created successfully!");
      router.push("/login");
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center px-4 relative overflow-hidden bg-surface">
      {/* Decorative background gradients */}
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-secondary/20 rounded-full blur-[150px] animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/10 rounded-full blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-full max-w-md relative z-10 py-20"
      >
        <GlassCard className="p-10 border-outline-variant shadow-2xl relative">
          <div className="absolute top-0 inset-x-0 h-1 bg-linear-to-r from-transparent via-secondary to-transparent opacity-50" />
          
          <div className="flex flex-col items-center text-center gap-2 mb-10">
            <div className="w-12 h-12 rounded-2xl bg-secondary/10 flex items-center justify-center text-secondary mb-2">
               <Sparkles size={24} />
            </div>
            <h1 className="text-4xl font-bold text-on-surface">Join the collection.</h1>
            <p className="text-on-surface-variant font-medium">Create your Curator account today.</p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant ml-1">Full Name</label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-primary transition-colors" size={18} />
                <input 
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  type="text" 
                  placeholder="Alex Rivera"
                  className="w-full pl-12 pr-4 py-4 rounded-2xl glass border border-outline-variant focus:outline-none focus:ring-2 focus:ring-primary/20 placeholder:text-on-surface-variant/30 transition-all font-medium"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant ml-1">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-primary transition-colors" size={18} />
                <input 
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  type="email" 
                  placeholder="name@company.com"
                  className="w-full pl-12 pr-4 py-4 rounded-2xl glass border border-outline-variant focus:outline-none focus:ring-2 focus:ring-primary/20 placeholder:text-on-surface-variant/30 transition-all font-medium"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant ml-1">Password</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-primary transition-colors" size={18} />
                <input 
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  type="password" 
                  placeholder="••••••••"
                  className="w-full pl-12 pr-4 py-4 rounded-2xl glass border border-outline-variant focus:outline-none focus:ring-2 focus:ring-primary/20 placeholder:text-on-surface-variant/30 transition-all font-medium"
                />
              </div>
            </div>

            <Button size="lg" className="w-full py-6 text-lg" disabled={loading}>
              {loading ? "Creating..." : "Create Account"} <ArrowRight className="ml-2" />
            </Button>
          </form>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-outline-variant" />
            </div>
            <div className="relative flex justify-center text-xs uppercase font-bold tracking-widest">
              <span className="bg-surface-lowest px-4 text-on-surface-variant">Or sign up with</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <button className="flex items-center justify-center gap-3 py-4 rounded-2xl border border-outline-variant hover:bg-surface-low transition-all font-bold text-sm">
                <Code size={20} /> Github
             </button>
             <button className="flex items-center justify-center gap-3 py-4 rounded-2xl border border-outline-variant hover:bg-surface-low transition-all font-bold text-sm">
                <div className="w-5 h-5 bg-on-surface-variant rounded-full" /> Google
             </button>
          </div>

          <p className="mt-10 text-center text-sm text-on-surface-variant font-medium">
            Already a member? <Link href="/login" className="text-primary font-bold hover:underline">Sign In</Link>
          </p>
        </GlassCard>
      </motion.div>
    </div>
  );
}
