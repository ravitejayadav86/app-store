"use client";
import api from "@/lib/api";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GlassCard } from "@/components/ui/GlassCard";
import {
  Download, Shield, Monitor, Settings, Wifi, HardDrive,
  Moon, Sun, Globe, Trash2, ChevronRight, Lock, Eye,
  Bell, Smartphone, Code, LogOut, Check, UserPlus, Sparkles,
  ArrowRight, GitFork, Briefcase, ShieldCheck, Mail, CreditCard,
  User, Home, Info, HelpCircle, MessageCircle, BookOpen
} from "lucide-react";
import { toast } from "sonner";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { useTheme } from "@/components/ThemeProvider";

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
      className={`relative inline-flex w-11 h-6 rounded-full transition-colors ${checked ? "bg-primary" : "bg-outline-variant"}`}
    >
      <span className={`inline-block w-5 h-5 bg-white rounded-full shadow transition-transform mt-0.5 ${checked ? "translate-x-5" : "translate-x-0.5"}`} />
    </button>
  );
}

function SettingRow({ icon, label, description, right, id }: { icon: React.ReactNode; label: string; description?: string; right: (label: string) => React.ReactNode; id?: string }) {
  return (
    <div id={id} className="flex items-center gap-4 py-4 border-b border-outline-variant/20 last:border-0">
      <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 text-primary">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-on-surface">{label}</p>
        {description && <p className="text-xs text-on-surface-variant mt-0.5">{description}</p>}
      </div>
      <div className="flex-shrink-0">{right(label)}</div>
    </div>
  );
}

