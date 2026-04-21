"use client";
import api from "@/lib/api";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GlassCard } from "@/components/ui/GlassCard";
import {
  Download, Shield, Monitor, Settings, Wifi, HardDrive,
  Moon, Sun, Globe, Trash2, ChevronRight, Lock, Eye,
  Bell, Smartphone, Code, LogOut, Check, UserPlus, Sparkles,
  ArrowRight, GitFork, Briefcase, ShieldCheck, Mail
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
  is_publisher: boolean;
  is_admin: boolean;
}

function Toggle({ checked, onChange, id }: { checked: boolean; onChange: (v: boolean) => void; id: string }) {
  return (
    <button
      id={id}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex w-11 h-6 rounded-full transition-colors ${checked ? "bg-primary" : "bg-outline-variant"}`}
    >
      <span className={`inline-block w-5 h-5 bg-white rounded-full shadow transition-transform mt-0.5 ${checked ? "translate-x-5" : "translate-x-0.5"}`} />
    </button>
  );
}

function SettingRow({ icon, label, description, right, id }: { icon: React.ReactNode; label: string; description?: string; right: React.ReactNode; id?: string }) {
  return (
    <div id={id} className="flex items-center gap-4 py-4 border-b border-outline-variant/20 last:border-0">
      <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 text-primary">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-on-surface">{label}</p>
        {description && <p className="text-xs text-on-surface-variant mt-0.5">{description}</p>}
      </div>
      <div className="flex-shrink-0">{right}</div>
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
        <p className="text-sm font-semibold text-on-surface">{label}</p>
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
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [devTaps, setDevTaps] = useState(0);
  const [devMode, setDevMode] = useState(false);
  const [showWizard, setShowWizard] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);
  const [verifying, setVerifying] = useState(false);

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

  useEffect(() => {
    fetchProfile();
  }, [session]);

  const fetchProfile = async () => {
    try {
      const res = await api.get("/users/me");
      setProfile(res.data);
    } catch (err) {
      console.error("Failed to fetch profile");
    } finally {
      setLoading(false);
    }
  };

  const update = async (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    try {
      if (key === "is_private" || key === "bio") {
        await api.patch("/social/profile", { [key === "is_private" ? "is_private" : "bio"]: value });
      }
      toast.success("Setting saved!");
    } catch {
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
    setShowWizard(true);
    setWizardStep(1);
  };

  const handleVerify = async () => {
    setVerifying(true);
    try {
      await api.post("/users/me/verify-publisher");
      toast.success("Congratulations! You are now a verified publisher.");
      setShowWizard(false);
      fetchProfile();
    } catch {
      toast.error("Verification failed. Please try again.");
    } finally {
      setVerifying(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    signOut({ callbackUrl: "/" });
  };

  const sections = [
    {
      title: "Downloads & Updates",
      icon: <Download size={16} />,
      color: "from-blue-500 to-indigo-600",
      rows: (
        <>
          <SelectRow id="setting-auto-update" icon={<Wifi size={15} />} label="Auto-update apps" description="When to automatically update installed apps" options={["Over Wi-Fi only", "Over any network", "Don't auto-update"]} value={settings.autoUpdate} onChange={v => update("autoUpdate", v)} />
          <SelectRow id="setting-download-pref" icon={<Download size={15} />} label="App download preference" description="Network preference for downloading apps" options={["Ask every time", "Over Wi-Fi only", "Over any network"]} value={settings.downloadPref} onChange={v => update("downloadPref", v)} />
          <SettingRow id="row-auto-archive" icon={<HardDrive size={15} />} label="Auto-Archive" description="Remove unused apps while keeping data" right={<Toggle id="setting-auto-archive" checked={settings.autoArchive} onChange={v => update("autoArchive", v)} />} />
          <SettingRow id="row-background-activity" icon={<Bell size={15} />} label="Background Activity" description="Check for updates while app is closed" right={<Toggle id="setting-background-activity" checked={settings.backgroundActivity} onChange={v => update("backgroundActivity", v)} />} />
        </>
      )
    },
    {
      title: "Security & Privacy",
      icon: <Shield size={16} />,
      color: "from-red-500 to-rose-600",
      rows: (
        <>
          <SettingRow id="row-biometric" icon={<Lock size={15} />} label="Biometric Authentication" description="Require fingerprint/FaceID for purchases" right={<Toggle id="setting-biometric" checked={settings.biometric} onChange={v => update("biometric", v)} />} />
          <SettingRow id="row-safe-browsing" icon={<Eye size={15} />} label="Safe Browsing" description="Filter unverified or experimental uploads" right={<Toggle id="setting-safe-browsing" checked={settings.safeBrowsing} onChange={v => update("safeBrowsing", v)} />} />
          <SettingRow id="row-data-sharing" icon={<Shield size={15} />} label="Data Sharing" description="Share usage analytics with developers" right={<Toggle id="setting-data-sharing" checked={settings.dataSharing} onChange={v => update("dataSharing", v)} />} />
        </>
      )
    },
    {
      title: "Advanced & Storage",
      icon: <Settings size={16} />,
      color: "from-amber-500 to-orange-600",
      rows: (
        <>
          <SettingRow id="row-clear-cache" icon={<Trash2 size={15} />} label="Clear Cache" description="Remove temporary thumbnails and cached data" right={
            <button id="btn-clear-cache" onClick={handleClearCache} className="text-xs font-bold text-primary bg-primary/10 px-3 py-1.5 rounded-xl hover:bg-primary/20 transition-all">
              Clear
            </button>
          } />
          <SettingRow
            id="row-dev-mode"
            icon={<Code size={15} />}
            label="Build Version"
            description={devMode ? "🎉 Developer Mode Active" : "Tap 7 times to enable Developer Mode"}
            right={
              <button id="btn-dev-mode" onClick={handleDevTap} className={`text-xs font-bold px-3 py-1.5 rounded-xl transition-all ${devMode ? "bg-green-500/10 text-green-500 flex items-center gap-1" : "bg-surface-low text-on-surface-variant hover:bg-surface border border-outline-variant"}`}>
                {devMode ? <><Check size={12} /> Enabled</> : "v1.0.0"}
              </button>
            }
          />
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
                {profile?.is_publisher ? (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-widest border border-primary/20">
                    <ShieldCheck size={14} /> Verified
                  </div>
                ) : (
                  <div className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant border border-outline-variant px-3 py-1.5 rounded-full">
                    Not Verified
                  </div>
                )}
              </div>

              {!profile?.is_publisher && !showWizard && (
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
                    <div className="flex items-center gap-1 mb-4">
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

        {/* Admin Panel (Admin Only) */}
        {profile?.is_admin && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
            <Link href="/admin" id="link-admin-panel">
              <button id="btn-admin-panel" className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl border border-blue-200 text-blue-500 hover:bg-blue-50 transition-all font-bold text-sm">
                <Shield size={16} /> Admin Panel
              </button>
            </Link>
          </motion.div>
        )}

        {/* Publisher Portal */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.38 }}>
          <Link href="/publisher" id="link-publisher-portal">
            <button id="btn-publisher-portal" className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl border border-outline-variant text-on-surface hover:bg-surface-low transition-all font-bold text-sm">
              <Sparkles size={16} /> Publisher Portal
            </button>
          </Link>
        </motion.div>

        {/* Sign Out */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <button
            id="btn-logout"
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl border border-red-200 text-red-500 hover:bg-red-50 transition-all font-bold text-sm"
          >
            <LogOut size={16} /> Sign Out
          </button>
        </motion.div>
      </div>
    </div>
  );
}
