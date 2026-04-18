"use client";
import { SessionProvider, useSession } from "next-auth/react";
import { useEffect, useRef } from "react";
import api from "@/lib/api";

function TokenSync() {
  const { data: session, status } = useSession();
  const synced = useRef(false);

  useEffect(() => {
    if (status === "loading") return;
    if (synced.current) return;

    const syncToken = async () => {
      if (session?.user?.email) {
        const existingToken = localStorage.getItem("token");
        if (!existingToken) {
          try {
            const res = await api.post("/auth/oauth-login", {
              email: session.user.email,
              name: session.user.name,
            });
            localStorage.setItem("token", res.data.access_token);
            synced.current = true;
            // Force reload to retry all API calls with new token
            window.location.reload();
          } catch (err) {
            console.error("Failed to sync OAuth token", err);
          }
        } else {
          synced.current = true;
        }
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