function SelectRow({ icon, label, description, options, value, onChange, id }: {
  icon: React.ReactNode; label: string; description?: string;
  options: string[]; value: string; onChange: (v: string) => void;
  id: string;
}) {
  return (
    <div className="flex items-center gap-4 py-4 border-b border-outline-variant/20 last:border-0">
      <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 text-primary">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <label htmlFor={id} className="text-sm font-semibold text-on-surface block cursor-pointer">{label}</label>
        {description && <p className="text-xs text-on-surface-variant mt-0.5">{description}</p>}
      </div>
      <select
        id={id}
        value={value}
        onChange={e => onChange(e.target.value)}
        className="text-xs font-bold bg-surface-low border border-outline-variant rounded-xl px-3 py-2 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20"
      >
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}

export default function SettingsPage() {
  const router = useRouter();
  const { theme: currentTheme, setTheme } = useTheme();
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
    videoAutoplay: "Wi-Fi only",
    language: "English",
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      fetchProfile();
    }
    
    const handleSync = () => fetchProfile();
    window.addEventListener("auth-synced", handleSync);
    return () => window.removeEventListener("auth-synced", handleSync);
  }, [session]);

  const fetchProfile = async () => {
    try {
      const res = await api.get("/users/me");
      const data = res.data as Profile;
      setProfile(data);
      // Sync settings state with profile data
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
  };

  const update = async (key: string, value: any) => {
    // Optimistic update for UI state
    setSettings(prev => ({ ...prev, [key]: value }));
    
    // Mapping frontend keys to backend keys
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
      toast.success("Setting saved!");
    } catch (err) {
      console.error("Save failed:", err);
      toast.error("Failed to save setting.");
    }
  };
  const handleClearCache = () => {
    toast.success("Cache cleared successfully!");
  };

  const handleDevTap = () => {
    const taps = devTaps + 1;
    setDevTaps(taps);
    if (taps >= 7) {
      setDevMode(true);
      setDevTaps(0);
      toast.success("🎉 Developer mode enabled!");
    } else if (taps >= 4) {
      toast.info(`${7 - taps} more taps to enable Developer Mode`);
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
      toast.success(res.data.message || "Congratulations! You are now a verified publisher.");
      setShowWizard(false);
      fetchProfile();
    } catch (err: any) {
      const detail = err.response?.data?.detail || err.response?.data?.message || "Verification failed. Please try again.";
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
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
      <GlassCard className="p-0 overflow-hidden border-primary/20 bg-linear-to-br from-primary/5 to-transparent">
        <div className="bg-primary/10 px-6 py-3 border-b border-primary/10 flex items-center justify-between">
          <div className="flex items-center gap-2 text-primary">
            <Settings size={14} className="animate-spin-slow" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Management Console</span>
          </div>
          {profile?.is_admin && <span className="bg-primary text-on-primary px-2 py-0.5 rounded text-[8px] font-black uppercase">Staff</span>}
        </div>
        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {profile?.is_admin && (
            <Link 
              href="/admin" 
              id="link-admin-panel" 
              className="group flex items-center justify-between px-4 py-3 rounded-xl bg-surface hover:bg-primary/10 border border-outline-variant hover:border-primary/30 transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500">
                  <Shield size={16} />
                </div>
                <span className="text-sm font-bold">Admin Panel</span>
              </div>
              <ChevronRight size={14} className="text-on-surface-variant group-hover:translate-x-1 transition-transform" />
            </Link>
          )}
          {profile?.is_publisher && (
            <Link 
              href="/publisher" 
              id="link-publisher-portal" 
              className="group flex items-center justify-between px-4 py-3 rounded-xl bg-surface hover:bg-primary/10 border border-outline-variant hover:border-primary/30 transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-500">
                  <Sparkles size={16} />
                </div>
                <span className="text-sm font-bold">Publisher Hub</span>
              </div>
              <ChevronRight size={14} className="text-on-surface-variant group-hover:translate-x-1 transition-transform" />
            </Link>
          )}
        </div>
      </GlassCard>
    </motion.div>
  );

  const sections = [
    {
      title: "Account Settings",
      icon: <User size={16} />,
      color: "from-indigo-500 to-purple-600",
      rows: (
        <>
          <SettingRow 
            id="row-username" 
            icon={<User size={15} />} 
            label="Username" 
            description={profile?.username || "Panda user"} 
            right={() => <span className="text-[10px] font-bold text-on-surface-variant bg-surface-low px-2 py-1 rounded">Read-only</span>} 
          />
          <SettingRow 
            id="row-email" 
            icon={<Mail size={15} />} 
            label="Email Address" 
            description={profile?.email || "user@example.com"} 
            right={() => <span className="text-[10px] font-bold text-on-surface-variant bg-surface-low px-2 py-1 rounded">Read-only</span>} 
          />
          <div className="py-4 border-b border-outline-variant/20">
            <div className="flex items-center gap-4 mb-3">
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 text-primary">
                <Info size={15} />
              </div>
              <div className="flex-1 min-w-0">
                <label htmlFor="field-bio" className="text-sm font-semibold text-on-surface block cursor-pointer mb-1">Biography</label>
              </div>
            </div>
            <textarea 
              id="field-bio"
              className="w-full bg-surface-low border border-outline-variant rounded-2xl p-4 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none min-h-[100px]"
              placeholder="Tell the community about yourself..."
              defaultValue={profile?.bio || ""}
              onBlur={(e) => update("bio", e.target.value)}
              aria-label="Your biography"
            />
          </div>
          <SettingRow 
            id="row-private-account" 
            icon={<Lock size={15} />} 
            label="Private Account" 
            description="Hide your library and activity from public view" 
            right={(label) => <Toggle id="setting-is-private" label={label} checked={profile?.is_private || false} onChange={v => update("is_private", v)} />} 
          />
        </>
      )
    },
    {
      title: "Security & Privacy",
      icon: <Shield size={16} />,
      color: "from-red-500 to-rose-600",
      rows: (
        <>
          <SettingRow id="row-biometric" icon={<Lock size={15} />} label="Biometric Authentication" description="Require fingerprint/FaceID for purchases" right={(label) => <Toggle id="setting-biometric" label={label} checked={settings.biometric} onChange={v => update("biometric", v)} />} />
          <SettingRow id="row-safe-browsing" icon={<Eye size={15} />} label="Safe Browsing" description="Filter unverified or experimental uploads" right={(label) => <Toggle id="setting-safe-browsing" label={label} checked={settings.safeBrowsing} onChange={v => update("safeBrowsing", v)} />} />
          <SettingRow id="row-data-sharing" icon={<Shield size={15} />} label="Data Sharing" description="Share usage analytics with developers" right={(label) => <Toggle id="setting-data-sharing" label={label} checked={settings.dataSharing} onChange={v => update("dataSharing", v)} />} />
        </>
      )
    },
    {
      title: "Display & Theme",
      icon: <Monitor size={16} />,
      color: "from-cyan-500 to-blue-600",
      rows: (
        <>
          <SelectRow 
            id="setting-theme" 
            icon={currentTheme === "dark" ? <Moon size={15} /> : <Sun size={15} />} 
            label="App Theme" 
            description="Switch between Light, Dark (AMOLED), and System modes" 
            options={["Light", "Dark", "System"]} 
            value={currentTheme.charAt(0).toUpperCase() + currentTheme.slice(1)} 
            onChange={v => setTheme(v.toLowerCase() as any)} 
          />
          {currentTheme === "dark" && (
            <div className="px-12 py-2">
              <div className="flex items-center gap-2 text-[10px] font-bold text-green-500 uppercase tracking-widest bg-green-500/5 w-fit px-2 py-1 rounded">
                <Sparkles size={10} /> AMOLED Black Active
              </div>
            </div>
          )}
        </>
      )
    },
    {
      title: "Download & Install",
      icon: <Download size={16} />,
      color: "from-blue-500 to-indigo-600",
      rows: (
        <>
          <SelectRow id="setting-auto-update" icon={<Wifi size={15} />} label="Auto-update apps" description="When to automatically update installed apps" options={["Over Wi-Fi only", "Over any network", "Don't auto-update"]} value={settings.autoUpdate} onChange={v => update("autoUpdate", v)} />
          <SelectRow id="setting-download-pref" icon={<Download size={15} />} label="App download preference" description="Network preference for downloading apps" options={["Ask every time", "Over Wi-Fi only", "Over any network"]} value={settings.downloadPref} onChange={v => update("downloadPref", v)} />
          <SettingRow id="row-auto-archive" icon={<HardDrive size={15} />} label="Auto-Archive" description="Remove unused apps while keeping data" right={(label) => <Toggle id="setting-auto-archive" label={label} checked={settings.autoArchive} onChange={v => update("autoArchive", v)} />} />
          <SettingRow id="row-background-activity" icon={<Bell size={15} />} label="Background Activity" description="Check for updates while app is closed" right={(label) => <Toggle id="setting-background-activity" label={label} checked={settings.backgroundActivity} onChange={v => update("backgroundActivity", v)} />} />
        </>
      )
    },
    {
      title: "Advanced & Storage",
      icon: <Settings size={16} />,
      color: "from-amber-500 to-orange-600",
      rows: (
        <>
          <SettingRow id="row-clear-cache" icon={<Trash2 size={15} />} label="Clear Cache" description="Remove temporary thumbnails and cached data" right={(label) => (
            <button id="btn-clear-cache" onClick={handleClearCache} aria-label={label} className="text-xs font-bold text-primary bg-primary/10 px-3 py-1.5 rounded-xl hover:bg-primary/20 transition-all">
              Clear
            </button>
          )} />
          <SettingRow
            id="row-dev-mode"
            icon={<Code size={15} />}
            label="Build Version"
            description={devMode ? "🎉 Developer Mode Active" : "Tap 7 times to enable Developer Mode"}
            right={(label) => (
              <button id="btn-dev-mode" onClick={handleDevTap} aria-label={label} className={`text-xs font-bold px-3 py-1.5 rounded-xl transition-all ${devMode ? "bg-green-500/10 text-green-500 flex items-center gap-1" : "bg-surface-low text-on-surface-variant hover:bg-surface border border-outline-variant"}`}>
                {devMode ? <><Check size={12} /> Enabled</> : "v1.0.0"}
              </button>
            )}
          />
        </>
      )
    },
    {
      title: "Help & Support",
      icon: <HelpCircle size={16} />,
      color: "from-green-500 to-emerald-600",
      rows: (
        <>
          <Link href="/support" className="flex items-center gap-4 py-4 border-b border-outline-variant/20 last:border-0 group cursor-pointer">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 text-primary">
              <MessageCircle size={15} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-on-surface">Support Center</p>
              <p className="text-xs text-on-surface-variant mt-0.5">Guides, FAQ and direct feedback</p>
            </div>
            <ChevronRight size={14} className="text-on-surface-variant group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link href="/support" className="flex items-center gap-4 py-4 border-b border-outline-variant/20 last:border-0 group cursor-pointer">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 text-primary">
              <BookOpen size={15} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-on-surface">Panda Guide</p>
              <p className="text-xs text-on-surface-variant mt-0.5">Learn how to use Panda Store</p>
            </div>
            <ChevronRight size={14} className="text-on-surface-variant group-hover:translate-x-1 transition-transform" />
          </Link>
        </>
      )
    }
  ];

  return (
    <div className="max-w-2xl mx-auto px-4 pt-28 pb-20">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-3xl font-bold text-on-surface">Settings</h1>
        <p className="text-sm text-on-surface-variant mt-1">Manage your app preferences and account settings</p>
      </motion.div>

      <div className="space-y-4">
        {/* Mobile Support Link */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="sm:hidden mb-2">
          <Link href="/support" className="flex items-center justify-between p-4 bg-primary text-on-primary rounded-[2rem] shadow-lg shadow-primary/20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <HelpCircle size={20} />
              </div>
              <div>
                <p className="font-bold text-sm">Need Help?</p>
                <p className="text-[10px] opacity-80">Visit Support Center</p>
              </div>
            </div>
            <ArrowRight size={18} />
          </Link>
        </motion.div>

        {dashboardSection}

        {/* Publisher Section */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <GlassCard className="p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5 -mr-4 -mt-4 rotate-12">
              <Sparkles size={120} className="text-primary" />
            </div>
            
            <div className="flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-primary flex items-center justify-center text-on-primary shadow-lg shadow-primary/20">
                    <Briefcase size={20} />
                  </div>
                  <div>
                    <h2 className="font-bold text-on-surface">Publisher Account</h2>
                    <p className="text-xs text-on-surface-variant">Publish your own innovations</p>
                  </div>
                </div>
                {!loading && (
                  profile?.is_publisher ? (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-widest border border-primary/20">
                      <ShieldCheck size={14} /> Verified
                    </div>
                  ) : (
                    <div className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant border border-outline-variant px-3 py-1.5 rounded-full">
                      Not Verified
                    </div>
                  )
                )}
                {loading && <div className="w-20 h-6 bg-surface-low animate-pulse rounded-full" />}
              </div>

              {!loading && !profile?.is_publisher && !showWizard && (
                <div className="bg-surface-low rounded-2xl p-5 border border-outline-variant/30 flex flex-col gap-4">
                  <p className="text-sm text-on-surface leading-loose">
                    Want to share your apps, music, or books with the world? Get verified to access the <span className="text-primary font-bold">Publisher Hub</span> and reach thousands of users.
                  </p>
                  <Button id="btn-apply-verification" onClick={handleStartVerification} className="w-full sm:w-auto self-start">
                    Apply for Verification <ArrowRight size={16} className="ml-2" />
                  </Button>
                </div>
              )}

              <AnimatePresence mode="wait">
                {showWizard && (
                  <motion.div
                    key="wizard"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-6"
                  >
                    <div className="flex items-center gap-1 mb-4" role="progressbar" aria-valuenow={wizardStep} aria-valuemin={1} aria-valuemax={3}>
                      {[1, 2, 3].map((s) => (
                        <div key={s} className="flex-1 h-1.5 rounded-full bg-surface-low overflow-hidden">
                          <motion.div 
                            initial={false}
                            animate={{ width: wizardStep >= s ? "100%" : "0%" }}
                            className="h-full bg-primary"
                          />
                        </div>
                      ))}
                    </div>

                    <AnimatePresence mode="wait">
                      {wizardStep === 1 && (
                        <motion.div key="s1" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }} className="space-y-4">
                          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500 mb-2">
                             <UserPlus size={24} />
                          </div>
                          <h3 className="text-xl font-bold">Creator Profile</h3>
                          <p className="text-sm text-on-surface-variant">Verify your details to build trust with your future audience.</p>
                          <div className="space-y-3">
                             <div className="p-4 rounded-xl bg-surface-low border border-outline-variant flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                   <Mail size={16} className="text-on-surface-variant" />
                                   <span className="text-sm text-on-surface">{profile?.email}</span>
                                </div>
                                <Check size={16} className="text-green-500" />
                             </div>
                          </div>
                        </motion.div>
                      )}
                      
                      {wizardStep === 2 && (
                        <motion.div key="s2" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }} className="space-y-4">
                          <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-500 mb-2">
                             <GitFork size={24} />
                          </div>
                          <h3 className="text-xl font-bold">Portfolio Link</h3>
                          <p className="text-sm text-on-surface-variant">Connect your work or share a link to your public repositories.</p>
                          <div className="relative">
                            <input 
                              type="text" 
                              value={portfolioLink}
                              onChange={(e) => setPortfolioLink(e.target.value)}
                              placeholder="https://github.com/username"
                              className="w-full bg-surface-low rounded-xl px-4 py-3 border border-outline-variant focus:border-primary outline-none text-sm"
                            />
                            <GitFork className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant" size={16} />
                          </div>
                        </motion.div>
                      )}

                      {wizardStep === 3 && (
                        <motion.div key="s3" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }} className="space-y-4 text-center py-4">
                          <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center text-green-500 mx-auto mb-4">
                             <ShieldCheck size={40} />
                          </div>
                          <h3 className="text-2xl font-bold">Almost There!</h3>
                          <p className="text-sm text-on-surface-variant max-w-xs mx-auto">By clicking verify, you agree to our Publisher Terms and Code of Conduct.</p>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <div className="flex gap-3 pt-4">
                      {wizardStep > 1 && (
                        <button 
                          onClick={() => setWizardStep(s => s - 1)}
                          className="px-6 py-3 rounded-xl border border-outline-variant hover:bg-surface-low font-bold text-sm"
                        >
                          Back
                        </button>
                      )}
                      <Button 
                        id="btn-wizard-action"
                        onClick={wizardStep === 3 ? handleVerify : () => setWizardStep(s => s + 1)}
                        className="flex-grow py-6 text-base"
                        disabled={verifying}
                      >
                        {verifying ? "Verifying..." : wizardStep === 3 ? "Complete Verification" : "Continue"}
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {profile?.is_publisher && (
                <button 
                  id="btn-publisher-hub"
                  onClick={() => router.push("/publisher")}
                  className="w-full py-4 rounded-2xl bg-surface-low border border-outline-variant hover:border-primary/50 flex items-center justify-center gap-2 group transition-all"
                >
                  <span className="font-bold text-sm group-hover:text-primary">Go to Publisher Hub</span>
                  <ArrowRight size={16} className="text-on-surface-variant group-hover:text-primary group-hover:translate-x-1 transition-all" />
                </button>
              )}
            </div>
          </GlassCard>
        </motion.div>

        {sections.map((section, i) => (
          <motion.div key={section.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.08 }}>
            <GlassCard className="p-5">
              <div className="flex items-center gap-3 mb-2">
                <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${section.color} flex items-center justify-center text-white`}>
                  {section.icon}
                </div>
                <h2 className="font-bold text-sm text-on-surface">{section.title}</h2>
              </div>
              {section.rows}
            </GlassCard>
          </motion.div>
        ))}

        {/* Sign Out */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <button
            id="btn-logout"
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl border border-red-500/20 text-red-500 hover:bg-red-500/10 transition-all font-bold text-sm"
          >
            <LogOut size={16} /> Sign Out
          </button>
        </motion.div>
      </div>
    </div>
  );
}
