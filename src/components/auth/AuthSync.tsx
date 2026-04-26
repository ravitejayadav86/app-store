"use client";

/**
 * AuthSync is intentionally a no-op.
 * Token synchronisation is handled centrally by the TokenSync component
 * inside Providers.tsx to prevent duplicate /auth/oauth-login calls.
 */
export default function AuthSync() {
  return null;
}
