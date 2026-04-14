import React from "react";
import Link from "next/link";

export const Footer = () => {
  return (
    <footer className="bg-surface-low border-t border-outline-variant pt-20 pb-10 px-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
        {/* Brand */}
        <div className="col-span-1 md:col-span-1">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-6 h-6 rounded bg-primary" />
            <span className="font-bold text-xl tracking-tight">Curator</span>
          </div>
          <p className="text-sm text-on-surface-variant leading-relaxed">
            The premium destination for the world's most beautiful and functional digital experiences.
          </p>
        </div>

        {/* Links */}
        <div>
          <h4 className="font-semibold text-sm mb-6 uppercase tracking-widest text-on-surface">Explore</h4>
          <ul className="space-y-4">
            {["New Releases", "Top Charts", "Editors Choice", "Collections"].map((item) => (
              <li key={item}>
                <Link href="#" className="text-sm text-on-surface-variant hover:text-primary transition-colors">
                  {item}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-sm mb-6 uppercase tracking-widest text-on-surface">Platform</h4>
          <ul className="space-y-4">
            {["iOS & macOS", "Android", "Web Player", "Dashboard"].map((item) => (
              <li key={item}>
                <Link href="#" className="text-sm text-on-surface-variant hover:text-primary transition-colors">
                  {item}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-sm mb-6 uppercase tracking-widest text-on-surface">Community</h4>
          <ul className="space-y-4">
            {["For Developers", "Blog", "Support", "Careers"].map((item) => (
              <li key={item}>
                <Link href="#" className="text-sm text-on-surface-variant hover:text-primary transition-colors">
                  {item}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-20 pt-10 border-t border-outline-variant flex flex-col md:flex-row justify-between items-center gap-6">
        <p className="text-xs text-on-surface-variant">
          © 2026 Curator App Store. Built with Fluid Design System.
        </p>
        <div className="flex gap-8">
          <Link href="#" className="text-xs text-on-surface-variant hover:text-primary transition-colors">Privacy Policy</Link>
          <Link href="#" className="text-xs text-on-surface-variant hover:text-primary transition-colors">Terms of Service</Link>
          <Link href="#" className="text-xs text-on-surface-variant hover:text-primary transition-colors">Cookie Settings</Link>
        </div>
      </div>
    </footer>
  );
};
