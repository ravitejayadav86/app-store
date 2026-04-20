"use client";
import { SessionProvider, useSession } from "next-auth/react";
import { useEffect, useRef } from "react";
import api from "@/lib/api";

function TokenSync() {
  const { data: session, status } = useSession();
  const synced = useRef(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      synced.current = false;
      return;
    }
    if (status === "loading") return;
    if (synced.current) return;
    if (!session?.user?.email) return;

    const syncToken = async () => {
      const existingToken = localStorage.getItem("token");
      if (existingToken) {
        synced.current = true;
        window.dispatchEvent(new Event("tokenReady"));
        return;
      }
      try {
        const res = await api.post("/auth/oauth-login", {
          email: session.user!.email,
          name: session.user!.name,
        });
        localStorage.setItem("token", res.data.access_token);
        synced.current = true;
        window.dispatchEvent(new Event("tokenReady"));
      } catch (err) {
        console.error("Failed to sync OAuth token", err);
        // Mark as synced anyway to prevent infinite retry loops in this component
        synced.current = true;
      }
    };

    syncToken();
  }, [session?.user?.email, status]);

  return null;
}

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <TokenSync />
      {children}
    </SessionProvider>
  );
}