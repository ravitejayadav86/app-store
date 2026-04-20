"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { GlassCard } from "@/components/ui/GlassCard";
import {
  Download, Shield, Monitor, Settings, Wifi, HardDrive,
  Moon, Sun, Globe, Trash2, ChevronRight, Lock, Eye,
  Bell, Smartphone, Code, LogOut, Check
} from "lucide-react";
import { toast } from "sonner";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`relative inline-flex w-11 h-6 rounded-full transition-colors ${checked ? "bg-primary" : "bg-outline-variant"}`}
    >
      <span className={`inline-block w-5 h-5 bg-white rounded-full shadow transition-transform mt-0.5 ${checked ? "translate-x-5" : "translate-x-0.5"}`} />
    </button>
  );
}

function SettingRow({ icon, label, description, right }: { icon: React.ReactNode; label: string; description?: string; right: React.ReactNode }) {
  return (
    <div className="flex items-center gap-4 py-4 border-b border-outline-variant/20 last:border-0">
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

function SelectRow({ icon, label, description, options, value, onChange }: {
  icon: React.ReactNode; label: string; description?: string;
  options: string[]; value: string; onChange: (v: string) => void;
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
  const [devTaps, setDevTaps] = useState(0);
  const [devMode, setDevMode] = useState(false);

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

  const update = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    toast.success("Setting saved!");
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
          <SelectRow icon={<Wifi size={15} />} label="Auto-update apps" description="When to automatically update installed apps" options={["Over Wi-Fi only", "Over any network", "Don't auto-update"]} value={settings.autoUpdate} onChange={v => update("autoUpdate", v)} />
          <SelectRow icon={<Download size={15} />} label="App download preference" description="Network preference for downloading apps" options={["Ask every time", "Over Wi-Fi only", "Over any network"]} value={settings.downloadPref} onChange={v => update("downloadPref", v)} />
          <SettingRow icon={<HardDrive size={15} />} label="Auto-Archive" description="Remove unused apps while keeping data" right={<Toggle checked={settings.autoArchive} onChange={v => update("autoArchive", v)} />} />
          <SettingRow icon={<Bell size={15} />} label="Background Activity" description="Check for updates while app is closed" right={<Toggle checked={settings.backgroundActivity} onChange={v => update("backgroundActivity", v)} />} />
        </>
      )
    },
    {
      title: "Security & Privacy",
      icon: <Shield size={16} />,
      color: "from-red-500 to-rose-600",
      rows: (
        <>
          <SettingRow icon={<Lock size={15} />} label="Biometric Authentication" description="Require fingerprint/FaceID for purchases" right={<Toggle checked={settings.biometric} onChange={v => update("biometric", v)} />} />
          <SettingRow icon={<Smartphone size={15} />} label="App Permissions Manager" description="Manage what apps can access on your device" right={
            <button className="flex items-center gap-1 text-xs font-bold text-primary" onClick={() => toast.info("Opens system settings")}>
              Open <ChevronRight size={14} />
            </button>
          } />
          <SettingRow icon={<Eye size={15} />} label="Safe Browsing" description="Filter unverified or experimental uploads" right={<Toggle checked={settings.safeBrowsing} onChange={v => update("safeBrowsing", v)} />} />
          <SettingRow icon={<Shield size={15} />} label="Data Sharing" description="Share usage analytics with developers" right={<Toggle checked={settings.dataSharing} onChange={v => update("dataSharing", v)} />} />
        </>
      )
    },
    {
      title: "Display & Experience",
      icon: <Monitor size={16} />,
      color: "from-purple-500 to-violet-600",
      rows: (
        <>
          <SelectRow icon={<Moon size={15} />} label="Theme" description="Choose your preferred appearance" options={["System Default", "Light", "Dark", "Amoled Black"]} value={settings.theme} onChange={v => update("theme", v)} />
          <SelectRow icon={<Sun size={15} />} label="Video Autoplay" description="When to autoplay app preview videos" options={["Always", "Wi-Fi only", "Off"]} value={settings.videoAutoplay} onChange={v => update("videoAutoplay", v)} />
          <SelectRow icon={<Globe size={15} />} label="Language & Region" description="Change storefront language and currency" options={["English", "Hindi", "Tamil", "Telugu", "Kannada"]} value={settings.language} onChange={v => update("language", v)} />
        </>
      )
    },
    {
      title: "Advanced & Storage",
      icon: <Settings size={16} />,
      color: "from-amber-500 to-orange-600",
      rows: (
        <>
          <SettingRow icon={<Trash2 size={15} />} label="Clear Cache" description="Remove temporary thumbnails and cached data" right={
            <button onClick={handleClearCache} className="text-xs font-bold text-primary bg-primary/10 px-3 py-1.5 rounded-xl hover:bg-primary/20 transition-all">
              Clear
            </button>
          } />
          <SettingRow icon={<HardDrive size={15} />} label="Installation Path" description="Choose storage location for downloads" right={
            <select className="text-xs font-bold bg-surface-low border border-outline-variant rounded-xl px-3 py-2 text-on-surface focus:outline-none">
              <option>Internal Storage</option>
              <option>SD Card</option>
            </select>
          } />
          <SettingRow
            icon={<Code size={15} />}
            label="Build Version"
            description={devMode ? "🎉 Developer Mode Active" : "Tap 7 times to enable Developer Mode"}
            right={
              <button onClick={handleDevTap} className={`text-xs font-bold px-3 py-1.5 rounded-xl transition-all ${devMode ? "bg-green-500/10 text-green-500 flex items-center gap-1" : "bg-surface-low text-on-surface-variant hover:bg-surface border border-outline-variant"}`}>
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
        {sections.map((section, i) => (
          <motion.div key={section.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
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