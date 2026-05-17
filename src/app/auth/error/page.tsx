"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";

const ERROR_MESSAGES: Record<string, { title: string; desc: string }> = {
  Configuration: {
    title: "Server Configuration Error",
    desc: "There is a problem with the server OAuth configuration. Please contact the admin.",
  },
  AccessDenied: {
    title: "Access Denied",
    desc: "You do not have permission to sign in. Contact the admin for access.",
  },
  Verification: {
    title: "Verification Failed",
    desc: "The sign-in link may have expired or already been used. Please try again.",
  },
  OAuthCallback: {
    title: "OAuth Callback Error",
    desc: "Failed to connect your account. This is usually caused by an incorrect redirect URL in the OAuth app settings. Please contact support.",
  },
  OAuthCreateAccount: {
    title: "Account Creation Failed",
    desc: "Could not create your account. Please try a different sign-in method.",
  },
  Default: {
    title: "Authentication Error",
    desc: "An unexpected error occurred during sign-in. Please try again.",
  },
};

function AuthErrorContent() {
  const params = useSearchParams();
  const error = params.get("error") ?? "Default";
  const info = ERROR_MESSAGES[error] ?? ERROR_MESSAGES.Default;

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface px-4">
      <div className="max-w-md w-full rounded-3xl border border-outline-variant bg-surface-container-low p-10 shadow-2xl text-center">
        <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M12 3a9 9 0 110 18A9 9 0 0112 3z" />
          </svg>
        </div>
        <h1 className="text-2xl font-black text-on-surface mb-2">{info.title}</h1>
        <p className="text-on-surface-variant text-sm mb-2">{info.desc}</p>
        {error && (
          <p className="text-xs text-on-surface-variant/40 mb-8 font-mono">Error code: {error}</p>
        )}
        <div className="flex flex-col gap-3">
          <Link
            href="/login"
            className="block w-full py-3 rounded-2xl bg-primary text-on-primary font-bold text-sm hover:opacity-90 transition-opacity"
          >
            Try Again
          </Link>
          <Link
            href="/"
            className="block w-full py-3 rounded-2xl border border-outline-variant text-on-surface-variant font-bold text-sm hover:bg-surface-low transition-colors"
          >
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function AuthError() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" /></div>}>
      <AuthErrorContent />
    </Suspense>
  );
}