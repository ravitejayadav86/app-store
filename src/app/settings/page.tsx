"use client";
import api from "@/lib/api";
import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GlassCard } from "@/components/ui/GlassCard";
import {
  Download, Shield, Monitor, Settings, Wifi, HardDrive,
  Moon, Sun, Globe, Trash2, ChevronRight, Lock, Eye,
  Bell, Smartphone, Code, LogOut, Check, UserPlus, Sparkles,
  ArrowRight, GitFork, Briefcase, ShieldCheck, Mail, CreditCard,
  User, Home, Info, Smartphone as DeviceIcon, Layers, Zap
} from "lucide-react";
import { toast } from "sonner";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

interface Profile {
  id: number;
  username: string;
  email: string;
  bio: string;
  is_private: boolean;
  is_publisher: boolean;
  is_admin: boolean;
  billing_address: string;
  payment_method: string;
  biometric_enabled: boolean;
  safe_browsing: boolean;
  auto_update: string;
  download_pref: string;
}

function Toggle({ checked, onChange, id, label }: { checked: boolean; onChange: (v: boolean) => void; id: string; label: string }) {
  return (
    <button
      id={id}
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex w-11 h-6 rounded-full transition-all duration-300 ${checked ? "bg-primary shadow-[0_0_15px_rgba(var(--primary-rgb),0.3)]" : "bg-outline-variant"}`}
    >
      <span className={`inline-block w-5 h-5 bg-white rounded-full shadow-lg transform transition-all duration-300 mt-0.5 ${checked ? "translate-x-5.5" : "translate-x-0.5"}`} />
    </button>
  );
}

function SettingRow({ icon, label, description, right, id }: { icon: React.ReactNode; label: string; description?: string; right: (label: string) => React.ReactNode; id?: string }) {
  return (
    <div id={id} className="flex items-center gap-5 py-5 border-b border-outline-variant/10 last:border-0 group">
      <div className="w-10 h-10 rounded-[1.25rem] bg-surface-low border border-outline-variant/10 flex items-center justify-center flex-shrink-0 text-on-surface-variant group-hover:bg-primary/5 group-hover:text-primary transition-all duration-300">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-black text-on-surface tracking-tight">{label}</p>
        {description && <p className="text-[11px] font-medium text-on-surface-variant/60 mt-0.5 leading-relaxed">{description}</p>}
      </div>
      <div className="flex-shrink-0 ml-4">{right(label)}</div>
    </div>
  );
}

function SelectRow({ icon, label, description, options, value, onChange, id }: {
  icon: React.ReactNode; label: string; description?: string;
  options: string[]; value: string; onChange: (v: string) => void;
  id: string;
}) {
  return (
    <div className="flex items-center gap-5 py-5 border-b border-outline-variant/10 last:border-0 group">
      <div className="w-10 h-10 rounded-[1.25rem] bg-surface-low border border-outline-variant/10 flex items-center justify-center flex-shrink-0 text-on-surface-variant group-hover:bg-primary/5 group-hover:text-primary transition-all duration-300">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <label htmlFor={id} className="text-sm font-black text-on-surface tracking-tight block cursor-pointer">{label}</label>
        {description && <p className="text-[11px] font-medium text-on-surface-variant/60 mt-0.5 leading-relaxed">{description}</p>}
      </div>
      <select
        id={id}
        value={value}
        onChange={e => onChange(e.target.value)}
        className="text-[10px] font-black uppercase tracking-widest bg-white border border-outline-variant/20 rounded-xl px-4 py-2.5 text-on-surface focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/30 transition-all appearance-none cursor-pointer"
      >
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}

export default function SettingsPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [devTaps, setDevTaps] = useState(0);
  const [devMode, setDevMode] = useState(false);
  const [showWizard, setShowWizard] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);
  const [verifying, setVerifying] = useState(false);
  const [portfolioLink, setPortfolioLink] = useState("");

  const [settings, setSettings] = useState({
    autoUpdate: "Over Wi-Fi only",
    downloadPref: "Ask every time",
    autoArchive: false,
    backgroundActivity: true,
    biometric: false,
    safeBrowsing: true,
    dataSharing: false,
    theme: "System Default",
    videoAutoplay: "Wi-Fi only",
    language: "English",
  });

  const fetchProfile = useCallback(async () => {
    try {
      const res = await api.get("/users/me");
      const data = res.data as Profile;
      setProfile(data);
      setSettings(prev => ({
        ...prev,
        biometric: data.biometric_enabled,
        safeBrowsing: data.safe_browsing,
        autoUpdate: data.auto_update,
        downloadPref: data.download_pref
      }));
    } catch (err) {
      console.error("Failed to fetch profile");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      fetchProfile();
    }
    
    const handleSync = () => fetchProfile();
    window.addEventListener("auth-synced", handleSync);
    return () => window.removeEventListener("auth-synced", handleSync);
  }, [session, fetchProfile]);

  const update = async (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    
    const fieldMap: Record<string, string> = {
      biometric: "biometric_enabled",
      safeBrowsing: "safe_browsing",
      autoUpdate: "auto_update",
      downloadPref: "download_pref",
      is_private: "is_private",
      bio: "bio",
      billing_address: "billing_address",
      payment_method: "payment_method"
    };

    const backendKey = fieldMap[key] || key;
    
    try {
      await api.patch("/social/profile", { [backendKey]: value });
      setProfile(prev => prev ? { ...prev, [backendKey]: value } : null);
      toast.success("Synchronized successfully");
    } catch (err) {
      console.error("Save failed:", err);
      toast.error("Cloud synchronization failed");
    }
  };

  const handleClearCache = () => {
    toast.success("System cache purged");
  };

  const handleDevTap = () => {
    const taps = devTaps + 1;
    setDevTaps(taps);
    if (taps >= 7) {
      setDevMode(true);
      setDevTaps(0);
      toast.success("Developer mode enabled");
    } else if (taps >= 4) {
      toast.info(`${7 - taps} taps from Nexus access`);
    }
  };

  const handleStartVerification = () => {
    setPortfolioLink("");
    setShowWizard(true);
    setWizardStep(1);
  };

  const handleVerify = async () => {
    setVerifying(true);
    try {
      const res = await api.post("/users/me/verify-publisher", { 
        public_key: portfolioLink || null 
      });
      toast.success(res.data.message || "Welcome to the publisher network!");
      setShowWizard(false);
      fetchProfile();
    } catch (err: any) {
      const detail = err.response?.data?.detail || err.response?.data?.message || "Verification rejected";
      toast.error(detail);
    } finally {
      setVerifying(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    signOut({ callbackUrl: "/" });
  };

  const dashboardSection = (profile?.is_admin || profile?.is_publisher) && (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="mb-10">
      <div className="bg-white border border-outline-variant/10 rounded-[2.5rem] overflow-hidden shadow-2xl shadow-primary/5">
        <div className="bg-primary/5 px-8 py-5 border-b border-primary/10 flex items-center justify-between">
          <div className="flex items-center gap-3 text-primary">
            <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center text-on-primary">
              <Zap size={16} fill="currentColor" />
            </div>
            <span className="text-[11px] font-black uppercase tracking-widest">Nexus Console</span>
          </div>
          {profile?.is_admin && <span className="bg-black text-white px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter">System Staff</span>}
        </div>
        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {profile?.is_admin && (
            <Link href="/admin" id="link-admin-panel" className="group flex items-center justify-between px-6 py-4 rounded-[1.5rem] bg-surface-low hover:bg-white border border-outline-variant/10 hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5 transition-all duration-500">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
                  <Shield size={18} />
                </div>
                <span className="text-sm font-black tracking-tight">Admin OS</span>
              </div>
              <ChevronRight size={14} className="text-on-surface-variant opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
            </Link>
          )}
          {profile?.is_publisher && (
            <Link href="/publisher" id="link-publisher-portal" className="group flex items-center justify-between px-6 py-4 rounded-[1.5rem] bg-surface-low hover:bg-white border border-outline-variant/10 hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5 transition-all duration-500">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-500 group-hover:scale-110 transition-transform">
                  <Sparkles size={18} />
                </div>
                <span className="text-sm font-black tracking-tight">Publisher Hub</span>
              </div>
              <ChevronRight size={14} className="text-on-surface-variant opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
            </Link>
          )}
        </div>
      </div>
    </motion.div>
  );

  const sections = [
    {
      title: "Identity",
      icon: <User size={16} />,
      color: "from-blue-500 to-indigo-600",
      rows: (
        <>
          <SettingRow 
            id="row-username" 
            icon={<User size={15} />} 
            label="Username" 
            description={profile?.username || "Guest Panda"} 
            right={() => <span className="text-[10px] font-black text-on-surface-variant/40 uppercase tracking-widest bg-surface-low px-3 py-1.5 rounded-full">Immutable</span>} 
          />
          <SettingRow 
            id="row-email" 
            icon={<Mail size={15} />} 
            label="Nexus Email" 
            description={profile?.email || "sync@panda.store"} 
            right={() => <span className="text-[10px] font-black text-on-surface-variant/40 uppercase tracking-widest bg-surface-low px-3 py-1.5 rounded-full">Immutable</span>} 
          />
          <div className="py-6 border-b border-outline-variant/10">
            <div className="flex items-center gap-5 mb-4">
              <div className="w-10 h-10 rounded-[1.25rem] bg-surface-low border border-outline-variant/10 flex items-center justify-center flex-shrink-0 text-on-surface-variant">
                <Info size={15} />
              </div>
              <label htmlFor="field-bio" className="text-sm font-black text-on-surface tracking-tight block cursor-pointer">Public Biography</label>
            </div>
            <textarea 
              id="field-bio"
              className="w-full bg-surface-low border border-outline-variant/10 rounded-[2rem] p-6 text-sm font-medium focus:ring-8 focus:ring-primary/5 focus:border-primary/20 outline-none transition-all resize-none min-h-[120px] shadow-inner"
              placeholder="Who are you in this digital ecosystem?"
              defaultValue={profile?.bio || ""}
              onBlur={(e) => update("bio", e.target.value)}
            />
          </div>
          <SettingRow 
            id="row-private-account" 
            icon={<Lock size={15} />} 
            label="Stealth Mode" 
            description="Incognito profile and library presence" 
            right={(label) => <Toggle id="setting-is-private" label={label} checked={profile?.is_private || false} onChange={v => update("is_private", v)} />} 
          />
        </>
      )
    },
    {
      title: "Security Core",
      icon: <Shield size={16} />,
      color: "from-rose-500 to-red-600",
      rows: (
        <>
          <SettingRow id="row-biometric" icon={<Lock size={15} />} label="Nexus Biometrics" description="Bio-lock critical actions and transactions" right={(label) => <Toggle id="setting-biometric" label={label} checked={settings.biometric} onChange={v => update("biometric", v)} />} />
          <SettingRow id="row-safe-browsing" icon={<Eye size={15} />} label="Threat Shield" description="Filter experimental or untrusted code" right={(label) => <Toggle id="setting-safe-browsing" label={label} checked={settings.safeBrowsing} onChange={v => update("safeBrowsing", v)} />} />
        </>
      )
    },
    {
      title: "Delivery & Nodes",
      icon: <Download size={16} />,
      color: "from-emerald-500 to-teal-600",
      rows: (
        <>
          <SelectRow id="setting-auto-update" icon={<Wifi size={15} />} label="Auto-sync Updates" description="Keep your library at peak performance" options={["Over Wi-Fi only", "Over any network", "Manual Only"]} value={settings.autoUpdate} onChange={v => update("autoUpdate", v)} />
          <SelectRow id="setting-download-pref" icon={<Download size={15} />} label="Node Preference" description="Preferred network for data throughput" options={["Ask every time", "High Speed Only", "Data Saver"]} value={settings.downloadPref} onChange={v => update("downloadPref", v)} />
          <SettingRow id="row-auto-archive" icon={<HardDrive size={15} />} label="Deep Sleep Archive" description="Offload unused assets while retaining state" right={(label) => <Toggle id="setting-auto-archive" label={label} checked={settings.autoArchive} onChange={v => update("autoArchive", v)} />} />
        </>
      )
    },
    {
      title: "Engine & Cache",
      icon: <Settings size={16} />,
      color: "from-amber-500 to-orange-600",
      rows: (
        <>
          <SettingRow id="row-clear-cache" icon={<Trash2 size={15} />} label="Purge Local Cache" description="Flush temporary data and asset buffers" right={(label) => (
            <button id="btn-clear-cache" onClick={handleClearCache} aria-label={label} className="text-[10px] font-black uppercase tracking-widest text-primary bg-primary/10 px-5 py-2.5 rounded-full hover:bg-primary/20 transition-all active:scale-95">
              Purge
            </button>
          )} />
          <SettingRow
            id="row-dev-mode"
            icon={<Code size={15} />}
            label="Nexus Kernel"
            description={devMode ? "Digital Architect Mode Active" : "Nexus v1.0.8-Stable"}
            right={(label) => (
              <button id="btn-dev-mode" onClick={handleDevTap} aria-label={label} className={`text-[10px] font-black uppercase tracking-widest px-5 py-2.5 rounded-full transition-all active:scale-95 ${devMode ? "bg-green-500/10 text-green-500 flex items-center gap-2" : "bg-surface-low text-on-surface-variant/40 border border-outline-variant/10"}`}>
                {devMode ? <><Check size={12} /> Root Access</> : "Firmware"}
              </button>
            )}
          />
        </>
      )
    }
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 pt-32 pb-32 selection:bg-primary/10">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12 px-2">
        <h1 className="text-4xl font-black text-on-surface tracking-tighter leading-none mb-3">Settings</h1>
        <p className="text-[13px] font-medium text-on-surface-variant/60">Configure your digital footprint within the PandaStore ecosystem.</p>
      </motion.div>

      <div className="space-y-6">
        {dashboardSection}

        {/* Publisher Verification Card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div className="bg-black rounded-[3rem] p-10 text-white relative overflow-hidden shadow-2xl shadow-black/20">
            <div className="absolute top-0 right-0 p-12 opacity-10 rotate-12 -mr-8 -mt-8">
              <Briefcase size={250} />
            </div>
            
            <div className="relative z-10">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-10">
                <div className="flex items-center gap-5">
                  <div className="w-16 h-16 rounded-[1.75rem] bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center text-white shadow-2xl">
                    <Sparkles size={32} className="text-primary" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black tracking-tight leading-none mb-2">Creator Program</h2>
                    <div className="flex items-center gap-2">
                      {!loading && (
                        profile?.is_publisher ? (
                          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary text-on-primary text-[9px] font-black uppercase tracking-widest">
                            <ShieldCheck size={12} /> Verified Publisher
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-white/60 text-[9px] font-black uppercase tracking-widest border border-white/10">
                            Standard User
                          </div>
                        )
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {!loading && !profile?.is_publisher && !showWizard && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                  <p className="text-base text-gray-400 font-medium leading-relaxed max-w-lg">
                    Transform from a consumer to a creator. Deploy apps, drop music, or publish books to our global community.
                  </p>
                  <Button id="btn-apply-verification" onClick={handleStartVerification} className="rounded-full px-10 py-7 text-base font-black bg-white text-black hover:bg-gray-100 transition-all shadow-xl shadow-white/5 group">
                    Apply for Nexus Access <ArrowRight size={20} className="ml-3 group-hover:translate-x-2 transition-transform" />
                  </Button>
                </motion.div>
              )}

              <AnimatePresence mode="wait">
                {showWizard && (
                  <motion.div key="wizard" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="space-y-10 pt-4">
                    <div className="flex items-center gap-2" role="progressbar" aria-valuenow={wizardStep} aria-valuemin={1} aria-valuemax={3}>
                      {[1, 2, 3].map((s) => (
                        <div key={s} className="flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
                          <motion.div initial={false} animate={{ width: wizardStep >= s ? "100%" : "0%" }} className="h-full bg-primary shadow-[0_0_10px_rgba(var(--primary-rgb),0.5)]" />
                        </div>
                      ))}
                    </div>

                    <AnimatePresence mode="wait">
                      {wizardStep === 1 && (
                        <motion.div key="s1" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }} className="space-y-6">
                           <h3 className="text-3xl font-black tracking-tight">Identity Check</h3>
                           <p className="text-gray-400 font-medium">We'll use your verified Nexus account for deployment records.</p>
                           <div className="p-6 rounded-[1.5rem] bg-white/5 border border-white/10 flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                 <Mail size={18} className="text-primary" />
                                 <span className="text-base font-bold">{profile?.email}</span>
                              </div>
                              <Check size={20} className="text-primary" />
                           </div>
                        </motion.div>
                      )}
                      
                      {wizardStep === 2 && (
                        <motion.div key="s2" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }} className="space-y-6">
                           <h3 className="text-3xl font-black tracking-tight">Proof of Work</h3>
                           <p className="text-gray-400 font-medium">Link your GitHub, Behance, or personal portfolio for review.</p>
                           <div className="relative group">
                             <input 
                               type="text" 
                               value={portfolioLink}
                               onChange={(e) => setPortfolioLink(e.target.value)}
                               placeholder="https://nexus.dev/your-handle"
                               className="w-full bg-white/5 rounded-[1.5rem] px-8 py-5 border border-white/10 focus:border-primary focus:ring-8 focus:ring-primary/10 outline-none text-base font-bold transition-all"
                             />
                             <GitFork className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-primary transition-colors" size={20} />
                           </div>
                        </motion.div>
                      )}

                      {wizardStep === 3 && (
                        <motion.div key="s3" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }} className="space-y-8 text-center py-6">
                           <div className="w-24 h-24 rounded-[2rem] bg-primary/10 flex items-center justify-center text-primary mx-auto shadow-inner">
                              <ShieldCheck size={48} />
                           </div>
                           <h3 className="text-3xl font-black tracking-tight">Deployment Ready</h3>
                           <p className="text-gray-400 font-medium max-w-xs mx-auto">Your verification request will be processed by our automated nexus agents within 24 cycles.</p>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <div className="flex gap-4 pt-6">
                      {wizardStep > 1 && (
                        <button onClick={() => setWizardStep(s => s - 1)} className="px-8 py-5 rounded-full border border-white/10 hover:bg-white/5 font-black text-sm uppercase tracking-widest transition-all">
                          Back
                        </button>
                      )}
                      <Button id="btn-wizard-action" onClick={wizardStep === 3 ? handleVerify : () => setWizardStep(s => s + 1)} className="flex-grow py-8 text-lg font-black bg-white text-black hover:bg-gray-100 rounded-full" disabled={verifying}>
                        {verifying ? "Processing..." : wizardStep === 3 ? "Initialize Protocol" : "Continue"}
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>

        {sections.map((section, i) => (
          <motion.div key={section.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.1 }}>
            <div className="bg-white border border-outline-variant/10 rounded-[2.5rem] p-8 shadow-2xl shadow-black/[0.02]">
              <div className="flex items-center gap-4 mb-6">
                <div className={`w-10 h-10 rounded-2xl bg-linear-to-br ${section.color} flex items-center justify-center text-white shadow-lg`}>
                  {section.icon}
                </div>
                <h2 className="text-lg font-black text-on-surface tracking-tight leading-none">{section.title}</h2>
              </div>
              <div className="space-y-2">
                {section.rows}
              </div>
            </div>
          </motion.div>
        ))}

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
          <button
            id="btn-logout"
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-3 py-6 rounded-[2rem] bg-rose-500/5 border border-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-all duration-500 font-black text-sm uppercase tracking-[0.2em] group"
          >
            <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" /> 
            De-authenticate
          </button>
        </motion.div>
      </div>
    </div>
  );
}
