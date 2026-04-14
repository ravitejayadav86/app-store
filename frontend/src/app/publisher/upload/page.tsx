"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { 
  Upload, 
  Settings, 
  FileText, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft,
  CloudUpload,
  Globe,
  Tag
} from "lucide-react";
import api from "@/lib/api";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function UploadPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [appId, setAppId] = useState<number | null>(null);

  const [metadata, setMetadata] = useState({
    name: "",
    description: "",
    price: 0,
    category: "Development",
    version: "1.0.0"
  });

  const [file, setFile] = useState<File | null>(null);

  const handleMetadataSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post("/apps/submit", metadata);
      setAppId(res.data.id);
      toast.success("Metadata uploaded! Now upload the binary.");
      setStep(2);
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Submission failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !appId) return;

    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      await api.post(`/apps/${appId}/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      toast.success("Application is now live!");
      router.push("/publisher");
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "File upload failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-20">
      <div className="flex items-center gap-4 mb-12">
        <button 
          onClick={() => step === 2 ? setStep(1) : router.back()}
          className="p-3 rounded-2xl glass hover:bg-surface-low transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Submit New App</h1>
          <p className="text-on-surface-variant font-medium">Step {step} of 2: {step === 1 ? "Product Information" : "Application Binary"}</p>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {step === 1 ? (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
          >
            <GlassCard className="p-10 space-y-8">
               <form onSubmit={handleMetadataSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                       <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant ml-1">App Name</label>
                       <div className="relative group">
                          <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-primary transition-colors" size={18} />
                          <input 
                            required
                            value={metadata.name}
                            onChange={(e) => setMetadata({...metadata, name: e.target.value})}
                            type="text" 
                            placeholder="Quantum Code Pro"
                            className="w-full pl-12 pr-4 py-4 rounded-2xl glass border border-outline-variant focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                          />
                       </div>
                    </div>
                    <div className="space-y-2">
                       <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant ml-1">Category</label>
                       <div className="relative group">
                          <Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-primary transition-colors" size={18} />
                          <select 
                            value={metadata.category}
                            onChange={(e) => setMetadata({...metadata, category: e.target.value})}
                            className="w-full pl-12 pr-4 py-4 rounded-2xl glass border border-outline-variant focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium appearance-none"
                          >
                             <option>Development</option>
                             <option>Productivity</option>
                             <option>Design</option>
                             <option>Utility</option>
                             <option>Gaming</option>
                          </select>
                       </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant ml-1">Description</label>
                    <textarea 
                      required
                      value={metadata.description}
                      onChange={(e) => setMetadata({...metadata, description: e.target.value})}
                      placeholder="Tell the world about your creation..."
                      rows={4}
                      className="w-full px-6 py-4 rounded-2xl glass border border-outline-variant focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                       <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant ml-1">Price ($)</label>
                       <input 
                         required
                         type="number"
                         step="0.01"
                         value={metadata.price}
                         onChange={(e) => setMetadata({...metadata, price: parseFloat(e.target.value)})}
                         className="w-full px-6 py-4 rounded-2xl glass border border-outline-variant focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant ml-1">Initial Version</label>
                       <input 
                         required
                         value={metadata.version}
                         onChange={(e) => setMetadata({...metadata, version: e.target.value})}
                         placeholder="1.0.0"
                         className="w-full px-6 py-4 rounded-2xl glass border border-outline-variant focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                       />
                    </div>
                  </div>

                  <Button size="lg" className="w-full py-6 text-lg" disabled={loading}>
                    {loading ? "Processing..." : "Continue to Upload"} <ArrowRight className="ml-2" />
                  </Button>
               </form>
            </GlassCard>
          </motion.div>
        ) : (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
             <GlassCard className="p-10 space-y-8 flex flex-col items-center">
                <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4">
                   <CloudUpload size={40} />
                </div>
                <div className="text-center space-y-2">
                   <h2 className="text-2xl font-bold">Upload Binary</h2>
                   <p className="text-on-surface-variant font-medium">Please select your .zip or .dmg package to finalize the submission.</p>
                </div>

                <form onSubmit={handleFileUpload} className="w-full space-y-8">
                   <div className="relative group cursor-pointer">
                      <input 
                        required
                        type="file" 
                        onChange={(e) => setFile(e.target.files?.[0] || null)}
                        className="absolute inset-0 opacity-0 cursor-pointer z-10"
                      />
                      <div className="w-full h-40 border-2 border-dashed border-outline-variant rounded-3xl flex flex-col items-center justify-center gap-3 group-hover:border-primary/50 transition-all">
                         <div className="flex items-center gap-2 font-bold text-on-surface-variant">
                            {file ? <FileText size={20} className="text-primary" /> : <Upload size={20} />}
                            {file ? file.name : "Click or drag file to upload"}
                         </div>
                         <p className="text-[10px] uppercase font-bold tracking-widest text-on-surface-variant/50">Maximum size: 500MB</p>
                      </div>
                   </div>

                   <Button size="lg" className="w-full py-6 text-lg" disabled={loading || !file}>
                     {loading ? "Uploading..." : "Publish Application"} <CheckCircle2 className="ml-2" />
                   </Button>
                </form>
             </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
