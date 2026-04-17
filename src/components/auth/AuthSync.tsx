"use client";

import { useSession } from "next-auth/react";
import { useEffect, useRef } from "react";
import api from "@/lib/api";

export default function AuthSync() {
  const { data: session, status } = useSession();
  const synced = useRef(false); // Prevent re-running after first sync

  useEffect(() => {
    const syncAuth = async () => {
      // Already synced this session — don't reload again
      if (synced.current) return;

      if (status === "authenticated" && session?.user && !localStorage.getItem("token")) {
        try {
          const res = await api.post("/auth/oauth-login", {
            email: session.user.email,
            name: session.user.name,
          });
          if (res.data.access_token) {
            localStorage.setItem("token", res.data.access_token);
            synced.current = true;
            // Dispatch a custom event so other components can react without a page reload
            window.dispatchEvent(new Event("auth-synced"));
          }
        } catch (error) {
          console.error("Failed to sync auth with backend:", error);
        }
      }

      // Clear token if user signs out in NextAuth
      if (status === "unauthenticated" && localStorage.getItem("token")) {
        localStorage.removeItem("token");
        synced.current = false;
      }
    };

    syncAuth();
  }, [session, status]);

  return null;
}
