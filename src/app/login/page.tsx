"use client";

import React from "react";
import { motion } from "framer-motion";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { Mail, Lock, ArrowRight, Code } from "lucide-react";
import Link from "next/link";

import api from "@/lib/api";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = React.useState({
    username: "",
    password: "",
  });
  const [loading, setLoading] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // OAuth2PasswordRequestForm expects application/x-www-form-urlencoded
      const params = new URLSearchParams();
      params.append("username", formData.username);
      params.append("password", formData.password);

      const res = await api.post("/auth/login", params, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" }
      });
      
      localStorage.setItem("token", res.data.access_token);
      toast.success("Welcome back!");
      router.push("/");
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Login failed. Check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center px-4 relative overflow-hidden bg-surface">
      {/* Decorative background gradients */}
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/20 rounded-full blur-[150px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-secondary/10 rounded-full blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-full max-w-md relative z-10"
      >
        <GlassCard className="p-10 border-outline-variant shadow-2xl relative">
          <div className="absolute top-0 inset-x-0 h-1 bg-linear-to-r from-transparent via-primary to-transparent opacity-50" />
          
          <div className="flex flex-col items-center text-center gap-2 mb-10">
            <h1 className="text-4xl font-bold text-on-surface">Welcome back.</h1>
            <p className="text-on-surface-variant font-medium">Continue your PandaStore experience.</p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant ml-1">Username</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-primary transition-colors" size={18} />
                <input 
                  required
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  type="text" 
                  placeholder="alexrivera"
                  className="w-full pl-12 pr-4 py-4 rounded-2xl glass border border-outline-variant focus:outline-none focus:ring-2 focus:ring-primary/20 placeholder:text-on-surface-variant/30 transition-all font-medium"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Password</label>
                <Link href="#" className="text-[10px] font-bold uppercase tracking-widest text-primary hover:underline">Forgot?</Link>
              </div>
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
              {loading ? "Signing in..." : "Sign In"} <ArrowRight className="ml-2" />
            </Button>
          </form>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-outline-variant" />
            </div>
            <div className="relative flex justify-center text-xs uppercase font-bold tracking-widest">
              <span className="bg-surface-lowest px-4 text-on-surface-variant">Or continue with</span>
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
            Don't have an account? <Link href="/register" className="text-primary font-bold hover:underline">Join the collection</Link>
          </p>
        </GlassCard>
      </motion.div>
    </div>
  );
}
